/**
 * Tipos compartidos del Frontend
 */

import type { VisualType, TipoPedido } from '../../backend/src/@types';

// Re-exportar tipos del backend
export type { VisualType, TipoPedido };

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  order_num: number;
  is_active: boolean;
  visual_type?: VisualType;
  created_at: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category_id: number | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  order_num: number;
  visual_type?: VisualType;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Orden {
  id: string;
  numero_orden: string;
  tipo_pedido: TipoPedido;
  mesa_id?: string | null;
  mesero_id: string | null;
  estado: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  total: number;
  propina_mesero?: number;
  propina_calculada?: number;
  metodo_pago?: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  nota?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}

export interface OrdenItem {
  id: string;
  orden_id: string;
  menu_item_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas?: string;
  created_at: string;
  menu_item?: MenuItem;
}

