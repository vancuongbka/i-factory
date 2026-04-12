import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ReportRequestDto } from '@i-factory/api-types';
import { ProductionOrderEntity } from '../../production/entities/production-order.entity';
import { WorkOrderEntity } from '../../work-orders/entities/work-order.entity';
import { MaterialEntity } from '../../inventory/entities/material.entity';
import { StockMovementEntity } from '../../inventory/entities/stock-movement.entity';
import { QCInspectionEntity } from '../../quality-control/entities/qc-inspection.entity';

const REPORTS_DIR = join(process.cwd(), 'uploads', 'reports');

@Processor('reports')
export class ProductionReportProcessor extends WorkerHost {
  private readonly logger = new Logger(ProductionReportProcessor.name);

  constructor(
    @InjectRepository(ProductionOrderEntity)
    private readonly productionRepo: Repository<ProductionOrderEntity>,
    @InjectRepository(WorkOrderEntity)
    private readonly workOrderRepo: Repository<WorkOrderEntity>,
    @InjectRepository(MaterialEntity)
    private readonly materialRepo: Repository<MaterialEntity>,
    @InjectRepository(StockMovementEntity)
    private readonly movementRepo: Repository<StockMovementEntity>,
    @InjectRepository(QCInspectionEntity)
    private readonly qcRepo: Repository<QCInspectionEntity>,
  ) {
    super();
  }

  async process(job: Job<ReportRequestDto>): Promise<{ downloadUrl: string; filePath: string }> {
    this.logger.log(`Processing report job ${job.id}: type=${job.name}`);

    const { factoryId, type, dateFrom, dateTo, format } = job.data;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    await job.updateProgress(10);

    let rows: Record<string, unknown>[];

    switch (type) {
      case 'production':
        rows = await this.generateProductionReport(factoryId, from, to);
        break;
      case 'work-orders':
        rows = await this.generateWorkOrdersReport(factoryId, from, to);
        break;
      case 'inventory':
        rows = await this.generateInventoryReport(factoryId, from, to);
        break;
      case 'qc':
        rows = await this.generateQcReport(factoryId, from, to);
        break;
      default:
        rows = [];
    }

    await job.updateProgress(80);

    mkdirSync(REPORTS_DIR, { recursive: true });

    const ext = format === 'csv' ? 'csv' : 'json';
    const filename = `${type}-${String(job.id)}.${ext}`;
    const filePath = join(REPORTS_DIR, filename);

    if (format === 'csv') {
      writeFileSync(filePath, toCsv(rows), 'utf8');
    } else {
      writeFileSync(
        filePath,
        JSON.stringify({ type, dateFrom, dateTo, count: rows.length, rows }, null, 2),
        'utf8',
      );
    }

    await job.updateProgress(100);
    this.logger.log(`Report job ${job.id} completed → ${filename}`);

    return { downloadUrl: `/reports/${String(job.id)}/download`, filePath };
  }

  // ── Production summary ───────────────────────────────────────────────────

  private async generateProductionReport(
    factoryId: string,
    from: Date,
    to: Date,
  ): Promise<Record<string, unknown>[]> {
    const orders = await this.productionRepo
      .createQueryBuilder('po')
      .where('po.factoryId = :factoryId', { factoryId })
      .andWhere('po.createdAt BETWEEN :from AND :to', { from, to })
      .orderBy('po.createdAt', 'DESC')
      .getMany();

    return orders.map((o) => {
      const qty = Number(o.quantity);
      const completed = Number(o.completedQuantity);
      return {
        code: o.code,
        productName: o.productName,
        status: o.status,
        quantity: qty,
        unit: o.unit,
        completedQuantity: completed,
        completionRate: qty > 0 ? Math.round((completed / qty) * 100) + '%' : '0%',
        plannedStart: o.plannedStartDate?.toISOString() ?? '',
        plannedEnd: o.plannedEndDate?.toISOString() ?? '',
        actualStart: o.actualStartDate?.toISOString() ?? '',
        actualEnd: o.actualEndDate?.toISOString() ?? '',
        createdAt: o.createdAt?.toISOString() ?? '',
      };
    });
  }

  // ── Work-order throughput ─────────────────────────────────────────────────

  private async generateWorkOrdersReport(
    factoryId: string,
    from: Date,
    to: Date,
  ): Promise<Record<string, unknown>[]> {
    const workOrders = await this.workOrderRepo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.productionOrder', 'po')
      .leftJoinAndSelect('wo.steps', 'steps')
      .where('wo.factoryId = :factoryId', { factoryId })
      .andWhere('wo.createdAt BETWEEN :from AND :to', { from, to })
      .orderBy('wo.createdAt', 'DESC')
      .getMany();

    return workOrders.map((wo) => {
      const totalSteps = wo.steps?.length ?? 0;
      const completedSteps = wo.steps?.filter((s) => s.isCompleted).length ?? 0;
      const durationDays =
        wo.actualStartDate && wo.actualEndDate
          ? Math.round(
              (wo.actualEndDate.getTime() - wo.actualStartDate.getTime()) / 86_400_000,
            )
          : '';
      return {
        code: wo.code,
        status: wo.status,
        productionOrder: wo.productionOrder?.code ?? '',
        productName: wo.productionOrder?.productName ?? '',
        plannedStart: wo.plannedStartDate?.toISOString() ?? '',
        plannedEnd: wo.plannedEndDate?.toISOString() ?? '',
        actualStart: wo.actualStartDate?.toISOString() ?? '',
        actualEnd: wo.actualEndDate?.toISOString() ?? '',
        durationDays,
        totalSteps,
        completedSteps,
        stepCompletionRate: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) + '%' : '0%',
        createdAt: wo.createdAt?.toISOString() ?? '',
      };
    });
  }

  // ── Inventory valuation / stock ───────────────────────────────────────────

  private async generateInventoryReport(
    factoryId: string,
    from: Date,
    to: Date,
  ): Promise<Record<string, unknown>[]> {
    const materials = await this.materialRepo
      .createQueryBuilder('m')
      .where('m.factoryId = :factoryId', { factoryId })
      .orderBy('m.name', 'ASC')
      .getMany();

    type MovementRaw = { materialId: string; inbound: string; outbound: string };
    const movements = await this.movementRepo
      .createQueryBuilder('sm')
      .select('sm.materialId', 'materialId')
      .addSelect(
        `SUM(CASE WHEN sm.type IN ('RECEIPT','RETURN') THEN sm.quantity::numeric ELSE 0 END)`,
        'inbound',
      )
      .addSelect(
        `SUM(CASE WHEN sm.type IN ('ISSUE','TRANSFER','SCRAP') THEN sm.quantity::numeric ELSE 0 END)`,
        'outbound',
      )
      .where('sm.factoryId = :factoryId', { factoryId })
      .andWhere('sm.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('sm.materialId')
      .getRawMany<MovementRaw>();

    const movMap = new Map(
      movements.map((mv) => [mv.materialId, { in: Number(mv.inbound), out: Number(mv.outbound) }]),
    );

    return materials.map((m) => {
      const mv = movMap.get(m.id) ?? { in: 0, out: 0 };
      const stock = Number(m.currentStock);
      const minLevel = Number(m.minStockLevel);
      return {
        code: m.code,
        name: m.name,
        unit: m.unit,
        currentStock: stock,
        minStockLevel: minLevel,
        maxStockLevel: m.maxStockLevel != null ? Number(m.maxStockLevel) : '',
        isLowStock: stock < minLevel ? 'Yes' : 'No',
        inboundQty: mv.in,
        outboundQty: mv.out,
        netMovement: mv.in - mv.out,
        isActive: m.isActive ? 'Yes' : 'No',
      };
    });
  }

  // ── QC defect rate ────────────────────────────────────────────────────────

  private async generateQcReport(
    factoryId: string,
    from: Date,
    to: Date,
  ): Promise<Record<string, unknown>[]> {
    const inspections = await this.qcRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.defects', 'defects')
      .where('i.factoryId = :factoryId', { factoryId })
      .andWhere('i.inspectedAt BETWEEN :from AND :to', { from, to })
      .orderBy('i.inspectedAt', 'DESC')
      .getMany();

    return inspections.map((i) => {
      const defects = i.defects ?? [];
      const totalDefectQty = defects.reduce((sum, d) => sum + d.quantity, 0);
      const passRate = i.sampleSize > 0 ? Math.round((i.passedCount / i.sampleSize) * 100) : 0;
      return {
        inspectedAt: i.inspectedAt?.toISOString() ?? '',
        result: i.result,
        sampleSize: i.sampleSize,
        passedCount: i.passedCount,
        failedCount: i.failedCount,
        passRate: passRate + '%',
        defectTypes: defects.length,
        totalDefectQty,
        productionOrderId: i.productionOrderId ?? '',
        workOrderId: i.workOrderId ?? '',
        notes: i.notes ?? '',
      };
    });
  }
}

// ── CSV helper ─────────────────────────────────────────────────────────────

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return /[,"\n\r]/.test(str) ? `"${str}"` : str;
  };
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ].join('\n');
}
