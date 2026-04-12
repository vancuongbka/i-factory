import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Job } from 'bullmq';
import { ErpSyncPayload } from '@i-factory/api-types';
import { ProductEntity } from '../../products/entities/product.entity';
import { WorkCenterEntity } from '../../work-centers/entities/work-center.entity';
import { RoutingEntity } from '../../routings/entities/routing.entity';

interface ErpSyncJobData extends ErpSyncPayload {
  factoryId: string;
  requestedAt: string;
}

/** Conflict columns per entity type — used for UPSERT mode. */
const CONFLICT_COLUMNS: Record<ErpSyncPayload['entityType'], string[]> = {
  products: ['factoryId', 'sku'],
  'work-centers': ['factoryId', 'code'],
  routings: ['factoryId', 'code', 'version'],
  boms: ['factoryId', 'code'],
};

@Processor('erp-sync')
export class ErpSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(ErpSyncProcessor.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(WorkCenterEntity)
    private readonly workCenterRepo: Repository<WorkCenterEntity>,
    @InjectRepository(RoutingEntity)
    private readonly routingRepo: Repository<RoutingEntity>,
  ) {
    super();
  }

  async process(job: Job<ErpSyncJobData>): Promise<void> {
    const { factoryId, entityType, records, syncMode, dryRun } = job.data;

    this.logger.log(
      `Processing ERP sync job ${job.id}: ${entityType} × ${records.length} records ` +
        `(mode=${syncMode}, dryRun=${dryRun}) for factory ${factoryId}`,
    );

    await job.updateProgress(10);

    if (dryRun) {
      this.logger.log(`Dry-run mode — skipping persistence for job ${job.id}`);
      await job.updateProgress(100);
      return;
    }

    // Stamp factoryId on every record before persisting
    const stamped = records.map((r) => ({ ...r, factoryId }));

    if (syncMode === 'UPSERT') {
      await this.upsert(entityType, stamped, factoryId);
    } else {
      await this.replace(entityType, stamped, factoryId);
    }

    await job.updateProgress(100);
    this.logger.log(`ERP sync job ${job.id} completed`);
  }

  // ── UPSERT ─────────────────────────────────────────────────────────────────

  private async upsert(
    entityType: ErpSyncPayload['entityType'],
    records: Record<string, unknown>[],
    factoryId: string,
  ): Promise<void> {
    const conflictCols = CONFLICT_COLUMNS[entityType];
    const repo = this.repoFor(entityType);
    if (!repo) {
      this.logger.warn(`No repository configured for entityType "${entityType}" — skipping`);
      return;
    }

    this.logger.log(`UPSERT ${records.length} ${entityType} (conflict: ${conflictCols.join(', ')})`);

    // TypeORM upsert: inserts rows, updates on conflict
    await repo.upsert(records as Parameters<typeof repo.upsert>[0], conflictCols);

    this.logger.log(`UPSERT complete for ${entityType} in factory ${factoryId}`);
  }

  // ── REPLACE ────────────────────────────────────────────────────────────────

  private async replace(
    entityType: ErpSyncPayload['entityType'],
    records: Record<string, unknown>[],
    factoryId: string,
  ): Promise<void> {
    const repo = this.repoFor(entityType);
    if (!repo) {
      this.logger.warn(`No repository configured for entityType "${entityType}" — skipping`);
      return;
    }

    this.logger.log(`REPLACE ${records.length} ${entityType} for factory ${factoryId}`);

    await this.dataSource.transaction(async (em) => {
      // Soft-delete all existing rows for this factory
      await em.softDelete(repo.target, { factoryId });

      // Bulk insert the new records
      await em.insert(repo.target, records as Parameters<typeof em.insert>[1]);
    });

    this.logger.log(`REPLACE complete for ${entityType} in factory ${factoryId}`);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private repoFor(entityType: ErpSyncPayload['entityType']): Repository<Record<string, unknown>> | null {
    switch (entityType) {
      case 'products':
        return this.productRepo as unknown as Repository<Record<string, unknown>>;
      case 'work-centers':
        return this.workCenterRepo as unknown as Repository<Record<string, unknown>>;
      case 'routings':
        return this.routingRepo as unknown as Repository<Record<string, unknown>>;
      case 'boms':
        // BOM module is separate — skip for now; log and continue
        this.logger.warn('BOM ERP sync not yet wired to BomEntity repository — skipping');
        return null;
      default:
        return null;
    }
  }
}
