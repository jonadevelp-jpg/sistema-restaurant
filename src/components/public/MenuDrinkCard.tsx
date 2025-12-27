/**
 * Componente premium para renderizar items con visual_type "drink"
 * Grid elegante para bebidas con diseño minimalista
 */

import { useState, useEffect } from 'react';
import type { MenuItem } from '@/lib/supabase';
import { mapImagePath, getPlaceholderImage } from '@/utils/image-mapper';
import ProductDetailModal from './ProductDetailModal';

interface MenuDrinkCardProps {
  item: MenuItem;
  onClick?: () => void;
}

export default function MenuDrinkCard({ item, onClick }: MenuDrinkCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [imageKey, setImageKey] = useState(0); // Para forzar recarga de imagen
  
  // Mapear y agregar cache busting a la URL de la imagen
  const getImageUrl = () => {
    if (!item.image_url) return null;
    
    const mappedUrl = mapImagePath(item.image_url);
    
    // Si es una URL de Supabase Storage (https://), agregar cache busting correctamente
    if (mappedUrl.startsWith('http://') || mappedUrl.startsWith('https://')) {
      try {
        const url = new URL(mappedUrl);
        url.searchParams.set('v', item.updated_at ? new Date(item.updated_at).getTime().toString() : Date.now().toString());
        return url.toString();
      } catch {
        // Si falla el parsing, agregar query param manualmente
        return `${mappedUrl}${mappedUrl.includes('?') ? '&' : '?'}v=${item.updated_at ? new Date(item.updated_at).getTime() : Date.now()}`;
      }
    }
    
    // Si es una ruta relativa, agregar cache busting
    return `${mappedUrl}${mappedUrl.includes('?') ? '&' : '?'}v=${item.updated_at ? new Date(item.updated_at).getTime() : Date.now()}`;
  };
  
  const imageUrl = getImageUrl();
  const placeholderUrl = getPlaceholderImage('drink');
  
  // Resetear error cuando cambia la imagen
  useEffect(() => {
    setImageError(false);
    setImageKey(prev => prev + 1);
  }, [item.image_url, item.updated_at]);

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
          group relative overflow-hidden rounded-2xl
          bg-warm-50 hover:shadow-xl transition-all duration-300 ease-out
          active:scale-[0.97] cursor-pointer flex flex-col
          ${!item.is_available ? 'opacity-60' : ''}
        `}
        style={{
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.08)',
        }}
      >
      {/* Imagen con fondo cálido suave */}
      <div className="relative h-36 sm:h-40 md:h-44 overflow-hidden bg-warm-100">
        {imageUrl && !imageError ? (
          <img
            key={imageKey}
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={() => {
              console.error('Error cargando imagen:', imageUrl);
              setImageError(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={placeholderUrl}
              alt="Placeholder"
              className="w-20 h-20 opacity-30"
            />
          </div>
        )}
        
        {/* Overlay sutil en hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Información compacta con spacing premium */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col bg-warm-50">
        <h3 className="font-semibold text-sm sm:text-base text-slate-900 mb-2 line-clamp-2 leading-snug font-sans">
          {item.name}
        </h3>
        
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-warm-200">
          <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-sans">
            {formatPrice(item.price)}
          </span>
          
          {item.is_available && (
            <span className="text-xs bg-tomato-50 text-tomato-700 px-2.5 py-1 rounded-full font-medium" style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)' }}>
              ✓
            </span>
          )}
        </div>
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

