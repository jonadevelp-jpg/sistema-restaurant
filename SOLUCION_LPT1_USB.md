# 🔧 Solución: Impresora USB que aparece como LPT1

## ⚠️ Problema

Tu impresora está conectada por **USB**, pero Windows la muestra como **LPT1** (puerto paralelo).

**LPT1** es un puerto **paralelo antiguo**, no USB. Esto significa que:
- Windows está usando un driver genérico incorrecto
- La impresora no está configurada correctamente como USB

---

## ✅ Solución Rápida: Usar LPT1 (Temporal)

Si necesitas que funcione **ahora mismo**, puedes configurar el `.env` así:

```env
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=LPT1
```

**NOTA**: Esto puede funcionar, pero **no es lo ideal**. Es mejor reconectar correctamente como USB.

---

## 🎯 Solución Correcta: Reconectar como USB

### Paso 1: Desinstalar la Impresora Actual

1. Abre **Panel de Control** → **Dispositivos e impresoras**
2. Busca tu impresora térmica
3. **Clic derecho** → **Eliminar dispositivo** o **Quitar dispositivo**
4. Si te pregunta si quieres eliminar el driver, selecciona **"Sí"**

### Paso 2: Desconectar y Reconectar

1. **Desconecta** el cable USB de la impresora
2. Espera 10 segundos
3. **Conecta** el cable USB de nuevo
4. Windows debería detectarla automáticamente

### Paso 3: Instalar el Driver Correcto

#### Opción A: Windows la detecta automáticamente

1. Windows debería mostrar una notificación: "Configurando dispositivo..."
2. Espera a que termine
3. Ve a **Dispositivos e impresoras** y verifica que aparezca

#### Opción B: Instalar driver manualmente

1. Ve al sitio web del fabricante de tu impresora:
   - **Epson**: https://support.epson.com
   - **Star**: https://www.starmicronics.com/support
   - **Zebra**: https://www.zebra.com/us/en/support-downloads.html
   - **Bixolon**: https://www.bixolon.com

2. Busca el driver para tu modelo específico
3. Descarga e instala el driver **USB**
4. Durante la instalación, cuando te pregunte el puerto, selecciona **USB** (no LPT)

### Paso 4: Verificar el Puerto Correcto

1. Ve a **Panel de Control** → **Dispositivos e impresoras**
2. **Clic derecho** en tu impresora → **Propiedades de la impresora**
3. Ve a la pestaña **"Puertos"**
4. Deberías ver algo como:
   - ✅ **`COM3`** o **`COM4`** (correcto para USB)
   - ❌ **`LPT1`** (incorrecto, es paralelo)

### Paso 5: Configurar el .env

Una vez que aparezca como **COM3** o **COM4**, configura el `.env`:

```env
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=COM3
```

(Reemplaza `COM3` con el número que aparezca en tu sistema)

---

## 🔍 Cómo Verificar si Realmente es USB

### Método 1: Administrador de Dispositivos

1. Presiona `Win + X` → **Administrador de dispositivos**
2. Busca en:
   - **"Puertos (COM y LPT)"** → Deberías ver tu impresora como `COM3`, `COM4`, etc.
   - **"Impresoras"** → Tu impresora debería aparecer aquí

### Método 2: Ver el Cable

- **USB**: Cable plano con conector rectangular (tipo A)
- **Paralelo**: Cable ancho con muchos pines (antiguo, raro hoy en día)

Si tienes un cable USB conectado, **debe** aparecer como COM, no LPT.

---

## 🛠️ Si No Funciona la Reconexión

### Problema: Windows sigue detectándola como LPT1

**Solución:**

1. **Desinstala completamente el driver:**
   - Ve a **Administrador de dispositivos**
   - Busca la impresora
   - **Clic derecho** → **Desinstalar dispositivo**
   - Marca **"Eliminar el software del controlador"**

2. **Usa el instalador del fabricante:**
   - No uses el driver genérico de Windows
   - Descarga el driver específico del sitio del fabricante
   - Durante la instalación, **selecciona USB explícitamente**

3. **Verifica que el cable USB funcione:**
   - Prueba con otro cable USB
   - Prueba en otro puerto USB de la computadora

---

## 📝 Configuración Final para .env

### Si funciona como USB (COM):
```env
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=COM3
```

### Si solo funciona como LPT1 (temporal):
```env
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=LPT1
```

**NOTA**: El sistema ahora soporta LPT1, pero es mejor usar COM para mejor compatibilidad.

---

## ✅ Verificación

Después de configurar, reinicia el servidor:

```bash
npm run dev
```

Luego, cuando cambies una orden a "En Preparación", debería intentar imprimir.

**Revisa los logs del servidor** para ver si hay errores de conexión.

---

## 🆘 Si Aún No Funciona

1. **Verifica que la impresora esté encendida**
2. **Prueba imprimir una página de prueba desde Windows** (Panel de Control → Impresora → Propiedades → Imprimir página de prueba)
3. **Revisa los logs del servidor** para ver el error específico
4. **Considera usar una impresora por red** (más confiable para sistemas de restaurante)

---

**¡Una vez que aparezca como COM3 o COM4, todo funcionará perfectamente!** 🎉







