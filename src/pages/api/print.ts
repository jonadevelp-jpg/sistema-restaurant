/**
 * API Route para impresión directa
 * 
 * Permite imprimir comandas y boletas desde el frontend
 * sin necesidad de cambiar el estado de la orden.
 * 
 * Endpoints:
 * - POST /api/print/kitchen - Imprimir comanda de cocina
 * - POST /api/print/receipt - Imprimir boleta de cliente
 */

import type { APIRoute } from 'astro';
import { requireAuth, jsonResponse, errorResponse } from '../../lib/api-helpers';
import { printKitchenCommand, printCustomerReceipt } from '../../lib/printer-service';

export const POST: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    
    const body = await context.request.json();
    const { type, ordenId } = body;
    
    if (!type || !ordenId) {
      return errorResponse('Tipo de impresión y ID de orden requeridos', 400);
    }
    
    if (type !== 'kitchen' && type !== 'receipt') {
      return errorResponse('Tipo de impresión inválido. Debe ser "kitchen" o "receipt"', 400);
    }
    
    // Obtener orden
    const { data: orden, error: ordenError } = await authSupabase
      .from('ordenes_restaurante')
      .select('*, mesas(numero)')
      .eq('id', ordenId)
      .single();
    
    if (ordenError || !orden) {
      return errorResponse('Orden no encontrada', 404);
    }
    
    // Obtener items de la orden
    const { data: itemsData, error: itemsError } = await authSupabase
      .from('orden_items')
      .select('*, menu_items(id, name, category_id)')
      .eq('orden_id', ordenId)
      .order('created_at', { ascending: true });
    
    if (itemsError) {
      return errorResponse('Error obteniendo items: ' + itemsError.message, 500);
    }
    
    const items = itemsData?.map((item: any) => ({
      id: item.id,
      menu_item_id: item.menu_item_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal,
      notas: item.notas,
      menu_item: item.menu_items,
    })) || [];
    
    if (items.length === 0) {
      return errorResponse('La orden no tiene items para imprimir', 400);
    }
    
    // Usar las mismas funciones que cuando cambia el estado
    // IMPORTANTE: No bloquear si falla la impresión (igual que cuando cambia el estado)
    console.log('[API Print] ========== INICIANDO IMPRESIÓN ==========');
    console.log('[API Print] Tipo:', type);
    console.log('[API Print] Orden:', orden.numero_orden);
    console.log('[API Print] Items:', items.length);
    
    // Intentar imprimir (sin bloquear si falla, igual que cuando cambia el estado)
    if (type === 'kitchen') {
      console.log('[API Print] Activando impresión de comanda...');
      printKitchenCommand(orden, items).catch((error) => {
        console.error('[API Print] ❌ Error imprimiendo comanda (no bloquea):', error);
      });
    } else if (type === 'receipt') {
      console.log('[API Print] Activando impresión de boleta...');
      printCustomerReceipt(orden, items).catch((error) => {
        console.error('[API Print] ❌ Error imprimiendo boleta (no bloquea):', error);
      });
    }
    
    // Siempre retornar éxito (igual que cuando cambia el estado)
    // La impresión se maneja en segundo plano
    return jsonResponse({
      success: true,
      message: type === 'kitchen' ? 'Comanda enviada a impresora' : 'Boleta enviada a impresora',
      type,
      orden: orden.numero_orden
    });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en POST /api/print:', error);
    return errorResponse('Error interno: ' + (error.message || 'Desconocido'), 500);
  }
};

