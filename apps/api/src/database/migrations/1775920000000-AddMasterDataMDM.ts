import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMasterDataMDM1775920000000 implements MigrationInterface {
  name = 'AddMasterDataMDM1775920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Enum types ──────────────────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TYPE "public"."product_type_enum" AS ENUM('FINISHED', 'SEMI_FINISHED', 'RAW_MATERIAL', 'CONSUMABLE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."work_center_type_enum" AS ENUM('MACHINE', 'ASSEMBLY', 'INSPECTION', 'PACKING')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."machine_status_enum" AS ENUM('ACTIVE', 'IDLE', 'MAINTENANCE', 'BREAKDOWN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."skill_level_enum" AS ENUM('BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')`,
    );

    // ── units_of_measure ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "units_of_measure" (
        "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
        "factoryId"   uuid NOT NULL,
        "code"        character varying(20) NOT NULL,
        "name"        character varying(100) NOT NULL,
        "symbol"      character varying(10) NOT NULL,
        "isBase"      boolean NOT NULL DEFAULT false,
        "isActive"    boolean NOT NULL DEFAULT true,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"   TIMESTAMP,
        CONSTRAINT "PK_units_of_measure" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_uom_factory_code" UNIQUE ("factoryId", "code")
      )
    `);

    // ── product_categories ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "product_categories" (
        "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
        "factoryId"   uuid NOT NULL,
        "code"        character varying(50) NOT NULL,
        "name"        character varying(100) NOT NULL,
        "parentId"    uuid,
        "description" character varying(500),
        "sortOrder"   integer NOT NULL DEFAULT 0,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"   TIMESTAMP,
        CONSTRAINT "PK_product_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_category_factory_code" UNIQUE ("factoryId", "code")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "product_categories"
        ADD CONSTRAINT "FK_product_category_parent"
        FOREIGN KEY ("parentId") REFERENCES "product_categories"("id") ON DELETE SET NULL
    `);

    // ── products ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id"              uuid NOT NULL DEFAULT uuid_generate_v4(),
        "factoryId"       uuid NOT NULL,
        "sku"             character varying(50) NOT NULL,
        "name"            character varying(200) NOT NULL,
        "type"            "public"."product_type_enum" NOT NULL,
        "categoryId"      uuid,
        "uomId"           uuid NOT NULL,
        "description"     character varying(1000),
        "technicalSpecs"  jsonb,
        "customFields"    jsonb,
        "isActive"        boolean NOT NULL DEFAULT true,
        "createdAt"       TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"       TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"       TIMESTAMP,
        CONSTRAINT "PK_products" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_factory_sku" UNIQUE ("factoryId", "sku")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "products"
        ADD CONSTRAINT "FK_product_category"
        FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "products"
        ADD CONSTRAINT "FK_product_uom"
        FOREIGN KEY ("uomId") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT
    `);

    // ── work_centers ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "work_centers" (
        "id"               uuid NOT NULL DEFAULT uuid_generate_v4(),
        "factoryId"        uuid NOT NULL,
        "code"             character varying(50) NOT NULL,
        "name"             character varying(200) NOT NULL,
        "type"             "public"."work_center_type_enum" NOT NULL,
        "capacityPerHour"  numeric(10,2),
        "description"      character varying(500),
        "customFields"     jsonb,
        "isActive"         boolean NOT NULL DEFAULT true,
        "createdAt"        TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"        TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"        TIMESTAMP,
        CONSTRAINT "PK_work_centers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_work_center_factory_code" UNIQUE ("factoryId", "code")
      )
    `);

    // ── machines ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "machines" (
        "id"               uuid NOT NULL DEFAULT uuid_generate_v4(),
        "factoryId"        uuid NOT NULL,
        "workCenterId"     uuid NOT NULL,
        "code"             character varying(50) NOT NULL,
        "name"             character varying(200) NOT NULL,
        "model"            character varying(100),
        "serialNumber"     character varying(100),
        "status"           "public"."machine_status_enum" NOT NULL DEFAULT 'IDLE',
        "capacityPerHour"  numeric(10,2),
        "customFields"     jsonb,
        "createdAt"        TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"        TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"        TIMESTAMP,
        CONSTRAINT "PK_machines" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_machine_factory_code" UNIQUE ("factoryId", "code")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "machines"
        ADD CONSTRAINT "FK_machine_work_center"
        FOREIGN KEY ("workCenterId") REFERENCES "work_centers"("id") ON DELETE RESTRICT
    `);

    // ── skills ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "skills" (
        "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
        "factoryId"   uuid NOT NULL,
        "code"        character varying(50) NOT NULL,
        "name"        character varying(200) NOT NULL,
        "level"       "public"."skill_level_enum" NOT NULL,
        "description" character varying(500),
        "isActive"    boolean NOT NULL DEFAULT true,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"   TIMESTAMP,
        CONSTRAINT "PK_skills" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_skill_factory_code" UNIQUE ("factoryId", "code")
      )
    `);

    // ── routings ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "routings" (
        "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
        "factoryId"   uuid NOT NULL,
        "productId"   uuid NOT NULL,
        "code"        character varying(50) NOT NULL,
        "name"        character varying(200) NOT NULL,
        "version"     character varying(20) NOT NULL DEFAULT '1.0',
        "isActive"    boolean NOT NULL DEFAULT true,
        "notes"       character varying(1000),
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"   TIMESTAMP,
        CONSTRAINT "PK_routings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_routing_factory_code_version" UNIQUE ("factoryId", "code", "version")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "routings"
        ADD CONSTRAINT "FK_routing_product"
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT
    `);

    // ── routing_operations ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "routing_operations" (
        "id"                uuid NOT NULL DEFAULT uuid_generate_v4(),
        "routingId"         uuid NOT NULL,
        "sequence"          integer NOT NULL,
        "name"              character varying(200) NOT NULL,
        "workCenterId"      uuid NOT NULL,
        "setupTimeMinutes"  integer NOT NULL DEFAULT 0,
        "cycleTimeMinutes"  numeric(10,2) NOT NULL,
        "machineIds"        uuid array NOT NULL DEFAULT '{}',
        "requiredSkills"    text array NOT NULL DEFAULT '{}',
        "workInstructions"  text,
        "isOptional"        boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_routing_operations" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_routing_operation_sequence" UNIQUE ("routingId", "sequence")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "routing_operations"
        ADD CONSTRAINT "FK_routing_operation_routing"
        FOREIGN KEY ("routingId") REFERENCES "routings"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "routing_operations"
        ADD CONSTRAINT "FK_routing_operation_work_center"
        FOREIGN KEY ("workCenterId") REFERENCES "work_centers"("id") ON DELETE RESTRICT
    `);

    // ── Alter existing: boms ────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "boms" ADD COLUMN "productId" uuid`);
    await queryRunner.query(`ALTER TABLE "boms" ADD COLUMN "isPhantom" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`
      ALTER TABLE "boms"
        ADD CONSTRAINT "FK_bom_product"
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL
    `);

    // ── Alter existing: bom_items ───────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "bom_items" ADD COLUMN "sequence" integer NOT NULL DEFAULT 1`);
    await queryRunner.query(`ALTER TABLE "bom_items" ADD COLUMN "childBomId" uuid`);
    await queryRunner.query(`ALTER TABLE "bom_items" ALTER COLUMN "materialId" DROP NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE "bom_items"
        ADD CONSTRAINT "FK_bom_item_child_bom"
        FOREIGN KEY ("childBomId") REFERENCES "boms"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "bom_items"
        ADD CONSTRAINT "CHK_bom_item_has_ref"
        CHECK ("materialId" IS NOT NULL OR "childBomId" IS NOT NULL)
    `);

    // ── bom_revisions ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "bom_revisions" (
        "id"           uuid NOT NULL DEFAULT uuid_generate_v4(),
        "bomId"        uuid NOT NULL,
        "factoryId"    uuid NOT NULL,
        "fromVersion"  character varying(20) NOT NULL,
        "toVersion"    character varying(20) NOT NULL,
        "revisedBy"    uuid NOT NULL,
        "changeNotes"  character varying(1000),
        "snapshotData" jsonb NOT NULL,
        "createdAt"    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bom_revisions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "bom_revisions"
        ADD CONSTRAINT "FK_bom_revision_bom"
        FOREIGN KEY ("bomId") REFERENCES "boms"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse BOM revisions
    await queryRunner.query(`ALTER TABLE "bom_revisions" DROP CONSTRAINT "FK_bom_revision_bom"`);
    await queryRunner.query(`DROP TABLE "bom_revisions"`);

    // Reverse bom_items changes
    await queryRunner.query(`ALTER TABLE "bom_items" DROP CONSTRAINT "CHK_bom_item_has_ref"`);
    await queryRunner.query(`ALTER TABLE "bom_items" DROP CONSTRAINT "FK_bom_item_child_bom"`);
    await queryRunner.query(`ALTER TABLE "bom_items" ALTER COLUMN "materialId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "bom_items" DROP COLUMN "childBomId"`);
    await queryRunner.query(`ALTER TABLE "bom_items" DROP COLUMN "sequence"`);

    // Reverse boms changes
    await queryRunner.query(`ALTER TABLE "boms" DROP CONSTRAINT "FK_bom_product"`);
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "isPhantom"`);
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "productId"`);

    // Reverse new tables (reverse dependency order)
    await queryRunner.query(`ALTER TABLE "routing_operations" DROP CONSTRAINT "FK_routing_operation_work_center"`);
    await queryRunner.query(`ALTER TABLE "routing_operations" DROP CONSTRAINT "FK_routing_operation_routing"`);
    await queryRunner.query(`DROP TABLE "routing_operations"`);

    await queryRunner.query(`ALTER TABLE "routings" DROP CONSTRAINT "FK_routing_product"`);
    await queryRunner.query(`DROP TABLE "routings"`);

    await queryRunner.query(`DROP TABLE "skills"`);

    await queryRunner.query(`ALTER TABLE "machines" DROP CONSTRAINT "FK_machine_work_center"`);
    await queryRunner.query(`DROP TABLE "machines"`);

    await queryRunner.query(`DROP TABLE "work_centers"`);

    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_product_uom"`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_product_category"`);
    await queryRunner.query(`DROP TABLE "products"`);

    await queryRunner.query(`ALTER TABLE "product_categories" DROP CONSTRAINT "FK_product_category_parent"`);
    await queryRunner.query(`DROP TABLE "product_categories"`);

    await queryRunner.query(`DROP TABLE "units_of_measure"`);

    await queryRunner.query(`DROP TYPE "public"."skill_level_enum"`);
    await queryRunner.query(`DROP TYPE "public"."machine_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."work_center_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."product_type_enum"`);
  }
}
