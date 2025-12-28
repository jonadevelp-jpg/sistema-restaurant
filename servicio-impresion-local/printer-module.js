/**
 * Módulo de Impresión usando Windows Spooler (comandos nativos)
 * 
 * Este módulo usa comandos nativos de Windows para imprimir directamente
 * por nombre de impresora, compatible con puertos virtuales vport-usb.
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

/**
 * Lista todas las impresoras disponibles en el sistema usando PowerShell
 */
async function listPrinters() {
  try {
    const { stdout } = await execAsync('powershell -Command "Get-Printer | Select-Object Name, PrinterStatus | ConvertTo-Json"');
    const printers = JSON.parse(stdout);
    const printerArray = Array.isArray(printers) ? printers : [printers];
    return printerArray.map(p => ({
      name: p.Name,
      status: p.PrinterStatus || 'Unknown',
      isDefault: false
    }));
  } catch (error) {
    console.error('❌ Error listando impresoras:', error.message);
    return [];
  }
}

/**
 * Verifica si una impresora existe por nombre usando PowerShell
 */
async function printerExists(printerName) {
  if (!printerName) return false;
  
  try {
    // Escapar comillas en el nombre de la impresora
    const escapedName = printerName.replace(/"/g, '""');
    const { stdout } = await execAsync(`powershell -Command "Get-Printer -Name '${escapedName}' -ErrorAction SilentlyContinue | Select-Object -First 1"`);
    return stdout.trim().length > 0;
  } catch (error) {
    // Si hay error, la impresora probablemente no existe
    return false;
  }
}

/**
 * Genera comandos ESC/POS para formatear texto
 */
class ESCPOSFormatter {
  constructor() {
    this.buffer = Buffer.alloc(0);
  }

  // Comandos ESC/POS básicos
  ESC = '\x1B';
  GS = '\x1D';
  
  // Inicializar impresora
  init() {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(this.ESC + '@', 'ascii')]);
    return this;
  }

  // Alineación
  alignLeft() {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(this.ESC + 'a' + '\x00', 'ascii')]);
    return this;
  }

  alignCenter() {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(this.ESC + 'a' + '\x01', 'ascii')]);
    return this;
  }

  alignRight() {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(this.ESC + 'a' + '\x02', 'ascii')]);
    return this;
  }

  // Tamaño de fuente
  sizeNormal() {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(this.ESC + '!' + '\x00', 'ascii')]);
    return this;
  }

  sizeDouble() {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(this.ESC + '!' + '\x11', 'ascii')]);
    return this;
  }

  sizeDoubleWidth() {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(this.ESC + '!' + '\x20', 'ascii')]);
    return this;
  }

  sizeDoubleHeight() {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(this.ESC + '!' + '\x10', 'ascii')]);
    return this;
  }

  // Estilos
  fontA() {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(this.ESC + '!' + '\x00', 'ascii')]);
    return this;
  }

  fontB() {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(this.ESC + '!' + '\x01', 'ascii')]);
    return this;
  }

  boldOn() {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(this.ESC + 'E' + '\x01', 'ascii')]);
    return this;
  }

  boldOff() {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(this.ESC + 'E' + '\x00', 'ascii')]);
    return this;
  }

  // Agregar texto (usar Latin1 para compatibilidad con impresoras térmicas)
  text(str) {
    if (str) {
      // Convertir UTF-8 a Latin1 para compatibilidad con impresoras ESC/POS
      // Esto evita que caracteres especiales se impriman como números
      try {
        // Reemplazar caracteres especiales que pueden causar problemas
        let cleanStr = str
          .replace(/[^\x00-\xFF]/g, '?') // Reemplazar caracteres fuera de Latin1
          .replace(/\r\n/g, '\n') // Normalizar saltos de línea
          .replace(/\r/g, '\n');
        
        const latin1Str = Buffer.from(cleanStr, 'utf8').toString('latin1');
        this.buffer = Buffer.concat([this.buffer, Buffer.from(latin1Str, 'latin1')]);
      } catch (error) {
        // Si falla la conversión, usar ASCII directamente
        const asciiStr = str.replace(/[^\x00-\x7F]/g, '?'); // Reemplazar caracteres no-ASCII
        this.buffer = Buffer.concat([this.buffer, Buffer.from(asciiStr, 'ascii')]);
      }
    }
    return this;
  }
  
  // Agregar texto con salto de línea automático
  textLine(str) {
    this.text(str);
    this.feed(1);
    return this;
  }

  // Nueva línea (usar comando ESC/POS para feed)
  feed(lines = 1) {
    for (let i = 0; i < lines; i++) {
      // Usar comando ESC/POS para feed (más confiable que \n)
      this.buffer = Buffer.concat([this.buffer, Buffer.from('\n', 'ascii')]);
    }
    return this;
  }

  // Línea separadora (32 caracteres por defecto para POS58)
  separator(char = '-', width = 32) {
    const line = char.repeat(width);
    this.text(line);
    this.feed(1);
    return this;
  }
  
  // Texto con ancho fijo y alineación
  textFixedWidth(text, width = 32, align = 'left') {
    if (!text) text = '';
    
    // Convertir a string y truncar si es muy largo
    let textStr = String(text);
    if (textStr.length > width) {
      textStr = textStr.substring(0, width - 3) + '...';
    }
    
    // Aplicar alineación
    let padded;
    if (align === 'left') {
      padded = textStr.padEnd(width);
    } else if (align === 'right') {
      padded = textStr.padStart(width);
    } else if (align === 'center') {
      const padding = Math.floor((width - textStr.length) / 2);
      padded = ' '.repeat(padding) + textStr + ' '.repeat(width - textStr.length - padding);
    } else {
      padded = textStr.padEnd(width);
    }
    
    this.text(padded);
    return this;
  }
  
  // Línea vacía
  blankLine() {
    this.feed(1);
    return this;
  }

  // Corte de papel
  cut() {
    // Corte parcial (más común)
    this.buffer = Buffer.concat([this.buffer, Buffer.from(this.GS + 'V' + '\x41' + '\x03', 'ascii')]);
    this.feed(3);
    return this;
  }

  // Obtener buffer final
  getBuffer() {
    return this.buffer;
  }

  // Limpiar buffer
  clear() {
    this.buffer = Buffer.alloc(0);
    return this;
  }
}

/**
 * Imprime datos RAW en una impresora por nombre usando comandos nativos de Windows
 * @param {string} printerName - Nombre exacto de la impresora en Windows
 * @param {Buffer} data - Datos RAW (ESC/POS) a imprimir
 * @returns {Promise<boolean>} - true si se imprimió correctamente
 */
async function printRaw(printerName, data) {
  if (!printerName) {
    throw new Error('Nombre de impresora no especificado');
  }

  const exists = await printerExists(printerName);
  if (!exists) {
    throw new Error(`Impresora "${printerName}" no encontrada en el sistema`);
  }

  if (!data || data.length === 0) {
    throw new Error('No hay datos para imprimir');
  }

  try {
    console.log(`🖨️  Enviando ${data.length} bytes a impresora: ${printerName}`);
    
    // Crear archivo temporal
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `print_${Date.now()}_${Math.random().toString(36).substring(7)}.raw`);
    
    // Escribir datos al archivo temporal
    fs.writeFileSync(tempFile, data);
    
    try {
      // Escapar comillas en el nombre de la impresora para PowerShell
      const escapedName = printerName.replace(/'/g, "''");
      const escapedFile = tempFile.replace(/\\/g, '/').replace(/'/g, "''");
      
      // Obtener el puerto de la impresora
      const getPortCommand = `powershell -Command "(Get-Printer -Name '${escapedName}').PortName"`;
      let port = '';
      try {
        const { stdout: portOutput } = await execAsync(getPortCommand);
        port = portOutput.trim();
      } catch (portError) {
        console.warn(`⚠️  No se pudo obtener el puerto, usando método alternativo`);
      }
      
      // Para impresoras térmicas, necesitamos enviar datos RAW directamente al puerto
      // El método más confiable es usar FileStream de .NET a través de PowerShell
      
      let printSuccess = false;
      let actualPort = port;
      
      // Si no tenemos el puerto, obtenerlo
      if (!actualPort) {
        try {
          const getPortCommand = `powershell -Command "(Get-Printer -Name '${escapedName}').PortName"`;
          const { stdout: portOutput } = await execAsync(getPortCommand);
          actualPort = portOutput.trim();
          console.log(`   Puerto obtenido: ${actualPort}`);
        } catch (portError) {
          console.warn(`⚠️  No se pudo obtener el puerto: ${portError.message}`);
        }
      }
      
      // Método 1: Usar COPY directamente con el puerto (funciona con COM, LPT, y algunos vport-usb)
      if (actualPort && (actualPort.startsWith('COM') || actualPort.startsWith('LPT') || actualPort.startsWith('FILE:'))) {
        let targetPort = actualPort;
        if (actualPort.startsWith('FILE:')) {
          targetPort = actualPort.substring(5);
        }
        
        try {
          const copyCommand = `copy /B "${tempFile}" "${targetPort}"`;
          await execAsync(copyCommand, { timeout: 5000 });
          console.log(`✅ Datos enviados usando COPY al puerto: ${actualPort}`);
          printSuccess = true;
        } catch (copyError) {
          console.warn(`⚠️  COPY falló: ${copyError.message}`);
        }
      }
      
      // Método 2: Para puertos virtuales (vport-usb), usar la API de impresión de Windows
      // vport-usb no se puede abrir directamente, necesitamos usar RawPrintToPrinter
      if (!printSuccess) {
        try {
          // Usar el script PowerShell separado para evitar problemas con here-strings
          const scriptPath = path.join(__dirname, 'print-raw.ps1');
          const printCommand = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -PrinterName "${printerName}" -FilePath "${tempFile}"`;
          
          const { stdout, stderr } = await execAsync(printCommand, { timeout: 15000 });
          
          if (stdout.includes('SUCCESS') || (!stderr && stdout.trim() === '')) {
            console.log(`✅ Datos RAW enviados usando API de Windows (puerto virtual: ${actualPort || 'vport-usb'})`);
            printSuccess = true;
          } else if (stderr) {
            throw new Error(stderr);
          }
        } catch (psError) {
          console.warn(`⚠️  API de Windows falló: ${psError.message}`);
          if (psError.stderr) {
            const errorMsg = psError.stderr.toString().substring(0, 300);
            console.warn(`   Detalles: ${errorMsg}`);
          }
        }
      }
      
      // Método 3: Último recurso - intentar COPY con el puerto tal como está
      if (!printSuccess && actualPort) {
        try {
          const finalCopyCommand = `copy /B "${tempFile}" "${actualPort}"`;
          await execAsync(finalCopyCommand, { timeout: 5000 });
          console.log(`✅ Datos enviados usando COPY final`);
          printSuccess = true;
        } catch (finalError) {
          // No lanzar error aquí, ya intentamos todos los métodos
          console.warn(`⚠️  COPY final también falló: ${finalError.message}`);
        }
      }
      
      if (!printSuccess) {
        throw new Error(`No se pudo imprimir después de intentar todos los métodos. Puerto: ${actualPort || 'N/A'}. Verifica que la impresora esté conectada y el puerto sea accesible.`);
      }
      
      return true;
    } finally {
      // Eliminar archivo temporal después de un breve delay
      setTimeout(() => {
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (cleanupError) {
          // Ignorar errores de limpieza
        }
      }, 1000);
    }
  } catch (error) {
    console.error(`❌ Error en printRaw:`, error.message);
    if (error.stderr) {
      console.error(`   Detalles: ${error.stderr}`);
    }
    throw new Error(`Error de impresión: ${error.message}`);
  }
}

/**
 * Imprime texto simple (sin formato ESC/POS)
 * @param {string} printerName - Nombre exacto de la impresora
 * @param {string} text - Texto a imprimir
 * @returns {Promise<boolean>}
 */
async function printText(printerName, text) {
  // Convertir texto a Buffer y usar printRaw
  const textBuffer = Buffer.from(text, 'utf8');
  return printRaw(printerName, textBuffer);
}

module.exports = {
  listPrinters,
  printerExists,
  ESCPOSFormatter,
  printRaw,
  printText
};

