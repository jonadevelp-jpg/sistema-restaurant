/**
 * API Route para crear trabajos de impresión (print_jobs)
 * 
 * Esta ruta crea un registro en la tabla print_jobs cuando el usuario
 * solicita una impresión (comanda, boleta, pago).
 * 
 * IMPORTANTE: Esta ruta NO imprime directamente. Solo crea el trabajo
 * de impresión que será procesado por el servicio de impresión local.
 * 
 * REFACTORIZADO: Ahora usa controller/service pattern
 */

import type { APIRoute } from 'astro';
import { requireAuth } from '../../lib/api-helpers';
import { PrintJobsController } from '../../backend/controllers/print-jobs.controller';

export const POST: APIRoute = async (context) => {
  try {
    // Verificar autenticación
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase, user } = authResult;
    
    // Crear controller y delegar
    const controller = new PrintJobsController(authSupabase);
    return await controller.create(context, user);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en POST /api/print-jobs:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};


