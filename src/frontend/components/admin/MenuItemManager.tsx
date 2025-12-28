import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import { supabase } from '@/lib/supabase';
import type { Category, MenuItem } from '@/shared/types';

interface MenuItemWithCategory extends MenuItem {
  category?: Category | null;
}

export default function MenuItemManager() {
  const [items, setItems] = useState<MenuItemWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItemWithCategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: null as number | null,
    image_url: null as string | null,
    is_available: true,
    is_featured: false,
    order_num: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Obtener token de autenticación
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const [itemsRes, categoriesRes] = await Promise.all([
        fetch('/api/menu-items-v2', { headers }),
        fetch('/api/categories-v2', { headers }),
      ]);
      
      const itemsData = await itemsRes.json();
      const categoriesData = await categoriesRes.json();

      if (itemsData.success) setItems(itemsData.data);
      if (categoriesData.success) setCategories(categoriesData.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNewForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category_id: categories[0]?.id || null,
      image_url: null,
      is_available: true,
      is_featured: false,
      order_num: items.length + 1,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (item: MenuItemWithCategory) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category_id: item.category_id,
      image_url: item.image_url,
      is_available: item.is_available,
      is_featured: item.is_featured,
      order_num: item.order_num,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/menu-items-v2';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem
        ? { ...formData, id: editingItem.id }
        : formData;

      console.log('📤 Enviando datos:', { method, body });

      // Obtener token de autenticación
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        await fetchData();
        closeForm();
        alert(editingItem ? '✅ Item actualizado' : '✅ Item creado');
      } else {
        console.error('Error guardando item:', result);
        alert('❌ Error: ' + (result.error || 'No se pudo guardar'));
      }
    } catch (error) {
      console.error('Error guardando item:', error);
      alert('❌ Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailable = async (item: MenuItemWithCategory) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/menu-items-v2', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          id: item.id,
          is_available: !item.is_available,
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error actualizando item:', error);
    }
  };

  const handleToggleFeatured = async (item: MenuItemWithCategory) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/menu-items-v2', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          id: item.id,
          is_featured: !item.is_featured,
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error actualizando item:', error);
    }
  };

  const handleDelete = async (item: MenuItemWithCategory) => {
    if (!confirm(`¿Estás seguro de eliminar "${item.name}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/menu-items-v2', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ id: item.id }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchData();
        alert('✅ Item eliminado');
      } else {
        alert('❌ Error: ' + (result.error || 'No se pudo eliminar'));
      }
    } catch (error) {
      console.error('Error eliminando item:', error);
      alert('❌ Error de conexión');
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Consultar';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Filtrar items
  const filteredItems = items.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category_id === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-cinzel text-gold-400">Items del Menú</h2>
          <p className="text-gold-300/70 text-xs sm:text-sm mt-1">
            {items.length} items en total
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="w-full sm:w-auto bg-gold-600 hover:bg-gold-500 text-black px-3 sm:px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Item
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 border border-gold-600 rounded-lg px-3 sm:px-4 py-2 text-gold-100 focus:outline-none focus:border-gold-400 text-sm sm:text-base"
          />
        </div>
        <select
          value={filterCategory === 'all' ? 'all' : filterCategory}
          onChange={(e) => setFilterCategory(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          className="w-full sm:w-auto bg-black/50 border border-gold-600 rounded-lg px-3 sm:px-4 py-2 text-gold-100 focus:outline-none focus:border-gold-400 text-sm sm:text-base"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Lista de items */}
      <div className="space-y-2 sm:space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`
              bg-black/30 border rounded-lg p-3 sm:p-4 transition
              ${item.is_available ? 'border-gold-600' : 'border-gray-600 opacity-60'}
            `}
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Imagen */}
              {item.image_url ? (
                <div className="flex-shrink-0 self-center sm:self-start">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gold-600"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Error cargando imagen:', item.image_url);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center self-center sm:self-start">
                  <span className="text-gray-500 text-xs">Sin imagen</span>
                </div>
              )}

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-gold-400 font-bold text-base sm:text-lg">{item.name}</h3>
                  {!item.is_available && (
                    <span className="bg-red-600/30 text-red-400 px-1.5 sm:px-2 py-0.5 rounded text-xs">
                      No disponible
                    </span>
                  )}
                  {item.is_featured && (
                    <span className="bg-gold-600/30 text-gold-400 px-1.5 sm:px-2 py-0.5 rounded text-xs">
                      ⭐ Destacado
                    </span>
                  )}
                </div>
                
                {item.description && (
                  <p className="text-gold-300/70 text-xs sm:text-sm mb-2 line-clamp-2">{item.description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span className="text-gold-300 font-bold text-base sm:text-lg">{formatPrice(item.price)}</span>
                  {item.category && (
                    <span className="text-gold-400/60 bg-gold-600/10 px-1.5 sm:px-2 py-0.5 rounded text-xs">
                      {item.category.name}
                    </span>
                  )}
                  <span className="text-gold-400/40 text-xs">Orden: {item.order_num}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap sm:flex-col gap-2 sm:ml-4">
                <button
                  onClick={() => handleToggleAvailable(item)}
                  className={`
                    flex-1 sm:flex-none px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition
                    ${item.is_available 
                      ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30' 
                      : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                    }
                  `}
                  title={item.is_available ? 'Marcar como no disponible' : 'Marcar como disponible'}
                >
                  {item.is_available ? '✅ Disp.' : '❌ No disp.'}
                </button>

                <button
                  onClick={() => handleToggleFeatured(item)}
                  className={`
                    flex-1 sm:flex-none px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition
                    ${item.is_featured 
                      ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30' 
                      : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                    }
                  `}
                >
                  {item.is_featured ? '⭐ Dest.' : '☆ Destacar'}
                </button>

                <button
                  onClick={() => openEditForm(item)}
                  className="flex-1 sm:flex-none bg-gold-600/20 text-gold-400 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-gold-600/30 transition"
                >
                  ✏️ Editar
                </button>

                <button
                  onClick={() => handleDelete(item)}
                  className="flex-1 sm:flex-none bg-red-600/20 text-red-400 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-red-600/30 transition"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gold-400/60">
            {searchTerm || filterCategory !== 'all' ? (
              <>
                <p className="text-lg mb-2">No se encontraron items</p>
                <p className="text-sm">Intenta con otros filtros</p>
              </>
            ) : (
              <>
                <p className="text-lg mb-2">No hay items en el menú</p>
                <p className="text-sm">Crea tu primer producto</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-black/90 border-2 border-gold-600 rounded-xl p-4 sm:p-6 w-full max-w-lg my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-cinzel text-gold-400 mb-3 sm:mb-4">
              {editingItem ? 'Editar Item' : 'Nuevo Item'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-gold-300 text-sm mb-1">Nombre del producto *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-black/50 border border-gold-600 rounded-lg px-4 py-2 text-gold-100 focus:outline-none focus:border-gold-400"
                  placeholder="Ej: Shawarma Mixto"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-gold-300 text-sm mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-black/50 border border-gold-600 rounded-lg px-4 py-2 text-gold-100 focus:outline-none focus:border-gold-400"
                  placeholder="Descripción del producto..."
                />
              </div>

              {/* Precio y Categoría */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gold-300 text-sm mb-1">Precio (CLP) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="100"
                    className="w-full bg-black/50 border border-gold-600 rounded-lg px-4 py-2 text-gold-100 focus:outline-none focus:border-gold-400"
                  />
                  <p className="text-gold-400/50 text-xs mt-1">0 = Consultar precio</p>
                </div>
                <div>
                  <label className="block text-gold-300 text-sm mb-1">Categoría</label>
                  <select
                    value={formData.category_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value ? parseInt(e.target.value) : null }))}
                    className="w-full bg-black/50 border border-gold-600 rounded-lg px-4 py-2 text-gold-100 focus:outline-none focus:border-gold-400"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Imagen */}
              <ImageUpload
                currentImage={formData.image_url}
                onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
              />

              {/* Orden */}
              <div>
                <label className="block text-gold-300 text-sm mb-1">Orden de aparición</label>
                <input
                  type="number"
                  value={formData.order_num}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_num: parseInt(e.target.value) || 0 }))}
                  min="0"
                  className="w-full bg-black/50 border border-gold-600 rounded-lg px-4 py-2 text-gold-100 focus:outline-none focus:border-gold-400"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                    className="w-5 h-5 rounded border-gold-600 text-gold-600 focus:ring-gold-500"
                  />
                  <span className="text-gold-300">Disponible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-5 h-5 rounded border-gold-600 text-gold-600 focus:ring-gold-500"
                  />
                  <span className="text-gold-300">⭐ Destacado</span>
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gold-600 hover:bg-gold-500 text-black px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

