import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import KpiCard from './components/KpiCard';
import { formatCLP } from '@/frontend/utils/currency';
import { obtenerEstadisticasPropinas } from '@/backend/services/tips.service';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    ventasHoy: 0,
    ordenesPendientes: 0,
    mesasOcupadas: 0,
    gastosMes: 0,
  });
  const [stockBajo, setStockBajo] = useState<Array<{
    id: string;
    nombre: string;
    stock_actual: number;
    stock_minimo: number;
    unidad_medida: string;
  }>>([]);
  const [propinasStats, setPropinasStats] = useState<{
    total: number;
    porEmpleado: Array<{ empleado: any; total: number }>;
    periodo: string;
  } | null>(null);
  const [periodoPropinas, setPeriodoPropinas] = useState<'semana' | 'quincena' | 'mes'>('semana');

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

        // Verificar stock bajo
        const { data: ingredientes, error: errorStock } = await supabase
          .from('ingredientes')
          .select('id, nombre, stock_actual, stock_minimo, unidad_medida')
          .not('stock_minimo', 'is', null);

        if (errorStock) {
          console.error('Error cargando stock:', errorStock);
        } else {
          // Filtrar ingredientes con stock bajo (stock_actual <= stock_minimo)
          const stockBajoList = ingredientes?.filter(
            (ing) => ing.stock_actual <= ing.stock_minimo
          ) || [];
          setStockBajo(stockBajoList);
        }

        setKpis({
          ventasHoy,
          ordenesPendientes: ordenesPendientes || 0,
          mesasOcupadas: mesasOcupadas || 0,
          gastosMes: totalGastos,
        });

        // Cargar estadísticas de propinas
        try {
          const stats = await obtenerEstadisticasPropinas(periodoPropinas);
          setPropinasStats(stats);
        } catch (error) {
          console.error('Error cargando estadísticas de propinas:', error);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [periodoPropinas]);

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

        {/* KPIs de Propinas */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Propinas</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriodoPropinas('semana')}
                className={`px-3 py-1 text-xs sm:text-sm rounded ${
                  periodoPropinas === 'semana'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setPeriodoPropinas('quincena')}
                className={`px-3 py-1 text-xs sm:text-sm rounded ${
                  periodoPropinas === 'quincena'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Quincena
              </button>
              <button
                onClick={() => setPeriodoPropinas('mes')}
                className={`px-3 py-1 text-xs sm:text-sm rounded ${
                  periodoPropinas === 'mes'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Mes
              </button>
            </div>
          </div>

          <div className="mb-4">
            <KpiCard
              title={`Propinas Total (${periodoPropinas})`}
              value={formatCLP(propinasStats?.total || 0)}
              icon="💵"
            />
          </div>

          {propinasStats && propinasStats.porEmpleado.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Distribución por Empleado
              </h3>
              <div className="space-y-2">
                {propinasStats.porEmpleado.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-slate-900">
                        {item.empleado?.nombre || 'Sin nombre'}
                      </div>
                      <div className="text-xs text-slate-600">
                        {item.empleado?.funcion || 'Sin función'}
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-slate-900">
                      {formatCLP(item.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 text-center py-4">
              No hay propinas registradas para este período
            </div>
          )}
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
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Alertas de Stock
              {stockBajo.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                  {stockBajo.length}
                </span>
              )}
            </h2>
            {stockBajo.length === 0 ? (
              <div className="text-xs sm:text-sm text-green-600">
                ✅ Todo el stock está en niveles adecuados
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stockBajo.map((ing) => (
                  <div
                    key={ing.id}
                    className="p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-yellow-900">
                          ⚠️ {ing.nombre}
                        </div>
                        <div className="text-xs text-yellow-700 mt-1">
                          Stock: {ing.stock_actual} {ing.unidad_medida} / Mínimo: {ing.stock_minimo} {ing.unidad_medida}
                        </div>
                      </div>
                      <a
                        href="/admin/stock"
                        className="ml-2 text-xs text-yellow-800 hover:text-yellow-900 underline flex-shrink-0"
                      >
                        Ver
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

