/**
 * Servicio de lógica de negocio para items del menú
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { MenuItemsQueries } from '../database/menu-items.queries';
import { deleteImage } from '../../lib/supabase';
import type { CreateMenuItemInput, UpdateMenuItemInput } from '../validators/menu-items.validator';
import type { MenuItem, Category } from '../../shared/types';

export class MenuItemsService {
  private queries: MenuItemsQueries;
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.queries = new MenuItemsQueries(supabase);
    this.supabase = supabase;
  }

  /**
   * Obtiene todos los items del menú
   */
  async getAll(options: { categoryId?: number; availableOnly?: boolean } = {}): Promise<(MenuItem & { category: Category | null })[]> {
    return await this.queries.getAll(options);
  }

  /**
   * Obtiene un item por ID
   */
  async getById(id: number): Promise<MenuItem & { category: Category | null }> {
    return await this.queries.getById(id);
  }

  /**
   * Crea un nuevo item
   */
  async createMenuItem(input: CreateMenuItemInput): Promise<MenuItem & { category: Category | null }> {
    return await this.queries.create(input);
  }

  /**
   * Actualiza un item
   * Maneja la eliminación de imagen anterior si se cambia
   */
  async updateMenuItem(input: UpdateMenuItemInput): Promise<MenuItem & { category: Category | null }> {
    const { id, image_url, ...updateData } = input;

    // Si se está cambiando la imagen, eliminar la anterior
    if (image_url !== undefined) {
      const currentItem = await this.queries.getById(id);
      if (currentItem?.image_url && currentItem.image_url !== image_url) {
        await deleteImage(currentItem.image_url);
      }
    }

    return await this.queries.update(id, { ...updateData, image_url });
  }

  /**
   * Elimina un item
   * Elimina la imagen asociada si existe
   */
  async deleteMenuItem(id: number): Promise<void> {
    // Obtener item para eliminar su imagen
    const item = await this.queries.getById(id);
    
    if (item?.image_url) {
      await deleteImage(item.image_url);
    }

    await this.queries.delete(id);
  }
}

