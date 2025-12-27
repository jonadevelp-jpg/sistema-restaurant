/**
 * Sistema de mapeo de imágenes
 * Permite migración gradual de estructura antigua a nueva
 * Mantiene compatibilidad con rutas existentes
 */

/**
 * Mapea una ruta antigua a la nueva estructura
 * Si la imagen no existe en nueva estructura, devuelve la ruta original
 */
export function mapImagePath(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  
  // Si ya es una URL completa (Supabase Storage), devolverla tal cual
  // Las URLs de Supabase Storage tienen formato: https://xxx.supabase.co/storage/v1/object/public/bucket/file
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Si es una URL de Supabase Storage, asegurarse de que tenga los parámetros correctos
    try {
      const url = new URL(imageUrl);
      // Si no tiene parámetros de transformación, agregar uno para cache busting
      // Pero no lo hacemos aquí, se hace en el componente
      return imageUrl;
    } catch {
      // Si no es una URL válida, devolver tal cual
      return imageUrl;
    }
  }

  // Normalizar ruta (remover / inicial si existe)
  const normalizedPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;

  // Mapeo de rutas antiguas a nuevas
  const legacyMapping: Record<string, string> = {
    // Entradas → products/featured o standard
    'entradas/hummus-pan.png': '/images/products/featured/hummus-pan.png',
    'entradas/babaGanoush-psn.png': '/images/products/featured/baba-ganoush.png',
    'entradas/falafel-6unid.png': '/images/products/featured/falafel.png',
    'entradas/kebab-picar-2unid.png': '/images/products/standard/kebab-picar.png',
    'entradas/kubben-5unid.png': '/images/products/standard/kubben.png',
    'entradas/repollitos-10unid.png': '/images/products/standard/repollitos.png',
    'entradas/holasDeParra-12unid.png': '/images/products/standard/hojas-parra.png',
    'entradas/entrada.png': '/images/hero/sections/entradas.png',
    
    // Shawarmas → products/featured
    'shawarmas/shawarma-mixto.png': '/images/products/featured/shawarma-mixto.png',
    'shawarmas/shawarma-pollo.png': '/images/products/featured/shawarma-pollo.png',
    'shawarmas/shawarma-carne.png': '/images/products/featured/shawarma-carne.png',
    'shawarmas/shawarma-falafel.png': '/images/products/featured/shawarma-falafel.png',
    'shawarmas/shawarmas.png': '/images/hero/sections/shawarmas.png',
    
    // Bebestibles → products/drinks
    'bebestibles/cafe-arabe.png': '/images/products/drinks/cafe-arabe.png',
    'bebestibles/cafe-cardamomo.png': '/images/products/drinks/cafe-cardamomo.png',
    'bebestibles/cafe-tradicional.png': '/images/products/drinks/cafe-tradicional.png',
    'bebestibles/te-verde.png': '/images/products/drinks/te-verde.png',
    'bebestibles/te-karkade.png': '/images/products/drinks/te-karkade.png',
    'bebestibles/jugos-watts.png': '/images/products/drinks/jugos-watts.png',
    'bebestibles/jugos-temporada.png': '/images/products/drinks/jugos-temporada.png',
    'bebestibles/bebida-agua-gas.png': '/images/products/drinks/agua-gas.png',
    'bebestibles/bebida-agua-sin-gas.png': '/images/products/drinks/agua-sin-gas.png',
    'bebestibles/bebidas-lata.png': '/images/products/drinks/bebidas-lata.png',
    'bebestibles/bebestibles.png': '/images/hero/sections/bebestibles.png',
    
    // Platillos → products/featured o standard
    'platillos/shawarma-plato-mixto.png': '/images/products/featured/shawarma-plato-mixto.png',
    'platillos/shawarma-plato-pollo-arros-papa.png': '/images/products/featured/shawarma-plato-pollo.png',
    'platillos/kebbab-arroz-papas.png': '/images/products/featured/kebab-arroz-papas.png',
    'platillos/tabla-mixta-carne.png': '/images/products/featured/tabla-mixta-carne.png',
    'platillos/tabla-mixta-vegana.png': '/images/products/featured/tabla-mixta-vegana.png',
    'platillos/platillos.png': '/images/hero/sections/platillos.png',
    
    // Acompañamientos → products/standard
    'acompañamientos/salsa-aji-oro.png': '/images/products/standard/salsa-aji-oro.png',
    'acompañamientos/salsa-ajo.png': '/images/products/standard/salsa-ajo.png',
    'acompañamientos/salsa-albaca.png': '/images/products/standard/salsa-albaca.png',
    'acompañamientos/salsa-albahaca.png': '/images/products/standard/salsa-albahaca.png',
    'acompañamientos/salsa-cilantro.png': '/images/products/standard/salsa-cilantro.png',
    'acompañamientos/salsa-pimenton.png': '/images/products/standard/salsa-pimenton.png',
    'acompañamientos/salsa-yogurt.png': '/images/products/standard/salsa-yogurt.png',
    'acompañamientos/salsas-acomp.png': '/images/hero/sections/acompanamientos.png',
    
    // Postres → products/featured
    'postres/postre.png': '/images/products/featured/postre.png',
    'postres/postre-surtido.png': '/images/products/featured/postre-surtido.png',
    'postres/postre-ceregli.png': '/images/products/featured/postre-ceregli.png',
    
    // Menu del día → products/featured
    'menu-del.dia/pollo-aceituna.png': '/images/products/featured/pollo-aceituna.png',
    'menu-del.dia/pollo-arvejado.png': '/images/products/featured/pollo-arvejado.png',
    'menu-del.dia/pollo-ciruleas.png': '/images/products/featured/pollo-ciruelas.png',
    'menu-del.dia/pollo-coniac.png': '/images/products/featured/pollo-coñac.png',
    'menu-del.dia/pollo-estofado.png': '/images/products/featured/pollo-estofado.png',
    'menu-del.dia/pollo-plancha.png': '/images/products/featured/pollo-plancha.png',
    'menu-del.dia/pollo-verduras.png': '/images/products/featured/pollo-verduras.png',
    'menu-del.dia/menu-del-dia.png': '/images/hero/sections/menu-del-dia.png',
    
    // Brand
    'logo-cropped.png': '/images/brand/logo/logo-cropped.png',
    'fondo.png': '/images/brand/textures/fondo.png',
    'desayuno.png': '/images/hero/sections/desayuno.png',
    'sandwich.png': '/images/hero/sections/sandwich.png',
  };

  // Buscar en mapeo
  const mappedPath = legacyMapping[normalizedPath];
  if (mappedPath) {
    return mappedPath;
  }

  // Si no está en el mapeo, intentar inferir la nueva ruta
  // Por ahora, devolver la ruta original para no romper nada
  return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
}

/**
 * Obtiene el placeholder apropiado según el tipo de visualización
 */
export function getPlaceholderImage(visualType?: 'hero' | 'list' | 'drink' | null): string {
  switch (visualType) {
    case 'hero':
      return '/images/ui/placeholders/product-hero.svg';
    case 'drink':
      return '/images/ui/placeholders/drink.svg';
    case 'list':
    default:
      return '/images/ui/placeholders/product-list.svg';
  }
}

/**
 * Verifica si una imagen existe (para fallback)
 */
export async function checkImageExists(imageUrl: string): Promise<boolean> {
  if (!imageUrl) return false;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return true;
  
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

