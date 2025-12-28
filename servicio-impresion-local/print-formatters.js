/**
 * Funciones de formateo profesional para impresión ESC/POS
 * 
 * Este módulo contiene funciones auxiliares para formatear
 * comandas y boletas con formato profesional, respetando
 * el ancho máximo de 32 caracteres (58mm).
 */

const WIDTH = 32; // Ancho máximo para impresora POS58 (58mm)

/**
 * Formatea un precio en pesos chilenos
 */
function formatPrice(price) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(price));
}

/**
 * Trunca texto a un ancho máximo, agregando "..." si es necesario
 */
function truncateText(text, maxWidth) {
  if (!text) return '';
  const str = String(text);
  if (str.length <= maxWidth) return str;
  return str.substring(0, maxWidth - 3) + '...';
}

/**
 * Formatea el encabezado del local para boleta
 */
function formatReceiptHeader(formatter) {
  formatter
    .alignCenter()
    .sizeDouble()
    .textLine('GOURMET ARABE SPA')
    .sizeNormal()
    .textLine('RUT: 77669643-9')
    .textLine('Providencia 1388 Local 49')
    .textLine('Celular: 939459286')
    .separator('-', WIDTH);
}

/**
 * Formatea el encabezado de comanda
 */
function formatKitchenHeader(formatter) {
  formatter
    .alignCenter()
    .sizeDouble()
    .textLine('COMANDA COCINA')
    .sizeNormal()
    .separator('=', WIDTH);
}

/**
 * Formatea la información de la orden
 */
function formatOrderInfo(formatter, orden) {
  formatter
    .alignLeft()
    .textLine(`Orden: ${truncateText(orden.numero_orden, WIDTH - 7)}`)
    .textLine(`Mesa: ${orden.mesas?.numero || 'N/A'}`)
    .textLine(`Fecha: ${new Date(orden.created_at).toLocaleDateString('es-CL')}`)
    .textLine(`Hora: ${new Date(orden.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`)
    .separator('-', WIDTH);
}

/**
 * Formatea items de comanda (sin precios)
 */
function formatKitchenItems(formatter, items) {
  // Agrupar items por categoría
  const itemsPorCategoria = items.reduce((acc, item) => {
    const categoria = item.menu_item?.category_id || 0;
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(item);
    return acc;
  }, {});
  
  Object.entries(itemsPorCategoria).forEach(([categoriaId, categoriaItems]) => {
    categoriaItems.forEach((item) => {
      const nombre = truncateText(item.menu_item?.name || 'Item', WIDTH - 5).toUpperCase();
      formatter.textLine(`${item.cantidad}x ${nombre}`);
      
      // Personalización
      if (item.notas) {
        try {
          const personalization = JSON.parse(item.notas);
          const parts = [];
          
          if (personalization.agregado) parts.push(`Agregado: ${personalization.agregado}`);
          if (personalization.salsas?.length > 0) {
            parts.push(`Salsa${personalization.salsas.length > 1 ? 's' : ''}: ${personalization.salsas.join(', ')}`);
          }
          if (personalization.sinIngredientes?.length > 0) {
            parts.push(`Sin: ${personalization.sinIngredientes.join(', ')}`);
          }
          if (personalization.bebidas?.length > 0) {
            const bebidasText = personalization.bebidas.map(b => {
              if (b.sabor) return `${b.nombre} (${b.sabor})`;
              return b.nombre;
            }).join(', ');
            parts.push(`Bebida${personalization.bebidas.length > 1 ? 's' : ''}: ${bebidasText}`);
          }
          if (personalization.detalles) parts.push(`Nota: ${personalization.detalles}`);
          
          if (parts.length > 0) {
            parts.forEach(part => {
              const nota = truncateText(`  ${part}`, WIDTH);
              formatter.textLine(nota);
            });
          }
        } catch {
          // Si no es JSON, usar como texto simple
          const nota = truncateText(`  ${item.notas}`, WIDTH);
          formatter.textLine(nota);
        }
      }
      
      formatter.blankLine();
    });
  });
}

/**
 * Formatea items de boleta con precios (formato tabular)
 */
function formatReceiptItems(formatter, items) {
  // Calcular desglose IVA
  const calcularDesgloseIVA = (precioConIVA) => {
    const precioSinIVA = precioConIVA / 1.19;
    const iva = precioConIVA - precioSinIVA;
    return { sinIVA: precioSinIVA, iva, conIVA: precioConIVA };
  };
  
  // Encabezado de tabla
  formatter
    .alignLeft()
    .textLine('Cant Descripcion        Total')
    .separator('-', WIDTH);
  
  // Items
  items.forEach((item) => {
    const desglose = calcularDesgloseIVA(item.subtotal);
    const nombre = truncateText(item.menu_item?.name || 'Item', 18);
    const cantidad = item.cantidad.toString().padStart(2);
    const precio = formatPrice(desglose.sinIVA).padStart(10);
    
    // Formato: " 2  SHAWARMA POLLO    $12.345"
    const line = `${cantidad}  ${nombre.padEnd(18)} ${precio}`;
    formatter.textLine(truncateText(line, WIDTH));
  });
}

/**
 * Formatea totales de boleta
 */
function formatReceiptTotals(formatter, items) {
  // Calcular desglose IVA
  const calcularDesgloseIVA = (precioConIVA) => {
    const precioSinIVA = precioConIVA / 1.19;
    const iva = precioConIVA - precioSinIVA;
    return { sinIVA: precioSinIVA, iva, conIVA: precioConIVA };
  };
  
  const subtotalSinIVA = items.reduce((sum, item) => {
    const desglose = calcularDesgloseIVA(item.subtotal);
    return sum + desglose.sinIVA;
  }, 0);
  
  const ivaTotal = items.reduce((sum, item) => {
    const desglose = calcularDesgloseIVA(item.subtotal);
    return sum + desglose.iva;
  }, 0);
  
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  
  formatter
    .separator('-', WIDTH)
    .alignLeft()
    .textFixedWidth(`Monto Neto:     ${formatPrice(subtotalSinIVA)}`, WIDTH, 'left')
    .textFixedWidth(`IVA (19%):      ${formatPrice(ivaTotal)}`, WIDTH, 'left')
    .separator('-', WIDTH)
    .boldOn()
    .textFixedWidth(`TOTAL:          ${formatPrice(total)}`, WIDTH, 'left')
    .boldOff();
}

/**
 * Formatea información de pago
 */
function formatPaymentInfo(formatter, orden) {
  if (orden.metodo_pago || orden.paid_at) {
    formatter
      .separator('-', WIDTH)
      .alignLeft();
    
    if (orden.metodo_pago) {
      formatter.textLine(`Metodo de Pago: ${orden.metodo_pago}`);
    }
    
    if (orden.paid_at) {
      formatter.textLine(`Pagado: ${new Date(orden.paid_at).toLocaleString('es-CL')}`);
    }
  }
}

/**
 * Formatea el pie de página de boleta
 */
function formatReceiptFooter(formatter) {
  formatter
    .separator('-', WIDTH)
    .alignCenter()
    .textLine('¡Gracias por su visita!')
    .textLine('Carne Halal Certificada')
    .textLine(new Date().toLocaleString('es-CL'))
    .feed(2)
    .cut();
}

/**
 * Formatea el pie de página de comanda
 */
function formatKitchenFooter(formatter, items) {
  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  
  formatter
    .separator('-', WIDTH)
    .alignCenter()
    .textLine(`Total Items: ${totalItems}`)
    .textLine(new Date().toLocaleString('es-CL'))
    .feed(2)
    .cut();
}

/**
 * Formatea nota general de la orden
 */
function formatGeneralNote(formatter, nota) {
  if (nota) {
    formatter
      .separator('-', WIDTH)
      .alignLeft()
      .boldOn()
      .textLine('NOTA GENERAL:')
      .boldOff()
      .textLine(truncateText(nota, WIDTH));
  }
}

module.exports = {
  WIDTH,
  formatPrice,
  truncateText,
  formatReceiptHeader,
  formatKitchenHeader,
  formatOrderInfo,
  formatKitchenItems,
  formatReceiptItems,
  formatReceiptTotals,
  formatPaymentInfo,
  formatReceiptFooter,
  formatKitchenFooter,
  formatGeneralNote
};

