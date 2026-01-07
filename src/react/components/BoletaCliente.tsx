import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface OrdenItem {
  id?: string;
  menu_item_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas?: string;
  menu_item?: {
    id: number;
    name: string;
  };
}

interface Orden {
  id: string;
  numero_orden: string;
  tipo_pedido?: 'barra' | 'llevar' | null;
  mesa_id?: string | null; // Mantener para compatibilidad con órdenes antiguas
  estado: string;
  total: number;
  nota?: string;
  created_at: string;
  metodo_pago?: string;
  paid_at?: string;
}

interface BoletaClienteProps {
  orden: Orden;
  items: OrdenItem[];
  onClose?: () => void;
}

export default function BoletaCliente({ orden, items, onClose }: BoletaClienteProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);

  const handlePrintReceipt = async () => {
    if (printing || !orden?.id) {
      console.log('[BoletaCliente] handlePrintReceipt bloqueado:', { printing, ordenId: orden?.id });
      return;
    }
    
    console.log('[BoletaCliente] ========== INICIANDO IMPRESIÓN DE BOLETA ==========');
    console.log('[BoletaCliente] Orden ID:', orden.id);
    
    setPrinting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      console.log('[BoletaCliente] Token de sesión:', token ? '✅ Presente' : '❌ Faltante');
      
      if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      const requestBody = {
        ordenId: orden.id,
        type: 'receipt',
        printerTarget: 'cashier',
      };
      
      console.log('[BoletaCliente] Llamando a /api/print-jobs con:', requestBody);
      
      // Crear print_job en la cola de impresión
      const response = await fetch('/api/print-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('[BoletaCliente] Respuesta recibida:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('[BoletaCliente] Resultado:', result);
      
      if (response.ok && result.success) {
        console.log('[BoletaCliente] ✅ Print job creado exitosamente');
        alert('✅ Boleta enviada a la cola de impresión');
      } else {
        console.error('[BoletaCliente] ❌ Error en respuesta:', result);
        alert(`❌ Error: ${result.error || result.message || 'No se pudo crear el trabajo de impresión'}`);
      }
    } catch (error: any) {
      console.error('[BoletaCliente] ❌ Error enviando boleta:', error);
      alert(`❌ Error al enviar boleta: ${error.message || 'Error desconocido'}`);
    } finally {
      setPrinting(false);
      console.log('[BoletaCliente] ========== FIN IMPRESIÓN DE BOLETA ==========');
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printWindow = window.open('', '_blank', 'width=220,height=600');
    if (!printWindow) {
      // Si no se puede abrir ventana, usar impresión normal
      window.print();
      return;
    }

    const styles = '@page { size: 58mm auto; margin: 0; padding: 0; } * { margin: 0; padding: 0; box-sizing: border-box; } body { width: 58mm; margin: 0; padding: 3mm; font-family: "Courier New", Courier, monospace; font-size: 8pt; line-height: 1.3; background: white; color: black; } .boleta-header { text-align: center; margin-bottom: 4px; } .boleta-logo { font-size: 10pt; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; } .boleta-subtitle { font-size: 7pt; color: #555; margin-bottom: 3px; } .boleta-separator-small { border-top: 1px solid #333; margin: 3px 0; } .boleta-info { font-size: 7pt; line-height: 1.3; text-align: left; margin-top: 3px; } .boleta-info div { margin: 1px 0; } .boleta-separator { border-top: 1px dashed #333; margin: 4px 0; } .boleta-items { margin: 4px 0; } .boleta-items-header { display: grid; grid-template-columns: 18px 1fr 50px; gap: 2px; font-weight: bold; font-size: 7pt; padding-bottom: 2px; border-bottom: 1px solid #333; margin-bottom: 3px; } .boleta-item { display: grid; grid-template-columns: 18px 1fr 50px; gap: 2px; font-size: 7pt; margin: 1px 0; padding: 1px 0; } .boleta-item-cantidad { text-align: center; font-weight: bold; } .boleta-item-descripcion { word-break: break-word; font-size: 7pt; } .boleta-item-total { text-align: right; font-weight: bold; font-size: 7pt; } .boleta-totales { margin: 6px 0; font-size: 8pt; } .boleta-total-line { display: flex; justify-content: space-between; margin: 2px 0; font-size: 8pt; } .boleta-total-final { font-size: 9pt; font-weight: bold; border-top: 2px solid black; padding-top: 3px; margin-top: 4px; } .boleta-pago { font-size: 7pt; text-align: center; padding: 3px; background: #f0f0f0; border: 1px solid #333; margin: 4px 0; } .boleta-pago div { margin: 1px 0; } .boleta-footer { text-align: center; font-size: 7pt; margin-top: 6px; padding-top: 4px; border-top: 1px solid #333; } .boleta-footer-small { font-size: 6pt; color: #666; margin-top: 2px; }';
    
    const content = printRef.current.innerHTML;
    
    printWindow.document.write('<!DOCTYPE html><html><head><title>Boleta Cliente</title><style>' + styles + '</style></head><body>' + content + '</body></html>');
    
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      if (onClose) {
        setTimeout(() => onClose(), 500);
      }
    }, 250);
  };

  // COMENTADO: Auto-impresión deshabilitada
  // La impresión ahora se maneja manualmente con el botón "Imprimir Boleta"
  // o automáticamente cuando se paga la orden
  // useEffect(() => {
  //   // Auto-imprimir cuando se monta el componente
  //   const timer = setTimeout(() => {
  //     handlePrint();
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(Math.round(price));
  };

  // Los precios ya incluyen IVA (19% en Chile)
  // Calcular precio sin IVA: precio_con_iva / 1.19
  // Calcular IVA: precio_con_iva - precio_sin_iva
  
  const calcularDesgloseIVA = (precioConIVA: number) => {
    // Precio sin IVA = precio con IVA / 1.19
    const precioSinIVA = precioConIVA / 1.19;
    // IVA = precio con IVA - precio sin IVA
    const iva = precioConIVA - precioSinIVA;
    return {
      sinIVA: precioSinIVA,
      iva: iva,
      conIVA: precioConIVA
    };
  };

  // Calcular subtotal sin IVA (suma de todos los items sin IVA)
  const subtotalSinIVA = items.reduce((sum, item) => {
    const desglose = calcularDesgloseIVA(item.subtotal);
    return sum + desglose.sinIVA;
  }, 0);

  // Calcular IVA total
  const ivaTotal = items.reduce((sum, item) => {
    const desglose = calcularDesgloseIVA(item.subtotal);
    return sum + desglose.iva;
  }, 0);

  // Total = suma de todos los subtotales (que ya incluyen IVA)
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  // Calcular propina sugerida (10% del total)
  const propina = total * 0.1;

  // Total con propina
  const totalConPropina = total + propina;

  return (
    <>
      {/* Botones de control - solo visible en pantalla */}
      <div className="no-print p-4 bg-slate-100 flex gap-3">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🖨️ Vista Previa
        </button>
        <button
          onClick={handlePrintReceipt}
          disabled={printing}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {printing ? '⏳ Enviando...' : '📤 Imprimir Boleta'}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cerrar
          </button>
        )}
      </div>

      {/* Boleta para impresión */}
      <div ref={printRef} className="boleta-cliente">
        {/* Encabezado */}
        <div className="boleta-header">
          <div className="boleta-logo">COMPLETOS & CHURRASCOS</div>
          <div className="boleta-subtitle">RUT: 77669643-9</div>
          <div className="boleta-subtitle">Providencia 1388 Local 49</div>
          <div className="boleta-subtitle">Celular: 939459286</div>
          <div className="boleta-separator-small"></div>
          <div className="boleta-info">
            <div>Orden: {orden.numero_orden}</div>
            <div>
              {orden.tipo_pedido === 'barra' 
                ? '🪑 Consumir en Barra' 
                : orden.tipo_pedido === 'llevar' 
                ? '📦 Para Llevar'
                : orden.mesa_id 
                ? `Mesa: ${orden.mesa_id}` // Compatibilidad con órdenes antiguas
                : 'Para Llevar'}
            </div>
            <div>Fecha: {new Date(orden.created_at).toLocaleDateString('es-CL')}</div>
            <div>Hora: {new Date(orden.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>

        <div className="boleta-separator"></div>

        {/* Items */}
        <div className="boleta-items">
          <div className="boleta-items-header">
            <span>Cant.</span>
            <span>Descripción</span>
            <span>Total</span>
          </div>
          {items.map((item) => {
            const desglose = calcularDesgloseIVA(item.subtotal);
            return (
              <div key={item.id} style={{ marginBottom: '4px' }}>
                <div className="boleta-item">
                  <span className="boleta-item-cantidad">{item.cantidad}</span>
                  <span className="boleta-item-descripcion">
                    {item.menu_item?.name || 'Item'}
                  </span>
                  <span className="boleta-item-total">{formatPrice(desglose.sinIVA)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="boleta-separator"></div>

        {/* Totales */}
        <div className="boleta-totales">
          <div className="boleta-total-line">
            <span>Monto Neto:</span>
            <span>{formatPrice(subtotalSinIVA)}</span>
          </div>
          <div className="boleta-total-line">
            <span>IVA (19%):</span>
            <span>{formatPrice(ivaTotal)}</span>
          </div>
          <div className="boleta-total-line boleta-total-final">
            <span>TOTAL:</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="boleta-total-line" style={{ fontSize: '8pt', color: '#666' }}>
            <span>Propina sugerida (10%):</span>
            <span>{formatPrice(propina)}</span>
          </div>
          <div className="boleta-total-line boleta-total-final" style={{ fontSize: '12pt' }}>
            <span>TOTAL CON PROPINA:</span>
            <span>{formatPrice(totalConPropina)}</span>
          </div>
        </div>

        {/* Método de pago */}
        {orden.metodo_pago && (
          <>
            <div className="boleta-separator"></div>
            <div className="boleta-pago">
              <div>Método de Pago: <strong>{orden.metodo_pago}</strong></div>
              {orden.paid_at && (
                <div>Pagado: {new Date(orden.paid_at).toLocaleString('es-CL')}</div>
              )}
            </div>
          </>
        )}

        {/* Pie */}
        <div className="boleta-separator"></div>
        <div className="boleta-footer">
          <div>¡Gracias por su visita!</div>
          <div className="boleta-footer-small">
            Carne Halal Certificada 🕌
          </div>
          <div className="boleta-footer-small">
            {new Date().toLocaleString('es-CL')}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
            padding: 0;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Ocultar TODO excepto la boleta */
          html, body {
            width: 58mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body > *:not(.boleta-cliente):not(script):not(style) {
            display: none !important;
          }

          .no-print {
            display: none !important;
          }

          .boleta-cliente {
            display: block !important;
            visibility: visible !important;
            width: 58mm !important;
            max-width: 58mm !important;
            margin: 0 auto !important;
            padding: 3mm !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 8pt !important;
            line-height: 1.3 !important;
            background: white !important;
            color: black !important;
            position: relative !important;
            page-break-inside: avoid !important;
          }

          .boleta-header {
            text-align: center !important;
            margin-bottom: 6px !important;
          }

          .boleta-logo {
            font-size: 10pt !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            margin-bottom: 2px !important;
          }

          .boleta-subtitle {
            font-size: 7pt !important;
            color: #555 !important;
            margin-bottom: 3px !important;
          }

          .boleta-separator-small {
            border-top: 1px solid #333 !important;
            margin: 4px 0 !important;
          }

          .boleta-info {
            font-size: 7pt !important;
            line-height: 1.3 !important;
            text-align: left !important;
            margin-top: 3px !important;
          }

          .boleta-info div {
            margin: 1px 0 !important;
          }

          .boleta-separator {
            border-top: 1px dashed #333 !important;
            margin: 6px 0 !important;
          }

          .boleta-items {
            margin: 6px 0 !important;
          }

          .boleta-items-header {
            display: grid !important;
            grid-template-columns: 18px 1fr 50px !important;
            gap: 2px !important;
            font-weight: bold !important;
            font-size: 7pt !important;
            padding-bottom: 2px !important;
            border-bottom: 1px solid #333 !important;
            margin-bottom: 3px !important;
          }

          .boleta-item {
            display: grid !important;
            grid-template-columns: 18px 1fr 50px !important;
            gap: 2px !important;
            font-size: 7pt !important;
            margin: 1px 0 !important;
            padding: 1px 0 !important;
          }

          .boleta-item-cantidad {
            text-align: center !important;
            font-weight: bold !important;
          }

          .boleta-item-descripcion {
            word-break: break-word !important;
            font-size: 8pt !important;
          }

          .boleta-item-total {
            text-align: right !important;
            font-weight: bold !important;
            font-size: 8pt !important;
          }

          .boleta-item-desglose {
            font-size: 7pt !important;
            color: #666 !important;
            margin-left: 25px !important;
            margin-top: 1px !important;
            margin-bottom: 2px !important;
          }

          .boleta-totales {
            margin: 6px 0 !important;
            font-size: 8pt !important;
          }

          .boleta-total-line {
            display: flex !important;
            justify-content: space-between !important;
            margin: 2px 0 !important;
            font-size: 8pt !important;
          }

          .boleta-total-final {
            font-size: 9pt !important;
            font-weight: bold !important;
            border-top: 2px solid black !important;
            padding-top: 3px !important;
            margin-top: 4px !important;
          }

          .boleta-pago {
            font-size: 7pt !important;
            text-align: center !important;
            padding: 3px !important;
            background: #f0f0f0 !important;
            border: 1px solid #333 !important;
            margin: 4px 0 !important;
          }

          .boleta-pago div {
            margin: 2px 0 !important;
          }

          .boleta-footer {
            text-align: center !important;
            font-size: 7pt !important;
            margin-top: 6px !important;
            padding-top: 4px !important;
            border-top: 1px solid #333 !important;
          }

          .boleta-footer-small {
            font-size: 6pt !important;
            color: #666 !important;
            margin-top: 2px !important;
          }
        }

        /* Estilos para pantalla (preview) */
        @media screen {
          .boleta-cliente {
            width: 58mm;
            max-width: 58mm;
            margin: 20px auto;
            padding: 10mm 5mm;
            font-family: 'Courier New', monospace;
            font-size: 9pt;
            line-height: 1.3;
            background: white;
            color: black;
            border: 1px solid #ddd;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .boleta-header {
            text-align: center;
            margin-bottom: 12px;
          }

          .boleta-logo {
            font-size: 16pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 6px;
          }

          .boleta-subtitle {
            font-size: 10pt;
            color: #555;
            margin-bottom: 8px;
          }

          .boleta-separator-small {
            border-top: 1px solid #333;
            margin: 8px 0;
          }

          .boleta-info {
            font-size: 10pt;
            line-height: 1.6;
            text-align: left;
            margin-top: 8px;
          }

          .boleta-info div {
            margin: 3px 0;
          }

          .boleta-separator {
            border-top: 1px dashed #333;
            margin: 12px 0;
          }

          .boleta-items {
            margin: 12px 0;
          }

          .boleta-items-header {
            display: grid;
            grid-template-columns: 20px 1fr 55px;
            gap: 4px;
            font-weight: bold;
            font-size: 8pt;
            padding-bottom: 4px;
            border-bottom: 1px solid #333;
            margin-bottom: 6px;
          }

          .boleta-item {
            display: grid;
            grid-template-columns: 20px 1fr 55px;
            gap: 4px;
            font-size: 8pt;
            margin: 4px 0;
            padding: 2px 0;
          }

          .boleta-item-cantidad {
            text-align: center;
            font-weight: bold;
          }

          .boleta-item-descripcion {
            word-break: break-word;
          }

          .boleta-item-total {
            text-align: right;
            font-weight: bold;
          }

          .boleta-item-desglose {
            font-size: 8pt;
            color: #666;
            margin-left: 35px;
            margin-top: 2px;
            margin-bottom: 4px;
          }

          .boleta-totales {
            margin: 12px 0;
            font-size: 11pt;
          }

          .boleta-total-line {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }

          .boleta-total-final {
            font-size: 14pt;
            font-weight: bold;
            border-top: 2px solid black;
            padding-top: 8px;
            margin-top: 10px;
          }

          .boleta-pago {
            font-size: 10pt;
            text-align: center;
            padding: 8px;
            background: #f0f0f0;
            border: 1px solid #333;
            margin: 10px 0;
          }

          .boleta-pago div {
            margin: 4px 0;
          }

          .boleta-footer {
            text-align: center;
            font-size: 10pt;
            margin-top: 16px;
            padding-top: 10px;
            border-top: 1px solid #333;
          }

          .boleta-footer-small {
            font-size: 9pt;
            color: #666;
            margin-top: 6px;
          }
        }
      `}</style>
    </>
  );
}

