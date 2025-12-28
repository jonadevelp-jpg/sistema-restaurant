# ⚡ Configuración Rápida en Vercel - PASOS EXACTOS

## 📋 Información que Tienes

De la salida de `ipconfig`:
- **IP:** `192.168.1.122`
- **Token:** (necesitas verificar el archivo `.env`)

---

## 🔍 Paso 1: Verificar el Token Real

El token `tu-token-seguro-aqui` es solo un ejemplo. Necesitas el token real.

### Opción A: Si el script ya generó el token automáticamente

1. Abre el archivo `.env` en la carpeta `servicio-impresion-local`
2. Busca la línea que dice: `PRINT_SERVICE_TOKEN=`
3. Copia el valor que está después del `=` (ejemplo: `restaurante-20241215-12345`)

### Opción B: Si necesitas crear un token nuevo

Abre el archivo `.env` y cambia esta línea:

```env
PRINT_SERVICE_TOKEN=restaurante-20241215-abc123
```

(Puede ser cualquier texto largo y seguro, ejemplo: `mi-restaurante-secreto-2024`)

**IMPORTANTE:** Anota este token exactamente como está (sin espacios).

---

## 🔧 Paso 2: Configurar en Vercel

### 1. Ir a Vercel Dashboard

1. Ve a: https://vercel.com
2. Inicia sesión
3. Selecciona tu proyecto del restaurante

### 2. Agregar Variables de Entorno

1. Ve a **Settings** (Configuración)
2. Haz clic en **Environment Variables** (Variables de Entorno)
3. Haz clic en **Add New** (Agregar Nueva)

#### Variable 1: PRINT_SERVICE_URL

- **Name (Nombre):** `PRINT_SERVICE_URL`
- **Value (Valor):** `http://192.168.1.122:3001`
- **Environment (Entorno):** Marca todas las casillas:
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- Haz clic en **Save** (Guardar)

#### Variable 2: PRINT_SERVICE_TOKEN

- **Name (Nombre):** `PRINT_SERVICE_TOKEN`
- **Value (Valor):** `TU_TOKEN_AQUI` (reemplaza con el token real del `.env`)
- **Environment (Entorno):** Marca todas las casillas:
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- Haz clic en **Save** (Guardar)

### 3. Redesplegar

Después de agregar las variables:

1. Ve a la pestaña **Deployments**
2. Haz clic en los **3 puntos** (⋯) del último deployment
3. Selecciona **Redeploy**
4. Confirma

O simplemente espera - Vercel puede redesplegar automáticamente.

---

## ✅ Paso 3: Verificar que Funciona

### 1. Verificar que el Servicio Local Está Corriendo

En la PC del cliente, ejecuta:

```cmd
pm2 status
```

Debe mostrar `impresion-restaurante` en **verde** con "online".

### 2. Probar la Impresión

1. Abre la aplicación web desde cualquier dispositivo
2. Crea una orden
3. Cambia el estado a "En Preparación"
4. Debe imprimirse automáticamente ✅

### 3. Revisar Logs

Si no imprime, revisa los logs:

**En Vercel:**
- Ve a **Deployments** → Último deployment → **Functions** → Busca logs con `[Printer]`

**En la PC local:**
```cmd
pm2 logs impresion-restaurante
```

---

## 📝 Resumen de Valores para Vercel

```
PRINT_SERVICE_URL=http://192.168.1.122:3001
PRINT_SERVICE_TOKEN=TU_TOKEN_DEL_ARCHIVO_ENV
```

**IMPORTANTE:**
- La IP es: `192.168.1.122`
- El puerto es: `3001`
- El token debe ser **exactamente igual** al del archivo `.env`

---

## 🆘 Si No Funciona

### Error: "Connection refused"

1. Verifica que el servicio local esté corriendo: `pm2 status`
2. Verifica el firewall (el script lo configura automáticamente)
3. Verifica que la IP sea correcta: `ipconfig`

### Error: "Token inválido"

1. Verifica que el token en Vercel sea **exactamente igual** al del `.env`
2. Sin espacios extra
- Sin saltos de línea

### No imprime

1. Verifica que la impresora esté conectada
2. Verifica el puerto en `.env`: `PRINTER_KITCHEN_PATH=USB002`
3. Revisa los logs: `pm2 logs impresion-restaurante`

---

**¡Después de configurar en Vercel, debería funcionar desde cualquier dispositivo!** 🎉







