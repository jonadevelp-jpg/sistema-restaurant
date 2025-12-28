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
    
    // IMPORTANTE: No podemos hacer fetch desde HTTPS a HTTP (Mixed Content)
    // La solución es que la API route en Vercel haga el fetch al servicio local
    // usando las variables de entorno del servidor (no públicas)
    const printServiceUrl = import.meta.env.PRINT_SERVICE_URL || 'http://localhost:3001';
    const printServiceToken = import.meta.env.PRINT_SERVICE_TOKEN || '';
    
    if (!printServiceUrl || !printServiceToken) {
      console.error('[API Print] ❌ Servicio de impresión local NO configurado');
      console.error('[API Print] PRINT_SERVICE_URL:', printServiceUrl || 'FALTANTE');
      console.error('[API Print] PRINT_SERVICE_TOKEN:', printServiceToken ? 'presente' : 'FALTANTE');
      return errorResponse(
        'Servicio de impresión local no configurado. Verifica las variables de entorno PRINT_SERVICE_URL y PRINT_SERVICE_TOKEN en Vercel.',
        500
      );
    }
    
    // Asegurar que la URL tenga el puerto si no lo tiene
    let url = printServiceUrl.endsWith('/') ? printServiceUrl.slice(0, -1) : printServiceUrl;
    if (!url.includes(':') || (!url.includes(':3001') && !url.includes(':80') && !url.includes(':443'))) {
      // Si no tiene puerto, agregar 3001
      url = url.replace(/\/$/, '') + ':3001';
    }
    
    try {
      console.log('[API Print] Enviando a servicio local:', url);
      console.log('[API Print] Tipo:', type);
      console.log('[API Print] Orden:', orden.numero_orden);
      
      // Hacer fetch desde el servidor de Vercel (no desde el navegador)
      // Esto evita problemas de Mixed Content
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${printServiceToken}`,
        },
        body: JSON.stringify({
          type: type === 'kitchen' ? 'kitchen' : 'receipt',
          orden,
          items,
        }),
        // Timeout más largo para conexiones locales
        signal: AbortSignal.timeout(10000), // 10 segundos
      });
      
      console.log('[API Print] Respuesta del servicio local:', response.status, response.statusText);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('[API Print] ❌ Error del servicio local:', error);
        return errorResponse(
          `Error del servicio de impresión: ${error.error || `HTTP ${response.status}`}`,
          500
        );
      }
      
      const result = await response.json();
      console.log(`[API Print] ✅ ${type === 'kitchen' ? 'Comanda' : 'Boleta'} enviada a servicio local:`, result.message);
      
      return jsonResponse({
        success: true,
        message: type === 'kitchen' ? 'Comanda enviada a impresora' : 'Boleta enviada a impresora',
        type,
        orden: orden.numero_orden
      });
    } catch (error: any) {
      console.error(`[API Print] ❌ Error enviando a servicio local:`, error.message);
      console.error('[API Print] Stack:', error.stack);
      
      // Mensaje más descriptivo según el tipo de error
      let errorMessage = 'Error desconocido';
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'No se pudo conectar al servicio de impresión. Verifica que el servicio esté corriendo en la PC local y que la IP en PRINT_SERVICE_URL sea correcta.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'El servicio de impresión no respondió a tiempo. Verifica que esté corriendo.';
      } else {
        errorMessage = error.message || 'Error desconocido';
      }
      
      return errorResponse(
        `Error de conexión con el servicio de impresión: ${errorMessage}`,
        500
      );
    }
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en POST /api/print:', error);
    return errorResponse('Error interno: ' + (error.message || 'Desconocido'), 500);
  }
};

