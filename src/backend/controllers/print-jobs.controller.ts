/**
 * Controller para print jobs
 * Maneja request/response y delega lógica a services
 */

import type { APIRoute } from 'astro';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PrintJobsService } from '../services/print-jobs.service';
import { createPrintJobSchema } from '../validators/print-jobs.validator';
import { jsonResponse, errorResponse } from '../helpers';

export class PrintJobsController {
  private service: PrintJobsService;

  constructor(supabase: SupabaseClient) {
    this.service = new PrintJobsService(supabase);
  }

  /**
   * POST /api/print-jobs
   * Crea un nuevo print job
   */
  async create(context: any, user: any): Promise<Response> {
    try {
      const body = await context.request.json();
      
      // Validar entrada
      const validationResult = createPrintJobSchema.safeParse(body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        return errorResponse(`Error de validación: ${errors}`, 400);
      }

      const input = validationResult.data;

      // Crear print job
      const printJob = await this.service.createPrintJob(input, user.id);

      // Determinar mensaje según tipo
      const messages = {
        kitchen: 'Comanda enviada a cola de impresión',
        receipt: 'Boleta enviada a cola de impresión',
        payment: 'Recibo de pago enviado a cola de impresión',
      };

      console.log(`[API Print Jobs] ✅ Print job creado: ${printJob.id} (tipo: ${input.type})`);

      return jsonResponse({
        success: true,
        data: printJob,
        message: messages[input.type],
      });
    } catch (error: any) {
      console.error('[API Print Jobs] Error:', error);
      
      // Detectar error de tabla no encontrada
      if (error.message && error.message.includes('Could not find the table') && error.message.includes('print_jobs')) {
        return errorResponse(
          'La tabla print_jobs no existe. Por favor ejecuta el script SQL: database/CREAR_TABLA_PRINT_JOBS.sql en Supabase SQL Editor.',
          500
        );
      }
      
      return errorResponse(error.message || 'Error interno', 500);
    }
  }
}

