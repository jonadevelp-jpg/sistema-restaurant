# 🔍 Guía: Cómo Encontrar IP, Puerto y Tipo de Impresoras

Esta guía te ayudará a identificar la configuración de tus impresoras térmicas para configurarlas en el sistema.

---

## 📋 Información que Necesitas

Para cada impresora necesitas:
- **TIPO**: `network` (red) o `usb` (USB)
- **IP**: Dirección IP de la impresora (solo para network)
- **PUERTO**: Puerto de red (solo para network, generalmente 9100)
- **PATH**: Ruta del dispositivo (solo para USB)

---

## 🖨️ Método 1: Impresoras por Red (Network)

### Paso 1: Encontrar la IP de la Impresora

#### Opción A: Desde el Panel de la Impresora

1. **En la impresora**, busca el botón de menú/configuración
2. Navega a: **Configuración** → **Red** → **TCP/IP** o **Configuración de Red**
3. Busca **"Dirección IP"** o **"IP Address"**
4. Anota la IP (ejemplo: `192.168.1.100`)

#### Opción B: Desde Windows

1. Abre **Panel de Control** → **Dispositivos e impresoras**
2. Haz clic derecho en tu impresora térmica
3. Selecciona **"Propiedades de la impresora"**
4. Ve a la pestaña **"Puertos"**
5. Busca un puerto que diga algo como: `IP_192.168.1.100` o `TCP/IP`
6. La IP está en el nombre del puerto

#### Opción C: Desde la Configuración de Red

1. Abre **Configuración** → **Red e Internet** → **Estado**
2. Haz clic en **"Ver las propiedades de red"**
3. Anota tu **"Puerta de enlace predeterminada"** (ejemplo: `192.168.1.1`)
4. Abre el navegador y ve a: `http://192.168.1.1` (o la IP de tu router)
5. Busca la lista de dispositivos conectados
6. Encuentra tu impresora en la lista

#### Opción D: Usando el Comando ARP (Windows)

1. Abre **PowerShell** o **CMD** como administrador
2. Ejecuta:
```powershell
arp -a
```
3. Busca en la lista las direcciones MAC de tus impresoras
4. Las IPs aparecerán junto a cada dispositivo

#### Opción E: Usando el Comando Ping (si conoces el nombre)

1. Abre **PowerShell** o **CMD**
2. Ejecuta:
```powershell
ping nombre-impresora
```
3. La IP aparecerá en la respuesta

---

### Paso 2: Encontrar el Puerto

**Para impresoras térmicas por red, el puerto es casi siempre `9100`**

Este es el puerto estándar para impresoras ESC/POS por red.

Si necesitas verificar:

1. Abre **Panel de Control** → **Dispositivos e impresoras**
2. Haz clic derecho en tu impresora → **Propiedades de la impresora**
3. Ve a la pestaña **"Puertos"**
4. Busca el puerto TCP/IP y verifica el número (generalmente `9100`)

**Puertos comunes:**
- `9100` - Puerto estándar para impresoras térmicas (RAW)
- `515` - Puerto LPR/LPD (menos común)
- `631` - Puerto IPP (menos común)

---

## 🔌 Método 2: Impresoras USB

### Paso 1: Encontrar el PATH (Ruta del Dispositivo)

#### En Windows:

1. Abre **Administrador de dispositivos**:
   - Presiona `Win + X` → **Administrador de dispositivos**
2. Expande **"Impresoras"** o **"Puertos (COM y LPT)"**
3. Busca tu impresora térmica
4. Haz clic derecho → **Propiedades** → Pestaña **"Detalles"**
5. Busca **"Puerto"** o **"COM"**
6. Anota el número (ejemplo: `COM3`, `COM4`)

**El PATH en Windows será:** `COM3`, `COM4`, etc.

#### En Linux:

1. Abre una terminal
2. Ejecuta:
```bash
lsusb
```
3. Busca tu impresora en la lista
4. Ejecuta:
```bash
ls -l /dev/usb/
```
5. O busca en:
```bash
ls -l /dev/ttyUSB*
```
6. El PATH será algo como: `/dev/usb/lp0` o `/dev/ttyUSB0`

#### En macOS:

1. Abre **Terminal**
2. Ejecuta:
```bash
system_profiler SPUSBDataType | grep -A 10 "Impresora"
```
3. O busca en:
```bash
ls -l /dev/cu.*
```
4. El PATH será algo como: `/dev/cu.usbserial-XXXXX`

---

## 🧪 Verificar la Conexión

### Para Impresoras por Red:

1. Abre **PowerShell** o **CMD**
2. Ejecuta:
```powershell
Test-NetConnection -ComputerName 192.168.1.100 -Port 9100
```
   (Reemplaza con la IP de tu impresora)

3. Si dice **"TcpTestSucceeded: True"**, la conexión funciona ✅

**O usando telnet:**
```powershell
telnet 192.168.1.100 9100
```
- Si se conecta, presiona `Ctrl + ]` y luego escribe `quit` para salir
- Si no se conecta, verifica la IP y el puerto

### Para Impresoras USB:

1. Verifica que la impresora esté conectada y encendida
2. En Windows, verifica en **Administrador de dispositivos** que no haya errores
3. Prueba imprimir una página de prueba desde Windows

---

## 📝 Ejemplo de Configuración

Una vez que tengas la información, agrega al archivo `.env`:

### Impresora de Cocina (por Red):
```env
PRINTER_KITCHEN_TYPE=network
PRINTER_KITCHEN_IP=192.168.1.100
PRINTER_KITCHEN_PORT=9100
```

### Impresora de Caja (por Red):
```env
PRINTER_CASHIER_TYPE=network
PRINTER_CASHIER_IP=192.168.1.101
PRINTER_CASHIER_PORT=9100
```

### Impresora USB (Windows):
```env
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=COM3
```

### Impresora USB (Linux):
```env
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=/dev/usb/lp0
```

---

## 🔧 Herramientas Útiles

### 1. Escáner de Red (para encontrar impresoras)

**Windows:**
- Descarga **"Advanced IP Scanner"** (gratis)
- Escanea tu red local
- Busca dispositivos con nombres de impresoras

**Linux/Mac:**
```bash
nmap -sn 192.168.1.0/24
```
(Reemplaza `192.168.1.0` con tu rango de red)

### 2. Ver Impresoras Instaladas en Windows

```powershell
Get-Printer | Select-Object Name, PortName, DriverName
```

### 3. Ver Puertos COM en Windows

```powershell
Get-WmiObject Win32_SerialPort | Select-Object DeviceID, Description
```

---

## ❓ Preguntas Frecuentes

### ¿Cómo sé si mi impresora es Network o USB?

- **Network**: Tiene conexión Ethernet (cable de red) o WiFi
- **USB**: Solo tiene cable USB conectado a la computadora

### ¿Qué pasa si no encuentro la IP?

1. Revisa el manual de la impresora
2. Busca en el panel de la impresora (pantalla LCD)
3. Usa un escáner de red
4. Revisa la configuración del router

### ¿El puerto siempre es 9100?

- **Sí, en el 99% de los casos** para impresoras térmicas
- Si no funciona, prueba `515` o `631`
- Revisa el manual de tu impresora específica

### ¿Puedo usar una impresora USB como Network?

- **Sí**, si tienes un servidor de impresión o un adaptador USB-to-Ethernet
- Pero es más fácil configurarla directamente como USB

### ¿Cómo cambio la IP de mi impresora?

1. Accede al panel de configuración de la impresora
2. Ve a **Red** → **TCP/IP**
3. Cambia la IP manualmente o usa DHCP
4. Anota la nueva IP

---

## 🆘 Si No Funciona

1. **Verifica que la impresora esté encendida**
2. **Verifica la conexión de red** (cable o WiFi)
3. **Prueba hacer ping a la IP:**
   ```powershell
   ping 192.168.1.100
   ```
4. **Verifica el firewall** (puede estar bloqueando el puerto 9100)
5. **Revisa los logs del servidor** para ver errores específicos

---

## 📞 Información del Fabricante

Si tienes problemas, consulta el manual de tu impresora. Modelos comunes:

- **Epson TM-T20**: Puerto 9100, configuración por panel
- **Star TSP100**: Puerto 9100, configuración por panel
- **Zebra ZD220**: Puerto 9100, configuración web
- **Bixolon SRP-350**: Puerto 9100, configuración por panel

---

**¡Una vez que tengas la IP, Puerto y Tipo, agrégalos al archivo `.env` y reinicia el servidor!** 🎉







