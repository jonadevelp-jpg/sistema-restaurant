import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCLP } from '@/utils/currency';
import type { TipoPedido } from '@/@types';

interface Orden {
  id: string;
  numero_orden: string;
  tipo_pedido: TipoPedido;
  estado: string;
  total: number;
  created_at: string;
  mesa_id?: string | null; // Mantener para compatibilidad con órdenes antiguas
}

export default function PedidosView() {
  const [ordenesBarra, setOrdenesBarra] = useState<Orden[]>([]);
  const [ordenesLlevar, setOrdenesLlevar] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNuevaOrdenModal, setShowNuevaOrdenModal] = useState(false);
  const [tipoPedidoSeleccionado, setTipoPedidoSeleccionado] = useState<TipoPedido>(null);

  useEffect(() => {
    console.log('🚀 PedidosView montado, iniciando carga...');
    // Cargar datos inicialmente
    loadData();
    // Recargar cada 30 segundos para mantener datos actualizados (solo si no hay error)
    const interval = setInterval(() => {
      // Solo recargar si no hay error activo
      if (!error) {
        console.log('🔄 Recarga automática de datos...');
        loadData();
      } else {
        console.log('⏸️ Recarga automática pausada debido a error');
      }
    }, 30000); // 30 segundos en lugar de 5
    return () => {
      console.log('🧹 Limpiando intervalos...');
      clearInterval(interval);
    };
  }, [error]); // Agregar error como dependencia

  async function loadData() {
    // Timeout de seguridad: siempre detener loading después de 15 segundos
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Timeout: La carga tardó más de 15 segundos, deteniendo loading...');
      setLoading(false);
      if (!error) {
        setError('La carga de datos está tardando demasiado. Verifica tu conexión y permisos.');
      }
    }, 15000);

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Iniciando carga de datos...');
      
      // Verificar autenticación primero
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Error de autenticación:', authError);
        setError('No estás autenticado. Por favor, inicia sesión.');
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      console.log('✅ Usuario autenticado:', user.id);
      
      // Cargar órdenes activas (pending, preparing, ready)
      console.log('🔄 Consultando ordenes_restaurante...');
      const { data: ordenesData, error: queryError } = await supabase
        .from('ordenes_restaurante')
        .select('*')
        .in('estado', ['pending', 'preparing', 'ready'])
        .order('created_at', { ascending: false });
      
      console.log('📊 Resultado de consulta:', { 
        dataCount: ordenesData?.length || 0, 
        hasError: !!queryError,
        errorMessage: queryError?.message || null,
        errorCode: queryError?.code || null
      });

      if (queryError) {
        console.error('❌ Error cargando órdenes:', queryError);
        console.error('Detalles del error:', {
          message: queryError.message,
          code: queryError.code,
          details: queryError.details,
          hint: queryError.hint
        });
        
        // Detectar recursión infinita específicamente
        if (queryError.message?.includes('infinite recursion') || queryError.code === '42P17') {
          setError(`❌ Error de recursión infinita en políticas RLS. Ejecuta el script SQL: database/FIX_POLITICAS_ORDENES.sql o database/DESACTIVAR_RLS_ORDENES_TEMPORAL.sql en Supabase SQL Editor.`);
        } else if (queryError.code === 'PGRST301' || queryError.message?.includes('permission') || queryError.message?.includes('policy')) {
          setError(`Error de permisos: No tienes acceso para ver las órdenes. Verifica que tu usuario tenga rol de admin, encargado o mesero en la tabla users.`);
        } else {
          setError(`Error cargando órdenes: ${queryError.message} (Código: ${queryError.code || 'N/A'})`);
        }
        
        setOrdenesBarra([]);
        setOrdenesLlevar([]);
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      if (ordenesData) {
        // Separar por tipo_pedido
        const barra = ordenesData.filter(
          (o) => o.tipo_pedido === 'barra' || (o.tipo_pedido === null && o.mesa_id !== null)
        );
        const llevar = ordenesData.filter(
          (o) => o.tipo_pedido === 'llevar' || (o.tipo_pedido === null && o.mesa_id === null)
        );

        console.log('✅ Datos procesados:', { barra: barra.length, llevar: llevar.length });
        setOrdenesBarra(barra);
        setOrdenesLlevar(llevar);
        setError(null);
      } else {
        console.log('⚠️ No se recibieron datos (null o undefined)');
        setOrdenesBarra([]);
        setOrdenesLlevar([]);
      }
    } catch (error: any) {
      console.error('❌ Error inesperado cargando datos:', error);
      console.error('Stack trace:', error.stack);
      setError(`Error inesperado: ${error.message || 'Error desconocido'}`);
      setOrdenesBarra([]);
      setOrdenesLlevar([]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      console.log('✅ Carga de datos finalizada, loading: false');
    }
  }

  function getEstadoColor(estado: string) {
    switch (estado) {
      case 'pending':
        return 'bg-orange-50 text-orange-700';
      case 'preparing':
        return 'bg-blue-50 text-blue-700';
      case 'ready':
        return 'bg-green-50 text-green-700';
      case 'paid':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-warm-100 text-slate-700';
    }
  }

  function getEstadoTexto(estado: string) {
    const estados: Record<string, string> = {
      pending: 'Pendiente',
      preparing: 'En Preparación',
      ready: 'Listo',
      paid: 'Pagado',
      cancelled: 'Cancelado',
    };
    return estados[estado] || estado;
  }

  async function crearNuevaOrden(tipoPedido: TipoPedido) {
    try {
      console.log('🔄 Creando nueva orden, tipo:', tipoPedido);
      
      // Cerrar el modal primero
      setShowNuevaOrdenModal(false);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Error de autenticación:', authError);
        alert('❌ No estás autenticado. Por favor, inicia sesión nuevamente.');
        return;
      }

      console.log('✅ Usuario autenticado:', user.id);

      // Generar número de orden único
      const timestamp = Date.now();
      const numeroOrden = tipoPedido === 'llevar' 
        ? `TAKE-${timestamp}` 
        : `ORD-${timestamp}`;

      console.log('📝 Número de orden generado:', numeroOrden);

      const ordenData = {
        numero_orden: numeroOrden,
        tipo_pedido: tipoPedido,
        mesa_id: null, // Ya no usamos mesas
        mesero_id: user.id,
        estado: 'pending',
        total: 0,
      };

      console.log('📤 Datos a insertar:', ordenData);

      const { data: orden, error: insertError } = await supabase
        .from('ordenes_restaurante')
        .insert(ordenData)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error insertando orden:', insertError);
        console.error('Detalles:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        });
        
        // Mensaje más específico según el tipo de error
        if (insertError.code === 'PGRST301' || insertError.message?.includes('permission') || insertError.message?.includes('policy')) {
          alert(`❌ Error de permisos: No tienes permisos para crear órdenes.\n\nVerifica que tu usuario tenga rol de admin, encargado o mesero en la tabla users.\n\nError: ${insertError.message}`);
        } else {
          alert(`❌ Error creando orden: ${insertError.message}\n\nCódigo: ${insertError.code}\n\nSi el problema persiste, verifica los permisos RLS en Supabase.`);
        }
        return;
      }

      if (!orden) {
        console.error('❌ No se recibió la orden creada');
        alert('❌ Error: La orden se creó pero no se recibió la respuesta. Intenta recargar la página.');
        return;
      }

      console.log('✅ Orden creada exitosamente:', orden.id);
      
      // Redirigir a la orden creada
      window.location.href = `/admin/ordenes/${orden.id}`;
    } catch (error: any) {
      console.error('❌ Error inesperado creando orden:', error);
      console.error('Stack trace:', error.stack);
      alert(`❌ Error inesperado: ${error.message || 'Error desconocido'}\n\nRevisa la consola del navegador (F12) para más detalles.`);
    }
  }

  // Debug: Log cuando el modal cambia
  useEffect(() => {
    console.log('🔔 Estado del modal cambió:', { 
      showNuevaOrdenModal, 
      tipoPedidoSeleccionado 
    });
  }, [showNuevaOrdenModal, tipoPedidoSeleccionado]);

  return (
    <div className="w-full">
      {/* Debug info en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-2 p-2 bg-gray-100 text-xs text-gray-600 rounded">
          Debug: loading={loading ? 'true' : 'false'}, 
          modal={showNuevaOrdenModal ? 'abierto' : 'cerrado'}, 
          tipo={tipoPedidoSeleccionado || 'ninguno'}
        </div>
      )}
      
      {/* Mostrar error si existe */}
      {error && (
        <div 
          className="mb-6 p-5 bg-red-50 rounded-2xl"
          style={{
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15), 0 1px 3px rgba(239, 68, 68, 0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-red-900 font-bold text-base font-sans">Error</p>
              <p className="text-red-700 text-sm font-sans mt-1">{error}</p>
            </div>
            <button
              onClick={() => loadData()}
              className="ml-auto px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-semibold font-sans transition-all duration-200"
              style={{
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Header - Siempre visible */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-sans">Pedidos (POS)</h1>
          <p className="text-slate-600 text-sm mt-1 font-sans">Gestiona pedidos en barra y para llevar</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🖱️ Click en botón "Nueva Orden Barra"');
              setTipoPedidoSeleccionado('barra');
              setShowNuevaOrdenModal(true);
              console.log('✅ Modal debería estar abierto ahora');
            }}
            aria-label="Crear nueva orden para consumir en barra"
            className="flex-1 sm:flex-none min-h-[48px] px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-[0.98] text-base font-bold font-sans transition-all duration-200 cursor-pointer"
            style={{
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3), 0 2px 4px rgba(37, 99, 235, 0.2)',
            }}
            type="button"
          >
            🪑 Nueva Orden Barra
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🖱️ Click en botón "Nueva Orden Para Llevar"');
              setTipoPedidoSeleccionado('llevar');
              setShowNuevaOrdenModal(true);
              console.log('✅ Modal debería estar abierto ahora');
            }}
            aria-label="Crear nueva orden para llevar"
            className="flex-1 sm:flex-none min-h-[48px] px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 active:scale-[0.98] text-base font-bold font-sans transition-all duration-200 cursor-pointer"
            style={{
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3), 0 2px 4px rgba(249, 115, 22, 0.2)',
            }}
            type="button"
          >
            📦 Nueva Orden Para Llevar
          </button>
          <button
            onClick={loadData}
            aria-label="Actualizar lista de pedidos"
            className="flex-1 sm:flex-none min-h-[48px] px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-[0.98] text-base font-bold font-sans transition-all duration-200"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Grid de pedidos - Mostrar siempre */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos en Barra */}
        <div 
          className="bg-white rounded-2xl p-6"
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 font-sans">
              🪑 Pedidos en Barra
            </h2>
            <span 
              className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold font-sans"
              style={{
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)',
              }}
            >
              {ordenesBarra.length}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-warm-200 border-t-slate-600 mb-3"></div>
              <p className="text-slate-600 text-sm font-sans">Cargando...</p>
            </div>
          ) : ordenesBarra.length === 0 ? (
            <div 
              className="text-center py-12 bg-warm-50 rounded-xl"
              style={{
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <p className="text-slate-600 font-sans">No hay pedidos en barra activos</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {ordenesBarra.map((orden) => (
                <button
                  key={orden.id}
                  onClick={() => {
                    window.location.href = `/admin/ordenes/${orden.id}`;
                  }}
                  className="w-full p-5 bg-white rounded-xl hover:bg-blue-50 transition-all duration-200 text-left group"
                  style={{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg text-slate-900 mb-2 font-sans">
                        {orden.numero_orden}
                      </div>
                      <div className="text-sm text-slate-600 mb-3 font-sans">
                        {new Date(orden.created_at).toLocaleString('es-CL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div
                        className={`inline-block px-4 py-2 rounded-full text-xs font-bold font-sans ${getEstadoColor(orden.estado)}`}
                        style={{
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        {getEstadoTexto(orden.estado)}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-2xl text-green-700 font-sans">
                        {formatCLP(orden.total)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pedidos Para Llevar */}
        <div 
          className="bg-white rounded-2xl p-6"
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 font-sans">
              📦 Pedidos Para Llevar
            </h2>
            <span 
              className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-bold font-sans"
              style={{
                boxShadow: '0 2px 6px rgba(249, 115, 22, 0.2)',
              }}
            >
              {ordenesLlevar.length}
            </span>
          </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-warm-200 border-t-slate-600 mb-3"></div>
                <p className="text-slate-600 text-sm font-sans">Cargando...</p>
              </div>
            ) : ordenesLlevar.length === 0 ? (
              <div 
                className="text-center py-12 bg-warm-50 rounded-xl"
                style={{
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                <p className="text-slate-600 font-sans">No hay pedidos para llevar activos</p>
                <p className="text-xs mt-2 text-slate-500 font-sans">Haz clic en "Nueva Orden Para Llevar" para crear uno</p>
              </div>
            ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {ordenesLlevar.map((orden) => (
                <button
                  key={orden.id}
                  onClick={() => {
                    window.location.href = `/admin/ordenes/${orden.id}`;
                  }}
                  className="w-full p-5 bg-white rounded-xl hover:bg-orange-50 transition-all duration-200 text-left group"
                  style={{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg text-slate-900 mb-2 font-sans">
                        {orden.numero_orden}
                      </div>
                      <div className="text-sm text-slate-600 mb-3 font-sans">
                        {new Date(orden.created_at).toLocaleString('es-CL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div
                        className={`inline-block px-4 py-2 rounded-full text-xs font-bold font-sans ${getEstadoColor(orden.estado)}`}
                        style={{
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        {getEstadoTexto(orden.estado)}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-2xl text-green-700 font-sans">
                        {formatCLP(orden.total)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear nueva orden */}
      {showNuevaOrdenModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            console.log('🖱️ Click en overlay del modal');
            setShowNuevaOrdenModal(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="nueva-orden-title"
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h2 id="nueva-orden-title" className="text-2xl font-bold mb-4 text-slate-900 font-sans">
              Crear Nueva Orden
            </h2>
            <p className="text-base text-slate-600 mb-8 font-sans">
              ¿Deseas crear una nueva orden{' '}
              {tipoPedidoSeleccionado === 'llevar' ? 'para llevar' : 'para consumir en barra'}?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🖱️ Click en botón Cancelar del modal');
                  setShowNuevaOrdenModal(false);
                  setTipoPedidoSeleccionado(null);
                }}
                aria-label="Cancelar creación de orden"
                className="flex-1 min-h-[48px] px-6 py-3 border-2 border-warm-200 rounded-xl hover:bg-warm-50 active:scale-[0.98] text-base font-semibold font-sans transition-all duration-200 cursor-pointer"
                style={{
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🖱️ Click en botón Crear Orden del modal, tipo:', tipoPedidoSeleccionado);
                  if (tipoPedidoSeleccionado) {
                    await crearNuevaOrden(tipoPedidoSeleccionado);
                  } else {
                    alert('❌ Error: No se seleccionó un tipo de pedido');
                    console.error('❌ tipoPedidoSeleccionado es null o undefined');
                  }
                }}
                aria-label={`Crear orden ${tipoPedidoSeleccionado === 'llevar' ? 'para llevar' : 'en barra'}`}
                className={`flex-1 min-h-[48px] px-6 py-3 text-white rounded-xl text-base font-bold font-sans active:scale-[0.98] transition-all duration-200 cursor-pointer ${
                  tipoPedidoSeleccionado === 'llevar'
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                style={{
                  boxShadow: tipoPedidoSeleccionado === 'llevar'
                    ? '0 4px 12px rgba(249, 115, 22, 0.3), 0 2px 4px rgba(249, 115, 22, 0.2)'
                    : '0 4px 12px rgba(37, 99, 235, 0.3), 0 2px 4px rgba(37, 99, 235, 0.2)',
                }}
                type="button"
              >
                Crear Orden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

