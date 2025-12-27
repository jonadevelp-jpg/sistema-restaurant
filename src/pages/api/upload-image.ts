import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '../../lib/api-helpers';

export const POST: APIRoute = async (context) => {
  try {
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    
    const formData = await context.request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return errorResponse('No se proporcionó ningún archivo', 400);
    }
    
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return errorResponse('Tipo de archivo no válido. Use JPG, PNG, WebP o GIF.', 400);
    }
    
    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return errorResponse('La imagen es muy grande. Máximo 5MB.', 400);
    }
    
    // Generar nombre único
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Convertir File a ArrayBuffer para Supabase
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Subir a Supabase Storage
    const { data, error } = await authSupabase.storage
      .from('menu-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Error subiendo imagen a Supabase:', error);
      return errorResponse('Error al subir imagen: ' + error.message, 500);
    }
    
    // Obtener URL pública
    const { data: urlData } = authSupabase.storage
      .from('menu-images')
      .getPublicUrl(fileName);
    
    const publicUrl = urlData.publicUrl;
    
    console.log('✅ Imagen subida exitosamente:', {
      fileName,
      publicUrl,
      hasUrl: !!publicUrl,
      urlLength: publicUrl?.length
    });
    
    return jsonResponse({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en upload-image:', error);
    return errorResponse('Error interno: ' + (error.message || 'Desconocido'), 500);
  }
};

