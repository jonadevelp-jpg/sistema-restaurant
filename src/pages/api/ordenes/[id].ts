/**
 * API Route para actualizar órdenes
 * 
 * Esta ruta maneja la actualización del estado de órdenes.
 * 
 * IMPORTANTE: La impresión ya NO está acoplada al cambio de estado.
 * Para imprimir, usar /api/print-jobs que crea trabajos en la cola de impresión.
 */

import type { APIRoute } from 'astro';
import { requireAuth, jsonResponse, errorResponse } from '../../../lib/api-helpers';

export const PATCH: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    
    const ordenId = context.params.id;
    if (!ordenId) {
      return errorResponse('ID de orden requerido', 400);
    }
    
    const body = await context.request.json();
    const { estado, metodo_pago, total, propina_calculada, paid_at } = body;
    
    console.log('[API Ordenes] ========== ACTUALIZANDO ORDEN ==========');
    console.log('[API Ordenes] Orden ID:', ordenId);
    console.log('[API Ordenes] Nuevo estado:', estado);
    console.log('[API Ordenes] Body recibido:', body);
    
    // Obtener orden actual para comparar estados
    const { data: ordenActual, error: errorActual } = await authSupabase
      .from('ordenes_restaurante')
      .select('*, mesas(numero)')
      .eq('id', ordenId)
      .single();
    
    if (errorActual || !ordenActual) {
      return errorResponse('Orden no encontrada', 404);
    }
    
    const estadoAnterior = ordenActual.estado;
    const estadoNuevo = estado || ordenActual.estado;
    
    // Preparar datos de actualización
    const updateData: any = {};
    if (estado !== undefined) updateData.estado = estado;
    if (metodo_pago !== undefined) updateData.metodo_pago = metodo_pago;
    if (total !== undefined) updateData.total = total;
    if (propina_calculada !== undefined) updateData.propina_calculada = propina_calculada;
    if (paid_at !== undefined) updateData.paid_at = paid_at;
    
    // Actualizar orden
    const { data: ordenActualizada, error: updateError } = await authSupabase
      .from('ordenes_restaurante')
      .update(updateData)
      .eq('id', ordenId)
      .select('*, mesas(numero)')
      .single();
    
    if (updateError) {
      console.error('[API Ordenes] ❌ Error actualizando orden:', updateError);
      return errorResponse('Error al actualizar orden: ' + updateError.message, 500);
    }
    
    console.log('[API Ordenes] ✅ Orden actualizada correctamente');
    console.log('[API Ordenes] Estado anterior:', estadoAnterior, '→ Estado nuevo:', estadoNuevo);
    
    // NOTA: La impresión ya NO está acoplada al cambio de estado.
    // Si se necesita imprimir al cambiar el estado, el frontend debe crear
    // un print_job llamando a /api/print-jobs después de actualizar el estado.
    
    return jsonResponse({ 
      success: true, 
      data: ordenActualizada,
      message: 'Orden actualizada correctamente'
    });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en PATCH ordenes/[id]:', error);
    return errorResponse('Error interno: ' + (error.message || 'Desconocido'), 500);
  }
};

