/**
 * Queries de base de datos para items del menú
 * Extraído de src/lib/supabase.ts
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MenuItem, Category } from '../../shared/types';

export class MenuItemsQueries {
  constructor(private supabase: SupabaseClient) {}

  async getAll(options: { categoryId?: number; availableOnly?: boolean } = {}): Promise<(MenuItem & { category: Category | null })[]> {
    let query = this.supabase
      .from('menu_items')
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .order('order_num', { ascending: true });
    
    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }
    
    if (options.availableOnly) {
      query = query.eq('is_available', true);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as (MenuItem & { category: Category | null })[];
  }

  async getById(id: number): Promise<MenuItem & { category: Category | null }> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as MenuItem & { category: Category | null };
  }

  async create(item: Partial<MenuItem>): Promise<MenuItem & { category: Category | null }> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .insert([{
        name: item.name,
        description: item.description || null,
        price: item.price || 0,
        category_id: item.category_id || null,
        image_url: item.image_url || null,
        is_available: item.is_available ?? true,
        is_featured: item.is_featured ?? false,
        order_num: item.order_num || 0,
      }])
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .single();
    
    if (error) throw error;
    return data as MenuItem & { category: Category | null };
  }

  async update(id: number, item: Partial<MenuItem>): Promise<MenuItem & { category: Category | null }> {
    const updateData: any = {};
    
    if (item.name !== undefined) updateData.name = item.name;
    if (item.description !== undefined) updateData.description = item.description;
    if (item.price !== undefined) updateData.price = item.price;
    if (item.category_id !== undefined) updateData.category_id = item.category_id;
    if (item.image_url !== undefined) updateData.image_url = item.image_url;
    if (item.is_available !== undefined) updateData.is_available = item.is_available;
    if (item.is_featured !== undefined) updateData.is_featured = item.is_featured;
    if (item.order_num !== undefined) updateData.order_num = item.order_num;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('menu_items')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .single();
    
    if (error) throw error;
    return data as MenuItem & { category: Category | null };
  }

  async delete(id: number): Promise<boolean> {
    const item = await this.getById(id);
    
    // Eliminar imagen si existe (esto debería estar en un servicio, pero lo mantenemos por compatibilidad)
    if (item?.image_url) {
      // La función deleteImage está en supabase.ts, mantenerla ahí por ahora
    }

    const { error } = await this.supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}

