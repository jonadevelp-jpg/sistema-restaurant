import { useEffect, useState, useRef } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface NavigationMenuProps {
  categories: Category[];
  currentSlug?: string;
}

export default function NavigationMenu({ categories, currentSlug }: NavigationMenuProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Si hay una categoría activa, mostrar el navbar inmediatamente
    if (currentSlug) {
      setIsScrolled(true);
    } else {
      // Verificar estado inicial
      handleScroll();
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentSlug]);

  // Scroll automático a la categoría activa al cargar
  useEffect(() => {
    if (currentSlug && menuRef.current) {
      const activeLink = menuRef.current.querySelector(`a[href="/${currentSlug}"]`);
      if (activeLink) {
        setTimeout(() => {
          activeLink.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest', 
            inline: 'center' 
          });
        }, 200);
      }
    }
  }, [currentSlug]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-lg border-b border-tomato-300/30 transform ${
        isScrolled || currentSlug ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 py-1.5">
        {/* Logo pequeño y botón imprimir */}
        <div className="flex items-center justify-between mb-1">
          <a
            href="/"
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo-cropped.png"
              alt="Completos & Churrascos"
              className="w-8 h-8 md:w-10 md:h-10 object-contain"
            />
            <span className="font-bold text-tomato-600 text-sm md:text-base hidden sm:block font-sans">
              COMPLETOS & CHURRASCOS
            </span>
          </a>
          <a
            href="/menu-imprimible"
            className="text-slate-600 hover:text-tomato-600 text-sm px-3 py-1.5 rounded-xl bg-warm-50 hover:bg-warm-100 font-medium transition-all duration-300"
            title="Versión imprimible"
            style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.08)' }}
          >
            📄
          </a>
        </div>

        {/* Menú horizontal con scroll - más compacto */}
        <div className="relative" ref={menuRef}>
          <div 
            className="overflow-x-auto scrollbar-hide scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className="flex gap-1.5 pb-0.5" style={{ minWidth: 'max-content' }}>
              {categories.map((category) => {
                const isActive = currentSlug === category.slug;
                return (
                  <a
                    key={category.id}
                    href={`/${category.slug}`}
                    className={`
                      flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold
                      transition-all duration-300 whitespace-nowrap font-sans
                      ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xl'
                          : 'bg-warm-50 text-slate-700 hover:bg-warm-100 hover:text-tomato-600'
                      }
                    `}
                    style={isActive ? {
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25), 0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
                      backgroundColor: '#0F172A', // slate-900 - negro casi puro
                      color: '#FFFFFF',
                      fontWeight: 700,
                    } : {
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    {category.name}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </nav>
  );
}
