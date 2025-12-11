# 🚀 Guía de Deploy a Vercel

Esta guía te ayudará a subir el proyecto a GitHub y desplegarlo en Vercel.

## 📋 Prerequisitos

1. Cuenta de GitHub
2. Cuenta de Vercel
3. Proyecto Supabase configurado

## 🔧 Paso 1: Preparar el Repositorio Local

### 1.1 Verificar que estás en el directorio correcto

```bash
cd app-final
```

### 1.2 Inicializar Git (si no está inicializado)

```bash
git init
```

### 1.3 Agregar todos los archivos

```bash
git add .
```

### 1.4 Hacer el primer commit

```bash
git commit -m "Initial commit: Sistema Restaurante Completo"
```

## 📤 Paso 2: Crear Repositorio en GitHub

### 2.1 Crear el repositorio en GitHub

1. Ve a [GitHub](https://github.com/new)
2. Nombre del repositorio: `sistema-restaurante-completo` (o el nombre que prefieras)
3. Descripción: "Sistema completo de gestión para restaurante con menú QR, POS, y administración"
4. **NO** marques "Initialize with README" (ya tenemos uno)
5. Haz clic en "Create repository"

### 2.2 Conectar el repositorio local con GitHub

GitHub te mostrará comandos similares a estos. **Reemplaza `TU_USUARIO` y `TU_REPOSITORIO`** con tus valores:

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

## 🔐 Paso 3: Configurar Variables de Entorno en Vercel

### 3.1 Conectar con Vercel

1. Ve a [Vercel](https://vercel.com)
2. Haz clic en "Add New Project"
3. Importa tu repositorio de GitHub
4. Selecciona el proyecto

### 3.2 Configurar Variables de Entorno

En la sección "Environment Variables", agrega:

```
PUBLIC_SUPABASE_URL=tu_url_de_supabase
PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

**Importante:** 
- Marca estas variables para **Production**, **Preview** y **Development**
- Reemplaza los valores con tus credenciales reales de Supabase

### 3.3 Configuración del Proyecto

Vercel debería detectar automáticamente:
- **Framework Preset:** Astro
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Si no se detecta automáticamente, configura manualmente:
- **Root Directory:** `app-final` (si el repo está en la raíz) o `.` (si solo está app-final)
- **Framework Preset:** Astro
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 3.4 Deploy

1. Haz clic en "Deploy"
2. Espera a que termine el build
3. Tu aplicación estará disponible en `https://tu-proyecto.vercel.app`

## 🔄 Paso 4: Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Vercel desplegará automáticamente los cambios.

## ⚙️ Configuración Adicional

### Variables de Entorno en Vercel

Si necesitas agregar más variables:

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega la variable
4. Selecciona los ambientes (Production, Preview, Development)
5. Guarda

### Dominio Personalizado

1. Ve a Settings > Domains
2. Agrega tu dominio
3. Sigue las instrucciones de DNS

## 🐛 Solución de Problemas

### Error: Build Failed

- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs de build en Vercel
- Asegúrate de que `package.json` tenga todas las dependencias

### Error: Module not found

- Verifica que `node_modules` esté en `.gitignore`
- Asegúrate de que `package.json` esté correcto
- Vercel instalará las dependencias automáticamente

### Error: Supabase connection failed

- Verifica las variables de entorno en Vercel
- Asegúrate de que las URLs y keys sean correctas
- Verifica que Supabase permita conexiones desde tu dominio de Vercel

## 📝 Notas Importantes

1. **Nunca subas el archivo `.env`** - Está en `.gitignore`
2. **Las variables de entorno deben configurarse en Vercel**, no en el código
3. **El build se ejecuta automáticamente** en cada push a la rama main
4. **Las migraciones SQL deben ejecutarse manualmente** en Supabase antes del primer deploy

## ✅ Checklist de Deploy

- [ ] Repositorio creado en GitHub
- [ ] Código subido a GitHub
- [ ] Proyecto conectado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] Base de datos configurada en Supabase
- [ ] Migraciones SQL ejecutadas
- [ ] Primer deploy exitoso
- [ ] Aplicación funcionando en producción

---

**¡Listo para desplegar!** 🚀


