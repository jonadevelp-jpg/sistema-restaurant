# 🚀 INICIO RÁPIDO - Sistema Restaurante

## ✅ Lo que está listo

- ✅ Todas las migraciones SQL creadas
- ✅ Estructura del proyecto completa
- ✅ Sistema de autenticación con Supabase
- ✅ Dashboard básico funcionando
- ✅ Base de datos configurada

---

## 📋 PASOS PARA PONER EN MARCHA

### 1️⃣ Instalar Dependencias

```bash
cd app-final
npm install
```

### 2️⃣ Configurar Variables de Entorno

Crea un archivo `.env` en la raíz de `app-final`:

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

**Obtén estos valores desde:**
- Supabase Dashboard > Settings > API

### 3️⃣ Crear Tablas en Supabase

**IMPORTANTE:** Debes crear todas las tablas antes de usar la app.

Sigue las instrucciones detalladas en:
- **`INSTRUCCIONES_CREAR_TABLAS.md`** (instrucciones paso a paso)
- **`database/INSTALACION_BD.md`** (guía técnica completa)

**Resumen rápido:**
1. Ve a Supabase Dashboard > SQL Editor
2. Ejecuta cada archivo SQL de `database/migrations/` en orden (001 a 007)
3. Crea un usuario admin en Authentication
4. Inserta el usuario en la tabla `users`

### 4️⃣ Crear Usuario Admin

**Opción A: Desde Dashboard (Recomendado)**

1. Supabase Dashboard > Authentication > Users
2. Add User > Create new user
3. Email: `admin@restaurante.com`
4. Password: (elige una segura)
5. Copia el UUID del usuario

**Luego ejecuta en SQL Editor:**
```sql
INSERT INTO users (id, role, name, email)
VALUES (
  'UUID_DEL_USUARIO',  -- Pega el UUID aquí
  'admin',
  'Administrador',
  'admin@restaurante.com'
);
```

### 5️⃣ Ejecutar la Aplicación

```bash
npm run dev
```

### 6️⃣ Acceder al Sistema

1. Abre `http://localhost:4321`
2. Ve a `/admin/login`
3. Inicia sesión con el usuario admin que creaste

---

## 📁 Archivos Importantes

- **`INSTRUCCIONES_CREAR_TABLAS.md`** - Guía paso a paso para crear tablas
- **`database/INSTALACION_BD.md`** - Guía técnica completa
- **`database/migrations/`** - Todas las migraciones SQL
- **`README.md`** - Documentación general

---

## 🎯 Estado del Proyecto

### ✅ Completado:
- Migraciones SQL (14 tablas)
- Autenticación con Supabase
- Dashboard básico con KPIs
- Estructura del proyecto
- Utilidades (currency, date, commission)

### 🚧 Pendiente (para expandir):
- Vista de mesas (POS)
- Gestión completa de órdenes
- Editor de recetas
- Gestión de ingredientes
- Sistema de compras
- Panel de gastos completo
- Reportes avanzados

---

## 🔧 Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verifica que `.env` existe y tiene las variables correctas
- Reinicia el servidor después de crear `.env`

### Error: "relation does not exist"
- No has ejecutado las migraciones SQL
- Sigue `INSTRUCCIONES_CREAR_TABLAS.md`

### Error: "permission denied"
- Verifica que el usuario tenga rol 'admin' en la tabla `users`
- Verifica que RLS esté configurado correctamente

### No puedo iniciar sesión
- Verifica que el usuario exista en `auth.users`
- Verifica que exista registro en tabla `users` con mismo UUID
- Verifica que el email y password sean correctos

---

## 📞 Próximos Pasos

Una vez que la app esté funcionando:

1. Explora el dashboard
2. Revisa la estructura de componentes
3. Agrega más funcionalidades según necesites
4. Personaliza el diseño

---

**¡Listo para empezar!** 🎉


