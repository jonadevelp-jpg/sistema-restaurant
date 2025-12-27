import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCLP } from '@/utils/currency';

interface Ingrediente {
  id: string;
  nombre: string;
  unidad_medida: string;
  precio_unitario: number;
  stock_actual: number;
  stock_minimo: number;
  proveedor_id?: string;
  suppliers?: { name: string };
}

export default function StockView() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIngrediente, setSelectedIngrediente] = useState<Ingrediente | null>(null);
  const [showAjusteModal, setShowAjusteModal] = useState(false);

  useEffect(() => {
    loadIngredientes();
  }, []);

  async function loadIngredientes() {
    try {
      const { data, error } = await supabase
        .from('ingredientes')
        .select('*, suppliers(name)')
        .order('nombre');

      if (error) throw error;
      setIngredientes(data || []);
    } catch (error: any) {
      alert('Error cargando ingredientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function getStockStatus(stock: number, minimo: number) {
    if (stock <= 0) return { color: 'bg-red-100 text-red-800', label: 'Sin Stock' };
    if (stock <= minimo) return { color: 'bg-yellow-100 text-yellow-800', label: 'Bajo' };
    return { color: 'bg-green-100 text-green-800', label: 'OK' };
  }

  const filteredIngredientes = ingredientes.filter((ing) =>
    ing.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando stock...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Gestión de Stock</h1>
        <button
          onClick={() => window.location.href = '/admin/ingredientes'}
          className="w-full sm:w-auto px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm sm:text-base"
        >
          ➕ Agregar Ingrediente
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Buscar ingrediente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
        />
      </div>

      {/* Vista móvil - Cards */}
      <div className="md:hidden space-y-3">
        {filteredIngredientes.map((ing) => {
          const status = getStockStatus(ing.stock_actual, ing.stock_minimo);
          return (
            <div key={ing.id} className="bg-white rounded-lg shadow-md p-4 border border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{ing.nombre}</h3>
                  <p className="text-xs text-slate-600">{ing.unidad_medida}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ml-2 ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <div className="space-y-1 text-xs sm:text-sm mb-3">
                <p><span className="font-medium">Stock:</span> {ing.stock_actual} {ing.unidad_medida} / Mín: {ing.stock_minimo} {ing.unidad_medida}</p>
                <p><span className="font-medium">Precio por {ing.unidad_medida}:</span> {formatCLP(ing.precio_unitario)}</p>
                {ing.unidad_medida !== 'un' && (
                  <p><span className="font-medium">Valor Total Stock:</span> {formatCLP(ing.stock_actual * ing.precio_unitario)}</p>
                )}
                {ing.suppliers && (
                  <p><span className="font-medium">Proveedor:</span> {ing.suppliers.name}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedIngrediente(ing);
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => {
                    setSelectedIngrediente(ing);
                    setShowAjusteModal(true);
                  }}
                  className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  📊 Ajustar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Ingrediente</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Unidad</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Stock Actual</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Stock Mínimo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Precio por Unidad</th>
                {ingredientes.some(ing => ing.unidad_medida !== 'un') && (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Valor Total Stock</th>
                )}
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Proveedor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredIngredientes.map((ing) => {
                const status = getStockStatus(ing.stock_actual, ing.stock_minimo);
                return (
                  <tr key={ing.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium">{ing.nombre}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{ing.unidad_medida}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{ing.stock_actual} {ing.unidad_medida}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{ing.stock_minimo} {ing.unidad_medida}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatCLP(ing.precio_unitario)} / {ing.unidad_medida}</td>
                    {ingredientes.some(ing2 => ing2.unidad_medida !== 'un') && (
                      <td className="px-4 py-3 text-sm font-semibold">
                        {ing.unidad_medida !== 'un' ? formatCLP(ing.stock_actual * ing.precio_unitario) : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {ing.suppliers?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedIngrediente(ing);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedIngrediente(ing);
                            setShowAjusteModal(true);
                          }}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          📊 Ajustar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && selectedIngrediente && (
        <EditIngredienteModal
          ingrediente={selectedIngrediente}
          onClose={() => {
            setShowEditModal(false);
            setSelectedIngrediente(null);
          }}
          onSaved={() => {
            setShowEditModal(false);
            setSelectedIngrediente(null);
            loadIngredientes();
          }}
        />
      )}

      {showAjusteModal && selectedIngrediente && (
        <AjusteStockModal
          ingrediente={selectedIngrediente}
          onClose={() => {
            setShowAjusteModal(false);
            setSelectedIngrediente(null);
          }}
          onSaved={() => {
            setShowAjusteModal(false);
            setSelectedIngrediente(null);
            loadIngredientes();
          }}
        />
      )}
    </div>
  );
}

// Modal para editar ingrediente
function EditIngredienteModal({
  ingrediente,
  onClose,
  onSaved,
}: {
  ingrediente: Ingrediente;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(ingrediente.nombre);
  const [unidad, setUnidad] = useState(ingrediente.unidad_medida);
  const [precio, setPrecio] = useState(ingrediente.precio_unitario.toString());
  const [stockMinimo, setStockMinimo] = useState(ingrediente.stock_minimo.toString());
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('ingredientes')
        .update({
          nombre,
          unidad_medida: unidad,
          precio_unitario: parseFloat(precio),
          stock_minimo: parseInt(stockMinimo),
        })
        .eq('id', ingrediente.id);

      if (error) throw error;
      onSaved();
    } catch (error: any) {
      alert('Error actualizando: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Editar Ingrediente</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unidad de Medida</label>
            <input
              type="text"
              value={unidad}
              onChange={(e) => setUnidad(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Precio por {unidad}</label>
            <input
              type="number"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Ej: 5000 (si es por kg)"
            />
            {unidad !== 'un' && parseFloat(precio) > 0 && (
              <p className="text-xs text-slate-600 mt-1">
                Precio por {unidad}: {formatCLP(parseFloat(precio) || 0)}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock Mínimo ({unidad})</label>
            <input
              type="number"
              step="0.01"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Umbral para alerta de stock bajo"
            />
            <p className="text-xs text-slate-600 mt-1">
              Se mostrará alerta cuando el stock esté por debajo de este valor
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal para ajustar stock
function AjusteStockModal({
  ingrediente,
  onClose,
  onSaved,
}: {
  ingrediente: Ingrediente;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tipo, setTipo] = useState<'entrada' | 'salida' | 'ajuste'>('ajuste');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAjuste() {
    if (!cantidad || parseFloat(cantidad) <= 0) {
      alert('Ingresa una cantidad válida');
      return;
    }

    setLoading(true);
    try {
      const cantidadNum = parseFloat(cantidad);
      let nuevoStock = ingrediente.stock_actual;

      if (tipo === 'entrada') {
        nuevoStock += cantidadNum;
      } else if (tipo === 'salida') {
        nuevoStock -= cantidadNum;
        if (nuevoStock < 0) {
          alert('No hay suficiente stock');
          setLoading(false);
          return;
        }
      } else {
        // Ajuste directo
        nuevoStock = cantidadNum;
      }

      // Actualizar stock
      const { error: updateError } = await supabase
        .from('ingredientes')
        .update({ stock_actual: nuevoStock })
        .eq('id', ingrediente.id);

      if (updateError) throw updateError;

      // Registrar movimiento
      const { error: movError } = await supabase
        .from('movimientos_stock')
        .insert({
          ingrediente_id: ingrediente.id,
          tipo: tipo === 'entrada' ? 'entrada' : tipo === 'salida' ? 'salida' : 'ajuste',
          cantidad: tipo === 'ajuste' ? cantidadNum - ingrediente.stock_actual : cantidadNum,
          motivo: motivo || `Ajuste manual - ${tipo}`,
          usuario_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (movError) {
        console.error('Error registrando movimiento:', movError);
        // No fallar si el movimiento no se registra
      }

      onSaved();
    } catch (error: any) {
      alert('Error ajustando stock: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          Ajustar Stock - {ingrediente.nombre}
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Stock actual: <span className="font-semibold">{ingrediente.stock_actual}</span>{' '}
          {ingrediente.unidad_medida}
          {ingrediente.unidad_medida !== 'un' && (
            <span className="ml-2">
              (Valor: {formatCLP(ingrediente.stock_actual * ingrediente.precio_unitario)})
            </span>
          )}
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Ajuste</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="entrada">Entrada (+)</option>
              <option value="salida">Salida (-)</option>
              <option value="ajuste">Ajuste Directo (=)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {tipo === 'ajuste' ? 'Nuevo Stock' : 'Cantidad'} ({ingrediente.unidad_medida})
            </label>
            <input
              type="number"
              step="0.01"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder={tipo === 'ajuste' ? `Nuevo valor de stock en ${ingrediente.unidad_medida}` : `Cantidad en ${ingrediente.unidad_medida}`}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            {cantidad && parseFloat(cantidad) > 0 && ingrediente.unidad_medida !== 'un' && (
              <p className="text-xs text-slate-600 mt-1">
                Valor: {formatCLP(parseFloat(cantidad) * ingrediente.precio_unitario)}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Motivo (opcional)</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Ajuste por inventario, Pérdida, etc."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleAjuste}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Ajustando...' : 'Ajustar Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}


