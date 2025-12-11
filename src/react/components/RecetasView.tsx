import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCLP } from '@/lib/currency';

interface Ingrediente {
  id: string;
  nombre: string;
  unidad_medida: string;
  precio_unitario: number;
}

interface RecetaIngrediente {
  id: string;
  ingrediente_id: string;
  cantidad: number;
  unidad_medida: string;
  ingredientes?: Ingrediente;
}

interface Receta {
  id: string;
  nombre: string;
  descripcion?: string;
  menu_item_id?: number;
  porciones: number;
  costo_total: number;
  menu_items?: { name: string };
}

export default function RecetasView() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [menuItems, setMenuItems] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Receta | null>(null);
  const [selectedReceta, setSelectedReceta] = useState<Receta | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [recRes, menuRes] = await Promise.all([
        supabase
          .from('recetas')
          .select('*, menu_items(name)')
          .order('nombre'),
        supabase
          .from('menu_items')
          .select('id, name')
          .order('name'),
      ]);

      if (recRes.data) setRecetas(recRes.data);
      if (menuRes.data) setMenuItems(menuRes.data);
    } catch (error: any) {
      alert('Error cargando datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando recetas...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Recetas</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="w-full sm:w-auto px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm sm:text-base"
        >
          ➕ Nueva Receta
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {recetas.map((receta) => (
          <div
            key={receta.id}
            className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-slate-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg truncate">{receta.nombre}</h3>
                {receta.menu_items && (
                  <p className="text-xs sm:text-sm text-slate-600 truncate">
                    Item: {receta.menu_items.name}
                  </p>
                )}
              </div>
            </div>
            {receta.descripcion && (
              <p className="text-sm text-slate-600 mb-3">{receta.descripcion}</p>
            )}
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-600">
                Porciones: {receta.porciones}
              </span>
              <span className="font-semibold text-green-600">
                {formatCLP(receta.costo_total)}
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setSelectedReceta(receta);
                }}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Ver Ingredientes
              </button>
              <button
                onClick={() => {
                  setEditing(receta);
                  setShowForm(true);
                }}
                className="px-3 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 text-sm"
              >
                ✏️
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <RecetaFormModal
          receta={editing}
          menuItems={menuItems}
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

      {selectedReceta && (
        <IngredientesRecetaModal
          receta={selectedReceta}
          onClose={() => setSelectedReceta(null)}
          onSaved={() => {
            setSelectedReceta(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function RecetaFormModal({
  receta,
  menuItems,
  onClose,
  onSaved,
}: {
  receta: Receta | null;
  menuItems: Array<{ id: number; name: string }>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(receta?.nombre || '');
  const [descripcion, setDescripcion] = useState(receta?.descripcion || '');
  const [menuItemId, setMenuItemId] = useState(receta?.menu_item_id?.toString() || '');
  const [porciones, setPorciones] = useState(receta?.porciones.toString() || '1');
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
        descripcion: descripcion.trim() || null,
        menu_item_id: menuItemId ? parseInt(menuItemId) : null,
        porciones: parseInt(porciones) || 1,
      };

      if (receta) {
        const { error } = await supabase
          .from('recetas')
          .update(data)
          .eq('id', receta.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('recetas').insert(data);
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
          {receta ? 'Editar' : 'Nueva'} Receta
        </h2>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Item del Menú (opcional)</label>
            <select
              value={menuItemId}
              onChange={(e) => setMenuItemId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
            >
              <option value="">Sin item del menú</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Porciones</label>
            <input
              type="number"
              value={porciones}
              onChange={(e) => setPorciones(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
            />
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

function IngredientesRecetaModal({
  receta,
  onClose,
  onSaved,
}: {
  receta: Receta;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [ingredientes, setIngredientes] = useState<RecetaIngrediente[]>([]);
  const [allIngredientes, setAllIngredientes] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    loadData();
  }, [receta.id]);

  async function loadData() {
    try {
      const [recIngRes, allIngRes] = await Promise.all([
        supabase
          .from('receta_ingredientes')
          .select('*, ingredientes(*)')
          .eq('receta_id', receta.id),
        supabase.from('ingredientes').select('*').order('nombre'),
      ]);

      if (recIngRes.data) setIngredientes(recIngRes.data);
      if (allIngRes.data) setAllIngredientes(allIngRes.data);
    } catch (error: any) {
      alert('Error cargando: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addIngrediente(ingredienteId: string, cantidad: number, unidad: string) {
    try {
      const { error } = await supabase.from('receta_ingredientes').insert({
        receta_id: receta.id,
        ingrediente_id: ingredienteId,
        cantidad,
        unidad_medida: unidad,
      });

      if (error) throw error;
      await loadData();
      setShowAdd(false);
    } catch (error: any) {
      alert('Error agregando: ' + error.message);
    }
  }

  async function removeIngrediente(id: string) {
    try {
      const { error } = await supabase
        .from('receta_ingredientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadData();
    } catch (error: any) {
      alert('Error eliminando: ' + error.message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Ingredientes - {receta.nombre}</h2>
        <div className="mb-3 sm:mb-4">
          <button
            onClick={() => setShowAdd(true)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
          >
            ➕ Agregar Ingrediente
          </button>
        </div>

        {showAdd && (
          <AddIngredienteForm
            ingredientes={allIngredientes}
            onAdd={addIngrediente}
            onCancel={() => setShowAdd(false)}
          />
        )}

        <div className="space-y-2">
          {ingredientes.map((ri) => (
            <div
              key={ri.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2 sm:p-3 border border-slate-200 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base">{ri.ingredientes?.nombre}</div>
                <div className="text-xs sm:text-sm text-slate-600">
                  {ri.cantidad} {ri.unidad_medida}
                </div>
              </div>
              <button
                onClick={() => removeIngrediente(ri.id)}
                className="text-red-600 hover:text-red-800 text-sm sm:text-base self-end sm:self-center"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm sm:text-base"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function AddIngredienteForm({
  ingredientes,
  onAdd,
  onCancel,
}: {
  ingredientes: Ingrediente[];
  onAdd: (id: string, cantidad: number, unidad: string) => void;
  onCancel: () => void;
}) {
  const [ingredienteId, setIngredienteId] = useState('');
  const [cantidad, setCantidad] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ingredienteId || !cantidad) {
      alert('Completa todos los campos');
      return;
    }

    const ing = ingredientes.find((i) => i.id === ingredienteId);
    if (!ing) return;

    onAdd(ingredienteId, parseFloat(cantidad), ing.unidad_medida);
    setIngredienteId('');
    setCantidad('');
  }

  return (
    <form onSubmit={handleSubmit} className="mb-3 sm:mb-4 p-3 sm:p-4 bg-slate-50 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">Ingrediente</label>
          <select
            value={ingredienteId}
            onChange={(e) => setIngredienteId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
          >
            <option value="">Seleccionar...</option>
            {ingredientes.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.nombre} ({ing.unidad_medida})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">Cantidad</label>
          <input
            type="number"
            step="0.01"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-3">
        <button
          type="submit"
          className="flex-1 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
        >
          Agregar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 sm:px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm sm:text-base"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}


