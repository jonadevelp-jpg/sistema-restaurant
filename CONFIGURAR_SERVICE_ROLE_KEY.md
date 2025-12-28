# 🔑 Configurar Service Role Key para Crear Usuarios

## ⚠️ Error: "Invalid API key" o "Configuración incompleta"

Este error ocurre cuando la clave `SUPABASE_SERVICE_ROLE_KEY` no está configurada correctamente.

## 📋 Pasos para Solucionar

### 1. Obtener la Service Role Key

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** → **API**
3. En la sección **Project API keys**, busca la clave **`service_role`** (secret)
4. Haz clic en el icono de **ojo** para revelar la clave
5. **Copia la clave completa** (es muy larga, empieza con `eyJ...`)

### 2. Configurar en el archivo .env

1. Abre el archivo `.env` en la raíz del proyecto
2. Busca la línea:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
   ```
3. Reemplaza `tu-service-role-key-aqui` con la clave que copiaste:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZ211cXR3ZHV4YnBqYXB1cnZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDYwNTA2NSwiZXhwIjoyMDgwMTgxMDY1fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 3. Verificar que no haya espacios

Asegúrate de que:
- No haya espacios antes o después del `=`
- No haya comillas alrededor del valor
- La clave esté completa (son muy largas, ~200 caracteres)

**Correcto:**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Incorrecto:**
```env
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Espacios
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Comillas
```

### 4. Reiniciar el Servidor

**IMPORTANTE:** Después de modificar el `.env`, debes reiniciar el servidor:

1. Detén el servidor actual: Presiona `Ctrl + C` en la terminal
2. Inicia nuevamente:
   ```bash
   npm run dev
   ```

### 5. Verificar que Funciona

1. Ve a `/admin/empleados`
2. Haz clic en "Nuevo Empleado"
3. Marca "Crear usuario del sistema para este empleado"
4. Completa email y contraseña
5. Guarda

Si funciona correctamente, el usuario se creará sin errores.

## 🔒 Seguridad

- ⚠️ **NUNCA** subas el archivo `.env` a Git
- ⚠️ **NUNCA** expongas la `service_role` key en el cliente
- ✅ El archivo `.env` ya está en `.gitignore`
- ✅ La clave solo se usa en el servidor (endpoint API)

## 🆘 Si Sigue Sin Funcionar

1. **Verifica que copiaste la clave completa:**
   - Las claves de Supabase son muy largas (~200 caracteres)
   - Asegúrate de copiar desde el inicio (`eyJ`) hasta el final

2. **Verifica el formato del archivo .env:**
   - Debe estar en la raíz del proyecto
   - Debe llamarse exactamente `.env` (no `.env.txt` o `.env.local`)
   - No debe tener espacios alrededor del `=`

3. **Verifica que reiniciaste el servidor:**
   - Astro solo carga las variables de entorno al iniciar
   - Si modificaste `.env` sin reiniciar, los cambios no se aplicarán

4. **Revisa la consola del servidor:**
   - Deberías ver mensajes de error más específicos
   - Si ves "SUPABASE_SERVICE_ROLE_KEY no está configurada", significa que no se está leyendo correctamente

## 📝 Ejemplo Completo de .env

```env
# URL del proyecto Supabase
PUBLIC_SUPABASE_URL=https://fpgmuqtwduxbpjapurvs.supabase.co

# Clave anónima pública (para cliente)
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZ211cXR3ZHV4YnBqYXB1cnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDUwNjUsImV4cCI6MjA4MDE4MTA2NX0.D6Mwtpkk2WaQ202-oAnjkl3XxgR8KMDtRuR-_y6NfqI

# Clave de servicio (service_role) - SOLO PARA SERVIDOR
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZ211cXR3ZHV4YnBqYXB1cnZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDYwNTA2NSwiZXhwIjoyMDgwMTgxMDY1fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```







