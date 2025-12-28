import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
}

export default function MenuImprimibleCompleto() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesData, setCategoriesData] = useState<Map<number, MenuItem[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      // Cargar todas las categorías
      const { data: cats, error: catsError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('order_num');

      if (catsError) throw catsError;
      setCategories(cats || []);

      // Cargar items de todas las categorías
      const itemsMap = new Map<number, MenuItem[]>();
      
      if (cats) {
        for (const cat of cats) {
          const { data: items, error: itemsError } = await supabase
            .from('menu_items')
            .select('*')
            .eq('category_id', cat.id)
            .eq('is_available', true)
            .order('order_num');

          if (!itemsError && items) {
            itemsMap.set(cat.id, items);
          }
        }
      }

      setCategoriesData(itemsMap);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="text-[#d4af37] text-xl">Cargando menú completo...</div>
      </div>
    );
  }

  return (
    <>
      {/* Botón de impresión - solo visible en pantalla */}
      <div className="no-print p-6 bg-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Menú Completo Imprimible</h1>
          <div className="flex gap-3">
            <a
              href="/menu-imprimible"
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white"
            >
              ← Menú por Sección
            </a>
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              🖨️ Imprimir Todo
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Se imprimirán todas las secciones. Cada sección ocupará una tarjeta de 5.5" x 8" (formato horizontal). 
          Configura la impresora para imprimir 2 cartas por hoja en horizontal.
        </p>
      </div>

      {/* Generar menú para cada categoría */}
      {categories.map((category) => {
        const items = categoriesData.get(category.id) || [];
        const isPlatillos = category.slug === 'platillos';
        // Para platillos, calcular items por página para que quepa en exactamente 2 páginas
        let itemsPerPage = isPlatillos ? 15 : 15;
        const maxPages = isPlatillos ? 2 : 1;
        
        // Si es platillos y hay más items de los que caben en 2 páginas, ajustar itemsPerPage
        if (isPlatillos && items.length > 0) {
          // Calcular cuántos items deben ir por página para que quepan en 2 páginas
          itemsPerPage = Math.ceil(items.length / maxPages);
        }
        
        const needsMultiplePages = isPlatillos && items.length > itemsPerPage;
        const pages = needsMultiplePages 
          ? Math.min(Math.ceil(items.length / itemsPerPage), maxPages)
          : 1;

        // Obtener todas las imágenes disponibles para usar en cada página
        const categoryImage = category.image_url;
        const itemsWithImages = items.filter((item) => item.image_url);
        const featuredItemImage = itemsWithImages[0]?.image_url || null;

        return Array.from({ length: pages }, (_, pageIndex) => {
          const startIndex = pageIndex * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const pageItems = items.slice(startIndex, endIndex);
          const isFirstPage = pageIndex === 0;
          const isLastPage = pageIndex === pages - 1;
          
          // Si es la última página y tiene pocos items, incluir todos los restantes
          const finalPageItems = isLastPage && isPlatillos && pageItems.length < itemsPerPage
            ? items.slice(startIndex) // Incluir todos los items restantes
            : pageItems;
          
          // Asignar imagen a cada página: primera usa categoría, otras usan items con imagen
          let displayImage = null;
          if (isFirstPage) {
            displayImage = categoryImage || featuredItemImage;
          } else {
            // Para páginas siguientes, usar imagen de un item de esa página o una imagen disponible
            const pageItemWithImage = finalPageItems.find((item) => item.image_url);
            displayImage = pageItemWithImage?.image_url || featuredItemImage;
          }

          return (
            <div
              key={`${category.id}-${pageIndex}`}
              className={`menu-imprimible ${isPlatillos ? 'platillos' : ''} ${pageIndex > 0 ? 'continuation' : ''}`}
            >
              {/* Título */}
              <div className="menu-header">
                <h1 className="menu-title">
                  {category.name.toUpperCase()}
                  {pages > 1 && pageIndex > 0 && (
                    <span className="page-number"> (Continuación)</span>
                  )}
                </h1>
                {category.description && isFirstPage && (
                  <p className="menu-subtitle">{category.description}</p>
                )}
              </div>

              {/* Imagen principal - solo en primera página o en continuación si hay imagen disponible */}
              {displayImage && (
                <div className="menu-image-container">
                  <img
                    src={displayImage}
                    alt={category.name}
                    className="menu-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Lista de items */}
              <div className="menu-items-list">
                {finalPageItems.length === 0 ? (
                  <div className="text-center py-12 text-white/70">
                    No hay items disponibles en esta categoría
                  </div>
                ) : (
                  finalPageItems.map((item) => (
                    <div key={item.id} className="menu-item-row">
                      <div className="menu-item-info">
                        <div className="menu-item-name">{item.name}</div>
                        {item.description && (
                          <div className="menu-item-description">{item.description}</div>
                        )}
                      </div>
                      <div className="menu-item-price">{formatPrice(item.price)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        });
      })}

      <style jsx global>{`
        @media print {
          @page {
            size: 5.5in 8in;
            margin: 0;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .no-print {
            display: none !important;
          }

          body {
            background: #0a0a0a !important;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .menu-imprimible {
            width: 5.5in;
            height: 8in;
            max-height: 8in;
            background: #0a0a0a !important;
            background-image: 
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 15px,
                rgba(184, 134, 11, 0.08) 15px,
                rgba(184, 134, 11, 0.08) 30px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 15px,
                rgba(184, 134, 11, 0.05) 15px,
                rgba(184, 134, 11, 0.05) 30px
              ) !important;
            padding: 15px 18px;
            color: white !important;
            font-family: 'Cinzel', 'Playfair Display', serif;
            page-break-after: always;
            page-break-inside: avoid;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            box-sizing: border-box;
            position: relative;
          }

          .menu-imprimible.continuation {
            height: 8in;
            max-height: 8in;
          }

          .menu-imprimible.platillos {
            height: auto;
            min-height: 8in;
            max-height: 16in;
            page-break-after: always;
          }

          .menu-imprimible.platillos.continuation {
            height: 8in;
            max-height: 8in;
          }

          .menu-header {
            text-align: center;
            margin-bottom: 10px;
            position: relative;
            flex-shrink: 0;
          }

          .menu-title {
            font-size: 32px !important;
            font-weight: 700 !important;
            color: #d4af37 !important;
            text-shadow: 
              0 0 15px rgba(212, 175, 55, 0.5),
              2px 2px 6px rgba(0, 0, 0, 0.9) !important;
            margin: 0;
            letter-spacing: 2px;
            font-family: 'Cinzel', serif !important;
            line-height: 1.1;
            position: relative;
            display: inline-block;
            padding: 0 15px;
          }

          .menu-imprimible.platillos .menu-title {
            font-size: 34px !important;
          }

          .menu-title .page-number {
            font-size: 18px;
            opacity: 0.8;
          }

          .menu-title::before,
          .menu-title::after {
            content: '✦';
            color: #d4af37;
            font-size: 18px;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.8;
          }

          .menu-title::before {
            left: -20px;
          }

          .menu-title::after {
            right: -20px;
          }

          .menu-subtitle {
            font-size: 11px;
            color: #d4af37;
            margin-top: 4px;
            font-style: italic;
            font-weight: 400;
            opacity: 0.9;
          }

          .menu-image-container {
            width: 100%;
            max-width: 100%;
            margin: 8px auto;
            border: 2.5px solid #d4af37 !important;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 
              0 8px 20px rgba(212, 175, 55, 0.5),
              inset 0 0 15px rgba(0, 0, 0, 0.3) !important;
            background: #000;
            position: relative;
            flex-shrink: 0;
          }

          .menu-image-container::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            background: linear-gradient(135deg, #d4af37, #b8940b, #d4af37, #f4d03f);
            z-index: -1;
            border-radius: 10px;
            opacity: 0.9;
          }

          .menu-image {
            width: 100%;
            height: auto;
            display: block;
            object-fit: cover;
            max-height: 220px;
          }

          .menu-imprimible.platillos .menu-image {
            max-height: 240px;
          }

          .menu-imprimible.continuation .menu-image {
            max-height: 220px;
          }

          .menu-items-list {
            max-width: 100%;
            margin: 8px auto 0;
            padding: 0 8px;
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
          }

          .menu-imprimible.platillos .menu-items-list {
            max-width: 100%;
            margin: 8px auto 0;
            padding: 0 8px;
          }

          .menu-item-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 6px 0;
            border-bottom: 1px solid rgba(212, 175, 55, 0.3);
            page-break-inside: avoid;
            position: relative;
            flex-shrink: 0;
          }

          .menu-imprimible.platillos .menu-item-row {
            padding: 6px 0;
          }

          .menu-item-row::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(
              to right,
              transparent,
              rgba(212, 175, 55, 0.4),
              transparent
            );
          }

          .menu-item-info {
            flex: 1;
            padding-right: 12px;
          }

          .menu-item-name {
            font-size: 15px !important;
            font-weight: 600 !important;
            color: #ffffff !important;
            margin-bottom: 4px;
            font-family: 'Playfair Display', serif !important;
            line-height: 1.4;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
          }

          .menu-imprimible.platillos .menu-item-name {
            font-size: 15px !important;
            margin-bottom: 3px;
          }

          .menu-item-description {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.7);
            font-style: italic;
            line-height: 1.3;
            margin-top: 2px;
          }

          .menu-imprimible.platillos .menu-item-description {
            font-size: 10px;
            line-height: 1.3;
            margin-top: 2px;
          }

          .menu-item-price {
            font-size: 13px !important;
            font-weight: 700 !important;
            color: #d4af37 !important;
            border: 1.5px solid #d4af37 !important;
            padding: 4px 10px !important;
            border-radius: 4px;
            background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1)) !important;
            white-space: nowrap;
            font-family: 'Cinzel', serif !important;
            text-align: center;
            min-width: 70px;
            box-shadow: 
              0 2px 6px rgba(212, 175, 55, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          }

          .menu-imprimible.platillos .menu-item-price {
            font-size: 13px !important;
            padding: 4px 10px !important;
            min-width: 70px;
          }
        }

        /* Estilos para pantalla (preview) */
        @media screen {
          .menu-imprimible {
            width: 8in;
            height: 5.5in;
            background: #0a0a0a;
            background-image: 
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 15px,
                rgba(184, 134, 11, 0.08) 15px,
                rgba(184, 134, 11, 0.08) 30px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 15px,
                rgba(184, 134, 11, 0.05) 15px,
                rgba(184, 134, 11, 0.05) 30px
              );
            padding: 20px 25px;
            color: white;
            font-family: 'Cinzel', 'Playfair Display', serif;
            margin: 20px auto;
            border: 1px solid #d4af37;
          }

          .menu-header {
            text-align: center;
            margin-bottom: 12px;
            position: relative;
          }

          .menu-title {
            font-size: 28px;
            font-weight: 700;
            color: #d4af37;
            text-shadow: 
              0 0 15px rgba(212, 175, 55, 0.5),
              2px 2px 6px rgba(0, 0, 0, 0.9);
            margin: 0;
            letter-spacing: 2px;
            font-family: 'Cinzel', serif;
            line-height: 1.1;
            position: relative;
            display: inline-block;
            padding: 0 15px;
          }

          .menu-title::before,
          .menu-title::after {
            content: '✦';
            color: #d4af37;
            font-size: 18px;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.8;
          }

          .menu-title::before {
            left: -20px;
          }

          .menu-title::after {
            right: -20px;
          }

          .menu-subtitle {
            font-size: 11px;
            color: #d4af37;
            margin-top: 4px;
            font-style: italic;
            font-weight: 400;
            opacity: 0.9;
          }

          .menu-image-container {
            width: 100%;
            max-width: 100%;
            margin: 10px auto;
            border: 2.5px solid #d4af37;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 
              0 8px 20px rgba(212, 175, 55, 0.5),
              inset 0 0 15px rgba(0, 0, 0, 0.3);
            background: #000;
            position: relative;
          }

          .menu-image-container::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            background: linear-gradient(135deg, #d4af37, #b8940b, #d4af37, #f4d03f);
            z-index: -1;
            border-radius: 10px;
            opacity: 0.9;
          }

          .menu-image {
            width: 100%;
            height: auto;
            display: block;
            object-fit: cover;
            max-height: 140px;
          }

          .menu-items-list {
            max-width: 100%;
            margin: 8px auto 0;
            padding: 0 10px;
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
          }

          .menu-item-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 4px 0;
            border-bottom: 1px solid rgba(212, 175, 55, 0.3);
            position: relative;
          }

          .menu-item-row::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(
              to right,
              transparent,
              rgba(212, 175, 55, 0.4),
              transparent
            );
          }

          .menu-item-info {
            flex: 1;
            padding-right: 12px;
          }

          .menu-item-name {
            font-size: 12px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 2px;
            font-family: 'Playfair Display', serif;
            line-height: 1.2;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
          }

          .menu-item-description {
            font-size: 9px;
            color: rgba(255, 255, 255, 0.7);
            font-style: italic;
            line-height: 1.2;
            margin-top: 1px;
          }

          .menu-item-price {
            font-size: 11px;
            font-weight: 700;
            color: #d4af37;
            border: 1.5px solid #d4af37;
            padding: 3px 8px;
            border-radius: 4px;
            background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1));
            white-space: nowrap;
            font-family: 'Cinzel', serif;
            text-align: center;
            min-width: 60px;
            box-shadow: 
              0 2px 6px rgba(212, 175, 55, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          }
        }
      `}</style>
    </>
  );
}
