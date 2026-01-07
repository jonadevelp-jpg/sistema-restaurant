import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCLP } from '@/frontend/utils/currency';

interface Orden {
  id: string;
  numero_orden: string;
  mesa_id?: string;
  estado: string;
  total: number;
  metodo_pago?: string;
  created_at: string;
  paid_at?: string;
  mesas?: { numero: number };
  users?: { name: string };
}

export default function OrdenesListView() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('all');
  const [filtroFecha, setFiltroFecha] = useState<string>('today');
  const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadOrdenes();
  }, [filtroEstado, filtroFecha]);

  async function loadOrdenes() {
    try {
      setLoading(true);
      
      // Primero obtener las órdenes sin la relación de mesas
      let query = supabase
        .from('ordenes_restaurante')
        .select('*')
        .order('created_at', { ascending: false });

      // Filtro por estado
      if (filtroEstado !== 'all') {
        query = query.eq('estado', filtroEstado);
      }

      // Filtro por fecha
      if (filtroFecha === 'today') {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        query = query.gte('created_at', hoy.toISOString());
      } else if (filtroFecha === 'week') {
        const semana = new Date();
        semana.setDate(semana.getDate() - 7);
        query = query.gte('created_at', semana.toISOString());
      } else if (filtroFecha === 'month') {
        const mes = new Date();
        mes.setDate(1);
        mes.setHours(0, 0, 0, 0);
        query = query.gte('created_at', mes.toISOString());
      }

      const { data: ordenesData, error: ordenesError } = await query.limit(100);

      if (ordenesError) {
        console.error('Error cargando órdenes:', ordenesError);
        throw ordenesError;
      }
      
      // Obtener información de mesas por separado
      const mesaIds = ordenesData?.filter(o => o.mesa_id).map(o => o.mesa_id).filter(Boolean) || [];
      const mesasMap = new Map();
      
      if (mesaIds.length > 0) {
        const { data: mesasData, error: mesasError } = await supabase
          .from('mesas')
          .select('id, numero')
          .in('id', mesaIds);
        
        if (mesasError) {
          console.error('Error cargando mesas:', mesasError);
        } else if (mesasData) {
          mesasData.forEach(mesa => {
            mesasMap.set(mesa.id, mesa);
          });
        }
      }
      
      // Combinar datos
      const ordenesConMesas = ordenesData?.map(orden => ({
        ...orden,
        mesas: orden.mesa_id ? mesasMap.get(orden.mesa_id) : null
      })) || [];
      
      setOrdenes(ordenesConMesas);
    } catch (error: any) {
      alert('Error cargando órdenes: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function getEstadoColor(estado: string) {
    switch (estado) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'served':
        return 'bg-indigo-100 text-indigo-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  const totalVentas = ordenes
    .filter((o) => o.estado === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  // Manejo de selección
  function toggleSeleccionOrden(ordenId: string) {
    const nuevasSeleccionadas = new Set(ordenesSeleccionadas);
    if (nuevasSeleccionadas.has(ordenId)) {
      nuevasSeleccionadas.delete(ordenId);
    } else {
      nuevasSeleccionadas.add(ordenId);
    }
    setOrdenesSeleccionadas(nuevasSeleccionadas);
  }

  function toggleSeleccionarTodas() {
    if (ordenesSeleccionadas.size === ordenes.length) {
      setOrdenesSeleccionadas(new Set());
    } else {
      setOrdenesSeleccionadas(new Set(ordenes.map(o => o.id)));
    }
  }

  async function eliminarOrden(ordenId: string) {
    if (!confirm('¿Estás seguro de eliminar esta orden? Esta acción no se puede deshacer y liberará la mesa si está asignada.')) {
      return;
    }

    await eliminarOrdenes([ordenId]);
  }

  async function eliminarOrdenesSeleccionadas() {
    const cantidad = ordenesSeleccionadas.size;
    if (cantidad === 0) return;

    if (!confirm(`¿Estás seguro de eliminar ${cantidad} orden(es) seleccionada(s)? Esta acción no se puede deshacer y liberará las mesas si están asignadas.`)) {
      return;
    }

    await eliminarOrdenes(Array.from(ordenesSeleccionadas));
  }

  async function eliminarOrdenes(ordenIds: string[]) {
    try {
      // Obtener las órdenes para saber qué mesas liberar
      const { data: ordenesData, error: fetchError } = await supabase
        .from('ordenes_restaurante')
        .select('id, mesa_id')
        .in('id', ordenIds);

      if (fetchError) throw fetchError;

      const mesaIds = ordenesData?.filter(o => o.mesa_id).map(o => o.mesa_id).filter(Boolean) || [];

      // Eliminar las órdenes
      const { error: deleteError } = await supabase
        .from('ordenes_restaurante')
        .delete()
        .in('id', ordenIds);

      if (deleteError) throw deleteError;

      // Liberar las mesas si tenían asignadas
      if (mesaIds.length > 0) {
        const { error: mesaError } = await supabase
          .from('mesas')
          .update({ estado: 'libre' })
          .in('id', mesaIds);

        if (mesaError) {
          console.error('[eliminarOrdenes] Error liberando mesas:', mesaError);
        } else {
          console.log(`[eliminarOrdenes] ✅ ${mesaIds.length} mesa(s) liberada(s) correctamente`);
        }
      }

      // Limpiar selección
      setOrdenesSeleccionadas(new Set());
      
      // Recargar órdenes
      loadOrdenes();
    } catch (error: any) {
      console.error('[eliminarOrdenes] Error:', error);
      alert('Error eliminando órdenes: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando órdenes...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Órdenes</h1>
        <div className="text-base sm:text-lg font-semibold text-green-600">
          Total Ventas: {formatCLP(totalVentas)}
        </div>
      </div>

      {/* Filtros y acciones */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Filtro por Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setOrdenesSeleccionadas(new Set()); // Limpiar selección al cambiar filtro
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
            >
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="preparing">En Preparación</option>
              <option value="ready">Listas</option>
              <option value="served">Servidas</option>
              <option value="paid">Pagadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Filtro por Fecha</label>
            <select
              value={filtroFecha}
              onChange={(e) => {
                setFiltroFecha(e.target.value);
                setOrdenesSeleccionadas(new Set()); // Limpiar selección al cambiar filtro
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
            >
              <option value="today">Hoy</option>
              <option value="week">Última Semana</option>
              <option value="month">Este Mes</option>
              <option value="all">Todas</option>
            </select>
          </div>
        </div>
        
        {/* Botón eliminar seleccionadas */}
        {ordenesSeleccionadas.size > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-sm text-slate-600">
              {ordenesSeleccionadas.size} orden(es) seleccionada(s)
            </span>
            <button
              onClick={eliminarOrdenesSeleccionadas}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              🗑️ Eliminar Seleccionadas
            </button>
          </div>
        )}
      </div>

      {/* Vista móvil - Cards */}
      <div className="md:hidden space-y-3">
        {ordenes.map((orden) => (
          <div key={orden.id} className="bg-white rounded-lg shadow-md p-4 border border-slate-200">
            <div className="flex items-start gap-2 mb-2">
              <input
                type="checkbox"
                checked={ordenesSeleccionadas.has(orden.id)}
                onChange={() => toggleSeleccionOrden(orden.id)}
                className="mt-1 w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{orden.numero_orden}</h3>
                {orden.mesas && (
                  <p className="text-xs text-slate-600">Mesa {orden.mesas.numero}</p>
                )}
                {orden.users && (
                  <p className="text-xs text-slate-600">Mesero: {orden.users.name}</p>
                )}
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ml-2 ${getEstadoColor(
                  orden.estado
                )}`}
              >
                {orden.estado}
              </span>
            </div>
            <div className="space-y-1 text-xs sm:text-sm mb-3">
              <p><span className="font-medium">Fecha:</span> {new Date(orden.created_at).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}</p>
              <p><span className="font-medium">Total:</span> {formatCLP(orden.total)}</p>
              {orden.metodo_pago && (
                <p><span className="font-medium">Pago:</span> {orden.metodo_pago}</p>
              )}
            </div>
            <div className="flex gap-2">
              <a
                href={`/admin/ordenes/${orden.id}`}
                className="flex-1 text-center px-3 py-2 bg-slate-600 text-white rounded text-xs sm:text-sm hover:bg-slate-700"
              >
                Ver/Editar
              </a>
              <button
                onClick={() => eliminarOrden(orden.id)}
                className="px-3 py-2 bg-red-600 text-white rounded text-xs sm:text-sm hover:bg-red-700"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={ordenes.length > 0 && ordenesSeleccionadas.size === ordenes.length}
                    onChange={toggleSeleccionarTodas}
                    className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
                    title="Seleccionar todas"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Orden</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Mesa</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Mesero</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Pago</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ordenes.map((orden) => (
                <tr key={orden.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={ordenesSeleccionadas.has(orden.id)}
                      onChange={() => toggleSeleccionOrden(orden.id)}
                      className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{orden.numero_orden}</td>
                  <td className="px-4 py-3 text-sm">
                    {orden.mesas ? `Mesa ${orden.mesas.numero}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">{orden.users?.name || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(orden.created_at).toLocaleString('es-CL')}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    {formatCLP(orden.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(
                        orden.estado
                      )}`}
                    >
                      {orden.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {orden.metodo_pago || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <a
                        href={`/admin/ordenes/${orden.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Ver/Editar
                      </a>
                      <button
                        onClick={() => eliminarOrden(orden.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Eliminar orden"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {ordenes.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No hay órdenes con los filtros seleccionados
        </div>
      )}
    </div>
  );
}

