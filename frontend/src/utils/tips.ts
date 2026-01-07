/**
 * Utilidades para distribución de propinas
 */

import { supabase } from '../../src/lib/supabase';

/**
 * Calcula y distribuye propinas entre empleados que tienen propina habilitada
 */
export async function distribuirPropinas(propinaTotal: number, ordenId: string): Promise<void> {
  if (propinaTotal <= 0) {
    return;
  }

  try {
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
      return;
    }

    const montoPorEmpleado = propinaTotal / empleados.length;
    const ahora = new Date();
    const periodoAnio = ahora.getFullYear();
    const periodoMes = ahora.getMonth() + 1;
    
    const inicioAnio = new Date(periodoAnio, 0, 1);
    const diasTranscurridos = Math.floor((ahora.getTime() - inicioAnio.getTime()) / (24 * 60 * 60 * 1000));
    const periodoSemana = Math.ceil((diasTranscurridos + inicioAnio.getDay() + 1) / 7);

    const distribuciones = empleados.map(empleado => ({
      empleado_id: empleado.id,
      orden_id: ordenId,
      monto: montoPorEmpleado,
      periodo_semana: periodoSemana,
      periodo_mes: periodoMes,
      periodo_anio: periodoAnio,
    }));

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




