# 🔧 Solución: Error 500 "No se pudo conectar a la impresora" (USB)

## ⚠️ Problema

El servicio devuelve error 500 con el mensaje "No se pudo conectar a la impresora de cocina", aunque la impresora está físicamente conectada y funcionando.

**Causa común:** En Windows, la librería `escpos` puede tener problemas con ciertos formatos de puerto USB (como `USB002`).

---

## ✅ Solución Paso a Paso

### Paso 1: Encontrar el Puerto Correcto

He creado un script que prueba automáticamente diferentes puertos:

**En la PC donde está la impresora:**

```cmd
cd C:\Users\TxPOS\sistema-restaurant\servicio-impresion-local
encontrar-puerto-impresora.bat
```

Este script:
- ✅ Lista todas las impresoras instaladas
- ✅ Muestra los puertos COM disponibles
- ✅ Prueba automáticamente diferentes formatos de puerto
- ✅ Te dice exactamente cuál es el puerto correcto

---

### Paso 2: Actualizar el .env

Una vez que el script te diga el puerto correcto, actualiza el `.env`:

```env
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=COM3
```

(Reemplaza `COM3` con el puerto que encontró el script)

---

### Paso 3: Reiniciar el Servicio

```cmd
cd C:\Users\TxPOS\sistema-restaurant\servicio-impresion-local
reiniciar-servicio.bat
```

---

### Paso 4: Probar de Nuevo

```cmd
probar-manualmente.bat
```

---

## 🔍 Mejoras Implementadas

He mejorado el código del servicio para que:

1. **Intente múltiples métodos automáticamente:**
   - Path directo (el configurado)
   - Sin prefijo USB (si es USB002, prueba solo "002")
   - Lista dispositivos USB disponibles
   - Prueba diferentes formatos

2. **Muestre información detallada:**
   - Qué método está intentando
   - Por qué falla cada método
   - Qué puertos probó

3. **Proporcione soluciones específicas:**
   - Si un método falla, sugiere qué verificar
   - Indica posibles causas del problema

---

## 🧪 Método Manual (Si el Script No Funciona)

Si prefieres hacerlo manualmente:

### 1. Verificar Puerto en Panel de Control

1. Ve a **Panel de Control** → **Dispositivos e impresoras**
2. **Clic derecho** en tu impresora → **Propiedades de impresora**
3. Ve a la pestaña **"Puertos"**
4. Anota el puerto marcado

### 2. Probar Diferentes Formatos

Si el puerto es `USB002`, prueba en el `.env`:

```env
# Opción 1: Path directo
PRINTER_KITCHEN_PATH=USB002

# Opción 2: Sin prefijo (si la opción 1 no funciona)
PRINTER_KITCHEN_PATH=002

# Opción 3: Puerto COM correspondiente (si las anteriores no funcionan)
PRINTER_KITCHEN_PATH=COM3
```

### 3. Verificar en Administrador de Dispositivos

1. Presiona `Win + X` → **Administrador de dispositivos**
2. Expande **"Puertos (COM y LPT)"**
3. Busca tu impresora
4. Anota el puerto COM (ej: COM3, COM4)

---

## 🔧 Errores Comunes

### Error: "Device not found"

**Solución:**
- Verifica que el puerto sea correcto
- Prueba con el puerto COM en lugar de USB002
- Ejecuta el script `encontrar-puerto-impresora.bat`

---

### Error: "EACCES" o "Permission denied"

**Solución:**
- Ejecuta el servicio como **Administrador**
- O ejecuta `reiniciar-servicio.bat` como Administrador

---

### Error: "Port is busy" o "Device is in use"

**Solución:**
- Cierra otros programas que puedan estar usando la impresora
- Reinicia el servicio de impresión de Windows:
  ```cmd
  net stop spooler
  net start spooler
  ```

---

## 📋 Resumen

1. ✅ Ejecuta `encontrar-puerto-impresora.bat` en la PC de la impresora
2. ✅ Actualiza `PRINTER_KITCHEN_PATH` en el `.env` con el puerto correcto
3. ✅ Reinicia el servicio: `reiniciar-servicio.bat`
4. ✅ Prueba: `probar-manualmente.bat`

**El código mejorado ahora intenta múltiples métodos automáticamente, así que debería funcionar incluso si el puerto no es exactamente el configurado.** 🎯



