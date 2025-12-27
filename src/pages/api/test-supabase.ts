import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const GET: APIRoute = async () => {
  try {
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

    // Verificar que las variables estén configuradas
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Variables de entorno no configuradas',
          details: {
            PUBLIC_SUPABASE_URL: supabaseUrl ? '✅ Configurada' : '❌ NO configurada',
            PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '✅ Configurada' : '❌ NO configurada',
          },
          message: 'Verifica tu archivo .env en la raíz del proyecto'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Probar conexión: intentar obtener categorías
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .limit(5);

    // Probar conexión: intentar obtener items del menú
    const { data: menuItems, error: menuItemsError } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .limit(5);

    // Verificar errores
    const hasErrors = categoriesError || menuItemsError;
    const errors = [];
    if (categoriesError) errors.push({ table: 'categories', error: categoriesError.message, code: categoriesError.code });
    if (menuItemsError) errors.push({ table: 'menu_items', error: menuItemsError.message, code: menuItemsError.code });

    return new Response(
      JSON.stringify({
        success: !hasErrors,
        connection: {
          url: supabaseUrl,
          keyConfigured: supabaseAnonKey ? '✅ Sí' : '❌ No',
          keyLength: supabaseAnonKey.length,
        },
        testResults: {
          categories: {
            success: !categoriesError,
            count: categories?.length || 0,
            error: categoriesError?.message || null,
            code: categoriesError?.code || null,
          },
          menuItems: {
            success: !menuItemsError,
            count: menuItems?.length || 0,
            error: menuItemsError?.message || null,
            code: menuItemsError?.code || null,
          },
        },
        errors: errors.length > 0 ? errors : null,
        message: hasErrors 
          ? '❌ Error conectando a Supabase. Verifica las variables de entorno y los permisos RLS.'
          : '✅ Conexión a Supabase exitosa'
      }),
      {
        status: hasErrors ? 500 : 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error inesperado',
        message: error.message || 'Error desconocido',
        stack: error.stack
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

