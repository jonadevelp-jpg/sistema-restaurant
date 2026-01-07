import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCLP } from '@/frontend/utils/currency';
import { distribuirPropinas } from '@/backend/services/tips.service';
import ComandaCocina from './ComandaCocina';
import BoletaCliente from './BoletaCliente';
import ItemPersonalizationModal from './ItemPersonalizationModal';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  category_id?: number;
}

interface OrdenItem {
  id?: string;
  menu_item_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas?: string;
  menu_item?: MenuItem;
}

interface Orden {
  id: string;
  numero_orden: string;
  mesa_id: string;
  estado: string;
  total: number;
  nota?: string;
}

interface OrdenFormProps {
  ordenId: string;
}

export default function OrdenForm({ ordenId }: OrdenFormProps) {
  const [orden, setOrden] = useState<Orden | null>(null);
  const [items, setItems] = useState<OrdenItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [showCategories, setShowCategories] = useState(true); // Mostrar categorías o items
  const [searchQuery, setSearchQuery] = useState<string>(''); // Búsqueda de items
  const [showComanda, setShowComanda] = useState(false);
  const [showBoleta, setShowBoleta] = useState(false);
  const [mesaInfo, setMesaInfo] = useState<{ numero: number } | null>(null);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedItemToEdit, setSelectedItemToEdit] = useState<OrdenItem | null>(null);

  useEffect(() => {
    if (ordenId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [ordenId]);

  // Reiniciar estado a "pending" cuando se eliminan todos los items
  useEffect(() => {
    if (items.length === 0 && orden && orden.estado !== 'pending' && orden.estado !== 'paid') {
      console.log('[OrdenForm] Detectado: orden sin items pero con estado avanzado - reiniciando a "pending"');
      supabase
        .from('ordenes_restaurante')
        .update({ estado: 'pending' })
        .eq('id', ordenId)
        .then(() => {
          loadData();
        })
        .catch((error) => {
          console.error('[OrdenForm] Error reiniciando estado:', error);
        });
    }
  }, [items.length, orden?.estado, ordenId]);

  async function loadData() {
    if (!ordenId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Cargar orden
      const { data: ordenData, error: ordenError } = await supabase
        .from('ordenes_restaurante')
        .select('*')
        .eq('id', ordenId)
        .single();

      if (ordenError) {
        console.error('Error cargando orden:', ordenError);
        setLoading(false);
        return;
      }

      if (!ordenData) {
        setLoading(false);
        return;
      }

      setOrden(ordenData);
      
      // Cargar información de mesa por separado si existe mesa_id
      if (ordenData.mesa_id) {
        const { data: mesaData } = await supabase
          .from('mesas')
          .select('numero')
          .eq('id', ordenData.mesa_id)
          .single();
        
        if (mesaData) {
          setMesaInfo(mesaData);
        }
      } else {
        setMesaInfo(null);
      }

      // Cargar items de la orden
      const { data: itemsData, error: itemsError } = await supabase
        .from('orden_items')
        .select('*, menu_items(*)')
        .eq('orden_id', ordenId)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;
      setItems(
        itemsData?.map((item: any) => ({
          id: item.id,
          menu_item_id: item.menu_item_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal,
          notas: item.notas,
          menu_item: item.menu_items,
        })) || []
      );

      // Cargar categorías (con image_url si existe)
      let catsData = null;
      let catsError = null;
      
      // Intentar primero con order_num
      let query = supabase
        .from('categories')
        .select('id, name, slug, image_url')
        .eq('is_active', true);
      
      try {
        // Intentar ordenar por order_num
        const result = await query.order('order_num', { ascending: true });
        catsData = result.data;
        catsError = result.error;
      } catch (err: any) {
        console.warn('Error con order_num, intentando sin orden:', err);
        // Si falla, intentar sin order_num
        try {
          const result2 = await supabase
            .from('categories')
            .select('id, name, slug, image_url')
            .eq('is_active', true);
          catsData = result2.data;
          catsError = result2.error;
        } catch (err2: any) {
          console.warn('Error con is_active, intentando sin filtro:', err2);
          // Si falla, intentar sin filtro is_active
          const result3 = await supabase
            .from('categories')
            .select('id, name, slug, image_url');
          catsData = result3.data;
          catsError = result3.error;
        }
      }

      if (catsError) {
        console.error('Error cargando categorías:', catsError);
        console.error('Detalles del error:', {
          message: catsError.message,
          code: catsError.code,
          details: catsError.details,
          hint: catsError.hint
        });
        // Mostrar error al usuario
        alert('Error cargando categorías: ' + catsError.message + '\n\nCódigo: ' + (catsError.code || 'N/A'));
      } else {
        console.log('Categorías cargadas:', catsData);
        if (catsData && catsData.length > 0) {
          setCategories(catsData);
        } else {
          console.warn('No se encontraron categorías activas');
          // Intentar cargar todas las categorías sin filtro
          const { data: allCats, error: allCatsError } = await supabase
            .from('categories')
            .select('id, name, slug, image_url');
          
          if (!allCatsError && allCats && allCats.length > 0) {
            console.log('Categorías cargadas (sin filtro is_active):', allCats);
            setCategories(allCats);
          } else {
            console.error('No se pudieron cargar categorías:', allCatsError);
          }
        }
      }

      // Cargar items del menú con categorías
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('name');

      if (menuData) setMenuItems(menuData);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      alert('Error cargando orden: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }

  function handleItemClick(menuItem: MenuItem) {
    // Verificar si necesita personalización
    const category = categories.find(c => c.id === menuItem.category_id);
    const categorySlug = category?.slug?.toLowerCase() || '';
    
    // Bebidas NO necesitan personalización - agregar directamente
    if (categorySlug === 'bebidas' || categorySlug === 'bebestibles') {
      addItemWithPersonalization(menuItem, null);
      return;
    }
    
    // Otras categorías que sí necesitan personalización
    const needsPersonalization = 
      categorySlug === 'menu-del-dia' || 
      categorySlug === 'shawarmas' || 
      categorySlug === 'shawarma' ||
      categorySlug === 'promociones' ||
      categorySlug === 'promocion';

    if (needsPersonalization) {
      setSelectedMenuItem(menuItem);
      setShowPersonalizationModal(true);
    } else {
      // Agregar directamente sin personalización
      addItemWithPersonalization(menuItem, null);
    }
  }

  async function addItemWithPersonalization(menuItem: MenuItem, personalization: any) {
    try {
      const existingItem = items.find((i) => i.menu_item_id === menuItem.id);

      // Convertir personalización a JSON string para guardar en notas
      const notasJson = personalization ? JSON.stringify(personalization) : null;

      if (existingItem) {
        // Actualizar cantidad y notas
        const newCantidad = existingItem.cantidad + 1;
        const newSubtotal = newCantidad * existingItem.precio_unitario;

        const { error } = await supabase
          .from('orden_items')
          .update({
            cantidad: newCantidad,
            subtotal: newSubtotal,
            notas: notasJson || existingItem.notas, // Mantener notas existentes si no hay nuevas
          })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Crear nuevo item
        const { data, error } = await supabase
          .from('orden_items')
          .insert({
            orden_id: ordenId,
            menu_item_id: menuItem.id,
            cantidad: 1,
            precio_unitario: menuItem.price,
            subtotal: menuItem.price,
            notas: notasJson,
          })
          .select()
          .single();

        if (error) throw error;
      }

      await loadData();
    } catch (error: any) {
      alert('Error agregando item: ' + error.message);
    }
  }

  async function updateItemPersonalization(itemId: string, personalization: any) {
    try {
      const notasJson = personalization ? JSON.stringify(personalization) : null;
      const { error } = await supabase
        .from('orden_items')
        .update({ notas: notasJson })
        .eq('id', itemId);

      if (error) throw error;
      await loadData();
    } catch (error: any) {
      alert('Error actualizando personalización: ' + error.message);
    }
  }

  function parsePersonalization(notas?: string): any {
    if (!notas) return null;
    try {
      return JSON.parse(notas);
    } catch {
      // Si no es JSON, retornar como texto simple
      return { detalles: notas };
    }
  }

  function formatPersonalizationText(personalization: any): string {
    if (!personalization) return '';
    const parts: string[] = [];
    if (personalization.agregado) parts.push(`Agregado: ${personalization.agregado}`);
    if (personalization.salsas && personalization.salsas.length > 0) {
      parts.push(`Salsa${personalization.salsas.length > 1 ? 's' : ''}: ${personalization.salsas.join(', ')}`);
    }
    if (personalization.sinIngredientes && personalization.sinIngredientes.length > 0) {
      parts.push(`Sin: ${personalization.sinIngredientes.join(', ')}`);
    }
    if (personalization.extras && personalization.extras.length > 0) {
      parts.push(`Extras: ${personalization.extras.join(', ')}`);
    }
    if (personalization.bebidas && personalization.bebidas.length > 0) {
      const bebidasText = personalization.bebidas.map((b: any) => {
        if (b.sabor) return `${b.nombre} (${b.sabor})`;
        return b.nombre;
      }).join(', ');
      parts.push(`Bebida${personalization.bebidas.length > 1 ? 's' : ''}: ${bebidasText}`);
    }
    if (personalization.detalles) parts.push(`Nota: ${personalization.detalles}`);
    return parts.join(' | ');
  }

  async function updateItemCantidad(itemId: string, cantidad: number) {
    if (cantidad <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const newSubtotal = cantidad * item.precio_unitario;

      const { error } = await supabase
        .from('orden_items')
        .update({
          cantidad,
          subtotal: newSubtotal,
        })
        .eq('id', itemId);

      if (error) throw error;
      await loadData();
    } catch (error: any) {
      alert('Error actualizando item: ' + error.message);
    }
  }

  async function removeItem(itemId: string) {
    try {
      const { error } = await supabase
        .from('orden_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      // Si después de eliminar no quedan items, reiniciar estado a "pending"
      const itemsRestantes = items.filter(item => item.id !== itemId);
      if (itemsRestantes.length === 0 && orden && orden.estado !== 'pending') {
        // Reiniciar estado a "pending" si la orden tenía items y ahora no tiene
        console.log('[OrdenForm] Todos los items eliminados - reiniciando estado a "pending"');
        await supabase
          .from('ordenes_restaurante')
          .update({ estado: 'pending' })
          .eq('id', ordenId);
      }
      
      await loadData();
    } catch (error: any) {
      alert('Error eliminando item: ' + error.message);
    }
  }

  async function cancelarOrden() {
    if (!confirm('¿Estás seguro de cancelar y eliminar esta orden? Esta acción no se puede deshacer y liberará la mesa.')) {
      return;
    }

    try {
      setSaving(true);
      
      // Guardar el mesa_id antes de eliminar la orden
      const mesaId = orden?.mesa_id;
      
      // Eliminar todos los items de la orden
      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from('orden_items')
          .delete()
          .eq('orden_id', ordenId);

        if (itemsError) {
          console.error('[cancelarOrden] Error eliminando items:', itemsError);
          throw itemsError;
        }
      }

      // Eliminar la orden primero
      const { error: deleteError } = await supabase
        .from('ordenes_restaurante')
        .delete()
        .eq('id', ordenId);

      if (deleteError) {
        console.error('[cancelarOrden] Error eliminando orden:', deleteError);
        throw deleteError;
      }

      // Liberar la mesa DESPUÉS de eliminar la orden (para evitar conflictos)
      if (mesaId) {
        console.log(`[cancelarOrden] Intentando liberar mesa ${mesaId}...`);
        
        const { data: mesaData, error: mesaError } = await supabase
          .from('mesas')
          .update({ estado: 'libre' })
          .eq('id', mesaId)
          .select()
          .single();

        if (mesaError) {
          console.error('[cancelarOrden] Error liberando mesa:', mesaError);
          console.error('[cancelarOrden] Detalles del error:', JSON.stringify(mesaError, null, 2));
          alert(`⚠️ Orden cancelada, pero hubo un problema al liberar la mesa: ${mesaError.message}. Por favor, libérala manualmente.`);
        } else if (mesaData) {
          console.log(`[cancelarOrden] ✅ Mesa ${mesaId} (Mesa ${mesaData.numero}) liberada correctamente. Estado actual: ${mesaData.estado}`);
        } else {
          console.warn(`[cancelarOrden] ⚠️ Mesa ${mesaId} no se encontró o no se actualizó`);
        }
      } else {
        console.log('[cancelarOrden] Orden sin mesa asignada, no se necesita liberar');
      }

      // Redirigir a mesas
      window.location.href = '/admin/mesas';
    } catch (error: any) {
      console.error('[cancelarOrden] Error general:', error);
      alert('Error cancelando orden: ' + error.message);
      setSaving(false);
    }
  }

  async function updateEstado(nuevoEstado: string) {
    // Validar que la orden tenga items antes de cambiar el estado
    if (items.length === 0) {
      alert('No se puede cambiar el estado de una orden vacía. Agrega items a la orden primero.');
      return;
    }

    // Validar que el estado actual permita el cambio
    if (!orden) {
      alert('Error: No se pudo cargar la orden. Recarga la página.');
      return;
    }

    console.log('[OrdenForm] ========== INICIANDO CAMBIO DE ESTADO ==========');
    console.log('[OrdenForm] Estado actual:', orden.estado);
    console.log('[OrdenForm] Estado nuevo:', nuevoEstado);
    console.log('[OrdenForm] Orden ID:', ordenId);
    console.log('[OrdenForm] Items en orden:', items.length);
    console.log('[OrdenForm] Saving:', saving);

    try {
      setSaving(true);
      
      // Intentar usar la API route (que maneja impresión automática)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (token) {
          console.log('[OrdenForm] ✅ Token de sesión encontrado');
          console.log('[OrdenForm] Llamando a API route para cambiar estado:', nuevoEstado);
          console.log('[OrdenForm] URL:', `/api/ordenes/${ordenId}`);
          
          const response = await fetch(`/api/ordenes/${ordenId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ estado: nuevoEstado }),
          });
          
          console.log('[OrdenForm] Respuesta recibida:', response.status, response.statusText);
          
          if (response.ok) {
            const result = await response.json();
            console.log('[OrdenForm] ✅ API route respondió correctamente:', result);
            // API route funcionó, recargar datos
            await loadData();
            console.log('[OrdenForm] ✅ Datos recargados después de cambio de estado');
            return;
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            console.error('[OrdenForm] ❌ API route falló:', response.status, errorData);
            alert(`Error del servidor (${response.status}): ${errorData.error || errorData.message || 'Error desconocido'}`);
            // Continuar con fallback
          }
        } else {
          console.warn('[OrdenForm] ⚠️ No hay token de sesión, usando método directo');
        }
      } catch (apiError: any) {
        // Si la API falla, usar método directo como fallback
        console.warn('[OrdenForm] ⚠️ API route no disponible, usando método directo:', apiError.message);
        console.error('[OrdenForm] Error completo:', apiError);
      }
      
      // Fallback: actualizar directamente (método original)
      console.log('[OrdenForm] Usando método directo (fallback)');
      console.log('[OrdenForm] Actualizando orden:', ordenId, 'a estado:', nuevoEstado);
      
      const { data, error } = await supabase
        .from('ordenes_restaurante')
        .update({ estado: nuevoEstado })
        .eq('id', ordenId)
        .select();

      if (error) {
        console.error('[OrdenForm] ❌ Error de Supabase:', error);
        console.error('[OrdenForm] Código:', error.code);
        console.error('[OrdenForm] Mensaje:', error.message);
        console.error('[OrdenForm] Detalles:', error.details);
        console.error('[OrdenForm] Hint:', error.hint);
        throw error;
      }

      if (data && data.length > 0) {
        console.log('[OrdenForm] ✅ Estado actualizado correctamente:', data[0]);
      } else {
        console.warn('[OrdenForm] ⚠️ No se devolvieron datos después de actualizar');
      }
      
      await loadData();
      console.log('[OrdenForm] ✅ Datos recargados después de cambio de estado (método directo)');
    } catch (error: any) {
      console.error('[OrdenForm] ❌ ========== ERROR ACTUALIZANDO ESTADO ==========');
      console.error('[OrdenForm] Error completo:', error);
      console.error('[OrdenForm] Tipo:', typeof error);
      console.error('[OrdenForm] Stack:', error.stack);
      
      let errorMessage = 'Error desconocido';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.error) {
        errorMessage = error.error;
      }
      
      alert(`Error actualizando estado: ${errorMessage}\n\nRevisa la consola (F12) para más detalles.`);
    } finally {
      setSaving(false);
      console.log('[OrdenForm] ========== FIN CAMBIO DE ESTADO ==========');
    }
  }

  async function pagarOrden() {
    // Validar que la orden tenga items antes de pagar
    if (items.length === 0) {
      alert('No se puede pagar una orden vacía. Agrega items a la orden primero.');
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('No estás autenticado');
        return;
      }

      setShowPagoModal(true);
      return;
    } catch (error: any) {
      alert('Error pagando orden: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmarPago(metodoPago: string, conPropina: boolean) {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('No estás autenticado');
        return;
      }

      if (!metodoPago) {
        alert('Por favor selecciona un método de pago');
        return;
      }

      // Calcular total con o sin propina
      const propinaCalculada = conPropina ? orden.total * 0.1 : 0;
      const totalFinal = orden.total + propinaCalculada;

      // Mapear método de pago a valores permitidos en la BD
      // La BD solo permite: 'EFECTIVO', 'TARJETA', 'TRANSFERENCIA'
      let metodoPagoBD = metodoPago.toUpperCase();
      if (metodoPagoBD === 'DÉBITO' || metodoPagoBD === 'DEBITO' || metodoPagoBD === 'CRÉDITO' || metodoPagoBD === 'CREDITO') {
        metodoPagoBD = 'TARJETA';
      }

      // Intentar usar la API route (que maneja impresión automática)
      let ordenActualizada = false;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (token) {
          const response = await fetch(`/api/ordenes/${ordenId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              estado: 'paid',
              metodo_pago: metodoPagoBD,
              paid_at: new Date().toISOString(),
              total: totalFinal,
              propina_calculada: propinaCalculada,
            }),
          });
          
          if (response.ok) {
            ordenActualizada = true;
          }
        }
      } catch (apiError) {
        // Si la API falla, usar método directo como fallback
        console.warn('API route no disponible, usando método directo:', apiError);
      }
      
      // Fallback: actualizar directamente (método original)
      if (!ordenActualizada) {
        const { error } = await supabase
          .from('ordenes_restaurante')
          .update({
            estado: 'paid',
            metodo_pago: metodoPagoBD,
            paid_at: new Date().toISOString(),
            total: totalFinal,
            propina_calculada: propinaCalculada,
          })
          .eq('id', ordenId);

        if (error) throw error;
      }

      // Si hay propina, distribuirla entre empleados con propina habilitada
      if (propinaCalculada > 0) {
        try {
          await distribuirPropinas(propinaCalculada, ordenId);
        } catch (errorDistribucion) {
          console.error('Error distribuyendo propinas:', errorDistribucion);
          // No lanzamos el error para no bloquear el pago, solo lo registramos
        }
      }

      // Liberar mesa
      if (orden?.mesa_id) {
        await supabase
          .from('mesas')
          .update({ estado: 'libre' })
          .eq('id', orden.mesa_id);
      }

      setShowPagoModal(false);
      
      // Crear print_job para boleta automáticamente al pagar
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (token) {
          // Crear print_job en la cola de impresión
          const printResponse = await fetch('/api/print-jobs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              ordenId: ordenId,
              type: 'payment',
              printerTarget: 'cashier',
            }),
          });
          
          if (printResponse.ok) {
            console.log('[OrdenForm] ✅ Trabajo de impresión de boleta creado automáticamente al pagar');
          } else {
            console.warn('[OrdenForm] ⚠️ No se pudo crear el trabajo de impresión, pero el pago fue exitoso');
          }
        }
      } catch (printError) {
        console.error('[OrdenForm] Error creando trabajo de impresión:', printError);
        // No bloquear el flujo si falla la creación del print_job
      }
      
      // Mostrar boleta antes de redirigir
      setShowBoleta(true);
    } catch (error: any) {
      alert('Error pagando orden: ' + error.message);
    } finally {
      setSaving(false);
    }
  }


  const filteredMenuItems = (() => {
    let filtered = selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => {
          const category = categories.find((c) => c.slug === selectedCategory);
          return category && item.category_id === category.id;
        });
    
    // Aplicar búsqueda si hay query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => 
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  })();

  // Función para obtener imagen de categoría (usando hero-*.png como en el menú digital)
  function getCategoryImage(category: { slug: string; name?: string; image_url?: string }): string {
    // Si la categoría tiene image_url, usarlo primero (puede ser URL de Supabase Storage o ruta relativa)
    if (category.image_url) {
      // Si es una URL completa (Supabase Storage), usarla directamente
      if (category.image_url.startsWith('http://') || category.image_url.startsWith('https://')) {
        return category.image_url;
      }
      // Si es una ruta relativa, usarla
      return category.image_url;
    }
    
    // Si no hay image_url, usar hero-*.png
    const heroMap: Record<string, string> = {
      'destacados': '/her-destacados.png', // Nota: el archivo se llama "her-destacados.png" (sin la 'o')
      'completos': '/hero-completos.png',
      'sandwiches': '/hero-sandwich.png',
      'acompanamientos': '/hero-acompañamientos.png',
      'pollo': '/hero-pollos.png',
      'bebidas': '/hero-bebidas.png',
    };
    
    // Normalizar slug (sin acentos, minúsculas)
    const normalizedSlug = category.slug?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
    
    // Buscar coincidencia exacta primero
    if (heroMap[category.slug]) {
      return heroMap[category.slug];
    }
    
    // Buscar por slug normalizado
    if (heroMap[normalizedSlug]) {
      return heroMap[normalizedSlug];
    }
    
    // Fallback: intentar construir el nombre del archivo
    return `/hero-${normalizedSlug}.png`;
  }

  function handleCategorySelect(categorySlug: string) {
    setSelectedCategory(categorySlug);
    setShowCategories(false);
  }

  function handleBackToCategories() {
    setShowCategories(true);
    setSelectedCategory('all');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando orden...</div>
      </div>
    );
  }

  if (!ordenId) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error: No se proporcionó un ID de orden</div>
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="p-6">
        <div className="text-red-600">Orden no encontrada</div>
        <a href="/admin/mesas" className="text-blue-600 hover:underline mt-2 inline-block">
          Volver a Mesas
        </a>
      </div>
    );
  }

  return (
    <div className="pb-4 sm:pb-6">
      {/* Header sticky para móvil */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm mb-4 sm:mb-6 -mx-2 sm:-mx-4 lg:-mx-6 px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              Orden: {orden.numero_orden}
            </h1>
            {mesaInfo && (
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                Mesa {mesaInfo.numero}
              </p>
            )}
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Estado: <span className="font-semibold capitalize">{orden.estado}</span>
            </p>
          </div>
          
          {/* Botones de acción - Scroll horizontal en móvil */}
          <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 -mx-2 sm:mx-0 px-2 sm:px-0">
            <div className="flex gap-2 sm:gap-3 min-w-max sm:min-w-0 sm:flex-wrap">
              <button
                onClick={() => updateEstado('preparing')}
                disabled={orden.estado !== 'pending' || saving || items.length === 0}
                aria-label="Marcar orden en preparación"
                className="min-h-[48px] min-w-[120px] px-4 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 active:bg-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-300 transition-all whitespace-nowrap"
              >
                ⏳ Preparación
              </button>
              <button
                onClick={() => updateEstado('ready')}
                disabled={orden.estado !== 'preparing' || saving || items.length === 0}
                aria-label="Marcar orden como lista"
                className="min-h-[48px] min-w-[100px] px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all whitespace-nowrap"
              >
                ✅ Lista
              </button>
              <button
                onClick={() => setShowComanda(true)}
                disabled={items.length === 0}
                aria-label="Ver comanda de cocina"
                className="min-h-[48px] min-w-[140px] px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all whitespace-nowrap"
              >
                🖨️ Comanda
              </button>
              <button
                onClick={() => setShowBoleta(true)}
                disabled={items.length === 0}
                aria-label="Ver boleta de cliente"
                className="min-h-[48px] min-w-[130px] px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all whitespace-nowrap"
              >
                🧾 Boleta
              </button>
              <button
                onClick={pagarOrden}
                disabled={orden.estado === 'paid' || saving || items.length === 0}
                aria-label="Pagar orden"
                className="min-h-[48px] min-w-[100px] px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300 transition-all whitespace-nowrap"
              >
                💰 Pagar
              </button>
              {(orden.estado === 'pending' || orden.estado === 'preparing') && (
                <button
                  onClick={cancelarOrden}
                  disabled={saving}
                  aria-label="Cancelar y eliminar orden"
                  className="min-h-[48px] min-w-[140px] px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300 transition-all whitespace-nowrap"
                >
                  ❌ Cancelar Orden
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Menú de items */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {showCategories ? 'Seleccionar Categoría' : 'Agregar Items'}
              </h2>
              {!showCategories && (
                <button
                  onClick={handleBackToCategories}
                  aria-label="Volver a categorías"
                  className="min-h-[44px] px-4 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 active:bg-slate-800 text-sm sm:text-base font-semibold focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all"
                >
                  ← Volver
                </button>
              )}
            </div>

            {showCategories ? (
              /* Grid de Categorías con Imágenes */
              <div>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 text-base sm:text-lg">Cargando categorías...</p>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 text-base sm:text-lg mb-2">No hay categorías disponibles</p>
                    <p className="text-slate-500 text-sm mb-4">
                      Esto puede deberse a permisos o que no hay categorías activas en la base de datos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => {
                          console.log('Reintentando cargar categorías...');
                          loadData();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Reintentar
                      </button>
                      <button
                        onClick={() => {
                          // Abrir consola para debugging
                          console.log('Estado actual:', {
                            categories,
                            loading,
                            ordenId,
                            orden
                          });
                          // Intentar consulta directa
                          supabase
                            .from('categories')
                            .select('id, name, slug')
                            .then(({ data, error }) => {
                              console.log('Consulta directa de categorías:', { data, error });
                              if (error) {
                                alert('Error: ' + error.message + '\nCódigo: ' + (error.code || 'N/A'));
                              } else {
                                alert('Categorías encontradas: ' + (data?.length || 0));
                                if (data && data.length > 0) {
                                  setCategories(data.map(c => ({
                                    id: c.id,
                                    name: c.name,
                                    slug: c.slug
                                  })));
                                }
                              }
                            });
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Verificar en Consola
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto overscroll-contain">
                    {categories.map((cat) => {
                      const categoryImage = getCategoryImage(cat);
                      const itemsInCategory = menuItems.filter(item => item.category_id === cat.id);
                      const availableItems = itemsInCategory.filter(item => item.is_available);
                      
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.slug)}
                          aria-label={`Ver items de ${cat.name}`}
                          className="
                            group
                            relative
                            overflow-hidden
                            rounded-xl
                            border-2 border-slate-300
                            bg-white
                            hover:border-slate-500
                            hover:shadow-xl
                            active:scale-95
                            focus:outline-none focus:ring-4 focus:ring-slate-300
                            transition-all duration-200
                          "
                        >
                          {/* Imagen de categoría */}
                          <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
                            <img
                              src={categoryImage}
                              alt={cat.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                console.error('Error cargando imagen de categoría:', cat.name, cat.slug, target.src);
                                // Si falla, intentar con placeholder
                                target.src = '/images/ui/placeholders/product-hero.svg';
                                target.style.opacity = '0.3';
                              }}
                              onLoad={() => {
                                console.log('Imagen cargada correctamente:', cat.name, categoryImage);
                              }}
                            />
                            {/* Overlay oscuro para mejor legibilidad del texto */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          </div>
                          
                          {/* Nombre de categoría */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
                            <h3 className="text-white font-bold text-sm sm:text-base md:text-lg text-center drop-shadow-lg">
                              {cat.name.toUpperCase()}
                            </h3>
                            {availableItems.length > 0 && (
                              <p className="text-white/80 text-xs sm:text-sm text-center mt-1">
                                {availableItems.length} {availableItems.length === 1 ? 'item' : 'items'}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Grid de Items con Imágenes */
              <div>
                {/* Campo de búsqueda */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar items (ej: papas fritas, arroz, etc.)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full min-h-[48px] px-4 py-3 border-2 border-slate-300 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-slate-300 focus:border-slate-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Limpiar búsqueda
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto overscroll-contain">
                  {filteredMenuItems.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-slate-600 text-base sm:text-lg">
                        {searchQuery ? `No se encontraron items con "${searchQuery}"` : 'No hay items disponibles en esta categoría'}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="mt-2 text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Limpiar búsqueda
                        </button>
                      )}
                      <button
                        onClick={handleBackToCategories}
                        className="mt-4 block mx-auto text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Volver a categorías
                      </button>
                    </div>
                  ) : (
                    filteredMenuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        disabled={!item.is_available}
                        aria-label={`Agregar ${item.name}, precio ${formatCLP(item.price)}`}
                        className={`
                          group
                          relative
                          overflow-hidden
                          rounded-xl
                          border-2
                          text-left
                          transition-all duration-200
                          active:scale-95
                          focus:outline-none focus:ring-4 focus:ring-offset-2
                          ${item.is_available
                            ? 'border-slate-300 bg-white hover:border-slate-500 hover:shadow-xl focus:ring-slate-300'
                            : 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                          }
                        `}
                      >
                        {/* Imagen del item */}
                        {item.image_url ? (
                          <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden bg-slate-100">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            {item.is_featured && (
                              <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold z-10">
                                ⭐
                              </div>
                            )}
                            {!item.is_available && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                                  No disponible
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative h-40 sm:h-48 md:h-56 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                            <span className="text-slate-500 text-4xl">🍽️</span>
                          </div>
                        )}
                        
                        {/* Información del item */}
                        <div className="p-4 sm:p-5">
                          <h3 className="font-bold text-base sm:text-lg md:text-xl text-slate-900 mb-2 line-clamp-2 min-h-[3rem]">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-xs sm:text-sm text-slate-600 mb-3 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-lg sm:text-xl md:text-2xl font-bold text-green-700">
                              {formatCLP(item.price)}
                            </span>
                            {item.is_available && (
                              <span className="text-xs sm:text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                                Disponible
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resumen de orden - Sticky en móvil también */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sticky top-[120px] sm:top-6 max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-40px)] flex flex-col">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-slate-900">Resumen de Orden</h2>

            <div className="space-y-3 mb-4 flex-1 overflow-y-auto overscroll-contain min-h-0">
              {items.length === 0 ? (
                <p className="text-slate-500 text-sm">No hay items en la orden</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="border-2 border-slate-300 rounded-xl bg-white hover:border-slate-400 hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Imagen del item si existe */}
                    {item.menu_item?.image_url && (
                      <div className="relative h-32 sm:h-40 overflow-hidden bg-slate-100">
                        <img
                          src={item.menu_item.image_url}
                          alt={item.menu_item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    <div className="p-4 sm:p-5">
                      {/* Nombre y precio */}
                      <div className="flex justify-between items-start mb-3 gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base sm:text-lg md:text-xl text-slate-900 mb-1 break-words">
                            {item.menu_item?.name || 'Item'}
                          </h3>
                          {item.notas && (() => {
                            const personalization = parsePersonalization(item.notas);
                            const personalizationText = formatPersonalizationText(personalization);
                            return personalizationText ? (
                              <div className="text-xs sm:text-sm text-blue-700 mt-1 italic font-medium">
                                {personalizationText}
                              </div>
                            ) : null;
                          })()}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-lg sm:text-xl text-slate-900" aria-label={`Subtotal: ${formatCLP(item.subtotal)}`}>
                            {formatCLP(item.subtotal)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Controles de cantidad y acciones */}
                      <div className="flex items-center justify-between gap-2 sm:gap-3 pt-3 border-t-2 border-slate-200">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1">
                          <button
                            onClick={() =>
                              updateItemCantidad(item.id!, item.cantidad - 1)
                            }
                            aria-label={`Reducir cantidad de ${item.menu_item?.name || 'item'}`}
                            className="min-w-[56px] min-h-[56px] w-14 h-14 flex items-center justify-center border-2 border-slate-400 bg-white rounded-xl hover:bg-slate-100 active:bg-slate-200 active:scale-95 text-2xl sm:text-3xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all shadow-sm"
                          >
                            −
                          </button>
                          <span 
                            className="min-w-[60px] text-center text-xl sm:text-2xl font-bold text-slate-900 px-2" 
                            aria-label={`Cantidad: ${item.cantidad}`}
                          >
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() =>
                              updateItemCantidad(item.id!, item.cantidad + 1)
                            }
                            aria-label={`Aumentar cantidad de ${item.menu_item?.name || 'item'}`}
                            className="min-w-[56px] min-h-[56px] w-14 h-14 flex items-center justify-center border-2 border-slate-400 bg-white rounded-xl hover:bg-slate-100 active:bg-slate-200 active:scale-95 text-2xl sm:text-3xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all shadow-sm"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedItemToEdit(item);
                              setShowEditItemModal(true);
                            }}
                            aria-label={`Editar personalización de ${item.menu_item?.name || 'item'}`}
                            className="min-w-[56px] min-h-[56px] w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300 active:scale-95 rounded-xl text-xl sm:text-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all shadow-sm"
                            title="Editar personalización"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => removeItem(item.id!)}
                            aria-label={`Eliminar ${item.menu_item?.name || 'item'} de la orden`}
                            className="min-w-[56px] min-h-[56px] w-14 h-14 flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-300 active:scale-95 rounded-xl text-xl sm:text-2xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all shadow-sm"
                            title="Eliminar item"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t-2 border-slate-400 pt-4 mt-auto">
              <div className="flex justify-between items-center text-lg sm:text-xl font-bold text-slate-900">
                <span>Total:</span>
                <span className="text-green-700" aria-label={`Total de la orden: ${formatCLP(orden.total)}`}>
                  {formatCLP(orden.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Comanda Cocina */}
      {showComanda && orden && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 no-print"
          role="dialog"
          aria-modal="true"
          aria-label="Comanda de cocina"
        >
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <ComandaCocina
              orden={{ ...orden, mesas: mesaInfo || undefined }}
              items={items}
              onClose={() => setShowComanda(false)}
            />
          </div>
        </div>
      )}

      {/* Modal de Boleta Cliente */}
      {showBoleta && orden && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 no-print"
          role="dialog"
          aria-modal="true"
          aria-label="Boleta de cliente"
        >
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <BoletaCliente
              orden={{ ...orden, mesas: mesaInfo || undefined }}
              items={items}
              onClose={() => {
                setShowBoleta(false);
                // Si la orden está pagada, redirigir después de imprimir boleta
                if (orden.estado === 'paid') {
                  setTimeout(() => {
                    window.location.href = '/admin/mesas';
                  }, 1000);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Modal de Personalización */}
      {showPersonalizationModal && selectedMenuItem && (
        <ItemPersonalizationModal
          menuItem={selectedMenuItem}
          category={categories.find(c => c.id === selectedMenuItem.category_id) || null}
          onConfirm={(personalization) => {
            addItemWithPersonalization(selectedMenuItem, personalization);
            setShowPersonalizationModal(false);
            setSelectedMenuItem(null);
          }}
          onCancel={() => {
            setShowPersonalizationModal(false);
            setSelectedMenuItem(null);
          }}
        />
      )}

      {/* Modal de Editar Item */}
      {showEditItemModal && selectedItemToEdit && (
        <ItemPersonalizationModal
          menuItem={selectedItemToEdit.menu_item!}
          category={categories.find(c => c.id === selectedItemToEdit.menu_item?.category_id) || null}
          initialPersonalization={(() => {
            try {
              return selectedItemToEdit.notas ? JSON.parse(selectedItemToEdit.notas) : null;
            } catch {
              return null;
            }
          })()}
          onConfirm={(personalization) => {
            updateItemPersonalization(selectedItemToEdit.id!, personalization);
            setShowEditItemModal(false);
            setSelectedItemToEdit(null);
          }}
          onCancel={() => {
            setShowEditItemModal(false);
            setSelectedItemToEdit(null);
          }}
        />
      )}

      {/* Modal de Pago */}
      {showPagoModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => {
            if (!saving) {
              setShowPagoModal(false);
              setSaving(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pago-title"
        >
          <div 
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="pago-title" className="text-xl sm:text-2xl font-bold mb-6 text-slate-900">
              Pagar Orden
            </h2>
            
            <div className="mb-6">
              <label htmlFor="metodoPago" className="block text-base sm:text-lg font-semibold mb-3 text-slate-700">
                Método de Pago:
              </label>
              <select
                id="metodoPago"
                aria-label="Seleccionar método de pago"
                className="w-full min-h-[56px] px-4 py-3 text-base sm:text-lg border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-green-500"
                defaultValue=""
              >
                <option value="">Selecciona método de pago</option>
                <option value="EFECTIVO">💵 Efectivo</option>
                <option value="TARJETA">💳 Tarjeta (Débito/Crédito)</option>
                <option value="TRANSFERENCIA">🏦 Transferencia</option>
              </select>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
              <div className="space-y-2">
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="font-medium text-slate-700">Subtotal:</span>
                  <span className="font-semibold text-slate-900">{formatCLP(orden.total)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-slate-600">Propina sugerida (10%):</span>
                  <span className="font-medium text-slate-700">{formatCLP(orden.total * 0.1)}</span>
                </div>
                <div className="border-t-2 border-slate-300 pt-2 mt-2 flex justify-between text-lg sm:text-xl">
                  <span className="font-bold text-slate-900">Total:</span>
                  <span className="font-bold text-green-700">{formatCLP(orden.total * 1.1)}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id="conPropina"
                  defaultChecked={true}
                  className="w-6 h-6 sm:w-7 sm:h-7 cursor-pointer accent-green-600"
                  aria-label="Incluir propina del 10%"
                />
                <span className="text-base sm:text-lg font-medium text-slate-700 group-hover:text-slate-900">
                  Incluir propina del 10%
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowPagoModal(false);
                  setSaving(false);
                }}
                disabled={saving}
                aria-label="Cancelar pago"
                className="flex-1 min-h-[56px] px-6 py-3 border-2 border-slate-300 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-base sm:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const metodoPago = (document.getElementById('metodoPago') as HTMLSelectElement).value;
                  const conPropina = (document.getElementById('conPropina') as HTMLInputElement).checked;
                  confirmarPago(metodoPago, conPropina);
                }}
                disabled={saving}
                aria-label="Confirmar pago de la orden"
                className="flex-1 min-h-[56px] px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg font-bold shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300 transition-all"
              >
                {saving ? 'Procesando...' : '💰 Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

