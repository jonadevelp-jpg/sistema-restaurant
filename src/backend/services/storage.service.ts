/**
 * Servicio para manejo de almacenamiento (Supabase Storage)
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export class StorageService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Sube una imagen a Supabase Storage
   */
  async uploadImage(
    file: File,
    bucket: string = 'menu-images'
  ): Promise<{ url: string; fileName: string }> {
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no válido. Use JPG, PNG, WebP o GIF.');
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('La imagen es muy grande. Máximo 5MB.');
    }

    // Generar nombre único
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convertir File a ArrayBuffer para Supabase
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Subir a Supabase Storage
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error('Error al subir imagen: ' + error.message);
    }

    // Obtener URL pública
    const { data: urlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      fileName,
    };
  }

  /**
   * Elimina una imagen de Supabase Storage
   */
  async deleteImage(imageUrl: string, bucket: string = 'menu-images'): Promise<boolean> {
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await this.supabase.storage
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
}

