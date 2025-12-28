/**
 * API Route para items del menú
 * 
 * REFACTORIZADO: Ahora usa controller/service pattern
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { requireAuth } from '../../lib/api-helpers';
import { MenuItemsController } from '../../backend/controllers/menu-items.controller';

// GET - Obtener todos los items del menú
export const GET: APIRoute = async (context) => {
  try {
    const controller = new MenuItemsController(supabase);
    return await controller.getAll(context);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en GET menu-items:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST - Crear nuevo item
export const POST: APIRoute = async (context) => {
  try {
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    
    const controller = new MenuItemsController(authSupabase);
    return await controller.create(context);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en POST menu-items:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// PUT - Actualizar item completo
export const PUT: APIRoute = async (context) => {
  try {
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    
    const controller = new MenuItemsController(authSupabase);
    return await controller.update(context);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en PUT menu-items:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// PATCH - Actualizar parcialmente
export const PATCH: APIRoute = async (context) => {
  try {
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    
    const controller = new MenuItemsController(authSupabase);
    return await controller.patch(context);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en PATCH menu-items:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE - Eliminar item
export const DELETE: APIRoute = async (context) => {
  try {
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    
    const controller = new MenuItemsController(authSupabase);
    return await controller.delete(context);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en DELETE menu-items:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
