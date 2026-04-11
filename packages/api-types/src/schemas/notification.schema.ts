import { z } from 'zod';

export const notificationSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  type: z.enum([
    'production:order-created',
    'production:order-completed',
    'qc:inspection-failed',
    'qc:defect-critical',
    'inventory:low-stock',
    'work-order:assigned',
    'sync:completed',
    'report:ready',
  ]),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
});

export type Notification = z.infer<typeof notificationSchema>;
