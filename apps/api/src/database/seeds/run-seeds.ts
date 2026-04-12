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

  // ── Report module: extended historical data ──────────────────────────────
  // Provides enough data for all 4 report types (production, work-orders,
  // inventory, qc) to return meaningful rows within a 90-day window.
  console.log('Seeding report module data...');

  // Fixed IDs for extended production orders
  const RPO = {
    po4: '70000000-0000-0000-0000-000000000004',
    po5: '70000000-0000-0000-0000-000000000005',
    po6: '70000000-0000-0000-0000-000000000006',
    po7: '70000000-0000-0000-0000-000000000007',
    po8: '70000000-0000-0000-0000-000000000008',
  };
  const RWO = {
    wo5: '80000000-0000-0000-0000-000000000005',
    wo6: '80000000-0000-0000-0000-000000000006',
    wo7: '80000000-0000-0000-0000-000000000007',
    wo8: '80000000-0000-0000-0000-000000000008',
    wo9: '80000000-0000-0000-0000-000000000009',
  };
  const RQC = {
    q3: '90000000-0000-0000-0000-000000000003',
    q4: '90000000-0000-0000-0000-000000000004',
    q5: '90000000-0000-0000-0000-000000000005',
    q6: '90000000-0000-0000-0000-000000000006',
  };
  const RDEF = {
    d3: '90000001-0000-0000-0000-000000000003',
    d4: '90000001-0000-0000-0000-000000000004',
    d5: '90000001-0000-0000-0000-000000000005',
  };

  // 5 more production orders spread over the last 90 days
  await qr.query(`
    INSERT INTO production_orders (
      id, "factoryId", code, "productName", "productId", quantity, unit, status,
      "plannedStartDate", "plannedEndDate", "actualStartDate", "actualEndDate",
      "completedQuantity", "bomId", "productionLineId"
    ) VALUES
      (
        '${RPO.po4}', '${ID.factory.hcm}', 'PO-2026-004', 'Electric Motor 3kW',
        '${ID.product.motor3kw}',
        75.000, 'unit', 'COMPLETED',
        '${past(80).toISOString()}', '${past(50).toISOString()}',
        '${past(79).toISOString()}', '${past(47).toISOString()}',
        75.000,
        '${ID.bom.motor}', '${ID.line.assembly}'
      ),
      (
        '${RPO.po5}', '${ID.factory.hcm}', 'PO-2026-005', 'Control Circuit Board',
        '${ID.product.circuitBoard}',
        120.000, 'unit', 'COMPLETED',
        '${past(45).toISOString()}', '${past(15).toISOString()}',
        '${past(44).toISOString()}', '${past(12).toISOString()}',
        120.000,
        '${ID.bom.circuit}', '${ID.line.assembly}'
      ),
      (
        '${RPO.po6}', '${ID.factory.hcm}', 'PO-2026-006', 'Electric Motor 3kW',
        '${ID.product.motor3kw}',
        60.000, 'unit', 'IN_PROGRESS',
        '${past(12).toISOString()}', '${future(18).toISOString()}',
        '${past(11).toISOString()}', NULL,
        22.000,
        '${ID.bom.motor}', '${ID.line.assembly}'
      ),
      (
        '${RPO.po7}', '${ID.factory.hcm}', 'PO-2026-007', 'Control Circuit Board',
        '${ID.product.circuitBoard}',
        80.000, 'unit', 'COMPLETED',
        '${past(35).toISOString()}', '${past(10).toISOString()}',
        '${past(34).toISOString()}', '${past(8).toISOString()}',
        80.000,
        '${ID.bom.circuit}', '${ID.line.assembly}'
      ),
      (
        '${RPO.po8}', '${ID.factory.hcm}', 'PO-2026-008', 'Electric Motor 3kW',
        '${ID.product.motor3kw}',
        200.000, 'unit', 'PLANNED',
        '${future(10).toISOString()}', '${future(50).toISOString()}',
        NULL, NULL,
        0.000,
        '${ID.bom.motor}', '${ID.line.assembly}'
      )
  `);

  // Work orders for the extended production orders
  await qr.query(`
    INSERT INTO work_orders (
      id, "factoryId", "productionOrderId", code, description, status,
      "assignedTo", "plannedStartDate", "plannedEndDate", "actualStartDate", "actualEndDate"
    ) VALUES
      (
        '${RWO.wo5}', '${ID.factory.hcm}', '${RPO.po4}',
        'WO-2026-005', 'Motor assembly batch — 75 units',
        'COMPLETED',
        '${ID.user.operator1}',
        '${past(79).toISOString()}', '${past(50).toISOString()}',
        '${past(79).toISOString()}', '${past(50).toISOString()}'
      ),
      (
        '${RWO.wo6}', '${ID.factory.hcm}', '${RPO.po4}',
        'WO-2026-006', 'Functional test and final QC — batch 75 units',
        'COMPLETED',
        '${ID.user.operator2}',
        '${past(51).toISOString()}', '${past(47).toISOString()}',
        '${past(51).toISOString()}', '${past(47).toISOString()}'
      ),
      (
        '${RWO.wo7}', '${ID.factory.hcm}', '${RPO.po5}',
        'WO-2026-007', 'PCB assembly and reflow — 120 boards',
        'COMPLETED',
        '${ID.user.operator2}',
        '${past(44).toISOString()}', '${past(12).toISOString()}',
        '${past(43).toISOString()}', '${past(12).toISOString()}'
      ),
      (
        '${RWO.wo8}', '${ID.factory.hcm}', '${RPO.po6}',
        'WO-2026-008', 'Motor assembly batch — first 22 units',
        'IN_PROGRESS',
        '${ID.user.operator1}',
        '${past(11).toISOString()}', '${future(5).toISOString()}',
        '${past(11).toISOString()}', NULL
      ),
      (
        '${RWO.wo9}', '${ID.factory.hcm}', '${RPO.po7}',
        'WO-2026-009', 'PCB assembly — 80 boards',
        'COMPLETED',
        '${ID.user.operator2}',
        '${past(34).toISOString()}', '${past(8).toISOString()}',
        '${past(33).toISOString()}', '${past(8).toISOString()}'
      )
  `);

  // Steps for extended work orders
  await qr.query(`
    INSERT INTO work_order_steps (
      id, "workOrderId", "stepNumber", name, "estimatedMinutes",
      "requiredSkills", "isCompleted", "completedAt"
    ) VALUES
      ('80000001-0000-0000-0000-000000000009', '${RWO.wo5}', 1, 'CNC shaft machining',         30,  '{"cnc-operator"}',  true,  '${past(78).toISOString()}'),
      ('80000001-0000-0000-0000-00000000000a', '${RWO.wo5}', 2, 'Stator coil winding',         120, '{"winding"}',       true,  '${past(75).toISOString()}'),
      ('80000001-0000-0000-0000-00000000000b', '${RWO.wo5}', 3, 'Rotor press and final assy',  60,  '{"assembly"}',      true,  '${past(72).toISOString()}'),
      ('80000001-0000-0000-0000-00000000000c', '${RWO.wo7}', 1, 'SMD placement and reflow',    65,  '{"assembly"}',      true,  '${past(40).toISOString()}'),
      ('80000001-0000-0000-0000-00000000000d', '${RWO.wo7}', 2, 'Functional test',             20,  '{"qc-basic"}',      true,  '${past(38).toISOString()}'),
      ('80000001-0000-0000-0000-00000000000e', '${RWO.wo8}', 1, 'CNC shaft machining',         30,  '{"cnc-operator"}',  true,  '${past(10).toISOString()}'),
      ('80000001-0000-0000-0000-00000000000f', '${RWO.wo8}', 2, 'Stator coil winding',         120, '{"winding"}',       false, NULL),
      ('80000001-0000-0000-0000-000000000010', '${RWO.wo8}', 3, 'Rotor press and final assy',  60,  '{"assembly"}',      false, NULL),
      ('80000001-0000-0000-0000-000000000011', '${RWO.wo9}', 1, 'SMD placement and reflow',    65,  '{"assembly"}',      true,  '${past(30).toISOString()}'),
      ('80000001-0000-0000-0000-000000000012', '${RWO.wo9}', 2, 'Functional test',             20,  '{"qc-basic"}',      true,  '${past(28).toISOString()}')
  `);

  // QC inspections covering the extended date range
  await qr.query(`
    INSERT INTO qc_inspections (
      id, "factoryId", "workOrderId", "productionOrderId", "inspectorId",
      "inspectedAt", "sampleSize", "passedCount", "failedCount", result, notes
    ) VALUES
      (
        '${RQC.q3}', '${ID.factory.hcm}', '${RWO.wo6}', '${RPO.po4}',
        '${ID.user.qcInspector}',
        '${past(49).toISOString()}',
        75, 73, 2, 'CONDITIONAL',
        'Batch-4 motor run test: 2 units had winding resistance outside ±2% tolerance. Reworked on-site.'
      ),
      (
        '${RQC.q4}', '${ID.factory.hcm}', '${RWO.wo7}', '${RPO.po5}',
        '${ID.user.qcInspector}',
        '${past(13).toISOString()}',
        120, 120, 0, 'PASS',
        'Full batch of 120 PCBs passed functional test and firmware flash. Zero defects.'
      ),
      (
        '${RQC.q5}', '${ID.factory.hcm}', '${RWO.wo8}', '${RPO.po6}',
        '${ID.user.qcInspector}',
        '${past(8).toISOString()}',
        22, 19, 3, 'FAIL',
        '3 of 22 motors failed HV withstand test. Insulation resistance below 1MΩ. Batch on hold pending root cause.'
      ),
      (
        '${RQC.q6}', '${ID.factory.hcm}', '${RWO.wo9}', '${RPO.po7}',
        '${ID.user.qcInspector}',
        '${past(9).toISOString()}',
        80, 78, 2, 'CONDITIONAL',
        '2 boards failed RS485 comm check at first test. Re-flashed firmware and passed on second run.'
      )
  `);

  await qr.query(`
    INSERT INTO qc_defects (
      id, "inspectionId", code, description, severity, quantity, "rootCause", "correctiveAction"
    ) VALUES
      (
        '${RDEF.d3}', '${RQC.q3}',
        'DEF-WIND-001', 'Winding resistance out of tolerance on phase B',
        'MAJOR', 2,
        'Copper wire diameter variation (1.47mm vs 1.50mm spec) in reel batch W-2026-03',
        'Quarantine reel batch. Re-wind affected stators. Add incoming inspection for wire diameter.'
      ),
      (
        '${RDEF.d4}', '${RQC.q5}',
        'DEF-INSUL-001', 'Insulation resistance below 1MΩ — HV test failure',
        'CRITICAL', 3,
        'Nomex inter-layer insulation sheet improperly cut, leaving exposed copper on slot 12-14',
        'Strip and re-wind affected stators. Update cutting jig for Nomex sheets. 100% insulation check before winding.'
      ),
      (
        '${RDEF.d5}', '${RQC.q6}',
        'DEF-FW-001', 'Firmware flash incomplete — RS485 comm failure',
        'MINOR', 2,
        'USB-JTAG cable intermittent connection on programming fixture pin 7',
        'Replace programming fixture. Re-flash affected boards. Add post-flash comm verify to test script.'
      )
  `);

  // Additional stock movements covering the last 90 days
  await qr.query(`
    INSERT INTO stock_movements (id, "factoryId", "materialId", type, quantity, unit, "referenceType", "referenceId", notes, "createdBy")
    VALUES
      -- Issues for extended WOs
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.steelRod}',       'ISSUE',      187.500, 'kg',  'WORK_ORDER', '${RWO.wo5}', 'Issued for WO-2026-005 (75 units × 2.5kg)',       '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.copperWire}',     'ISSUE',      225.000, 'm',   'WORK_ORDER', '${RWO.wo5}', 'Issued for WO-2026-005 (75 units × 3m)',           '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.rubberGasket}',   'ISSUE',      300.000, 'pcs', 'WORK_ORDER', '${RWO.wo5}', 'Issued for WO-2026-005 (75 units × 4 gaskets)',   '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.electronicComp}', 'ISSUE',     1200.000, 'pcs', 'WORK_ORDER', '${RWO.wo7}', 'Issued for WO-2026-007 (120 boards × 10 pcs)',    '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.plasticCasing}',  'ISSUE',      120.000, 'pcs', 'WORK_ORDER', '${RWO.wo7}', 'Issued for WO-2026-007 (120 boards × 1 casing)',  '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.steelRod}',       'ISSUE',       55.000, 'kg',  'WORK_ORDER', '${RWO.wo8}', 'Issued for WO-2026-008 (22 units × 2.5kg)',       '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.electronicComp}', 'ISSUE',      800.000, 'pcs', 'WORK_ORDER', '${RWO.wo9}', 'Issued for WO-2026-009 (80 boards × 10 pcs)',    '${ID.user.warehouse}'),
      -- Restocking receipts mid-period
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.steelRod}',       'RECEIPT',    400.000, 'kg',  'PURCHASE_ORDER', NULL, 'Replenishment from Hoa Phat Steel — PO#2026-0042', '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.electronicComp}', 'RECEIPT',   5000.000, 'pcs', 'PURCHASE_ORDER', NULL, 'Bulk reorder Arrow Electronics — PO#2026-0078',   '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.copperWire}',     'RECEIPT',    500.000, 'm',   'PURCHASE_ORDER', NULL, 'Cadivi copper wire reorder',                       '${ID.user.warehouse}'),
      -- Scrap from failed HV test batch
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.copperWire}',     'SCRAP',        9.000, 'm',   'QC_REJECTION',  '${RQC.q5}', 'Scrap from re-wind of 3 failed stators (3×3m)', '${ID.user.warehouse}'),
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.rubberGasket}',   'RETURN',      12.000, 'pcs', 'WORK_ORDER',    '${RWO.wo6}', 'Unused gaskets returned after WO-006 completion', '${ID.user.warehouse}'),
      -- Stock adjustment for physical count discrepancy
      (gen_random_uuid(), '${ID.factory.hcm}', '${ID.material.aluminumSheet}',  'ADJUSTMENT',   5.000, 'pcs', NULL,            NULL, 'Cycle count correction — physical=205 vs system=200', '${ID.user.warehouse}')
  `);

  console.log('✓ Report module seed data complete.');

  // ── Dashboard module: machines, throughput, active WOs, alerts ─────────────
  // Goal: populate all 4 dashboard widgets with ≥10 rows each.
  //   • 6 more machines  →  10 total, with MAINTENANCE + BREAKDOWN for alerts
  //   • 4 COMPLETED POs with actualEndDate in the last 7 days  →  throughput trend
  //   • 5 more IN_PROGRESS POs  →  10 total active work orders in the table
  //   • 8 more IN_PROGRESS WOs (10 incl. wo2 + wo8) with steps for progress bars
  //   • 3 low-stock materials  →  low-stock alerts
  //   • 3 QC FAIL/CONDITIONAL inspections in the last 7 days  →  QC alerts
  console.log('Seeding dashboard module data...');

  const DM = {
    // 6 extra machines
    machine: {
      cncMill:    'e1000000-0000-0000-0000-000000000001',
      windMach2:  'e1000000-0000-0000-0000-000000000002',
      assy1:      'e1000000-0000-0000-0000-000000000003',
      assy2:      'e1000000-0000-0000-0000-000000000004',
      hydPress2:  'e1000000-0000-0000-0000-000000000005',
      packConv:   'e1000000-0000-0000-0000-000000000006',
    },
    // 4 throughput-trend POs (COMPLETED, actualEndDate in last 7 days)
    tpo: {
      tp1: '71000000-0000-0000-0000-000000000001',
      tp2: '71000000-0000-0000-0000-000000000002',
      tp3: '71000000-0000-0000-0000-000000000003',
      tp4: '71000000-0000-0000-0000-000000000004',
    },
    // 5 IN_PROGRESS POs feeding the active-WO table
    apo: {
      ap1: '71000000-0000-0000-0000-000000000005',
      ap2: '71000000-0000-0000-0000-000000000006',
      ap3: '71000000-0000-0000-0000-000000000007',
      ap4: '71000000-0000-0000-0000-000000000008',
      ap5: '71000000-0000-0000-0000-000000000009',
    },
    // 8 new IN_PROGRESS WOs
    wo: {
      w1: '81000000-0000-0000-0000-000000000001',
      w2: '81000000-0000-0000-0000-000000000002',
      w3: '81000000-0000-0000-0000-000000000003',
      w4: '81000000-0000-0000-0000-000000000004',
      w5: '81000000-0000-0000-0000-000000000005',
      w6: '81000000-0000-0000-0000-000000000006',
      w7: '81000000-0000-0000-0000-000000000007',
      w8: '81000000-0000-0000-0000-000000000008',
    },
    // 3 low-stock materials
    mat: {
      bearing:    '41000000-0000-0000-0000-000000000001',
      nomex:      '41000000-0000-0000-0000-000000000002',
      thermal:    '41000000-0000-0000-0000-000000000003',
    },
    // 3 QC inspections in the last 7 days (FAIL / CONDITIONAL)
    qc: {
      dq1: '91000000-0000-0000-0000-000000000001',
      dq2: '91000000-0000-0000-0000-000000000002',
      dq3: '91000000-0000-0000-0000-000000000003',
    },
  };

  // ── 6 extra machines (total 10) with varied statuses ──────────────────────
  await qr.query(`
    INSERT INTO machines (
      id, "factoryId", "workCenterId", code, name, model, "serialNumber",
      status, "capacityPerHour"
    ) VALUES
      (
        '${DM.machine.cncMill}', '${ID.factory.hcm}', '${ID.workCenter.cnc}',
        'CNC-003', 'CNC Milling Center #3', 'Haas VF-2', 'HAS-2023-00984',
        'ACTIVE', 5.00
      ),
      (
        '${DM.machine.windMach2}', '${ID.factory.hcm}', '${ID.workCenter.winding}',
        'WIND-002', 'Automatic Winding Machine #2', 'MARSILLI 36N', 'MRS-2023-00217',
        'MAINTENANCE', 1.00
      ),
      (
        '${DM.machine.assy1}', '${ID.factory.hcm}', '${ID.workCenter.assembly}',
        'ASSY-001', 'Semi-Auto Assembly Cell #1', 'Yamaha YS100', 'YAM-2022-00631',
        'ACTIVE', 4.00
      ),
      (
        '${DM.machine.assy2}', '${ID.factory.hcm}', '${ID.workCenter.assembly}',
        'ASSY-002', 'Semi-Auto Assembly Cell #2', 'Yamaha YS100', 'YAM-2022-00632',
        'ACTIVE', 4.00
      ),
      (
        '${DM.machine.hydPress2}', '${ID.factory.hcm}', '${ID.workCenter.press}',
        'PRESS-002', 'Hydraulic Press 30T', 'Schuler HPM 30', 'SCH-2020-05512',
        'BREAKDOWN', 6.00
      ),
      (
        '${DM.machine.packConv}', '${ID.factory.hcm}', '${ID.workCenter.packing}',
        'PACK-001', 'Packing Conveyor Line', 'Intralox S-5700', 'ITX-2021-00388',
        'IDLE', 20.00
      )
  `);

  // ── 3 low-stock materials (currentStock < minStockLevel) ─────────────────
  await qr.query(`
    INSERT INTO materials (
      id, "factoryId", code, name, unit,
      "currentStock", "minStockLevel", "maxStockLevel",
      "warehouseId", "isActive"
    ) VALUES
      (
        '${DM.mat.bearing}', '${ID.factory.hcm}',
        'M-007', 'Bearing SKF 6205', 'pcs',
        8.000, 20.000, 200.000,
        '${ID.warehouse.main}', true
      ),
      (
        '${DM.mat.nomex}', '${ID.factory.hcm}',
        'M-008', 'Nomex Insulation Sheet 0.25mm', 'pcs',
        4.000, 15.000, 150.000,
        '${ID.warehouse.prod}', true
      ),
      (
        '${DM.mat.thermal}', '${ID.factory.hcm}',
        'M-009', 'Thermal Conductive Compound', 'kg',
        0.500, 2.000, 10.000,
        '${ID.warehouse.prod}', true
      )
  `);

  // ── 4 throughput POs — COMPLETED, actualEndDate within last 7 days ────────
  await qr.query(`
    INSERT INTO production_orders (
      id, "factoryId", code, "productName", "productId", quantity, unit, status,
      "plannedStartDate", "plannedEndDate",
      "actualStartDate",  "actualEndDate",
      "completedQuantity", "bomId", "productionLineId"
    ) VALUES
      (
        '${DM.tpo.tp1}', '${ID.factory.hcm}',
        'PO-2026-009', 'Electric Motor 3kW', '${ID.product.motor3kw}',
        35.000, 'unit', 'COMPLETED',
        '${past(14).toISOString()}', '${past(7).toISOString()}',
        '${past(13).toISOString()}', '${past(6).toISOString()}',
        35.000, '${ID.bom.motor}', '${ID.line.assembly}'
      ),
      (
        '${DM.tpo.tp2}', '${ID.factory.hcm}',
        'PO-2026-010', 'Control Circuit Board', '${ID.product.circuitBoard}',
        50.000, 'unit', 'COMPLETED',
        '${past(12).toISOString()}', '${past(5).toISOString()}',
        '${past(11).toISOString()}', '${past(4).toISOString()}',
        50.000, '${ID.bom.circuit}', '${ID.line.assembly}'
      ),
      (
        '${DM.tpo.tp3}', '${ID.factory.hcm}',
        'PO-2026-011', 'Electric Motor 3kW', '${ID.product.motor3kw}',
        45.000, 'unit', 'COMPLETED',
        '${past(10).toISOString()}', '${past(3).toISOString()}',
        '${past(9).toISOString()}',  '${past(2).toISOString()}',
        45.000, '${ID.bom.motor}', '${ID.line.assembly}'
      ),
      (
        '${DM.tpo.tp4}', '${ID.factory.hcm}',
        'PO-2026-012', 'Control Circuit Board', '${ID.product.circuitBoard}',
        30.000, 'unit', 'COMPLETED',
        '${past(8).toISOString()}',  '${past(2).toISOString()}',
        '${past(7).toISOString()}',  '${past(1).toISOString()}',
        30.000, '${ID.bom.circuit}', '${ID.line.assembly}'
      )
  `);

  // ── 5 IN_PROGRESS POs for the active-WO table ────────────────────────────
  await qr.query(`
    INSERT INTO production_orders (
      id, "factoryId", code, "productName", "productId", quantity, unit, status,
      "plannedStartDate", "plannedEndDate",
      "actualStartDate",  "actualEndDate",
      "completedQuantity", "bomId", "productionLineId"
    ) VALUES
      (
        '${DM.apo.ap1}', '${ID.factory.hcm}',
        'PO-2026-013', 'Electric Motor 3kW', '${ID.product.motor3kw}',
        80.000, 'unit', 'IN_PROGRESS',
        '${past(5).toISOString()}',  '${future(15).toISOString()}',
        '${past(5).toISOString()}',  NULL,
        28.000, '${ID.bom.motor}', '${ID.line.assembly}'
      ),
      (
        '${DM.apo.ap2}', '${ID.factory.hcm}',
        'PO-2026-014', 'Control Circuit Board', '${ID.product.circuitBoard}',
        60.000, 'unit', 'IN_PROGRESS',
        '${past(4).toISOString()}',  '${future(8).toISOString()}',
        '${past(4).toISOString()}',  NULL,
        15.000, '${ID.bom.circuit}', '${ID.line.assembly}'
      ),
      (
        '${DM.apo.ap3}', '${ID.factory.hcm}',
        'PO-2026-015', 'Electric Motor 3kW', '${ID.product.motor3kw}',
        40.000, 'unit', 'IN_PROGRESS',
        '${past(3).toISOString()}',  '${future(5).toISOString()}',
        '${past(3).toISOString()}',  NULL,
        10.000, '${ID.bom.motor}', '${ID.line.assembly}'
      ),
      (
        '${DM.apo.ap4}', '${ID.factory.hcm}',
        'PO-2026-016', 'Control Circuit Board', '${ID.product.circuitBoard}',
        90.000, 'unit', 'IN_PROGRESS',
        '${past(8).toISOString()}',  '${future(2).toISOString()}',
        '${past(8).toISOString()}',  NULL,
        72.000, '${ID.bom.circuit}', '${ID.line.assembly}'
      ),
      (
        '${DM.apo.ap5}', '${ID.factory.hcm}',
        'PO-2026-017', 'Electric Motor 3kW', '${ID.product.motor3kw}',
        55.000, 'unit', 'IN_PROGRESS',
        '${past(6).toISOString()}',  '${future(10).toISOString()}',
        '${past(6).toISOString()}',  NULL,
        30.000, '${ID.bom.motor}', '${ID.line.assembly}'
      )
  `);

  // ── 8 IN_PROGRESS work orders + steps (brings total to 10 with wo2 + wo8) ─
  await qr.query(`
    INSERT INTO work_orders (
      id, "factoryId", "productionOrderId", code, description, status,
      "assignedTo", "plannedStartDate", "plannedEndDate",
      "actualStartDate", "actualEndDate"
    ) VALUES
      (
        '${DM.wo.w1}', '${ID.factory.hcm}', '${DM.apo.ap1}',
        'WO-2026-010', 'CNC machining + winding — Motor batch 28 units',
        'IN_PROGRESS',
        '${ID.user.operator1}',
        '${past(5).toISOString()}', '${future(7).toISOString()}',
        '${past(5).toISOString()}', NULL
      ),
      (
        '${DM.wo.w2}', '${ID.factory.hcm}', '${DM.apo.ap1}',
        'WO-2026-011', 'Final assembly and HV test — Motor batch remaining',
        'IN_PROGRESS',
        '${ID.user.operator2}',
        '${past(2).toISOString()}', '${future(15).toISOString()}',
        '${past(2).toISOString()}', NULL
      ),
      (
        '${DM.wo.w3}', '${ID.factory.hcm}', '${DM.apo.ap2}',
        'WO-2026-012', 'SMD placement + reflow — PCB batch 60 boards',
        'IN_PROGRESS',
        '${ID.user.operator2}',
        '${past(4).toISOString()}', '${future(4).toISOString()}',
        '${past(4).toISOString()}', NULL
      ),
      (
        '${DM.wo.w4}', '${ID.factory.hcm}', '${DM.apo.ap3}',
        'WO-2026-013', 'Shaft machining and stator winding — Motor batch 40 units',
        'IN_PROGRESS',
        '${ID.user.operator1}',
        '${past(3).toISOString()}', '${future(5).toISOString()}',
        '${past(3).toISOString()}', NULL
      ),
      (
        '${DM.wo.w5}', '${ID.factory.hcm}', '${DM.apo.ap3}',
        'WO-2026-014', 'Press assembly and end-shield fitting',
        'IN_PROGRESS',
        NULL,
        '${past(1).toISOString()}', '${future(5).toISOString()}',
        '${past(1).toISOString()}', NULL
      ),
      (
        '${DM.wo.w6}', '${ID.factory.hcm}', '${DM.apo.ap4}',
        'WO-2026-015', 'PCB functional test + firmware flash — 90 boards',
        'IN_PROGRESS',
        '${ID.user.operator2}',
        '${past(8).toISOString()}', '${future(2).toISOString()}',
        '${past(8).toISOString()}', NULL
      ),
      (
        '${DM.wo.w7}', '${ID.factory.hcm}', '${DM.apo.ap5}',
        'WO-2026-016', 'Motor winding — 55-unit batch first pass',
        'IN_PROGRESS',
        '${ID.user.operator1}',
        '${past(6).toISOString()}', '${future(4).toISOString()}',
        '${past(6).toISOString()}', NULL
      ),
      (
        '${DM.wo.w8}', '${ID.factory.hcm}', '${DM.apo.ap5}',
        'WO-2026-017', 'Electrical wiring, terminal box, and run-in test',
        'IN_PROGRESS',
        NULL,
        '${past(2).toISOString()}', '${future(10).toISOString()}',
        '${past(2).toISOString()}', NULL
      )
  `);

  // Steps for the 8 new work orders — varied completion for meaningful progress bars
  await qr.query(`
    INSERT INTO work_order_steps (
      id, "workOrderId", "stepNumber", name,
      "estimatedMinutes", "requiredSkills", "isCompleted", "completedAt"
    ) VALUES
      -- WO-2026-010 (w1): 4 steps, 2 completed → 50%
      ('82000000-0000-0000-0000-000000000001', '${DM.wo.w1}', 1, 'Steel rod cutting to length',    30,  '{"cnc-operator"}',     true,  '${past(5).toISOString()}'),
      ('82000000-0000-0000-0000-000000000002', '${DM.wo.w1}', 2, 'CNC shaft turning and keyway',   45,  '{"cnc-operator"}',     true,  '${past(4).toISOString()}'),
      ('82000000-0000-0000-0000-000000000003', '${DM.wo.w1}', 3, 'Stator coil winding',           120,  '{"winding"}',          false, NULL),
      ('82000000-0000-0000-0000-000000000004', '${DM.wo.w1}', 4, 'Nomex insulation and lacing',    30,  '{"winding"}',          false, NULL),

      -- WO-2026-011 (w2): 3 steps, 0 completed → 0%
      ('82000000-0000-0000-0000-000000000005', '${DM.wo.w2}', 1, 'Final assembly and gasket fit',  60,  '{"assembly"}',         false, NULL),
      ('82000000-0000-0000-0000-000000000006', '${DM.wo.w2}', 2, 'Terminal wiring and torque',     50,  '{"electrical"}',       false, NULL),
      ('82000000-0000-0000-0000-000000000007', '${DM.wo.w2}', 3, 'HV withstand and run-in test',   30,  '{"qc-basic","electrical"}', false, NULL),

      -- WO-2026-012 (w3): 4 steps, 3 completed → 75%
      ('82000000-0000-0000-0000-000000000008', '${DM.wo.w3}', 1, 'Solder paste stencil application', 15, '{"assembly"}',        true,  '${past(4).toISOString()}'),
      ('82000000-0000-0000-0000-000000000009', '${DM.wo.w3}', 2, 'SMD component pick and place',    45,  '{"assembly"}',        true,  '${past(3).toISOString()}'),
      ('82000000-0000-0000-0000-00000000000a', '${DM.wo.w3}', 3, 'Reflow soldering profile',        20,  '{"assembly"}',        true,  '${past(2).toISOString()}'),
      ('82000000-0000-0000-0000-00000000000b', '${DM.wo.w3}', 4, 'Functional test and firmware',    20,  '{"qc-basic"}',        false, NULL),

      -- WO-2026-013 (w4): 3 steps, 1 completed → 33%
      ('82000000-0000-0000-0000-00000000000c', '${DM.wo.w4}', 1, 'CNC shaft machining',             30,  '{"cnc-operator"}',    true,  '${past(3).toISOString()}'),
      ('82000000-0000-0000-0000-00000000000d', '${DM.wo.w4}', 2, 'Stator coil winding 48 slots',   120,  '{"winding"}',         false, NULL),
      ('82000000-0000-0000-0000-00000000000e', '${DM.wo.w4}', 3, 'Rotor press and bearing fit',     60,  '{"press-operator"}',  false, NULL),

      -- WO-2026-014 (w5): 3 steps, 1 completed → 33%
      ('82000000-0000-0000-0000-00000000000f', '${DM.wo.w5}', 1, 'Bearing press onto shaft',        45,  '{"press-operator"}',  true,  '${past(1).toISOString()}'),
      ('82000000-0000-0000-0000-000000000010', '${DM.wo.w5}', 2, 'End-shield fitting and bolting',  40,  '{"assembly"}',        false, NULL),
      ('82000000-0000-0000-0000-000000000011', '${DM.wo.w5}', 3, 'Rubber gasket sealing check',     15,  '{"assembly"}',        false, NULL),

      -- WO-2026-015 (w6): 4 steps, 3 completed → 75%
      ('82000000-0000-0000-0000-000000000012', '${DM.wo.w6}', 1, 'Power-on self-test (POST)',        10,  '{"qc-basic"}',        true,  '${past(7).toISOString()}'),
      ('82000000-0000-0000-0000-000000000013', '${DM.wo.w6}', 2, 'Firmware flash v2.1.3 via JTAG',  15,  '{"qc-basic"}',        true,  '${past(6).toISOString()}'),
      ('82000000-0000-0000-0000-000000000014', '${DM.wo.w6}', 3, 'RS485 communication validation',  10,  '{"qc-basic"}',        true,  '${past(5).toISOString()}'),
      ('82000000-0000-0000-0000-000000000015', '${DM.wo.w6}', 4, 'Label, bag, and box for shipping', 10, '{"picker"}',          false, NULL),

      -- WO-2026-016 (w7): 4 steps, 2 completed → 50%
      ('82000000-0000-0000-0000-000000000016', '${DM.wo.w7}', 1, 'Pre-cut wire and strip ends',     20,  '{"electrical"}',      true,  '${past(6).toISOString()}'),
      ('82000000-0000-0000-0000-000000000017', '${DM.wo.w7}', 2, 'Stator winding — phase A',       120,  '{"winding"}',         true,  '${past(4).toISOString()}'),
      ('82000000-0000-0000-0000-000000000018', '${DM.wo.w7}', 3, 'Stator winding — phases B & C',  120,  '{"winding"}',         false, NULL),
      ('82000000-0000-0000-0000-000000000019', '${DM.wo.w7}', 4, 'Varnish impregnation and cure',   60,  '{"winding"}',         false, NULL),

      -- WO-2026-017 (w8): 3 steps, 1 completed → 33%
      ('82000000-0000-0000-0000-00000000001a', '${DM.wo.w8}', 1, 'Connect stator leads to terminal box', 50, '{"electrical"}',  true,  '${past(2).toISOString()}'),
      ('82000000-0000-0000-0000-00000000001b', '${DM.wo.w8}', 2, 'No-load run-in test 30 min',      30,  '{"electrical","qc-basic"}', false, NULL),
      ('82000000-0000-0000-0000-00000000001c', '${DM.wo.w8}', 3, 'Vibration and current logging',   20,  '{"qc-basic"}',        false, NULL)
  `);

  // ── 3 QC inspections in the last 7 days (for alerts panel) ───────────────
  await qr.query(`
    INSERT INTO qc_inspections (
      id, "factoryId", "workOrderId", "productionOrderId", "inspectorId",
      "inspectedAt", "sampleSize", "passedCount", "failedCount", result, notes
    ) VALUES
      (
        '${DM.qc.dq1}', '${ID.factory.hcm}', '${DM.wo.w1}', '${DM.apo.ap1}',
        '${ID.user.qcInspector}',
        '${past(5).toISOString()}',
        14, 11, 3, 'FAIL',
        '3 of 14 shafts had diameter 27.97mm — below 28.00mm±0.02mm tolerance. CNC tool wear suspected.'
      ),
      (
        '${DM.qc.dq2}', '${ID.factory.hcm}', '${DM.wo.w3}', '${DM.apo.ap2}',
        '${ID.user.qcInspector}',
        '${past(2).toISOString()}',
        30, 28, 2, 'CONDITIONAL',
        '2 boards with lifted pads on C12 capacitor. Manually reworked and re-tested. Approved for next stage.'
      ),
      (
        '${DM.qc.dq3}', '${ID.factory.hcm}', '${DM.wo.w6}', '${DM.apo.ap4}',
        '${ID.user.qcInspector}',
        '${past(1).toISOString()}',
        45, 40, 5, 'FAIL',
        '5 boards failed RS485 loopback test at 115200 baud after firmware flash. USB-JTAG fixture pin fault.'
      )
  `);

  await qr.query(`
    INSERT INTO qc_defects (
      id, "inspectionId", code, description, severity, quantity,
      "rootCause", "correctiveAction"
    ) VALUES
      (
        'a2000000-0000-0000-0000-000000000001', '${DM.qc.dq1}',
        'DEF-SHAFT-001', 'Shaft OD undersize — 27.97mm vs 28.00mm nominal',
        'MAJOR', 3,
        'CNC tool wear — insert not replaced at 200-part interval',
        'Replace cutting insert. 100% diameter check on remaining batch. Update tooling PM schedule.'
      ),
      (
        'a2000000-0000-0000-0000-000000000002', '${DM.qc.dq2}',
        'DEF-PAD-001', 'Lifted pad on C12 100nF capacitor',
        'MINOR', 2,
        'Excessive rework temperature from prior manual touch-up on adjacent component',
        'Rework affected boards with hot-air pencil. Brief operator on maximum touch-up temperature (300°C, 3s).'
      ),
      (
        'a2000000-0000-0000-0000-000000000003', '${DM.qc.dq3}',
        'DEF-JTAG-001', 'RS485 comm failure post firmware flash',
        'MAJOR', 5,
        'USB-JTAG programming fixture pin 7 intermittent — flash sequence incomplete on affected boards',
        'Replace programming fixture pin. Re-flash 5 boards. Add post-flash comm verify to automated test script.'
      )
  `);

  console.log('✓ Dashboard module seed data complete.');

  await qr.release();
  await AppDataSource.destroy();
  console.log('✓ Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
