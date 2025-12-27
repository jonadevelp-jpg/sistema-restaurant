/**
 * Controller de Menú
 * Maneja las peticiones HTTP relacionadas con categorías e items del menú
 */

import { Request } from '../@types';
import { MenuService } from '../services/menu.service';
import { requireAuth } from '../helpers/auth';
import { successResponse, errorResponse } from '../helpers/api-helpers';

export class MenuController {
  constructor(private menuService: MenuService) {}

  // ==================== CATEGORÍAS ====================

  async getCategories(request: Request) {
    try {
      const url = new URL(request.url);
      const onlyActive = url.searchParams.get('onlyActive') === 'true';

      const categories = await this.menuService.getCategories({ onlyActive });
      return successResponse(categories);
    } catch (error: any) {
      console.error('Error en getCategories:', error);
      return errorResponse('Error al obtener categorías: ' + error.message, 500);
    }
  }

  async createCategory(request: Request) {
    try {
      const authResult = await requireAuth(request);
      if (authResult instanceof Response) return authResult;

      const body = await request.json();
      const { name, slug, description, order_num, is_active, visual_type } = body;

      if (!name) {
        return errorResponse('El nombre es requerido', 400);
      }

      const category = await this.menuService.createCategory({
        name,
        slug,
        description,
        order_num,
        is_active,
        visual_type,
      });

      return successResponse(category, 'Categoría creada', 201);
    } catch (error: any) {
      if (error.code === '23505') {
        return errorResponse('Ya existe una categoría con ese slug', 400);
      }
      console.error('Error en createCategory:', error);
      return errorResponse('Error al crear categoría: ' + error.message, 500);
    }
  }

  async updateCategory(request: Request, id: number) {
    try {
      const authResult = await requireAuth(request);
      if (authResult instanceof Response) return authResult;

      const body = await request.json();
      
      console.log('📥 MenuController.updateCategory - Datos recibidos:', {
        id,
        body,
        image_url: body.image_url,
        hasImage: !!body.image_url,
        imageType: typeof body.image_url
      });
      
      const category = await this.menuService.updateCategory(id, body);
      
      console.log('✅ MenuController.updateCategory - Categoría actualizada:', {
        id: category.id,
        name: category.name,
        image_url: category.image_url,
        hasImage: !!category.image_url
      });

      return successResponse(category);
    } catch (error: any) {
      console.error('Error en updateCategory:', error);
      return errorResponse('Error al actualizar categoría: ' + error.message, 500);
    }
  }

  async deleteCategory(request: Request, id: number) {
    try {
      const authResult = await requireAuth(request);
      if (authResult instanceof Response) return authResult;

      await this.menuService.deleteCategory(id);
      return successResponse(null, 'Categoría eliminada');
    } catch (error: any) {
      console.error('Error en deleteCategory:', error);
      return errorResponse('Error al eliminar categoría: ' + error.message, 500);
    }
  }

  // ==================== MENU ITEMS ====================

  async getMenuItems(request: Request) {
    try {
      const url = new URL(request.url);
      const categoryId = url.searchParams.get('categoryId');
      const availableOnly = url.searchParams.get('availableOnly') === 'true';

      const items = await this.menuService.getMenuItems({
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        availableOnly,
      });

      return successResponse(items);
    } catch (error: any) {
      console.error('Error en getMenuItems:', error);
      return errorResponse('Error al obtener items: ' + error.message, 500);
    }
  }

  async createMenuItem(request: Request) {
    try {
      const authResult = await requireAuth(request);
      if (authResult instanceof Response) return authResult;

      const body = await request.json();
      const item = await this.menuService.createMenuItem(body);

      return successResponse(item, 'Item creado', 201);
    } catch (error: any) {
      console.error('Error en createMenuItem:', error);
      return errorResponse('Error al crear item: ' + error.message, 500);
    }
  }

  async updateMenuItem(request: Request, id: number) {
    try {
      const authResult = await requireAuth(request);
      if (authResult instanceof Response) return authResult;

      const body = await request.json();
      const item = await this.menuService.updateMenuItem(id, body);

      return successResponse(item);
    } catch (error: any) {
      console.error('Error en updateMenuItem:', error);
      return errorResponse('Error al actualizar item: ' + error.message, 500);
    }
  }

  async deleteMenuItem(request: Request, id: number) {
    try {
      const authResult = await requireAuth(request);
      if (authResult instanceof Response) return authResult;

      await this.menuService.deleteMenuItem(id);
      return successResponse(null, 'Item eliminado');
    } catch (error: any) {
      console.error('Error en deleteMenuItem:', error);
      return errorResponse('Error al eliminar item: ' + error.message, 500);
    }
  }
}

