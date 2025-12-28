/**
 * Tipos compartidos para usuarios
 */

export type UserRole = 'admin' | 'encargado' | 'mesero';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  nombre?: string;
  created_at: string;
}

