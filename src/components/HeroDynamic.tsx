import { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface HeroDynamicProps {
  categories: Category[];
}

export default function HeroDynamic({ categories }: HeroDynamicProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mapeo de slugs a nombres de archivos hero-*.png
  const getHeroImage = (slug: string): string => {
    const heroMap: Record<string, string> = {
      'destacados': '/her-destacados.png', // Nota: el archivo se llama "her-destacados.png" (sin la 'o')
      'completos': '/hero-completos.png',
      'sandwiches': '/hero-sandwich.png',
      'acompanamientos': '/hero-acompañamientos.png',
      'pollo': '/hero-pollos.png',
      'bebidas': '/hero-bebidas.png',
    };
    
    // Normalizar slug (sin acentos, minúsculas)
    const normalizedSlug = slug?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
    
    // Buscar coincidencia exacta primero
    if (heroMap[slug]) {
      return heroMap[slug];
    }
    
    // Buscar por slug normalizado
    if (heroMap[normalizedSlug]) {
      return heroMap[normalizedSlug];
    }
    
    // Fallback: intentar construir el nombre del archivo
    return `/hero-${normalizedSlug}.png`;
  };

  // Obtener todas las imágenes hero de las categorías
  const heroImages = categories
    .map(cat => getHeroImage(cat.slug))
    .filter((img, index, self) => self.indexOf(img) === index); // Eliminar duplicados

  // Rotar automáticamente cada 4 segundos
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  if (heroImages.length === 0) return null;

  return (
    <>
      {/* Slider de imágenes hero - full width sin bordes, hasta los límites */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        {/* Imagen actual con fade */}
        <div 
          key={currentIndex}
          className="absolute inset-0 animate-fade-in"
        >
          <img
            src={heroImages[currentIndex]}
            alt={`Hero ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => {
              // Si falla, intentar con diferentes variaciones
              const img = e.target as HTMLImageElement;
              const categorySlug = heroImages[currentIndex].replace('/hero-', '').replace('.png', '');
              const altPaths = [
                `/hero-${categorySlug}.png`,
                `/images/ui/placeholders/product-hero.svg`, // Fallback final
              ];
              
              let attemptIndex = 0;
              const tryNext = () => {
                if (attemptIndex < altPaths.length) {
                  img.src = altPaths[attemptIndex];
                  attemptIndex++;
                } else {
                  img.style.opacity = '0.3';
                }
              };
              
              img.onerror = tryNext;
              tryNext();
            }}
          />
          {/* Overlay para mejor legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
          
          {/* Título y logo dentro del hero */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
            <h1 className="font-bold text-white text-4xl md:text-5xl lg:text-6xl tracking-wide mb-4 font-sans drop-shadow-2xl">
              COMPLETOS & CHURRASCOS
            </h1>
            <p className="text-white/90 font-medium text-lg md:text-xl font-sans drop-shadow-lg">
              Sabores tradicionales, siempre frescos
            </p>
          </div>
        </div>

        {/* Indicadores de posición (dots) */}
        {heroImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Flechas de navegación (solo desktop) */}
        {heroImages.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
              className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
              aria-label="Imagen anterior"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % heroImages.length)}
              className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
              aria-label="Siguiente imagen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-in-out;
        }
      `}</style>
    </>
  );
}
