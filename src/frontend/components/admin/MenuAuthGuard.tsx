import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import CategoryManager from './CategoryManager';
import MenuItemManager from './MenuItemManager';

interface MenuAuthGuardProps {
  activeTab: string;
}

export default function MenuAuthGuard({ activeTab }: MenuAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          window.location.href = '/admin/login';
          return;
        }

        // Obtener perfil del usuario
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || !userProfile) {
          window.location.href = '/admin/login';
          return;
        }

        // Verificar que el usuario tenga rol de admin o encargado
        if (!['admin', 'encargado'].includes(userProfile.role)) {
          window.location.href = '/admin/login';
          return;
        }

        setUserRole(userProfile.role);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        window.location.href = '/admin/login';
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // La redirección se maneja en el useEffect
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-cinzel text-gold-400">Gestión del Menú</h1>
              <p className="text-xs sm:text-sm text-gold-300/70 mt-1">Administra productos, categorías y precios</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <a 
                href="/" 
                target="_blank"
                className="bg-black/50 text-gold-400 px-3 sm:px-4 py-2 rounded-lg hover:bg-black/70 transition flex items-center justify-center gap-2 border border-gold-600 text-xs sm:text-sm"
              >
                👁️ Ver Menú
              </a>
              <a 
                href="/menu-imprimible" 
                target="_blank"
                className="bg-black/50 text-gold-400 px-3 sm:px-4 py-2 rounded-lg hover:bg-black/70 transition flex items-center justify-center gap-2 border border-gold-600 text-xs sm:text-sm"
              >
                🖨️ Versión Imprimible
              </a>
            </div>
          </div>

          {/* Tabs de navegación */}
          <nav className="flex gap-1 sm:gap-2 border-b-2 border-gold-600/30 pb-0 overflow-x-auto">
            <a 
              href="/admin/menu?tab=items"
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-t-lg transition font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'items' 
                  ? 'bg-gold-600 text-black' 
                  : 'bg-black/50 text-gold-400 hover:bg-black/70'
              }`}
            >
              🍽️ Items del Menú
            </a>
            <a 
              href="/admin/menu?tab=categories"
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-t-lg transition font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'categories' 
                  ? 'bg-gold-600 text-black' 
                  : 'bg-black/50 text-gold-400 hover:bg-black/70'
              }`}
            >
              📁 Categorías
            </a>
          </nav>
        </header>

        {/* Contenido según tab activo */}
        <div className="bg-black/30 p-3 sm:p-4 md:p-6 rounded-lg border-2 border-gold-600">
          {activeTab === 'items' && (
            <MenuItemManager />
          )}
          {activeTab === 'categories' && (
            <CategoryManager />
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-4 sm:mt-6 md:mt-8 bg-black/30 border border-gold-600/30 rounded-lg p-3 sm:p-4">
          <h3 className="text-gold-400 font-semibold mb-2 text-sm sm:text-base">💡 Consejos</h3>
          <ul className="text-gold-300/80 text-xs sm:text-sm space-y-1">
            <li>• Los cambios se reflejan inmediatamente en el menú público y la versión imprimible</li>
            <li>• Usa "Ocultar" para items temporalmente no disponibles (no los pierdas)</li>
            <li>• Las imágenes se optimizan automáticamente y cargan rápido</li>
            <li>• Puedes reordenar items y categorías cambiando el número de "Orden"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

