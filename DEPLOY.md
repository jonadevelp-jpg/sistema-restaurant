# 🚀 Guía de Deploy a Producción

Esta guía te ayudará a desplegar el proyecto en Vercel y GitHub.

## 📋 Prerequisitos

1. ✅ Cuenta en [GitHub](https://github.com)
2. ✅ Cuenta en [Vercel](https://vercel.com)
3. ✅ Proyecto Supabase configurado
4. ✅ Base de datos migrada (ver `database/000_INSTALACION_COMPLETA.sql`)

## 🔧 Paso 1: Preparar el Proyecto

### 1.1 Verificar Archivos

Asegúrate de que estos archivos existan:
- ✅ `.gitignore` (ya existe)
- ✅ `.env.example` (ya existe)
- ✅ `vercel.json` (ya existe)
- ✅ `package.json` (ya existe)

### 1.2 Verificar que NO hay archivos sensibles

**IMPORTANTE:** Asegúrate de que NO estés subiendo:
- ❌ `.env`
- ❌ `.env.local`
- ❌ `.env.production`
- ❌ Cualquier archivo con claves o tokens

## 📤 Paso 2: Subir a GitHub

### 2.1 Inicializar Git (si no está inicializado)

```bash
cd sistema-restaurant
git init
```

### 2.2 Agregar archivos

```bash
git add .
```

### 2.3 Verificar qué se va a subir

```bash
git status
```

**Asegúrate de que NO aparezcan archivos `.env`**

### 2.4 Crear commit inicial

```bash
git commit -m "Initial commit: Sistema restaurante completo"
```

### 2.5 Crear repositorio en GitHub

1. Ve a [GitHub](https://github.com/new)
2. Crea un nuevo repositorio (público o privado)
3. **NO** inicialices con README, .gitignore o licencia

### 2.6 Conectar y subir

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

## 🚀 Paso 3: Deploy en Vercel

### 3.1 Importar Proyecto

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en **"Add New..."** → **"Project"**
3. Selecciona **"Import Git Repository"**
4. Conecta tu cuenta de GitHub si es necesario
5. Selecciona tu repositorio

### 3.2 Configurar Proyecto

Vercel detectará automáticamente:
- ✅ Framework: Astro
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `.vercel/output`

**No necesitas cambiar nada**, solo haz clic en **"Deploy"**

### 3.3 Configurar Variables de Entorno

**ANTES de hacer deploy**, configura estas variables en Vercel:

1. En la página de configuración del proyecto, ve a **"Environment Variables"**
2. Agrega estas variables:

```
PUBLIC_SUPABASE_URL = https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY = tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY = tu_service_role_key_aqui
```

3. Selecciona **"Production", "Preview" y "Development"** para cada variable
4. Haz clic en **"Save"**

### 3.4 Hacer Deploy

1. Haz clic en **"Deploy"**
2. Espera a que termine el build (2-5 minutos)
3. ¡Listo! Tu aplicación estará en `https://tu-proyecto.vercel.app`

## ✅ Paso 4: Verificar Deploy

### 4.1 Verificar que la aplicación carga

1. Abre la URL de Vercel
2. Verifica que el menú digital carga correctamente
3. Verifica que puedes acceder a `/admin/login`

### 4.2 Verificar Variables de Entorno

Si hay errores, verifica:
1. Que las variables de entorno estén configuradas en Vercel
2. Que los valores sean correctos (sin espacios extra)
3. Que las variables tengan el prefijo `PUBLIC_` si son para el cliente

### 4.3 Verificar Base de Datos

1. Verifica que las tablas estén creadas en Supabase
2. Verifica que las políticas RLS estén configuradas
3. Ejecuta `database/FIX_TODO_DE_UNA_VEZ.sql` si hay errores de permisos

## 🔄 Paso 5: Deploy Automático

Una vez configurado, cada vez que hagas `git push` a GitHub:

1. Vercel detectará los cambios automáticamente
2. Creará un nuevo build
3. Desplegará automáticamente a producción

### 5.1 Preview Deployments

Vercel creará un preview deployment para cada Pull Request:
- URL única para cada PR
- Perfecto para testing antes de merge

## 🐛 Solución de Problemas

### Error: "Environment variables not found"

**Solución:**
1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Verifica que todas las variables estén configuradas
3. Verifica que estén habilitadas para "Production"

### Error: "Build failed"

**Solución:**
1. Revisa los logs de build en Vercel
2. Verifica que `package.json` tenga todos los scripts necesarios
3. Verifica que no haya errores de TypeScript

### Error: "Database connection failed"

**Solución:**
1. Verifica que `PUBLIC_SUPABASE_URL` sea correcta
2. Verifica que `PUBLIC_SUPABASE_ANON_KEY` sea correcta
3. Verifica que las políticas RLS permitan acceso público a `categories` y `menu_items`

### Error: "401 Unauthorized" en admin

**Solución:**
1. Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
2. Verifica que las políticas RLS estén correctas
3. Ejecuta `database/FIX_TODO_DE_UNA_VEZ.sql` en Supabase

## 📝 Checklist Final

Antes de considerar el deploy completo:

- [ ] Código subido a GitHub
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Build exitoso en Vercel
- [ ] Aplicación accesible en producción
- [ ] Menú digital carga correctamente
- [ ] Admin panel accesible
- [ ] Base de datos conectada
- [ ] Políticas RLS configuradas

## 🎉 ¡Listo!

Tu aplicación está desplegada y lista para producción.

**URL de producción:** `https://tu-proyecto.vercel.app`

---

**Nota:** Si necesitas cambiar variables de entorno después del deploy:
1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Edita las variables
3. Haz un nuevo deploy (o espera al siguiente push)



