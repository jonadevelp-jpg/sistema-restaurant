/**
 * Helpers de autenticación para backend
 * Extraído de src/lib/api-helpers.ts
 */

import type { APIContext } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { errorResponse } from './response.helper';

export interface AuthResult {
  user: any;
  supabase: ReturnType<typeof createClient>;
  userProfile: any;
}

/**
 * Verifica que el request esté autenticado
 * Retorna el usuario y cliente de Supabase autenticado
 */
export async function requireAuth(context: APIContext): Promise<AuthResult | Response> {
  // Obtener el token de las cookies o headers
  const authHeader = context.request.headers.get('Authorization');
  let token = authHeader?.replace('Bearer ', '');
  
  // Si no hay token en el header, intentar obtenerlo de las cookies de Supabase
  if (!token) {
    // Supabase guarda el token en cookies con este formato
    const cookies = context.request.headers.get('Cookie') || '';
    const match = cookies.match(/sb-[^=]+-auth-token=([^;]+)/);
    if (match) {
      try {
        const cookieData = JSON.parse(decodeURIComponent(match[1]));
        token = cookieData.access_token;
      } catch {
        // Si no se puede parsear, continuar sin token
      }
    }
  }

  if (!token) {
    return errorResponse('No autenticado', 401);
  }

  // Crear un cliente de Supabase con el token para verificar
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';
  
  const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  // Verificar el token con Supabase
  const { data: { user }, error } = await supabaseWithAuth.auth.getUser();
  
  if (error || !user) {
    return errorResponse('Token inválido o expirado', 401);
  }

  // Verificar que el usuario tenga un rol válido
  const { data: userProfile } = await supabaseWithAuth
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userProfile || !['admin', 'encargado', 'mesero'].includes(userProfile.role)) {
    return errorResponse('No tienes permisos para esta acción', 403);
  }

  return { user, supabase: supabaseWithAuth, userProfile };
}

