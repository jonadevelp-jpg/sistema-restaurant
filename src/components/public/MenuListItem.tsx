/**
 * Componente premium para renderizar items con visual_type "list"
 * Diseño minimalista sin bordes, con hover sutil
 */

import { useState } from 'react';
import type { MenuItem } from '@/lib/supabase';
import ProductDetailModal from './ProductDetailModal';

interface MenuListItemProps {
  item: MenuItem;
  onClick?: () => void;
}

export default function MenuListItem({ item, onClick }: MenuListItemProps) {
  const [showDetail, setShowDetail] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowDetail(true);
    }
  };
  const formatPrice = (price: number) => {
    if (price === 0) return 'Consultar';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`
          group flex items-center justify-between px-6 py-5 rounded-2xl
          bg-warm-50 hover:shadow-lg transition-all duration-300 ease-out
          active:scale-[0.99] cursor-pointer
          ${!item.is_available ? 'opacity-50' : ''}
        `}
        style={{
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.08)',
        }}
      >
      <div className="flex-1 min-w-0 mr-6">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-semibold text-base sm:text-lg text-slate-900 truncate font-sans">
            {item.name}
          </h3>
          {item.is_featured && (
            <span className="text-amber-500 text-sm flex-shrink-0" title="Destacado">
              ⭐
            </span>
          )}
          {!item.is_available && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium flex-shrink-0 font-sans">
              No disponible
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-slate-500 line-clamp-1 leading-relaxed font-sans">
            {item.description}
          </p>
        )}
      </div>
      
      <div className="flex-shrink-0 text-right">
        <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sans">
          {formatPrice(item.price)}
        </span>
      </div>
      </div>

      {/* Modal de detalle */}
      <ProductDetailModal
        item={item}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  );
}

