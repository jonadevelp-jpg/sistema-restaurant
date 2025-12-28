# 📦 Instalar PM2 en la PC del Local

## ✅ PM2 Instalado Correctamente

PM2 ya está instalado en tu máquina de desarrollo.

---

## 🔧 Instalar PM2 en la PC del Local

En la **PC del local** (donde está la impresora), necesitas instalar PM2 también.

### Paso 1: Instalar Node.js (si no está instalado)

1. Ve a: https://nodejs.org/
2. Descarga la versión **LTS** (Long Term Support)
3. Instala normalmente (siguiente, siguiente, siguiente...)
4. Reinicia la PC

### Paso 2: Verificar Node.js

Abre `cmd` o PowerShell y ejecuta:

```cmd
node --version
npm --version
```

**Debe mostrar versiones** (ej: `v20.10.0` y `10.2.3`)

Si dice "no se reconoce", Node.js no está instalado o no está en el PATH.

---

### Paso 3: Instalar PM2

En la PC del local, ejecuta:

```cmd
npm install -g pm2
```

**Esto puede tardar 1-2 minutos.**

---

### Paso 4: Verificar PM2

```cmd
pm2 --version
```

**Debe mostrar una versión** (ej: `5.3.0`)

---

## 🚀 Configurar el Servicio Local

Una vez que PM2 esté instalado, sigue estos pasos:

### Opción A: Usar el Script Automático (Recomendado)

1. Copia la carpeta `servicio-impresion-local` a la PC del local
2. Abre `cmd` en esa carpeta
3. Ejecuta:

```cmd
instalar-automatico.bat
```

Este script:
- ✅ Instala las dependencias (`npm install`)
- ✅ Crea el archivo `.env` con el token
- ✅ Inicia el servicio con PM2
- ✅ Configura PM2 para iniciar automáticamente al encender la PC
- ✅ Muestra el token y la IP

---

### Opción B: Configuración Manual

Si prefieres hacerlo manualmente:

1. **Navegar a la carpeta:**
   ```cmd
   cd C:\servicio-impresion-local
   ```

2. **Instalar dependencias:**
   ```cmd
   npm install
   ```

3. **Crear archivo `.env`:**
   ```cmd
   copy .env.example .env
   ```
   
   Luego edita `.env` y configura:
   ```
   PORT=3001
   PRINT_SERVICE_TOKEN=tu-token-seguro-aqui
   PRINTER_KITCHEN_TYPE=usb
   PRINTER_KITCHEN_PATH=USB002
   PRINTER_CASHIER_TYPE=usb
   PRINTER_CASHIER_PATH=USB002
   ```

4. **Iniciar el servicio:**
   ```cmd
   pm2 start server.js --name impresion-restaurante
   ```

5. **Guardar configuración para auto-inicio:**
   ```cmd
   pm2 save
   pm2 startup
   ```

   El comando `pm2 startup` mostrará un comando que debes ejecutar como Administrador. Cópialo y ejecútalo.

---

## ✅ Verificar que Funciona

### Ver estado del servicio:

```cmd
pm2 status
```

**Debe mostrar:**
```
┌─────┬──────────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name                    │ status  │ restart │ uptime   │
├─────┼──────────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ impresion-restaurante   │ online  │ 0       │ 5m       │
└─────┴──────────────────────────┴─────────┴─────────┴──────────┘
```

### Ver logs en tiempo real:

```cmd
pm2 logs impresion-restaurante
```

---

## 🆘 Problemas Comunes

### "npm no se reconoce como comando"

**Problema:** Node.js no está instalado o no está en el PATH.

**Solución:**
1. Instala Node.js desde https://nodejs.org/
2. Reinicia la PC después de instalar
3. Verifica: `node --version`

---

### "pm2 no se reconoce como comando"

**Problema:** PM2 no está instalado globalmente.

**Solución:**
```cmd
npm install -g pm2
```

Si sigue sin funcionar:
1. Cierra y vuelve a abrir `cmd`
2. Verifica que Node.js esté instalado: `node --version`
3. Intenta de nuevo: `npm install -g pm2`

---

### "Error: EACCES" al instalar PM2

**Problema:** Permisos insuficientes.

**Solución:**
1. Abre `cmd` como **Administrador** (clic derecho → Ejecutar como administrador)
2. Ejecuta: `npm install -g pm2`

---

### El servicio no inicia automáticamente

**Problema:** `pm2 startup` no se ejecutó correctamente.

**Solución:**
1. Ejecuta: `pm2 startup`
2. Copia el comando que muestra
3. Abre `cmd` como **Administrador**
4. Pega y ejecuta el comando
5. Ejecuta: `pm2 save`

---

## 📝 Resumen

1. ✅ Instalar Node.js (si no está)
2. ✅ Instalar PM2: `npm install -g pm2`
3. ✅ Ejecutar `instalar-automatico.bat` en la PC del local
4. ✅ Verificar: `pm2 status`

**¡Con esto debería funcionar!** 🎉







