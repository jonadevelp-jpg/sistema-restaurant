/**
 * Cliente de Supabase para Backend
 * Configuración centralizada de Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Obtener variables de entorno (compatible con Astro y Node.js)
// En Astro, las variables se leen con import.meta.env
// En Node.js, se leen con process.env
const getEnv = (key: string): string => {
  // @ts-ignore - import.meta.env puede no estar disponible en Node.js
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key] || '';
  }
  return process.env[key] || '';
};

const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL') || '';
const supabaseAnonKey = getEnv('PUBLIC_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || '';
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ ADVERTENCIA: Variables de entorno de Supabase no configuradas');
}

// Cliente público (anon key)
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Backend no mantiene sesiones
        autoRefreshToken: false,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Cliente con service role (para operaciones administrativas)
export const supabaseAdmin: SupabaseClient = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase;

// Crear cliente autenticado con token de usuario
export function createAuthenticatedClient(accessToken: string): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase no configurado');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

