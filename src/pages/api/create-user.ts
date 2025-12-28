/**
 * API Route para crear usuarios
 * 
 * REFACTORIZADO: Ahora usa controller/service pattern
 */

import type { APIRoute } from 'astro';
import { requireAuth } from '../../lib/api-helpers';
import { UsersController } from '../../backend/controllers/users.controller';

export const POST: APIRoute = async (context) => {
  try {
    // Verificar que el usuario es admin
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    
    const controller = new UsersController();
    return await controller.create(context);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en create-user:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

