/**
 * Servicio de lógica de negocio para categorías
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { CategoriesQueries } from '../database/categories.queries';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validators/categories.validator';
import type { Category } from '../../shared/types';

export class CategoriesService {
  private queries: CategoriesQueries;

  constructor(supabase: SupabaseClient) {
    this.queries = new CategoriesQueries(supabase);
  }

  /**
   * Obtiene todas las categorías
   */
  async getAll(onlyActive: boolean = false): Promise<Category[]> {
    return await this.queries.getAll(onlyActive);
  }

  /**
   * Obtiene una categoría por ID
   */
  async getById(id: number): Promise<Category> {
    return await this.queries.getById(id);
  }

  /**
   * Crea una nueva categoría
   */
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    // Generar slug si no se proporciona
    const slug = input.slug || this.generateSlug(input.name);
    
    return await this.queries.create({
      ...input,
      slug,
    });
  }

  /**
   * Actualiza una categoría
   */
  async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    const { id, ...updateData } = input;
    
    // Si se actualiza el nombre y no hay slug, generar uno nuevo
    if (updateData.name && !updateData.slug) {
      updateData.slug = this.generateSlug(updateData.name);
    }
    
    return await this.queries.update(id, updateData);
  }

  /**
   * Elimina una categoría
   * Primero actualiza los items que la usan para ponerlos sin categoría
   */
  async deleteCategory(id: number, supabase: SupabaseClient): Promise<void> {
    // Primero, actualizar items que tengan esta categoría
    await supabase
      .from('menu_items')
      .update({ category_id: null })
      .eq('category_id', id);
    
    // Luego eliminar la categoría
    await this.queries.delete(id);
  }

  /**
   * Genera un slug a partir de un nombre
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

