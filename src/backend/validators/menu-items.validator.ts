/**
 * Validadores para items del menú
 */

import { z } from 'zod';

export const createMenuItemSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().nullable().optional(),
  price: z.number().min(0).optional().default(0),
  category_id: z.number().int().positive().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  is_available: z.boolean().optional().default(true),
  is_featured: z.boolean().optional().default(false),
  order_num: z.number().int().min(0).optional().default(0),
});

export const updateMenuItemSchema = z.object({
  id: z.number().int().positive('ID del item requerido'),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  price: z.number().min(0).optional(),
  category_id: z.number().int().positive().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  is_available: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  order_num: z.number().int().min(0).optional(),
});

export const deleteMenuItemSchema = z.object({
  id: z.number().int().positive('ID del item requerido'),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type DeleteMenuItemInput = z.infer<typeof deleteMenuItemSchema>;

