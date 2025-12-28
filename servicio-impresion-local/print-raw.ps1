# Script PowerShell para imprimir datos RAW usando la API de Windows
param(
    [string]$PrinterName,
    [string]$FilePath
)

$code = @"
using System;
using System.Runtime.InteropServices;

public class RawPrint {
    [DllImport("winspool.drv", EntryPoint="OpenPrinterA", CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter, out IntPtr hPrinter, IntPtr pd);
    
    [DllImport("winspool.drv", EntryPoint="ClosePrinter", CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool ClosePrinter(IntPtr hPrinter);
    
    [DllImport("winspool.drv", EntryPoint="StartDocPrinterA", CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, int level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);
    
    [DllImport("winspool.drv", EntryPoint="EndDocPrinter", CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);
    
    [DllImport("winspool.drv", EntryPoint="StartPagePrinter", CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);
    
    [DllImport("winspool.drv", EntryPoint="EndPagePrinter", CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);
    
    [DllImport("winspool.drv", EntryPoint="WritePrinter", CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);
    
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Ansi)]
    public class DOCINFOA {
        [MarshalAs(UnmanagedType.LPStr)]
        public string pDocName;
        [MarshalAs(UnmanagedType.LPStr)]
        public string pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)]
        public string pDataType;
        
        public DOCINFOA() {
            pDocName = "Raw Print";
            pOutputFile = null;
            pDataType = "RAW";
        }
    }
}
"@

Add-Type -TypeDefinition $code

$bytes = [System.IO.File]::ReadAllBytes($FilePath)
$hPrinter = [IntPtr]::Zero

if ([RawPrint]::OpenPrinter($PrinterName, [ref]$hPrinter, [IntPtr]::Zero)) {
    try {
        $di = New-Object RawPrint+DOCINFOA
        if ([RawPrint]::StartDocPrinter($hPrinter, 1, $di)) {
            if ([RawPrint]::StartPagePrinter($hPrinter)) {
                $pBytes = [System.Runtime.InteropServices.Marshal]::AllocHGlobal($bytes.Length)
                [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $pBytes, $bytes.Length)
                $dwWritten = 0
                [RawPrint]::WritePrinter($hPrinter, $pBytes, $bytes.Length, [ref]$dwWritten) | Out-Null
                [System.Runtime.InteropServices.Marshal]::FreeHGlobal($pBytes)
                [RawPrint]::EndPagePrinter($hPrinter) | Out-Null
            }
            [RawPrint]::EndDocPrinter($hPrinter) | Out-Null
            Write-Host "SUCCESS"
        }
    } finally {
        [RawPrint]::ClosePrinter($hPrinter) | Out-Null
    }
} else {
    Write-Error "No se pudo abrir la impresora: $PrinterName"
    exit 1
}

