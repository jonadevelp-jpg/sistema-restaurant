import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import KpiCard from './KpiCard';
import { formatCLP } from '@/frontend/utils/currency';
import { obtenerEstadisticasPropinas } from '@/backend/services/tips.service';
import type { TipoPedido } from '@/@types';

interface VentasPorItem {
  nombre: string;
  categoria: string;
  cantidad: number;
  total: number;
}

interface OrdenHistorial {
  id: string;
  numero_orden: string;
  estado: string;
  total: number;
  metodo_pago?: string;
  created_at: string;
  paid_at?: string;
  mesa_id?: string;
  tipo_pedido?: string;
  mesas?: { numero: number };
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    ventasHoy: 0,
    ordenesPendientes: 0,
    ventasMes: 0,
    productosStockBajo: 0,
  });
  const [ventasPorItem, setVentasPorItem] = useState<VentasPorItem[]>([]);
  const [stockBajo, setStockBajo] = useState<Array<{
    id: string;
    nombre: string;
    stock_actual: number;
    stock_minimo: number;
    unidad_medida: string;
    tipo?: string;
  }>>([]);
  const [propinasStats, setPropinasStats] = useState<{
    total: number;
    porEmpleado: Array<{ empleado: any; total: number }>;
    periodo: string;
  } | null>(null);
  const [periodoPropinas, setPeriodoPropinas] = useState<'semana' | 'quincena' | 'mes'>('semana');
  const [showNuevaOrdenModal, setShowNuevaOrdenModal] = useState(false);
  const [tipoPedidoSeleccionado, setTipoPedidoSeleccionado] = useState<TipoPedido>(null);
  
  // Visibilidad de KPIs de ventas (seguridad) - Por defecto ocultos
  const [mostrarVentasHoy, setMostrarVentasHoy] = useState(false);
  const [mostrarVentasMes, setMostrarVentasMes] = useState(false);
  
  // Historial de órdenes
  const [ordenesHistorial, setOrdenesHistorial] = useState<OrdenHistorial[]>([]);
  const [totalVentasHistorial, setTotalVentasHistorial] = useState<number>(0);
  const [filtroHistorial, setFiltroHistorial] = useState<'dia' | 'ayer' | 'semana' | 'mes' | 'rango'>('dia');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [periodoPropinas, filtroHistorial, fechaInicio, fechaFin]);

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

      // Ventas del mes
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const { data: ordenesMes, error: errorVentasMes } = await supabase
        .from('ordenes_restaurante')
        .select('total')
        .eq('estado', 'paid')
        .gte('created_at', inicioMes.toISOString());

      if (errorVentasMes) console.error('Error cargando ventas del mes:', errorVentasMes);
      const ventasMes = ordenesMes?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      // Órdenes pendientes
      const { count: ordenesPendientes, error: errorPendientes } = await supabase
        .from('ordenes_restaurante')
        .select('*', { count: 'exact', head: true })
        .in('estado', ['pending', 'preparing', 'ready']);

      if (errorPendientes) {
        console.error('Error cargando órdenes pendientes:', errorPendientes);
      }

      // Cargar ventas por item del día
      await loadVentasPorItem(hoy);

      // Verificar stock bajo (ingredientes y stock_panes_bebidas)
      await loadStockBajo();

      setKpis({
        ventasHoy,
        ordenesPendientes: ordenesPendientes || 0,
        ventasMes,
        productosStockBajo: stockBajo.length,
      });

      // Cargar historial de órdenes
      await loadHistorialOrdenes();

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

  async function loadVentasPorItem(fechaInicio: Date) {
    try {
      // Obtener todas las órdenes pagadas del día
      const { data: ordenes, error: errorOrdenes } = await supabase
        .from('ordenes_restaurante')
        .select('id')
        .eq('estado', 'paid')
        .gte('created_at', fechaInicio.toISOString());

      if (errorOrdenes || !ordenes || ordenes.length === 0) {
        setVentasPorItem([]);
        return;
      }

      const ordenIds = ordenes.map(o => o.id);

      // Obtener items de las órdenes con información del menú
      const { data: items, error: errorItems } = await supabase
        .from('orden_items')
        .select(`
          cantidad,
          subtotal,
          menu_items (
            id,
            name,
            categories (
              id,
              slug,
              name
            )
          )
        `)
        .in('orden_id', ordenIds);

      if (errorItems) {
        console.error('Error cargando items:', errorItems);
        setVentasPorItem([]);
        return;
      }

      // Agrupar por item y categoría
      const ventasMap = new Map<string, VentasPorItem>();

      items?.forEach((item: any) => {
        const menuItem = item.menu_items;
        if (!menuItem) return;

        const categoria = menuItem.categories?.slug || menuItem.categories?.name || 'Otros';
        const nombre = menuItem.name;
        const key = `${nombre}_${categoria}`;

        if (ventasMap.has(key)) {
          const existente = ventasMap.get(key)!;
          existente.cantidad += item.cantidad;
          existente.total += item.subtotal;
        } else {
          ventasMap.set(key, {
            nombre,
            categoria,
            cantidad: item.cantidad,
            total: item.subtotal,
          });
        }
      });

      // Convertir a array y ordenar: primero comida, luego bebidas, luego por cantidad
      const ventasArray = Array.from(ventasMap.values()).sort((a, b) => {
        // Definir prioridad de categorías (comida primero, luego bebidas)
        const getPrioridad = (categoria: string): number => {
          const cat = categoria.toLowerCase();
          if (cat === 'completos' || cat === 'sandwiches' || cat === 'pollo' || cat === 'acompanamientos' || cat === 'destacados') {
            return 1; // Comida primero
          } else if (cat === 'bebidas' || cat === 'bebestibles') {
            return 2; // Bebidas después
          }
          return 3; // Otros al final
        };

        const prioridadA = getPrioridad(a.categoria);
        const prioridadB = getPrioridad(b.categoria);

        // Si tienen diferente prioridad, ordenar por prioridad
        if (prioridadA !== prioridadB) {
          return prioridadA - prioridadB;
        }

        // Si tienen la misma prioridad, ordenar por cantidad (mayor primero)
        return b.cantidad - a.cantidad;
      });
      setVentasPorItem(ventasArray);
    } catch (error) {
      console.error('Error cargando ventas por item:', error);
      setVentasPorItem([]);
    }
  }

  async function loadStockBajo() {
    try {
      // Stock de ingredientes
      const { data: ingredientes, error: errorIngredientes } = await supabase
        .from('ingredientes')
        .select('id, nombre, stock_actual, stock_minimo, unidad_medida')
        .not('stock_minimo', 'is', null);

      const stockBajoList: Array<{
        id: string;
        nombre: string;
        stock_actual: number;
        stock_minimo: number;
        unidad_medida: string;
        tipo?: string;
      }> = [];

      if (!errorIngredientes && ingredientes) {
        ingredientes
          .filter((ing) => ing.stock_actual <= ing.stock_minimo)
          .forEach((ing) => {
            stockBajoList.push({
              id: ing.id,
              nombre: ing.nombre,
              stock_actual: ing.stock_actual,
              stock_minimo: ing.stock_minimo,
              unidad_medida: ing.unidad_medida,
              tipo: 'ingrediente',
            });
          });
      }

      // Stock de panes y bebidas
      try {
        const { data: stockPanesBebidas, error: errorStockPB } = await supabase
          .from('stock_panes_bebidas')
          .select('id, nombre, cantidad, stock_minimo, unidad_medida, tipo')
          .not('stock_minimo', 'is', null);

        if (!errorStockPB && stockPanesBebidas) {
          stockPanesBebidas
            .filter((item) => item.cantidad <= item.stock_minimo)
            .forEach((item) => {
              stockBajoList.push({
                id: item.id,
                nombre: item.nombre,
                stock_actual: item.cantidad,
                stock_minimo: item.stock_minimo,
                unidad_medida: item.unidad_medida,
                tipo: item.tipo,
              });
            });
        }
      } catch (error) {
        // Tabla puede no existir, ignorar
        console.log('Tabla stock_panes_bebidas no disponible');
      }

      setStockBajo(stockBajoList);
    } catch (error) {
      console.error('Error cargando stock bajo:', error);
      setStockBajo([]);
    }
  }

  async function loadHistorialOrdenes() {
    try {
      let query = supabase
        .from('ordenes_restaurante')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (filtroHistorial === 'dia') {
        query = query.gte('created_at', hoy.toISOString());
      } else if (filtroHistorial === 'ayer') {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        ayer.setHours(0, 0, 0, 0);
        const finAyer = new Date(ayer);
        finAyer.setHours(23, 59, 59, 999);
        query = query.gte('created_at', ayer.toISOString()).lte('created_at', finAyer.toISOString());
      } else if (filtroHistorial === 'semana') {
        const semana = new Date();
        semana.setDate(semana.getDate() - 7);
        query = query.gte('created_at', semana.toISOString());
      } else if (filtroHistorial === 'mes') {
        const mes = new Date();
        mes.setDate(1);
        mes.setHours(0, 0, 0, 0);
        query = query.gte('created_at', mes.toISOString());
      } else if (filtroHistorial === 'rango' && fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        query = query.gte('created_at', inicio.toISOString()).lte('created_at', fin.toISOString());
      }

      const { data: ordenesData, error: ordenesError } = await query;

      if (ordenesError) throw ordenesError;

      // Calcular total de ventas (solo órdenes pagadas)
      const totalVentas = ordenesData
        ?.filter((o: any) => o.estado === 'paid')
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0;
      setTotalVentasHistorial(totalVentas);

      // Obtener información de mesas por separado
      const mesaIds = ordenesData?.filter(o => o.mesa_id).map(o => o.mesa_id) || [];
      const mesasMap = new Map();

      if (mesaIds.length > 0) {
        const { data: mesasData } = await supabase
          .from('mesas')
          .select('id, numero')
          .in('id', mesaIds);

        if (mesasData) {
          mesasData.forEach((mesa: any) => {
            mesasMap.set(mesa.id, mesa);
          });
        }
      }

      const ordenesConMesas = ordenesData?.map((orden: any) => ({
        ...orden,
        mesas: orden.mesa_id ? mesasMap.get(orden.mesa_id) : null,
      })) || [];

      setOrdenesHistorial(ordenesConMesas);
    } catch (error) {
      console.error('Error cargando historial de órdenes:', error);
      setOrdenesHistorial([]);
      setTotalVentasHistorial(0);
    }
  }

  async function crearNuevaOrden(tipoPedido: TipoPedido) {
    try {
      console.log('🔄 Creando nueva orden desde Dashboard, tipo:', tipoPedido);
      
      setShowNuevaOrdenModal(false);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Error de autenticación:', authError);
        alert('❌ No estás autenticado. Por favor, inicia sesión nuevamente.');
        return;
      }

      const timestamp = Date.now();
      const numeroOrden = tipoPedido === 'llevar' 
        ? `TAKE-${timestamp}` 
        : `ORD-${timestamp}`;

      const ordenData = {
        numero_orden: numeroOrden,
        tipo_pedido: tipoPedido,
        mesa_id: null,
        mesero_id: user.id,
        estado: 'pending',
        total: 0,
      };

      const { data: orden, error: insertError } = await supabase
        .from('ordenes_restaurante')
        .insert(ordenData)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error insertando orden:', insertError);
        alert(`❌ Error creando orden: ${insertError.message}`);
        return;
      }

      if (!orden) {
        alert('❌ Error: La orden se creó pero no se recibió la respuesta.');
        return;
      }

      window.location.href = `/admin/ordenes/${orden.id}`;
    } catch (error: any) {
      console.error('❌ Error inesperado creando orden:', error);
      alert(`❌ Error inesperado: ${error.message || 'Error desconocido'}`);
    }
  }

  function getCategoriaNombre(slug: string): string {
    const nombres: Record<string, string> = {
      'completos': 'Completos',
      'sandwiches': 'Sandwiches',
      'bebidas': 'Bebidas',
      'bebestibles': 'Bebidas',
      'acompanamientos': 'Acompañamientos',
      'pollo': 'Pollo',
      'destacados': 'Destacados',
    };
    return nombres[slug] || slug;
  }

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
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* Ventas de Hoy con ojo */}
          <div 
            className="bg-white rounded-2xl p-6 relative"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-slate-500 mb-2 font-medium font-sans flex items-center gap-2">
                  Ventas de Hoy
                  <button
                    onClick={() => setMostrarVentasHoy(!mostrarVentasHoy)}
                    className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={mostrarVentasHoy ? 'Ocultar ventas' : 'Mostrar ventas'}
                    title={mostrarVentasHoy ? 'Clic para ocultar' : 'Clic para mostrar'}
                  >
                    {mostrarVentasHoy ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="text-3xl font-bold text-slate-900 font-sans tracking-tight">
                  {mostrarVentasHoy ? formatCLP(kpis.ventasHoy) : '******'}
                </div>
              </div>
              <div 
                className="text-4xl opacity-40"
                style={{ filter: 'grayscale(20%)' }}
              >
                💰
              </div>
            </div>
          </div>
          
          <KpiCard
            title="Órdenes Pendientes"
            value={kpis.ordenesPendientes}
            icon="📋"
          />
          
          {/* Ventas del Mes con ojo */}
          <div 
            className="bg-white rounded-2xl p-6 relative"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-slate-500 mb-2 font-medium font-sans flex items-center gap-2">
                  Ventas del Mes
                  <button
                    onClick={() => setMostrarVentasMes(!mostrarVentasMes)}
                    className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={mostrarVentasMes ? 'Ocultar ventas' : 'Mostrar ventas'}
                    title={mostrarVentasMes ? 'Clic para ocultar' : 'Clic para mostrar'}
                  >
                    {mostrarVentasMes ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="text-3xl font-bold text-slate-900 font-sans tracking-tight">
                  {mostrarVentasMes ? formatCLP(kpis.ventasMes) : '******'}
                </div>
              </div>
              <div 
                className="text-4xl opacity-40"
                style={{ filter: 'grayscale(20%)' }}
              >
                📊
              </div>
            </div>
          </div>
          
          <KpiCard
            title="Productos Stock Bajo"
            value={kpis.productosStockBajo}
            icon="⚠️"
          />
        </div>

        {/* Ventas por Item del Día */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-4">📈 Ventas del Día por Item</h2>
          {ventasPorItem.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-4">
              No hay ventas registradas hoy
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-2 font-semibold">Item</th>
                    <th className="text-left p-2 font-semibold">Categoría</th>
                    <th className="text-right p-2 font-semibold">Cantidad</th>
                    <th className="text-right p-2 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasPorItem.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-2">{item.nombre}</td>
                      <td className="p-2 text-slate-600">{getCategoriaNombre(item.categoria)}</td>
                      <td className="p-2 text-right font-semibold">{item.cantidad}</td>
                      <td className="p-2 text-right font-semibold">{formatCLP(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Historial de Órdenes */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-2">📋 Historial de Órdenes</h2>
              <div className="text-sm font-semibold text-green-700">
                Total Ventas: {formatCLP(totalVentasHistorial)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroHistorial('dia')}
                className={`px-3 py-1 text-xs sm:text-sm rounded ${
                  filtroHistorial === 'dia'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setFiltroHistorial('ayer')}
                className={`px-3 py-1 text-xs sm:text-sm rounded ${
                  filtroHistorial === 'ayer'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Ayer
              </button>
              <button
                onClick={() => setFiltroHistorial('semana')}
                className={`px-3 py-1 text-xs sm:text-sm rounded ${
                  filtroHistorial === 'semana'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setFiltroHistorial('mes')}
                className={`px-3 py-1 text-xs sm:text-sm rounded ${
                  filtroHistorial === 'mes'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setFiltroHistorial('rango')}
                className={`px-3 py-1 text-xs sm:text-sm rounded ${
                  filtroHistorial === 'rango'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Rango
              </button>
            </div>
          </div>

          {filtroHistorial === 'rango' && (
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded text-sm"
              />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded text-sm"
              />
            </div>
          )}

          {ordenesHistorial.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-4">
              No hay órdenes en el período seleccionado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-2 font-semibold">Orden</th>
                    <th className="text-left p-2 font-semibold">Fecha</th>
                    <th className="text-left p-2 font-semibold">Mesa/Tipo</th>
                    <th className="text-left p-2 font-semibold">Estado</th>
                    <th className="text-right p-2 font-semibold">Total</th>
                    <th className="text-left p-2 font-semibold">Pago</th>
                    <th className="text-left p-2 font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesHistorial.map((orden) => (
                    <tr key={orden.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-2 font-medium">{orden.numero_orden}</td>
                      <td className="p-2 text-slate-600">
                        {new Date(orden.created_at).toLocaleDateString('es-CL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-2 text-slate-600">
                        {orden.mesas?.numero 
                          ? `Mesa ${orden.mesas.numero}`
                          : orden.tipo_pedido === 'barra'
                          ? 'Barra'
                          : orden.tipo_pedido === 'llevar'
                          ? 'Para Llevar'
                          : '-'}
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          orden.estado === 'paid' ? 'bg-green-100 text-green-800' :
                          orden.estado === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          orden.estado === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          orden.estado === 'ready' ? 'bg-purple-100 text-purple-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {orden.estado}
                        </span>
                      </td>
                      <td className="p-2 text-right font-semibold">{formatCLP(orden.total)}</td>
                      <td className="p-2 text-slate-600">{orden.metodo_pago || '-'}</td>
                      <td className="p-2">
                        <a
                          href={`/admin/ordenes/${orden.id}`}
                          className="text-blue-600 hover:text-blue-800 underline text-xs"
                        >
                          Ver
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sección de Creación Rápida de Pedidos */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-4">🚀 Crear Pedido Rápido</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button
              onClick={() => {
                setTipoPedidoSeleccionado('barra');
                setShowNuevaOrdenModal(true);
              }}
              className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left group"
            >
              <span className="text-2xl sm:text-3xl">🪑</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base text-blue-900">Nueva Orden Barra</div>
                <div className="text-xs sm:text-sm text-blue-600">Consumir en el local</div>
              </div>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button
              onClick={() => {
                setTipoPedidoSeleccionado('llevar');
                setShowNuevaOrdenModal(true);
              }}
              className="flex items-center gap-3 p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 text-left group"
            >
              <span className="text-2xl sm:text-3xl">📦</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base text-orange-900">Nueva Orden Para Llevar</div>
                <div className="text-xs sm:text-sm text-orange-600">Para llevar</div>
              </div>
              <span className="text-orange-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <a
              href="/admin/pedidos"
              className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 text-left group"
            >
              <span className="text-2xl sm:text-3xl">🪑</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base text-slate-900">Gestionar Pedidos</div>
                <div className="text-xs sm:text-sm text-slate-600">Ver y crear órdenes</div>
              </div>
              <span className="text-slate-600 group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
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
                href="/admin/pedidos"
                className="block p-3 sm:p-4 border border-slate-200 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">🛒</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base">Pedidos (POS)</div>
                    <div className="text-xs sm:text-sm text-slate-600">Gestionar y crear órdenes</div>
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
                {stockBajo.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-yellow-900">
                          ⚠️ {item.nombre}
                          {item.tipo && (
                            <span className="ml-2 text-xs text-yellow-700">({item.tipo})</span>
                          )}
                        </div>
                        <div className="text-xs text-yellow-700 mt-1">
                          Stock: {item.stock_actual} {item.unidad_medida} / Mínimo: {item.stock_minimo} {item.unidad_medida}
                        </div>
                      </div>
                      <a
                        href={item.tipo === 'pan' || item.tipo === 'bebida' ? "/admin/stock-panes-bebidas" : "/admin/stock"}
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

      {/* Modal para crear nueva orden */}
      {showNuevaOrdenModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            setShowNuevaOrdenModal(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="nueva-orden-title"
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h2 id="nueva-orden-title" className="text-2xl font-bold mb-4 text-slate-900 font-sans">
              Crear Nueva Orden
            </h2>
            <p className="text-base text-slate-600 mb-8 font-sans">
              ¿Deseas crear una nueva orden{' '}
              {tipoPedidoSeleccionado === 'llevar' ? 'para llevar' : 'para consumir en barra'}?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowNuevaOrdenModal(false);
                  setTipoPedidoSeleccionado(null);
                }}
                aria-label="Cancelar creación de orden"
                className="flex-1 min-h-[48px] px-6 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 active:scale-[0.98] text-base font-semibold font-sans transition-all duration-200 cursor-pointer"
                style={{
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (tipoPedidoSeleccionado) {
                    await crearNuevaOrden(tipoPedidoSeleccionado);
                  } else {
                    alert('❌ Error: No se seleccionó un tipo de pedido');
                  }
                }}
                aria-label={`Crear orden ${tipoPedidoSeleccionado === 'llevar' ? 'para llevar' : 'en barra'}`}
                className={`flex-1 min-h-[48px] px-6 py-3 text-white rounded-xl text-base font-bold font-sans active:scale-[0.98] transition-all duration-200 cursor-pointer ${
                  tipoPedidoSeleccionado === 'llevar'
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                style={{
                  boxShadow: tipoPedidoSeleccionado === 'llevar'
                    ? '0 4px 12px rgba(249, 115, 22, 0.3), 0 2px 4px rgba(249, 115, 22, 0.2)'
                    : '0 4px 12px rgba(37, 99, 235, 0.3), 0 2px 4px rgba(37, 99, 235, 0.2)',
                }}
                type="button"
              >
                Crear Orden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
