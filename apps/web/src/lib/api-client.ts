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

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...init } = options;

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: response.statusText }))) as { message?: string };
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  const json = (await response.json()) as { data: T };
  return json.data;
}

export const apiClient = {
  factories: {
    list: (token?: string) => request<unknown[]>('/factories', { token }),
  },
  users: {
    list: (token?: string) => request<UserResponse[]>('/users', { token }),
    get: (id: string, token?: string) => request<UserResponse>(`/users/${id}`, { token }),
    create: (body: CreateUserDto, token?: string) =>
      request<UserResponse>('/users', { method: 'POST', body: JSON.stringify(body), token }),
    update: (id: string, body: UpdateUserDto, token?: string) =>
      request<UserResponse>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body), token }),
    remove: (id: string, token?: string) =>
      request<void>(`/users/${id}`, { method: 'DELETE', token }),
  },
  production: {
    list: (factoryId: string, token?: string) =>
      request<ProductionOrderResponse[]>(`/factories/${factoryId}/production`, { token }),
    get: (factoryId: string, id: string, token?: string) =>
      request<ProductionOrderResponse>(`/factories/${factoryId}/production/${id}`, { token }),
    create: (factoryId: string, body: CreateProductionOrderDto, token?: string) =>
      request<ProductionOrderResponse>(`/factories/${factoryId}/production`, {
        method: 'POST',
        body: JSON.stringify(body),
        token,
      }),
    update: (factoryId: string, id: string, body: UpdateProductionOrderDto, token?: string) =>
      request<ProductionOrderResponse>(`/factories/${factoryId}/production/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        token,
      }),
    remove: (factoryId: string, id: string, token?: string) =>
      request<void>(`/factories/${factoryId}/production/${id}`, { method: 'DELETE', token }),
  },
  workOrders: {
    list: (factoryId: string, token?: string) =>
      request<WorkOrderWithSteps[]>(`/factories/${factoryId}/work-orders`, { token }),
    get: (factoryId: string, id: string, token?: string) =>
      request<WorkOrderWithSteps>(`/factories/${factoryId}/work-orders/${id}`, { token }),
    create: (factoryId: string, body: CreateWorkOrderDto, token?: string) =>
      request<WorkOrderWithSteps>(`/factories/${factoryId}/work-orders`, {
        method: 'POST',
        body: JSON.stringify(body),
        token,
      }),
    createFromRouting: (
      factoryId: string,
      productionOrderId: string,
      body: CreateWorkOrderDto,
      token?: string,
    ) =>
      request<WorkOrderWithSteps>(
        `/factories/${factoryId}/work-orders/${productionOrderId}/from-routing`,
        { method: 'POST', body: JSON.stringify(body), token },
      ),
  },
  inventory: {
    materials: {
      list: (factoryId: string, token?: string) =>
        request<MaterialResponse[]>(`/factories/${factoryId}/inventory/materials`, { token }),
      get: (factoryId: string, id: string, token?: string) =>
        request<MaterialResponse>(`/factories/${factoryId}/inventory/materials/${id}`, { token }),
      create: (factoryId: string, body: CreateMaterialDto, token?: string) =>
        request<MaterialResponse>(`/factories/${factoryId}/inventory/materials`, {
          method: 'POST',
          body: JSON.stringify(body),
          token,
        }),
      update: (factoryId: string, id: string, body: UpdateMaterialDto, token?: string) =>
        request<MaterialResponse>(`/factories/${factoryId}/inventory/materials/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
          token,
        }),
      remove: (factoryId: string, id: string, token?: string) =>
        request<void>(`/factories/${factoryId}/inventory/materials/${id}`, {
          method: 'DELETE',
          token,
        }),
      lowStock: (factoryId: string, token?: string) =>
        request<MaterialResponse[]>(`/factories/${factoryId}/inventory/low-stock`, { token }),
    },
    movements: {
      list: (factoryId: string, materialId?: string, token?: string) => {
        const qs = materialId ? `?materialId=${materialId}` : '';
        return request<StockMovementResponse[]>(
          `/factories/${factoryId}/inventory/movements${qs}`,
          { token },
        );
      },
      record: (factoryId: string, body: CreateStockMovementDto, token?: string) =>
        request<StockMovementResponse>(`/factories/${factoryId}/inventory/movements`, {
          method: 'POST',
          body: JSON.stringify(body),
          token,
        }),
    },
  },
  qc: {
    inspections: {
      list: (factoryId: string, token?: string) =>
        request<QCInspectionResponse[]>(`/factories/${factoryId}/qc/inspections`, { token }),
      get: (factoryId: string, id: string, token?: string) =>
        request<QCInspectionResponse>(`/factories/${factoryId}/qc/inspections/${id}`, { token }),
      create: (factoryId: string, body: CreateQCInspectionDto, token?: string) =>
        request<QCInspectionResponse>(`/factories/${factoryId}/qc/inspections`, {
          method: 'POST',
          body: JSON.stringify(body),
          token,
        }),
      update: (factoryId: string, id: string, body: UpdateQCInspectionDto, token?: string) =>
        request<QCInspectionResponse>(`/factories/${factoryId}/qc/inspections/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
          token,
        }),
      remove: (factoryId: string, id: string, token?: string) =>
        request<void>(`/factories/${factoryId}/qc/inspections/${id}`, {
          method: 'DELETE',
          token,
        }),
      addDefect: (factoryId: string, id: string, body: CreateDefectDto, token?: string) =>
        request<QCDefectResponse>(`/factories/${factoryId}/qc/inspections/${id}/defects`, {
          method: 'POST',
          body: JSON.stringify(body),
          token,
        }),
      approve: (factoryId: string, id: string, token?: string) =>
        request<QCInspectionResponse>(`/factories/${factoryId}/qc/inspections/${id}/approve`, {
          method: 'PATCH',
          token,
        }),
      reject: (factoryId: string, id: string, token?: string) =>
        request<QCInspectionResponse>(`/factories/${factoryId}/qc/inspections/${id}/reject`, {
          method: 'PATCH',
          token,
        }),
    },
  },
  reports: {
    request: (body: unknown, token?: string) =>
      request<unknown>('/reports', { method: 'POST', body: JSON.stringify(body), token }),
    status: (jobId: string, token?: string) =>
      request<unknown>(`/reports/${jobId}/status`, { token }),
  },
  notifications: {
    list: (factoryId: string, token?: string) =>
      request<unknown[]>(`/factories/${factoryId}/notifications`, { token }),
  },

  // ── Master Data ───────────────────────────────────────────────────────────────

  masterData: {
    products: {
      list: (factoryId: string, token?: string) =>
        request<ProductResponse[]>(`/factories/${factoryId}/master-data/products`, { token }),
      get: (factoryId: string, id: string, token?: string) =>
        request<ProductResponse>(`/factories/${factoryId}/master-data/products/${id}`, { token }),
      create: (factoryId: string, body: CreateProductDto, token?: string) =>
        request<ProductResponse>(`/factories/${factoryId}/master-data/products`, {
          method: 'POST',
          body: JSON.stringify(body),
          token,
        }),
      update: (factoryId: string, id: string, body: UpdateProductDto, token?: string) =>
        request<ProductResponse>(`/factories/${factoryId}/master-data/products/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
          token,
        }),
      remove: (factoryId: string, id: string, token?: string) =>
        request<void>(`/factories/${factoryId}/master-data/products/${id}`, {
          method: 'DELETE',
          token,
        }),
    },

    categories: {
      list: (factoryId: string, token?: string) =>
        request<ProductCategoryResponse[]>(`/factories/${factoryId}/master-data/categories`, { token }),
      create: (factoryId: string, body: CreateProductCategoryDto, token?: string) =>
        request<ProductCategoryResponse>(`/factories/${factoryId}/master-data/categories`, {
          method: 'POST',
          body: JSON.stringify(body),
          token,
        }),
      update: (factoryId: string, id: string, body: UpdateProductCategoryDto, token?: string) =>
        request<ProductCategoryResponse>(`/factories/${factoryId}/master-data/categories/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
          token,
        }),
      remove: (factoryId: string, id: string, token?: string) =>
        request<void>(`/factories/${factoryId}/master-data/categories/${id}`, {
          method: 'DELETE',
          token,
        }),
    },

    uoms: {
      list: (factoryId: string, token?: string) =>
        request<UomResponse[]>(`/factories/${factoryId}/master-data/uoms`, { token }),
      create: (factoryId: string, body: CreateUomDto, token?: string) =>
        request<UomResponse>(`/factories/${factoryId}/master-data/uoms`, {
          method: 'POST',
          body: JSON.stringify(body),
          token,
        }),
      update: (factoryId: string, id: string, body: UpdateUomDto, token?: string) =>
        request<UomResponse>(`/factories/${factoryId}/master-data/uoms/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
          token,
        }),
      remove: (factoryId: string, id: string, token?: string) =>
        request<void>(`/factories/${factoryId}/master-data/uoms/${id}`, {
          method: 'DELETE',
          token,
        }),
    },

    workCenters: {
      list: (factoryId: string, token?: string) =>
        request<WorkCenterResponse[]>(`/factories/${factoryId}/master-data/work-centers`, { token }),
      get: (factoryId: string, id: string, token?: string) =>
        request<WorkCenterResponse>(`/factories/${factoryId}/master-data/work-centers/${id}`, { token }),
      create: (factoryId: string, body: CreateWorkCenterDto, token?: string) =>
        request<WorkCenterResponse>(`/factories/${factoryId}/master-data/work-centers`, {
          method: 'POST',
          body: JSON.stringify(body),
          token,
        }),
      update: (factoryId: string, id: string, body: UpdateWorkCenterDto, token?: string) =>
        request<WorkCenterResponse>(`/factories/${factoryId}/master-data/work-centers/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
          token,
        }),
      remove: (factoryId: string, id: string, token?: string) =>
        request<void>(`/factories/${factoryId}/master-data/work-centers/${id}`, {
          method: 'DELETE',
          token,
        }),
    },

    machines: {
      list: (factoryId: string, workCenterId: string, token?: string) =>
        request<MachineResponse[]>(
          `/factories/${factoryId}/master-data/work-centers/${workCenterId}/machines`,
          { token },
        ),
      create: (factoryId: string, workCenterId: string, body: CreateMachineDto, token?: string) =>
        request<MachineResponse>(
          `/factories/${factoryId}/master-data/work-centers/${workCenterId}/machines`,
          { method: 'POST', body: JSON.stringify(body), token },
        ),
      update: (factoryId: string, workCenterId: string, id: string, body: UpdateMachineDto, token?: string) =>
        request<MachineResponse>(
          `/factories/${factoryId}/master-data/work-centers/${workCenterId}/machines/${id}`,
          { method: 'PATCH', body: JSON.stringify(body), token },
        ),
      remove: (factoryId: string, workCenterId: string, id: string, token?: string) =>
        request<void>(
          `/factories/${factoryId}/master-data/work-centers/${workCenterId}/machines/${id}`,
          { method: 'DELETE', token },
        ),
    },

    skills: {
      list: (factoryId: string, token?: string) =>
        request<SkillResponse[]>(`/factories/${factoryId}/master-data/skills`, { token }),
      create: (factoryId: string, body: CreateSkillDto, token?: string) =>
        request<SkillResponse>(`/factories/${factoryId}/master-data/skills`, {
          method: 'POST',
          body: JSON.stringify(body),
          token,
        }),
      update: (factoryId: string, id: string, body: UpdateSkillDto, token?: string) =>
        request<SkillResponse>(`/factories/${factoryId}/master-data/skills/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
          token,
        }),
      remove: (factoryId: string, id: string, token?: string) =>
        request<void>(`/factories/${factoryId}/master-data/skills/${id}`, {
          method: 'DELETE',
          token,
        }),
    },

    routings: {
      list: (factoryId: string, token?: string) =>
        request<RoutingResponse[]>(`/factories/${factoryId}/master-data/routings`, { token }),
      get: (factoryId: string, id: string, token?: string) =>
        request<RoutingResponse & { operations: RoutingOperationResponse[] }>(
          `/factories/${factoryId}/master-data/routings/${id}`,
          { token },
        ),
      create: (factoryId: string, body: CreateRoutingDto, token?: string) =>
        request<RoutingResponse>(`/factories/${factoryId}/master-data/routings`, {
          method: 'POST',
          body: JSON.stringify(body),
          token,
        }),
      update: (factoryId: string, id: string, body: UpdateRoutingDto, token?: string) =>
        request<RoutingResponse>(`/factories/${factoryId}/master-data/routings/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
          token,
        }),
      remove: (factoryId: string, id: string, token?: string) =>
        request<void>(`/factories/${factoryId}/master-data/routings/${id}`, {
          method: 'DELETE',
          token,
        }),
      addOperation: (factoryId: string, id: string, body: CreateRoutingOperationDto, token?: string) =>
        request<RoutingOperationResponse>(
          `/factories/${factoryId}/master-data/routings/${id}/operations`,
          { method: 'POST', body: JSON.stringify(body), token },
        ),
      updateOperation: (
        factoryId: string,
        id: string,
        opId: string,
        body: UpdateRoutingOperationDto,
        token?: string,
      ) =>
        request<RoutingOperationResponse>(
          `/factories/${factoryId}/master-data/routings/${id}/operations/${opId}`,
          { method: 'PATCH', body: JSON.stringify(body), token },
        ),
      removeOperation: (factoryId: string, id: string, opId: string, token?: string) =>
        request<void>(
          `/factories/${factoryId}/master-data/routings/${id}/operations/${opId}`,
          { method: 'DELETE', token },
        ),
    },

    erpSync: {
      trigger: (factoryId: string, body: ErpSyncPayload, token?: string) =>
        request<ErpSyncJobResponse>(`/factories/${factoryId}/master-data/erp-sync`, {
          method: 'POST',
          body: JSON.stringify(body),
          token,
        }),
      status: (factoryId: string, jobId: string, token?: string) =>
        request<ErpSyncJobResponse>(
          `/factories/${factoryId}/master-data/erp-sync/status/${jobId}`,
          { token },
        ),
    },
  },

  // ── BOM (extended) ────────────────────────────────────────────────────────────

  bom: {
    list: (factoryId: string, token?: string) =>
      request<BomResponse[]>(`/factories/${factoryId}/bom`, { token }),
    get: (factoryId: string, id: string, token?: string) =>
      request<BomResponse>(`/factories/${factoryId}/bom/${id}`, { token }),
    create: (factoryId: string, body: CreateBomV2Dto, token?: string) =>
      request<BomResponse>(`/factories/${factoryId}/bom`, {
        method: 'POST',
        body: JSON.stringify(body),
        token,
      }),
    update: (factoryId: string, id: string, body: UpdateBomV2Dto, token?: string) =>
      request<BomResponse>(`/factories/${factoryId}/bom/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        token,
      }),
    remove: (factoryId: string, id: string, token?: string) =>
      request<void>(`/factories/${factoryId}/bom/${id}`, { method: 'DELETE', token }),
    addItem: (factoryId: string, id: string, body: AddBomItemDto, token?: string) =>
      request<unknown>(`/factories/${factoryId}/bom/${id}/items`, {
        method: 'POST',
        body: JSON.stringify(body),
        token,
      }),
    updateItem: (factoryId: string, id: string, itemId: string, body: Partial<AddBomItemDto>, token?: string) =>
      request<unknown>(`/factories/${factoryId}/bom/${id}/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        token,
      }),
    removeItem: (factoryId: string, id: string, itemId: string, token?: string) =>
      request<void>(`/factories/${factoryId}/bom/${id}/items/${itemId}`, {
        method: 'DELETE',
        token,
      }),
    revisions: (factoryId: string, id: string, token?: string) =>
      request<BomRevisionResponse[]>(`/factories/${factoryId}/bom/${id}/revisions`, { token }),
    revise: (factoryId: string, id: string, body: CreateBomRevisionDto, token?: string) =>
      request<BomRevisionResponse>(`/factories/${factoryId}/bom/${id}/revise`, {
        method: 'POST',
        body: JSON.stringify(body),
        token,
      }),
  },
};
