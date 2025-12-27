# 🔧 Solución: USB y Network No Disponibles en escpos

## ⚠️ Problema Detectado

El script de verificación muestra que:
- ✅ `escpos` está instalado
- ✅ `Printer` está disponible
- ❌ `USB` NO está disponible
- ❌ `Network` NO está disponible

**Keys disponibles en escpos:** `create, Printer, Image, command, Printer2`

Esto significa que en la versión `3.0.0-alpha.6` de `escpos`, las clases `USB` y `Network` no están incluidas directamente y necesitan módulos separados.

---

## ✅ Solución

### Paso 1: Intentar Instalar Módulos Adicionales

**En la PC donde está la impresora:**

```cmd
cd C:\Users\TxPOS\sistema-restaurant\servicio-impresion-local
instalar-modulos.bat
```

O manualmente:

```cmd
npm install escpos-usb
npm install escpos-network
```

**Nota:** Si estos módulos no existen en npm o no se pueden instalar, no te preocupes. El código intentará otros métodos automáticamente.

---

### Paso 2: Verificar la Instalación

Después de instalar, ejecuta:

```cmd
verificar-escpos.bat
```

Ahora deberías ver:
- ✅ USB encontrado en escpos-usb
- ✅ Network encontrado en escpos-network

---

### Paso 3: Reiniciar el Servicio

```cmd
reiniciar-servicio.bat
```

---

### Paso 4: Probar de Nuevo

```cmd
encontrar-puerto-impresora.bat
```

---

## 🔍 Alternativas Si Los Módulos No Funcionan

### Opción 1: Usar Función create() (Recomendado)

El código actualizado ahora intenta usar `escpos.create()` automáticamente. Esta función está disponible en escpos 3.0 y puede crear adaptadores USB y Network.

**No necesitas hacer nada adicional**, el código lo intentará automáticamente.

---

### Opción 2: Cambiar Versión de escpos

Si `escpos.create()` no funciona, puedes probar con una versión diferente:

```cmd
npm uninstall escpos escpos-usb escpos-network
npm install escpos@2.6.0
```

**Nota:** La versión 2.6.0 incluye USB y Network directamente, pero puede tener otras limitaciones.

---

### Opción 2: Usar Impresora de Red

Si tienes una impresora de red disponible, puedes configurarla en el `.env`:

```env
PRINTER_KITCHEN_TYPE=network
PRINTER_KITCHEN_IP=192.168.1.100
PRINTER_KITCHEN_PORT=9100
```

---

### Opción 3: Usar Función create()

Algunas versiones de escpos tienen una función `create()` que puede crear adaptadores. El código actualizado intentará usar esto si está disponible.

---

## 📋 Resumen

1. ✅ Instala módulos adicionales: `npm install escpos-usb escpos-network`
2. ✅ Verifica: `verificar-escpos.bat`
3. ✅ Reinicia: `reiniciar-servicio.bat`
4. ✅ Prueba: `encontrar-puerto-impresora.bat`

**El código actualizado ahora intenta múltiples métodos para encontrar USB y Network automáticamente.** ✅

