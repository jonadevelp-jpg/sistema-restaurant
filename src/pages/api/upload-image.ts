/**
 * API Route para subir imágenes
 * 
 * REFACTORIZADO: Ahora usa controller/service pattern
 */

import type { APIRoute } from 'astro';
import { requireAuth } from '../../lib/api-helpers';
import { StorageController } from '../../backend/controllers/storage.controller';

export const POST: APIRoute = async (context) => {
  try {
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    
    const controller = new StorageController(authSupabase);
    return await controller.upload(context);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en upload-image:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

