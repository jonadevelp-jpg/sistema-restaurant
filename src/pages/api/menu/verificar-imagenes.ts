import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { jsonResponse, errorResponse } from '../../../lib/api-helpers';

// GET - Verificar imágenes de items del menú
export const GET: APIRoute = async () => {
  try {
    const { data: items, error } = await supabase
      .from('menu_items')
      .select('id, name, image_url, category_id')
      .limit(20);
    
    if (error) {
      return errorResponse('Error obteniendo items: ' + error.message, 500);
    }
    
    // Analizar tipos de URLs
    const analysis = {
      total: items?.length || 0,
      con_imagen: items?.filter(i => i.image_url)?.length || 0,
      rutas_relativas: items?.filter(i => i.image_url?.startsWith('/'))?.length || 0,
      urls_supabase: items?.filter(i => i.image_url?.includes('supabase.co'))?.length || 0,
      sin_imagen: items?.filter(i => !i.image_url)?.length || 0,
      items: items?.map(item => ({
        id: item.id,
        name: item.name,
        image_url: item.image_url,
        tipo: item.image_url?.startsWith('/') ? 'relativa' : item.image_url?.includes('supabase.co') ? 'supabase' : 'otra'
      }))
    };
    
    return jsonResponse({ success: true, data: analysis });
  } catch (error: any) {
    return errorResponse('Error interno: ' + (error.message || 'Desconocido'), 500);
  }
};


