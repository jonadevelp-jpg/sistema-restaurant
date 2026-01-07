export type PaymentMethod = "TARJETA" | "TRANSFERENCIA" | "EFECTIVO" | "";

export interface CommissionParams {
  paymentMethod: PaymentMethod;
  costoIngredientes: number;
  precioTotal: number;
}

/**
 * Calcula la propina/comisión del mesero basada en el método de pago
 */
export function calcCommission(params: CommissionParams): number {
  const { paymentMethod, costoIngredientes, precioTotal } = params;
  
  if (!paymentMethod) return 0;
  
  let precioDespuesConversion = precioTotal;
  
  if (paymentMethod === "TARJETA" || paymentMethod === "TRANSFERENCIA") {
    precioDespuesConversion = precioTotal / 1.19;
    
    if (paymentMethod === "TARJETA") {
      precioDespuesConversion = precioDespuesConversion * (1 - 0.0199);
    }
  }
  
  const ganancia = precioDespuesConversion - costoIngredientes;
  const commission = Math.max(0, ganancia * 0.4);
  
  return commission;
}




