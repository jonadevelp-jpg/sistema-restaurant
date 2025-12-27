# 📋 Instrucciones: Configurar Variables de Entorno

## 🚀 Configuración Rápida

### **Paso 1: Obtener Keys de Supabase**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** > **API**
3. Copia los siguientes valores:

   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **anon public** → `PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (privada)

### **Paso 2: Configurar Archivo .env**

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza los valores con tus keys reales:

```env
PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Paso 3: Verificar Configuración**

1. Reinicia el servidor de desarrollo (`npm run dev`)
2. Abre la aplicación en el navegador
3. Si todo está bien, deberías ver el menú digital funcionando

---

## 📝 Variables Requeridas

### **PUBLIC_SUPABASE_URL**
- **Qué es:** URL de tu proyecto Supabase
- **Dónde obtenerla:** Supabase Dashboard > Settings > API > Project URL
- **Ejemplo:** `https://abcdefghijklmnop.supabase.co`
- **Seguridad:** ✅ Pública (puede estar en el frontend)

### **PUBLIC_SUPABASE_ANON_KEY**
- **Qué es:** Clave pública/anónima de Supabase
- **Dónde obtenerla:** Supabase Dashboard > Settings > API > anon public
- **Ejemplo:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Seguridad:** ✅ Pública (puede estar en el frontend)
- **Uso:** Cliente de Supabase en el frontend

### **SUPABASE_SERVICE_ROLE_KEY**
- **Qué es:** Clave privada con permisos completos
- **Dónde obtenerla:** Supabase Dashboard > Settings > API > service_role
- **Ejemplo:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Seguridad:** ⚠️ **PRIVADA** (solo backend, NUNCA frontend)
- **Uso:** Operaciones administrativas (crear usuarios, etc.)

---

## ⚠️ Seguridad

### ✅ **Seguro para Frontend:**
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

### ❌ **NUNCA en Frontend:**
- `SUPABASE_SERVICE_ROLE_KEY` - Solo backend/servidor

---

## 🌐 Configuración para Producción

### **Vercel**
1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega las 3 variables
4. Redeploy

### **Netlify**
1. Ve a tu proyecto en Netlify
2. Site settings > Environment variables
3. Agrega las 3 variables
4. Redeploy

### **Otros Hostings**
- Configura las variables de entorno según la documentación de tu hosting
- Usa los mismos nombres: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔍 Verificar que Funciona

### **1. Verificar en Consola del Navegador**
Abre la consola del navegador (F12) y busca:
- ✅ No deberías ver errores de "Variables de entorno no configuradas"
- ✅ Deberías poder ver datos de Supabase

### **2. Verificar en la Aplicación**
- ✅ El menú digital carga correctamente
- ✅ Las categorías se muestran
- ✅ Puedes hacer login en `/admin/login`

### **3. Verificar en el Código**
Si ves este mensaje en la consola, las variables NO están configuradas:
```
⚠️ ERROR: Variables de entorno de Supabase no configuradas
```

---

## 📁 Archivos Relacionados

- `.env` - Archivo con tus variables (NO subir a Git)
- `.env.example` - Plantilla de ejemplo (SÍ subir a Git)
- `.gitignore` - Debe incluir `.env` para no subirlo

---

## 🆘 Problemas Comunes

### **"Variables de entorno no configuradas"**
- ✅ Verifica que el archivo `.env` existe en la raíz del proyecto
- ✅ Verifica que las variables tienen los nombres correctos
- ✅ Reinicia el servidor después de crear/modificar `.env`

### **"Error conectando con Supabase"**
- ✅ Verifica que las keys son correctas (copia completa)
- ✅ Verifica que no hay espacios extra al inicio/final
- ✅ Verifica que la URL de Supabase es correcta

### **"No puedo crear usuarios"**
- ✅ Verifica que `SUPABASE_SERVICE_ROLE_KEY` está configurada
- ✅ Verifica que es la key `service_role` (no `anon`)
- ✅ Verifica que la key no está expuesta en el frontend

---

¡Listo! Con estas variables configuradas, el sistema debería funcionar correctamente. 🎉

