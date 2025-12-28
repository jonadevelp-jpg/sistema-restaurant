export type PaymentMethod = "TARJETA" | "TRANSFERENCIA" | "EFECTIVO" | "";

export interface CommissionParams {
  paymentMethod: PaymentMethod;
  costoIngredientes: number; // Costo de ingredientes
  precioTotal: number; // Precio total cobrado
}

/**
 * Calcula la propina/comisión del mesero basada en el método de pago
 * Adaptado del sistema de reparaciones para restaurante
 */
export function calcCommission(params: CommissionParams): number {
  const { paymentMethod, costoIngredientes, precioTotal } = params;
  
  if (!paymentMethod) return 0;
  
  let precioDespuesConversion = precioTotal;
  
  // Para tarjeta/transferencia: aplicar descuentos
  if (paymentMethod === "TARJETA" || paymentMethod === "TRANSFERENCIA") {
    // Descontar 19% (dividir entre 1.19)
    precioDespuesConversion = precioTotal / 1.19;
    
    // Solo para TARJETA: descontar 1.99% por comisión de tarjeta
    if (paymentMethod === "TARJETA") {
      precioDespuesConversion = precioDespuesConversion * (1 - 0.0199);
    }
  }
  
  // Ganancia = precio (después de conversión si aplica) - costo de ingredientes
  const ganancia = precioDespuesConversion - costoIngredientes;
  
  // Propina/Comisión = 40% de la ganancia neta (ajustable)
  const commission = Math.max(0, ganancia * 0.4);
  
  return commission;
}




