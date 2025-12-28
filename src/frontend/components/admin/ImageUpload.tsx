import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string | null) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  disabled?: boolean;
}

export default function ImageUpload({ currentImage, onImageChange, onUploadingChange, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Tipo de archivo no válido. Use JPG, PNG, WebP o GIF.');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('La imagen es muy grande. Máximo 5MB.');
      return;
    }

    setError(null);
    setUploading(true);
    onUploadingChange?.(true); // Notificar que se está subiendo

    try {
      // Mostrar preview local inmediatamente
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      // Subir a través de la API
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const formData = new FormData();
      formData.append('file', file);

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError('No estás autenticado. Por favor, recarga la página e inicia sesión nuevamente.');
          setPreview(currentImage || null);
          setUploading(false);
          return;
        } else if (response.status === 403) {
          setError(`No tienes permisos para subir imágenes: ${result.error || 'Tu usuario no tiene permisos suficientes'}`);
          setPreview(currentImage || null);
          setUploading(false);
          return;
        }
      }

      if (result.success && result.url) {
        console.log('✅ Imagen subida correctamente:', result.url);
        setPreview(result.url);
        onImageChange(result.url);
        setError(null);
      } else {
        console.error('❌ Error subiendo imagen:', result);
        setError(result.error || 'Error al subir la imagen. Verifica que tengas permisos y que la imagen sea válida.');
        setPreview(currentImage || null);
      }
    } catch (err: any) {
      console.error('❌ Error subiendo imagen:', err);
      setError(`Error de conexión: ${err.message || 'No se pudo conectar con el servidor'}`);
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
      onUploadingChange?.(false); // Notificar que terminó la subida
    }
  };

  const handleRemoveImage = async () => {
    if (preview && preview !== currentImage) {
      // Si es una imagen nueva, eliminarla del storage
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        await fetch('/api/delete-image', {
          method: 'POST',
          headers,
          body: JSON.stringify({ imageUrl: preview }),
        });
      } catch (err) {
        console.error('Error eliminando imagen:', err);
      }
    }
    
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-gold-300 text-sm font-medium">
        Imagen del producto (opcional)
      </label>

      {/* Preview de imagen */}
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gold-600"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-500 transition"
              title="Eliminar imagen"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Input de archivo */}
      {!preview && (
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`
              px-4 py-2 rounded-lg border-2 border-dashed border-gold-600 
              text-gold-400 cursor-pointer hover:bg-gold-600/10 transition
              flex items-center gap-2
              ${(disabled || uploading) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Subiendo...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Seleccionar imagen
              </>
            )}
          </label>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Información */}
      <p className="text-gold-400/60 text-xs">
        Formatos: JPG, PNG, WebP, GIF. Máximo 5MB. Se optimizará automáticamente.
      </p>
    </div>
  );
}

