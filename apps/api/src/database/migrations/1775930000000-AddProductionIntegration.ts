import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 3 — MES Integration:
 *  - production_orders.productId → products(id) ON DELETE SET NULL
 *  - work_order_steps.workCenterId → work_centers(id) ON DELETE SET NULL
 */
export class AddProductionIntegration1775930000000 implements MigrationInterface {
  name = 'AddProductionIntegration1775930000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── production_orders: link to products master ──────────────────────────
    await queryRunner.query(`
      ALTER TABLE "production_orders"
        ADD COLUMN IF NOT EXISTS "productId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "production_orders"
        ADD CONSTRAINT "FK_production_orders_product"
          FOREIGN KEY ("productId")
          REFERENCES "products"("id")
          ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_production_orders_productId"
        ON "production_orders" ("productId")
    `);

    // ── work_order_steps: link to work_centers master ──────────────────────
    await queryRunner.query(`
      ALTER TABLE "work_order_steps"
        ADD COLUMN IF NOT EXISTS "workCenterId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "work_order_steps"
        ADD CONSTRAINT "FK_work_order_steps_workCenter"
          FOREIGN KEY ("workCenterId")
          REFERENCES "work_centers"("id")
          ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_work_order_steps_workCenterId"
        ON "work_order_steps" ("workCenterId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_work_order_steps_workCenterId"`);
    await queryRunner.query(`ALTER TABLE "work_order_steps" DROP CONSTRAINT IF EXISTS "FK_work_order_steps_workCenter"`);
    await queryRunner.query(`ALTER TABLE "work_order_steps" DROP COLUMN IF EXISTS "workCenterId"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_production_orders_productId"`);
    await queryRunner.query(`ALTER TABLE "production_orders" DROP CONSTRAINT IF EXISTS "FK_production_orders_product"`);
    await queryRunner.query(`ALTER TABLE "production_orders" DROP COLUMN IF EXISTS "productId"`);
  }
}
