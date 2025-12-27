/**
 * API Route para actualizar órdenes
 * 
 * Esta ruta usa el backend separado (OrdersController)
 */

import type { APIRoute } from 'astro';
import { OrdersController } from '@backend/controllers/orders.controller';
import { OrdersService } from '@backend/services/orders.service';
import { supabase } from '@backend/database/supabase';

export const PATCH: APIRoute = async (context) => {
  try {
    const ordenId = context.params.id;
    if (!ordenId) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID de orden requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear servicio y controller
    // El controller manejará la autenticación internamente
    const { supabase: backendSupabase } = await import('@backend/database/supabase');
    const ordersService = new OrdersService(backendSupabase.supabase);
    const ordersController = new OrdersController(ordersService);

    // Llamar al controller (maneja auth internamente)
    return await ordersController.updateOrder(context.request as any, ordenId);
  } catch (error: any) {
    console.error('Error en PATCH ordenes/[id]:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno: ' + (error.message || 'Desconocido') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

