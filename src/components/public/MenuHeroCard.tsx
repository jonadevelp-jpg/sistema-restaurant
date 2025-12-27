/**
 * Componente premium para renderizar items con visual_type "hero"
 * Diseño minimalista sin bordes, con sombras suaves y mucho espacio
 */

import { useState, useEffect } from 'react';
import type { MenuItem } from '@/lib/supabase';
import { mapImagePath, getPlaceholderImage } from '@/utils/image-mapper';
import ProductDetailModal from './ProductDetailModal';

interface MenuHeroCardProps {
  item: MenuItem;
  onClick?: () => void;
}

export default function MenuHeroCard({ item, onClick }: MenuHeroCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [imageKey, setImageKey] = useState(0); // Para forzar recarga de imagen
  
  // Mapear y agregar cache busting a la URL de la imagen
  const getImageUrl = () => {
    if (!item.image_url) {
      console.log('⚠️ MenuHeroCard - Item sin image_url:', item.name);
      return null;
    }
    
    console.log('🖼️ MenuHeroCard - Procesando imagen:', {
      itemName: item.name,
      originalImageUrl: item.image_url,
      hasUpdatedAt: !!item.updated_at
    });
    
    const mappedUrl = mapImagePath(item.image_url);
    
    console.log('🖼️ MenuHeroCard - URL mapeada:', {
      itemName: item.name,
      mappedUrl,
      isHttp: mappedUrl.startsWith('http://') || mappedUrl.startsWith('https://')
    });
    
    // Si es una URL de Supabase Storage (https://), agregar cache busting correctamente
    if (mappedUrl.startsWith('http://') || mappedUrl.startsWith('https://')) {
      try {
        const url = new URL(mappedUrl);
        const cacheBust = item.updated_at ? new Date(item.updated_at).getTime().toString() : Date.now().toString();
        url.searchParams.set('v', cacheBust);
        const finalUrl = url.toString();
        console.log('✅ MenuHeroCard - URL final (HTTP):', {
          itemName: item.name,
          finalUrl
        });
        return finalUrl;
      } catch (e) {
        console.warn('⚠️ MenuHeroCard - Error parseando URL HTTP:', e);
        // Si falla el parsing, agregar query param manualmente
        const cacheBust = item.updated_at ? new Date(item.updated_at).getTime() : Date.now();
        const finalUrl = `${mappedUrl}${mappedUrl.includes('?') ? '&' : '?'}v=${cacheBust}`;
        console.log('✅ MenuHeroCard - URL final (HTTP fallback):', {
          itemName: item.name,
          finalUrl
        });
        return finalUrl;
      }
    }
    
    // Si es una ruta relativa, agregar cache busting
    const cacheBust = item.updated_at ? new Date(item.updated_at).getTime() : Date.now();
    const finalUrl = `${mappedUrl}${mappedUrl.includes('?') ? '&' : '?'}v=${cacheBust}`;
    console.log('✅ MenuHeroCard - URL final (relativa):', {
      itemName: item.name,
      finalUrl
    });
    return finalUrl;
  };
  
  // Calcular imageUrl dentro del componente para que se recalcule cuando cambie item
  const imageUrl = getImageUrl();
  const placeholderUrl = getPlaceholderImage('hero');
  
  // Resetear error cuando cambia la imagen
  useEffect(() => {
    setImageError(false);
    setImageKey(prev => prev + 1);
    const currentImageUrl = getImageUrl();
    console.log('🔄 MenuHeroCard - useEffect ejecutado:', {
      itemName: item.name,
      originalImageUrl: item.image_url,
      calculatedImageUrl: currentImageUrl,
      updatedAt: item.updated_at,
      imageKey
    });
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
          group relative overflow-hidden rounded-3xl
          bg-warm-50 hover:shadow-2xl transition-all duration-300 ease-out
          active:scale-[0.98] cursor-pointer
          ${!item.is_available ? 'opacity-75' : ''}
        `}
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.12)',
        }}
      >
      {/* Imagen destacada con fondo cálido - SIEMPRE mostrar card aunque no haya imagen */}
      <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 overflow-hidden bg-gradient-to-br from-warm-100 to-warm-200">
        {(() => {
          console.log('🖼️ MenuHeroCard - Renderizando imagen:', {
            itemName: item.name,
            hasImageUrl: !!imageUrl,
            imageUrl,
            imageError,
            originalImageUrl: item.image_url,
            willShowImage: imageUrl && !imageError
          });
          
          if (imageUrl && !imageError) {
            return (
              <>
                <img
                  key={`hero-img-${item.id}-${imageKey}-${item.updated_at || Date.now()}`}
                  src={imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                  onLoad={() => {
                    console.log('✅ MenuHeroCard - Imagen cargada exitosamente:', {
                      itemName: item.name,
                      imageUrl
                    });
                  }}
                  onError={(e) => {
                    console.error('❌ MenuHeroCard - Error cargando imagen:', {
                      itemName: item.name,
                      imageUrl,
                      originalImageUrl: item.image_url,
                      error: e,
                      target: e.target
                    });
                    setImageError(true);
                  }}
                />
                {/* Overlay sutil en hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </>
            );
          } else {
            console.log('⚠️ MenuHeroCard - Mostrando placeholder:', {
              itemName: item.name,
              reason: !imageUrl ? 'No hay imageUrl' : 'imageError es true',
              imageUrl,
              imageError
            });
            return (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-warm-100 via-warm-200 to-warm-100">
                <div className="text-center">
                  <img
                    src={placeholderUrl}
                    alt="Placeholder"
                    className="w-32 h-32 sm:w-40 sm:h-40 opacity-50 mx-auto mb-2"
                    onError={(e) => {
                      console.error('❌ MenuHeroCard - Error cargando placeholder:', {
                        itemName: item.name,
                        placeholderUrl,
                        error: e
                      });
                    }}
                  />
                  <p className="text-slate-400 text-xs sm:text-sm">Imagen no disponible</p>
                </div>
              </div>
            );
          }
        })()}

        {/* Badge destacado - premium minimalista */}
        {item.is_featured && (
          <div className="absolute top-4 right-4 bg-warm-50/98 backdrop-blur-sm px-3 py-1.5 rounded-full" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)' }}>
            <span className="text-xs font-semibold text-tomato-600 tracking-wide">
              ⭐ Destacado
            </span>
          </div>
        )}

        {/* Estado no disponible - elegante */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-warm-50/98 backdrop-blur-sm px-6 py-3 rounded-xl" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
              <span className="text-sm font-semibold text-slate-600">
                No disponible
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Información del item - premium spacing con fondo cálido */}
      <div className="p-6 sm:p-8 space-y-3 bg-warm-50">
        <h3 className="font-bold text-xl sm:text-2xl md:text-3xl text-slate-900 leading-tight line-clamp-2 font-sans">
          {item.name}
        </h3>
        
        {item.description && (
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed line-clamp-2 font-sans">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight font-sans">
            {formatPrice(item.price)}
          </span>
          
          {item.is_available && (
            <span className="text-xs sm:text-sm bg-tomato-50 text-tomato-700 px-3 py-1.5 rounded-full font-medium" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}>
              Disponible
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

