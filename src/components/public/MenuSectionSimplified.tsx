/**
 * Componente de sección de menú simplificado
 * Renderiza items según su visual_type (hero/list/drink)
 */

import { useEffect, useState } from 'react';
import type { MenuItem, VisualType } from '@/lib/supabase';
import MenuHeroCard from './MenuHeroCard';
import MenuListItem from './MenuListItem';
import MenuDrinkCard from './MenuDrinkCard';

interface MenuSectionSimplifiedProps {
  categoryId: number;
  categoryName: string;
  categoryVisualType?: VisualType;
}

export default function MenuSectionSimplified({
  categoryId,
  categoryName,
  categoryVisualType,
}: MenuSectionSimplifiedProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 MenuSectionSimplified montado/actualizado:', {
      categoryId,
      categoryName,
      categoryVisualType
    });
    loadItems();
    
    // Recargar items cada 30 segundos para mantener datos actualizados
    const interval = setInterval(() => {
      loadItems();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [categoryId, categoryVisualType]);

  async function loadItems() {
    try {
      setLoading(true);
      const response = await fetch(`/api/menu/items?categoryId=${categoryId}&availableOnly=true`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en respuesta:', response.status, errorText);
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();
      console.log('📦 Resultado de API:', { success: result.success, dataLength: result.data?.length, result });
      
      if (result.success && Array.isArray(result.data)) {
        setItems(result.data);
        console.log(`✅ ${result.data.length} items cargados para categoría ${categoryId}`);
      } else {
        console.warn('⚠️ Respuesta no tiene formato esperado:', result);
        setItems([]);
      }
    } catch (error) {
      console.error('❌ Error cargando items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  // Determinar visual_type efectivo de cada item
  function getEffectiveVisualType(item: MenuItem): VisualType {
    // Si el item tiene visual_type, usarlo
    if (item.visual_type) {
      console.log(`✅ Item "${item.name}" usa su propio visual_type: ${item.visual_type}`);
      return item.visual_type;
    }
    // Si no, usar el de la categoría
    if (categoryVisualType) {
      console.log(`✅ Item "${item.name}" usa visual_type de categoría: ${categoryVisualType}`);
      return categoryVisualType;
    }
    // Default: hero para items con imagen (sin importar la categoría)
    // Esto asegura que items con imagen siempre se muestren como cards grandes
    const defaultType = item.image_url ? 'hero' : 'list';
    console.log(`⚠️ Item "${item.name}" usa visual_type por defecto: ${defaultType} (tiene imagen: ${!!item.image_url})`);
    return defaultType;
  }

  // Agrupar items por visual_type
  const itemsByType = items.reduce(
    (acc, item) => {
      const visualType = getEffectiveVisualType(item);
      if (!acc[visualType]) acc[visualType] = [];
      acc[visualType].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Cargando {categoryName}...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="rounded-2xl p-8 bg-warm-50 max-w-md mx-auto" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
          <p className="text-slate-600 text-lg mb-2">No hay items disponibles en esta categoría</p>
          <p className="text-slate-500 text-sm">Verifica que los items estén activos en la base de datos</p>
        </div>
      </div>
    );
  }

  return (
    <section className="mb-20 sm:mb-24">
      {/* Título eliminado - ya está en el CategoryHero */}

      {/* Items tipo HERO (cards grandes) */}
      {itemsByType['hero'] && itemsByType['hero'].length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 mb-16">
          {itemsByType['hero'].map((item) => (
            <MenuHeroCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Items tipo LIST (lista simple) */}
      {itemsByType['list'] && itemsByType['list'].length > 0 && (
        <div className="space-y-4 mb-16 max-w-4xl mx-auto">
          {itemsByType['list'].map((item) => (
            <MenuListItem key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Items tipo DRINK (grid de bebidas) */}
      {itemsByType['drink'] && itemsByType['drink'].length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
          {itemsByType['drink'].map((item) => (
            <MenuDrinkCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

