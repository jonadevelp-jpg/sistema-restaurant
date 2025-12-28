import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCLP } from '@/frontend/utils/currency';

interface Ingrediente {
  id: string;
  nombre: string;
  unidad_medida: string;
  precio_unitario: number;
}

interface CompraItem {
  id?: string;
  ingrediente_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  ingredientes?: Ingrediente;
}

interface Compra {
  id: string;
  numero_factura?: string;
  proveedor_id?: string;
  fecha: string;
  total: number;
  metodo_pago?: string;
  estado: string;
}

export default function CompraForm({ compraId }: { compraId: string }) {
  const [compra, setCompra] = useState<Compra | null>(null);
  const [items, setItems] = useState<CompraItem[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    loadData();
  }, [compraId]);

  async function loadData() {
    try {
      const [compRes, itemsRes, ingRes] = await Promise.all([
        supabase.from('compras').select('*').eq('id', compraId).single(),
        supabase
          .from('compra_items')
          .select('*, ingredientes(*)')
          .eq('compra_id', compraId),
        supabase.from('ingredientes').select('*').order('nombre'),
      ]);

      if (compRes.data) setCompra(compRes.data);
      if (itemsRes.data) setItems(itemsRes.data);
      if (ingRes.data) setIngredientes(ingRes.data);
    } catch (error: any) {
      alert('Error cargando: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addItem(ingredienteId: string, cantidad: number, precio: number) {
    try {
      const subtotal = cantidad * precio;
      const { error } = await supabase.from('compra_items').insert({
        compra_id: compraId,
        ingrediente_id: ingredienteId,
        cantidad,
        precio_unitario: precio,
        subtotal,
      });

      if (error) throw error;
      await loadData();
      setShowAdd(false);
    } catch (error: any) {
      alert('Error agregando item: ' + error.message);
    }
  }

  async function removeItem(itemId: string) {
    try {
      const { error } = await supabase
        .from('compra_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await loadData();
    } catch (error: any) {
      alert('Error eliminando: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando compra...</div>
      </div>
    );
  }

  if (!compra) {
    return <div className="p-6">Compra no encontrada</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Compra - {compra.numero_factura || 'Sin factura'}
        </h1>
        <a
          href="/admin/compras"
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          ← Volver
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Items de Compra</h2>
              <button
                onClick={() => setShowAdd(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ➕ Agregar Item
              </button>
            </div>

            {showAdd && (
              <AddItemForm
                ingredientes={ingredientes}
                onAdd={addItem}
                onCancel={() => setShowAdd(false)}
              />
            )}

            <div className="space-y-2 mt-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 border border-slate-200 rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {item.ingredientes?.nombre || 'Item'}
                    </div>
                    <div className="text-sm text-slate-600">
                      {item.cantidad} {item.ingredientes?.unidad_medida} ×{' '}
                      {formatCLP(item.precio_unitario)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold">{formatCLP(item.subtotal)}</div>
                    <button
                      onClick={() => removeItem(item.id!)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Resumen</h2>
            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <strong>Fecha:</strong> {new Date(compra.fecha).toLocaleDateString('es-CL')}
              </p>
              <p className="text-sm">
                <strong>Estado:</strong> {compra.estado}
              </p>
              <p className="text-sm">
                <strong>Método de Pago:</strong> {compra.metodo_pago || '-'}
              </p>
            </div>
            <div className="border-t border-slate-300 pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>{formatCLP(compra.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddItemForm({
  ingredientes,
  onAdd,
  onCancel,
}: {
  ingredientes: Ingrediente[];
  onAdd: (id: string, cantidad: number, precio: number) => void;
  onCancel: () => void;
}) {
  const [ingredienteId, setIngredienteId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ingredienteId || !cantidad || !precio) {
      alert('Completa todos los campos');
      return;
    }

    onAdd(ingredienteId, parseFloat(cantidad), parseFloat(precio));
    setIngredienteId('');
    setCantidad('');
    setPrecio('');
  }

  const selectedIng = ingredientes.find((i) => i.id === ingredienteId);
  if (selectedIng && !precio) {
    setPrecio(selectedIng.precio_unitario.toString());
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-slate-50 rounded-lg">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Ingrediente</label>
          <select
            value={ingredienteId}
            onChange={(e) => setIngredienteId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            required
          >
            <option value="">Seleccionar...</option>
            {ingredientes.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.nombre} ({ing.unidad_medida})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Cantidad</label>
            <input
              type="number"
              step="0.01"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Precio Unitario</label>
            <input
              type="number"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Agregar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}




