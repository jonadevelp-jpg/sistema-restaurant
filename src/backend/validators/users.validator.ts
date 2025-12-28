/**
 * Validadores para usuarios
 */

import { z } from 'zod';
import { USER_ROLES } from '../../shared/constants';

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(1, 'El nombre es requerido'),
  role: z.enum(['admin', 'encargado', 'mesero'] as const, {
    errorMap: () => ({ message: `Rol debe ser uno de: ${USER_ROLES.join(', ')}` }),
  }).optional().default('mesero'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

