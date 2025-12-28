/**
 * Constantes para tipos de impresión
 */

import type { PrintJobType, PrinterTarget, PrintJobStatus } from '../types/print-jobs.types';

export const PRINT_JOB_TYPES: PrintJobType[] = ['kitchen', 'receipt', 'payment'];
export const PRINTER_TARGETS: PrinterTarget[] = ['kitchen', 'cashier'];
export const PRINT_JOB_STATUSES: PrintJobStatus[] = ['pending', 'printing', 'printed', 'error'];

export const PRINT_TYPE_LABELS: Record<PrintJobType, string> = {
  kitchen: 'Comanda de Cocina',
  receipt: 'Boleta de Cliente',
  payment: 'Recibo de Pago',
};

export const PRINTER_TARGET_LABELS: Record<PrinterTarget, string> = {
  kitchen: 'Cocina',
  cashier: 'Caja',
};

