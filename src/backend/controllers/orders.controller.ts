/**
 * Controller para órdenes
 * Maneja request/response y delega lógica a services
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { OrdersService } from '../services/orders.service';
import { updateOrderSchema } from '../validators/orders.validator';
import { jsonResponse, errorResponse } from '../helpers';

export class OrdersController {
  private service: OrdersService;

  constructor(supabase: SupabaseClient) {
    this.service = new OrdersService(supabase);
  }

  /**
   * PATCH /api/ordenes/[id]
   * Actualiza una orden
   */
  async update(context: any, ordenId: string): Promise<Response> {
    try {
      const body = await context.request.json();
      
      // Validar entrada
      const validationResult = updateOrderSchema.safeParse(body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        return errorResponse(`Error de validación: ${errors}`, 400);
      }

      const input = validationResult.data;
      const orden = await this.service.updateOrder(ordenId, input);

      return jsonResponse({
        success: true,
        data: orden,
        message: 'Orden actualizada correctamente',
      });
    } catch (error: any) {
      console.error('[Orders Controller] Error:', error);
      
      if (error.message === 'Orden no encontrada') {
        return errorResponse(error.message, 404);
      }

      return errorResponse('Error al actualizar orden: ' + error.message, 500);
    }
  }
}

