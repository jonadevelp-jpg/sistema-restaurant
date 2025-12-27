import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import KpiCard from './components/KpiCard';
import { formatCLP } from '@/utils/currency';
import { obtenerEstadisticasPropinas } from '@/utils/tips';

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
        <div 
          className="bg-white rounded-2xl p-6 mb-8"
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900 font-sans">Propinas</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriodoPropinas('semana')}
                className={`px-4 py-2 text-sm rounded-xl font-medium font-sans transition-all duration-200 ${
                  periodoPropinas === 'semana'
                    ? 'bg-slate-900 text-white'
                    : 'bg-warm-100 text-slate-700 hover:bg-warm-200'
                }`}
                style={
                  periodoPropinas === 'semana'
                    ? { boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)' }
                    : {}
                }
              >
                Semana
              </button>
              <button
                onClick={() => setPeriodoPropinas('quincena')}
                className={`px-4 py-2 text-sm rounded-xl font-medium font-sans transition-all duration-200 ${
                  periodoPropinas === 'quincena'
                    ? 'bg-slate-900 text-white'
                    : 'bg-warm-100 text-slate-700 hover:bg-warm-200'
                }`}
                style={
                  periodoPropinas === 'quincena'
                    ? { boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)' }
                    : {}
                }
              >
                Quincena
              </button>
              <button
                onClick={() => setPeriodoPropinas('mes')}
                className={`px-4 py-2 text-sm rounded-xl font-medium font-sans transition-all duration-200 ${
                  periodoPropinas === 'mes'
                    ? 'bg-slate-900 text-white'
                    : 'bg-warm-100 text-slate-700 hover:bg-warm-200'
                }`}
                style={
                  periodoPropinas === 'mes'
                    ? { boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)' }
                    : {}
                }
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
              <div className="space-y-3">
                {propinasStats.porEmpleado.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-warm-50 rounded-xl"
                    style={{
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <div>
                      <div className="font-semibold text-slate-900 font-sans">
                        {item.empleado?.nombre || 'Sin nombre'}
                      </div>
                      <div className="text-sm text-slate-600 font-sans mt-1">
                        {item.empleado?.funcion || 'Sin función'}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-slate-900 font-sans">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            className="bg-white rounded-2xl p-6"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <h2 className="text-lg font-bold text-slate-900 mb-6 font-sans">Accesos Rápidos</h2>
            <div className="space-y-3">
              <a
                href="/admin/mesas"
                className="block p-4 rounded-xl hover:bg-warm-50 transition-all duration-200 group"
                style={{
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🪑</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base text-slate-900 font-sans">Pedidos (POS)</div>
                    <div className="text-sm text-slate-600 font-sans mt-1">Gestionar pedidos y crear órdenes</div>
                  </div>
                </div>
              </a>
              <a
                href="/admin/stock"
                className="block p-4 rounded-xl hover:bg-warm-50 transition-all duration-200 group"
                style={{
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">📦</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base text-slate-900 font-sans">Gestión de Stock</div>
                    <div className="text-sm text-slate-600 font-sans mt-1">Ver y ajustar inventario</div>
                  </div>
                </div>
              </a>
              <a
                href="/admin/ingredientes"
                className="block p-4 rounded-xl hover:bg-warm-50 transition-all duration-200 group"
                style={{
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🥕</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base text-slate-900 font-sans">Ingredientes</div>
                    <div className="text-sm text-slate-600 font-sans mt-1">Administrar ingredientes</div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div 
            className="bg-white rounded-2xl p-6"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <h2 className="text-lg font-bold text-slate-900 mb-6 font-sans">
              Alertas de Stock
              {stockBajo.length > 0 && (
                <span 
                  className="ml-2 px-3 py-1 bg-tomato-50 text-tomato-700 rounded-full text-xs font-semibold"
                  style={{
                    boxShadow: '0 1px 3px rgba(255, 68, 68, 0.2)',
                  }}
                >
                  {stockBajo.length}
                </span>
              )}
            </h2>
            {stockBajo.length === 0 ? (
              <div className="text-sm text-green-600 font-sans">
                ✅ Todo el stock está en niveles adecuados
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stockBajo.map((ing) => (
                  <div
                    key={ing.id}
                    className="p-4 bg-orange-50 rounded-xl border border-orange-100"
                    style={{
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-orange-900 font-sans">
                          ⚠️ {ing.nombre}
                        </div>
                        <div className="text-xs text-orange-700 mt-1 font-sans">
                          Stock: {ing.stock_actual} {ing.unidad_medida} / Mínimo: {ing.stock_minimo} {ing.unidad_medida}
                        </div>
                      </div>
                      <a
                        href="/admin/stock"
                        className="ml-2 text-xs text-orange-700 hover:text-orange-900 underline flex-shrink-0 font-medium font-sans"
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

