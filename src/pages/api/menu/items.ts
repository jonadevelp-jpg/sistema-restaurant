import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { jsonResponse, errorResponse } from '../../../lib/api-helpers';

// GET - Obtener todos los items del menú
export const GET: APIRoute = async ({ url }) => {
  try {
    const categoryId = url.searchParams.get('categoryId');
    const availableOnly = url.searchParams.get('availableOnly') === 'true';
    
    let query = supabase
      .from('menu_items')
      .select(`
        *,
        category:categories(id, name, slug, is_active)
      `)
      .order('order_num', { ascending: true });
    
    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId));
    }
    
    if (availableOnly) {
      query = query.eq('is_available', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error obteniendo items:', error);
      return errorResponse('Error al obtener items: ' + error.message, 500);
    }
    
    return jsonResponse({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Error en GET menu/items:', error);
    return errorResponse('Error interno: ' + (error.message || 'Desconocido'), 500);
  }
};


