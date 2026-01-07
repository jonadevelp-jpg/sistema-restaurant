import { useEffect, useState } from 'react';
import type { MenuItem } from '@/lib/supabase';
import { mapImagePath, getPlaceholderImage } from '@/utils/image-mapper';

interface FeaturedSliderProps {
  items: MenuItem[];
}

export default function FeaturedSlider({ items }: FeaturedSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Pre-cargar todas las imágenes
  useEffect(() => {
    items.forEach((item) => {
      if (item.image_url) {
        const img = new Image();
        img.src = mapImagePath(item.image_url);
      }
    });
  }, [items]);

  // Rotar automáticamente cada 5 segundos
  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        return nextIndex >= items.length ? 0 : nextIndex;
      });
    }, 5000); // 5 segundos entre cada cambio

    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  // Obtener URL de imagen con cache busting
  const getImageUrl = () => {
    if (!currentItem.image_url) return null;
    
    const mappedUrl = mapImagePath(currentItem.image_url);
    
    if (mappedUrl.startsWith('http://') || mappedUrl.startsWith('https://')) {
      try {
        const url = new URL(mappedUrl);
        url.searchParams.set('v', currentItem.updated_at ? new Date(currentItem.updated_at).getTime().toString() : Date.now().toString());
        return url.toString();
      } catch {
        return `${mappedUrl}${mappedUrl.includes('?') ? '&' : '?'}v=${currentItem.updated_at ? new Date(currentItem.updated_at).getTime() : Date.now()}`;
      }
    }
    
    return `${mappedUrl}${mappedUrl.includes('?') ? '&' : '?'}v=${currentItem.updated_at ? new Date(currentItem.updated_at).getTime() : Date.now()}`;
  };

  const imageUrl = getImageUrl();
  const placeholderUrl = getPlaceholderImage('hero');

  const formatPrice = (price: number) => {
    if (price === 0) return 'Consultar';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  return (
    <div className="relative w-full overflow-hidden bg-warm-50 rounded-3xl" style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.12)' }}>
      {/* Contenedor del slider */}
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ 
          transform: `translateX(-${currentIndex * 100}vw)`,
          width: `${items.length * 100}vw`
        }}
      >
        {items.map((item, index) => {
          const itemImageUrl = (() => {
            if (!item.image_url) return null;
            const mappedUrl = mapImagePath(item.image_url);
            if (mappedUrl.startsWith('http://') || mappedUrl.startsWith('https://')) {
              try {
                const url = new URL(mappedUrl);
                url.searchParams.set('v', item.updated_at ? new Date(item.updated_at).getTime().toString() : Date.now().toString());
                return url.toString();
              } catch {
                return `${mappedUrl}${mappedUrl.includes('?') ? '&' : '?'}v=${item.updated_at ? new Date(item.updated_at).getTime() : Date.now()}`;
              }
            }
            return `${mappedUrl}${mappedUrl.includes('?') ? '&' : '?'}v=${item.updated_at ? new Date(item.updated_at).getTime() : Date.now()}`;
          })();

          return (
            <div
              key={item.id}
              className="flex-shrink-0"
              style={{ width: '100vw' }}
            >
              <div className="flex flex-col md:flex-row min-h-[400px] md:min-h-[450px]">
                {/* Hero con imagen - lado izquierdo */}
                <div className="relative w-full md:w-1/2 h-64 md:h-[450px] bg-gradient-to-br from-warm-100 to-warm-200">
                  {itemImageUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                      <img
                        src={itemImageUrl}
                        alt={item.name}
                        className="w-full h-full"
                        style={{ 
                          objectFit: 'cover',
                          objectPosition: 'center',
                          transform: 'scale(1.1)'
                        }}
                        loading={index === 0 ? "eager" : "lazy"}
                        onError={(e) => {
                          console.error('❌ Error cargando imagen:', itemImageUrl, item.name);
                          const img = e.target as HTMLImageElement;
                          img.src = placeholderUrl;
                          img.style.opacity = '0.5';
                        }}
                        onLoad={() => {
                          console.log('✅ Imagen cargada exitosamente:', itemImageUrl, item.name);
                        }}
                      />
                      {/* Overlay sutil */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={placeholderUrl}
                        alt="Placeholder"
                        className="w-32 h-32 opacity-50"
                      />
                    </div>
                  )}
                  
                  {/* Badge destacado */}
                  {item.is_featured && (
                    <div className="absolute top-4 right-4 bg-warm-50/98 backdrop-blur-sm px-3 py-1.5 rounded-full z-10" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)' }}>
                      <span className="text-xs font-semibold text-tomato-600 tracking-wide">
                        ⭐ Destacado
                      </span>
                    </div>
                  )}
                </div>

                {/* Card de detalles - lado derecho */}
                <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 space-y-3 md:space-y-4 bg-warm-50 flex flex-col justify-center">
                  <div>
                    <h3 className="font-bold text-xl sm:text-2xl md:text-3xl text-slate-900 leading-tight font-sans mb-2 md:mb-3">
                      {item.name}
                    </h3>
                    
                    {item.description && (
                      <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-sans line-clamp-2 md:line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-200">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight font-sans">
                      {formatPrice(item.price)}
                    </span>
                    
                    {item.is_available && (
                      <span className="text-xs sm:text-sm bg-tomato-50 text-tomato-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-medium" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}>
                        Disponible
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicadores de posición (dots) */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-tomato-600 w-8'
                  : 'bg-tomato-600/40 hover:bg-tomato-600/60'
              }`}
              aria-label={`Ir a item ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Título de la sección */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="font-bold text-tomato-600 text-xl sm:text-2xl font-sans bg-warm-50/98 backdrop-blur-sm px-4 py-2 rounded-xl" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)' }}>
          ⭐ DESTACADOS ⭐
        </h3>
      </div>
    </div>
  );
}

