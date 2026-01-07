/**
 * Endpoint de prueba para verificar variables de entorno
 * Accede a: http://localhost:4321/api/test-env
 */

import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const response = {
    success: true,
    env: {
      PUBLIC_SUPABASE_URL: {
        value: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NO CONFIGURADA',
        configured: !!supabaseUrl,
        length: supabaseUrl.length,
      },
      PUBLIC_SUPABASE_ANON_KEY: {
        value: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : 'NO CONFIGURADA',
        configured: !!supabaseAnonKey,
        length: supabaseAnonKey.length,
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        value: serviceRoleKey ? `${serviceRoleKey.substring(0, 30)}...` : 'NO CONFIGURADA',
        configured: !!serviceRoleKey,
        length: serviceRoleKey.length,
      },
    },
    allConfigured: !!(supabaseUrl && supabaseAnonKey),
    message: !!(supabaseUrl && supabaseAnonKey)
      ? '✅ Todas las variables están configuradas'
      : '❌ Faltan variables de entorno',
  };

  return new Response(JSON.stringify(response, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};




