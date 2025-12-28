import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function AdminLayoutWrapper({ children, currentPath }: AdminLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Por defecto abierto (desktop)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkMobile() {
      if (typeof window === 'undefined') return;
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // En desktop, sidebar siempre abierto
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        // En móvil, empezar cerrado
        setSidebarOpen(false);
      }
    }
    
    // Ejecutar inmediatamente solo en cliente
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        currentPath={currentPath || ''}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
      
      <main className="flex-1 lg:ml-0 min-h-screen w-full">
        {/* Botón hamburger para móvil */}
        <div className="lg:hidden fixed top-4 left-4 z-30">
          <button
            onClick={toggleSidebar}
            className="p-2 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Contenido principal con padding para móvil */}
        <div className="pt-16 lg:pt-0 px-3 sm:px-4 lg:px-6 pb-4 lg:pb-6 safe-area-inset">
          {children}
        </div>
      </main>
    </div>
  );
}

