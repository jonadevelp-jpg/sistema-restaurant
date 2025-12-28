/**
 * Cliente de Supabase para frontend
 * 
 * @deprecated Los tipos Category y MenuItem ahora están en src/shared/types/
 * Usar: import type { Category, MenuItem } from '@/shared/types';
 */

import { createClient } from '@supabase/supabase-js';
import type { Category, MenuItem } from '../shared/types';

// Cliente de Supabase
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = '⚠️ ERROR: Variables de entorno de Supabase no configuradas. ' +
    'Configura PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY en tu plataforma de deploy.';
  console.error(errorMsg);
}

// Crear cliente con validación
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Helper para subir imágenes a Supabase Storage
export async function uploadImage(file: File, bucket: string = 'menu-images'): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error subiendo imagen:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error en uploadImage:', error);
    return null;
  }
}

// Helper para eliminar imagen de Supabase Storage
export async function deleteImage(imageUrl: string, bucket: string = 'menu-images'): Promise<boolean> {
  try {
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error('Error eliminando imagen:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en deleteImage:', error);
    return false;
  }
}

// Re-exportar tipos para compatibilidad
export type { Category, MenuItem } from '../shared/types';

/**
 * @deprecated categoriesApi y menuItemsApi están deprecados.
 * Usar CategoriesQueries y MenuItemsQueries desde src/backend/database/
 * 
 * Mantenemos estas funciones por compatibilidad temporal.
 */
import { CategoriesQueries } from '../backend/database/categories.queries';
import { MenuItemsQueries } from '../backend/database/menu-items.queries';

// Wrappers para compatibilidad
export const categoriesApi = {
  getAll: (onlyActive: boolean = false) => {
    const queries = new CategoriesQueries(supabase);
    return queries.getAll(onlyActive);
  },
  getById: (id: number) => {
    const queries = new CategoriesQueries(supabase);
    return queries.getById(id);
  },
  create: (category: Partial<Category>) => {
    const queries = new CategoriesQueries(supabase);
    return queries.create(category);
  },
  update: (id: number, category: Partial<Category>) => {
    const queries = new CategoriesQueries(supabase);
    return queries.update(id, category);
  },
  delete: (id: number) => {
    const queries = new CategoriesQueries(supabase);
    return queries.delete(id);
  },
};

export const menuItemsApi = {
  getAll: (options: { categoryId?: number; availableOnly?: boolean } = {}) => {
    const queries = new MenuItemsQueries(supabase);
    return queries.getAll(options);
  },
  getById: (id: number) => {
    const queries = new MenuItemsQueries(supabase);
    return queries.getById(id);
  },
  create: (item: Partial<MenuItem>) => {
    const queries = new MenuItemsQueries(supabase);
    return queries.create(item);
  },
  update: (id: number, item: Partial<MenuItem>) => {
    const queries = new MenuItemsQueries(supabase);
    return queries.update(id, item);
  },
  delete: async (id: number) => {
    const queries = new MenuItemsQueries(supabase);
    const item = await queries.getById(id);
    if (item?.image_url) {
      await deleteImage(item.image_url);
    }
    return queries.delete(id);
  },
};




