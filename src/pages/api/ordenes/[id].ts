/**
 * API Route para actualizar órdenes
 * 
 * Esta ruta maneja la actualización del estado de órdenes y activa
 * la impresión automática cuando corresponde:
 * - Estado 'preparing' → Imprime comanda de cocina
 * - Estado 'paid' → Imprime boleta de cliente
 * 
 * IMPORTANTE: Si la impresión falla, NO bloquea la actualización del estado.
 */

import type { APIRoute } from 'astro';
import { requireAuth, jsonResponse, errorResponse } from '../../../lib/api-helpers';
import { printKitchenCommand, printCustomerReceipt } from '../../../lib/printer-service';

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
      console.error('Error actualizando orden:', updateError);
      return errorResponse('Error al actualizar orden: ' + updateError.message, 500);
    }
    
    // Si el estado cambió, intentar imprimir (sin bloquear si falla)
    if (estadoAnterior !== estadoNuevo) {
      // Obtener items de la orden para impresión
      const { data: itemsData } = await authSupabase
        .from('orden_items')
        .select('*, menu_items(id, name, category_id)')
        .eq('orden_id', ordenId)
        .order('created_at', { ascending: true });
      
      const items = itemsData?.map((item: any) => ({
        id: item.id,
        menu_item_id: item.menu_item_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal,
        notas: item.notas,
        menu_item: item.menu_items,
      })) || [];
      
      // Imprimir según el nuevo estado
      if (estadoNuevo === 'preparing' && items.length > 0) {
        console.log('[API] Estado cambió a "preparing" - activando impresión de comanda');
        // Imprimir comanda de cocina (sin bloquear si falla)
        printKitchenCommand(ordenActualizada, items).catch((error) => {
          console.error('[API] ❌ Error imprimiendo comanda (no bloquea):', error);
        });
      } else if (estadoNuevo === 'paid' && items.length > 0) {
        console.log('[API] Estado cambió a "paid" - activando impresión de boleta');
        // Imprimir boleta de cliente (sin bloquear si falla)
        printCustomerReceipt(ordenActualizada, items).catch((error) => {
          console.error('[API] ❌ Error imprimiendo boleta (no bloquea):', error);
        });
      } else {
        console.log('[API] Estado cambió pero no se imprime:', {
          estadoNuevo,
          itemsLength: items.length,
          debeImprimirComanda: estadoNuevo === 'preparing' && items.length > 0,
          debeImprimirBoleta: estadoNuevo === 'paid' && items.length > 0,
        });
      }
    }
    
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

