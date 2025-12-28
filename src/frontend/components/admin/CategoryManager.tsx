import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/shared/types';

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    order_num: 0,
    is_active: true,
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
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/categories-v2';
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory 
        ? { ...formData, id: editingCategory.id }
        : formData;

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
        await fetchCategories();
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-cinzel text-gold-400">Categorías del Menú</h2>
          <p className="text-gold-300/70 text-xs sm:text-sm mt-1">
            Administra las secciones de tu menú
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="w-full sm:w-auto bg-gold-600 hover:bg-gold-500 text-black px-3 sm:px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Categoría
        </button>
      </div>

      {/* Lista de categorías */}
      <div className="space-y-2 sm:space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`
              bg-black/30 border rounded-lg p-3 sm:p-4 transition
              ${category.is_active ? 'border-gold-600' : 'border-gray-600 opacity-60'}
            `}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-gold-400/60 text-xs sm:text-sm font-mono">#{category.order_num}</span>
                  <h3 className="text-gold-400 font-bold text-base sm:text-lg">{category.name}</h3>
                  {!category.is_active && (
                    <span className="bg-gray-600 text-gray-300 px-1.5 sm:px-2 py-0.5 rounded text-xs">
                      Oculta
                    </span>
                  )}
                </div>
                {category.description && (
                  <p className="text-gold-300/70 text-xs sm:text-sm mt-1">{category.description}</p>
                )}
                <p className="text-gold-400/50 text-xs mt-1 font-mono">/{category.slug}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Toggle visible/oculta */}
                <button
                  onClick={() => handleToggleActive(category)}
                  className={`
                    flex-1 sm:flex-none px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition
                    ${category.is_active 
                      ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30' 
                      : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                    }
                  `}
                  title={category.is_active ? 'Ocultar categoría' : 'Mostrar categoría'}
                >
                  {category.is_active ? '👁️ Visible' : '👁️‍🗨️ Oculta'}
                </button>

                {/* Editar */}
                <button
                  onClick={() => openEditForm(category)}
                  className="flex-1 sm:flex-none bg-gold-600/20 text-gold-400 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-gold-600/30 transition"
                >
                  ✏️ Editar
                </button>

                {/* Eliminar */}
                <button
                  onClick={() => handleDelete(category)}
                  className="flex-1 sm:flex-none bg-red-600/20 text-red-400 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-red-600/30 transition"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12 text-gold-400/60">
            <p className="text-lg mb-2">No hay categorías</p>
            <p className="text-sm">Crea tu primera categoría para organizar el menú</p>
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-black/90 border-2 border-gold-600 rounded-xl p-4 sm:p-6 w-full max-w-md my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-cinzel text-gold-400 mb-3 sm:mb-4">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-gold-300 text-sm mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-gold-600 rounded-lg px-4 py-2 text-gold-100 focus:outline-none focus:border-gold-400"
                  placeholder="Ej: Entradas, Platos Fuertes..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-gold-300 text-sm mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full bg-black/50 border border-gold-600 rounded-lg px-4 py-2 text-gold-100 focus:outline-none focus:border-gold-400 font-mono text-sm"
                  placeholder="entradas"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-gold-300 text-sm mb-1">Descripción (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-black/50 border border-gold-600 rounded-lg px-4 py-2 text-gold-100 focus:outline-none focus:border-gold-400"
                  placeholder="Breve descripción de la categoría..."
                />
              </div>

              {/* Orden */}
              <div>
                <label className="block text-gold-300 text-sm mb-1">Orden</label>
                <input
                  type="number"
                  value={formData.order_num}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_num: parseInt(e.target.value) || 0 }))}
                  min="0"
                  className="w-full bg-black/50 border border-gold-600 rounded-lg px-4 py-2 text-gold-100 focus:outline-none focus:border-gold-400"
                />
              </div>

              {/* Activa */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-5 h-5 rounded border-gold-600 text-gold-600 focus:ring-gold-500"
                />
                <label htmlFor="is_active" className="text-gold-300">
                  Categoría visible en el menú
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
                  {saving ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

