import type { APIRoute } from 'astro';
import { MenuController } from '@backend/controllers/menu.controller';
import { MenuService } from '@backend/services/menu.service';

// GET - Obtener todas las categorías
export const GET: APIRoute = async ({ request }) => {
  try {
    // Crear cliente de Supabase directamente desde las variables de entorno de Astro
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Variables de entorno no configuradas');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuración incompleta' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Importar y crear cliente de Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Crear servicio y controller con el cliente
    const menuService = new MenuService(supabaseClient);
    const menuController = new MenuController(menuService);

    // Llamar al controller
    return await menuController.getCategories(request as any);
  } catch (error: any) {
    console.error('❌ Error en GET categories:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST - Crear nueva categoría
export const POST: APIRoute = async (context) => {
  try {
    // Crear cliente de Supabase
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Crear servicio y controller
    const menuService = new MenuService(supabaseClient);
    const menuController = new MenuController(menuService);

    // Llamar al controller
    return await menuController.createCategory(context.request as any);
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
    // Leer el body una sola vez y clonar el request para el controller
    const body = await context.request.json();
    const { id, image_url } = body;
    
    console.log('📥 PUT categories-v2 - Datos recibidos:', {
      id,
      image_url,
      image_url_type: typeof image_url,
      image_url_length: image_url?.length,
      has_image: !!image_url,
      body_keys: Object.keys(body),
      full_body: JSON.stringify(body).substring(0, 500) // Primeros 500 caracteres
    });
    
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID de categoría requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear cliente de Supabase
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Crear servicio y controller
    const menuService = new MenuService(supabaseClient);
    const menuController = new MenuController(menuService);

    // Crear un nuevo request con el body ya parseado para el controller
    // El controller espera poder leer el body, así que creamos un request clonado
    const clonedRequest = new Request(context.request.url, {
      method: context.request.method,
      headers: context.request.headers,
      body: JSON.stringify(body),
    });

    // Llamar al controller con el request clonado
    return await menuController.updateCategory(clonedRequest as any, id);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en PUT categories:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// PATCH - Actualizar parcialmente (ej: toggle is_active)
export const PATCH: APIRoute = async (context) => {
  try {
    // Leer el body una sola vez y clonar el request para el controller
    const body = await context.request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID de categoría requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear cliente de Supabase
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Crear servicio y controller
    const menuService = new MenuService(supabaseClient);
    const menuController = new MenuController(menuService);

    // Crear un nuevo request con el body ya parseado para el controller
    const clonedRequest = new Request(context.request.url, {
      method: context.request.method,
      headers: context.request.headers,
      body: JSON.stringify(body),
    });

    // Llamar al controller (PATCH usa updateCategory)
    return await menuController.updateCategory(clonedRequest as any, id);
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
    // Leer el body una sola vez
    const body = await context.request.json();
    const { id } = body;
    
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID de categoría requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear cliente de Supabase
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Crear servicio y controller
    const menuService = new MenuService(supabaseClient);
    const menuController = new MenuController(menuService);

    // DELETE no necesita el body, solo el id
    return await menuController.deleteCategory(context.request as any, id);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en DELETE categories:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

