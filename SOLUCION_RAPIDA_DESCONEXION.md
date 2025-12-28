# 🚨 Solución Rápida: Base de Datos Desconectada

## ⚡ Solución en 3 Pasos

### 1️⃣ Verifica tu archivo `.env`

**Ubicación:** Debe estar en la raíz del proyecto (mismo nivel que `package.json`)

**Contenido mínimo:**
```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key-aqui
```

### 2️⃣ Reinicia el servidor

```bash
# Detén el servidor (Ctrl + C)
# Luego inicia de nuevo:
npm run dev
```

### 3️⃣ Prueba la conexión

Abre en tu navegador:
```
http://localhost:4321/api/test-supabase
```

**Si ves `"success": true`** → ✅ Todo está bien, recarga la página principal

**Si ves `"success": false`** → Sigue leyendo abajo

---

## 🔍 Diagnóstico Detallado

### Si el endpoint dice "Variables de entorno no configuradas"

1. **Verifica que el archivo `.env` existe:**
   - Debe estar en: `sistema-restaurant/.env`
   - No debe llamarse `.env.txt` o `.env.local`

2. **Verifica el formato:**
   ```env
   # ✅ CORRECTO
   PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # ❌ INCORRECTO (con espacios)
   PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   
   # ❌ INCORRECTO (con comillas)
   PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
   ```

3. **Reinicia el servidor** (Astro solo carga .env al iniciar)

### Si el endpoint dice "Error conectando a Supabase"

1. **Verifica que las claves sean correctas:**
   - Ve a Supabase Dashboard → Settings → API
   - Copia la URL completa del proyecto
   - Copia la clave `anon public` (no `service_role`)

2. **Verifica que el proyecto de Supabase esté activo:**
   - Ve a https://app.supabase.com
   - Asegúrate de que tu proyecto no esté pausado

3. **Verifica tu conexión a internet**

### Si el endpoint dice "Permission denied" o código "PGRST301"

**Ejecuta este script SQL en Supabase:**

1. Ve a Supabase Dashboard → SQL Editor
2. Copia y pega el contenido de: `database/FIX_PERMISOS_PEDIDOS.sql`
3. Ejecuta (RUN o Ctrl+Enter)

---

## 📝 Obtener tus Credenciales de Supabase

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → va en `PUBLIC_SUPABASE_URL`
   - **anon public** key → va en `PUBLIC_SUPABASE_ANON_KEY`

---

## 🧪 Prueba Rápida en Consola

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Probar conexión
fetch('/api/test-supabase')
  .then(r => r.json())
  .then(data => {
    console.log('Resultado:', data);
    if (data.success) {
      console.log('✅ Conexión OK');
    } else {
      console.error('❌ Error:', data.error || data.message);
    }
  });
```

---

## 📞 Si Nada Funciona

1. **Comparte el resultado de:**
   ```
   http://localhost:4321/api/test-supabase
   ```

2. **Comparte los mensajes de la consola del navegador (F12)**

3. **Verifica que tu proyecto de Supabase esté activo**



