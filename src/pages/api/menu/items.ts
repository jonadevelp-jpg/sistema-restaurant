/**
 * API Route para obtener items del menú (público)
 * 
 * REFACTORIZADO: Reutiliza MenuItemsController
 * Esta ruta es pública (sin autenticación) para el menú digital
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { MenuItemsController } from '../../../backend/controllers/menu-items.controller';

// GET - Obtener todos los items del menú (público)
export const GET: APIRoute = async (context) => {
  try {
    const controller = new MenuItemsController(supabase);
    return await controller.getAll(context);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en GET menu/items:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};




