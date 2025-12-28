/**
 * Helpers de autenticación
 */

import { createAuthenticatedClient, supabase } from '../database/supabase';
import { AuthContext } from '../@types';
import { errorResponse } from './api-helpers';

export async function requireAuth(
  request: Request
): Promise<AuthContext | Response> {
  // Obtener el token del header Authorization
  const authHeader = request.headers.get('Authorization');
  let token = authHeader?.replace('Bearer ', '');

  // Si no hay token en el header, intentar obtenerlo de las cookies
  if (!token) {
    const cookies = request.headers.get('Cookie') || '';
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

  // Crear cliente autenticado
  const supabaseWithAuth = createAuthenticatedClient(token);

  // Verificar el token con Supabase
  const { data: { user }, error } = await supabaseWithAuth.auth.getUser();

  if (error || !user) {
    return errorResponse('Token inválido o expirado', 401);
  }

  // Verificar que el usuario tenga un rol válido
  const { data: userProfile, error: profileError } = await supabaseWithAuth
    .from('users')
    .select('role, name, email')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile) {
    return errorResponse('Perfil de usuario no encontrado', 404);
  }

  if (!['admin', 'encargado', 'mesero'].includes(userProfile.role)) {
    return errorResponse('No tienes permisos para esta acción', 403);
  }

  return {
    user,
    supabase: supabaseWithAuth,
    userProfile: {
      id: user.id,
      role: userProfile.role as 'admin' | 'mesero' | 'encargado',
      name: userProfile.name,
      email: userProfile.email,
    },
  };
}



