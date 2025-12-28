import { supabase } from './supabase';

/**
 * Calcula y distribuye propinas entre empleados que tienen propina habilitada
 * @param propinaTotal - Monto total de propina a distribuir
 * @param ordenId - ID de la orden
 * @returns Promise con el resultado de la distribución
 */
export async function distribuirPropinas(propinaTotal: number, ordenId: string): Promise<void> {
  if (propinaTotal <= 0) {
    return; // No hay propina para distribuir
  }

  try {
    // Obtener todos los empleados activos con propina habilitada
    const { data: empleados, error: errorEmpleados } = await supabase
      .from('empleados')
      .select('id')
      .eq('activo', true)
      .eq('propina_habilitada', true);

    if (errorEmpleados) {
      console.error('Error obteniendo empleados:', errorEmpleados);
      throw errorEmpleados;
    }

    if (!empleados || empleados.length === 0) {
      console.log('No hay empleados con propina habilitada');
      return; // No hay empleados para distribuir
    }

    // Calcular monto por empleado (distribución equitativa)
    const montoPorEmpleado = propinaTotal / empleados.length;

    // Obtener fecha actual para calcular período
    const ahora = new Date();
    const periodoAnio = ahora.getFullYear();
    const periodoMes = ahora.getMonth() + 1;
    
    // Calcular semana del año
    const inicioAnio = new Date(periodoAnio, 0, 1);
    const diasTranscurridos = Math.floor((ahora.getTime() - inicioAnio.getTime()) / (24 * 60 * 60 * 1000));
    const periodoSemana = Math.ceil((diasTranscurridos + inicioAnio.getDay() + 1) / 7);

    // Crear registros de distribución para cada empleado
    const distribuciones = empleados.map(empleado => ({
      empleado_id: empleado.id,
      orden_id: ordenId,
      monto: montoPorEmpleado,
      periodo_semana: periodoSemana,
      periodo_mes: periodoMes,
      periodo_anio: periodoAnio,
    }));

    // Insertar todas las distribuciones
    const { error: errorDistribucion } = await supabase
      .from('propinas_distribucion')
      .insert(distribuciones);

    if (errorDistribucion) {
      console.error('Error distribuyendo propinas:', errorDistribucion);
      throw errorDistribucion;
    }
  } catch (error) {
    console.error('Error en distribución de propinas:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de propinas por período
 * @param periodo - 'semana', 'quincena' o 'mes'
 * @returns Promise con estadísticas de propinas
 */
export async function obtenerEstadisticasPropinas(periodo: 'semana' | 'quincena' | 'mes' = 'semana') {
  try {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = ahora.getMonth() + 1;
    
    // Calcular semana del año
    const inicioAnio = new Date(anio, 0, 1);
    const diasTranscurridos = Math.floor((ahora.getTime() - inicioAnio.getTime()) / (24 * 60 * 60 * 1000));
    const semana = Math.ceil((diasTranscurridos + inicioAnio.getDay() + 1) / 7);

    let query = supabase
      .from('propinas_distribucion')
      .select(`
        id,
        monto,
        empleado_id,
        empleados (
          id,
          nombre,
          funcion
        )
      `)
      .eq('periodo_anio', anio);

    if (periodo === 'semana') {
      query = query.eq('periodo_semana', semana);
    } else if (periodo === 'mes') {
      query = query.eq('periodo_mes', mes);
    } else if (periodo === 'quincena') {
      // Quincena: primeras dos semanas o últimas dos semanas del mes
      const dia = ahora.getDate();
      const esPrimeraQuincena = dia <= 15;
      // Para simplificar, usamos las primeras dos semanas o las últimas dos semanas
      // Esto es una aproximación
      if (esPrimeraQuincena) {
        query = query.eq('periodo_mes', mes).lte('periodo_semana', 2);
      } else {
        query = query.eq('periodo_mes', mes).gt('periodo_semana', 2);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo estadísticas de propinas:', error);
      throw error;
    }

    // Agrupar por empleado
    const porEmpleado: Record<string, {
      empleado: any;
      total: number;
    }> = {};

    data?.forEach((item: any) => {
      const empleadoId = item.empleado_id;
      if (!porEmpleado[empleadoId]) {
        porEmpleado[empleadoId] = {
          empleado: item.empleados,
          total: 0,
        };
      }
      porEmpleado[empleadoId].total += item.monto || 0;
    });

    // Calcular total general
    const totalGeneral = data?.reduce((sum, item) => sum + (item.monto || 0), 0) || 0;

    return {
      total: totalGeneral,
      porEmpleado: Object.values(porEmpleado),
      periodo,
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
}






