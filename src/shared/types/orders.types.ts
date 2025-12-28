/**
 * Tipos compartidos para órdenes
 * Usado tanto en frontend como backend
 */

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';

export interface Orden {
  id: string;
  numero_orden: string;
  mesa_id: string | null;
  estado: OrderStatus;
  total: number | null;
  propina_calculada: number | null;
  metodo_pago: string | null;
  nota: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  mesas?: {
    id: string;
    numero: number;
    capacidad: number;
    estado: string;
    ubicacion: string;
  };
}

export interface OrdenItem {
  id: string;
  orden_id: string;
  menu_item_id: number;
  cantidad: number;
  subtotal: number;
  notas: string | null;
  menu_item?: {
    id: number;
    name: string;
    price: number;
    description: string | null;
    image_url: string | null;
    category_id: number | null;
  };
}

