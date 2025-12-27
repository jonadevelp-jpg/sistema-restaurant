# 🍽️ Sistema Restaurante Completo

Sistema completo de gestión para restaurante que integra:
- **Menú QR público** - Menú digital interactivo con categorías y items
- **Sistema de mesas y órdenes (POS)** - Gestión de mesas y órdenes del restaurante
- **Gestión de ingredientes y recetas** - Control de inventario y costos
- **Sistema de compras a proveedores** - Registro de compras y movimientos de stock
- **Gestión de gastos** - Control de gastos generales y pequeños
- **Panel de KPIs y reportes** - Dashboard con métricas del negocio

## 🚀 Tecnologías

- **Frontend:** Astro + React + Tailwind CSS
- **Backend:** Astro API Routes + Supabase
- **Base de Datos:** PostgreSQL (Supabase)
- **Autenticación:** Supabase Auth
- **Deploy:** Vercel

## 📋 Instalación Local

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PUBLIC_SUPABASE_URL=tu_url_de_supabase
PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 3. Configurar Base de Datos

**IMPORTANTE:** Antes de ejecutar la aplicación, debes crear todas las tablas en Supabase.

Sigue las instrucciones en: [`database/INSTALACION_BD.md`](./database/INSTALACION_BD.md)

Ejecuta las migraciones SQL en orden en el SQL Editor de Supabase.

### 4. Ejecutar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`

## 🚀 Deploy a Producción

### Guía Completa de Deploy

Sigue la guía completa en: **[`DEPLOY.md`](./DEPLOY.md)**

### Resumen Rápido

1. **Sube el código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

2. **Deploy en Vercel:**
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Importa tu repositorio de GitHub
   - Configura las variables de entorno:
     - `PUBLIC_SUPABASE_URL`
     - `PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Haz clic en "Deploy"

**📖 Para instrucciones detalladas, ver [`DEPLOY.md`](./DEPLOY.md)**

## 📁 Estructura del Proyecto

```
app-final/
├── database/
│   ├── migrations/          # Migraciones SQL
│   └── INSTALACION_BD.md    # Guía de instalación de BD
├── src/
│   ├── lib/                 # Utilidades y helpers
│   ├── layouts/             # Layouts de Astro
│   ├── pages/               # Páginas (routing)
│   │   ├── admin/           # Páginas admin
│   │   └── api/             # API routes
│   ├── components/           # Componentes Astro
│   └── react/               # Componentes React
│       └── components/      # Componentes reutilizables
├── public/                  # Archivos estáticos
├── vercel.json              # Configuración de Vercel
└── package.json
```

## 🔐 Autenticación y Roles

El sistema usa **Supabase Auth** para autenticación. Los usuarios se crean en Supabase Authentication y se vinculan con la tabla `users`.

### Roles Disponibles:
- `admin` - Acceso completo al sistema
- `encargado` - Gestión de sucursal, stock y órdenes
- `mesero` - Gestión de órdenes y mesas

## 📊 Funcionalidades

### ✅ Implementado:
- ✅ Sistema de autenticación con Supabase
- ✅ Menú QR público con categorías e items
- ✅ Dashboard con KPIs básicos
- ✅ Gestión de mesas (POS)
- ✅ Gestión de órdenes del restaurante
- ✅ Gestión de ingredientes y stock
- ✅ Editor de recetas
- ✅ Sistema de compras a proveedores
- ✅ Gestión de gastos (pequeños y generales)
- ✅ Movimientos de stock automáticos
- ✅ Menú imprimible (formato horizontal)
- ✅ Hero dinámico con imágenes flotantes
- ✅ Diseño responsive y moderno

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
```

### Agregar Nueva Funcionalidad

1. Crear migración SQL si es necesario (en `database/migrations/`)
2. Crear API route en `src/pages/api/`
3. Crear componente React en `src/react/components/`
4. Crear página en `src/pages/`

## 📝 Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | ✅ |
| `PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase | ✅ |

## 🔗 Enlaces Útiles

- [Guía de Instalación de BD](./database/INSTALACION_BD.md)
- [Comandos para GitHub](./COMANDOS_GITHUB.md)
- [Guía de Deploy a Vercel](./DEPLOY_VERCEL.md)
- [Instrucciones de Permisos](./INSTRUCCIONES_PERMISOS.md)

## 📞 Soporte

Para problemas o preguntas:
- Revisa los logs de Supabase para errores de base de datos
- Revisa la consola del navegador para errores de frontend
- Verifica que todas las migraciones SQL estén ejecutadas
- Verifica que las variables de entorno estén configuradas

## 📄 Licencia

Este proyecto es privado y de uso interno.

---

**¡Listo para usar!** 🎉
