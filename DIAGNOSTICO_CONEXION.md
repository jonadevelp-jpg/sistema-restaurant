# 🔍 Diagnóstico de Conexión a Supabase

## 🚨 Problema: Base de datos desconectada

Si el menú digital no muestra nada y la base de datos parece desconectada, sigue estos pasos:

## 📋 Paso 1: Verificar Variables de Entorno

1. **Abre tu archivo `.env` en la raíz del proyecto**
2. **Verifica que tenga estas líneas:**

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key-aqui
```

3. **Verifica que:**
   - No haya espacios alrededor del `=`
   - No haya comillas alrededor de los valores
   - Las variables empiecen con `PUBLIC_`
   - El archivo se llame exactamente `.env` (no `.env.txt` o `.env.local`)

## 📋 Paso 2: Probar Conexión

### Opción A: Endpoint de Diagnóstico (Recomendado)

1. **Inicia el servidor:**
   ```bash
   npm run dev
   ```

2. **Abre en tu navegador:**
   ```
   http://localhost:4321/api/test-supabase
   ```

3. **Deberías ver un JSON con:**
   - `success: true` si la conexión funciona
   - `success: false` si hay problemas
   - Detalles del error si algo falla

### Opción B: Endpoint de Variables de Entorno

1. **Abre en tu navegador:**
   ```
   http://localhost:4321/api/test-env
   ```

2. **Verifica que todas las variables estén configuradas**

## 📋 Paso 3: Verificar en Consola del Navegador

1. **Abre la consola del navegador (F12)**
2. **Recarga la página**
3. **Busca mensajes que empiecen con:**
   - `✅` = Todo bien
   - `❌` = Error
   - `⚠️` = Advertencia

## 📋 Paso 4: Verificar en Consola del Servidor

1. **Mira la terminal donde corre `npm run dev`**
2. **Busca mensajes sobre Supabase:**
   - `✅ Cliente de Supabase inicializado correctamente` = OK
   - `❌ ERROR CRÍTICO: Variables de entorno...` = Problema con .env

## 🔧 Soluciones Comunes

### Problema: "Variables de entorno no configuradas"

**Solución:**
1. Verifica que el archivo `.env` existe en la raíz del proyecto (mismo nivel que `package.json`)
2. Reinicia el servidor completamente:
   ```bash
   # Detén el servidor (Ctrl + C)
   # Luego inicia de nuevo:
   npm run dev
   ```

### Problema: "Invalid API key"

**Solución:**
1. Ve a Supabase Dashboard → Settings → API
2. Copia la clave `anon public` completa (es muy larga, ~200 caracteres)
3. Pégala en `.env` sin espacios
4. Reinicia el servidor

### Problema: "Network error" o "Failed to fetch"

**Solución:**
1. Verifica que la URL de Supabase sea correcta
2. Verifica tu conexión a internet
3. Verifica que el proyecto de Supabase esté activo (no pausado)

### Problema: "Permission denied" o "RLS policy"

**Solución:**
1. Ejecuta el script SQL: `database/FIX_PERMISOS_PEDIDOS.sql`
2. Verifica que las políticas RLS estén correctas

## 🧪 Prueba Rápida

Ejecuta esto en la consola del navegador (F12):

```javascript
fetch('/api/test-supabase')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

Deberías ver un objeto con `success: true` si todo está bien.

## 📞 Si Nada Funciona

1. **Comparte el resultado de:**
   - `http://localhost:4321/api/test-supabase`
   - `http://localhost:4321/api/test-env`

2. **Comparte los mensajes de la consola del navegador (F12)**

3. **Verifica que tu proyecto de Supabase esté activo:**
   - Ve a https://app.supabase.com
   - Verifica que tu proyecto no esté pausado




