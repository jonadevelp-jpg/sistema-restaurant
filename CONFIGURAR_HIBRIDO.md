# 🔄 Configuración Híbrida: Servidor Nube + Impresión Local

## 🎯 Arquitectura

```
[Dispositivos] → [Vercel/Nube] → [Servicio Local] → [Impresora]
     ✅              ✅                ✅              ✅
   Siempre        Siempre         Solo para        Solo para
  funcionan      funciona         impresión        impresión
```

**Ventajas:**
- ✅ La página web funciona siempre (incluso si la PC local se apaga)
- ✅ La impresión funciona cuando la PC local está encendida
- ✅ Múltiples dispositivos pueden usar el sistema
- ✅ No necesitas mantener el servidor principal siempre encendido

---

## 📋 Configuración

### Parte 1: Servicio Local de Impresión (PC del Restaurante)

#### 1. Instalar Node.js

En la PC que tendrá la impresora:
- Descarga desde: https://nodejs.org
- Instala la versión LTS

#### 2. Copiar el Servicio

Copia la carpeta `servicio-impresion-local` a la PC (ejemplo: `C:\servicio-impresion-local`)

#### 3. Instalar Dependencias

```bash
cd C:\servicio-impresion-local
npm install
```

#### 4. Configurar .env

Crea un archivo `.env` en `servicio-impresion-local`:

```env
# Puerto del servicio (puede ser otro si 3001 está ocupado)
PRINT_SERVICE_PORT=3001

# Token de seguridad (IMPORTANTE: cambia esto por uno seguro)
PRINT_SERVICE_TOKEN=mi-token-super-seguro-12345

# Impresora de Cocina
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=USB002

# Impresora de Caja
PRINTER_CASHIER_TYPE=usb
PRINTER_CASHIER_PATH=USB002
```

#### 5. Encontrar la IP Local

```powershell
ipconfig
```

Busca `IPv4 Address` (ejemplo: `192.168.1.50`)

**Anota esta IP** - la necesitarás para el servidor principal.

#### 6. Iniciar el Servicio

```bash
npm start
```

Deberías ver:
```
🖨️  Servicio de Impresión Local iniciado
📡 Escuchando en puerto 3001
✅ Servicio de impresión escuchando en http://localhost:3001
```

#### 7. Configurar Firewall

Permitir conexiones en el puerto 3001:

```powershell
# Ejecutar como Administrador
New-NetFirewallRule -DisplayName "Servicio Impresión" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

#### 8. Hacer que Inicie Automáticamente

**Opción A: Task Scheduler**

1. `Win + R` → `taskschd.msc`
2. Crear tarea básica
3. Nombre: "Servicio Impresión"
4. Disparador: "Al iniciar sesión"
5. Acción: "Iniciar un programa"
6. Programa: `C:\Program Files\nodejs\node.exe`
7. Argumentos: `C:\servicio-impresion-local\server.js`
8. Directorio: `C:\servicio-impresion-local`

 **Opción B: PM2 (Recomendado) - O usa el script automático**

**Método Automático (Más Fácil):**
1. Doble clic en `instalar-automatico.bat`
2. El script configura todo automáticamente
3. Ver `INICIO_RAPIDO.md` para instrucciones completas

**Método Manual:**
```bash
npm install -g pm2
pm2 start server.js --name "impresion"
pm2 save
pm2 startup
```

**Nota:** `bash` es solo el nombre del shell. En Windows PowerShell o CMD, escribe los comandos directamente sin "bash".

---

### Parte 2: Configurar el Servidor Principal (Vercel)

#### 1. Agregar Variables de Entorno en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. Ve a **Settings** → **Environment Variables**
3. Agrega estas variables:

```
PRINT_SERVICE_URL=http://192.168.1.50:3001
PRINT_SERVICE_TOKEN=mi-token-super-seguro-12345
```

**IMPORTANTE:**
- `PRINT_SERVICE_URL` debe ser la IP local de la PC con la impresora
- `PRINT_SERVICE_TOKEN` debe ser **exactamente igual** al del servicio local
- Si la IP cambia, actualiza esta variable

#### 2. Redesplegar

Después de agregar las variables:
- Vercel redesplegará automáticamente, o
- Ve a **Deployments** → **Redeploy**

---

## ✅ Verificación

### 1. Verificar Servicio Local

En la PC local, el servicio debe estar corriendo:
```
✅ Servicio de impresión escuchando en http://localhost:3001
```

### 2. Verificar desde el Servidor Principal

Cuando cambies una orden a "En Preparación", deberías ver en los logs de Vercel:
```
[Printer] Servidor en la nube - enviando a servicio local de impresión
[Printer] Comanda enviada a servicio local: Comanda impresa correctamente
```

Y en la PC local:
```
✅ Comanda impresa: Orden ORD-001
```

### 3. Probar desde Otro Dispositivo

1. Abre la página web desde otro dispositivo
2. Crea una orden
3. Cambia a "En Preparación"
4. Debe imprimirse en la impresora local ✅

---

## 🔒 Seguridad

### Token de Seguridad

El token previene que cualquiera envíe comandos de impresión:

1. **Genera un token seguro:**
   ```bash
   # En PowerShell
   [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
   ```

2. **Úsalo en ambos lugares:**
   - `.env` del servicio local
   - Variables de entorno de Vercel

3. **Nunca lo compartas públicamente**

### Firewall

El servicio local solo debe ser accesible desde tu red local:
- ✅ El firewall de Windows debe permitir el puerto 3001
- ⚠️ No expongas este puerto a internet
- ✅ Solo dispositivos en la misma red WiFi pueden acceder

---

## 🆘 Problemas Comunes

### "No se imprime desde otro dispositivo"

1. **Verifica que el servicio local esté corriendo:**
   - Debe mostrar "Servicio de impresión escuchando"

2. **Verifica la IP:**
   - La IP puede cambiar si reinicias el router
   - Usa `ipconfig` de nuevo
   - Actualiza `PRINT_SERVICE_URL` en Vercel

3. **Verifica el token:**
   - Debe ser **exactamente igual** en ambos lugares
   - Sin espacios extra

4. **Verifica el firewall:**
   ```powershell
   Get-NetFirewallRule -DisplayName "Servicio Impresión"
   ```

### "El servicio local se detiene"

- Usa PM2 para mantenerlo corriendo:
  ```bash
  pm2 start server.js --name "impresion"
  pm2 save
  ```

### "Error: Connection refused"

- El servicio local no está corriendo
- O el puerto está bloqueado por firewall
- O la IP es incorrecta

---

## 📝 Resumen de Configuración

### En la PC Local (con impresora):

```env
PRINT_SERVICE_PORT=3001
PRINT_SERVICE_TOKEN=mi-token-seguro
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=USB002
```

### En Vercel (Variables de Entorno):

```
PRINT_SERVICE_URL=http://192.168.1.50:3001
PRINT_SERVICE_TOKEN=mi-token-seguro
```

**IMPORTANTE:** El token debe ser **igual** en ambos lugares.

---

## 🎉 Ventajas de esta Configuración

- ✅ **Página web siempre funciona** (incluso si PC local se apaga)
- ✅ **Impresión funciona** cuando PC local está encendida
- ✅ **Múltiples dispositivos** pueden usar el sistema
- ✅ **No necesitas mantener servidor principal** siempre encendido
- ✅ **Escalable** - puedes agregar más servicios de impresión si necesitas

---

**¡Con esto, tienes lo mejor de ambos mundos: página web siempre disponible e impresión local!** 🎉

