import { useState, useEffect, useMemo, useRef } from 'react';
import MenuItemCard from './MenuItemCard';

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id?: number;
  image_url?: string;
  video_url?: string;
  is_available: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface MenuSectionProps {
  category: Category | string;
}

export default function MenuSection({ category: categoryProp }: MenuSectionProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const fetchInProgress = useRef(false);
  const mountedRef = useRef(true);
  const componentId = useRef(`menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (typeof categoryProp === 'string') {
      try {
        const parsed = JSON.parse(categoryProp);
        setCategory(parsed);
      } catch {
        setCategory(null);
      }
    } else {
      setCategory(categoryProp);
    }
  }, [categoryProp]);

  useEffect(() => {
    if (!category || fetchInProgress.current) return;

    const fetchItems = async () => {
      if (!mountedRef.current || fetchInProgress.current) return;
      
      fetchInProgress.current = true;
      setLoading(true);

      try {
        const response = await fetch(`/api/menu/items?categoryId=${category.id}&availableOnly=true`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setItems(data.data);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        if (mountedRef.current) {
          setItems([]);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          fetchInProgress.current = false;
        }
      }
    };

    fetchItems();

    return () => {
      mountedRef.current = false;
    };
  }, [category]);

  const uniqueItems = useMemo(() => {
    const seen = new Set<number>();
    const result: MenuItem[] = [];
    for (const item of items) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        result.push(item);
      }
    }
    return result;
  }, [items]);

  if (!category) {
    return null;
  }

  if (loading) {
    return (
      <section id={category.slug} className="mb-16 scroll-mt-20">
        <div className="text-center py-12">
          <div className="text-gold-400 text-xl">Cargando...</div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id={category.slug} 
      className="mb-16 scroll-mt-20"
      data-component-id={componentId.current}
    >
      <div className="text-center mb-8">
        <h2 className="text-4xl font-cinzel text-gold-400 mb-4 relative inline-block px-8 py-4 bg-black/80 backdrop-blur-md rounded-lg border-2 border-gold-600" style={{textShadow: '0 0 10px rgba(212, 175, 55, 0.6), 2px 2px 4px rgba(0, 0, 0, 0.8)'}}>
          <span className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 text-2xl text-gold-400 opacity-90">✦</span>
          {category.name.toUpperCase()}
          <span className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 text-2xl text-gold-400 opacity-90">✦</span>
        </h2>
        <div className="w-48 h-1 bg-gradient-to-r from-transparent via-gold-600 to-transparent mx-auto mt-2"></div>
      </div>

      {uniqueItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gold-300 mb-2">No hay items disponibles en esta categoría</p>
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-items-count={uniqueItems.length}
        >
          {uniqueItems.map((item) => {
            const itemKey = `item-${item.id}-${componentId.current}`;
            return (
              <MenuItemCard 
                key={itemKey} 
                item={item} 
              />
            );
          })}
        </div>
      )}
    </section>
  );
}


