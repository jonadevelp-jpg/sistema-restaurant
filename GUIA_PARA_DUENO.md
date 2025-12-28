# 📋 Guía Simple para el Dueño del Local

## ✅ Configuración Inicial (Solo Una Vez)

### Paso 1: Instalar Node.js

1. Ve a: **https://nodejs.org**
2. Descarga la versión que dice **"LTS"** (botón verde grande)
3. Instala haciendo clic en "Siguiente" en todos los pasos
4. **Reinicia la computadora**

### Paso 2: Instalar el Servicio

1. Copia la carpeta `servicio-impresion-local` a la PC
   - Ejemplo: `C:\servicio-impresion-local`

2. Abre la carpeta y **doble clic** en:
   ```
   instalar-automatico.bat
   ```

3. Espera a que termine (puede tardar 2-3 minutos)

4. Cuando termine, te pedirá que edites el archivo `.env`
   - Se abrirá automáticamente en Bloc de Notas
   - Cambia `PRINTER_KITCHEN_PATH=USB002` por el puerto de tu impresora
   - Guarda (Ctrl+S) y cierra

### Paso 3: Encontrar la IP

1. Presiona `Win + R`
2. Escribe: `cmd` y presiona Enter
3. Escribe: `ipconfig` y presiona Enter
4. Busca la línea que dice **"IPv4 Address"**
5. Anota ese número (ejemplo: `192.168.1.50`)

### Paso 4: Enviar al Desarrollador

Envía estos datos al desarrollador:

```
IP: 192.168.1.50
Token: (el que está en el archivo .env, línea PRINT_SERVICE_TOKEN)
```

**¡Listo!** El servicio se iniciará automáticamente cada vez que enciendas la PC.

---

## 🔄 Si Cambias la Impresora

Si cambias de impresora o el puerto cambia:

1. Doble clic en: `configurar-impresora.bat`
2. Se abrirá el archivo `.env`
3. Cambia `PRINTER_KITCHEN_PATH=USB002` por el nuevo puerto
4. Guarda (Ctrl+S) y cierra
5. El script reiniciará el servicio automáticamente

**¡Eso es todo!** No necesitas hacer nada más.

---

## ✅ Verificar que Funciona

1. Presiona `Win + R`
2. Escribe: `cmd` y presiona Enter
3. Escribe: `pm2 status` y presiona Enter
4. Deberías ver `impresion-restaurante` en **verde** con "online"

Si está en verde ✅, **está funcionando correctamente**.

---

## 🆘 Si Algo No Funciona

### El servicio no inicia automáticamente

1. Abre `cmd` como Administrador (clic derecho → "Ejecutar como administrador")
2. Escribe estos comandos uno por uno (presiona Enter después de cada uno):

```
cd C:\servicio-impresion-local
pm2 start server.js --name impresion-restaurante
pm2 save
pm2 startup
```

### No imprime

1. Verifica que la impresora esté conectada y encendida
2. Verifica el puerto en `.env` (USB002, COM3, etc.)
3. Ejecuta `configurar-impresora.bat` de nuevo

---

## 📝 Notas Importantes

- ✅ **El servicio inicia automáticamente** al encender la PC
- ✅ **No necesitas hacer nada** después de la configuración inicial
- ✅ **Si cambias la impresora**, solo ejecuta `configurar-impresora.bat`
- ⚠️ **Si cambia la IP** (por ejemplo, cambias de red WiFi), avisa al desarrollador para que actualice Vercel

---

**¡Con esto, solo necesitas configurar una vez y listo!** 🎉







