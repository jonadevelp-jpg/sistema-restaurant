/**
 * API Route para categorías
 * 
 * REFACTORIZADO: Ahora usa controller/service pattern
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { requireAuth } from '../../lib/api-helpers';
import { CategoriesController } from '../../backend/controllers/categories.controller';

// GET - Obtener todas las categorías
export const GET: APIRoute = async (context) => {
  try {
    const controller = new CategoriesController(supabase);
    return await controller.getAll(context);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en GET categories:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST - Crear nueva categoría
export const POST: APIRoute = async (context) => {
  try {
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    
    const controller = new CategoriesController(authSupabase);
    return await controller.create(context);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en POST categories:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// PUT - Actualizar categoría
export const PUT: APIRoute = async (context) => {
  try {
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    
    const controller = new CategoriesController(authSupabase);
    return await controller.update(context);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en PUT categories:', error);
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
    
    const controller = new CategoriesController(authSupabase);
    return await controller.patch(context);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en PATCH categories:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE - Eliminar categoría
export const DELETE: APIRoute = async (context) => {
  try {
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    
    const controller = new CategoriesController(authSupabase);
    return await controller.delete(context);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en DELETE categories:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

