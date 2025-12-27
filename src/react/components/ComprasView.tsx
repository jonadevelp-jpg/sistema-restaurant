import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCLP } from '@/utils/currency';

interface Supplier {
  id: string;
  name: string;
}

interface CompraItem {
  id: string;
  ingrediente_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  ingredientes?: { nombre: string; unidad_medida: string };
}

interface Compra {
  id: string;
  numero_factura?: string;
  proveedor_id?: string;
  fecha: string;
  total: number;
  metodo_pago?: string;
  estado: string;
  notas?: string;
  suppliers?: Supplier;
  users?: { name: string };
}

export default function ComprasView() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [compRes, supRes] = await Promise.all([
        supabase
          .from('compras')
          .select('*, suppliers(name), users(name)')
          .order('fecha', { ascending: false })
          .limit(50),
        supabase.from('suppliers').select('*').order('name'),
      ]);

      if (compRes.data) setCompras(compRes.data);
      if (supRes.data) setSuppliers(supRes.data);
    } catch (error: any) {
      alert('Error cargando datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function getEstadoColor(estado: string) {
    switch (estado) {
      case 'pagada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando compras...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Compras</h1>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm sm:text-base"
        >
          + Nueva Compra
        </button>
      </div>

      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Proveedor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Factura</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {compras.map((compra) => (
                <tr key={compra.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm">
                    {new Date(compra.fecha).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {compra.suppliers?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {compra.numero_factura || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    {formatCLP(compra.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={'px-2 py-1 rounded text-xs font-medium ' + getEstadoColor(compra.estado)}>
                      {compra.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedCompra(compra)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <CompraFormModal
          suppliers={suppliers}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadData();
          }}
        />
      )}

      {selectedCompra && (
        <CompraDetalleModal
          compra={selectedCompra}
          onClose={() => setSelectedCompra(null)}
          onSaved={() => {
            setSelectedCompra(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function CompraFormModal({
  suppliers,
  onClose,
  onSaved,
}: {
  suppliers: Supplier[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [proveedorId, setProveedorId] = useState('');
  const [numeroFactura, setNumeroFactura] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('No estás autenticado');
        return;
      }

      const { data: compra, error } = await supabase
        .from('compras')
        .insert({
          fecha,
          proveedor_id: proveedorId || null,
          numero_factura: numeroFactura.trim() || null,
          metodo_pago: metodoPago || null,
          notas: notas.trim() || null,
          estado: 'pendiente',
          created_by: user.id,
          total: 0,
        })
        .select()
        .single();

      if (error) throw error;

      window.location.href = `/admin/compras/${compra.id}`;
    } catch (error: any) {
      alert('Error creando compra: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Nueva Compra</h2>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Fecha *</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Proveedor</label>
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
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Número de Factura</label>
            <input
              type="text"
              value={numeroFactura}
              onChange={(e) => setNumeroFactura(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Método de Pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
            >
              <option value="">Sin especificar</option>
              <option value="EFECTIVO">EFECTIVO</option>
              <option value="TARJETA">TARJETA</option>
              <option value="TRANSFERENCIA">TRANSFERENCIA</option>
              <option value="CREDITO">CREDITO</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Notas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
              rows={3}
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
            {loading ? 'Creando...' : 'Crear Compra'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompraDetalleModal({
  compra,
  onClose,
  onSaved,
}: {
  compra: Compra;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [items, setItems] = useState<CompraItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [compra.id]);

  async function loadItems() {
    try {
      const { data, error } = await supabase
        .from('compra_items')
        .select('*, ingredientes(nombre, unidad_medida)')
        .eq('compra_id', compra.id);

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      alert('Error cargando items: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Detalle de Compra</h2>
        <div className="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
          <p><strong>Fecha:</strong> {new Date(compra.fecha).toLocaleDateString('es-CL')}</p>
          <p><strong>Proveedor:</strong> {compra.suppliers?.name || '-'}</p>
          <p><strong>Factura:</strong> {compra.numero_factura || '-'}</p>
          <p><strong>Estado:</strong> {compra.estado}</p>
          <p><strong>Total:</strong> {formatCLP(compra.total)}</p>
        </div>

        <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Items:</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2 sm:p-3 border border-slate-200 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base">{item.ingredientes?.nombre}</div>
                <div className="text-xs sm:text-sm text-slate-600">
                  {item.cantidad} {item.ingredientes?.unidad_medida} x {formatCLP(item.precio_unitario)}
                </div>
              </div>
              <div className="font-semibold text-sm sm:text-base flex-shrink-0">{formatCLP(item.subtotal)}</div>
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



