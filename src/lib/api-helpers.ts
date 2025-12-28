/**
 * @deprecated Este archivo se mantiene por compatibilidad.
 * Usar directamente desde src/backend/helpers/
 * 
 * TODO: Migrar todas las referencias a src/backend/helpers/
 */

import type { APIContext } from 'astro';
import { supabase } from './supabase';

// Re-exportar desde la nueva ubicación para mantener compatibilidad
export { jsonResponse, errorResponse, requireAuth } from '../backend/helpers';

// Helper para obtener usuario autenticado en páginas Astro
export async function getAuthUser(context: APIContext) {
  try {
    const authHeader = context.request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  context.cookies.get('sb-access-token')?.value ||
                  context.cookies.get('sb-auth-token')?.value;

    if (!token) return null;

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;

    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return userProfile;
  } catch {
    return null;
  }
}

// Helper para obtener usuario autenticado en páginas Astro (usando Astro directamente)
export async function getAuthUserFromAstro(Astro: any) {
  try {
    // Obtener el token de las cookies de Supabase
    // Supabase guarda el token en cookies con formato: sb-{project-ref}-auth-token
    let token: string | null = null;
    
    // Obtener todas las cookies
    const allCookies = Astro.cookies.getAll();
    
    // Buscar la cookie de autenticación de Supabase
    for (const cookie of allCookies) {
      if (cookie.name.includes('auth-token') || cookie.name.includes('sb-')) {
        try {
          // El valor puede ser un JSON con el token o el token directamente
          const cookieValue = decodeURIComponent(cookie.value);
          
          // Intentar parsear como JSON
          try {
            const cookieData = JSON.parse(cookieValue);
            token = cookieData.access_token || cookieData.accessToken || cookieData.access_token;
            if (token) break;
          } catch {
            // Si no es JSON, puede ser el token directamente
            if (cookieValue.length > 50) {
              token = cookieValue;
              break;
            }
          }
        } catch (e) {
          // Continuar con la siguiente cookie
          continue;
        }
      }
    }

    // Si no encontramos token en cookies, intentar desde el header
    if (!token) {
      const authHeader = Astro.request.headers.get('Authorization');
      token = authHeader?.replace('Bearer ', '') || null;
    }

    // Si aún no hay token, intentar obtener de la cookie string directamente
    if (!token) {
      const cookieHeader = Astro.request.headers.get('Cookie') || '';
      // Buscar patrón: sb-*-auth-token=...
      const match = cookieHeader.match(/sb-[^=]+-auth-token=([^;]+)/);
      if (match) {
        try {
          const cookieData = JSON.parse(decodeURIComponent(match[1]));
          token = cookieData.access_token || cookieData.accessToken;
        } catch {
          // Si falla el parse, usar el valor directamente
          token = decodeURIComponent(match[1]);
        }
      }
    }

    if (!token) {
      return null;
    }

    // Crear cliente de Supabase con el token
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }
    
    const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verificar el usuario
    const { data: { user }, error } = await supabaseWithAuth.auth.getUser();
    if (error || !user) {
      return null;
    }

    // Obtener perfil del usuario
    const { data: userProfile, error: profileError } = await supabaseWithAuth
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return null;
    }

    return userProfile;
  } catch (error) {
    console.error('Error obteniendo usuario autenticado:', error);
    return null;
  }
}

