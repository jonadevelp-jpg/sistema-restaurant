# 🚨 URGENTE: Crear Archivo .env

## ❌ Problema Detectado

**No se encontró el archivo `.env` en tu proyecto.** Esto es por qué la base de datos está desconectada.

## ✅ Solución en 2 Minutos

### Paso 1: Crear el archivo `.env`

1. **Ve a la carpeta del proyecto:**
   ```
   sistema-restaurant/
   ```

2. **Crea un archivo nuevo llamado `.env`** (sin extensión, solo `.env`)

3. **Copia y pega esto en el archivo:**

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### Paso 2: Obtener tus Keys de Supabase

1. **Ve a:** https://app.supabase.com
2. **Selecciona tu proyecto**
3. **Ve a:** Settings → API
4. **Copia estos valores:**

   - **Project URL** → Reemplaza `https://tu-proyecto.supabase.co`
   - **anon public** → Reemplaza `tu_anon_key_aqui`
   - **service_role** → Reemplaza `tu_service_role_key_aqui`

### Paso 3: Actualizar el archivo `.env`

**Ejemplo real (reemplaza con tus valores):**

```env
PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM4OTY3MjkwLCJleHAiOjE5NTQ1NDMyOTB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Paso 4: Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl + C)
# Luego inicia de nuevo:
npm run dev
```

### Paso 5: Verificar que Funciona

1. **Abre en tu navegador:**
   ```
   http://localhost:4321/api/test-supabase
   ```

2. **Deberías ver:**
   ```json
   {
     "success": true,
     "message": "✅ Conexión a Supabase exitosa"
   }
   ```

3. **Si ves `"success": true`**, recarga la página principal y deberías ver el menú digital.

---

## ⚠️ Importante

- **NO** pongas espacios alrededor del `=`
- **NO** pongas comillas alrededor de los valores
- **NO** subas el archivo `.env` a Git (ya está en `.gitignore`)

---

## 🆘 Si Sigue Sin Funcionar

1. **Verifica que el archivo se llame exactamente `.env`** (no `.env.txt`)

2. **Verifica que esté en la raíz del proyecto** (mismo nivel que `package.json`)

3. **Abre la consola del navegador (F12)** y busca mensajes de error

4. **Comparte el resultado de:**
   ```
   http://localhost:4321/api/test-supabase
   ```




