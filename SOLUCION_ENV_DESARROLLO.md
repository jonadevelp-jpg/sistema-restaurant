# 🔧 Solución: Variables de Entorno No Se Leen en Desarrollo

## ⚠️ Problema

Las variables de entorno están en el archivo `.env` pero Astro no las está leyendo en desarrollo.

## ✅ Solución Paso a Paso

### **Paso 1: Verificar Ubicación del .env**

El archivo `.env` **DEBE estar en la raíz del proyecto**:

```
sistema-restaurant/
  ├── .env              ← DEBE estar aquí
  ├── astro.config.mjs
  ├── package.json
  ├── src/
  └── ...
```

**Verifica:**
1. Abre la carpeta `sistema-restaurant`
2. Verifica que existe el archivo `.env` (puede estar oculto)
3. Si no está, créalo ahí

### **Paso 2: Verificar Contenido del .env**

El archivo `.env` debe tener este formato (sin espacios extra):

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Verifica:**
- ✅ No hay espacios antes o después del `=`
- ✅ No hay comillas alrededor de los valores
- ✅ Cada variable está en una línea separada
- ✅ No hay líneas vacías con espacios

### **Paso 3: REINICIAR el Servidor de Desarrollo**

**MUY IMPORTANTE:** Astro carga las variables de entorno **solo al iniciar**.

1. **Detén el servidor:**
   - Presiona `Ctrl + C` en la terminal donde corre `npm run dev`

2. **Reinicia el servidor:**
   ```bash
   cd sistema-restaurant
   npm run dev
   ```

3. **Espera a que inicie completamente** (verás "Local: http://localhost:4321")

### **Paso 4: Verificar que Funciona**

#### **Opción A: Usar el Endpoint de Prueba**

Abre en el navegador:
```
http://localhost:4321/api/test-env
```

**Deberías ver:**
```json
{
  "success": true,
  "env": {
    "PUBLIC_SUPABASE_URL": {
      "value": "https://egajmxcpznjapqbawiq.supabase.co...",
      "configured": true,
      "length": 45
    },
    "PUBLIC_SUPABASE_ANON_KEY": {
      "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "configured": true,
      "length": 200
    }
  },
  "allConfigured": true,
  "message": "✅ Todas las variables están configuradas"
}
```

#### **Opción B: Verificar en la Consola del Navegador**

1. Abre `http://localhost:4321`
2. Abre la consola del navegador (F12)
3. Busca mensajes que empiecen con:
   - `✅ Categorías encontradas:` (si funciona)
   - `⚠️ ERROR: Variables de entorno de Supabase no configuradas` (si no funciona)

### **Paso 5: Si Aún No Funciona**

#### **Verificar que el .env está en la ubicación correcta:**

```bash
# Desde la raíz del proyecto
cd sistema-restaurant
dir .env
# O en Linux/Mac:
ls -la .env
```

#### **Verificar que no hay errores de sintaxis:**

Abre el `.env` y verifica:
- ✅ No hay caracteres especiales raros
- ✅ No hay BOM (Byte Order Mark) - guarda como UTF-8 sin BOM
- ✅ No hay espacios invisibles

#### **Probar con valores directos (temporal):**

Si nada funciona, prueba agregar las variables directamente en `astro.config.mjs`:

```javascript
export default defineConfig({
  // ... otras configuraciones
  env: {
    PUBLIC_SUPABASE_URL: 'https://tu-proyecto.supabase.co',
    PUBLIC_SUPABASE_ANON_KEY: 'tu-key-aqui',
  },
});
```

**⚠️ Esto es solo para probar. Luego vuelve a usar .env**

---

## 🔍 Diagnóstico Rápido

### **1. ¿El servidor se reinició después de crear el .env?**
- ❌ NO → Reinicia con `npm run dev`
- ✅ SÍ → Sigue al paso 2

### **2. ¿El .env está en la raíz del proyecto?**
- ❌ NO → Muévelo a `sistema-restaurant/.env`
- ✅ SÍ → Sigue al paso 3

### **3. ¿Las variables tienen el prefijo PUBLIC_?**
- ❌ NO → Agrega `PUBLIC_` al inicio
- ✅ SÍ → Sigue al paso 4

### **4. ¿El endpoint /api/test-env muestra las variables?**
- ❌ NO → Hay un problema con la carga del .env
- ✅ SÍ → Las variables están cargadas, el problema es otro

---

## 📝 Notas Importantes

1. **Astro solo lee .env al iniciar** - Siempre reinicia después de modificar
2. **Las variables con PUBLIC_ son accesibles desde el navegador**
3. **El .env NO debe subirse a Git** (ya está en .gitignore)
4. **En producción (Vercel/etc)**, configura las variables en el dashboard del hosting

---

## 🆘 Si Nada Funciona

1. Verifica que estás en el directorio correcto:
   ```bash
   cd sistema-restaurant
   pwd  # Debe mostrar: .../sistema-restaurant
   ```

2. Crea el .env desde cero:
   ```bash
   # Elimina el .env actual
   # Crea uno nuevo con solo estas 3 líneas:
   PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=tu-key-aqui
   SUPABASE_SERVICE_ROLE_KEY=tu-service-key-aqui
   ```

3. Reinicia el servidor completamente:
   ```bash
   # Detén con Ctrl+C
   # Espera 2 segundos
   npm run dev
   ```

---

¡Con estos pasos deberías poder leer las variables de entorno en desarrollo! 🎉




