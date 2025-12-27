import type { APIRoute } from 'astro';
import { supabase, deleteImage } from '../../lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '../../lib/api-helpers';

// GET - Obtener todos los items del menú
export const GET: APIRoute = async ({ url, request }) => {
  try {
    const categoryId = url.searchParams.get('categoryId');
    const availableOnly = url.searchParams.get('availableOnly') === 'true';
    
    // Usar el cliente de Supabase con autenticación si está disponible
    let client = supabase;
    
    // Intentar obtener token de autenticación (opcional para lectura pública)
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseAnonKey) {
        client = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } }
        });
      }
    }
    
    let query = client
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
    
    // Log para debugging
    console.log(`✅ GET menu-items: ${data?.length || 0} items encontrados`);
    
    return jsonResponse({ success: true, data });
  } catch (error: any) {
    console.error('Error en GET menu-items:', error);
    return errorResponse('Error interno: ' + (error.message || 'Desconocido'), 500);
  }
};

// POST - Crear nuevo item
export const POST: APIRoute = async (context) => {
  try {
    // Leer el body ANTES de requireAuth para evitar problemas
    const body = await context.request.json();
    
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    const { name, description, price, category_id, image_url, is_available, is_featured, order_num } = body;
    
    if (!name) {
      return errorResponse('El nombre es requerido', 400);
    }
    
    const { data, error } = await authSupabase
      .from('menu_items')
      .insert([{
        name,
        description: description || null,
        price: price || 0,
        category_id: category_id || null,
        image_url: image_url || null,
        is_available: is_available ?? true,
        is_featured: is_featured ?? false,
        order_num: order_num || 0,
      }])
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .single();
    
    if (error) {
      console.error('Error creando item:', error);
      return errorResponse('Error al crear item: ' + error.message, 500);
    }
    
    return jsonResponse({ success: true, data }, 201);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en POST menu-items:', error);
    return errorResponse('Error interno: ' + (error.message || 'Desconocido'), 500);
  }
};

// PUT - Actualizar item completo
export const PUT: APIRoute = async (context) => {
  try {
    // Leer el body ANTES de requireAuth para evitar problemas
    const body = await context.request.json();
    
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    const { id, name, description, price, category_id, image_url, is_available, is_featured, order_num } = body;
    
    console.log('📥 PUT menu-items-v2 - Datos recibidos:', {
      id,
      name,
      image_url,
      image_url_type: typeof image_url,
      image_url_length: image_url?.length,
      has_image: !!image_url
    });
    
    if (!id) {
      return errorResponse('ID del item requerido', 400);
    }
    
    // Si se está cambiando la imagen, eliminar la anterior
    if (image_url !== undefined) {
      const { data: currentItem } = await authSupabase
        .from('menu_items')
        .select('image_url')
        .eq('id', id)
        .single();
      
      if (currentItem?.image_url && currentItem.image_url !== image_url) {
        await deleteImage(currentItem.image_url);
      }
    }
    
    const updateData: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (image_url !== undefined) {
      // Asegurarse de que image_url se guarde correctamente (incluso si es null)
      updateData.image_url = image_url || null;
      console.log('🖼️ Guardando image_url:', {
        value: updateData.image_url,
        type: typeof updateData.image_url,
        isNull: updateData.image_url === null,
        isUndefined: updateData.image_url === undefined
      });
    }
    if (is_available !== undefined) updateData.is_available = is_available;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (order_num !== undefined) updateData.order_num = order_num;
    
    console.log('💾 Datos a actualizar en BD:', updateData);
    
    const { data, error } = await authSupabase
      .from('menu_items')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .single();
    
    if (error) {
      console.error('❌ Error actualizando item:', error);
      return errorResponse('Error al actualizar: ' + error.message, 500);
    }
    
    console.log('✅ Item actualizado exitosamente:', {
      id: data?.id,
      name: data?.name,
      image_url: data?.image_url,
      has_image: !!data?.image_url
    });
    
    return jsonResponse({ success: true, data });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en PUT menu-items:', error);
    return errorResponse('Error interno: ' + (error.message || 'Desconocido'), 500);
  }
};

// PATCH - Actualizar parcialmente (toggle disponible, destacado, etc.)
export const PATCH: APIRoute = async (context) => {
  try {
    // Leer el body ANTES de requireAuth para evitar problemas
    const body = await context.request.json();
    
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    const { id, ...updates } = body;
    
    if (!id) {
      return errorResponse('ID del item requerido', 400);
    }
    
    updates.updated_at = new Date().toISOString();
    
    const { data, error } = await authSupabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error actualizando item:', error);
      return errorResponse('Error al actualizar: ' + error.message, 500);
    }
    
    return jsonResponse({ success: true, data });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en PATCH menu-items:', error);
    return errorResponse('Error interno: ' + (error.message || 'Desconocido'), 500);
  }
};

// DELETE - Eliminar item
export const DELETE: APIRoute = async (context) => {
  try {
    // Leer el body ANTES de requireAuth para evitar problemas
    const body = await context.request.json();
    
    const authResult = await requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const { supabase: authSupabase } = authResult;
    const { id } = body;
    
    if (!id) {
      return errorResponse('ID del item requerido', 400);
    }
    
    // Obtener item para eliminar su imagen
    const { data: item } = await authSupabase
      .from('menu_items')
      .select('image_url')
      .eq('id', id)
      .single();
    
    if (item?.image_url) {
      await deleteImage(item.image_url);
    }
    
    const { error } = await authSupabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error eliminando item:', error);
      return errorResponse('Error al eliminar: ' + error.message, 500);
    }
    
    return jsonResponse({ success: true, message: 'Item eliminado' });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Error en DELETE menu-items:', error);
    return errorResponse('Error interno: ' + (error.message || 'Desconocido'), 500);
  }
};

