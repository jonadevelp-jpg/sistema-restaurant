# 🖨️ Instrucciones para Impresión Térmica

Este documento explica cómo configurar e imprimir comandas de cocina y boletas de cliente usando impresoras térmicas.

## 📋 Contenido

1. [Requisitos](#requisitos)
2. [Configuración de Impresora](#configuración-de-impresora)
3. [Uso del Sistema](#uso-del-sistema)
4. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Requisitos

### Hardware
- **Impresora térmica** de 58mm o 80mm (recomendado 80mm)
- **Papel térmico** del ancho correspondiente
- **Conexión**: USB, Bluetooth o WiFi (según modelo)

### Software
- Navegador moderno (Chrome, Edge, Firefox)
- Controladores de la impresora instalados (si es necesario)

### Modelos Recomendados
- **Epson TM-T20** (USB/Red)
- **Star TSP100** (USB/Bluetooth)
- **Zebra ZD220** (USB/Red)
- **Bixolon SRP-350** (USB/Bluetooth)

---

## ⚙️ Configuración de Impresora

### Paso 1: Instalar Controladores

1. Descarga los controladores desde el sitio web del fabricante
2. Instala los controladores en tu computadora
3. Conecta la impresora (USB, Bluetooth o WiFi)
4. Verifica que Windows/Mac reconozca la impresora

### Paso 2: Configurar Impresora en el Sistema

1. Ve a **Configuración** → **Dispositivos** → **Impresoras y escáneres**
2. Busca tu impresora térmica
3. Haz clic en **Administrar** → **Propiedades de impresora**
4. Configura:
   - **Tamaño de papel**: 80mm x Auto (o 58mm según tu impresora)
   - **Orientación**: Vertical
   - **Márgenes**: Mínimos (0mm o 5mm máximo)

### Paso 3: Establecer como Impresora Predeterminada (Opcional)

1. Haz clic derecho en la impresora térmica
2. Selecciona **Establecer como impresora predeterminada**

---

## 🎯 Uso del Sistema

### Imprimir Comanda de Cocina

1. Ve a la página de la orden: `/admin/ordenes/[id]`
2. Agrega items a la orden
3. Haz clic en **🖨️ Comanda Cocina**
4. Se abrirá una ventana con la comanda
5. La comanda se imprimirá automáticamente
6. Si no se imprime automáticamente, haz clic en **🖨️ Imprimir Comanda**

**Cuándo imprimir:**
- Cuando se marca la orden como "En Preparación"
- Manualmente cuando se necesite una copia adicional

### Imprimir Boleta de Cliente

1. En la página de la orden, haz clic en **🧾 Boleta Cliente**
2. Se abrirá una ventana con la boleta
3. La boleta se imprimirá automáticamente
4. Si no se imprime automáticamente, haz clic en **🖨️ Imprimir Boleta**

**Cuándo imprimir:**
- Antes de pagar (para revisión)
- Después de pagar (automáticamente)
- Manualmente cuando el cliente la solicite

### Imprimir Automáticamente al Pagar

Cuando se marca una orden como "Pagada", la boleta se imprime automáticamente.

---

## 🖨️ Configuración de Impresión en el Navegador

### Chrome/Edge

1. Abre la ventana de impresión (Ctrl+P o Cmd+P)
2. Selecciona tu **impresora térmica**
3. Configura:
   - **Destino**: Tu impresora térmica
   - **Más configuraciones**:
     - ✅ **Gráficos de fondo** (si quieres bordes)
     - ✅ **Encabezados y pies de página** (desactivar)
   - **Márgenes**: Ninguno
   - **Escala**: 100%
4. Haz clic en **Imprimir**

### Firefox

1. Abre la ventana de impresión (Ctrl+P o Cmd+P)
2. Selecciona tu **impresora térmica**
3. En **Opciones de página**:
   - **Márgenes**: Ninguno
   - **Escala**: 100%
4. Haz clic en **Imprimir**

---

## 🔍 Solución de Problemas

### La impresora no imprime

**Problema**: Al hacer clic en imprimir, no pasa nada.

**Soluciones**:
1. Verifica que la impresora esté encendida y conectada
2. Verifica que los controladores estén instalados
3. Prueba imprimir desde otra aplicación (Bloc de notas)
4. Reinicia la impresora
5. Verifica la conexión (cable USB, Bluetooth, WiFi)

### El tamaño no es correcto

**Problema**: El ticket se imprime muy pequeño o muy grande.

**Soluciones**:
1. En la ventana de impresión, verifica que el tamaño de papel sea **80mm** (o 58mm)
2. Ajusta la escala a **100%**
3. Configura los márgenes en **Ninguno** o **Mínimos**
4. Verifica la configuración de la impresora en Windows/Mac

### El texto se corta

**Problema**: El texto se corta en los bordes.

**Soluciones**:
1. Reduce los márgenes a **0mm** o **5mm máximo**
2. Verifica que el ancho del papel sea correcto (80mm o 58mm)
3. Ajusta la escala a **100%** (no más, no menos)

### No se imprime automáticamente

**Problema**: La comanda/boleta no se imprime automáticamente.

**Soluciones**:
1. Verifica que las ventanas emergentes no estén bloqueadas
2. Permite que el navegador abra ventanas de impresión
3. Usa el botón manual de impresión si es necesario
4. Verifica que JavaScript esté habilitado

### La calidad de impresión es mala

**Problema**: El texto se ve borroso o poco claro.

**Soluciones**:
1. Limpia el cabezal de impresión (consulta el manual de tu impresora)
2. Verifica que el papel térmico no esté dañado o expuesto al sol
3. Ajusta la densidad de impresión en la configuración de la impresora
4. Reemplaza el papel si es necesario

---

## 📏 Especificaciones Técnicas

### Tamaño de Papel
- **Ancho**: 80mm (recomendado) o 58mm
- **Largo**: Automático (rollo continuo)

### Formato
- **Fuente**: Courier New (monospace)
- **Tamaño de fuente**: 10-11pt
- **Orientación**: Vertical
- **Márgenes**: 0-5mm

### Contenido de Comanda
- Encabezado con número de orden y mesa
- Items agrupados por categoría
- Cantidades y notas especiales
- Timestamp de impresión

### Contenido de Boleta
- Encabezado con logo y datos del restaurante
- Lista de items con precios
- Subtotal, IVA y total
- Método de pago
- Pie con mensaje de agradecimiento

---

## 💡 Consejos

1. **Mantén papel suficiente**: Verifica que haya suficiente papel térmico antes de imprimir
2. **Prueba primero**: Imprime una comanda/boleta de prueba antes de usarla en producción
3. **Configuración guardada**: Una vez configurada, la impresora recordará los ajustes
4. **Múltiples impresoras**: Puedes tener una impresora para comandas y otra para boletas
5. **Backup**: Ten papel térmico de repuesto siempre disponible

---

## 🆘 Soporte

Si tienes problemas que no se resuelven con esta guía:

1. Consulta el manual de tu impresora
2. Contacta al soporte del fabricante
3. Verifica los logs del navegador (F12 → Console)
4. Prueba con otro navegador

---

## 📝 Notas

- Las comandas y boletas están optimizadas para impresoras térmicas de 80mm
- El formato es compatible con la mayoría de impresoras térmicas del mercado
- Los estilos CSS están diseñados específicamente para impresión térmica
- El sistema funciona mejor con Chrome o Edge

---

**Última actualización**: 2024


