/**
 * Queries de base de datos para categorías
 * Extraído de src/lib/supabase.ts
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category } from '../../shared/types';

export class CategoriesQueries {
  constructor(private supabase: SupabaseClient) {}

  async getAll(onlyActive: boolean = false): Promise<Category[]> {
    let query = this.supabase
      .from('categories')
      .select('*')
      .order('order_num', { ascending: true });
    
    if (onlyActive) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Category[];
  }

  async getById(id: number): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Category;
  }

  async create(category: Partial<Category>): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert([{
        name: category.name,
        slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: category.description || null,
        order_num: category.order_num || 0,
        is_active: category.is_active ?? true,
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Category;
  }

  async update(id: number, category: Partial<Category>): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .update({
        name: category.name,
        slug: category.slug,
        description: category.description,
        order_num: category.order_num,
        is_active: category.is_active,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Category;
  }

  async delete(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}

