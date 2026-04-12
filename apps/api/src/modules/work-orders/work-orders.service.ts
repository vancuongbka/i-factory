import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkOrderDto } from '@i-factory/api-types';
import { WorkOrderEntity } from './entities/work-order.entity';
import { WorkOrderStepEntity } from './entities/work-order-step.entity';
import { ProductionOrderEntity } from '../production/entities/production-order.entity';
import { RoutingEntity } from '../master-data/routings/entities/routing.entity';

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectRepository(WorkOrderEntity)
    private readonly repo: Repository<WorkOrderEntity>,
    @InjectRepository(WorkOrderStepEntity)
    private readonly stepRepo: Repository<WorkOrderStepEntity>,
    @InjectRepository(ProductionOrderEntity)
    private readonly productionOrderRepo: Repository<ProductionOrderEntity>,
    @InjectRepository(RoutingEntity)
    private readonly routingRepo: Repository<RoutingEntity>,
  ) {}

  findAll(factoryId: string) {
    return this.repo.find({ where: { factoryId }, relations: ['steps'] });
  }

  findById(id: string, factoryId: string) {
    return this.repo.findOneOrFail({ where: { id, factoryId }, relations: ['steps'] });
  }

  /**
   * Create a work order with explicit step definitions supplied in the DTO.
   */
  async create(factoryId: string, dto: CreateWorkOrderDto): Promise<WorkOrderEntity> {
    const workOrder = this.repo.create({
      factoryId,
      productionOrderId: dto.productionOrderId,
      code: dto.code,
      description: dto.description,
      assignedTo: dto.assignedTo,
      plannedStartDate: new Date(dto.plannedStartDate),
      plannedEndDate: new Date(dto.plannedEndDate),
      customFields: dto.customFields,
    });

    const saved = await this.repo.save(workOrder);

    if (dto.steps.length > 0) {
      const steps = dto.steps.map((s) =>
        this.stepRepo.create({
          workOrderId: saved.id,
          stepNumber: s.stepNumber,
          name: s.name,
          description: s.description,
          estimatedMinutes: s.estimatedMinutes,
          requiredSkills: s.requiredSkills,
        }),
      );
      await this.stepRepo.save(steps);
    }

    return this.repo.findOneOrFail({ where: { id: saved.id }, relations: ['steps'] });
  }

  /**
   * Create a work order by auto-generating steps from the active routing for the
   * production order's product. Falls back to empty steps if no routing is found.
   */
  async createFromProductionOrder(
    productionOrderId: string,
    factoryId: string,
    dto: CreateWorkOrderDto,
  ): Promise<WorkOrderEntity> {
    // 1. Load production order to get productId
    const productionOrder = await this.productionOrderRepo.findOne({
      where: { id: productionOrderId, factoryId },
    });
    if (!productionOrder) {
      throw new NotFoundException(`Production order ${productionOrderId} not found`);
    }

    // 2. If linked to a product, find its active routing (operations eager loaded)
    let generatedSteps: Partial<WorkOrderStepEntity>[] = [];

    if (productionOrder.productId) {
      const routing = await this.routingRepo.findOne({
        where: { productId: productionOrder.productId, factoryId, isActive: true },
        relations: ['operations'],
        order: { createdAt: 'DESC' }, // most recent active routing wins
      });

      if (routing?.operations?.length) {
        const sorted = [...routing.operations].sort((a, b) => a.sequence - b.sequence);
        generatedSteps = sorted.map((op) => ({
          stepNumber: op.sequence,
          name: op.name,
          estimatedMinutes: Math.ceil(op.cycleTimeMinutes + op.setupTimeMinutes),
          requiredSkills: op.requiredSkills,
          workCenterId: op.workCenterId,
        }));
      }
    }

    // 3. DTO steps override auto-generated steps if caller provided any
    const stepsToUse = dto.steps.length > 0
      ? dto.steps.map((s) => ({
          stepNumber: s.stepNumber,
          name: s.name,
          description: s.description,
          estimatedMinutes: s.estimatedMinutes,
          requiredSkills: s.requiredSkills,
        }))
      : generatedSteps;

    if (stepsToUse.length === 0) {
      throw new UnprocessableEntityException(
        'No routing found for the product and no steps were provided. ' +
          'Please provide explicit steps or configure an active routing for the product.',
      );
    }

    // 4. Persist
    const workOrder = this.repo.create({
      factoryId,
      productionOrderId,
      code: dto.code,
      description: dto.description,
      assignedTo: dto.assignedTo,
      plannedStartDate: new Date(dto.plannedStartDate),
      plannedEndDate: new Date(dto.plannedEndDate),
      customFields: dto.customFields,
    });

    const saved = await this.repo.save(workOrder);

    const stepEntities = stepsToUse.map((s) =>
      this.stepRepo.create({ ...s, workOrderId: saved.id }),
    );
    await this.stepRepo.save(stepEntities);

    return this.repo.findOneOrFail({ where: { id: saved.id }, relations: ['steps'] });
  }
}
