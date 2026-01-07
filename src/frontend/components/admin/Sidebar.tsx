import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SidebarProps {
  currentPath?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ currentPath, isOpen = true, onToggle }: SidebarProps) {
  const [user, setUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        if (profile) setUser(profile);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    function checkMobile() {
      if (typeof window === 'undefined') return;
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    }
    
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  const allMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'encargado', 'mesero'] },
    { path: '/admin/menu', label: 'Gestión del Menú', icon: '🍽️', roles: ['admin', 'encargado'] },
    { path: '/admin/pedidos', label: 'Pedidos (POS)', icon: '🛒', roles: ['admin', 'encargado', 'mesero'] },
    { path: '/admin/ordenes', label: 'Órdenes', icon: '📋', roles: ['admin', 'encargado', 'mesero'] },
    { path: '/admin/stock-panes-bebidas', label: 'Stock Panes/Bebidas', icon: '🥖', roles: ['admin', 'encargado'] },
    { path: '/admin/empleados', label: 'Empleados', icon: '👥', roles: ['admin', 'encargado'] },
  ];

  // Filtrar menú según rol del usuario
  const menuItems = user?.role 
    ? allMenuItems.filter(item => item.roles.includes(user.role))
    : allMenuItems;

  const isActive = (path: string) => currentPath === path;

  // En móvil, si está cerrado, no mostrar nada
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay para móvil */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar - Premium Minimalista */}
      <div
        className={`
          fixed lg:static
          top-0 left-0
          w-64 bg-white min-h-screen flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''}
        `}
        style={{
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.04), 1px 0 4px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Header con botón cerrar en móvil */}
        <div className="p-6 border-b border-warm-200 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 font-sans">Admin Panel</h1>
            <p className="text-sm text-slate-600 mt-1 truncate font-sans">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-slate-500 mt-1 capitalize font-sans">{user?.role}</p>
          </div>
          {isMobile && (
            <button
              onClick={onToggle}
              className="ml-2 p-2 hover:bg-warm-100 rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <a
                  href={item.path}
                  onClick={() => {
                    // Cerrar sidebar en móvil al hacer clic
                    if (isMobile && onToggle) {
                      setTimeout(() => onToggle(), 100);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium font-sans ${
                    isActive(item.path)
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-warm-100 hover:text-slate-900'
                  }`}
                  style={
                    isActive(item.path)
                      ? {
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                        }
                      : {}
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer con logout */}
        <div className="p-4 border-t border-warm-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-warm-100 hover:text-slate-900 transition-all duration-200 text-sm font-medium font-sans"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}

