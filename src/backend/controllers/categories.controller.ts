/**
 * Controller para categorías
 * Maneja request/response y delega lógica a services
 */

import type { APIRoute } from 'astro';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CategoriesService } from '../services/categories.service';
import { 
  createCategorySchema, 
  updateCategorySchema, 
  deleteCategorySchema 
} from '../validators/categories.validator';
import { jsonResponse, errorResponse } from '../helpers';

export class CategoriesController {
  private service: CategoriesService;
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.service = new CategoriesService(supabase);
    this.supabase = supabase;
  }

  /**
   * GET /api/categories-v2
   * Obtiene todas las categorías
   */
  async getAll(context: any): Promise<Response> {
    try {
      const onlyActive = context.url.searchParams.get('onlyActive') === 'true';
      const categories = await this.service.getAll(onlyActive);
      return jsonResponse({ success: true, data: categories });
    } catch (error: any) {
      console.error('[Categories Controller] Error obteniendo categorías:', error);
      return errorResponse('Error al obtener categorías: ' + error.message, 500);
    }
  }

  /**
   * POST /api/categories-v2
   * Crea una nueva categoría
   */
  async create(context: any): Promise<Response> {
    try {
      const body = await context.request.json();
      
      // Validar entrada
      const validationResult = createCategorySchema.safeParse(body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        return errorResponse(`Error de validación: ${errors}`, 400);
      }

      const input = validationResult.data;
      const category = await this.service.createCategory(input);
      
      return jsonResponse({ success: true, data: category }, 201);
    } catch (error: any) {
      console.error('[Categories Controller] Error creando categoría:', error);
      
      // Manejar error de duplicado
      if (error.code === '23505') {
        return errorResponse('Ya existe una categoría con ese slug', 400);
      }
      
      return errorResponse('Error al crear categoría: ' + error.message, 500);
    }
  }

  /**
   * PUT /api/categories-v2
   * Actualiza una categoría completa
   */
  async update(context: any): Promise<Response> {
    try {
      const body = await context.request.json();
      
      // Validar entrada
      const validationResult = updateCategorySchema.safeParse(body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        return errorResponse(`Error de validación: ${errors}`, 400);
      }

      const input = validationResult.data;
      const category = await this.service.updateCategory(input);
      
      return jsonResponse({ success: true, data: category });
    } catch (error: any) {
      console.error('[Categories Controller] Error actualizando categoría:', error);
      return errorResponse('Error al actualizar categoría: ' + error.message, 500);
    }
  }

  /**
   * PATCH /api/categories-v2
   * Actualiza parcialmente una categoría
   */
  async patch(context: any): Promise<Response> {
    try {
      const body = await context.request.json();
      const { id, ...updates } = body;
      
      if (!id) {
        return errorResponse('ID de categoría requerido', 400);
      }

      const category = await this.service.updateCategory({ id, ...updates });
      
      return jsonResponse({ success: true, data: category });
    } catch (error: any) {
      console.error('[Categories Controller] Error actualizando categoría:', error);
      return errorResponse('Error al actualizar: ' + error.message, 500);
    }
  }

  /**
   * DELETE /api/categories-v2
   * Elimina una categoría
   */
  async delete(context: any): Promise<Response> {
    try {
      const body = await context.request.json();
      
      // Validar entrada
      const validationResult = deleteCategorySchema.safeParse(body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        return errorResponse(`Error de validación: ${errors}`, 400);
      }

      const { id } = validationResult.data;
      await this.service.deleteCategory(id, this.supabase);
      
      return jsonResponse({ success: true, message: 'Categoría eliminada' });
    } catch (error: any) {
      console.error('[Categories Controller] Error eliminando categoría:', error);
      return errorResponse('Error al eliminar: ' + error.message, 500);
    }
  }
}

