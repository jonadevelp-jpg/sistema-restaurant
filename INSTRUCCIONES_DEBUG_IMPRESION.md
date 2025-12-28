# 🔍 Instrucciones para Debug de Impresión

## ✅ Cambios Realizados

He agregado **logging detallado** en todo el flujo de impresión para diagnosticar el problema.

---

## 📋 Pasos para Diagnosticar

### Paso 1: Abrir Consola del Navegador

1. Abre tu aplicación en el navegador
2. Presiona **F12** (o clic derecho → Inspeccionar)
3. Ve a la pestaña **"Console"**

### Paso 2: Cambiar Estado de una Orden

1. Crea una orden y agrega items
2. Haz clic en el botón **"⏳ Preparación"** (NO en "🖨️ Comanda")
3. Observa los mensajes en la consola

**Deberías ver:**
```
[OrdenForm] Llamando a API route para cambiar estado: preparing
[OrdenForm] API route respondió correctamente: {...}
```

O si hay error:
```
[OrdenForm] API route falló: 500 {...}
[OrdenForm] Usando método directo (fallback)
```

### Paso 3: Ver Logs del Servidor (Vercel)

1. Ve a: https://vercel.com → Tu proyecto → Deployments
2. Haz clic en el último deployment
3. Ve a la pestaña **"Functions"** o **"Logs"**
4. Busca mensajes con `[Printer]` o `[API]`

**Deberías ver:**
```
[API] Estado cambió a "preparing" - activando impresión de comanda
[Printer] printKitchenCommand llamado para orden: ORD-001
[Printer] isLocalServer(): false
[Printer] PRINT_SERVICE_URL: http://192.168.1.122:3001
[Printer] PRINT_SERVICE_TOKEN: ***configurado***
[Printer] Servidor en la nube - enviando a servicio local de impresión
[Printer] sendToLocalPrintService - URL: http://192.168.1.122:3001
[Printer] sendToLocalPrintService - Token: ***presente***
[Printer] Enviando petición a: http://192.168.1.122:3001
[Printer] Respuesta del servicio local: 200 OK
[Printer] ✅ Comanda enviada a servicio local: Comanda impresa correctamente
```

**O si hay error:**
```
[Printer] ❌ Error enviando a servicio local: Connection refused
```

### Paso 4: Ver Logs del Servicio Local

En la PC del local (con la impresora):

```cmd
cd C:\servicio-impresion-local
pm2 logs impresion-restaurante
```

**Deberías ver cuando cambias el estado:**
```
✅ Comanda impresa: Orden ORD-001
```

**O si hay error:**
```
❌ Error conectando a impresora: ...
```

---

## 🔍 Qué Buscar en los Logs

### Si NO ves `[Printer] printKitchenCommand llamado`:

**Problema:** La API route no se está llamando o no detecta el cambio de estado.

**Verifica:**
- ¿Ves `[OrdenForm] Llamando a API route` en la consola del navegador?
- ¿La API route responde correctamente?
- ¿El estado cambió realmente? (verifica en la base de datos)

---

### Si ves `PRINT_SERVICE_URL: undefined` o `PRINT_SERVICE_TOKEN: NO configurado`:

**Problema:** Las variables no están configuradas en Vercel.

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Agrega:
   ```
   PRINT_SERVICE_URL=http://192.168.1.122:3001
   PRINT_SERVICE_TOKEN=tu-token-aqui
   ```
3. Redesplegar

---

### Si ves `Error enviando a servicio local: Connection refused`:

**Problema:** El servicio local no está corriendo o la IP es incorrecta.

**Solución:**
1. Verifica que el servicio esté corriendo: `pm2 status`
2. Verifica la IP: `ipconfig` (puede haber cambiado)
3. Actualiza `PRINT_SERVICE_URL` en Vercel
4. Verifica el firewall

---

### Si ves `Token inválido` o `401 Unauthorized`:

**Problema:** El token no coincide.

**Solución:**
1. Verifica el token en el archivo `.env` del servicio local
2. Verifica que sea **exactamente igual** en Vercel
3. Sin espacios extra, sin saltos de línea

---

### Si ves `✅ Comanda enviada a servicio local` pero no imprime:

**Problema:** El servicio local recibió la petición pero no puede imprimir.

**Solución:**
1. Verifica los logs del servicio local: `pm2 logs impresion-restaurante`
2. Verifica que la impresora esté conectada y encendida
3. Verifica el puerto en `.env`: `PRINTER_KITCHEN_PATH=USB002`

---

## 📝 Resumen

1. ✅ Abre la consola del navegador (F12)
2. ✅ Cambia el estado de una orden
3. ✅ Revisa los mensajes en la consola
4. ✅ Revisa los logs de Vercel
5. ✅ Revisa los logs del servicio local

**Con estos logs podremos identificar exactamente dónde está fallando.** 🔍

---

**Ejecuta estos pasos y comparte conmigo qué mensajes ves en cada lugar.** 📋







