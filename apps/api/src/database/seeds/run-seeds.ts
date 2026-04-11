/**
 * Database seed — inserts realistic test data for all domains.
 * Run: pnpm --filter @i-factory/api db:seed
 *
 * Idempotent: skips all inserts if factories table already has rows.
 * To re-seed: truncate all tables first, then run again.
 */
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '@i-factory/database';
// ─── Fixed seed UUIDs ────────────────────────────────────────────────────────
const ID = {
  factory: {
    hcm: '10000000-0000-0000-0000-000000000001',
    hn:  '10000000-0000-0000-0000-000000000002',
  },
  user: {
    admin:       '20000000-0000-0000-0000-000000000001',
    hcmAdmin:    '20000000-0000-0000-0000-000000000002',
    hnAdmin:     '20000000-0000-0000-0000-000000000003',
    prodManager: '20000000-0000-0000-0000-000000000004',
    qcInspector: '20000000-0000-0000-0000-000000000005',
    warehouse:   '20000000-0000-0000-0000-000000000006',
    operator1:   '20000000-0000-0000-0000-000000000007',
    operator2:   '20000000-0000-0000-0000-000000000008',
  },
  warehouse: {
    main: '30000000-0000-0000-0000-000000000001',
    prod: '30000000-0000-0000-0000-000000000002',
  },
  material: {
    steelRod:    '40000000-0000-0000-0000-000000000001',
    aluminumSheet: '40000000-0000-0000-0000-000000000002',
    electronicComp: '40000000-0000-0000-0000-000000000003',
    plasticCasing: '40000000-0000-0000-0000-000000000004',
    rubberGasket:  '40000000-0000-0000-0000-000000000005',
    copperWire:    '40000000-0000-0000-0000-000000000006',
  },
  bom: {
    motor:   '50000000-0000-0000-0000-000000000001',
    circuit: '50000000-0000-0000-0000-000000000002',
  },
  bomItem: {
    m1: '50000001-0000-0000-0000-000000000001',
    m2: '50000001-0000-0000-0000-000000000002',
    m3: '50000001-0000-0000-0000-000000000003',
    m4: '50000001-0000-0000-0000-000000000004',
    m5: '50000001-0000-0000-0000-000000000005',
    m6: '50000001-0000-0000-0000-000000000006',
  },
  line: {
    assembly:  '60000000-0000-0000-0000-000000000001',
    packaging: '60000000-0000-0000-0000-000000000002',
  },
  po: {
    po1: '70000000-0000-0000-0000-000000000001',
    po2: '70000000-0000-0000-0000-000000000002',
    po3: '70000000-0000-0000-0000-000000000003',
  },
  wo: {
    wo1: '80000000-0000-0000-0000-000000000001',
    wo2: '80000000-0000-0000-0000-000000000002',
    wo3: '80000000-0000-0000-0000-000000000003',
    wo4: '80000000-0000-0000-0000-000000000004',
  },
  step: {
    s1: '80000001-0000-0000-0000-000000000001',
    s2: '80000001-0000-0000-0000-000000000002',
    s3: '80000001-0000-0000-0000-000000000003',
    s4: '80000001-0000-0000-0000-000000000004',
    s5: '80000001-0000-0000-0000-000000000005',
    s6: '80000001-0000-0000-0000-000000000006',
    s7: '80000001-0000-0000-0000-000000000007',
    s8: '80000001-0000-0000-0000-000000000008',
  },
  qc: {
    q1: '90000000-0000-0000-0000-000000000001',
    q2: '90000000-0000-0000-0000-000000000002',
  },
  defect: {
    d1: '90000001-0000-0000-0000-000000000001',
    d2: '90000001-0000-0000-0000-000000000002',
  },
};

async function seed() {
  await AppDataSource.initialize();
  const qr = AppDataSource.createQueryRunner();
  await qr.connect();

  // Idempotency check
  const existing = await qr.query(`SELECT COUNT(*) FROM factories`);
  if (parseInt(existing[0].count, 10) > 0) {
    console.log('Seed data already present — skipping.');
    await qr.release();
    await AppDataSource.destroy();
    return;
  }

  const hash = await bcrypt.hash('Test@123', 10);
  const now = new Date();
  const past = (days: number) => new Date(now.getTime() - days * 86_400_000);
  const future = (days: number) => new Date(now.getTime() + days * 86_400_000);

  console.log('Seeding factories...');
  await qr.query(`
    INSERT INTO factories (id, code, name, address, timezone, "isActive")
    VALUES
      ('${ID.factory.hcm}', 'HCM-A', 'HCM Factory A', '123 Nguyen Van Linh, District 7, Ho Chi Minh City', 'Asia/Ho_Chi_Minh', true),
      ('${ID.factory.hn}',  'HN-B',  'Hanoi Factory B', '45 Pham Van Dong, Bac Tu Liem, Hanoi', 'Asia/Ho_Chi_Minh', true)
  `);

  console.log('Seeding users...');
  await qr.query(`
    INSERT INTO users (id, username, email, "passwordHash", "fullName", role, "allowedFactories", "isActive")
    VALUES
      ('${ID.user.admin}',       'admin',        'admin@ifactory.vn',        '${hash}', 'System Administrator',   'SUPER_ADMIN',         '{}',                                                          true),
      ('${ID.user.hcmAdmin}',    'hcm_admin',    'hcm_admin@ifactory.vn',    '${hash}', 'HCM Factory Admin',      'FACTORY_ADMIN',        '{${ID.factory.hcm}}',                               true),
      ('${ID.user.hnAdmin}',     'hn_admin',     'hn_admin@ifactory.vn',     '${hash}', 'Hanoi Factory Admin',    'FACTORY_ADMIN',        '{${ID.factory.hn}}',                                true),
      ('${ID.user.prodManager}', 'prod_manager', 'prod_manager@ifactory.vn', '${hash}', 'Nguyen Van An',          'PRODUCTION_MANAGER',   '{${ID.factory.hcm}}',                               true),
      ('${ID.user.qcInspector}', 'qc_inspector', 'qc@ifactory.vn',           '${hash}', 'Tran Thi Bich',          'QC_INSPECTOR',         '{${ID.factory.hcm}}',                               true),
      ('${ID.user.warehouse}',   'warehouse1',   'warehouse@ifactory.vn',    '${hash}', 'Le Van Cuong',           'WAREHOUSE_STAFF',      '{${ID.factory.hcm}}',                               true),
      ('${ID.user.operator1}',   'operator1',    'op1@ifactory.vn',           '${hash}', 'Pham Van Duc',           'OPERATOR',             '{${ID.factory.hcm}}',                               true),
      ('${ID.user.operator2}',   'operator2',    'op2@ifactory.vn',           '${hash}', 'Hoang Thi Em',           'OPERATOR',             '{${ID.factory.hcm}}',                               true)
  `);

  console.log('Seeding warehouses...');
  await qr.query(`
    INSERT INTO warehouses (id, "factoryId", name, code, location, "isActive")
    VALUES
      ('${ID.warehouse.main}', '${ID.factory.hcm}', 'Main Warehouse',       'WH-001', 'Building A, Ground Floor', true),
      ('${ID.warehouse.prod}', '${ID.factory.hcm}', 'Production Area Store', 'WH-002', 'Production Hall B',       true)
  `);

  console.log('Seeding materials...');
  await qr.query(`
    INSERT INTO materials (id, "factoryId", code, name, unit, "currentStock", "minStockLevel", "maxStockLevel", "warehouseId", "isActive")
    VALUES
      ('${ID.material.steelRod}',     '${ID.factory.hcm}', 'M-001', 'Steel Rod 10mm',        'kg',  500.000, 100.000, 2000.000, '${ID.warehouse.main}', true),
      ('${ID.material.aluminumSheet}','${ID.factory.hcm}', 'M-002', 'Aluminum Sheet 2mm',    'pcs', 200.000,  50.000,  500.000, '${ID.warehouse.main}', true),
      ('${ID.material.electronicComp}','${ID.factory.hcm}','M-003', 'Electronic Components', 'pcs',5000.000,1000.000,20000.000, '${ID.warehouse.main}', true),
      ('${ID.material.plasticCasing}','${ID.factory.hcm}', 'M-004', 'Plastic Casing Type A',  'pcs', 300.000,  80.000, 1000.000, '${ID.warehouse.main}', true),
      ('${ID.material.rubberGasket}', '${ID.factory.hcm}', 'M-005', 'Rubber Gasket 50mm',     'pcs', 800.000, 200.000, 3000.000, '${ID.warehouse.main}', true),
      ('${ID.material.copperWire}',   '${ID.factory.hcm}', 'M-006', 'Copper Wire 1.5mm',      'm',  1000.000, 200.000, 5000.000, '${ID.warehouse.main}', true)
  `);

  console.log('Seeding BOMs...');
  await qr.query(`
    INSERT INTO boms (id, "factoryId", code, "productName", version, "outputQuantity", "outputUnit", "isActive", notes)
    VALUES
      ('${ID.bom.motor}',   '${ID.factory.hcm}', 'BOM-001', 'Electric Motor 3kW',   '1.0', 1.000, 'unit', true, 'Standard 3kW motor assembly BOM'),
      ('${ID.bom.circuit}', '${ID.factory.hcm}', 'BOM-002', 'Control Circuit Board', '2.1', 1.000, 'unit', true, 'V2.1 PCB with updated component layout')
  `);

  await qr.query(`
    INSERT INTO bom_items (id, "bomId", "materialId", quantity, unit, "wastePercentage", notes)
    VALUES
      ('${ID.bomItem.m1}', '${ID.bom.motor}', '${ID.material.steelRod}',       2.500, 'kg',   2.00, 'Main shaft and rotor core'),
      ('${ID.bomItem.m2}', '${ID.bom.motor}', '${ID.material.aluminumSheet}',  0.500, 'pcs',  1.00, 'Housing panels'),
      ('${ID.bomItem.m3}', '${ID.bom.motor}', '${ID.material.copperWire}',     3.000, 'm',    5.00, 'Winding coils'),
      ('${ID.bomItem.m4}', '${ID.bom.motor}', '${ID.material.rubberGasket}',   4.000, 'pcs',  0.00, 'Sealing gaskets'),
      ('${ID.bomItem.m5}', '${ID.bom.circuit}', '${ID.material.electronicComp}', 10.000, 'pcs', 2.00, 'PCB components'),
      ('${ID.bomItem.m6}', '${ID.bom.circuit}', '${ID.material.plasticCasing}',   1.000, 'pcs', 0.00, 'Enclosure')
  `);

  console.log('Seeding production lines...');
  await qr.query(`
    INSERT INTO production_lines (id, "factoryId", name, code, "isActive")
    VALUES
      ('${ID.line.assembly}',  '${ID.factory.hcm}', 'Assembly Line A', 'LINE-A', true),
      ('${ID.line.packaging}', '${ID.factory.hcm}', 'Packaging Line B', 'LINE-B', true)
  `);

  console.log('Seeding production orders...');
  await qr.query(`
    INSERT INTO production_orders (
      id, "factoryId", code, "productName", quantity, unit, status,
      "plannedStartDate", "plannedEndDate", "actualStartDate", "completedQuantity",
      "bomId", "productionLineId"
    ) VALUES
      (
        '${ID.po.po1}', '${ID.factory.hcm}', 'PO-2026-001', 'Electric Motor 3kW',
        100.000, 'unit', 'IN_PROGRESS',
        '${past(10).toISOString()}', '${future(20).toISOString()}',
        '${past(9).toISOString()}',  42.000,
        '${ID.bom.motor}', '${ID.line.assembly}'
      ),
      (
        '${ID.po.po2}', '${ID.factory.hcm}', 'PO-2026-002', 'Electric Motor 3kW',
        50.000, 'unit', 'PLANNED',
        '${future(25).toISOString()}', '${future(55).toISOString()}',
        NULL, 0.000,
        '${ID.bom.motor}', '${ID.line.assembly}'
      ),
      (
        '${ID.po.po3}', '${ID.factory.hcm}', 'PO-2026-003', 'Control Circuit Board',
        200.000, 'unit', 'COMPLETED',
        '${past(60).toISOString()}', '${past(20).toISOString()}',
        '${past(58).toISOString()}', 200.000,
        '${ID.bom.circuit}', '${ID.line.assembly}'
      )
  `);

  console.log('Seeding work orders...');
  await qr.query(`
    INSERT INTO work_orders (
      id, "factoryId", "productionOrderId", code, description, status,
      "assignedTo", "plannedStartDate", "plannedEndDate", "actualStartDate", "actualEndDate"
    ) VALUES
      (
        '${ID.wo.wo1}', '${ID.factory.hcm}', '${ID.po.po1}',
        'WO-2026-001', 'Material preparation and pre-assembly for batch 1',
        'COMPLETED',
        '${ID.user.operator1}',
        '${past(10).toISOString()}', '${past(7).toISOString()}',
        '${past(10).toISOString()}', '${past(7).toISOString()}'
      ),
      (
        '${ID.wo.wo2}', '${ID.factory.hcm}', '${ID.po.po1}',
        'WO-2026-002', 'Motor winding and core assembly',
        'IN_PROGRESS',
        '${ID.user.operator1}',
        '${past(7).toISOString()}', '${future(3).toISOString()}',
        '${past(7).toISOString()}', NULL
      ),
      (
        '${ID.wo.wo3}', '${ID.factory.hcm}', '${ID.po.po1}',
        'WO-2026-003', 'Final assembly and functional test',
        'PENDING',
        NULL,
        '${future(3).toISOString()}', '${future(10).toISOString()}',
        NULL, NULL
      ),
      (
        '${ID.wo.wo4}', '${ID.factory.hcm}', '${ID.po.po3}',
        'WO-2026-004', 'PCB soldering and component placement',
        'COMPLETED',
        '${ID.user.operator2}',
        '${past(58).toISOString()}', '${past(25).toISOString()}',
        '${past(57).toISOString()}', '${past(22).toISOString()}'
      )
  `);

  console.log('Seeding work order steps...');
  await qr.query(`
    INSERT INTO work_order_steps (
      id, "workOrderId", "stepNumber", name, description,
      "estimatedMinutes", "requiredSkills", "isCompleted", "completedAt"
    ) VALUES
      ('${ID.step.s1}', '${ID.wo.wo1}', 1, 'Gather materials from warehouse', 'Pick steel rods, aluminum sheets, copper wire per BOM', 30, '{"picker","forklift"}', true, '${past(10).toISOString()}'),
      ('${ID.step.s2}', '${ID.wo.wo1}', 2, 'Inspect incoming materials',       'Visual + dimensional check against specs',                20, '{"qc-basic"}',          true, '${past(10).toISOString()}'),
      ('${ID.step.s3}', '${ID.wo.wo1}', 3, 'Pre-cut steel rods to length',     'Cut to 350mm ±0.5mm using CNC saw',                       45, '{"cnc-operator"}',      true, '${past(9).toISOString()}'),
      ('${ID.step.s4}', '${ID.wo.wo2}', 1, 'Wind copper coils on stator',      '3 layers, 48 slots, 0.8mm wire diameter',                 120, '{"winding"}',          false, NULL),
      ('${ID.step.s5}', '${ID.wo.wo2}', 2, 'Press rotor assembly',             'Hydraulic press at 2 tons, check runout <0.05mm',          60, '{"press-operator"}',   false, NULL),
      ('${ID.step.s6}', '${ID.wo.wo2}', 3, 'Install bearings and seals',       'SKF 6205 bearings, torque bolts to 12 Nm',                 40, '{"assembly"}',         false, NULL),
      ('${ID.step.s7}', '${ID.wo.wo3}', 1, 'Electrical wiring and terminals',  'Connect per wiring diagram WD-MOTOR-3KW-v2',               50, '{"electrical"}',       false, NULL),
      ('${ID.step.s8}', '${ID.wo.wo3}', 2, 'Run-in test and measurement',      'No-load run 30 min, record current and vibration',         60, '{"testing","electrical"}', false, NULL)
  `);

  console.log('Seeding QC inspections...');
  await qr.query(`
    INSERT INTO qc_inspections (
      id, "factoryId", "workOrderId", "productionOrderId", "inspectorId",
      "inspectedAt", "sampleSize", "passedCount", "failedCount", result, notes
    ) VALUES
      (
        '${ID.qc.q1}', '${ID.factory.hcm}', '${ID.wo.wo1}', '${ID.po.po1}',
        '${ID.user.qcInspector}',
        '${past(9).toISOString()}',
        20, 20, 0, 'PASS',
        'All materials within spec. Steel rod diameter 10.01mm avg, tolerance ±0.1mm.'
      ),
      (
        '${ID.qc.q2}', '${ID.factory.hcm}', '${ID.wo.wo4}', '${ID.po.po3}',
        '${ID.user.qcInspector}',
        '${past(22).toISOString()}',
        50, 46, 4, 'CONDITIONAL',
        '4 boards had cold solder joints on U3 IC. Reworked and re-tested — all pass after rework.'
      )
  `);

  await qr.query(`
    INSERT INTO qc_defects (
      id, "inspectionId", code, description, severity, quantity, "rootCause", "correctiveAction"
    ) VALUES
      (
        '${ID.defect.d1}', '${ID.qc.q2}',
        'DEF-SOLDER-001', 'Cold solder joint on U3 IC pin 4-8',
        'MAJOR', 3,
        'Solder temperature too low (210°C vs required 230°C) during reflow',
        'Recalibrate reflow oven profile. Raise preheat zone to 180°C. Rework affected boards.'
      ),
      (
        '${ID.defect.d2}', '${ID.qc.q2}',
        'DEF-SOLDER-002', 'Solder bridge between pins 12-13 on J1 connector',
        'MINOR', 1,
        'Excess solder paste applied — stencil aperture slightly oversized',
        'Replace stencil. Manual rework with desoldering wick on affected board.'
      )
  `);

  console.log('Seeding stock movements...');
  // Receipts
  await qr.query(`
    INSERT INTO stock_movements (id, "factoryId", "materialId", type, quantity, unit, "referenceType", notes, "createdBy")
    VALUES
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.steelRod}',      'RECEIPT', 500.000, 'kg',  'PURCHASE_ORDER', 'Initial stock receipt from Hoa Phat Steel',    '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.aluminumSheet}', 'RECEIPT', 200.000, 'pcs', 'PURCHASE_ORDER', 'Initial stock — Ton Hoa Phat supplier',         '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.electronicComp}','RECEIPT',5000.000, 'pcs', 'PURCHASE_ORDER', 'Bulk order from Arrow Electronics',             '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.plasticCasing}', 'RECEIPT', 300.000, 'pcs', 'PURCHASE_ORDER', 'Injection mold batch #1',                       '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.rubberGasket}',  'RECEIPT', 800.000, 'pcs', 'PURCHASE_ORDER', 'From Vinh Hung Rubber Co.',                     '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.copperWire}',    'RECEIPT',1000.000, 'm',   'PURCHASE_ORDER', 'Cadivi 1.5mm copper wire',                      '${ID.user.warehouse}')
  `);

  // Issues for PO-001
  await qr.query(`
    INSERT INTO stock_movements (id, "factoryId", "materialId", type, quantity, unit, "referenceType", "referenceId", notes, "createdBy")
    VALUES
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.steelRod}',    'ISSUE', 105.000, 'kg',  'WORK_ORDER', '${ID.wo.wo1}', 'Issued for WO-2026-001 (42 units × 2.5kg)',     '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.copperWire}',  'ISSUE', 126.000, 'm',   'WORK_ORDER', '${ID.wo.wo1}', 'Issued for WO-2026-001 (42 units × 3m)',         '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.rubberGasket}','ISSUE', 168.000, 'pcs', 'WORK_ORDER', '${ID.wo.wo1}', 'Issued for WO-2026-001 (42 units × 4 gaskets)', '${ID.user.warehouse}')
  `);

  console.log('Seeding notifications...');
  await qr.query(`
    INSERT INTO notifications (id, "factoryId", "userId", type, title, message, "isRead", metadata)
    VALUES
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.user.prodManager}', 'production:order-created',
       'New Production Order', 'PO-2026-001 for 100 units of Electric Motor 3kW has been created.', false,
       '{"orderId": "${ID.po.po1}", "code": "PO-2026-001"}'::jsonb),

      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.user.prodManager}', 'qc:inspection-completed',
       'QC Passed — WO-2026-001', 'Material inspection passed: 20/20 samples within spec.', true,
       '{"inspectionId": "${ID.qc.q1}", "result": "PASS"}'::jsonb),

      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.user.prodManager}', 'qc:inspection-failed',
       'QC Conditional — WO-2026-004', '4 circuit boards had cold solder defects. Rework required before shipping.', false,
       '{"inspectionId": "${ID.qc.q2}", "result": "CONDITIONAL", "defectCount": 4}'::jsonb),

      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.user.warehouse}', 'inventory:low-stock',
       'Low Stock Alert', 'Material M-002 (Aluminum Sheet) is approaching minimum stock level (200 pcs remaining).', false,
       '{"materialId": "${ID.material.aluminumSheet}", "currentStock": 200, "minLevel": 50}'::jsonb)
  `);

  await qr.release();
  await AppDataSource.destroy();
  console.log('✓ Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
