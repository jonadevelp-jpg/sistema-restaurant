/**
 * Servicio de Órdenes
 * Lógica de negocio para órdenes y items de órdenes
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Orden, OrdenItem, TipoPedido } from '../@types';

export class OrdersService {
  constructor(private supabase: SupabaseClient) {}

  // ==================== ÓRDENES ====================

  async getOrders(options: {
    estado?: string[];
    tipoPedido?: TipoPedido;
    meseroId?: string;
  } = {}): Promise<Orden[]> {
    let query = this.supabase
      .from('ordenes_restaurante')
      .select('*')
      .order('created_at', { ascending: false });

    if (options.estado && options.estado.length > 0) {
      query = query.in('estado', options.estado);
    }

    if (options.tipoPedido) {
      query = query.eq('tipo_pedido', options.tipoPedido);
    }

    if (options.meseroId) {
      query = query.eq('mesero_id', options.meseroId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Orden[];
  }

  async getOrderById(id: string): Promise<Orden | null> {
    const { data, error } = await this.supabase
      .from('ordenes_restaurante')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Orden | null;
  }

  async createOrder(order: {
    numero_orden: string;
    tipo_pedido: TipoPedido;
    mesero_id: string;
    estado?: string;
  }): Promise<Orden> {
    const { data, error } = await this.supabase
      .from('ordenes_restaurante')
      .insert([
        {
          numero_orden: order.numero_orden,
          tipo_pedido: order.tipo_pedido,
          mesa_id: null, // Sistema sin mesas
          mesero_id: order.mesero_id,
          estado: order.estado || 'pending',
          total: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Orden;
  }

  async updateOrder(
    id: string,
    updates: Partial<Orden>
  ): Promise<Orden> {
    const updateData: any = {};

    if (updates.estado !== undefined) updateData.estado = updates.estado;
    if (updates.metodo_pago !== undefined) updateData.metodo_pago = updates.metodo_pago;
    if (updates.total !== undefined) updateData.total = updates.total;
    if (updates.propina_calculada !== undefined) updateData.propina_calculada = updates.propina_calculada;
    if (updates.paid_at !== undefined) updateData.paid_at = updates.paid_at;
    if (updates.nota !== undefined) updateData.nota = updates.nota;

    const { data, error } = await this.supabase
      .from('ordenes_restaurante')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Orden;
  }

  async deleteOrder(id: string): Promise<void> {
    // Los items se eliminan automáticamente por CASCADE
    const { error } = await this.supabase
      .from('ordenes_restaurante')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ==================== ORDEN ITEMS ====================

  async getOrderItems(ordenId: string): Promise<OrdenItem[]> {
    const { data, error } = await this.supabase
      .from('orden_items')
      .select(
        `
        *,
        menu_items(id, name, category_id, image_url)
      `
      )
      .eq('orden_id', ordenId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      orden_id: item.orden_id,
      menu_item_id: item.menu_item_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal,
      notas: item.notas,
      created_at: item.created_at,
      menu_item: item.menu_items,
    })) as OrdenItem[];
  }

  async addOrderItem(item: {
    orden_id: string;
    menu_item_id: number;
    cantidad: number;
    precio_unitario: number;
    notas?: string;
  }): Promise<OrdenItem> {
    const subtotal = item.cantidad * item.precio_unitario;

    const { data, error } = await this.supabase
      .from('orden_items')
      .insert([
        {
          orden_id: item.orden_id,
          menu_item_id: item.menu_item_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal,
          notas: item.notas || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // El trigger actualiza automáticamente el total de la orden
    return data as OrdenItem;
  }

  async updateOrderItem(
    id: string,
    updates: {
      cantidad?: number;
      precio_unitario?: number;
      notas?: string;
    }
  ): Promise<OrdenItem> {
    const updateData: any = {};

    if (updates.cantidad !== undefined) updateData.cantidad = updates.cantidad;
    if (updates.precio_unitario !== undefined) updateData.precio_unitario = updates.precio_unitario;
    if (updates.notas !== undefined) updateData.notas = updates.notas;

    // Recalcular subtotal si cambió cantidad o precio
    if (updates.cantidad !== undefined || updates.precio_unitario !== undefined) {
      // Obtener el item actual para calcular el subtotal
      const { data: currentItem } = await this.supabase
        .from('orden_items')
        .select('cantidad, precio_unitario')
        .eq('id', id)
        .single();

      const cantidad = updates.cantidad ?? currentItem?.cantidad ?? 1;
      const precioUnitario = updates.precio_unitario ?? currentItem?.precio_unitario ?? 0;
      updateData.subtotal = cantidad * precioUnitario;
    }

    const { data, error } = await this.supabase
      .from('orden_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // El trigger actualiza automáticamente el total de la orden
    return data as OrdenItem;
  }

  async deleteOrderItem(id: string): Promise<void> {
    const { error } = await this.supabase.from('orden_items').delete().eq('id', id);

    if (error) throw error;

    // El trigger actualiza automáticamente el total de la orden
  }
}




