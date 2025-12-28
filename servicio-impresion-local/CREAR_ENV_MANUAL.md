# 📝 Crear Archivo .env Manualmente

## 🚀 Opción 1: Script Automático (Recomendado)

Ejecuta:

```cmd
crear-env.bat
```

Este script:
- ✅ Genera un token seguro automáticamente
- ✅ Crea el archivo `.env` con todas las variables
- ✅ Muestra el token para que lo copies

---

## 📋 Opción 2: Crear Manualmente

Si prefieres crearlo manualmente:

1. Crea un archivo llamado `.env` en la carpeta `servicio-impresion-local`

2. Copia y pega este contenido:

```env
PORT=3001
PRINT_SERVICE_TOKEN=tu-token-seguro-aqui
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=USB002
PRINTER_CASHIER_TYPE=usb
PRINTER_CASHIER_PATH=USB002
```

3. **Genera un token seguro:**
   - Puedes usar: https://www.random.org/strings/
   - O ejecuta en PowerShell:
     ```powershell
     -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
     ```
   - Reemplaza `tu-token-seguro-aqui` con el token generado

---

## 🔧 Configuración de Impresoras

### Impresora USB (Recomendado)

```env
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=USB002
```

**Para encontrar el puerto correcto:**
1. Ve a: Panel de Control → Dispositivos e impresoras
2. Clic derecho en tu impresora → Propiedades de impresora
3. Ve a la pestaña "Puertos"
4. Busca el puerto USB (ej: USB002, USB003, etc.)

### Impresora de Red

```env
PRINTER_KITCHEN_TYPE=network
PRINTER_KITCHEN_IP=192.168.1.100
PRINTER_KITCHEN_PORT=9100
```

**Para encontrar la IP:**
1. Imprime una página de prueba desde la impresora
2. O ve a la configuración de red de la impresora
3. O ejecuta: `arp -a` y busca la IP de tu impresora

---

## ✅ Verificar que Funciona

Después de crear el `.env`:

1. **Reinicia el servicio:**
   ```cmd
   pm2 restart impresion-restaurante
   ```

2. **Verifica el token:**
   ```cmd
   type .env
   ```

3. **Configura en Vercel:**
   - `PRINT_SERVICE_URL=http://TU-IP:3001`
   - `PRINT_SERVICE_TOKEN=tu-token-del-env`

---

## 📝 Ejemplo Completo

```env
PORT=3001
PRINT_SERVICE_TOKEN=aB3xK9mP2qR7vT5wY8zN1cF4hJ6dL0s
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=USB002
PRINTER_CASHIER_TYPE=usb
PRINTER_CASHIER_PATH=USB002
```

---

**¡Ejecuta `crear-env.bat` y listo!** ✅







