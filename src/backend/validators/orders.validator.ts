/**
 * Validadores para órdenes
 */

import { z } from 'zod';
import { ORDER_STATUS_LIST } from '../../shared/constants';

export const updateOrderSchema = z.object({
  estado: z.enum(['pending', 'preparing', 'ready', 'served', 'paid', 'cancelled'] as const).optional(),
  metodo_pago: z.string().nullable().optional(),
  total: z.number().min(0).nullable().optional(),
  propina_calculada: z.number().min(0).nullable().optional(),
  paid_at: z.string().datetime().nullable().optional(),
});

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

