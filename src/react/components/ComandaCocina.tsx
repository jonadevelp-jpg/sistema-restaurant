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
    category_id?: number;
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
}

interface ComandaCocinaProps {
  orden: Orden;
  items: OrdenItem[];
  onClose?: () => void;
}

export default function ComandaCocina({ orden, items, onClose }: ComandaCocinaProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);

  const handleSendToKitchen = async () => {
    if (printing || !orden?.id) {
      console.log('[ComandaCocina] handleSendToKitchen bloqueado:', { printing, ordenId: orden?.id });
      return;
    }
    
    console.log('[ComandaCocina] ========== INICIANDO ENVÍO A COCINA ==========');
    console.log('[ComandaCocina] Orden ID:', orden.id);
    
    setPrinting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      console.log('[ComandaCocina] Token de sesión:', token ? '✅ Presente' : '❌ Faltante');
      
      if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      const requestBody = {
        ordenId: orden.id,
        type: 'kitchen',
        printerTarget: 'kitchen',
      };
      
      console.log('[ComandaCocina] Llamando a /api/print-jobs con:', requestBody);
      
      // Crear print_job en la cola de impresión
      const response = await fetch('/api/print-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('[ComandaCocina] Respuesta recibida:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('[ComandaCocina] Resultado:', result);
      
      if (response.ok && result.success) {
        console.log('[ComandaCocina] ✅ Print job creado exitosamente');
        alert('✅ Comanda enviada a la cola de impresión');
      } else {
        console.error('[ComandaCocina] ❌ Error en respuesta:', result);
        alert(`❌ Error: ${result.error || result.message || 'No se pudo crear el trabajo de impresión'}`);
      }
    } catch (error: any) {
      console.error('[ComandaCocina] ❌ Error enviando comanda:', error);
      alert(`❌ Error al enviar comanda: ${error.message || 'Error desconocido'}`);
    } finally {
      setPrinting(false);
      console.log('[ComandaCocina] ========== FIN ENVÍO A COCINA ==========');
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) {
      // Si no se puede abrir ventana, usar impresión normal
      window.print();
      return;
    }

    const styles = '@page { size: 80mm auto; margin: 0; padding: 0; } * { margin: 0; padding: 0; box-sizing: border-box; } body { width: 80mm; margin: 0; padding: 5mm; font-family: "Courier New", Courier, monospace; font-size: 10pt; line-height: 1.3; background: white; color: black; } .comanda-header { text-align: center; margin-bottom: 8px; } .comanda-title { font-size: 14pt; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; border-bottom: 2px solid black; padding-bottom: 4px; } .comanda-info { font-size: 9pt; line-height: 1.5; } .comanda-info div { margin: 2px 0; } .comanda-separator { border-top: 1px dashed #333; margin: 6px 0; } .comanda-section { margin: 8px 0; } .comanda-item { margin: 4px 0; padding: 3px 0; } .comanda-item-header { display: flex; align-items: center; gap: 6px; font-weight: bold; font-size: 11pt; } .comanda-item-cantidad { font-size: 12pt; min-width: 18px; } .comanda-item-nombre { flex: 1; text-transform: uppercase; } .comanda-item-notas { margin-left: 24px; font-size: 8pt; font-style: italic; color: #555; margin-top: 2px; } .comanda-nota { font-size: 9pt; padding: 4px; background: #f0f0f0; border-left: 2px solid black; margin: 6px 0; } .comanda-footer { text-align: center; font-size: 8pt; margin-top: 10px; padding-top: 6px; border-top: 1px solid #333; } .comanda-timestamp { margin-top: 3px; color: #666; }';
    
    const content = printRef.current.innerHTML;
    
    printWindow.document.write('<!DOCTYPE html><html><head><title>Comanda de Cocina</title><style>' + styles + '</style></head><body>' + content + '</body></html>');
    
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
  // La impresión ahora se maneja automáticamente desde el backend
  // cuando cambia el estado de la orden
  // useEffect(() => {
  //   // Auto-imprimir cuando se monta el componente
  //   const timer = setTimeout(() => {
  //     handlePrint();
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, []);

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
          🖨️ Imprimir
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
            <div style={{ fontSize: '18pt', fontWeight: 'bold', color: '#000' }}>Orden: {orden.numero_orden}</div>
            <div style={{ fontSize: '18pt', fontWeight: 'bold', color: '#000' }}>
              {orden.tipo_pedido === 'barra' 
                ? '🪑 Consumir en Barra' 
                : orden.tipo_pedido === 'llevar' 
                ? '📦 Para Llevar'
                : orden.mesa_id 
                ? `Mesa: ${orden.mesa_id}` // Compatibilidad con órdenes antiguas
                : 'N/A'}
            </div>
            <div style={{ fontSize: '18pt', fontWeight: 'bold', color: '#000' }}>Hora: {new Date(orden.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>

        {/* Línea separadora */}
        <div className="comanda-separator"></div>

        {/* Items agrupados por categoría */}
        {Object.entries(itemsPorCategoria).map(([categoriaId, categoriaItems]) => (
          <div key={categoriaId} className="comanda-section">
            {categoriaItems.map((item) => {
              // Parsear personalización
              let personalization: any = null;
              try {
                personalization = item.notas ? JSON.parse(item.notas) : null;
              } catch {
                // Si no es JSON, usar como texto simple
                personalization = item.notas ? { detalles: item.notas } : null;
              }

              return (
                <div key={item.id} className="comanda-item">
                  <div className="comanda-item-header">
                    <span className="comanda-item-cantidad">{item.cantidad}x</span>
                    <span className="comanda-item-nombre">{item.menu_item?.name || 'Item'}</span>
                  </div>
                  {personalization && (
                    <div className="comanda-item-notas" style={{ fontSize: '16pt', fontWeight: 'bold', color: '#000' }}>
                      {personalization.agregado && (
                        <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#000' }}>Agregado: {personalization.agregado}</div>
                      )}
                      {personalization.salsas && personalization.salsas.length > 0 && (
                        <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#000' }}>Salsa{personalization.salsas.length > 1 ? 's' : ''}: {personalization.salsas.join(', ')}</div>
                      )}
                      {personalization.sinIngredientes && personalization.sinIngredientes.length > 0 && (
                        <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#000' }}>Sin: {personalization.sinIngredientes.join(', ')}</div>
                      )}
                      {personalization.extras && personalization.extras.length > 0 && (
                        <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#000' }}>Extras: {personalization.extras.join(', ')}</div>
                      )}
                      {personalization.bebidas && personalization.bebidas.length > 0 && (
                        <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#000' }}>
                          Bebida{personalization.bebidas.length > 1 ? 's' : ''}:{' '}
                          {personalization.bebidas.map((b: any) => {
                            if (b.sabor) return `${b.nombre} (${b.sabor})`;
                            return b.nombre;
                          }).join(', ')}
                        </div>
                      )}
                      {personalization.detalles && (
                        <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#000' }}>Nota: {personalization.detalles}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
            font-size: 18pt !important;
            line-height: 1.5 !important;
            font-weight: bold !important;
          }

          .comanda-info div {
            margin: 3px 0 !important;
            font-weight: bold !important;
            font-size: 18pt !important;
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
            gap: 8px !important;
            font-weight: bold !important;
            font-size: 20pt !important;
          }

          .comanda-item-cantidad {
            font-size: 22pt !important;
            min-width: 25px !important;
            font-weight: bold !important;
          }

          .comanda-item-nombre {
            flex: 1 !important;
            text-transform: uppercase !important;
            font-weight: bold !important;
            font-size: 20pt !important;
          }

          .comanda-item-notas {
            margin-left: 30px !important;
            font-size: 16pt !important;
            font-weight: bold !important;
            color: #000 !important;
            margin-top: 3px !important;
          }

          .comanda-nota {
            font-size: 18pt !important;
            font-weight: bold !important;
            padding: 6px !important;
            background: #f0f0f0 !important;
            border-left: 3px solid black !important;
            margin: 8px 0 !important;
          }

          .comanda-footer {
            text-align: center !important;
            font-size: 16pt !important;
            font-weight: bold !important;
            color: #000 !important;
            margin-top: 10px !important;
            padding-top: 6px !important;
            border-top: 2px solid #000 !important;
          }

          .comanda-timestamp {
            margin-top: 4px !important;
            color: #000 !important;
            font-weight: bold !important;
            font-size: 16pt !important;
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
            font-weight: bold;
            color: #000;
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
            font-weight: bold;
            color: #000;
            margin-top: 16px;
            padding-top: 10px;
            border-top: 1px solid #333;
          }

          .comanda-timestamp {
            margin-top: 6px;
            color: #000;
            font-weight: bold;
          }
        }
      `}</style>
    </>
  );
}


