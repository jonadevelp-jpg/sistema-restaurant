/**
 * Servicio de lógica de negocio para órdenes
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { OrdersQueries } from '../database/orders.queries';
import type { UpdateOrderInput } from '../validators/orders.validator';
import type { Orden } from '../../shared/types';

export class OrdersService {
  private queries: OrdersQueries;

  constructor(supabase: SupabaseClient) {
    this.queries = new OrdersQueries(supabase);
  }

  /**
   * Actualiza una orden
   */
  async updateOrder(ordenId: string, input: UpdateOrderInput): Promise<Orden> {
    // Verificar que la orden existe
    const ordenActual = await this.queries.getById(ordenId);
    if (!ordenActual) {
      throw new Error('Orden no encontrada');
    }

    // Preparar datos de actualización
    const updateData: Partial<Orden> = {};
    if (input.estado !== undefined) updateData.estado = input.estado;
    if (input.metodo_pago !== undefined) updateData.metodo_pago = input.metodo_pago;
    if (input.total !== undefined) updateData.total = input.total;
    if (input.propina_calculada !== undefined) updateData.propina_calculada = input.propina_calculada;
    if (input.paid_at !== undefined) updateData.paid_at = input.paid_at;

    // Actualizar orden
    const ordenActualizada = await this.queries.update(ordenId, updateData);

    console.log('[Orders Service] ✅ Orden actualizada correctamente');
    console.log('[Orders Service] Estado anterior:', ordenActual.estado, '→ Estado nuevo:', ordenActualizada.estado);

    return ordenActualizada;
  }
}

