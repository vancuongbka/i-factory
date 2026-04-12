/**
 * Typed API client — all requests go through here, do NOT fetch URLs directly in components.
 * Uses types from @i-factory/api-types to ensure type safety.
 */

import type {
  ProductCategoryResponse,
  UomResponse,
  ProductResponse,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
  CreateUomDto,
  UpdateUomDto,
  CreateProductDto,
  UpdateProductDto,
} from '@i-factory/api-types';
import type {
  WorkCenterResponse,
  MachineResponse,
  SkillResponse,
  CreateWorkCenterDto,
  UpdateWorkCenterDto,
  CreateMachineDto,
  UpdateMachineDto,
  CreateSkillDto,
  UpdateSkillDto,
} from '@i-factory/api-types';
import type {
  RoutingResponse,
  RoutingOperationResponse,
  CreateRoutingDto,
  UpdateRoutingDto,
  CreateRoutingOperationDto,
  UpdateRoutingOperationDto,
} from '@i-factory/api-types';
import type {
  ErpSyncPayload,
  ErpSyncJobResponse,
} from '@i-factory/api-types';
import type {
  BomResponse,
  BomRevisionResponse,
  CreateBomV2Dto,
  UpdateBomV2Dto,
  AddBomItemDto,
  CreateBomRevisionDto,
} from '@i-factory/api-types';
import type {
  WorkOrderResponse,
  CreateWorkOrderDto,
  ProductionOrderResponse,
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  UserResponse,
  CreateUserDto,
  UpdateUserDto,
  MaterialResponse,
  CreateMaterialDto,
  UpdateMaterialDto,
  StockMovementResponse,
  CreateStockMovementDto,
  QCInspectionResponse,
  CreateQCInspectionDto,
  UpdateQCInspectionDto,
  CreateDefectDto,
  QCDefectResponse,
} from '@i-factory/api-types';

export interface WorkOrderStep {
  id: string;
  workOrderId: string;
  stepNumber: number;
  name: string;
  description?: string;
  estimatedMinutes?: number;
  requiredSkills: string[];
  workCenterId?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export type WorkOrderWithSteps = WorkOrderResponse & { steps: WorkOrderStep[] };

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const TOKEN_KEY = 'ifactory_token';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: response.statusText }))) as { message?: string };
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  const json = (await response.json()) as { data: T };
  return json.data;
}

export const apiClient = {
  factories: {
    list: () => request<unknown[]>('/factories', {}),
  },
  users: {
    list: () => request<UserResponse[]>('/users', {}),
    get: (id: string) => request<UserResponse>(`/users/${id}`, {}),
    create: (body: CreateUserDto) =>
      request<UserResponse>('/users', { method: 'POST', body: JSON.stringify(body)}),
    update: (id: string, body: UpdateUserDto) =>
      request<UserResponse>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body)}),
    remove: (id: string) =>
      request<void>(`/users/${id}`, { method: 'DELETE'}),
  },
  production: {
    list: (factoryId: string) =>
      request<ProductionOrderResponse[]>(`/factories/${factoryId}/production`, {}),
    get: (factoryId: string, id: string) =>
      request<ProductionOrderResponse>(`/factories/${factoryId}/production/${id}`, {}),
    create: (factoryId: string, body: CreateProductionOrderDto) =>
      request<ProductionOrderResponse>(`/factories/${factoryId}/production`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (factoryId: string, id: string, body: UpdateProductionOrderDto) =>
      request<ProductionOrderResponse>(`/factories/${factoryId}/production/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    remove: (factoryId: string, id: string) =>
      request<void>(`/factories/${factoryId}/production/${id}`, { method: 'DELETE'}),
  },
  workOrders: {
    list: (factoryId: string) =>
      request<WorkOrderWithSteps[]>(`/factories/${factoryId}/work-orders`, {}),
    get: (factoryId: string, id: string) =>
      request<WorkOrderWithSteps>(`/factories/${factoryId}/work-orders/${id}`, {}),
    create: (factoryId: string, body: CreateWorkOrderDto) =>
      request<WorkOrderWithSteps>(`/factories/${factoryId}/work-orders`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    createFromRouting: (
      factoryId: string,
      productionOrderId: string,
      body: CreateWorkOrderDto,
      
    ) =>
      request<WorkOrderWithSteps>(
        `/factories/${factoryId}/work-orders/${productionOrderId}/from-routing`,
        { method: 'POST', body: JSON.stringify(body)},
      ),
  },
  inventory: {
    materials: {
      list: (factoryId: string) =>
        request<MaterialResponse[]>(`/factories/${factoryId}/inventory/materials`, {}),
      get: (factoryId: string, id: string) =>
        request<MaterialResponse>(`/factories/${factoryId}/inventory/materials/${id}`, {}),
      create: (factoryId: string, body: CreateMaterialDto) =>
        request<MaterialResponse>(`/factories/${factoryId}/inventory/materials`, {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      update: (factoryId: string, id: string, body: UpdateMaterialDto) =>
        request<MaterialResponse>(`/factories/${factoryId}/inventory/materials/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      remove: (factoryId: string, id: string) =>
        request<void>(`/factories/${factoryId}/inventory/materials/${id}`, {
          method: 'DELETE',
        }),
      lowStock: (factoryId: string) =>
        request<MaterialResponse[]>(`/factories/${factoryId}/inventory/low-stock`, {}),
    },
    movements: {
      list: (factoryId: string, materialId?: string) => {
        const qs = materialId ? `?materialId=${materialId}` : '';
        return request<StockMovementResponse[]>(
          `/factories/${factoryId}/inventory/movements${qs}`,
          {},
        );
      },
      record: (factoryId: string, body: CreateStockMovementDto) =>
        request<StockMovementResponse>(`/factories/${factoryId}/inventory/movements`, {
          method: 'POST',
          body: JSON.stringify(body),
        }),
    },
  },
  qc: {
    inspections: {
      list: (factoryId: string) =>
        request<QCInspectionResponse[]>(`/factories/${factoryId}/qc/inspections`, {}),
      get: (factoryId: string, id: string) =>
        request<QCInspectionResponse>(`/factories/${factoryId}/qc/inspections/${id}`, {}),
      create: (factoryId: string, body: CreateQCInspectionDto) =>
        request<QCInspectionResponse>(`/factories/${factoryId}/qc/inspections`, {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      update: (factoryId: string, id: string, body: UpdateQCInspectionDto) =>
        request<QCInspectionResponse>(`/factories/${factoryId}/qc/inspections/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      remove: (factoryId: string, id: string) =>
        request<void>(`/factories/${factoryId}/qc/inspections/${id}`, {
          method: 'DELETE',
        }),
      addDefect: (factoryId: string, id: string, body: CreateDefectDto) =>
        request<QCDefectResponse>(`/factories/${factoryId}/qc/inspections/${id}/defects`, {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      approve: (factoryId: string, id: string) =>
        request<QCInspectionResponse>(`/factories/${factoryId}/qc/inspections/${id}/approve`, {
          method: 'PATCH',
        }),
      reject: (factoryId: string, id: string) =>
        request<QCInspectionResponse>(`/factories/${factoryId}/qc/inspections/${id}/reject`, {
          method: 'PATCH',
        }),
    },
  },
  reports: {
    request: (body: unknown) =>
      request<unknown>('/reports', { method: 'POST', body: JSON.stringify(body)}),
    status: (jobId: string) =>
      request<unknown>(`/reports/${jobId}/status`, {}),
  },
  notifications: {
    list: (factoryId: string) =>
      request<unknown[]>(`/factories/${factoryId}/notifications`, {}),
  },

  // ── Master Data ───────────────────────────────────────────────────────────────

  masterData: {
    products: {
      list: (factoryId: string) =>
        request<ProductResponse[]>(`/factories/${factoryId}/master-data/products`, {}),
      get: (factoryId: string, id: string) =>
        request<ProductResponse>(`/factories/${factoryId}/master-data/products/${id}`, {}),
      create: (factoryId: string, body: CreateProductDto) =>
        request<ProductResponse>(`/factories/${factoryId}/master-data/products`, {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      update: (factoryId: string, id: string, body: UpdateProductDto) =>
        request<ProductResponse>(`/factories/${factoryId}/master-data/products/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      remove: (factoryId: string, id: string) =>
        request<void>(`/factories/${factoryId}/master-data/products/${id}`, {
          method: 'DELETE',
        }),
    },

    categories: {
      list: (factoryId: string) =>
        request<ProductCategoryResponse[]>(`/factories/${factoryId}/master-data/categories`, {}),
      create: (factoryId: string, body: CreateProductCategoryDto) =>
        request<ProductCategoryResponse>(`/factories/${factoryId}/master-data/categories`, {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      update: (factoryId: string, id: string, body: UpdateProductCategoryDto) =>
        request<ProductCategoryResponse>(`/factories/${factoryId}/master-data/categories/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      remove: (factoryId: string, id: string) =>
        request<void>(`/factories/${factoryId}/master-data/categories/${id}`, {
          method: 'DELETE',
        }),
    },

    uoms: {
      list: (factoryId: string) =>
        request<UomResponse[]>(`/factories/${factoryId}/master-data/uoms`, {}),
      create: (factoryId: string, body: CreateUomDto) =>
        request<UomResponse>(`/factories/${factoryId}/master-data/uoms`, {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      update: (factoryId: string, id: string, body: UpdateUomDto) =>
        request<UomResponse>(`/factories/${factoryId}/master-data/uoms/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      remove: (factoryId: string, id: string) =>
        request<void>(`/factories/${factoryId}/master-data/uoms/${id}`, {
          method: 'DELETE',
        }),
    },

    workCenters: {
      list: (factoryId: string) =>
        request<WorkCenterResponse[]>(`/factories/${factoryId}/master-data/work-centers`, {}),
      get: (factoryId: string, id: string) =>
        request<WorkCenterResponse>(`/factories/${factoryId}/master-data/work-centers/${id}`, {}),
      create: (factoryId: string, body: CreateWorkCenterDto) =>
        request<WorkCenterResponse>(`/factories/${factoryId}/master-data/work-centers`, {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      update: (factoryId: string, id: string, body: UpdateWorkCenterDto) =>
        request<WorkCenterResponse>(`/factories/${factoryId}/master-data/work-centers/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      remove: (factoryId: string, id: string) =>
        request<void>(`/factories/${factoryId}/master-data/work-centers/${id}`, {
          method: 'DELETE',
        }),
    },

    machines: {
      list: (factoryId: string, workCenterId: string) =>
        request<MachineResponse[]>(
          `/factories/${factoryId}/master-data/work-centers/${workCenterId}/machines`,
          {},
        ),
      create: (factoryId: string, workCenterId: string, body: CreateMachineDto) =>
        request<MachineResponse>(
          `/factories/${factoryId}/master-data/work-centers/${workCenterId}/machines`,
          { method: 'POST', body: JSON.stringify(body)},
        ),
      update: (factoryId: string, workCenterId: string, id: string, body: UpdateMachineDto) =>
        request<MachineResponse>(
          `/factories/${factoryId}/master-data/work-centers/${workCenterId}/machines/${id}`,
          { method: 'PATCH', body: JSON.stringify(body)},
        ),
      remove: (factoryId: string, workCenterId: string, id: string) =>
        request<void>(
          `/factories/${factoryId}/master-data/work-centers/${workCenterId}/machines/${id}`,
          { method: 'DELETE'},
        ),
    },

    skills: {
      list: (factoryId: string) =>
        request<SkillResponse[]>(`/factories/${factoryId}/master-data/skills`, {}),
      create: (factoryId: string, body: CreateSkillDto) =>
        request<SkillResponse>(`/factories/${factoryId}/master-data/skills`, {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      update: (factoryId: string, id: string, body: UpdateSkillDto) =>
        request<SkillResponse>(`/factories/${factoryId}/master-data/skills/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      remove: (factoryId: string, id: string) =>
        request<void>(`/factories/${factoryId}/master-data/skills/${id}`, {
          method: 'DELETE',
        }),
    },

    routings: {
      list: (factoryId: string) =>
        request<RoutingResponse[]>(`/factories/${factoryId}/master-data/routings`, {}),
      get: (factoryId: string, id: string) =>
        request<RoutingResponse & { operations: RoutingOperationResponse[] }>(
          `/factories/${factoryId}/master-data/routings/${id}`,
          {},
        ),
      create: (factoryId: string, body: CreateRoutingDto) =>
        request<RoutingResponse>(`/factories/${factoryId}/master-data/routings`, {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      update: (factoryId: string, id: string, body: UpdateRoutingDto) =>
        request<RoutingResponse>(`/factories/${factoryId}/master-data/routings/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      remove: (factoryId: string, id: string) =>
        request<void>(`/factories/${factoryId}/master-data/routings/${id}`, {
          method: 'DELETE',
        }),
      addOperation: (factoryId: string, id: string, body: CreateRoutingOperationDto) =>
        request<RoutingOperationResponse>(
          `/factories/${factoryId}/master-data/routings/${id}/operations`,
          { method: 'POST', body: JSON.stringify(body)},
        ),
      updateOperation: (
        factoryId: string,
        id: string,
        opId: string,
        body: UpdateRoutingOperationDto,
        
      ) =>
        request<RoutingOperationResponse>(
          `/factories/${factoryId}/master-data/routings/${id}/operations/${opId}`,
          { method: 'PATCH', body: JSON.stringify(body)},
        ),
      removeOperation: (factoryId: string, id: string, opId: string) =>
        request<void>(
          `/factories/${factoryId}/master-data/routings/${id}/operations/${opId}`,
          { method: 'DELETE'},
        ),
    },

    erpSync: {
      trigger: (factoryId: string, body: ErpSyncPayload) =>
        request<ErpSyncJobResponse>(`/factories/${factoryId}/master-data/erp-sync`, {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      status: (factoryId: string, jobId: string) =>
        request<ErpSyncJobResponse>(
          `/factories/${factoryId}/master-data/erp-sync/status/${jobId}`,
          {},
        ),
    },
  },

  // ── BOM (extended) ────────────────────────────────────────────────────────────

  bom: {
    list: (factoryId: string) =>
      request<BomResponse[]>(`/factories/${factoryId}/bom`, {}),
    get: (factoryId: string, id: string) =>
      request<BomResponse>(`/factories/${factoryId}/bom/${id}`, {}),
    create: (factoryId: string, body: CreateBomV2Dto) =>
      request<BomResponse>(`/factories/${factoryId}/bom`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (factoryId: string, id: string, body: UpdateBomV2Dto) =>
      request<BomResponse>(`/factories/${factoryId}/bom/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    remove: (factoryId: string, id: string) =>
      request<void>(`/factories/${factoryId}/bom/${id}`, { method: 'DELETE'}),
    addItem: (factoryId: string, id: string, body: AddBomItemDto) =>
      request<unknown>(`/factories/${factoryId}/bom/${id}/items`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateItem: (factoryId: string, id: string, itemId: string, body: Partial<AddBomItemDto>) =>
      request<unknown>(`/factories/${factoryId}/bom/${id}/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    removeItem: (factoryId: string, id: string, itemId: string) =>
      request<void>(`/factories/${factoryId}/bom/${id}/items/${itemId}`, {
        method: 'DELETE',
      }),
    revisions: (factoryId: string, id: string) =>
      request<BomRevisionResponse[]>(`/factories/${factoryId}/bom/${id}/revisions`, {}),
    revise: (factoryId: string, id: string, body: CreateBomRevisionDto) =>
      request<BomRevisionResponse>(`/factories/${factoryId}/bom/${id}/revise`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
};
