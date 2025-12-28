# 🔧 Solución: Token Coincide pero Sigue Error 401

## ⚠️ Problema

Los tokens coinciden en `.env` y Vercel, pero sigue dando error 401. Esto significa que **el servicio local no está cargando el `.env` correctamente**.

---

## ✅ Solución

### Paso 1: Instalar dotenv

El servicio necesita `dotenv` para cargar el archivo `.env`. Ejecuta:

```cmd
instalar-dotenv.bat
```

Esto instalará la librería `dotenv` que permite cargar el `.env` automáticamente.

---

### Paso 2: Reiniciar el Servicio

Después de instalar `dotenv`, reinicia el servicio:

```cmd
reiniciar-servicio.bat
```

---

### Paso 3: Verificar que Cargó el Token

Abre los logs:

```cmd
ver-logs.bat
```

**Deberías ver:**

```
✅ Archivo .env cargado
🖨️  Servicio de Impresión Local iniciado
📡 Escuchando en puerto 3001
🔐 Token configurado: SÍ
🔐 Token (primeros 20 chars): tu-token-aqui...
🔐 Token (longitud): XX caracteres
```

**Si ves "Token configurado: NO" o "Token (longitud): 0", el `.env` no se está cargando.**

---

### Paso 4: Probar de Nuevo

Ejecuta:

```cmd
probar-manualmente.bat
```

**Deberías ver:**

```
✅ Token válido
📥 Petición recibida...
✅ Comanda impresa: Orden TEST-001
```

---

## 🔍 Si Sigue Sin Funcionar

### Verificar que el .env Existe

1. Ve a la carpeta `servicio-impresion-local`
2. Verifica que existe el archivo `.env`
3. Abre el `.env` con Bloc de Notas
4. Verifica que tiene la línea: `PRINT_SERVICE_TOKEN=tu-token-aqui`

### Verificar que PM2 Está en el Directorio Correcto

1. Ejecuta: `pm2 list`
2. Verifica que el proceso está corriendo
3. Ejecuta: `pm2 show impresion-restaurante`
4. Verifica que el `cwd` (directorio de trabajo) es correcto

### Cargar .env Manualmente en PM2

Si PM2 no carga el `.env` automáticamente:

1. Edita el archivo `ecosystem.config.js` (si existe) o crea uno:

```javascript
module.exports = {
  apps: [{
    name: 'impresion-restaurante',
    script: 'server.js',
    cwd: 'C:/ruta/completa/a/servicio-impresion-local',
    env_file: '.env',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

2. Reinicia con: `pm2 restart impresion-restaurante --update-env`

---

## 📝 Resumen

1. ✅ Instalar `dotenv`: `instalar-dotenv.bat`
2. ✅ Reiniciar servicio: `reiniciar-servicio.bat`
3. ✅ Verificar logs: `ver-logs.bat` (debe mostrar "Token configurado: SÍ")
4. ✅ Probar: `probar-manualmente.bat`

**El problema es que el servicio no estaba cargando el `.env`. Con `dotenv` se soluciona.** ✅







