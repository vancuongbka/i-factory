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
    steelRod:       '40000000-0000-0000-0000-000000000001',
    aluminumSheet:  '40000000-0000-0000-0000-000000000002',
    electronicComp: '40000000-0000-0000-0000-000000000003',
    plasticCasing:  '40000000-0000-0000-0000-000000000004',
    rubberGasket:   '40000000-0000-0000-0000-000000000005',
    copperWire:     '40000000-0000-0000-0000-000000000006',
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
  // ── MDM ────────────────────────────────────────────────────────────────────
  uom: {
    kg:   'a0000000-0000-0000-0000-000000000001',
    pcs:  'a0000000-0000-0000-0000-000000000002',
    m:    'a0000000-0000-0000-0000-000000000003',
    unit: 'a0000000-0000-0000-0000-000000000004',
    L:    'a0000000-0000-0000-0000-000000000005',
    min:  'a0000000-0000-0000-0000-000000000006',
  },
  category: {
    electronics:    'b0000000-0000-0000-0000-000000000001',
    motors:         'b0000000-0000-0000-0000-000000000002',
    circuitBoards:  'b0000000-0000-0000-0000-000000000003',
    rawMaterials:   'b0000000-0000-0000-0000-000000000004',
    steelProducts:  'b0000000-0000-0000-0000-000000000005',
    wireCables:     'b0000000-0000-0000-0000-000000000006',
  },
  product: {
    motor3kw:       'c0000000-0000-0000-0000-000000000001',
    circuitBoard:   'c0000000-0000-0000-0000-000000000002',
    steelRod:       'c0000000-0000-0000-0000-000000000003',
    aluminumSheet:  'c0000000-0000-0000-0000-000000000004',
    electronicComp: 'c0000000-0000-0000-0000-000000000005',
    plasticCasing:  'c0000000-0000-0000-0000-000000000006',
    rubberGasket:   'c0000000-0000-0000-0000-000000000007',
    copperWire:     'c0000000-0000-0000-0000-000000000008',
  },
  workCenter: {
    cnc:        'd0000000-0000-0000-0000-000000000001',
    winding:    'd0000000-0000-0000-0000-000000000002',
    assembly:   'd0000000-0000-0000-0000-000000000003',
    press:      'd0000000-0000-0000-0000-000000000004',
    inspection: 'd0000000-0000-0000-0000-000000000005',
    packing:    'd0000000-0000-0000-0000-000000000006',
  },
  machine: {
    cncSaw:      'e0000000-0000-0000-0000-000000000001',
    drillPress:  'e0000000-0000-0000-0000-000000000002',
    windingMach: 'e0000000-0000-0000-0000-000000000003',
    hydPress:    'e0000000-0000-0000-0000-000000000004',
  },
  skill: {
    cncOp:       'f0000000-0000-0000-0000-000000000001',
    windingOp:   'f0000000-0000-0000-0000-000000000002',
    assembly:    'f0000000-0000-0000-0000-000000000003',
    pressOp:     'f0000000-0000-0000-0000-000000000004',
    qcInspect:   'f0000000-0000-0000-0000-000000000005',
    electrical:  'f0000000-0000-0000-0000-000000000006',
    materialHdl: 'f0000000-0000-0000-0000-000000000007',
  },
  routing: {
    motor:   'a1000000-0000-0000-0000-000000000001',
    circuit: 'a1000000-0000-0000-0000-000000000002',
  },
  routingOp: {
    // motor routing operations
    mOp1: 'a1000001-0000-0000-0000-000000000001',
    mOp2: 'a1000001-0000-0000-0000-000000000002',
    mOp3: 'a1000001-0000-0000-0000-000000000003',
    mOp4: 'a1000001-0000-0000-0000-000000000004',
    mOp5: 'a1000001-0000-0000-0000-000000000005',
    // circuit board routing operations
    cOp1: 'a1000001-0000-0000-0000-000000000006',
    cOp2: 'a1000001-0000-0000-0000-000000000007',
    cOp3: 'a1000001-0000-0000-0000-000000000008',
    cOp4: 'a1000001-0000-0000-0000-000000000009',
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

  // ── MDM: Units of Measure ─────────────────────────────────────────────────
  console.log('Seeding units of measure...');
  await qr.query(`
    INSERT INTO units_of_measure (id, "factoryId", code, name, symbol, "isBase", "isActive")
    VALUES
      ('${ID.uom.kg}',   '${ID.factory.hcm}', 'KG',   'Kilogram',   'kg',   true,  true),
      ('${ID.uom.pcs}',  '${ID.factory.hcm}', 'PCS',  'Pieces',     'pcs',  true,  true),
      ('${ID.uom.m}',    '${ID.factory.hcm}', 'M',    'Meter',      'm',    true,  true),
      ('${ID.uom.unit}', '${ID.factory.hcm}', 'UNIT', 'Unit',       'unit', true,  true),
      ('${ID.uom.L}',    '${ID.factory.hcm}', 'L',    'Liter',      'L',    true,  true),
      ('${ID.uom.min}',  '${ID.factory.hcm}', 'MIN',  'Minute',     'min',  false, true)
  `);

  // ── MDM: Product Categories ───────────────────────────────────────────────
  console.log('Seeding product categories...');
  // Insert root categories first, then children
  await qr.query(`
    INSERT INTO product_categories (id, "factoryId", code, name, "parentId", description, "sortOrder")
    VALUES
      ('${ID.category.electronics}',   '${ID.factory.hcm}', 'CAT-ELEC', 'Electronics',    NULL,                           'Finished electronic products and assemblies', 1),
      ('${ID.category.rawMaterials}',  '${ID.factory.hcm}', 'CAT-RAW',  'Raw Materials',  NULL,                           'Unprocessed input materials',                 2),
      ('${ID.category.motors}',        '${ID.factory.hcm}', 'CAT-MOT',  'Motors',         '${ID.category.electronics}',   'Electric motors and assemblies',              1),
      ('${ID.category.circuitBoards}', '${ID.factory.hcm}', 'CAT-PCB',  'Circuit Boards', '${ID.category.electronics}',   'Printed circuit boards and control units',    2),
      ('${ID.category.steelProducts}', '${ID.factory.hcm}', 'CAT-STL',  'Steel Products', '${ID.category.rawMaterials}',  'Steel rods, sheets, and profiles',            1),
      ('${ID.category.wireCables}',    '${ID.factory.hcm}', 'CAT-WIRE', 'Wire & Cables',  '${ID.category.rawMaterials}',  'Copper wire, cables, and conductors',         2)
  `);

  // ── MDM: Products ─────────────────────────────────────────────────────────
  console.log('Seeding products...');
  await qr.query(`
    INSERT INTO products (id, "factoryId", sku, name, type, "categoryId", "uomId", description, "technicalSpecs", "isActive")
    VALUES
      (
        '${ID.product.motor3kw}', '${ID.factory.hcm}',
        'MOTOR-3KW', 'Electric Motor 3kW', 'FINISHED',
        '${ID.category.motors}', '${ID.uom.unit}',
        'Standard 3kW induction motor, IP54, IE2 efficiency class',
        '{"powerKw": 3, "voltageV": 380, "frequencyHz": 50, "rpmNominal": 1450, "efficiencyClass": "IE2", "protectionClass": "IP54"}'::jsonb,
        true
      ),
      (
        '${ID.product.circuitBoard}', '${ID.factory.hcm}',
        'PCB-CTRL-V2', 'Control Circuit Board V2', 'FINISHED',
        '${ID.category.circuitBoards}', '${ID.uom.unit}',
        'Motor control PCB with PLC interface, V2.1 revision',
        '{"revision": "2.1", "dimensions": "120x80mm", "inputVoltage": "24VDC", "plcInterface": "RS485"}'::jsonb,
        true
      ),
      (
        '${ID.product.steelRod}', '${ID.factory.hcm}',
        'RM-STEEL-10', 'Steel Rod 10mm', 'RAW_MATERIAL',
        '${ID.category.steelProducts}', '${ID.uom.kg}',
        'Cold-drawn steel rod, diameter 10mm, grade S235',
        '{"diameter": "10mm", "grade": "S235", "tensileStrength": "360MPa"}'::jsonb,
        true
      ),
      (
        '${ID.product.aluminumSheet}', '${ID.factory.hcm}',
        'RM-ALU-2MM', 'Aluminum Sheet 2mm', 'RAW_MATERIAL',
        NULL, '${ID.uom.pcs}',
        'Aluminum alloy sheet 2mm thickness, 1000×2000mm panels',
        '{"thickness": "2mm", "alloy": "6061-T6", "dimensions": "1000x2000mm"}'::jsonb,
        true
      ),
      (
        '${ID.product.electronicComp}', '${ID.factory.hcm}',
        'RM-ELEC-COMP', 'Electronic Components Kit', 'RAW_MATERIAL',
        NULL, '${ID.uom.pcs}',
        'Mixed SMD component kit for PCB assembly (resistors, capacitors, ICs)',
        '{"componentCount": 48, "packageTypes": ["0402", "0603", "SO8", "TQFP32"]}'::jsonb,
        true
      ),
      (
        '${ID.product.plasticCasing}', '${ID.factory.hcm}',
        'RM-PLASTIC-A', 'Plastic Casing Type A', 'RAW_MATERIAL',
        NULL, '${ID.uom.pcs}',
        'ABS injection-molded enclosure for control board',
        '{"material": "ABS", "color": "RAL7035", "dimensions": "130x90x40mm"}'::jsonb,
        true
      ),
      (
        '${ID.product.rubberGasket}', '${ID.factory.hcm}',
        'CONS-GASKET-50', 'Rubber Gasket 50mm', 'CONSUMABLE',
        NULL, '${ID.uom.pcs}',
        'EPDM rubber sealing gasket, 50mm OD, for motor end shields',
        '{"material": "EPDM", "outerDiameter": "50mm", "thickness": "3mm"}'::jsonb,
        true
      ),
      (
        '${ID.product.copperWire}', '${ID.factory.hcm}',
        'RM-WIRE-1.5', 'Copper Wire 1.5mm', 'RAW_MATERIAL',
        '${ID.category.wireCables}', '${ID.uom.m}',
        'Enameled copper magnet wire, 1.5mm diameter, class H insulation',
        '{"diameter": "1.5mm", "insulation": "Class H", "conductivity": "99.9% IACS"}'::jsonb,
        true
      )
  `);

  // ── MDM: Work Centers ─────────────────────────────────────────────────────
  console.log('Seeding work centers...');
  await qr.query(`
    INSERT INTO work_centers (id, "factoryId", code, name, type, "capacityPerHour", description, "isActive")
    VALUES
      ('${ID.workCenter.cnc}',        '${ID.factory.hcm}', 'WC-CNC',    'CNC Machining Center',   'MACHINE',    6.00,  'CNC cutting, drilling, and turning operations',         true),
      ('${ID.workCenter.winding}',    '${ID.factory.hcm}', 'WC-WIND',   'Winding Station',        'MACHINE',    1.00,  'Automatic coil winding for motor stators and rotors',   true),
      ('${ID.workCenter.assembly}',   '${ID.factory.hcm}', 'WC-ASSY',   'Final Assembly',         'ASSEMBLY',   4.00,  'Manual and semi-automated product assembly',            true),
      ('${ID.workCenter.press}',      '${ID.factory.hcm}', 'WC-PRESS',  'Hydraulic Press',        'MACHINE',    8.00,  '50-ton hydraulic press for shaft and bearing assembly', true),
      ('${ID.workCenter.inspection}', '${ID.factory.hcm}', 'WC-QC',     'QC Inspection Station',  'INSPECTION', 12.00, 'Dimensional, electrical, and functional testing',       true),
      ('${ID.workCenter.packing}',    '${ID.factory.hcm}', 'WC-PACK',   'Packaging Area',         'PACKING',    20.00, 'Labeling, boxing, and palletizing for shipment',        true)
  `);

  // ── MDM: Machines ─────────────────────────────────────────────────────────
  console.log('Seeding machines...');
  await qr.query(`
    INSERT INTO machines (id, "factoryId", "workCenterId", code, name, model, "serialNumber", status, "capacityPerHour")
    VALUES
      (
        '${ID.machine.cncSaw}', '${ID.factory.hcm}', '${ID.workCenter.cnc}',
        'CNC-001', 'Fanuc CNC Lathe #1', 'Fanuc 0i-TF Plus', 'FCT-2021-00412',
        'ACTIVE', 4.00
      ),
      (
        '${ID.machine.drillPress}', '${ID.factory.hcm}', '${ID.workCenter.cnc}',
        'CNC-002', 'CNC Radial Drill Press', 'Haas TM-2', 'HAS-2020-07831',
        'IDLE', 6.00
      ),
      (
        '${ID.machine.windingMach}', '${ID.factory.hcm}', '${ID.workCenter.winding}',
        'WIND-001', 'Automatic Winding Machine', 'MARSILLI 36N', 'MRS-2022-00156',
        'ACTIVE', 1.00
      ),
      (
        '${ID.machine.hydPress}', '${ID.factory.hcm}', '${ID.workCenter.press}',
        'PRESS-001', 'Hydraulic Press 50T', 'Schuler HPM 50', 'SCH-2019-03377',
        'ACTIVE', 8.00
      )
  `);

  // ── MDM: Skills ───────────────────────────────────────────────────────────
  console.log('Seeding skills...');
  await qr.query(`
    INSERT INTO skills (id, "factoryId", code, name, level, description, "isActive")
    VALUES
      ('${ID.skill.cncOp}',       '${ID.factory.hcm}', 'SK-CNC',    'CNC Machine Operation',       'ADVANCED',      'Operate CNC lathes and milling machines; program G-code',  true),
      ('${ID.skill.windingOp}',   '${ID.factory.hcm}', 'SK-WIND',   'Coil Winding',                'INTERMEDIATE',  'Set up and operate automatic coil winding machines',        true),
      ('${ID.skill.assembly}',    '${ID.factory.hcm}', 'SK-ASSY',   'Mechanical Assembly',         'BASIC',         'Hand tools, torque wrenches, assembly fixtures',            true),
      ('${ID.skill.pressOp}',     '${ID.factory.hcm}', 'SK-PRESS',  'Hydraulic Press Operation',   'INTERMEDIATE',  'Operate hydraulic press; read force and stroke settings',   true),
      ('${ID.skill.qcInspect}',   '${ID.factory.hcm}', 'SK-QC',     'QC Inspection',               'ADVANCED',      'Dimensional measurement, electrical testing, FAT/SAT',     true),
      ('${ID.skill.electrical}',  '${ID.factory.hcm}', 'SK-ELEC',   'Electrical Wiring',           'EXPERT',        'Wire motor terminals, perform insulation resistance tests',  true),
      ('${ID.skill.materialHdl}', '${ID.factory.hcm}', 'SK-MAT',    'Material Handling',           'BASIC',         'Forklift operation, pallet jack, warehouse picking',        true)
  `);

  // ── MDM: Routings ─────────────────────────────────────────────────────────
  console.log('Seeding routings...');
  await qr.query(`
    INSERT INTO routings (id, "factoryId", "productId", code, name, version, "isActive", notes)
    VALUES
      (
        '${ID.routing.motor}', '${ID.factory.hcm}', '${ID.product.motor3kw}',
        'RT-MOTOR-001', 'Electric Motor 3kW — Standard Routing', '1.0', true,
        'Standard manufacturing routing for IE2 3kW induction motor. Total cycle: ~5.5 hours.'
      ),
      (
        '${ID.routing.circuit}', '${ID.factory.hcm}', '${ID.product.circuitBoard}',
        'RT-CIRCUIT-001', 'Control Circuit Board — Assembly Routing', '1.0', true,
        'SMT + through-hole assembly routing for V2.1 control PCB. Total cycle: ~2.5 hours.'
      )
  `);

  // ── MDM: Routing Operations ───────────────────────────────────────────────
  console.log('Seeding routing operations...');
  await qr.query(`
    INSERT INTO routing_operations (
      id, "routingId", sequence, name, "workCenterId",
      "setupTimeMinutes", "cycleTimeMinutes", "machineIds", "requiredSkills",
      "workInstructions", "isOptional"
    ) VALUES
      -- Electric Motor 3kW routing
      (
        '${ID.routingOp.mOp1}', '${ID.routing.motor}', 10,
        'CNC Shaft Machining',
        '${ID.workCenter.cnc}',
        15, 30.00,
        ARRAY['${ID.machine.cncSaw}']::uuid[],
        ARRAY['SK-CNC'],
        'Turn steel rod to 28mm shaft diameter. Face ends. Cut keyway 8×4mm per DWG-SHAFT-3KW. Tolerance ±0.02mm on bearing seats.',
        false
      ),
      (
        '${ID.routingOp.mOp2}', '${ID.routing.motor}', 20,
        'Stator Coil Winding',
        '${ID.workCenter.winding}',
        10, 120.00,
        ARRAY['${ID.machine.windingMach}']::uuid[],
        ARRAY['SK-WIND'],
        'Wind 48 stator slots, 3-phase, 4-pole. Use 1.5mm enameled copper wire. 3 layers per slot. Insulate inter-layer with Nomex 410.',
        false
      ),
      (
        '${ID.routingOp.mOp3}', '${ID.routing.motor}', 30,
        'Rotor & Bearing Press Assembly',
        '${ID.workCenter.press}',
        5, 45.00,
        ARRAY['${ID.machine.hydPress}']::uuid[],
        ARRAY['SK-PRESS', 'SK-ASSY'],
        'Press SKF 6205 bearings onto shaft at 2-ton force. Check axial runout <0.05mm. Press rotor lamination stack to shaft.',
        false
      ),
      (
        '${ID.routingOp.mOp4}', '${ID.routing.motor}', 40,
        'Final Assembly & Wiring',
        '${ID.workCenter.assembly}',
        15, 60.00,
        ARRAY[]::uuid[],
        ARRAY['SK-ASSY', 'SK-ELEC'],
        'Mount end shields. Install rubber gaskets. Connect stator leads to terminal box per WD-MOTOR-3KW-v2. Torque all fasteners to spec.',
        false
      ),
      (
        '${ID.routingOp.mOp5}', '${ID.routing.motor}', 50,
        'Electrical & Functional Test',
        '${ID.workCenter.inspection}',
        0, 30.00,
        ARRAY[]::uuid[],
        ARRAY['SK-QC', 'SK-ELEC'],
        'Measure winding resistance (all 3 phases within ±2%). HV withstand test 1500V/1min. No-load run 30min: record current and vibration (≤2.8mm/s).',
        false
      ),
      -- Control Circuit Board routing
      (
        '${ID.routingOp.cOp1}', '${ID.routing.circuit}', 10,
        'SMD Component Placement',
        '${ID.workCenter.assembly}',
        5, 45.00,
        ARRAY[]::uuid[],
        ARRAY['SK-ASSY'],
        'Apply solder paste via stencil. Place SMD components using pick-and-place fixture. Verify placement against BOM-002 component list.',
        false
      ),
      (
        '${ID.routingOp.cOp2}', '${ID.routing.circuit}', 20,
        'Reflow Soldering',
        '${ID.workCenter.assembly}',
        0, 20.00,
        ARRAY[]::uuid[],
        ARRAY['SK-ASSY'],
        'Reflow profile: preheat 150°C/60s, soak 180°C/90s, peak 245°C/10s. Inspect solder joints under 10× magnification after cooling.',
        false
      ),
      (
        '${ID.routingOp.cOp3}', '${ID.routing.circuit}', 30,
        'Functional Test & Programming',
        '${ID.workCenter.inspection}',
        0, 20.00,
        ARRAY[]::uuid[],
        ARRAY['SK-QC'],
        'Flash firmware v2.1.3 via JTAG. Run built-in self-test. Verify RS485 communication at 9600 baud. Check all I/O channels.',
        false
      ),
      (
        '${ID.routingOp.cOp4}', '${ID.routing.circuit}', 40,
        'Labeling & Packaging',
        '${ID.workCenter.packing}',
        5, 10.00,
        ARRAY[]::uuid[],
        ARRAY['SK-MAT'],
        'Apply serialized QR label. Insert into anti-static bag. Place in foam-padded box with datasheet. Label outer carton.',
        false
      )
  `);

  // ── MDM: Back-link BOMs and Production Orders to MDM Products ─────────────
  console.log('Linking BOMs and production orders to MDM products...');
  await qr.query(`
    UPDATE boms SET "productId" = '${ID.product.motor3kw}'
    WHERE id = '${ID.bom.motor}'
  `);
  await qr.query(`
    UPDATE boms SET "productId" = '${ID.product.circuitBoard}'
    WHERE id = '${ID.bom.circuit}'
  `);
  await qr.query(`
    UPDATE production_orders SET "productId" = '${ID.product.motor3kw}'
    WHERE id IN ('${ID.po.po1}', '${ID.po.po2}')
  `);
  await qr.query(`
    UPDATE production_orders SET "productId" = '${ID.product.circuitBoard}'
    WHERE id = '${ID.po.po3}'
  `);
  // Back-link work order steps to their work centers via routing
  await qr.query(`
    UPDATE work_order_steps SET "workCenterId" = '${ID.workCenter.cnc}'
    WHERE id = '${ID.step.s3}'
  `);
  await qr.query(`
    UPDATE work_order_steps SET "workCenterId" = '${ID.workCenter.winding}'
    WHERE id = '${ID.step.s4}'
  `);
  await qr.query(`
    UPDATE work_order_steps SET "workCenterId" = '${ID.workCenter.press}'
    WHERE id = '${ID.step.s5}'
  `);
  await qr.query(`
    UPDATE work_order_steps SET "workCenterId" = '${ID.workCenter.assembly}'
    WHERE id IN ('${ID.step.s6}', '${ID.step.s7}')
  `);
  await qr.query(`
    UPDATE work_order_steps SET "workCenterId" = '${ID.workCenter.inspection}'
    WHERE id = '${ID.step.s8}'
  `);

  await qr.release();
  await AppDataSource.destroy();
  console.log('✓ Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
