/**
 * Queries de base de datos para órdenes
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Orden } from '../../shared/types';

export class OrdersQueries {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Obtiene una orden por ID
   */
  async getById(ordenId: string): Promise<Orden | null> {
    const { data, error } = await this.supabase
      .from('ordenes_restaurante')
      .select('*, mesas(numero)')
      .eq('id', ordenId)
      .single();

    if (error) {
        throw new Error(`Error obteniendo orden: ${error.message}`);
    }

    return data as Orden | null;
  }

  /**
   * Actualiza una orden
   */
  async update(ordenId: string, updateData: Partial<Orden>): Promise<Orden> {
    const { data, error } = await this.supabase
      .from('ordenes_restaurante')
      .update(updateData)
      .eq('id', ordenId)
      .select('*, mesas(numero)')
      .single();

    if (error) {
      throw new Error(`Error actualizando orden: ${error.message}`);
    }

    return data as Orden;
  }
}

