/**
 * Tipos compartidos del Backend
 */

import { SupabaseClient } from '@supabase/supabase-js';

// Tipos de visualización
export type VisualType = 'hero' | 'list' | 'drink' | null;
export type TipoPedido = 'barra' | 'llevar' | null;

// Tipos de base de datos
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  order_num: number;
  is_active: boolean;
  visual_type?: VisualType;
  image_url?: string | null;
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

// Tipos de respuesta API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Contexto de autenticación
export interface AuthContext {
  user: any;
  supabase: SupabaseClient;
  userProfile: {
    id: string;
    role: 'admin' | 'mesero' | 'encargado';
    name: string;
    email: string;
  };
}

// Request type para controllers
export interface Request {
  url: string;
  method: string;
  headers: Headers;
  json(): Promise<any>;
  text(): Promise<string>;
}

