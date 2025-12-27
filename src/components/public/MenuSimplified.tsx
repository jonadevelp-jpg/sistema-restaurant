/**
 * Componente principal del menú simplificado
 * Muestra todas las categorías con sus items según visual_type
 */

import { useEffect, useState } from 'react';
import type { Category } from '@/lib/supabase';
import MenuSectionSimplified from './MenuSectionSimplified';

export default function MenuSimplified() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const response = await fetch('/api/categories-v2?onlyActive=true');
      if (!response.ok) throw new Error('Failed to fetch');

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 text-lg">Cargando menú...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 text-lg">No hay categorías disponibles</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {categories.map((category) => (
        <MenuSectionSimplified
          key={category.id}
          categoryId={category.id}
          categoryName={category.name}
          categoryVisualType={category.visual_type}
        />
      ))}
    </div>
  );
}

