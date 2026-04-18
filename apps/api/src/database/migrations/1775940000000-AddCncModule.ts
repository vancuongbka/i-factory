import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase CNC-1 — CNC Daily Planning & Real-time Monitoring:
 *  - Enum types: cnc_machine_status_enum, daily_schedule_status_enum, schedule_entry_status_enum
 *  - Tables: cnc_machines, daily_schedules, schedule_entries, production_logs, machine_downtime
 *  - Deferred FK: cnc_machines.currentScheduleEntryId → schedule_entries(id)
 */
export class AddCncModule1775940000000 implements MigrationInterface {
  name = 'AddCncModule1775940000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Enum types ──────────────────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TYPE "public"."cnc_machine_status_enum" AS ENUM('RUNNING', 'IDLE', 'SETUP', 'ERROR', 'MAINTENANCE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."daily_schedule_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."schedule_entry_status_enum" AS ENUM('PENDING', 'SETUP', 'RUNNING', 'PAUSED', 'COMPLETED', 'ERROR')`,
    );

    // ── cnc_machines ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "cnc_machines" (
        "id"                       uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "factoryId"                uuid        NOT NULL,
        "machineId"                uuid,
        "code"                     varchar(50) NOT NULL,
        "name"                     varchar(200) NOT NULL,
        "model"                    varchar(100),
        "maxSpindleRpm"            integer,
        "numberOfAxes"             integer,
        "currentStatus"            "public"."cnc_machine_status_enum" NOT NULL DEFAULT 'IDLE',
        "currentScheduleEntryId"   uuid,
        "lastStatusChangedAt"      timestamptz,
        "customFields"             jsonb,
        "createdAt"                timestamptz NOT NULL DEFAULT now(),
        "updatedAt"                timestamptz NOT NULL DEFAULT now(),
        "deletedAt"                timestamptz,
        CONSTRAINT "PK_cnc_machines" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_cnc_machine_factory_code" UNIQUE ("factoryId", "code")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cnc_machines_factoryId"
        ON "cnc_machines" ("factoryId")
    `);

    await queryRunner.query(`
      ALTER TABLE "cnc_machines"
        ADD CONSTRAINT "FK_cnc_machines_factory"
          FOREIGN KEY ("factoryId") REFERENCES "factories"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "cnc_machines"
        ADD CONSTRAINT "FK_cnc_machines_mdm_machine"
          FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE SET NULL
    `);

    // ── daily_schedules ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "daily_schedules" (
        "id"           uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "factoryId"    uuid         NOT NULL,
        "scheduleDate" date         NOT NULL,
        "status"       "public"."daily_schedule_status_enum" NOT NULL DEFAULT 'DRAFT',
        "shiftCount"   smallint     NOT NULL DEFAULT 1,
        "shift1Start"  time,
        "shift2Start"  time,
        "shift3Start"  time,
        "notes"        text,
        "publishedAt"  timestamptz,
        "publishedBy"  uuid,
        "createdBy"    uuid         NOT NULL,
        "createdAt"    timestamptz  NOT NULL DEFAULT now(),
        "updatedAt"    timestamptz  NOT NULL DEFAULT now(),
        "deletedAt"    timestamptz,
        CONSTRAINT "PK_daily_schedules" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_daily_schedule_factory_date" UNIQUE ("factoryId", "scheduleDate")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_daily_schedules_factoryId_status"
        ON "daily_schedules" ("factoryId", "status")
    `);

    await queryRunner.query(`
      ALTER TABLE "daily_schedules"
        ADD CONSTRAINT "FK_daily_schedules_factory"
          FOREIGN KEY ("factoryId") REFERENCES "factories"("id") ON DELETE RESTRICT
    `);

    // ── schedule_entries ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "schedule_entries" (
        "id"                   uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "dailyScheduleId"      uuid         NOT NULL,
        "factoryId"            uuid         NOT NULL,
        "cncMachineId"         uuid         NOT NULL,
        "workOrderId"          uuid         NOT NULL,
        "productionOrderId"    uuid         NOT NULL,
        "assignedOperatorId"   uuid,
        "sortOrder"            integer      NOT NULL DEFAULT 0,
        "status"               "public"."schedule_entry_status_enum" NOT NULL DEFAULT 'PENDING',
        "plannedStart"         timestamptz  NOT NULL,
        "plannedEnd"           timestamptz  NOT NULL,
        "plannedQty"           integer      NOT NULL,
        "plannedSetupMinutes"  integer      NOT NULL DEFAULT 0,
        "plannedCycleSeconds"  integer      NOT NULL,
        "actualSetupStart"     timestamptz,
        "actualRunStart"       timestamptz,
        "actualEnd"            timestamptz,
        "toolingRequirements"  jsonb,
        "partName"             varchar(200) NOT NULL,
        "notes"                text,
        "createdAt"            timestamptz  NOT NULL DEFAULT now(),
        "updatedAt"            timestamptz  NOT NULL DEFAULT now(),
        "deletedAt"            timestamptz,
        CONSTRAINT "PK_schedule_entries" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_schedule_entries_qty_positive" CHECK ("plannedQty" > 0),
        CONSTRAINT "CHK_schedule_entries_cycle_positive" CHECK ("plannedCycleSeconds" > 0),
        CONSTRAINT "CHK_schedule_entries_end_after_start" CHECK ("plannedEnd" > "plannedStart")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_schedule_entries_schedule_machine_status"
        ON "schedule_entries" ("dailyScheduleId", "cncMachineId", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_schedule_entries_factory_plannedStart"
        ON "schedule_entries" ("factoryId", "plannedStart")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_schedule_entries_schedule_sortOrder"
        ON "schedule_entries" ("dailyScheduleId", "sortOrder")
    `);

    await queryRunner.query(`
      ALTER TABLE "schedule_entries"
        ADD CONSTRAINT "FK_schedule_entries_dailySchedule"
          FOREIGN KEY ("dailyScheduleId") REFERENCES "daily_schedules"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "schedule_entries"
        ADD CONSTRAINT "FK_schedule_entries_cncMachine"
          FOREIGN KEY ("cncMachineId") REFERENCES "cnc_machines"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "schedule_entries"
        ADD CONSTRAINT "FK_schedule_entries_workOrder"
          FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "schedule_entries"
        ADD CONSTRAINT "FK_schedule_entries_productionOrder"
          FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE RESTRICT
    `);

    // ── production_logs ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "production_logs" (
        "id"                      uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "scheduleEntryId"         uuid        NOT NULL,
        "factoryId"               uuid        NOT NULL,
        "cncMachineId"            uuid        NOT NULL,
        "operatorId"              uuid        NOT NULL,
        "loggedAt"                timestamptz NOT NULL DEFAULT now(),
        "completedQty"            integer     NOT NULL,
        "scrapQty"                integer     NOT NULL DEFAULT 0,
        "cycleTimeActualSeconds"  integer,
        "operatorNotes"           text,
        CONSTRAINT "PK_production_logs" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_production_logs_completedQty_positive" CHECK ("completedQty" > 0),
        CONSTRAINT "CHK_production_logs_scrapQty_nonneg"        CHECK ("scrapQty" >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_production_logs_scheduleEntryId"
        ON "production_logs" ("scheduleEntryId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_production_logs_factoryId_loggedAt"
        ON "production_logs" ("factoryId", "loggedAt")
    `);

    await queryRunner.query(`
      ALTER TABLE "production_logs"
        ADD CONSTRAINT "FK_production_logs_scheduleEntry"
          FOREIGN KEY ("scheduleEntryId") REFERENCES "schedule_entries"("id") ON DELETE RESTRICT
    `);

    // ── machine_downtime ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "machine_downtime" (
        "id"                uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "factoryId"         uuid        NOT NULL,
        "cncMachineId"      uuid        NOT NULL,
        "scheduleEntryId"   uuid,
        "raisedBy"          uuid        NOT NULL,
        "startedAt"         timestamptz NOT NULL,
        "resolvedAt"        timestamptz,
        "resolvedBy"        uuid,
        "faultCode"         varchar(50) NOT NULL,
        "description"       text        NOT NULL,
        "rootCause"         text,
        "correctiveAction"  text,
        "durationMinutes"   integer,
        CONSTRAINT "PK_machine_downtime" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_machine_downtime_factoryId"
        ON "machine_downtime" ("factoryId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_machine_downtime_cncMachineId_resolvedAt"
        ON "machine_downtime" ("cncMachineId", "resolvedAt")
    `);

    await queryRunner.query(`
      ALTER TABLE "machine_downtime"
        ADD CONSTRAINT "FK_machine_downtime_cncMachine"
          FOREIGN KEY ("cncMachineId") REFERENCES "cnc_machines"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "machine_downtime"
        ADD CONSTRAINT "FK_machine_downtime_scheduleEntry"
          FOREIGN KEY ("scheduleEntryId") REFERENCES "schedule_entries"("id") ON DELETE SET NULL
    `);

    // ── Deferred FK: cnc_machines → schedule_entries ────────────────────────
    // Added last because schedule_entries must exist first.
    await queryRunner.query(`
      ALTER TABLE "cnc_machines"
        ADD CONSTRAINT "FK_cnc_machines_currentScheduleEntry"
          FOREIGN KEY ("currentScheduleEntryId") REFERENCES "schedule_entries"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ── Remove deferred FK first ────────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "cnc_machines" DROP CONSTRAINT "FK_cnc_machines_currentScheduleEntry"`,
    );

    // ── machine_downtime ────────────────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "machine_downtime" DROP CONSTRAINT "FK_machine_downtime_scheduleEntry"`,
    );
    await queryRunner.query(
      `ALTER TABLE "machine_downtime" DROP CONSTRAINT "FK_machine_downtime_cncMachine"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_machine_downtime_cncMachineId_resolvedAt"`);
    await queryRunner.query(`DROP INDEX "IDX_machine_downtime_factoryId"`);
    await queryRunner.query(`DROP TABLE "machine_downtime"`);

    // ── production_logs ─────────────────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "production_logs" DROP CONSTRAINT "FK_production_logs_scheduleEntry"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_production_logs_factoryId_loggedAt"`);
    await queryRunner.query(`DROP INDEX "IDX_production_logs_scheduleEntryId"`);
    await queryRunner.query(`DROP TABLE "production_logs"`);

    // ── schedule_entries ────────────────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "schedule_entries" DROP CONSTRAINT "FK_schedule_entries_productionOrder"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_entries" DROP CONSTRAINT "FK_schedule_entries_workOrder"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_entries" DROP CONSTRAINT "FK_schedule_entries_cncMachine"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_entries" DROP CONSTRAINT "FK_schedule_entries_dailySchedule"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_schedule_entries_schedule_sortOrder"`);
    await queryRunner.query(`DROP INDEX "IDX_schedule_entries_factory_plannedStart"`);
    await queryRunner.query(`DROP INDEX "IDX_schedule_entries_schedule_machine_status"`);
    await queryRunner.query(`DROP TABLE "schedule_entries"`);

    // ── daily_schedules ─────────────────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "daily_schedules" DROP CONSTRAINT "FK_daily_schedules_factory"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_daily_schedules_factoryId_status"`);
    await queryRunner.query(`DROP TABLE "daily_schedules"`);

    // ── cnc_machines ────────────────────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "cnc_machines" DROP CONSTRAINT "FK_cnc_machines_mdm_machine"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cnc_machines" DROP CONSTRAINT "FK_cnc_machines_factory"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_cnc_machines_factoryId"`);
    await queryRunner.query(`DROP TABLE "cnc_machines"`);

    // ── Enum types ──────────────────────────────────────────────────────────
    await queryRunner.query(`DROP TYPE "public"."schedule_entry_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."daily_schedule_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."cnc_machine_status_enum"`);
  }
}
