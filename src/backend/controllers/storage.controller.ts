/**
 * Controller para almacenamiento
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from '../services/storage.service';
import { jsonResponse, errorResponse } from '../helpers';

export class StorageController {
  private service: StorageService;

  constructor(supabase: SupabaseClient) {
    this.service = new StorageService(supabase);
  }

  /**
   * POST /api/upload-image
   * Sube una imagen
   */
  async upload(context: any): Promise<Response> {
    try {
      const formData = await context.request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return errorResponse('No se proporcionó ningún archivo', 400);
      }

      const result = await this.service.uploadImage(file);

      return jsonResponse({
        success: true,
        url: result.url,
        fileName: result.fileName,
      });
    } catch (error: any) {
      console.error('[Storage Controller] Error subiendo imagen:', error);
      return errorResponse(error.message, 500);
    }
  }

  /**
   * POST /api/delete-image
   * Elimina una imagen
   */
  async delete(context: any): Promise<Response> {
    try {
      const body = await context.request.json();
      const { imageUrl } = body;

      if (!imageUrl) {
        return errorResponse('URL de imagen requerida', 400);
      }

      const success = await this.service.deleteImage(imageUrl);

      if (success) {
        return jsonResponse({ success: true, message: 'Imagen eliminada' });
      } else {
        return errorResponse('Error al eliminar imagen', 500);
      }
    } catch (error: any) {
      console.error('[Storage Controller] Error eliminando imagen:', error);
      return errorResponse('Error interno: ' + error.message, 500);
    }
  }
}

