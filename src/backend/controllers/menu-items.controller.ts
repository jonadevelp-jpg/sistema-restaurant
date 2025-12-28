/**
 * Controller para items del menú
 * Maneja request/response y delega lógica a services
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { MenuItemsService } from '../services/menu-items.service';
import { 
  createMenuItemSchema, 
  updateMenuItemSchema, 
  deleteMenuItemSchema 
} from '../validators/menu-items.validator';
import { jsonResponse, errorResponse } from '../helpers';

export class MenuItemsController {
  private service: MenuItemsService;

  constructor(supabase: SupabaseClient) {
    this.service = new MenuItemsService(supabase);
  }

  /**
   * GET /api/menu-items-v2
   * Obtiene todos los items del menú
   */
  async getAll(context: any): Promise<Response> {
    try {
      const categoryId = context.url.searchParams.get('categoryId');
      const availableOnly = context.url.searchParams.get('availableOnly') === 'true';
      
      const options: { categoryId?: number; availableOnly?: boolean } = {};
      if (categoryId) options.categoryId = parseInt(categoryId);
      if (availableOnly) options.availableOnly = true;

      const items = await this.service.getAll(options);
      return jsonResponse({ success: true, data: items });
    } catch (error: any) {
      console.error('[Menu Items Controller] Error obteniendo items:', error);
      return errorResponse('Error al obtener items: ' + error.message, 500);
    }
  }

  /**
   * POST /api/menu-items-v2
   * Crea un nuevo item
   */
  async create(context: any): Promise<Response> {
    try {
      const body = await context.request.json();
      
      // Validar entrada
      const validationResult = createMenuItemSchema.safeParse(body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        return errorResponse(`Error de validación: ${errors}`, 400);
      }

      const input = validationResult.data;
      const item = await this.service.createMenuItem(input);
      
      return jsonResponse({ success: true, data: item }, 201);
    } catch (error: any) {
      console.error('[Menu Items Controller] Error creando item:', error);
      return errorResponse('Error al crear item: ' + error.message, 500);
    }
  }

  /**
   * PUT /api/menu-items-v2
   * Actualiza un item completo
   */
  async update(context: any): Promise<Response> {
    try {
      const body = await context.request.json();
      
      // Validar entrada
      const validationResult = updateMenuItemSchema.safeParse(body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        return errorResponse(`Error de validación: ${errors}`, 400);
      }

      const input = validationResult.data;
      const item = await this.service.updateMenuItem(input);
      
      return jsonResponse({ success: true, data: item });
    } catch (error: any) {
      console.error('[Menu Items Controller] Error actualizando item:', error);
      return errorResponse('Error al actualizar: ' + error.message, 500);
    }
  }

  /**
   * PATCH /api/menu-items-v2
   * Actualiza parcialmente un item
   */
  async patch(context: any): Promise<Response> {
    try {
      const body = await context.request.json();
      const { id, ...updates } = body;
      
      if (!id) {
        return errorResponse('ID del item requerido', 400);
      }

      // Agregar updated_at
      updates.updated_at = new Date().toISOString();

      const item = await this.service.updateMenuItem({ id, ...updates });
      
      return jsonResponse({ success: true, data: item });
    } catch (error: any) {
      console.error('[Menu Items Controller] Error actualizando item:', error);
      return errorResponse('Error al actualizar: ' + error.message, 500);
    }
  }

  /**
   * DELETE /api/menu-items-v2
   * Elimina un item
   */
  async delete(context: any): Promise<Response> {
    try {
      const body = await context.request.json();
      
      // Validar entrada
      const validationResult = deleteMenuItemSchema.safeParse(body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        return errorResponse(`Error de validación: ${errors}`, 400);
      }

      const { id } = validationResult.data;
      await this.service.deleteMenuItem(id);
      
      return jsonResponse({ success: true, message: 'Item eliminado' });
    } catch (error: any) {
      console.error('[Menu Items Controller] Error eliminando item:', error);
      return errorResponse('Error al eliminar: ' + error.message, 500);
    }
  }
}

