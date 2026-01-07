import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCLP } from '@/frontend/utils/currency';

interface StockItem {
  id: string;
  tipo: 'pan' | 'bebida';
  nombre: string;
  categoria_slug: string | null;
  cantidad: number;
  precio_unitario: number;
  stock_minimo: number;
  unidad_medida: string;
  created_at: string;
  updated_at: string;
}

export default function StockPanesBebidas() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pan' | 'bebida'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [showAjusteModal, setShowAjusteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data, error } = await supabase
        .from('stock_panes_bebidas')
        .select('*')
        .order('tipo', { ascending: true })
        .order('nombre', { ascending: true });

      if (error) {
        // Si la tabla no existe, mostrar mensaje amigable
        if (error.message.includes('Could not find the table') || error.message.includes('does not exist')) {
          throw new Error('La tabla de stock no existe. Por favor ejecuta el script SQL: database/CREAR_TABLA_STOCK_PANES_BEBIDAS.sql en Supabase SQL Editor.');
        }
        throw error;
      }
      setItems(data || []);
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      alert('Error cargando stock: ' + errorMessage);
      console.error('Error completo:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStockStatus(cantidad: number, minimo: number) {
    if (cantidad <= 0) return { color: 'bg-red-100 text-red-800', label: 'Sin Stock' };
    if (cantidad <= minimo) return { color: 'bg-yellow-100 text-yellow-800', label: 'Bajo' };
    return { color: 'bg-green-100 text-green-800', label: 'OK' };
  }

  function getCategoriaNombre(slug: string | null) {
    if (!slug) return '-';
    const nombres: Record<string, string> = {
      'completos': 'Completos',
      'sandwiches': 'Sandwiches',
    };
    return nombres[slug] || slug;
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.tipo === filterType;
    return matchesSearch && matchesType;
  });

  const panes = filteredItems.filter((item) => item.tipo === 'pan');
  const bebidas = filteredItems.filter((item) => item.tipo === 'bebida');

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
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Stock de Panes y Bebidas</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="w-full sm:w-auto px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm sm:text-base"
        >
          ➕ Agregar Item
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 sm:px-4 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'pan' | 'bebida')}
          className="px-3 sm:px-4 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
        >
          <option value="all">Todos</option>
          <option value="pan">Panes</option>
          <option value="bebida">Bebidas</option>
        </select>
      </div>

      {/* PANES */}
      {filterType === 'all' || filterType === 'pan' ? (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">🍞 Panes</h2>
          
          {/* Vista móvil - Cards */}
          <div className="md:hidden space-y-3">
            {panes.map((item) => {
              const status = getStockStatus(item.cantidad, item.stock_minimo);
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-4 border border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{item.nombre}</h3>
                      <p className="text-xs text-slate-600">
                        Categoría: {getCategoriaNombre(item.categoria_slug)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ml-2 ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm mb-3">
                    <p><span className="font-medium">Stock:</span> {item.cantidad} {item.unidad_medida} / Mín: {item.stock_minimo} {item.unidad_medida}</p>
                    <p><span className="font-medium">Precio por {item.unidad_medida}:</span> {formatCLP(item.precio_unitario)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(item);
                        setShowForm(true);
                      }}
                      className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
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
            {panes.length === 0 && (
              <div className="text-center py-8 text-slate-500">No hay panes registrados</div>
            )}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nombre</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Categoría</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Stock Actual</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Stock Mínimo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Estado</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Precio Unit.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {panes.map((item) => {
                    const status = getStockStatus(item.cantidad, item.stock_minimo);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium">{item.nombre}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{getCategoriaNombre(item.categoria_slug)}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{item.cantidad} {item.unidad_medida}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{item.stock_minimo} {item.unidad_medida}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{formatCLP(item.precio_unitario)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditing(item);
                                setShowForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
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
              {panes.length === 0 && (
                <div className="text-center py-8 text-slate-500">No hay panes registrados</div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* BEBIDAS */}
      {filterType === 'all' || filterType === 'bebida' ? (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">🥤 Bebidas</h2>
          
          {/* Vista móvil - Cards */}
          <div className="md:hidden space-y-3">
            {bebidas.map((item) => {
              const status = getStockStatus(item.cantidad, item.stock_minimo);
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-4 border border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{item.nombre}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ml-2 ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm mb-3">
                    <p><span className="font-medium">Stock:</span> {item.cantidad} {item.unidad_medida} / Mín: {item.stock_minimo} {item.unidad_medida}</p>
                    <p><span className="font-medium">Precio por {item.unidad_medida}:</span> {formatCLP(item.precio_unitario)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(item);
                        setShowForm(true);
                      }}
                      className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
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
            {bebidas.length === 0 && (
              <div className="text-center py-8 text-slate-500">No hay bebidas registradas</div>
            )}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nombre</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Stock Actual</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Stock Mínimo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Estado</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Precio Unit.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bebidas.map((item) => {
                    const status = getStockStatus(item.cantidad, item.stock_minimo);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium">{item.nombre}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{item.cantidad} {item.unidad_medida}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{item.stock_minimo} {item.unidad_medida}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{formatCLP(item.precio_unitario)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditing(item);
                                setShowForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
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
              {bebidas.length === 0 && (
                <div className="text-center py-8 text-slate-500">No hay bebidas registradas</div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal de Formulario */}
      {showForm && (
        <StockItemFormModal
          item={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            loadData();
          }}
        />
      )}

      {/* Modal de Ajuste */}
      {showAjusteModal && selectedItem && (
        <AjusteStockModal
          item={selectedItem}
          onClose={() => {
            setShowAjusteModal(false);
            setSelectedItem(null);
          }}
          onSaved={() => {
            setShowAjusteModal(false);
            setSelectedItem(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Modal de Formulario
function StockItemFormModal({
  item,
  onClose,
  onSaved,
}: {
  item: StockItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState({
    tipo: (item?.tipo || 'pan') as 'pan' | 'bebida',
    nombre: item?.nombre || '',
    categoria_slug: item?.categoria_slug || '',
    cantidad: item?.cantidad || 0,
    precio_unitario: item?.precio_unitario || 0,
    stock_minimo: item?.stock_minimo || 0,
    unidad_medida: item?.unidad_medida || 'un',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        categoria_slug: formData.tipo === 'pan' ? formData.categoria_slug : null,
        unidad_medida: formData.tipo === 'bebida' ? (formData.unidad_medida === 'un' ? 'lt' : formData.unidad_medida) : 'un',
      };

      if (item) {
        // Actualizar
        const { error } = await supabase
          .from('stock_panes_bebidas')
          .update(dataToSave)
          .eq('id', item.id);

        if (error) throw error;
      } else {
        // Crear
        const { error } = await supabase
          .from('stock_panes_bebidas')
          .insert(dataToSave);

        if (error) throw error;
      }

      onSaved();
    } catch (error: any) {
      alert('Error guardando: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{item ? 'Editar' : 'Nuevo'} Item de Stock</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'pan' | 'bebida' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                disabled={!!item}
              >
                <option value="pan">Pan</option>
                <option value="bebida">Bebida</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Ej: Pan de Completo, Coca Cola"
              />
            </div>

            {formData.tipo === 'pan' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                <select
                  value={formData.categoria_slug}
                  onChange={(e) => setFormData({ ...formData, categoria_slug: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Seleccionar...</option>
                  <option value="completos">Completos</option>
                  <option value="sandwiches">Sandwiches</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad Actual</label>
              <input
                type="number"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
              <input
                type="number"
                value={formData.stock_minimo}
                onChange={(e) => setFormData({ ...formData, stock_minimo: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio Unitario</label>
              <input
                type="number"
                value={formData.precio_unitario}
                onChange={(e) => setFormData({ ...formData, precio_unitario: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                min="0"
                step="0.01"
              />
            </div>

            {formData.tipo === 'bebida' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unidad de Medida</label>
                <select
                  value={formData.unidad_medida}
                  onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="lt">Litros (lt)</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="un">Unidad (un)</option>
                </select>
              </div>
            )}
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
              disabled={saving}
              className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal de Ajuste
function AjusteStockModal({
  item,
  onClose,
  onSaved,
}: {
  item: StockItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tipoAjuste, setTipoAjuste] = useState<'entrada' | 'salida' | 'ajuste'>('entrada');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAjuste() {
    const cantidadNum = parseFloat(cantidad);
    if (!cantidadNum || cantidadNum <= 0) {
      alert('Ingresa una cantidad válida');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      let nuevaCantidad = item.cantidad;
      if (tipoAjuste === 'entrada') {
        nuevaCantidad = item.cantidad + cantidadNum;
      } else if (tipoAjuste === 'salida') {
        nuevaCantidad = item.cantidad - cantidadNum;
      } else {
        nuevaCantidad = cantidadNum;
      }

      // Actualizar stock
      const { error: updateError } = await supabase
        .from('stock_panes_bebidas')
        .update({ cantidad: nuevaCantidad })
        .eq('id', item.id);

      if (updateError) throw updateError;

      // Registrar movimiento
      const { error: movError } = await supabase
        .from('movimientos_stock_panes_bebidas')
        .insert({
          stock_id: item.id,
          tipo_movimiento: tipoAjuste,
          cantidad: tipoAjuste === 'ajuste' ? cantidadNum : cantidadNum,
          motivo: motivo || `Ajuste manual - ${tipoAjuste}`,
          referencia_tipo: 'ajuste',
          created_by: user.id,
        });

      if (movError) throw movError;

      onSaved();
    } catch (error: any) {
      alert('Error ajustando stock: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Ajustar Stock: {item.nombre}</h2>
          <p className="text-sm text-slate-600 mb-4">Stock actual: {item.cantidad} {item.unidad_medida}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Ajuste</label>
              <select
                value={tipoAjuste}
                onChange={(e) => setTipoAjuste(e.target.value as 'entrada' | 'salida' | 'ajuste')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="entrada">➕ Entrada (+)</option>
                <option value="salida">➖ Salida (-)</option>
                <option value="ajuste">⚖️ Ajuste Directo (=)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad</label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Motivo (opcional)</label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Ej: Compra, Ajuste de inventario"
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
              disabled={saving}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Ajustando...' : 'Aplicar Ajuste'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

