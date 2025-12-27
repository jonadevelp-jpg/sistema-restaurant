import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/supabase';
import ImageUpload from './ImageUpload';

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    order_num: 0,
    is_active: true,
    image_url: null as string | null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/categories-v2', { headers });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  };

  const openNewForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      order_num: categories.length + 1,
      is_active: true,
      image_url: null,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      order_num: category.order_num,
      is_active: category.is_active,
      image_url: category.image_url || null,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      order_num: 0,
      is_active: true,
      image_url: null,
    });
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
      const url = '/api/categories-v2';
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory 
        ? { ...formData, id: editingCategory.id }
        : formData;

      console.log('📤 Enviando datos de categoría:', { 
        method, 
        body,
        image_url: formData.image_url,
        hasImage: !!formData.image_url,
        imageType: typeof formData.image_url,
        uploadingImage
      });

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
      
      console.log('📥 Respuesta del servidor:', {
        success: result.success,
        data: result.data,
        error: result.error,
        hasImage: !!result.data?.image_url
      });

      if (result.success) {
        console.log('✅ Categoría guardada exitosamente:', result.data);
        
        // Forzar recarga completa de datos
        await fetchCategories();
        
        // Si estamos editando y hay una imagen nueva, actualizar la categoría en el estado local también
        if (editingCategory && formData.image_url && result.data) {
          console.log('🖼️ Actualizando imagen de categoría en estado local:', {
            oldImage: editingCategory.image_url,
            newImage: formData.image_url
          });
          
          // Forzar actualización de la categoría específica en el estado
          setCategories(prevCategories => 
            prevCategories.map(cat => 
              cat.id === editingCategory.id 
                ? { ...cat, image_url: result.data.image_url }
                : cat
            )
          );
        }
        
        closeForm();
        alert(editingCategory ? '✅ Categoría actualizada' : '✅ Categoría creada');
      } else {
        alert('❌ Error: ' + (result.error || 'No se pudo guardar'));
      }
    } catch (error) {
      console.error('Error guardando categoría:', error);
      alert('❌ Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/categories-v2', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          id: category.id,
          is_active: !category.is_active,
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error actualizando categoría:', error);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?\n\nLos items de esta categoría quedarán sin categoría.`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/categories-v2', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ id: category.id }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchCategories();
        alert('✅ Categoría eliminada');
      } else {
        alert('❌ Error: ' + (result.error || 'No se pudo eliminar'));
      }
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      alert('❌ Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-warm-200 border-t-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sans">Categorías del Menú</h2>
          <p className="text-slate-600 text-sm mt-1 font-sans">
            Administra las secciones de tu menú
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
          Nueva Categoría
        </button>
      </div>

      {/* Lista de categorías */}
      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`
              bg-white rounded-xl p-4 transition-all duration-200
              ${category.is_active ? '' : 'opacity-60'}
            `}
            style={{
              boxShadow: category.is_active 
                ? '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)'
                : '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Imagen de categoría */}
                {category.image_url ? (() => {
                  // Manejar URLs de Supabase Storage correctamente
                  let imageSrc = category.image_url;
                  
                  console.log('🖼️ Renderizando imagen de categoría:', {
                    categoryId: category.id,
                    categoryName: category.name,
                    originalUrl: category.image_url,
                    startsWithHttp: imageSrc.startsWith('http://') || imageSrc.startsWith('https://')
                  });
                  
                  if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
                    try {
                      const url = new URL(imageSrc);
                      // Agregar cache busting
                      url.searchParams.set('v', Date.now().toString());
                      imageSrc = url.toString();
                    } catch (e) {
                      console.warn('⚠️ Error parseando URL, agregando cache busting simple:', e);
                      imageSrc = `${category.image_url}?v=${Date.now()}`;
                    }
                  } else {
                    imageSrc = `${category.image_url}?v=${Date.now()}`;
                  }
                  
                  const imageKey = `cat-img-${category.id}-${category.image_url}-${Date.now()}`;
                  
                  return (
                    <div className="flex-shrink-0">
                      <img
                        key={imageKey}
                        src={imageSrc}
                        alt={category.name}
                        className="w-20 h-20 object-cover rounded-xl"
                        style={{
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
                        }}
                        loading="lazy"
                        onLoad={() => {
                          console.log('✅ Imagen de categoría cargada exitosamente:', {
                            category: category.name,
                            url: imageSrc
                          });
                        }}
                        onError={(e) => {
                          console.error('❌ Error cargando imagen de categoría:', {
                            category: category.name,
                            categoryId: category.id,
                            originalUrl: category.image_url,
                            finalUrl: imageSrc,
                            error: e
                          });
                          // No ocultar la imagen, solo mostrar un placeholder
                          const img = e.currentTarget as HTMLImageElement;
                          img.src = '/images/ui/placeholders/product-hero.svg';
                          img.style.opacity = '0.5';
                        }}
                      />
                    </div>
                  );
                })() : (
                  <div 
                    className="flex-shrink-0 w-20 h-20 bg-warm-100 rounded-xl flex items-center justify-center"
                    style={{
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <span className="text-slate-400 text-xs font-sans">Sin imagen</span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-slate-500 text-xs font-mono font-sans">#{category.order_num}</span>
                    <h3 className="text-slate-900 font-bold text-lg font-sans">{category.name}</h3>
                    {!category.is_active && (
                      <span 
                        className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold font-sans"
                        style={{
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        Oculta
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-slate-600 text-sm mt-2 font-sans">{category.description}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-1 font-mono font-sans">/{category.slug}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Toggle visible/oculta */}
                <button
                  onClick={() => handleToggleActive(category)}
                  className={`
                    flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-medium font-sans transition-all duration-200
                    ${category.is_active 
                      ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                      : 'bg-warm-100 text-slate-600 hover:bg-warm-200'
                    }
                  `}
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                  title={category.is_active ? 'Ocultar categoría' : 'Mostrar categoría'}
                >
                  {category.is_active ? '👁️ Visible' : '👁️‍🗨️ Oculta'}
                </button>

                {/* Editar */}
                <button
                  onClick={() => openEditForm(category)}
                  className="flex-1 sm:flex-none bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-medium font-sans hover:bg-slate-800 transition-all duration-200"
                  style={{
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  ✏️ Editar
                </button>

                {/* Eliminar */}
                <button
                  onClick={() => handleDelete(category)}
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

        {categories.length === 0 && (
          <div 
            className="text-center py-16 bg-white rounded-2xl"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <p className="text-lg mb-2 text-slate-900 font-sans font-semibold">No hay categorías</p>
            <p className="text-sm text-slate-600 font-sans">Crea tu primera categoría para organizar el menú</p>
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
            className="bg-white rounded-2xl p-6 w-full max-w-md my-4 max-h-[90vh] overflow-y-auto"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-6 font-sans">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-slate-700 text-sm mb-2 font-semibold font-sans">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 font-sans transition-all duration-200"
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                  placeholder="Ej: Entradas, Platos Fuertes..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-slate-700 text-sm mb-2 font-semibold font-sans">Slug (URL)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 font-mono text-sm font-sans transition-all duration-200"
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                  placeholder="entradas"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-slate-700 text-sm mb-2 font-semibold font-sans">Descripción (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 font-sans transition-all duration-200 resize-none"
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                  placeholder="Breve descripción de la categoría..."
                />
              </div>

              {/* Imagen */}
              <ImageUpload
                currentImage={formData.image_url}
                onImageChange={(url) => {
                  console.log('🖼️ ImageUpload callback - URL recibida:', url);
                  setFormData(prev => {
                    const newData = { ...prev, image_url: url };
                    console.log('🖼️ Actualizando formData.image_url:', {
                      old: prev.image_url,
                      new: url,
                      hasNew: !!url
                    });
                    return newData;
                  });
                }}
                onUploadingChange={(isUploading) => {
                  console.log('📤 Estado de subida de imagen:', isUploading);
                  setUploadingImage(isUploading);
                }}
              />

              {/* Orden */}
              <div>
                <label className="block text-slate-700 text-sm mb-2 font-semibold font-sans">Orden</label>
                <input
                  type="number"
                  value={formData.order_num}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_num: parseInt(e.target.value) || 0 }))}
                  min="0"
                  className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 font-sans transition-all duration-200"
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                />
              </div>

              {/* Activa */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-5 h-5 rounded border-warm-300 text-slate-900 focus:ring-slate-400 focus:ring-2"
                />
                <label htmlFor="is_active" className="text-slate-700 font-medium font-sans">
                  Categoría visible en el menú
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
                  {uploadingImage ? '⏳ Subiendo imagen...' : saving ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

