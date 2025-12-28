/**
 * Constantes para estados de órdenes
 */

import type { OrderStatus } from '../types/orders.types';

export const ORDER_STATUS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  ready: 'Listo',
  served: 'Servido',
  paid: 'Pagado',
  cancelled: 'Cancelado',
};

export const ORDER_STATUS_LIST: OrderStatus[] = [
  'pending',
  'preparing',
  'ready',
  'served',
  'paid',
  'cancelled',
];

