/**
 * API Route para crear trabajos de impresión (print_jobs)
 * 
 * Esta ruta crea un registro en la tabla print_jobs cuando el usuario
 * solicita una impresión (comanda, boleta, pago).
 * 
 * IMPORTANTE: Esta ruta NO imprime directamente. Solo crea el trabajo
 * de impresión que será procesado por el servicio de impresión local.
 */

import type { APIRoute } from 'astro';
import { requireAuth, jsonResponse, errorResponse } from '../../lib/api-helpers';

export const POST: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase, user } = authResult;
    
    const body = await context.request.json();
    const { ordenId, type, printerTarget } = body;
    
    // Validar parámetros
    if (!ordenId) {
      return errorResponse('ordenId es requerido', 400);
    }
    
    if (!type || !['kitchen', 'receipt', 'payment'].includes(type)) {
      return errorResponse('type debe ser: kitchen, receipt o payment', 400);
    }
    
    // Determinar printer_target si no se proporciona
    let target = printerTarget;
    if (!target) {
      // Por defecto: kitchen para comandas, cashier para boletas/pagos
      target = type === 'kitchen' ? 'kitchen' : 'cashier';
    }
    
    if (!['kitchen', 'cashier'].includes(target)) {
      return errorResponse('printerTarget debe ser: kitchen o cashier', 400);
    }
    
    // Verificar que la orden existe
    const { data: orden, error: ordenError } = await authSupabase
      .from('ordenes_restaurante')
      .select('id, numero_orden, estado')
      .eq('id', ordenId)
      .single();
    
    if (ordenError || !orden) {
      return errorResponse('Orden no encontrada', 404);
    }
    
    // Verificar que la orden tenga items
    const { data: items, error: itemsError } = await authSupabase
      .from('orden_items')
      .select('id')
      .eq('orden_id', ordenId)
      .limit(1);
    
    if (itemsError) {
      return errorResponse('Error al verificar items de la orden', 500);
    }
    
    if (!items || items.length === 0) {
      return errorResponse('La orden no tiene items para imprimir', 400);
    }
    
    // Crear el print_job
    const { data: printJob, error: printJobError } = await authSupabase
      .from('print_jobs')
      .insert({
        orden_id: ordenId,
        type: type,
        printer_target: target,
        status: 'pending',
        requested_by: user.id
      })
      .select()
      .single();
    
    if (printJobError) {
      console.error('[API Print Jobs] Error creando print_job:', printJobError);
      return errorResponse('Error al crear trabajo de impresión: ' + printJobError.message, 500);
    }
    
    console.log(`[API Print Jobs] ✅ Print job creado: ${printJob.id} (tipo: ${type}, orden: ${orden.numero_orden})`);
    
    return jsonResponse({
      success: true,
      data: printJob,
      message: type === 'kitchen' 
        ? 'Comanda enviada a cola de impresión' 
        : type === 'receipt'
        ? 'Boleta enviada a cola de impresión'
        : 'Recibo de pago enviado a cola de impresión'
    });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en POST /api/print-jobs:', error);
    return errorResponse('Error interno: ' + (error.message || 'Desconocido'), 500);
  }
};

