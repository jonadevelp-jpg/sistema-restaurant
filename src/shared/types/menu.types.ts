/**
 * Tipos compartidos para menú
 * Usado tanto en frontend como backend
 */

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  order_num: number;
  is_active: boolean;
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
  created_at: string;
  updated_at: string;
  category?: Category;
}

