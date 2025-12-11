import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCLP } from '@/lib/currency';

interface Supplier {
  id: string;
  name: string;
}

interface Ingrediente {
  id: string;
  nombre: string;
  unidad_medida: string;
  precio_unitario: number;
  stock_actual: number;
  stock_minimo: number;
  proveedor_id?: string;
}

export default function IngredientesView() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ingrediente | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ingRes, supRes] = await Promise.all([
        supabase.from('ingredientes').select('*').order('nombre'),
        supabase.from('suppliers').select('*').order('name'),
      ]);

      if (ingRes.data) setIngredientes(ingRes.data);
      if (supRes.data) setSuppliers(supRes.data);
    } catch (error: any) {
      alert('Error cargando datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(ing: Ingrediente) {
    setEditing(ing);
    setShowForm(true);
  }

  function handleNew() {
    setEditing(null);
    setShowForm(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Ingredientes</h1>
        <button
          onClick={handleNew}
          className="w-full sm:w-auto px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm sm:text-base"
        >
          ➕ Nuevo Ingrediente
        </button>
      </div>

      {/* Vista móvil - Cards */}
      <div className="md:hidden space-y-3">
        {ingredientes.map((ing) => (
          <div key={ing.id} className="bg-white rounded-lg shadow-md p-4 border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{ing.nombre}</h3>
                <p className="text-xs text-slate-600">{ing.unidad_medida}</p>
              </div>
            </div>
            <div className="space-y-1 text-xs sm:text-sm mb-3">
              <p><span className="font-medium">Precio:</span> {formatCLP(ing.precio_unitario)}</p>
              <p><span className="font-medium">Stock:</span> {ing.stock_actual} / Mín: {ing.stock_minimo}</p>
            </div>
            <button
              onClick={() => handleEdit(ing)}
              className="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              ✏️ Editar
            </button>
          </div>
        ))}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Unidad</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Precio Unit.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Stock Actual</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Stock Mínimo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ingredientes.map((ing) => (
                <tr key={ing.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium">{ing.nombre}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{ing.unidad_medida}</td>
                  <td className="px-4 py-3 text-sm">{formatCLP(ing.precio_unitario)}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{ing.stock_actual}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{ing.stock_minimo}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(ing)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ✏️ Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <IngredienteFormModal
          ingrediente={editing}
          suppliers={suppliers}
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
    </div>
  );
}

function IngredienteFormModal({
  ingrediente,
  suppliers,
  onClose,
  onSaved,
}: {
  ingrediente: Ingrediente | null;
  suppliers: Supplier[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(ingrediente?.nombre || '');
  const [unidad, setUnidad] = useState(ingrediente?.unidad_medida || 'kg');
  const [precio, setPrecio] = useState(ingrediente?.precio_unitario.toString() || '0');
  const [stockActual, setStockActual] = useState(ingrediente?.stock_actual.toString() || '0');
  const [stockMinimo, setStockMinimo] = useState(ingrediente?.stock_minimo.toString() || '0');
  const [proveedorId, setProveedorId] = useState(ingrediente?.proveedor_id || '');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!nombre.trim()) {
      alert('Ingresa un nombre');
      return;
    }

    setLoading(true);
    try {
      const data = {
        nombre: nombre.trim(),
        unidad_medida: unidad,
        precio_unitario: parseFloat(precio) || 0,
        stock_actual: parseFloat(stockActual) || 0,
        stock_minimo: parseFloat(stockMinimo) || 0,
        proveedor_id: proveedorId || null,
      };

      if (ingrediente) {
        const { error } = await supabase
          .from('ingredientes')
          .update(data)
          .eq('id', ingrediente.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('ingredientes').insert(data);
        if (error) throw error;
      }

      onSaved();
    } catch (error: any) {
      alert('Error guardando: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
          {ingrediente ? 'Editar' : 'Nuevo'} Ingrediente
        </h2>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
              placeholder="Ej: Carne de res"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Unidad de Medida</label>
            <select
              value={unidad}
              onChange={(e) => setUnidad(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
            >
              <option value="kg">kg (kilogramos)</option>
              <option value="gr">gr (gramos)</option>
              <option value="lt">lt (litros)</option>
              <option value="ml">ml (mililitros)</option>
              <option value="un">un (unidades)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Precio Unitario (CLP)</label>
            <input
              type="number"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Stock Actual</label>
            <input
              type="number"
              step="0.01"
              value={stockActual}
              onChange={(e) => setStockActual(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
              placeholder="0"
            />
            <p className="text-xs text-slate-500 mt-1">Cantidad actual en inventario</p>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Stock Mínimo</label>
            <input
              type="number"
              step="0.01"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
              placeholder="0"
            />
            <p className="text-xs text-slate-500 mt-1">Cantidad mínima antes de alertar</p>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Proveedor (opcional)</label>
            <select
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
            >
              <option value="">Sin proveedor</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
            {suppliers.length === 0 && (
              <p className="text-xs text-slate-500 mt-1">
                No hay proveedores. Puedes agregar uno desde la sección de Compras.
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}


