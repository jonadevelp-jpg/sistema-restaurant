/**
 * Tipos compartidos para print jobs
 * Usado tanto en frontend como backend y servicio de impresión
 */

export type PrintJobType = 'kitchen' | 'receipt' | 'payment';
export type PrintJobStatus = 'pending' | 'printing' | 'printed' | 'error';
export type PrinterTarget = 'kitchen' | 'cashier';

export interface PrintJob {
  id: string;
  orden_id: string;
  type: PrintJobType;
  printer_target: PrinterTarget;
  status: PrintJobStatus;
  error_message: string | null;
  attempts: number;
  created_at: string;
  printed_at: string | null;
  requested_by: string | null;
}

export interface CreatePrintJobRequest {
  ordenId: string;
  type: PrintJobType;
  printerTarget?: PrinterTarget;
}

