/**
 * Servicio de lógica de negocio para usuarios
 */

import { createClient } from '@supabase/supabase-js';
import type { CreateUserInput } from '../validators/users.validator';
import type { User } from '../../shared/types';

export class UsersService {
  private supabaseUrl: string;
  private supabaseServiceKey: string;

  constructor() {
    this.supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
    this.supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!this.supabaseUrl) {
      throw new Error('PUBLIC_SUPABASE_URL no está configurada');
    }
    
    if (!this.supabaseServiceKey || this.supabaseServiceKey === 'tu-service-role-key-aqui') {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY no está configurada. ' +
        'Obtén esta clave en: Supabase Dashboard > Settings > API > service_role'
      );
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(input: CreateUserInput): Promise<User> {
    // Crear cliente admin con service_role
    const supabaseAdmin = createClient(this.supabaseUrl, this.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        name: input.name,
        role: input.role,
      },
    });

    if (authError) {
      throw new Error('Error creando usuario en Auth: ' + authError.message);
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // Crear registro en la tabla users
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email || input.email,
        name: input.name,
        role: input.role,
      })
      .select()
      .single();

    if (userError) {
      // Intentar eliminar el usuario de Auth si falla la creación en users
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error('Error creando perfil de usuario: ' + userError.message);
    }

    return userData as User;
  }
}

