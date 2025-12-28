# 🚀 Inicio Rápido - Configuración Una Vez

## ✅ Para el Dueño del Local (Configuración Inicial)

### Paso 1: Instalar Node.js

1. Ve a: https://nodejs.org
2. Descarga la versión **LTS** (la que dice "Recomendado")
3. Instala con todas las opciones por defecto (solo haz clic en "Siguiente")
4. Reinicia la computadora

### Paso 2: Ejecutar Instalación Automática

1. Copia la carpeta `servicio-impresion-local` a la PC (ejemplo: `C:\servicio-impresion-local`)
2. Abre la carpeta
3. **Doble clic** en `instalar-automatico.bat`
4. Espera a que termine (puede tardar unos minutos)

### Paso 3: Configurar Impresora (Solo una vez)

1. El script creará un archivo `.env`
2. Ábrelo con Bloc de Notas
3. Cambia estas líneas:

```env
# Cambia esto por un token seguro (puede ser cualquier texto largo)
PRINT_SERVICE_TOKEN=mi-restaurante-2024-seguro

# Cambia USB002 por el puerto de tu impresora
PRINTER_KITCHEN_PATH=USB002
```

4. Guarda el archivo

### Paso 4: Encontrar la IP (Solo una vez)

1. Presiona `Win + R`
2. Escribe: `cmd` y presiona Enter
3. Escribe: `ipconfig` y presiona Enter
4. Busca la línea que dice **"IPv4 Address"**
5. Anota ese número (ejemplo: `192.168.1.50`)

### Paso 5: Enviar Información al Desarrollador

Envía estos datos al desarrollador para que los configure en Vercel:

```
IP de la PC: 192.168.1.50
Token: mi-restaurante-2024-seguro
```

**¡Listo!** El servicio se iniciará automáticamente cada vez que enciendas la PC.

---

## 🔄 Si Cambias la Impresora

Si cambias de impresora o el puerto cambia:

1. Abre el archivo `.env` en la carpeta `servicio-impresion-local`
2. Cambia la línea `PRINTER_KITCHEN_PATH=USB002` por el nuevo puerto
3. Guarda el archivo
4. Reinicia el servicio:
   - Abre `cmd` como Administrador
   - Escribe: `pm2 restart impresion-restaurante`

O simplemente reinicia la PC.

---

## ✅ Verificar que Funciona

1. Abre `cmd`
2. Escribe: `pm2 status`
3. Deberías ver `impresion-restaurante` en verde con "online"

Si está en verde, **¡está funcionando!** ✅

---

## 🆘 Si Algo No Funciona

### El servicio no inicia automáticamente

1. Abre `cmd` como Administrador
2. Escribe estos comandos uno por uno:
   ```
   pm2 start C:\servicio-impresion-local\server.js --name impresion-restaurante
   pm2 save
   pm2 startup
   ```

### No imprime

1. Verifica que la impresora esté conectada
2. Verifica el puerto en `.env` (USB002, COM3, etc.)
3. Revisa los logs:
   ```
   pm2 logs impresion-restaurante
   ```

---

**¡Con esto, el dueño solo necesita ejecutar el script una vez y listo!** 🎉







