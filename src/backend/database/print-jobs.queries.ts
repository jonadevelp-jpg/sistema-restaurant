/**
 * Queries de base de datos para print jobs
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { PrintJob, CreatePrintJobRequest } from '../../shared/types/print-jobs.types';

export class PrintJobsQueries {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Crea un nuevo print job
   */
  async create(data: CreatePrintJobRequest & { requestedBy: string }): Promise<PrintJob> {
    const { data: printJob, error } = await this.supabase
      .from('print_jobs')
      .insert({
        orden_id: data.ordenId,
        type: data.type,
        printer_target: data.printerTarget || (data.type === 'kitchen' ? 'kitchen' : 'cashier'),
        status: 'pending',
        requested_by: data.requestedBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creando print_job: ${error.message}`);
    }

    return printJob as PrintJob;
  }

  /**
   * Verifica que una orden existe
   */
  async verifyOrderExists(ordenId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('ordenes_restaurante')
      .select('id')
      .eq('id', ordenId)
      .single();

    return !error && !!data;
  }

  /**
   * Verifica que una orden tenga items
   */
  async verifyOrderHasItems(ordenId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('orden_items')
      .select('id')
      .eq('orden_id', ordenId)
      .limit(1);

    return !error && !!data && data.length > 0;
  }
}

