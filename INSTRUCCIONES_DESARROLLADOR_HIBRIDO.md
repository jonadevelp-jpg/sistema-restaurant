# 👨‍💻 Instrucciones para el Desarrollador - Configuración Híbrida

## 📋 Lo que el Dueño Necesita Hacer (Una Vez)

1. Instalar Node.js desde https://nodejs.org
2. Ejecutar `instalar-automatico.bat`
3. Configurar el puerto de la impresora en `.env`
4. Enviarte la IP y el token

**Ver `GUIA_PARA_DUENO.md` para las instrucciones que le darás al dueño.**

---

## 🔧 Lo que Tú Necesitas Hacer

### 1. Recibir Información del Dueño

El dueño te enviará:
```
IP: 192.168.1.50
Token: restaurante-20241215-12345
```

### 2. Configurar Variables en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. Ve a **Settings** → **Environment Variables**
3. Agrega estas variables:

```
PRINT_SERVICE_URL=http://192.168.1.50:3001
PRINT_SERVICE_TOKEN=restaurante-20241215-12345
```

**IMPORTANTE:**
- `PRINT_SERVICE_URL` debe ser la IP local de la PC con la impresora
- `PRINT_SERVICE_TOKEN` debe ser **exactamente igual** al del servicio local
- Si la IP cambia, actualiza `PRINT_SERVICE_URL`

### 3. Redesplegar

Después de agregar las variables:
- Vercel redesplegará automáticamente, o
- Ve a **Deployments** → **Redeploy**

---

## 🔄 Si el Dueño Cambia la Impresora

### Escenario 1: Solo cambia el puerto (USB002 → COM3)

**El dueño hace:**
1. Ejecuta `configurar-impresora.bat`
2. Cambia el puerto en `.env`
3. Guarda

**Tú NO necesitas hacer nada** - el token y la IP no cambian.

### Escenario 2: Cambia la IP (cambia de red WiFi)

**El dueño hace:**
1. Ejecuta `ipconfig` para ver la nueva IP
2. Te envía la nueva IP

**Tú haces:**
1. Actualiza `PRINT_SERVICE_URL` en Vercel con la nueva IP
2. Redesplegar

### Escenario 3: Cambia el token

**El dueño hace:**
1. Edita `.env` y cambia `PRINT_SERVICE_TOKEN`
2. Te envía el nuevo token

**Tú haces:**
1. Actualiza `PRINT_SERVICE_TOKEN` en Vercel
2. Redesplegar

---

## ✅ Verificación

### Verificar que Funciona

1. El dueño ejecuta: `pm2 status`
   - Debe ver `impresion-restaurante` en verde

2. Desde la aplicación web:
   - Crea una orden
   - Cambia a "En Preparación"
   - Debe imprimirse automáticamente

3. Revisa logs de Vercel:
   - Debe mostrar: `[Printer] Servidor en la nube - enviando a servicio local de impresión`
   - Y luego: `[Printer] Comanda enviada a servicio local: Comanda impresa correctamente`

---

## 🆘 Solución de Problemas

### "No se imprime desde otro dispositivo"

1. **Verifica que el servicio local esté corriendo:**
   - El dueño ejecuta: `pm2 status`
   - Debe estar en verde

2. **Verifica la IP:**
   - La IP puede cambiar si reinician el router
   - Pide al dueño que ejecute `ipconfig` de nuevo
   - Actualiza `PRINT_SERVICE_URL` en Vercel

3. **Verifica el token:**
   - Debe ser **exactamente igual** en ambos lugares
   - Sin espacios extra
   - Sin saltos de línea

4. **Verifica el firewall:**
   - El puerto 3001 debe estar abierto en la PC local
   - El script de instalación lo configura automáticamente

### "Error: Connection refused"

- El servicio local no está corriendo
- O el puerto está bloqueado por firewall
- O la IP es incorrecta

**Solución:**
- Pide al dueño que ejecute: `pm2 start impresion-restaurante`
- O que reinicie la PC

---

## 📝 Resumen de Configuración

### En Vercel (Variables de Entorno):

```
PRINT_SERVICE_URL=http://192.168.1.50:3001
PRINT_SERVICE_TOKEN=restaurante-20241215-12345
```

### En el Servicio Local (.env):

```
PRINT_SERVICE_PORT=3001
PRINT_SERVICE_TOKEN=restaurante-20241215-12345
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=USB002
```

**IMPORTANTE:** El token debe ser **igual** en ambos lugares.

---

## 🎯 Ventajas de esta Configuración

- ✅ **Página web siempre funciona** (incluso si PC local se apaga)
- ✅ **Impresión funciona** cuando PC local está encendida
- ✅ **Configuración simple** para el dueño (una vez y listo)
- ✅ **Fácil de actualizar** cuando cambia la impresora
- ✅ **No necesitas acceso remoto** a la PC del restaurante

---

**¡Con esto, el dueño solo configura una vez y tú solo actualizas Vercel cuando cambia algo!** 🎉







