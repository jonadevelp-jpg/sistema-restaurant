/**
 * Validadores para categorías
 */

import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  order_num: z.number().int().min(0).optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export const updateCategorySchema = z.object({
  id: z.number().int().positive('ID de categoría requerido'),
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  order_num: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export const deleteCategorySchema = z.object({
  id: z.number().int().positive('ID de categoría requerido'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;

