/**
 * Constantes para roles de usuario
 */

import type { UserRole } from '../types/users.types';

export const USER_ROLES: UserRole[] = ['admin', 'encargado', 'mesero'];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  encargado: 'Encargado',
  mesero: 'Mesero',
};

