import { useEffect, useRef } from 'react';

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
  mesa_id: string;
  estado: string;
  total: number;
  nota?: string;
  created_at: string;
  metodo_pago?: string;
  paid_at?: string;
  mesas?: {
    numero: number;
  };
}

interface BoletaClienteProps {
  orden: Orden;
  items: OrdenItem[];
  onClose?: () => void;
}

export default function BoletaCliente({ orden, items, onClose }: BoletaClienteProps) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-imprimir cuando se monta el componente
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  // En Chile, el IVA es 19%
  const iva = subtotal * 0.19;
  // Usar el total de la orden si está disponible, sino calcularlo
  const total = orden.total || (subtotal + iva);

  return (
    <>
      {/* Botones de control - solo visible en pantalla */}
      <div className="no-print p-4 bg-slate-100 flex gap-3">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🖨️ Imprimir Boleta
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
          <div className="boleta-logo">GOURMET ÁRABE</div>
          <div className="boleta-subtitle">Restaurante de Comida Árabe</div>
          <div className="boleta-separator-small"></div>
          <div className="boleta-info">
            <div>Orden: {orden.numero_orden}</div>
            <div>Mesa: {orden.mesas?.numero || 'N/A'}</div>
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
          {items.map((item) => (
            <div key={item.id} className="boleta-item">
              <span className="boleta-item-cantidad">{item.cantidad}</span>
              <span className="boleta-item-descripcion">
                {item.menu_item?.name || 'Item'}
              </span>
              <span className="boleta-item-total">{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="boleta-separator"></div>

        {/* Totales */}
        <div className="boleta-totales">
          <div className="boleta-total-line">
            <span>Subtotal:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="boleta-total-line">
            <span>IVA (19%):</span>
            <span>{formatPrice(iva)}</span>
          </div>
          <div className="boleta-total-line boleta-total-final">
            <span>TOTAL:</span>
            <span>{formatPrice(total)}</span>
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
            size: 80mm auto;
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
            width: 80mm !important;
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
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 5mm !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 9pt !important;
            line-height: 1.4 !important;
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
            font-size: 12pt !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            margin-bottom: 3px !important;
          }

          .boleta-subtitle {
            font-size: 8pt !important;
            color: #555 !important;
            margin-bottom: 4px !important;
          }

          .boleta-separator-small {
            border-top: 1px solid #333 !important;
            margin: 4px 0 !important;
          }

          .boleta-info {
            font-size: 8pt !important;
            line-height: 1.4 !important;
            text-align: left !important;
            margin-top: 4px !important;
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
            grid-template-columns: 25px 1fr 60px !important;
            gap: 3px !important;
            font-weight: bold !important;
            font-size: 8pt !important;
            padding-bottom: 3px !important;
            border-bottom: 1px solid #333 !important;
            margin-bottom: 4px !important;
          }

          .boleta-item {
            display: grid !important;
            grid-template-columns: 25px 1fr 60px !important;
            gap: 3px !important;
            font-size: 8pt !important;
            margin: 2px 0 !important;
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

          .boleta-totales {
            margin: 8px 0 !important;
            font-size: 9pt !important;
          }

          .boleta-total-line {
            display: flex !important;
            justify-content: space-between !important;
            margin: 3px 0 !important;
            font-size: 9pt !important;
          }

          .boleta-total-final {
            font-size: 11pt !important;
            font-weight: bold !important;
            border-top: 2px solid black !important;
            padding-top: 4px !important;
            margin-top: 6px !important;
          }

          .boleta-pago {
            font-size: 8pt !important;
            text-align: center !important;
            padding: 4px !important;
            background: #f0f0f0 !important;
            border: 1px solid #333 !important;
            margin: 6px 0 !important;
          }

          .boleta-pago div {
            margin: 2px 0 !important;
          }

          .boleta-footer {
            text-align: center !important;
            font-size: 8pt !important;
            margin-top: 10px !important;
            padding-top: 6px !important;
            border-top: 1px solid #333 !important;
          }

          .boleta-footer-small {
            font-size: 7pt !important;
            color: #666 !important;
            margin-top: 3px !important;
          }
        }

        /* Estilos para pantalla (preview) */
        @media screen {
          .boleta-cliente {
            width: 80mm;
            max-width: 80mm;
            margin: 20px auto;
            padding: 15mm 8mm;
            font-family: 'Courier New', monospace;
            font-size: 10pt;
            line-height: 1.4;
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
            grid-template-columns: 35px 1fr 80px;
            gap: 6px;
            font-weight: bold;
            font-size: 10pt;
            padding-bottom: 6px;
            border-bottom: 1px solid #333;
            margin-bottom: 8px;
          }

          .boleta-item {
            display: grid;
            grid-template-columns: 35px 1fr 80px;
            gap: 6px;
            font-size: 10pt;
            margin: 6px 0;
            padding: 4px 0;
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

