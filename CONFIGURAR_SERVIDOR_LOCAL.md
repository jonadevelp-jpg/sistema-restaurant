# 🖥️ Guía Rápida: Configurar Servidor Local para Impresión

## 🎯 Objetivo

Tener un servidor local en el restaurante que:
- ✅ Tenga acceso a la impresora
- ✅ Permita que todos los dispositivos en la red lo usen
- ✅ Imprima automáticamente cuando se crean órdenes

---

## 📋 Pasos

### 1. Elegir la Computadora

- Una PC que esté siempre encendida durante el horario del restaurante
- Puede ser una PC vieja, no necesita ser potente
- Debe tener Windows (o Linux)

### 2. Instalar Node.js

1. Ve a: https://nodejs.org
2. Descarga la versión **LTS** (20.x o superior)
3. Instala con todas las opciones por defecto
4. Verifica la instalación:
   ```powershell
   node --version
   npm --version
   ```

### 3. Copiar el Proyecto

**Opción A: Desde GitHub (si tienes repositorio)**
```bash
git clone TU_REPOSITORIO
cd sistema-restaurant
```

**Opción B: Copiar archivos directamente**
- Copia toda la carpeta del proyecto a la PC
- Ejemplo: `C:\sistema-restaurant`

### 4. Instalar Dependencias

```bash
cd C:\sistema-restaurant
npm install
```

### 5. Configurar .env

Crea/edita el archivo `.env` en la raíz del proyecto:

```env
# Supabase (igual que antes)
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Impresora (configuración local)
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=USB002

# Si tienes segunda impresora para boletas
PRINTER_CASHIER_TYPE=usb
PRINTER_CASHIER_PATH=USB002
```

### 6. Encontrar la IP Local

```powershell
ipconfig
```

Busca `IPv4 Address` (ejemplo: `192.168.1.50`)

**Anota esta IP** - la necesitarás para acceder desde otros dispositivos.

### 7. Configurar Firewall

Permitir conexiones en el puerto 4321:

```powershell
# Ejecutar PowerShell como Administrador
New-NetFirewallRule -DisplayName "Sistema Restaurante" -Direction Inbound -LocalPort 4321 -Protocol TCP -Action Allow
```

### 8. Iniciar el Servidor

```bash
npm run dev
```

Deberías ver:
```
  Local:   http://localhost:4321/
  Network: http://192.168.1.50:4321/
```

### 9. Acceder desde Otros Dispositivos

Desde cualquier dispositivo en la **misma red WiFi**:

```
http://192.168.1.50:4321
```

(Reemplaza `192.168.1.50` con la IP que encontraste)

---

## 🔄 Hacer que Inicie Automáticamente

### Opción 1: Task Scheduler (Windows)

1. Presiona `Win + R` → escribe `taskschd.msc`
2. Clic derecho → "Crear tarea básica"
3. Nombre: "Sistema Restaurante"
4. Disparador: "Al iniciar sesión"
5. Acción: "Iniciar un programa"
6. Programa: `C:\Program Files\nodejs\node.exe`
7. Argumentos: `C:\sistema-restaurant\node_modules\.bin\astro dev`
8. Directorio de inicio: `C:\sistema-restaurant`

### Opción 2: Archivo .bat en Inicio

1. Crea un archivo `start-server.bat`:

```batch
@echo off
cd C:\sistema-restaurant
npm run dev
```

2. Presiona `Win + R` → escribe `shell:startup`
3. Copia el archivo `.bat` ahí
4. Se ejecutará automáticamente al iniciar Windows

---

## ✅ Verificación

1. **Desde la PC servidor:**
   - Abre: `http://localhost:4321`
   - Debe funcionar normalmente

2. **Desde otro dispositivo:**
   - Abre: `http://192.168.1.50:4321` (con la IP correcta)
   - Debe funcionar igual

3. **Probar impresión:**
   - Crea una orden
   - Cambia a "En Preparación"
   - Debe imprimirse automáticamente ✅

---

## 🆘 Problemas Comunes

### "No puedo acceder desde otro dispositivo"

1. **Verifica que estén en la misma red WiFi**
2. **Verifica el firewall:**
   ```powershell
   Get-NetFirewallRule -DisplayName "Sistema Restaurante"
   ```
3. **Verifica la IP:**
   - La IP puede cambiar si reinicias el router
   - Usa `ipconfig` de nuevo para verificar

### "La impresión no funciona"

1. **Verifica que la impresora esté conectada a la PC servidor**
2. **Verifica el `.env`** - debe tener `PRINTER_KITCHEN_PATH=USB002`
3. **Revisa los logs del servidor** - busca mensajes `[Printer]`

### "El servidor se detiene"

- Usa Task Scheduler para que inicie automáticamente
- O usa PM2 para mantenerlo corriendo:
  ```bash
  npm install -g pm2
  pm2 start npm --name "restaurante" -- run dev
  pm2 save
  pm2 startup
  ```

---

## 📝 Notas Importantes

- ⚠️ **La PC servidor debe estar siempre encendida** durante el horario del restaurante
- ⚠️ **Si cambias de red WiFi**, la IP cambiará
- ✅ **Todos los dispositivos usan el mismo servidor** - la sincronización es automática
- ✅ **La impresión funciona** porque el servidor tiene acceso directo a la impresora

---

**¡Con esto, todos los dispositivos en la red podrán usar el sistema e imprimir!** 🎉







