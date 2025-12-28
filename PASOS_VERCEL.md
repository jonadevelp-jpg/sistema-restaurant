# ⚡ Pasos Exactos para Configurar en Vercel

## 📋 Información que Tienes

- **IP:** `192.168.1.122` (de la salida de ipconfig)
- **Token:** Necesitas verificar el archivo `.env` en `servicio-impresion-local`

---

## 🔍 Paso 1: Obtener el Token Real

El token `tu-token-seguro-aqui` es solo un ejemplo. Necesitas el token real.

### Si el script `instalar-automatico.bat` ya se ejecutó:

1. Abre la carpeta `servicio-impresion-local`
2. Abre el archivo `.env` con Bloc de Notas
3. Busca la línea: `PRINT_SERVICE_TOKEN=`
4. Copia el valor que está después del `=`

**Ejemplo:**
```env
PRINT_SERVICE_TOKEN=restaurante-20241215-12345
```
En este caso, el token es: `restaurante-20241215-12345`

### Si el archivo .env no existe o tiene el ejemplo:

1. Abre el archivo `.env` en `servicio-impresion-local`
2. Busca: `PRINT_SERVICE_TOKEN=tu-token-seguro-aqui`
3. Cámbialo por algo seguro, por ejemplo:
   ```env
   PRINT_SERVICE_TOKEN=mi-restaurante-2024-secreto-abc123
   ```
4. Guarda el archivo (Ctrl+S)

---

## 🔧 Paso 2: Configurar en Vercel (Pasos Exactos)

### 1. Ir a Vercel

1. Ve a: **https://vercel.com**
2. Inicia sesión
3. Selecciona tu proyecto del restaurante

### 2. Ir a Variables de Entorno

1. Haz clic en **Settings** (Configuración) en el menú superior
2. En el menú lateral izquierdo, haz clic en **Environment Variables**

### 3. Agregar Primera Variable: PRINT_SERVICE_URL

1. Haz clic en el botón **Add New** (Agregar Nueva)
2. En **Name** (Nombre), escribe exactamente:
   ```
   PRINT_SERVICE_URL
   ```
3. En **Value** (Valor), escribe:
   ```
   http://192.168.1.122:3001
   ```
4. En **Environment** (Entorno), marca **TODAS** las casillas:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Haz clic en **Save** (Guardar)

### 4. Agregar Segunda Variable: PRINT_SERVICE_TOKEN

1. Haz clic en **Add New** (Agregar Nueva) de nuevo
2. En **Name** (Nombre), escribe exactamente:
   ```
   PRINT_SERVICE_TOKEN
   ```
3. En **Value** (Valor), pega el token que copiaste del archivo `.env`
   - Ejemplo: `restaurante-20241215-12345`
   - O el que configuraste manualmente
4. En **Environment** (Entorno), marca **TODAS** las casillas:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Haz clic en **Save** (Guardar)

### 5. Redesplegar

1. Ve a la pestaña **Deployments** (Despliegues)
2. Busca el último deployment (el más reciente)
3. Haz clic en los **3 puntos** (⋯) a la derecha
4. Selecciona **Redeploy** (Redesplegar)
5. Confirma

**O simplemente espera** - Vercel puede redesplegar automáticamente en unos segundos.

---

## ✅ Paso 3: Verificar

### Verificar Variables en Vercel

Deberías ver estas dos variables:

```
✅ PRINT_SERVICE_URL = http://192.168.1.122:3001
✅ PRINT_SERVICE_TOKEN = (tu token aquí)
```

### Probar que Funciona

1. Abre la aplicación web desde cualquier dispositivo
2. Crea una orden
3. Cambia el estado a "En Preparación"
4. Debe imprimirse automáticamente en la impresora ✅

---

## 📝 Resumen de Valores

```
PRINT_SERVICE_URL=http://192.168.1.122:3001
PRINT_SERVICE_TOKEN=TU_TOKEN_DEL_ARCHIVO_ENV
```

**IMPORTANTE:**
- ✅ IP: `192.168.1.122`
- ✅ Puerto: `3001`
- ✅ Token: Debe ser **exactamente igual** al del archivo `.env`

---

## 🆘 Si No Funciona

### "No imprime"

1. Verifica que el servicio local esté corriendo:
   - En la PC del cliente, ejecuta: `pm2 status`
   - Debe mostrar `impresion-restaurante` en verde

2. Verifica el token:
   - Debe ser **exactamente igual** en Vercel y en el `.env`
   - Sin espacios extra
   - Sin saltos de línea

3. Verifica la IP:
   - Si el cliente cambia de red WiFi, la IP puede cambiar
   - Ejecuta `ipconfig` de nuevo y actualiza en Vercel

---

**¡Después de esto, debería funcionar desde cualquier dispositivo!** 🎉







