// Helper para verificar si estamos en el cliente
const isClient = typeof window !== 'undefined';

interface CategoryHeroProps {
  categoryName: string;
  categorySlug: string;
  categoryImage?: string | null;
}

export default function CategoryHero({ categoryName, categorySlug }: CategoryHeroProps) {
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

  const heroImagePath = getHeroImage(categorySlug);

  return (
    <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden bg-gradient-to-br from-warm-100 via-warm-50 to-warm-100">
      {/* Hero image - full width, cover */}
      <div className="absolute inset-0">
        <img
          src={heroImagePath}
          alt={categoryName}
          className="w-full h-full object-cover"
          loading="eager"
          onError={(e) => {
            // Si falla, intentar con diferentes variaciones
            const img = e.target as HTMLImageElement;
            const altPaths = [
              `/hero-${categorySlug}.png`,
              `/hero-${categorySlug.toLowerCase()}.png`,
              `/images/ui/placeholders/product-hero.svg`, // Fallback final
            ];
            
            let attemptIndex = 0;
            const tryNext = () => {
              if (attemptIndex < altPaths.length) {
                img.src = altPaths[attemptIndex];
                attemptIndex++;
              } else {
                // Si todas fallan, hacer la imagen semi-transparente
                img.style.opacity = '0.3';
              }
            };
            
            img.onerror = tryNext;
            tryNext();
          }}
        />
        {/* Overlay sutil para mejor legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
      </div>

      {/* Título de la categoría - centrado sobre la imagen */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="font-bold text-white text-4xl md:text-5xl lg:text-6xl tracking-wide mb-4 font-sans drop-shadow-lg">
            {categoryName.toUpperCase()}
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
