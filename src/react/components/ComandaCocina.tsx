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
    category_id?: number;
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
  mesas?: {
    numero: number;
  };
}

interface ComandaCocinaProps {
  orden: Orden;
  items: OrdenItem[];
  onClose?: () => void;
}

export default function ComandaCocina({ orden, items, onClose }: ComandaCocinaProps) {
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

  // Agrupar items por categoría para mejor organización en cocina
  const itemsPorCategoria = items.reduce((acc, item) => {
    const categoria = item.menu_item?.category_id || 0;
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(item);
    return acc;
  }, {} as Record<number, OrdenItem[]>);

  return (
    <>
      {/* Botones de control - solo visible en pantalla */}
      <div className="no-print p-4 bg-slate-100 flex gap-3">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🖨️ Imprimir Comanda
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

      {/* Comanda para impresión */}
      <div ref={printRef} className="comanda-cocina">
        {/* Encabezado */}
        <div className="comanda-header">
          <div className="comanda-title">COMANDA COCINA</div>
          <div className="comanda-info">
            <div>Orden: {orden.numero_orden}</div>
            <div>Mesa: {orden.mesas?.numero || 'N/A'}</div>
            <div>Hora: {new Date(orden.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>

        {/* Línea separadora */}
        <div className="comanda-separator"></div>

        {/* Items agrupados por categoría */}
        {Object.entries(itemsPorCategoria).map(([categoriaId, categoriaItems]) => (
          <div key={categoriaId} className="comanda-section">
            {categoriaItems.map((item) => (
              <div key={item.id} className="comanda-item">
                <div className="comanda-item-header">
                  <span className="comanda-item-cantidad">{item.cantidad}x</span>
                  <span className="comanda-item-nombre">{item.menu_item?.name || 'Item'}</span>
                </div>
                {item.notas && (
                  <div className="comanda-item-notas">Nota: {item.notas}</div>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Nota general de la orden */}
        {orden.nota && (
          <>
            <div className="comanda-separator"></div>
            <div className="comanda-nota">
              <strong>NOTA GENERAL:</strong> {orden.nota}
            </div>
          </>
        )}

        {/* Pie */}
        <div className="comanda-separator"></div>
        <div className="comanda-footer">
          <div>Total Items: {items.reduce((sum, item) => sum + item.cantidad, 0)}</div>
          <div className="comanda-timestamp">
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

          /* Ocultar TODO excepto la comanda */
          html, body {
            width: 80mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body > *:not(.comanda-cocina):not(script):not(style) {
            display: none !important;
          }

          .no-print {
            display: none !important;
          }

          .comanda-cocina {
            display: block !important;
            visibility: visible !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 5mm !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 10pt !important;
            line-height: 1.3 !important;
            background: white !important;
            color: black !important;
            position: relative !important;
            page-break-inside: avoid !important;
          }

          .comanda-header {
            text-align: center !important;
            margin-bottom: 8px !important;
          }

          .comanda-title {
            font-size: 14pt !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            margin-bottom: 6px !important;
            border-bottom: 2px solid black !important;
            padding-bottom: 4px !important;
          }

          .comanda-info {
            font-size: 9pt !important;
            line-height: 1.5 !important;
          }

          .comanda-info div {
            margin: 2px 0 !important;
          }

          .comanda-separator {
            border-top: 1px dashed #333 !important;
            margin: 6px 0 !important;
          }

          .comanda-section {
            margin: 8px 0 !important;
          }

          .comanda-item {
            margin: 4px 0 !important;
            padding: 3px 0 !important;
          }

          .comanda-item-header {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            font-weight: bold !important;
            font-size: 11pt !important;
          }

          .comanda-item-cantidad {
            font-size: 12pt !important;
            min-width: 18px !important;
          }

          .comanda-item-nombre {
            flex: 1 !important;
            text-transform: uppercase !important;
          }

          .comanda-item-notas {
            margin-left: 24px !important;
            font-size: 8pt !important;
            font-style: italic !important;
            color: #555 !important;
            margin-top: 2px !important;
          }

          .comanda-nota {
            font-size: 9pt !important;
            padding: 4px !important;
            background: #f0f0f0 !important;
            border-left: 2px solid black !important;
            margin: 6px 0 !important;
          }

          .comanda-footer {
            text-align: center !important;
            font-size: 8pt !important;
            margin-top: 10px !important;
            padding-top: 6px !important;
            border-top: 1px solid #333 !important;
          }

          .comanda-timestamp {
            margin-top: 3px !important;
            color: #666 !important;
          }
        }

        /* Estilos para pantalla (preview) */
        @media screen {
          .comanda-cocina {
            width: 80mm;
            max-width: 80mm;
            margin: 20px auto;
            padding: 15mm 8mm;
            font-family: 'Courier New', monospace;
            font-size: 11pt;
            line-height: 1.3;
            background: white;
            color: black;
            border: 1px solid #ddd;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .comanda-header {
            text-align: center;
            margin-bottom: 12px;
          }

          .comanda-title {
            font-size: 18pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 8px;
            border-bottom: 2px solid black;
            padding-bottom: 6px;
          }

          .comanda-info {
            font-size: 11pt;
            line-height: 1.6;
          }

          .comanda-info div {
            margin: 3px 0;
          }

          .comanda-separator {
            border-top: 1px dashed #333;
            margin: 12px 0;
          }

          .comanda-section {
            margin: 12px 0;
          }

          .comanda-item {
            margin: 8px 0;
            padding: 6px 0;
          }

          .comanda-item-header {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: bold;
            font-size: 13pt;
          }

          .comanda-item-cantidad {
            font-size: 16pt;
            min-width: 25px;
          }

          .comanda-item-nombre {
            flex: 1;
            text-transform: uppercase;
          }

          .comanda-item-notas {
            margin-left: 35px;
            font-size: 10pt;
            font-style: italic;
            color: #555;
            margin-top: 3px;
          }

          .comanda-nota {
            font-size: 11pt;
            padding: 8px;
            background: #f0f0f0;
            border-left: 3px solid black;
            margin: 10px 0;
          }

          .comanda-footer {
            text-align: center;
            font-size: 10pt;
            margin-top: 16px;
            padding-top: 10px;
            border-top: 1px solid #333;
          }

          .comanda-timestamp {
            margin-top: 6px;
            color: #666;
          }
        }
      `}</style>
    </>
  );
}


