import type { APIContext } from 'astro';
import { supabase } from './supabase';

export function jsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function errorResponse(message: string, status: number = 400) {
  return jsonResponse({ success: false, error: message }, status);
}

export async function requireAuth(context: APIContext) {
  try {
    // Obtener el token de las cookies o headers
    const authHeader = context.request.headers.get('Authorization');
    let token = authHeader?.replace('Bearer ', '');
    
    // Si no hay token en el header, intentar obtenerlo de las cookies de Supabase
    if (!token) {
      // Supabase guarda el token en cookies con este formato
      const cookies = context.request.headers.get('Cookie') || '';
      
      // Intentar múltiples formatos de cookies de Supabase
      const patterns = [
        /sb-[^=]+-auth-token=([^;]+)/,
        /sb-access-token=([^;]+)/,
        /sb-refresh-token=([^;]+)/,
      ];
      
      for (const pattern of patterns) {
        const match = cookies.match(pattern);
        if (match) {
          try {
            const cookieValue = decodeURIComponent(match[1]);
            // Intentar parsear como JSON
            try {
              const cookieData = JSON.parse(cookieValue);
              token = cookieData.access_token || cookieData.accessToken || cookieData.token;
              if (token) break;
            } catch {
              // Si no es JSON, puede ser el token directamente
              if (cookieValue.length > 50 && !cookieValue.includes('{')) {
                token = cookieValue;
                break;
              }
            }
          } catch {
            // Continuar con el siguiente patrón
          }
        }
      }
    }

    // Si aún no hay token, intentar obtener la sesión directamente desde el cliente de Supabase
    if (!token) {
      // Usar el cliente de Supabase del frontend para obtener la sesión
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token || null;
    }

    if (!token) {
      console.error('❌ No se encontró token de autenticación');
      return errorResponse('No autenticado. Por favor, inicia sesión nuevamente.', 401);
    }

    // Crear un cliente de Supabase con el token para verificar
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Variables de entorno de Supabase no configuradas');
      return errorResponse('Error de configuración del servidor', 500);
    }
    
    const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verificar el token con Supabase
    const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Error verificando usuario:', userError);
      return errorResponse('Token inválido o expirado. Por favor, inicia sesión nuevamente.', 401);
    }

    // Verificar que el usuario tenga un rol válido
    const { data: userProfile, error: profileError } = await supabaseWithAuth
      .from('users')
      .select('role, name, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError);
      // Si no existe el perfil, permitir acceso pero con advertencia
      console.warn('⚠️ Usuario autenticado pero sin perfil en tabla users');
    }

    if (!userProfile) {
      return errorResponse('Tu usuario no tiene un perfil configurado. Contacta al administrador.', 403);
    }

    if (!['admin', 'encargado', 'mesero'].includes(userProfile.role)) {
      console.error('❌ Usuario sin permisos. Rol:', userProfile.role);
      return errorResponse(`No tienes permisos para esta acción. Tu rol es: ${userProfile.role}`, 403);
    }

    return { user, supabase: supabaseWithAuth, userProfile };
  } catch (error: any) {
    console.error('❌ Error en requireAuth:', error);
    return errorResponse('Error de autenticación: ' + (error.message || 'Error desconocido'), 500);
  }
}

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

