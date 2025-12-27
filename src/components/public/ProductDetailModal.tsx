/**
 * Modal de detalle de producto - Premium Minimalista
 * Vista detalle con hero grande, información clara y CTA visible
 * Con efectos elegantes y excelente contraste
 */

import { useEffect, useState } from 'react';
import type { MenuItem } from '@/lib/supabase';
import { mapImagePath, getPlaceholderImage } from '@/utils/image-mapper';

interface ProductDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({
  item,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageKey, setImageKey] = useState(0); // Para forzar recarga de imagen

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Pequeño delay para animación suave
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Resetear imagen cuando cambia el item o se abre el modal
  useEffect(() => {
    if (isOpen && item) {
      setImageKey(prev => prev + 1);
    }
  }, [isOpen, item?.image_url, item?.updated_at]);

  if (!isOpen || !item) return null;

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
  const placeholderUrl = getPlaceholderImage('hero');

  const formatPrice = (price: number) => {
    if (price === 0) return 'Consultar';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  return (
    <>
      {/* Overlay con backdrop blur mejorado - más oscuro y con mejor blur */}
      <div
        className="fixed inset-0 z-50 transition-all duration-500 ease-out"
        onClick={onClose}
        style={{
          backgroundColor: isAnimating ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0)',
          backdropFilter: isAnimating ? 'blur(8px)' : 'blur(0px)',
          WebkitBackdropFilter: isAnimating ? 'blur(8px)' : 'blur(0px)',
        }}
      />

      {/* Modal con animación elegante */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden pointer-events-auto transform transition-all duration-500 ease-out"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#FDFCFB', // warm-50 sólido y opaco
            opacity: isAnimating ? 1 : 0,
            transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
            boxShadow: isAnimating 
              ? '0 30px 80px rgba(0, 0, 0, 0.35), 0 15px 40px rgba(0, 0, 0, 0.25), 0 5px 15px rgba(0, 0, 0, 0.2)' 
              : '0 0 0 rgba(0, 0, 0, 0)',
          }}
        >
          {/* Botón volver - flecha hacia atrás */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 w-11 h-11 rounded-full bg-white/98 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-white transition-all duration-300 group"
            style={{ 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
            aria-label="Volver al listado"
          >
            <svg 
              className="w-6 h-6 transition-transform duration-300 group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Botón cerrar - X en la esquina superior derecha */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/98 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-white transition-all duration-300 group"
            style={{ 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
            aria-label="Cerrar"
          >
            <svg 
              className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Scrollable content */}
          <div 
            className="overflow-y-auto max-h-[90vh] product-modal-scroll"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#CBD5E1 transparent',
            }}
          >
            {/* Hero image - Premium con sombras realistas y mejor contraste */}
            <div 
              className="relative h-72 sm:h-96 md:h-[28rem] overflow-hidden bg-gradient-to-br from-warm-100 to-warm-200"
              style={{
                boxShadow: 'inset 0 -30px 60px rgba(0, 0, 0, 0.15)',
              }}
            >
              {imageUrl ? (
                <>
                  <img
                    key={imageKey}
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out"
                    loading="eager"
                    onError={(e) => {
                      console.error('Error cargando imagen en modal:', imageUrl);
                      // No hacer nada, el placeholder se mostrará si hay error
                    }}
                    style={{
                      filter: 'brightness(1.08) contrast(1.1) saturate(1.05)',
                    }}
                  />
                  {/* Overlay degradado mejorado para mejor transición al contenido */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/60 via-transparent to-transparent pointer-events-none" />
                  {/* Overlay sutil adicional para profundidad */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-warm-100 via-warm-150 to-warm-200">
                  <div className="text-center">
                    <img
                      src={placeholderUrl}
                      alt="Placeholder"
                      className="w-32 h-32 opacity-30 mx-auto mb-4"
                    />
                    <p className="text-slate-500 text-sm font-medium">Imagen no disponible</p>
                  </div>
                </div>
              )}

              {/* Badge destacado - premium con mejor contraste */}
              {item.is_featured && (
                <div 
                  className="absolute top-4 left-4 bg-white/98 backdrop-blur-md px-4 py-2.5 rounded-full border border-tomato-100"
                  style={{ 
                    boxShadow: '0 6px 16px rgba(255, 68, 68, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1)' 
                  }}
                >
                  <span className="text-xs font-bold text-tomato-600 tracking-wide font-sans">
                    ⭐ Destacado
                  </span>
                </div>
              )}
            </div>

            {/* Content - Premium spacing con fondo sólido blanco para máximo contraste */}
            <div className="p-6 sm:p-8 md:p-10 space-y-6 bg-white">
              {/* Nombre - Grande y destacado con mejor contraste */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight font-sans drop-shadow-sm">
                {item.name}
              </h2>

              {/* Descripción - Legible y espaciada con mejor contraste */}
              {item.description && (
                <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl font-sans font-medium">
                  {item.description}
                </p>
              )}

              {/* Precio destacado - Premium con mejor contraste y diseño */}
              <div className="pt-6 border-t-2 border-warm-200">
                <div className="flex items-baseline gap-4 flex-wrap">
                  <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight font-sans drop-shadow-sm">
                    {formatPrice(item.price)}
                  </span>
                  {item.is_available && (
                    <span 
                      className="text-sm bg-tomato-50 text-tomato-700 px-4 py-2.5 rounded-full font-semibold border border-tomato-200 font-sans"
                      style={{ boxShadow: '0 2px 8px rgba(255, 68, 68, 0.2)' }}
                    >
                      ✓ Disponible
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Estilos para scrollbar personalizado */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Scrollbar personalizado para WebKit (Chrome, Safari, Edge) */
        .product-modal-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .product-modal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .product-modal-scroll::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        .product-modal-scroll::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}} />
    </>
  );
}

