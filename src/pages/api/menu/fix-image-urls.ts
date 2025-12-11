import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { jsonResponse, errorResponse } from '../../../lib/api-helpers';

// POST - Corregir rutas de imágenes que no tienen / inicial
export const POST: APIRoute = async () => {
  try {
    // Obtener todos los items con imagen
    const { data: items, error: fetchError } = await supabase
      .from('menu_items')
      .select('id, name, image_url')
      .not('image_url', 'is', null);
    
    if (fetchError) {
      return errorResponse('Error obteniendo items: ' + fetchError.message, 500);
    }
    
    let updated = 0;
    const updates: Array<{ id: number; old: string; new: string }> = [];
    
    // Corregir rutas que no empiezan con /
    for (const item of items || []) {
      if (item.image_url && !item.image_url.startsWith('/') && !item.image_url.startsWith('http')) {
        const newUrl = '/' + item.image_url;
        const { error: updateError } = await supabase
          .from('menu_items')
          .update({ image_url: newUrl })
          .eq('id', item.id);
        
        if (!updateError) {
          updated++;
          updates.push({ id: item.id, old: item.image_url, new: newUrl });
        }
      }
    }
    
    return jsonResponse({ 
      success: true, 
      message: `Se actualizaron ${updated} items`,
      updates 
    });
  } catch (error: any) {
    return errorResponse('Error interno: ' + (error.message || 'Desconocido'), 500);
  }
};


