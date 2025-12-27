/**
 * Cliente API para comunicación con backend
 * Centraliza todas las llamadas a la API
 */

import type { Category, MenuItem, Orden, OrdenItem, TipoPedido } from '../@types';

const API_BASE = '/api';

// Helper para hacer requests
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

// Helper para requests autenticados
async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  // Obtener token de Supabase
  const { supabase } = await import('../../src/lib/supabase');
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  return request<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

// ==================== MENÚ ====================

export const menuApi = {
  // Categorías
  async getCategories(onlyActive: boolean = false): Promise<Category[]> {
    const result = await request<Category[]>(`/categories-v2?onlyActive=${onlyActive}`);
    return result.data || [];
  },

  async createCategory(category: Partial<Category>): Promise<Category> {
    const result = await authenticatedRequest<Category>('/categories-v2', {
      method: 'POST',
      body: JSON.stringify(category),
    });
    if (!result.success || !result.data) throw new Error(result.error || 'Error creando categoría');
    return result.data;
  },

  async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
    const result = await authenticatedRequest<Category>('/categories-v2', {
      method: 'PUT',
      body: JSON.stringify({ id, ...category }),
    });
    if (!result.success || !result.data) throw new Error(result.error || 'Error actualizando categoría');
    return result.data;
  },

  async deleteCategory(id: number): Promise<void> {
    const result = await authenticatedRequest('/categories-v2', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
    if (!result.success) throw new Error(result.error || 'Error eliminando categoría');
  },

  // Menu Items
  async getMenuItems(options: {
    categoryId?: number;
    availableOnly?: boolean;
  } = {}): Promise<MenuItem[]> {
    const params = new URLSearchParams();
    if (options.categoryId) params.append('categoryId', options.categoryId.toString());
    if (options.availableOnly) params.append('availableOnly', 'true');

    const result = await request<MenuItem[]>(`/menu/items?${params.toString()}`);
    return result.data || [];
  },

  async createMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
    const result = await authenticatedRequest<MenuItem>('/menu-items-v2', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    if (!result.success || !result.data) throw new Error(result.error || 'Error creando item');
    return result.data;
  },

  async updateMenuItem(id: number, item: Partial<MenuItem>): Promise<MenuItem> {
    const result = await authenticatedRequest<MenuItem>('/menu-items-v2', {
      method: 'PUT',
      body: JSON.stringify({ id, ...item }),
    });
    if (!result.success || !result.data) throw new Error(result.error || 'Error actualizando item');
    return result.data;
  },

  async deleteMenuItem(id: number): Promise<void> {
    const result = await authenticatedRequest('/menu-items-v2', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
    if (!result.success) throw new Error(result.error || 'Error eliminando item');
  },
};

// ==================== ÓRDENES ====================

export const ordersApi = {
  async updateOrder(
    id: string,
    updates: Partial<Orden>
  ): Promise<Orden> {
    const result = await authenticatedRequest<Orden>(`/ordenes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (!result.success || !result.data) throw new Error(result.error || 'Error actualizando orden');
    return result.data;
  },
};
