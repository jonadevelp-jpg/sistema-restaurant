/**
 * Validadores para print jobs
 */

import { z } from 'zod';
import { PRINT_JOB_TYPES, PRINTER_TARGETS } from '../../shared/constants';

export const createPrintJobSchema = z.object({
  ordenId: z.string().uuid('ordenId debe ser un UUID válido'),
  type: z.enum(['kitchen', 'receipt', 'payment'] as const, {
    errorMap: () => ({ message: `type debe ser uno de: ${PRINT_JOB_TYPES.join(', ')}` }),
  }),
  printerTarget: z.enum(['kitchen', 'cashier'] as const, {
    errorMap: () => ({ message: `printerTarget debe ser uno de: ${PRINTER_TARGETS.join(', ')}` }),
  }).optional(),
});

export type CreatePrintJobInput = z.infer<typeof createPrintJobSchema>;

