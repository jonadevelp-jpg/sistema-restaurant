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
  const [uploadingImage, setUploadingImage] = useState(false);
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
    visual_type: null as 'hero' | 'list' | 'drink' | null,
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
      visual_type: null,
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
      visual_type: item.visual_type || null,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir envío si se está subiendo una imagen
    if (uploadingImage) {
      console.warn('⚠️ Esperando a que termine la subida de imagen...');
      alert('⏳ Por favor espera a que termine de subir la imagen antes de guardar.');
      return;
    }
    
    setSaving(true);

    try {
      const url = '/api/menu-items-v2';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem 
        ? { ...formData, id: editingItem.id }
        : formData;
      
      console.log('📤 Enviando datos de item:', {
        method,
        body,
        image_url: formData.image_url,
        hasImage: !!formData.image_url,
        uploadingImage
      });

      console.log('📤 Enviando datos:', { 
        method, 
        body,
        image_url: formData.image_url,
        hasImage: !!formData.image_url,
        imageType: typeof formData.image_url
      });

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

      if (!response.ok) {
        console.error('❌ Error HTTP:', response.status, result);
        if (response.status === 401) {
          alert('❌ No estás autenticado. Por favor, recarga la página e inicia sesión nuevamente.');
          window.location.href = '/admin/login';
          return;
        } else if (response.status === 403) {
          alert(`❌ No tienes permisos: ${result.error || 'Tu usuario no tiene permisos para esta acción'}`);
          return;
        }
      }

      if (result.success) {
        console.log('✅ Item guardado exitosamente:', result.data);
        
        // Forzar recarga completa de datos con un pequeño delay para asegurar que la BD se actualizó
        await new Promise(resolve => setTimeout(resolve, 300));
        await fetchData();
        
        // Si estamos editando y hay una imagen nueva, actualizar el item en el estado local también
        if (editingItem && formData.image_url && result.data) {
          console.log('🖼️ Actualizando imagen en estado local:', {
            oldImage: editingItem.image_url,
            newImage: formData.image_url,
            updatedAt: result.data.updated_at
          });
          
          // Forzar actualización del item específico en el estado
          setItems(prevItems => 
            prevItems.map(item => 
              item.id === editingItem.id 
                ? { ...item, image_url: result.data.image_url, updated_at: result.data.updated_at }
                : item
            )
          );
        }
        
        closeForm();
        
        // Mostrar mensaje
        const message = editingItem 
          ? '✅ Item actualizado correctamente'
          : '✅ Item creado';
        alert(message);
      } else {
        console.error('❌ Error guardando item:', result);
        const errorMsg = result.error || 'No se pudo guardar';
        alert(`❌ Error: ${errorMsg}\n\nSi el problema persiste, verifica:\n1. Que estés autenticado\n2. Que tu usuario tenga rol de admin o encargado\n3. Revisa la consola del navegador (F12) para más detalles`);
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
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert(`❌ Error de permisos: ${result.error || 'No tienes permisos para esta acción'}`);
          return;
        }
      }
      
      if (result.success) {
        await fetchData();
      } else {
        alert(`❌ Error: ${result.error || 'No se pudo actualizar'}`);
      }
    } catch (error: any) {
      console.error('❌ Error actualizando item:', error);
      alert(`❌ Error de conexión: ${error.message || 'Error desconocido'}`);
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
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert(`❌ Error de permisos: ${result.error || 'No tienes permisos para esta acción'}`);
          return;
        }
      }
      
      if (result.success) {
        await fetchData();
      } else {
        alert(`❌ Error: ${result.error || 'No se pudo actualizar'}`);
      }
    } catch (error: any) {
      console.error('❌ Error actualizando item:', error);
      alert(`❌ Error de conexión: ${error.message || 'Error desconocido'}`);
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
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert(`❌ Error de permisos: ${result.error || 'No tienes permisos para eliminar items'}`);
          return;
        }
      }
      
      if (result.success) {
        await fetchData();
        alert('✅ Item eliminado');
      } else {
        alert(`❌ Error: ${result.error || 'No se pudo eliminar'}`);
      }
    } catch (error: any) {
      console.error('❌ Error eliminando item:', error);
      alert(`❌ Error de conexión: ${error.message || 'Error desconocido'}`);
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sans">Items del Menú</h2>
          <p className="text-slate-600 text-sm mt-1 font-sans">
            {items.length} items en total
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold font-sans"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Item
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm font-sans transition-all duration-200"
            style={{
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          />
        </div>
        <select
          value={filterCategory === 'all' ? 'all' : filterCategory}
          onChange={(e) => setFilterCategory(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          className="w-full sm:w-auto bg-white border border-warm-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm font-sans transition-all duration-200"
          style={{
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          }}
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Lista de items */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`
              bg-white rounded-xl p-4 transition-all duration-200
              ${item.is_available ? '' : 'opacity-60'}
            `}
            style={{
              boxShadow: item.is_available 
                ? '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)'
                : '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Imagen */}
              {item.image_url ? (() => {
                // Manejar URLs de Supabase Storage correctamente
                let imageSrc = item.image_url;
                if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
                  try {
                    const url = new URL(imageSrc);
                    url.searchParams.set('v', item.updated_at ? new Date(item.updated_at).getTime().toString() : Date.now().toString());
                    imageSrc = url.toString();
                  } catch {
                    imageSrc = `${item.image_url}${item.image_url.includes('?') ? '&' : '?'}v=${item.updated_at ? new Date(item.updated_at).getTime() : Date.now()}`;
                  }
                } else {
                  imageSrc = `${item.image_url}${item.image_url.includes('?') ? '&' : '?'}v=${item.updated_at ? new Date(item.updated_at).getTime() : Date.now()}`;
                }
                
                return (
                  <div className="flex-shrink-0 self-center sm:self-start">
                    <img
                      key={`img-${item.id}-${item.updated_at || ''}-${Date.now()}`}
                      src={imageSrc}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl"
                      style={{
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
                      }}
                      loading="lazy"
                      onLoad={() => {
                        console.log('✅ Imagen cargada en lista:', item.name, imageSrc);
                      }}
                      onError={(e) => {
                        console.error('❌ Error cargando imagen en lista:', {
                          item: item.name,
                          originalUrl: item.image_url,
                          finalUrl: imageSrc,
                          updatedAt: item.updated_at
                        });
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                );
              })() : (
                <div 
                  className="flex-shrink-0 w-20 h-20 bg-warm-100 rounded-xl flex items-center justify-center self-center sm:self-start"
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <span className="text-slate-400 text-xs font-sans">Sin imagen</span>
                </div>
              )}

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-slate-900 font-bold text-lg font-sans">{item.name}</h3>
                  {!item.is_available && (
                    <span 
                      className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-semibold font-sans"
                      style={{
                        boxShadow: '0 1px 3px rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      No disponible
                    </span>
                  )}
                  {item.is_featured && (
                    <span 
                      className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold font-sans"
                      style={{
                        boxShadow: '0 1px 3px rgba(255, 149, 0, 0.2)',
                      }}
                    >
                      ⭐ Destacado
                    </span>
                  )}
                </div>
                
                {item.description && (
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2 font-sans">{item.description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-slate-900 font-bold text-xl font-sans">{formatPrice(item.price)}</span>
                  {item.category && (
                    <span className="text-slate-600 bg-warm-100 px-3 py-1 rounded-full text-xs font-medium font-sans">
                      {item.category.name}
                    </span>
                  )}
                  <span className="text-slate-500 text-xs font-sans">Orden: {item.order_num}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap sm:flex-col gap-2 sm:ml-4">
                <button
                  onClick={() => handleToggleAvailable(item)}
                  className={`
                    flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-medium font-sans transition-all duration-200
                    ${item.is_available 
                      ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                      : 'bg-warm-100 text-slate-600 hover:bg-warm-200'
                    }
                  `}
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                  title={item.is_available ? 'Marcar como no disponible' : 'Marcar como disponible'}
                >
                  {item.is_available ? '✅ Disp.' : '❌ No disp.'}
                </button>

                <button
                  onClick={() => handleToggleFeatured(item)}
                  className={`
                    flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-medium font-sans transition-all duration-200
                    ${item.is_featured 
                      ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' 
                      : 'bg-warm-100 text-slate-600 hover:bg-warm-200'
                    }
                  `}
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {item.is_featured ? '⭐ Dest.' : '☆ Destacar'}
                </button>

                <button
                  onClick={() => openEditForm(item)}
                  className="flex-1 sm:flex-none bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-medium font-sans hover:bg-slate-800 transition-all duration-200"
                  style={{
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  ✏️ Editar
                </button>

                <button
                  onClick={() => handleDelete(item)}
                  className="flex-1 sm:flex-none bg-red-50 text-red-700 px-4 py-2 rounded-xl text-xs font-medium font-sans hover:bg-red-100 transition-all duration-200"
                  style={{
                    boxShadow: '0 1px 3px rgba(239, 68, 68, 0.2)',
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div 
            className="text-center py-16 bg-white rounded-2xl"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            {searchTerm || filterCategory !== 'all' ? (
              <>
                <p className="text-lg mb-2 text-slate-900 font-sans font-semibold">No se encontraron items</p>
                <p className="text-sm text-slate-600 font-sans">Intenta con otros filtros</p>
              </>
            ) : (
              <>
                <p className="text-lg mb-2 text-slate-900 font-sans font-semibold">No hay items en el menú</p>
                <p className="text-sm text-slate-600 font-sans">Crea tu primer producto</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {isFormOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-lg my-4 max-h-[90vh] overflow-y-auto"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-6 font-sans">
              {editingItem ? 'Editar Item' : 'Nuevo Item'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-slate-700 text-sm mb-2 font-semibold font-sans">Nombre del producto *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm font-sans transition-all duration-200"
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                  placeholder="Ej: Completo Italiano"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-slate-700 text-sm mb-2 font-semibold font-sans">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm font-sans transition-all duration-200 resize-none"
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                  placeholder="Descripción del producto..."
                />
              </div>

              {/* Precio y Categoría */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-sm mb-2 font-semibold font-sans">Precio (CLP) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="100"
                    className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm font-sans transition-all duration-200"
                    style={{
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    }}
                  />
                  <p className="text-slate-500 text-xs mt-1 font-sans">0 = Consultar precio</p>
                </div>
                <div>
                  <label className="block text-slate-700 text-sm mb-2 font-semibold font-sans">Categoría</label>
                  <select
                    value={formData.category_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value ? parseInt(e.target.value) : null }))}
                    className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm font-sans transition-all duration-200"
                    style={{
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    }}
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
                onImageChange={(url) => {
                  console.log('🖼️ ImageUpload callback - URL recibida (item):', url);
                  setFormData(prev => {
                    const newData = { ...prev, image_url: url };
                    console.log('🖼️ Actualizando formData.image_url (item):', {
                      old: prev.image_url,
                      new: url,
                      hasNew: !!url
                    });
                    return newData;
                  });
                }}
                onUploadingChange={(isUploading) => {
                  console.log('📤 Estado de subida de imagen (item):', isUploading);
                  setUploadingImage(isUploading);
                }}
              />

              {/* Orden y Tipo Visual */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-sm mb-2 font-semibold font-sans">Orden de aparición</label>
                  <input
                    type="number"
                    value={formData.order_num}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_num: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm font-sans transition-all duration-200"
                    style={{
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm mb-2 font-semibold font-sans">Tipo de visualización</label>
                  <select
                    value={formData.visual_type || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, visual_type: e.target.value as 'hero' | 'list' | 'drink' | null || null }))}
                    className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-sm font-sans transition-all duration-200"
                    style={{
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <option value="">Usar de categoría</option>
                    <option value="hero">Hero (Cards grandes con imagen)</option>
                    <option value="list">List (Lista simple)</option>
                    <option value="drink">Drink (Grid de bebidas)</option>
                  </select>
                  <p className="text-slate-500 text-xs mt-1 font-sans">
                    {formData.image_url ? '💡 Tienes imagen: usa "Hero" para mostrarla' : '💡 Sin imagen: usa "List" o "Drink"'}
                  </p>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                    className="w-5 h-5 rounded border-warm-300 text-slate-900 focus:ring-slate-400 focus:ring-2"
                  />
                  <span className="text-slate-700 font-medium font-sans">Disponible</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-5 h-5 rounded border-warm-300 text-slate-900 focus:ring-slate-400 focus:ring-2"
                  />
                  <span className="text-slate-700 font-medium font-sans">⭐ Destacado</span>
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 bg-warm-100 hover:bg-warm-200 text-slate-700 px-6 py-3 rounded-xl transition-all duration-200 font-semibold font-sans"
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {uploadingImage ? '⏳ Subiendo imagen...' : saving ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

