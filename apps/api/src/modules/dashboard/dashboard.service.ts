import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { MachineStatus, ProductionStatus, QCResult, WorkOrderStatus } from '@i-factory/api-types';
import type { DashboardResponse } from '@i-factory/api-types';
import { ProductionOrderEntity } from '../production/entities/production-order.entity';
import { WorkOrderEntity } from '../work-orders/entities/work-order.entity';
import { MaterialEntity } from '../inventory/entities/material.entity';
import { QCInspectionEntity } from '../quality-control/entities/qc-inspection.entity';
import { MachineEntity } from '../master-data/work-centers/entities/machine.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ProductionOrderEntity)
    private readonly productionRepo: Repository<ProductionOrderEntity>,

    @InjectRepository(WorkOrderEntity)
    private readonly workOrderRepo: Repository<WorkOrderEntity>,

    @InjectRepository(MaterialEntity)
    private readonly materialRepo: Repository<MaterialEntity>,

    @InjectRepository(QCInspectionEntity)
    private readonly qcRepo: Repository<QCInspectionEntity>,

    @InjectRepository(MachineEntity)
    private readonly machineRepo: Repository<MachineEntity>,
  ) {}

  async getDashboard(factoryId: string): Promise<DashboardResponse> {
    const [
      machines,
      activeOrders,
      recentInspections,
      lowStockMaterials,
      failedInspections,
      activeWorkOrders,
    ] = await Promise.all([
      // All machines for this factory
      this.machineRepo.find({ where: { factoryId } }),

      // IN_PROGRESS + COMPLETED production orders
      this.productionRepo.find({
        where: [
          { factoryId, status: ProductionStatus.IN_PROGRESS },
          { factoryId, status: ProductionStatus.COMPLETED },
        ],
        order: { updatedAt: 'DESC' },
        take: 200,
      }),

      // QC inspections from last 30 days
      this.qcRepo.find({
        where: {
          factoryId,
          inspectedAt: MoreThanOrEqual(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        },
      }),

      // Materials below min stock level
      this.materialRepo
        .createQueryBuilder('m')
        .where('m.factoryId = :factoryId', { factoryId })
        .andWhere('m.currentStock <= m.minStockLevel')
        .andWhere('m.isActive = true')
        .limit(20)
        .getMany(),

      // FAIL / CONDITIONAL inspections from last 7 days
      this.qcRepo
        .createQueryBuilder('q')
        .where('q.factoryId = :factoryId', { factoryId })
        .andWhere('q.result IN (:...results)', { results: [QCResult.FAIL, QCResult.CONDITIONAL] })
        .andWhere('q.inspectedAt >= :since', {
          since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        })
        .orderBy('q.inspectedAt', 'DESC')
        .limit(10)
        .getMany(),

      // IN_PROGRESS work orders with their steps
      this.workOrderRepo.find({
        where: { factoryId, status: WorkOrderStatus.IN_PROGRESS },
        relations: ['steps', 'productionOrder'],
        order: { plannedEndDate: 'ASC' },
        take: 20,
      }),
    ]);

    // ── Machine metrics ─────────────────────────────────────────────────────
    const totalMachines = machines.length;
    const activeMachines = machines.filter((m) => m.status === MachineStatus.ACTIVE).length;
    const availability = totalMachines > 0 ? activeMachines / totalMachines : 1;

    const machineStatusDistribution = Object.values(MachineStatus)
      .map((s) => ({
        status: s,
        count: machines.filter((m) => m.status === s).length,
      }))
      .filter((e) => e.count > 0);

    const downtimeMachines = machines.filter(
      (m) => m.status === MachineStatus.BREAKDOWN || m.status === MachineStatus.MAINTENANCE,
    );

    // ── Output metrics ──────────────────────────────────────────────────────
    const inProgressOrders = activeOrders.filter((o) => o.status === ProductionStatus.IN_PROGRESS);
    const outputActual = inProgressOrders.reduce((s, o) => s + Number(o.completedQuantity), 0);
    const outputPlanned = inProgressOrders.reduce((s, o) => s + Number(o.quantity), 0);
    const performance = outputPlanned > 0 ? outputActual / outputPlanned : 0;

    // ── Yield / quality ─────────────────────────────────────────────────────
    const relevantInspections = recentInspections.filter((i) => i.sampleSize > 0);
    const yieldRate =
      relevantInspections.length > 0
        ? (relevantInspections.reduce((s, i) => s + i.passedCount / i.sampleSize, 0) /
            relevantInspections.length) *
          100
        : 100;

    // ── OEE ─────────────────────────────────────────────────────────────────
    const qualityFactor = yieldRate / 100;
    const oee = Math.round(availability * performance * qualityFactor * 100);

    // ── Throughput trend (last 7 days) ──────────────────────────────────────
    const throughputTrend = this.buildThroughputTrend(activeOrders);

    // ── Active work orders ──────────────────────────────────────────────────
    const activeWorkOrderRows = activeWorkOrders.map((wo) => {
      const steps = wo.steps ?? [];
      const completedSteps = steps.filter((s) => s.isCompleted).length;
      const progress = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;
      return {
        id: wo.id,
        code: wo.code,
        productName: wo.productionOrder?.productName ?? '',
        progress,
        eta: wo.plannedEndDate.toISOString(),
        status: wo.status,
      };
    });

    return {
      oee,
      yieldRate: Math.round(yieldRate * 10) / 10,
      outputActual: Math.round(outputActual * 10) / 10,
      outputPlanned: Math.round(outputPlanned * 10) / 10,
      machines: { active: activeMachines, total: totalMachines },
      alerts: {
        lowStock: lowStockMaterials.map((m) => ({
          id: m.id,
          code: m.code,
          name: m.name,
          unit: m.unit,
          currentStock: Number(m.currentStock),
          minStockLevel: Number(m.minStockLevel),
        })),
        qcFailures: failedInspections.map((i) => ({
          id: i.id,
          result: i.result,
          inspectedAt: i.inspectedAt.toISOString(),
          sampleSize: i.sampleSize,
          failedCount: i.failedCount,
          notes: i.notes ?? null,
        })),
        machineDowntime: downtimeMachines.map((m) => ({
          id: m.id,
          code: m.code,
          name: m.name,
          status: m.status,
        })),
      },
      throughputTrend,
      machineStatusDistribution,
      activeWorkOrders: activeWorkOrderRows,
    };
  }

  private buildThroughputTrend(
    orders: ProductionOrderEntity[],
  ): { date: string; completed: number; planned: number }[] {
    const days = 7;
    const result: { date: string; completed: number; planned: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dateStr = day.toISOString().slice(0, 10);
      const dayStart = new Date(dateStr);
      const dayEnd = new Date(dateStr);
      dayEnd.setDate(dayEnd.getDate() + 1);

      // Completed qty from orders that finished on this day
      const completed = orders
        .filter(
          (o) =>
            o.status === ProductionStatus.COMPLETED &&
            o.actualEndDate &&
            o.actualEndDate >= dayStart &&
            o.actualEndDate < dayEnd,
        )
        .reduce((s, o) => s + Number(o.completedQuantity), 0);

      // Planned qty from orders whose planned end date is this day
      const planned = orders
        .filter(
          (o) =>
            o.plannedEndDate >= dayStart &&
            o.plannedEndDate < dayEnd,
        )
        .reduce((s, o) => s + Number(o.quantity), 0);

      result.push({ date: dateStr, completed: Math.round(completed), planned: Math.round(planned) });
    }

    return result;
  }
}
