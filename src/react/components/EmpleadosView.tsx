import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCLP } from '@/utils/currency';

interface Empleado {
  id: string;
  nombre: string;
  funcion: string;
  sueldo: number;
  propina_habilitada: boolean;
  user_id: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  users?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function EmpleadosView() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    funcion: 'mesero',
    sueldo: '0',
    propina_habilitada: false,
    user_id: '',
    activo: true,
    // Campos para crear nuevo usuario
    crear_usuario: false,
    email: '',
    password: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      
      // Cargar empleados con información de usuarios
      const { data: empleadosData, error: empleadosError } = await supabase
        .from('empleados')
        .select(`
          *,
          users (
            id,
            name,
            email,
            role
          )
        `)
        .order('nombre');

      if (empleadosError) throw empleadosError;
      setEmpleados(empleadosData || []);

      // Cargar usuarios disponibles (que no estén asignados o que sean del empleado actual)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .order('name');

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      alert('Error cargando datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function openNewForm() {
    setEditingEmpleado(null);
    setFormData({
      nombre: '',
      funcion: 'mesero',
      sueldo: '0',
      propina_habilitada: false,
      user_id: '',
      activo: true,
      crear_usuario: false,
      email: '',
      password: '',
    });
    setShowForm(true);
  }

  function openEditForm(empleado: Empleado) {
    setEditingEmpleado(empleado);
    // Si no tiene usuario, permitir crear uno
    const tieneUsuario = !!empleado.user_id;
    setFormData({
      nombre: empleado.nombre,
      funcion: empleado.funcion,
      sueldo: empleado.sueldo.toString(),
      propina_habilitada: empleado.propina_habilitada,
      user_id: empleado.user_id || '',
      activo: empleado.activo,
      crear_usuario: !tieneUsuario, // Activar si no tiene usuario
      email: '',
      password: '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    // Validar si se está creando usuario (nuevo o al editar)
    if (formData.crear_usuario) {
      if (!formData.email.trim()) {
        alert('El email es requerido para crear usuario');
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    setSaving(true);
    try {
      let userId = formData.user_id || null;

      // Si se está creando un nuevo usuario (nuevo empleado o editar sin usuario)
      if (formData.crear_usuario && formData.email && formData.password) {
        try {
          // Obtener token de sesión para la petición
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;

          const response = await fetch('/api/create-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: formData.email.trim(),
              password: formData.password,
              name: formData.nombre.trim(),
              role: 'mesero', // Los empleados siempre son meseros
            }),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Error creando usuario');
          }

          userId = result.user.id;
        } catch (error: any) {
          console.error('Error creando usuario:', error);
          alert('Error creando usuario: ' + error.message);
          setSaving(false);
          return;
        }
      }

      const data = {
        nombre: formData.nombre.trim(),
        funcion: formData.funcion,
        sueldo: parseFloat(formData.sueldo) || 0,
        propina_habilitada: formData.propina_habilitada,
        user_id: userId,
        activo: formData.activo,
      };

      if (editingEmpleado) {
        const { error } = await supabase
          .from('empleados')
          .update(data)
          .eq('id', editingEmpleado.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('empleados')
          .insert(data);
        if (error) throw error;
      }

      setShowForm(false);
      loadData();
    } catch (error: any) {
      console.error('Error guardando empleado:', error);
      alert('Error guardando empleado: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActivo(empleado: Empleado) {
    try {
      const { error } = await supabase
        .from('empleados')
        .update({ activo: !empleado.activo })
        .eq('id', empleado.id);
      
      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert('Error actualizando estado: ' + error.message);
    }
  }

  async function eliminarEmpleado(empleado: Empleado) {
    if (!confirm(`¿Estás seguro de eliminar al empleado "${empleado.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      // Eliminar empleado (si tiene user_id, el usuario se mantiene en la BD pero se desvincula)
      const { error } = await supabase
        .from('empleados')
        .delete()
        .eq('id', empleado.id);
      
      if (error) throw error;
      
      alert('Empleado eliminado correctamente');
      loadData();
    } catch (error: any) {
      console.error('Error eliminando empleado:', error);
      alert('Error eliminando empleado: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Cargando empleados...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Empleados</h1>
        <button
          onClick={openNewForm}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          + Nuevo Empleado
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Función</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Sueldo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Propina</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {empleados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No hay empleados registrados
                </td>
              </tr>
            ) : (
              empleados.map((empleado) => (
                <tr key={empleado.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">{empleado.nombre}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                      {empleado.funcion}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                    {formatCLP(empleado.sueldo)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {empleado.propina_habilitada ? (
                      <span className="text-green-600 font-medium">✓ Habilitada</span>
                    ) : (
                      <span className="text-slate-400">No aplica</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {empleado.users ? (
                      <div>
                        <div className="font-medium">{empleado.users.name}</div>
                        <div className="text-xs text-slate-500">{empleado.users.email}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => toggleActivo(empleado)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        empleado.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {empleado.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(empleado)}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarEmpleado(empleado)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Función *</label>
                <select
                  value={formData.funcion}
                  onChange={(e) => setFormData({ ...formData, funcion: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="mesero">Mesero</option>
                  <option value="cocina">Cocina</option>
                  <option value="delivery">Delivery</option>
                  <option value="cajero">Cajero</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sueldo (CLP) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sueldo}
                  onChange={(e) => setFormData({ ...formData, sueldo: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.propina_habilitada}
                    onChange={(e) => setFormData({ ...formData, propina_habilitada: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Habilitar propina</span>
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Si está habilitado, el empleado recibirá parte de las propinas distribuidas
                </p>
              </div>

              {(!editingEmpleado || !editingEmpleado.user_id) && (
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.crear_usuario}
                      onChange={(e) => setFormData({ ...formData, crear_usuario: e.target.checked, user_id: '' })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">
                      {editingEmpleado ? 'Crear usuario del sistema para este empleado' : 'Crear usuario del sistema para este empleado'}
                    </span>
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    {editingEmpleado 
                      ? 'Este empleado no tiene usuario. Marca esta opción para crearle uno con acceso de mesero.'
                      : 'Si está marcado, se creará un usuario con acceso de mesero (solo mesas y órdenes)'}
                  </p>
                </div>
              )}

              {formData.crear_usuario && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required={formData.crear_usuario}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="mesero@restaurante.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Contraseña *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={formData.crear_usuario}
                      minLength={6}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      El usuario podrá iniciar sesión con este email y contraseña
                    </p>
                  </div>
                </>
              )}

              {!formData.crear_usuario && editingEmpleado && editingEmpleado.user_id && (
                <div>
                  <label className="block text-sm font-medium mb-1">Usuario del Sistema</label>
                  <div className="px-3 py-2 border border-slate-300 rounded-lg bg-slate-50">
                    <div className="font-medium">{editingEmpleado.users?.name || 'Usuario'}</div>
                    <div className="text-xs text-slate-500">{editingEmpleado.users?.email || ''}</div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Este empleado ya tiene un usuario asignado. Para crear uno nuevo, primero elimina el empleado y créalo de nuevo.
                  </p>
                </div>
              )}

              {!formData.crear_usuario && !editingEmpleado && (
                <div>
                  <label className="block text-sm font-medium mb-1">Usuario del Sistema (Opcional)</label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="">Sin asignar</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {user.role}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Asocia este empleado con un usuario existente del sistema
                  </p>
                </div>
              )}

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Activo</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

