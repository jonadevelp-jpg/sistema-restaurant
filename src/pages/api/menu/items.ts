import type { APIRoute } from 'astro';
import { MenuController } from '@backend/controllers/menu.controller';
import { MenuService } from '@backend/services/menu.service';

// GET - Obtener todos los items del menú
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
    const result = await menuController.getMenuItems(request as any);
    
    console.log('✅ GET menu/items - Respuesta:', result.status);
    return result;
  } catch (error: any) {
    console.error('❌ Error en GET menu/items:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};




