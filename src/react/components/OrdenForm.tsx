import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCLP } from '@/lib/currency';
import ComandaCocina from './ComandaCocina';
import BoletaCliente from './BoletaCliente';
import ItemPersonalizationModal from './ItemPersonalizationModal';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  category_id?: number;
}

interface OrdenItem {
  id?: string;
  menu_item_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas?: string;
  menu_item?: MenuItem;
}

interface Orden {
  id: string;
  numero_orden: string;
  mesa_id: string;
  estado: string;
  total: number;
  nota?: string;
}

interface OrdenFormProps {
  ordenId: string;
}

export default function OrdenForm({ ordenId }: OrdenFormProps) {
  const [orden, setOrden] = useState<Orden | null>(null);
  const [items, setItems] = useState<OrdenItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [showComanda, setShowComanda] = useState(false);
  const [showBoleta, setShowBoleta] = useState(false);
  const [mesaInfo, setMesaInfo] = useState<{ numero: number } | null>(null);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedItemToEdit, setSelectedItemToEdit] = useState<OrdenItem | null>(null);

  useEffect(() => {
    if (ordenId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [ordenId]);

  async function loadData() {
    if (!ordenId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Cargar orden con información de mesa
      const { data: ordenData, error: ordenError } = await supabase
        .from('ordenes_restaurante')
        .select('*, mesas(numero)')
        .eq('id', ordenId)
        .single();

      if (ordenError) {
        console.error('Error cargando orden:', ordenError);
        setLoading(false);
        return;
      }

      if (!ordenData) {
        setLoading(false);
        return;
      }

      setOrden(ordenData);
      if (ordenData.mesas) {
        setMesaInfo(ordenData.mesas);
      }

      // Cargar items de la orden
      const { data: itemsData, error: itemsError } = await supabase
        .from('orden_items')
        .select('*, menu_items(*)')
        .eq('orden_id', ordenId)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;
      setItems(
        itemsData?.map((item: any) => ({
          id: item.id,
          menu_item_id: item.menu_item_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal,
          notas: item.notas,
          menu_item: item.menu_items,
        })) || []
      );

      // Cargar categorías
      const { data: catsData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (catsData) setCategories(catsData);

      // Cargar items del menú con categorías
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('name');

      if (menuData) setMenuItems(menuData);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      alert('Error cargando orden: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }

  function handleItemClick(menuItem: MenuItem) {
    // Verificar si necesita personalización
    const category = categories.find(c => c.id === menuItem.category_id);
    const categorySlug = category?.slug?.toLowerCase() || '';
    const needsPersonalization = 
      categorySlug === 'menu-del-dia' || 
      categorySlug === 'shawarmas' || 
      categorySlug === 'shawarma' ||
      categorySlug === 'promociones' ||
      categorySlug === 'promocion' ||
      categorySlug === 'bebestibles' ||
      categorySlug === 'bebidas';

    if (needsPersonalization) {
      setSelectedMenuItem(menuItem);
      setShowPersonalizationModal(true);
    } else {
      // Agregar directamente sin personalización
      addItemWithPersonalization(menuItem, null);
    }
  }

  async function addItemWithPersonalization(menuItem: MenuItem, personalization: any) {
    try {
      const existingItem = items.find((i) => i.menu_item_id === menuItem.id);

      // Convertir personalización a JSON string para guardar en notas
      const notasJson = personalization ? JSON.stringify(personalization) : null;

      if (existingItem) {
        // Actualizar cantidad y notas
        const newCantidad = existingItem.cantidad + 1;
        const newSubtotal = newCantidad * existingItem.precio_unitario;

        const { error } = await supabase
          .from('orden_items')
          .update({
            cantidad: newCantidad,
            subtotal: newSubtotal,
            notas: notasJson || existingItem.notas, // Mantener notas existentes si no hay nuevas
          })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Crear nuevo item
        const { data, error } = await supabase
          .from('orden_items')
          .insert({
            orden_id: ordenId,
            menu_item_id: menuItem.id,
            cantidad: 1,
            precio_unitario: menuItem.price,
            subtotal: menuItem.price,
            notas: notasJson,
          })
          .select()
          .single();

        if (error) throw error;
      }

      await loadData();
    } catch (error: any) {
      alert('Error agregando item: ' + error.message);
    }
  }

  async function updateItemPersonalization(itemId: string, personalization: any) {
    try {
      const notasJson = personalization ? JSON.stringify(personalization) : null;
      const { error } = await supabase
        .from('orden_items')
        .update({ notas: notasJson })
        .eq('id', itemId);

      if (error) throw error;
      await loadData();
    } catch (error: any) {
      alert('Error actualizando personalización: ' + error.message);
    }
  }

  function parsePersonalization(notas?: string): any {
    if (!notas) return null;
    try {
      return JSON.parse(notas);
    } catch {
      // Si no es JSON, retornar como texto simple
      return { detalles: notas };
    }
  }

  function formatPersonalizationText(personalization: any): string {
    if (!personalization) return '';
    const parts: string[] = [];
    if (personalization.agregado) parts.push(`Agregado: ${personalization.agregado}`);
    if (personalization.salsas && personalization.salsas.length > 0) {
      parts.push(`Salsa${personalization.salsas.length > 1 ? 's' : ''}: ${personalization.salsas.join(', ')}`);
    }
    if (personalization.sinIngredientes && personalization.sinIngredientes.length > 0) {
      parts.push(`Sin: ${personalization.sinIngredientes.join(', ')}`);
    }
    if (personalization.bebidas && personalization.bebidas.length > 0) {
      const bebidasText = personalization.bebidas.map((b: any) => {
        if (b.sabor) return `${b.nombre} (${b.sabor})`;
        return b.nombre;
      }).join(', ');
      parts.push(`Bebida${personalization.bebidas.length > 1 ? 's' : ''}: ${bebidasText}`);
    }
    if (personalization.detalles) parts.push(personalization.detalles);
    return parts.join(' | ');
  }

  async function updateItemCantidad(itemId: string, cantidad: number) {
    if (cantidad <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const newSubtotal = cantidad * item.precio_unitario;

      const { error } = await supabase
        .from('orden_items')
        .update({
          cantidad,
          subtotal: newSubtotal,
        })
        .eq('id', itemId);

      if (error) throw error;
      await loadData();
    } catch (error: any) {
      alert('Error actualizando item: ' + error.message);
    }
  }

  async function removeItem(itemId: string) {
    try {
      const { error } = await supabase
        .from('orden_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await loadData();
    } catch (error: any) {
      alert('Error eliminando item: ' + error.message);
    }
  }

  async function updateEstado(nuevoEstado: string) {
    // Validar que la orden tenga items antes de cambiar el estado
    if (items.length === 0) {
      alert('No se puede cambiar el estado de una orden vacía. Agrega items a la orden primero.');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('ordenes_restaurante')
        .update({ estado: nuevoEstado })
        .eq('id', ordenId);

      if (error) throw error;
      await loadData();
    } catch (error: any) {
      alert('Error actualizando estado: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function pagarOrden() {
    // Validar que la orden tenga items antes de pagar
    if (items.length === 0) {
      alert('No se puede pagar una orden vacía. Agrega items a la orden primero.');
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('No estás autenticado');
        return;
      }

      setShowPagoModal(true);
      return;
    } catch (error: any) {
      alert('Error pagando orden: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmarPago(metodoPago: string, conPropina: boolean) {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('No estás autenticado');
        return;
      }

      if (!metodoPago) {
        alert('Por favor selecciona un método de pago');
        return;
      }

      // Calcular total con o sin propina
      const propina = conPropina ? orden.total * 0.1 : 0;
      const totalFinal = orden.total + propina;

      // Mapear método de pago a valores permitidos en la BD
      // La BD solo permite: 'EFECTIVO', 'TARJETA', 'TRANSFERENCIA'
      let metodoPagoBD = metodoPago.toUpperCase();
      if (metodoPagoBD === 'DÉBITO' || metodoPagoBD === 'DEBITO' || metodoPagoBD === 'CRÉDITO' || metodoPagoBD === 'CREDITO') {
        metodoPagoBD = 'TARJETA';
      }

      const { error } = await supabase
        .from('ordenes_restaurante')
        .update({
          estado: 'paid',
          metodo_pago: metodoPagoBD,
          paid_at: new Date().toISOString(),
          total: totalFinal,
        })
        .eq('id', ordenId);

      if (error) throw error;

      // Liberar mesa
      if (orden?.mesa_id) {
        await supabase
          .from('mesas')
          .update({ estado: 'libre' })
          .eq('id', orden.mesa_id);
      }

      setShowPagoModal(false);
      // Mostrar boleta antes de redirigir
      setShowBoleta(true);
    } catch (error: any) {
      alert('Error pagando orden: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function cancelarOrden() {
    if (!confirm('¿Estás seguro de cancelar esta orden? Esto liberará la mesa.')) {
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('ordenes_restaurante')
        .update({ estado: 'cancelled' })
        .eq('id', ordenId);

      if (error) throw error;

      // Liberar mesa
      if (orden?.mesa_id) {
        await supabase
          .from('mesas')
          .update({ estado: 'libre' })
          .eq('id', orden.mesa_id);
      }

      // Redirigir a mesas
      window.location.href = '/admin/mesas';
    } catch (error: any) {
      alert('Error cancelando orden: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredMenuItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => {
          const category = categories.find((c) => c.slug === selectedCategory);
          return category && item.category_id === category.id;
        });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando orden...</div>
      </div>
    );
  }

  if (!ordenId) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error: No se proporcionó un ID de orden</div>
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="p-6">
        <div className="text-red-600">Orden no encontrada</div>
        <a href="/admin/mesas" className="text-blue-600 hover:underline mt-2 inline-block">
          Volver a Mesas
        </a>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Orden: {orden.numero_orden}
          </h1>
          <p className="text-slate-600 mt-1">
            Estado: <span className="font-semibold capitalize">{orden.estado}</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              updateEstado('preparing');
              // Imprimir comanda cuando se marca como "en preparación"
              if (items.length > 0) {
                setShowComanda(true);
              }
            }}
            disabled={orden.estado !== 'pending' || saving || items.length === 0}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            title={items.length === 0 ? 'Agrega items a la orden primero' : ''}
          >
            En Preparación
          </button>
          <button
            onClick={() => updateEstado('ready')}
            disabled={orden.estado !== 'preparing' || saving || items.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            title={items.length === 0 ? 'Agrega items a la orden primero' : ''}
          >
            Lista
          </button>
          <button
            onClick={() => setShowComanda(true)}
            disabled={items.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            title={items.length === 0 ? 'Agrega items a la orden primero' : ''}
          >
            🖨️ Comanda Cocina
          </button>
          <button
            onClick={() => setShowBoleta(true)}
            disabled={items.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            title={items.length === 0 ? 'Agrega items a la orden primero' : ''}
          >
            🧾 Boleta Cliente
          </button>
          <button
            onClick={pagarOrden}
            disabled={orden.estado === 'paid' || saving || items.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            title={items.length === 0 ? 'Agrega items a la orden primero' : ''}
          >
            Pagar
          </button>
          {(items.length === 0 && orden.estado === 'pending') && (
            <button
              onClick={cancelarOrden}
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              title="Cancelar orden vacía y liberar mesa"
            >
              Cancelar Orden
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Menú de items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Agregar Items</h2>

            {/* Filtro de categorías */}
            <div className="mb-3 sm:mb-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg text-sm sm:text-base"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid de items */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-96 overflow-y-auto">
              {filteredMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="p-2 sm:p-3 border border-slate-200 rounded-lg hover:border-slate-400 hover:bg-slate-50 text-left"
                >
                  <div className="font-semibold text-xs sm:text-sm line-clamp-2">{item.name}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {formatCLP(item.price)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen de orden */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 lg:sticky lg:top-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Resumen de Orden</h2>

            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 max-h-64 overflow-y-auto">
              {items.length === 0 ? (
                <p className="text-slate-500 text-sm">No hay items en la orden</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start p-2 border-b border-slate-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm truncate">
                        {item.menu_item?.name || 'Item'}
                      </div>
                      {item.notas && (() => {
                        const personalization = parsePersonalization(item.notas);
                        const personalizationText = formatPersonalizationText(personalization);
                        return personalizationText ? (
                          <div className="text-xs text-blue-600 mt-1 italic">
                            {personalizationText}
                          </div>
                        ) : null;
                      })()}
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                        <button
                          onClick={() =>
                            updateItemCantidad(item.id!, item.cantidad - 1)
                          }
                          className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-100 text-xs sm:text-sm"
                        >
                          -
                        </button>
                        <span className="text-xs sm:text-sm w-6 sm:w-8 text-center">{item.cantidad}</span>
                        <button
                          onClick={() =>
                            updateItemCantidad(item.id!, item.cantidad + 1)
                          }
                          className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-100 text-xs sm:text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItemToEdit(item);
                            setShowEditItemModal(true);
                          }}
                          className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800 text-xs"
                          title="Editar personalización"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => removeItem(item.id!)}
                          className="ml-1 sm:ml-2 text-red-600 hover:text-red-800 text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-semibold text-xs sm:text-sm">
                        {formatCLP(item.subtotal)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-300 pt-3 sm:pt-4">
              <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                <span>Total:</span>
                <span>{formatCLP(orden.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Comanda Cocina */}
      {showComanda && orden && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <ComandaCocina
              orden={{ ...orden, mesas: mesaInfo || undefined }}
              items={items}
              onClose={() => setShowComanda(false)}
            />
          </div>
        </div>
      )}

      {/* Modal de Boleta Cliente */}
      {showBoleta && orden && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <BoletaCliente
              orden={{ ...orden, mesas: mesaInfo || undefined }}
              items={items}
              onClose={() => {
                setShowBoleta(false);
                // Si la orden está pagada, redirigir después de imprimir boleta
                if (orden.estado === 'paid') {
                  setTimeout(() => {
                    window.location.href = '/admin/mesas';
                  }, 1000);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Modal de Personalización */}
      {showPersonalizationModal && selectedMenuItem && (
        <ItemPersonalizationModal
          menuItem={selectedMenuItem}
          category={categories.find(c => c.id === selectedMenuItem.category_id) || null}
          onConfirm={(personalization) => {
            addItemWithPersonalization(selectedMenuItem, personalization);
            setShowPersonalizationModal(false);
            setSelectedMenuItem(null);
          }}
          onCancel={() => {
            setShowPersonalizationModal(false);
            setSelectedMenuItem(null);
          }}
        />
      )}

      {/* Modal de Editar Item */}
      {showEditItemModal && selectedItemToEdit && (
        <ItemPersonalizationModal
          menuItem={selectedItemToEdit.menu_item!}
          category={categories.find(c => c.id === selectedItemToEdit.menu_item?.category_id) || null}
          initialPersonalization={(() => {
            try {
              return selectedItemToEdit.notas ? JSON.parse(selectedItemToEdit.notas) : null;
            } catch {
              return null;
            }
          })()}
          onConfirm={(personalization) => {
            updateItemPersonalization(selectedItemToEdit.id!, personalization);
            setShowEditItemModal(false);
            setSelectedItemToEdit(null);
          }}
          onCancel={() => {
            setShowEditItemModal(false);
            setSelectedItemToEdit(null);
          }}
        />
      )}

      {/* Modal de Pago */}
      {showPagoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Pagar Orden</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Método de Pago:</label>
              <select
                id="metodoPago"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                defaultValue=""
              >
                <option value="">Selecciona método de pago</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta (Débito/Crédito)</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>

            <div className="mb-4">
              <div className="text-sm font-semibold mb-2">Total: {formatCLP(orden.total)}</div>
              <div className="text-xs text-gray-600 mb-2">Propina sugerida (10%): {formatCLP(orden.total * 0.1)}</div>
              <div className="text-sm font-semibold">Total con propina: {formatCLP(orden.total * 1.1)}</div>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="conPropina"
                  defaultChecked={true}
                  className="w-4 h-4"
                />
                <span className="text-sm">Incluir propina del 10%</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPagoModal(false);
                  setSaving(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const metodoPago = (document.getElementById('metodoPago') as HTMLSelectElement).value;
                  const conPropina = (document.getElementById('conPropina') as HTMLInputElement).checked;
                  confirmarPago(metodoPago, conPropina);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

