import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import KpiCard from './components/KpiCard';
import { formatCLP } from '@/lib/currency';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    ventasHoy: 0,
    ordenesPendientes: 0,
    mesasOcupadas: 0,
    gastosMes: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Verificar autenticación
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          window.location.href = '/admin/login';
          return;
        }

        // Obtener perfil de usuario
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          setUser(profile);
        }

        // Cargar KPIs básicos
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Ventas de hoy
        const { data: ordenesHoy, error: errorVentas } = await supabase
          .from('ordenes_restaurante')
          .select('total')
          .eq('estado', 'paid')
          .gte('created_at', hoy.toISOString());

        if (errorVentas) console.error('Error cargando ventas:', errorVentas);
        const ventasHoy = ordenesHoy?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

        // Órdenes pendientes
        const { count: ordenesPendientes, error: errorPendientes } = await supabase
          .from('ordenes_restaurante')
          .select('*', { count: 'exact', head: true })
          .in('estado', ['pending', 'preparing', 'ready']);

        if (errorPendientes) {
          console.error('Error cargando órdenes pendientes:', errorPendientes);
        }

        // Mesas ocupadas
        const { count: mesasOcupadas, error: errorMesas } = await supabase
          .from('mesas')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'ocupada');

        if (errorMesas) {
          console.error('Error cargando mesas:', errorMesas);
        }

        // Gastos del mes
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const { data: gastosMes, error: errorGastosMes } = await supabase
          .from('small_expenses')
          .select('monto')
          .gte('fecha', inicioMes.toISOString().split('T')[0]);

        if (errorGastosMes) console.error('Error cargando gastos pequeños:', errorGastosMes);

        const { data: gastosGenerales, error: errorGastosGen } = await supabase
          .from('general_expenses')
          .select('monto')
          .gte('fecha', inicioMes.toISOString().split('T')[0]);

        if (errorGastosGen) console.error('Error cargando gastos generales:', errorGastosGen);

        const totalGastos = 
          (gastosMes?.reduce((sum, g) => sum + (g.monto || 0), 0) || 0) +
          (gastosGenerales?.reduce((sum, g) => sum + (g.monto || 0), 0) || 0);

        setKpis({
          ventasHoy,
          ordenesPendientes: ordenesPendientes || 0,
          mesasOcupadas: mesasOcupadas || 0,
          gastosMes: totalGastos,
        });
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <main className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <KpiCard
            title="Ventas de Hoy"
            value={formatCLP(kpis.ventasHoy)}
            icon="💰"
          />
          <KpiCard
            title="Órdenes Pendientes"
            value={kpis.ordenesPendientes}
            icon="📋"
          />
          <KpiCard
            title="Mesas Ocupadas"
            value={kpis.mesasOcupadas}
            icon="🪑"
          />
          <KpiCard
            title="Gastos del Mes"
            value={formatCLP(kpis.gastosMes)}
            icon="💸"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Accesos Rápidos</h2>
            <div className="space-y-2 sm:space-y-3">
              <a
                href="/admin/mesas"
                className="block p-3 sm:p-4 border border-slate-200 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">🪑</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base">Mesas (POS)</div>
                    <div className="text-xs sm:text-sm text-slate-600">Gestionar mesas y crear órdenes</div>
                  </div>
                </div>
              </a>
              <a
                href="/admin/stock"
                className="block p-3 sm:p-4 border border-slate-200 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">📦</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base">Gestión de Stock</div>
                    <div className="text-xs sm:text-sm text-slate-600">Ver y ajustar inventario</div>
                  </div>
                </div>
              </a>
              <a
                href="/admin/ingredientes"
                className="block p-3 sm:p-4 border border-slate-200 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">🥕</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base">Ingredientes</div>
                    <div className="text-xs sm:text-sm text-slate-600">Administrar ingredientes</div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Órdenes Recientes</h2>
            <div className="text-xs sm:text-sm text-slate-600">
              Las órdenes recientes aparecerán aquí
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

