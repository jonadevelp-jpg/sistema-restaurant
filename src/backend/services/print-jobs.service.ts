/**
 * Servicio de lógica de negocio para print jobs
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { PrintJobsQueries } from '../database/print-jobs.queries';
import type { CreatePrintJobInput } from '../validators/print-jobs.validator';
import type { PrintJob } from '../../shared/types/print-jobs.types';

export class PrintJobsService {
  private queries: PrintJobsQueries;

  constructor(supabase: SupabaseClient) {
    this.queries = new PrintJobsQueries(supabase);
  }

  /**
   * Crea un nuevo print job
   */
  async createPrintJob(
    input: CreatePrintJobInput,
    requestedBy: string
  ): Promise<PrintJob> {
    // Verificar que la orden existe
    const orderExists = await this.queries.verifyOrderExists(input.ordenId);
    if (!orderExists) {
      throw new Error('Orden no encontrada');
    }

    // Verificar que la orden tenga items
    const hasItems = await this.queries.verifyOrderHasItems(input.ordenId);
    if (!hasItems) {
      throw new Error('La orden no tiene items para imprimir');
    }

    // Determinar printer_target si no se proporciona
    const printerTarget = input.printerTarget || 
      (input.type === 'kitchen' ? 'kitchen' : 'cashier');

    // Crear el print job
    const printJob = await this.queries.create({
      ordenId: input.ordenId,
      type: input.type,
      printerTarget,
      requestedBy,
    });

    return printJob;
  }
}

