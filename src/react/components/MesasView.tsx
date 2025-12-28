import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCLP } from '@/lib/currency';

interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  estado: 'libre' | 'ocupada' | 'reservada';
  ubicacion: string;
}

interface Orden {
  id: string;
  numero_orden: string;
  mesa_id: string;
  estado: string;
  total: number;
  created_at: string;
}

export default function MesasView() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [ordenesParaLlevar, setOrdenesParaLlevar] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [showOrdenForm, setShowOrdenForm] = useState(false);
  const [showParaLlevarModal, setShowParaLlevarModal] = useState(false);
  const [showParaLlevarList, setShowParaLlevarList] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [mesasRes, ordenesRes, paraLlevarRes] = await Promise.all([
        supabase.from('mesas').select('*').order('numero'),
        supabase
          .from('ordenes_restaurante')
          .select('*')
          .in('estado', ['pending', 'preparing', 'ready'])
          .not('mesa_id', 'is', null)
          .order('created_at', { ascending: false }),
        supabase
          .from('ordenes_restaurante')
          .select('*')
          .in('estado', ['pending', 'preparing', 'ready'])
          .is('mesa_id', null)
          .order('created_at', { ascending: false }),
      ]);

      if (mesasRes.data) setMesas(mesasRes.data);
      if (ordenesRes.data) setOrdenes(ordenesRes.data);
      if (paraLlevarRes.data) setOrdenesParaLlevar(paraLlevarRes.data);

      // Actualizar estado de mesas según órdenes activas
      // IMPORTANTE: Solo actualizar en la UI, no sobrescribir el estado de la BD
      // El estado en la BD se actualiza cuando se cancela/elimina una orden
      if (mesasRes.data && ordenesRes.data) {
        const mesasConOrden = new Set(ordenesRes.data.map((o) => o.mesa_id));
        const mesasActualizadas = mesasRes.data.map((m) => {
          // Si la mesa tiene una orden activa, mostrar como ocupada
          // Pero respetar el estado de la BD si no hay orden activa
          if (mesasConOrden.has(m.id)) {
            return { ...m, estado: 'ocupada' as const };
          } else {
            // Si no hay orden activa, usar el estado de la BD (puede ser 'libre' o 'reservada')
            return m;
          }
        });
        setMesas(mesasActualizadas);
      } else if (mesasRes.data) {
        // Si no hay órdenes activas, usar el estado de la BD directamente
        setMesas(mesasRes.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }

  function getMesaOrden(mesaId: string) {
    return ordenes.find((o) => o.mesa_id === mesaId);
  }

  function getEstadoColor(estado: string) {
    switch (estado) {
      case 'libre':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ocupada':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'reservada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  function handleMesaClick(mesa: Mesa) {
    const orden = getMesaOrden(mesa.id);
    if (orden) {
      // Abrir orden existente
      window.location.href = `/admin/ordenes/${orden.id}`;
    } else {
      // Crear nueva orden
      setSelectedMesa(mesa);
      setShowOrdenForm(true);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando mesas...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Mesas (POS)</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              if (ordenesParaLlevar.length > 0) {
                setShowParaLlevarList(true);
              } else {
                setShowParaLlevarModal(true);
              }
            }}
            aria-label={`Órdenes para llevar${ordenesParaLlevar.length > 0 ? `, ${ordenesParaLlevar.length} pendientes` : ''}`}
            className="flex-1 sm:flex-none min-h-[48px] px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 active:bg-orange-800 text-base sm:text-lg font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all"
          >
            📦 Para Llevar {ordenesParaLlevar.length > 0 && `(${ordenesParaLlevar.length})`}
          </button>
          <button
            onClick={loadData}
            aria-label="Actualizar lista de mesas"
            className="flex-1 sm:flex-none min-h-[48px] px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 active:bg-slate-800 text-base sm:text-lg font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {mesas.map((mesa) => {
          const orden = getMesaOrden(mesa.id);
          const estado = orden ? 'ocupada' : mesa.estado;
          return (
            <button
              key={mesa.id}
              onClick={() => handleMesaClick(mesa)}
              aria-label={`Mesa ${mesa.numero}, ${estado}, capacidad ${mesa.capacidad} personas${orden ? `, total ${formatCLP(orden.total)}` : ''}`}
              className={`
                min-h-[120px] sm:min-h-[140px] md:min-h-[160px]
                p-4 sm:p-5 md:p-6 
                rounded-xl border-3 
                transition-all duration-200 
                active:scale-95
                focus:outline-none focus:ring-4 focus:ring-offset-2
                ${orden
                  ? 'border-red-400 bg-red-50 focus:ring-red-300'
                  : 'border-green-400 bg-green-50 hover:border-green-500 hover:bg-green-100 focus:ring-green-300'
                }
                shadow-md hover:shadow-xl
              `}
            >
              <div className="text-center flex flex-col items-center justify-center h-full">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3" aria-hidden="true">🪑</div>
                <div className="font-bold text-base sm:text-lg md:text-xl text-slate-900 mb-1">
                  Mesa {mesa.numero}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 mb-2">
                  Cap: {mesa.capacidad}
                </div>
                <div
                  className={`mt-auto px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border-2 ${getEstadoColor(estado)}`}
                  role="status"
                  aria-live="polite"
                >
                  {orden ? 'Ocupada' : 'Libre'}
                </div>
                {orden && (
                  <div className="mt-2 text-sm sm:text-base font-bold text-red-700" aria-label={`Total: ${formatCLP(orden.total)}`}>
                    {formatCLP(orden.total)}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showOrdenForm && selectedMesa && (
        <OrdenFormModal
          mesa={selectedMesa}
          onClose={() => {
            setShowOrdenForm(false);
            setSelectedMesa(null);
          }}
          onSaved={() => {
            setShowOrdenForm(false);
            setSelectedMesa(null);
            loadData();
          }}
        />
      )}

      {showParaLlevarModal && (
        <ParaLlevarModal
          onClose={() => {
            setShowParaLlevarModal(false);
          }}
          onSaved={() => {
            setShowParaLlevarModal(false);
            loadData();
          }}
        />
      )}

      {showParaLlevarList && (
        <ParaLlevarListModal
          ordenes={ordenesParaLlevar}
          onClose={() => {
            setShowParaLlevarList(false);
          }}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}

// Modal para crear orden para llevar
function ParaLlevarModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleCreateOrden() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('No estás autenticado');
        return;
      }

      // Generar número de orden único
      const timestamp = Date.now();
      const numeroOrden = `TAKE-${timestamp}`;

      const { data: orden, error } = await supabase
        .from('ordenes_restaurante')
        .insert({
          numero_orden: numeroOrden,
          mesa_id: null, // Sin mesa para órdenes para llevar
          mesero_id: user.id,
          estado: 'pending',
          total: 0,
        })
        .select()
        .single();

      if (error) throw error;

      window.location.href = `/admin/ordenes/${orden.id}`;
    } catch (error: any) {
      alert('Error creando orden: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="parallevar-title"
    >
      <div 
        className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="parallevar-title" className="text-xl sm:text-2xl font-bold mb-4 text-slate-900">
          Crear Orden Para Llevar
        </h2>
        <p className="text-base sm:text-lg text-slate-600 mb-6">
          ¿Deseas crear una nueva orden para llevar?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            aria-label="Cancelar creación de orden"
            className="flex-1 min-h-[48px] px-6 py-3 border-2 border-slate-300 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-base sm:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateOrden}
            disabled={loading}
            aria-label={loading ? 'Creando orden...' : 'Crear nueva orden para llevar'}
            className="flex-1 min-h-[48px] px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all"
          >
            {loading ? 'Creando...' : 'Crear Orden'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal para listar órdenes para llevar
function ParaLlevarListModal({
  ordenes,
  onClose,
  onRefresh,
}: {
  ordenes: Orden[];
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleCreateNew() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('No estás autenticado');
        return;
      }

      const timestamp = Date.now();
      const numeroOrden = `TAKE-${timestamp}`;

      const { data: orden, error } = await supabase
        .from('ordenes_restaurante')
        .insert({
          numero_orden: numeroOrden,
          mesa_id: null,
          mesero_id: user.id,
          estado: 'pending',
          total: 0,
        })
        .select()
        .single();

      if (error) throw error;

      window.location.href = `/admin/ordenes/${orden.id}`;
    } catch (error: any) {
      alert('Error creando orden: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Órdenes Para Llevar</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={handleCreateNew}
            disabled={loading}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Creando...' : '+ Nueva Orden Para Llevar'}
          </button>
        </div>

        {ordenes.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No hay órdenes para llevar pendientes</p>
        ) : (
          <div className="space-y-2">
            {ordenes.map((orden) => (
              <button
                key={orden.id}
                onClick={() => {
                  window.location.href = `/admin/ordenes/${orden.id}`;
                }}
                className="w-full p-3 border-2 border-orange-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{orden.numero_orden}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(orden.created_at).toLocaleString('es-CL')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Estado: <span className="capitalize">{orden.estado}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatCLP(orden.total)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Modal para crear nueva orden
function OrdenFormModal({
  mesa,
  onClose,
  onSaved,
}: {
  mesa: Mesa;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleCreateOrden() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('No estás autenticado');
        return;
      }

      // Generar número de orden único
      const timestamp = Date.now();
      const numeroOrden = `ORD-${timestamp}`;

      const { data: orden, error } = await supabase
        .from('ordenes_restaurante')
        .insert({
          numero_orden: numeroOrden,
          mesa_id: mesa.id,
          mesero_id: user.id,
          estado: 'pending',
          total: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado de mesa
      await supabase
        .from('mesas')
        .update({ estado: 'ocupada' })
        .eq('id', mesa.id);

      window.location.href = `/admin/ordenes/${orden.id}`;
    } catch (error: any) {
      alert('Error creando orden: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Crear Orden - Mesa {mesa.numero}</h2>
        <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">
          ¿Deseas crear una nueva orden para esta mesa?
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateOrden}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? 'Creando...' : 'Crear Orden'}
          </button>
        </div>
      </div>
    </div>
  );
}


