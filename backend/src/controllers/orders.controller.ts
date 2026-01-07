/**
 * Controller de Órdenes
 * Maneja las peticiones HTTP relacionadas con órdenes
 */

import { Request } from '../@types';
import { OrdersService } from '../services/orders.service';
import { requireAuth } from '../helpers/auth';
import { successResponse, errorResponse } from '../helpers/api-helpers';

// Importación dinámica del printer-service (está en el frontend)
<<<<<<< HEAD
// En producción, esto debería estar en el backend o ser un servicio separado
// NOTA: En Vercel, el servicio de impresión no está disponible (solo funciona localmente)
async function getPrinterService() {
  // En producción (Vercel), el servicio de impresión no está disponible
  // Solo funciona en servidor local con impresoras físicas
  // Durante el build, siempre retornar null para evitar errores de resolución
  const isVercel = typeof process !== 'undefined' && (process.env.VERCEL || process.env.VERCEL_ENV);
  const isBuildTime = typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'production';
  
  if (isVercel || isBuildTime) {
    return null;
  }

  // Solo intentar importar en desarrollo local
  // NOTA: Esta importación puede fallar durante el build, pero está envuelta en try-catch
  try {
    // Usar import dinámico con ruta relativa
    // Rollup puede intentar analizarla, pero el catch la manejará
    const printerModule = await import('../../src/lib/printer-service').catch(() => null);
    
    if (!printerModule || !printerModule.printKitchenCommand || !printerModule.printCustomerReceipt) {
      return null;
    }
    
    return {
      printKitchenCommand: printerModule.printKitchenCommand,
      printCustomerReceipt: printerModule.printCustomerReceipt,
    };
  } catch (error) {
    // Silenciar errores durante build - el servicio no está disponible en Vercel de todas formas
    return null;
  }
=======
// NOTA: Deshabilitado durante el build para evitar errores de resolución de Rollup
// La impresión se puede manejar mediante el servicio local de impresión si está configurado
async function getPrinterService() {
  // Retornar null para evitar problemas de resolución durante el build
  // La funcionalidad de impresión se maneja mejor a través del servicio local de impresión
  // que se ejecuta por separado y no interfiere con el build
  return null;
>>>>>>> dd47a5b19273f5df884acaecad7c9e9393285722
}

export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  async updateOrder(request: Request, ordenId: string) {
    try {
      // Verificar autenticación
      const authResult = await requireAuth(request);
      if (authResult instanceof Response) return authResult;
      const { supabase } = authResult;

      if (!ordenId) {
        return errorResponse('ID de orden requerido', 400);
      }

      const body = await request.json();
      const { estado, metodo_pago, total, propina_calculada, paid_at } = body;

      // Obtener orden actual para comparar estados
      const ordenActual = await this.ordersService.getOrderById(ordenId);
      if (!ordenActual) {
        return errorResponse('Orden no encontrada', 404);
      }

      const estadoAnterior = ordenActual.estado;
      const estadoNuevo = estado || ordenActual.estado;

      // Preparar datos de actualización
      const updateData: any = {};
      if (estado !== undefined) updateData.estado = estado;
      if (metodo_pago !== undefined) updateData.metodo_pago = metodo_pago;
      if (total !== undefined) updateData.total = total;
      if (propina_calculada !== undefined) updateData.propina_calculada = propina_calculada;
      if (paid_at !== undefined) updateData.paid_at = paid_at;

      // Actualizar orden
      const ordenActualizada = await this.ordersService.updateOrder(ordenId, updateData);

      // Si el estado cambió, intentar imprimir (sin bloquear si falla)
      if (estadoAnterior !== estadoNuevo) {
        // Obtener items de la orden para impresión
        const items = await this.ordersService.getOrderItems(ordenId);

        // Obtener servicio de impresión
        const printerService = await getPrinterService();

        // Imprimir según el nuevo estado
        if (estadoNuevo === 'preparing' && items.length > 0 && printerService) {
          console.log('[OrdersController] Estado cambió a "preparing" - activando impresión de comanda');
          printerService.printKitchenCommand(ordenActualizada, items).catch((error) => {
            console.error('[OrdersController] ❌ Error imprimiendo comanda (no bloquea):', error);
          });
        } else if (estadoNuevo === 'paid' && items.length > 0 && printerService) {
          console.log('[OrdersController] Estado cambió a "paid" - activando impresión de boleta');
          printerService.printCustomerReceipt(ordenActualizada, items).catch((error) => {
            console.error('[OrdersController] ❌ Error imprimiendo boleta (no bloquea):', error);
          });
        }
      }

      return successResponse(ordenActualizada, 'Orden actualizada correctamente');
    } catch (error: any) {
      console.error('Error en updateOrder:', error);
      return errorResponse('Error interno: ' + (error.message || 'Desconocido'), 500);
    }
  }
}

