/**
 * Servicio de Menú
 * Lógica de negocio para categorías e items del menú
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Category, MenuItem, VisualType } from '../@types';

export class MenuService {
  constructor(private supabase: SupabaseClient) {}

  // ==================== CATEGORÍAS ====================

  async getCategories(options: { onlyActive?: boolean } = {}): Promise<Category[]> {
    let query = this.supabase
      .from('categories')
      .select('id, name, slug, description, order_num, is_active, visual_type, image_url, created_at')
      .order('order_num', { ascending: true });

    if (options.onlyActive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Category[];
  }

  async getCategoryById(id: number): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Category | null;
  }

  async createCategory(category: Partial<Category>): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert([
        {
          name: category.name,
          slug:
            category.slug ||
            category.name
              ?.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, ''),
          description: category.description || null,
          order_num: category.order_num || 0,
          is_active: category.is_active ?? true,
          visual_type: category.visual_type || null,
          image_url: category.image_url || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  }

  async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
    const updateData: any = {};

    if (category.name !== undefined) updateData.name = category.name;
    if (category.slug !== undefined) updateData.slug = category.slug;
    if (category.description !== undefined) updateData.description = category.description;
    if (category.order_num !== undefined) updateData.order_num = category.order_num;
    if (category.is_active !== undefined) updateData.is_active = category.is_active;
    if (category.visual_type !== undefined) updateData.visual_type = category.visual_type;
    if (category.image_url !== undefined) {
      // Asegurarse de que image_url se guarde correctamente (incluso si es null)
      updateData.image_url = category.image_url || null;
      console.log('🖼️ Guardando image_url de categoría:', {
        categoryId: id,
        value: updateData.image_url,
        type: typeof updateData.image_url,
        isNull: updateData.image_url === null,
        isUndefined: updateData.image_url === undefined
      });
    }

    console.log('💾 Datos a actualizar en BD (categoría):', updateData);
    console.log('💾 image_url específicamente:', {
      value: updateData.image_url,
      type: typeof updateData.image_url,
      isNull: updateData.image_url === null,
      isUndefined: updateData.image_url === undefined,
      length: updateData.image_url?.length
    });

    const { data, error } = await this.supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando categoría en BD:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log('✅ Categoría actualizada exitosamente:', {
      id: data?.id,
      name: data?.name,
      image_url: data?.image_url,
      image_url_length: data?.image_url?.length,
      has_image: !!data?.image_url,
      image_url_type: typeof data?.image_url
    });
    
    // Verificar que el image_url se guardó correctamente
    if (updateData.image_url !== undefined && data?.image_url !== updateData.image_url) {
      console.error('⚠️ ADVERTENCIA: El image_url no coincide!', {
        enviado: updateData.image_url,
        recibido: data?.image_url
      });
    }
    
    return data as Category;
  }

  async deleteCategory(id: number): Promise<void> {
    // Primero, actualizar items que tengan esta categoría
    await this.supabase
      .from('menu_items')
      .update({ category_id: null })
      .eq('category_id', id);

    // Luego eliminar la categoría
    const { error } = await this.supabase.from('categories').delete().eq('id', id);

    if (error) throw error;
  }

  // ==================== MENU ITEMS ====================

  async getMenuItems(options: {
    categoryId?: number;
    availableOnly?: boolean;
  } = {}): Promise<MenuItem[]> {
    let query = this.supabase
      .from('menu_items')
      .select(
        `
        *,
        category:categories(id, name, slug, is_active, visual_type)
      `
      )
      .order('order_num', { ascending: true });

    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options.availableOnly) {
      query = query.eq('is_available', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as MenuItem[];
  }

  async getMenuItemById(id: number): Promise<MenuItem | null> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .select(
        `
        *,
        category:categories(id, name, slug, is_active, visual_type)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as MenuItem | null;
  }

  async createMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .insert([
        {
          name: item.name,
          description: item.description || null,
          price: item.price || 0,
          category_id: item.category_id || null,
          image_url: item.image_url || null,
          is_available: item.is_available ?? true,
          is_featured: item.is_featured ?? false,
          order_num: item.order_num || 0,
          visual_type: item.visual_type || null,
        },
      ])
      .select(
        `
        *,
        category:categories(id, name, slug, is_active, visual_type)
      `
      )
      .single();

    if (error) throw error;
    return data as MenuItem;
  }

  async updateMenuItem(id: number, item: Partial<MenuItem>): Promise<MenuItem> {
    const updateData: any = {};

    if (item.name !== undefined) updateData.name = item.name;
    if (item.description !== undefined) updateData.description = item.description;
    if (item.price !== undefined) updateData.price = item.price;
    if (item.category_id !== undefined) updateData.category_id = item.category_id;
    if (item.image_url !== undefined) updateData.image_url = item.image_url;
    if (item.is_available !== undefined) updateData.is_available = item.is_available;
    if (item.is_featured !== undefined) updateData.is_featured = item.is_featured;
    if (item.order_num !== undefined) updateData.order_num = item.order_num;
    if (item.visual_type !== undefined) updateData.visual_type = item.visual_type;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('menu_items')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        *,
        category:categories(id, name, slug, is_active, visual_type)
      `
      )
      .single();

    if (error) throw error;
    return data as MenuItem;
  }

  async deleteMenuItem(id: number): Promise<void> {
    const { error } = await this.supabase.from('menu_items').delete().eq('id', id);

    if (error) throw error;
  }

  // Helper para obtener visual_type efectivo (heredado de categoría si es null)
  async getEffectiveVisualType(itemId: number): Promise<VisualType> {
    const item = await this.getMenuItemById(itemId);
    if (!item) return null;

    // Si el item tiene visual_type, retornarlo
    if (item.visual_type) return item.visual_type;

    // Si no, retornar el visual_type de la categoría
    return item.category?.visual_type || null;
  }
}

