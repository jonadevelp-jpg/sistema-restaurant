/**
 * API Route para actualizar órdenes
 * 
 * Esta ruta maneja la actualización del estado de órdenes.
 * 
 * IMPORTANTE: La impresión ya NO está acoplada al cambio de estado.
 * Para imprimir, usar /api/print-jobs que crea trabajos en la cola de impresión.
 * 
 * REFACTORIZADO: Ahora usa controller/service pattern
 */

import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/api-helpers';
import { OrdersController } from '../../../backend/controllers/orders.controller';

export const PATCH: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    
    const ordenId = context.params.id;
    if (!ordenId) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID de orden requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[API Ordenes] ========== ACTUALIZANDO ORDEN ==========');
    console.log('[API Ordenes] Orden ID:', ordenId);
    
    // Crear controller y delegar
    const controller = new OrdersController(authSupabase);
    return await controller.update(context, ordenId);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en PATCH ordenes/[id]:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

