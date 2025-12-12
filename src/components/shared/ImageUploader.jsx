import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

/**
 * Reusable ImageUploader component with dynamic folder support
 * @param {string} folder - Storage folder path (e.g., 'services', 'products', 'gallery')
 * @param {function} onUpload - Callback function called with the uploaded image URL
 * @param {string} currentImage - Current image URL for preview
 * @param {array} allowedTypes - Allowed file types (default: ['image/jpeg', 'image/png', 'image/webp'])
 * @param {number} maxSize - Maximum file size in MB (default: 5)
 * @param {string} className - Additional CSS classes
 */
const ImageUploader = ({
  folder = 'uploads',
  onUpload,
  currentImage = null,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize = 5,
  className = '',
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Tipo de archivo no permitido. Usa: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      throw new Error(`El archivo es muy grande. Máximo ${maxSize}MB permitido.`);
    }

    return true;
  };

  const generateFileName = (file) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
  };

  const getContentTypeFromExtension = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp',
      'tiff': 'image/tiff',
      'ico': 'image/x-icon'
    };
    return mimeTypes[extension] || 'image/jpeg'; // Fallback a JPEG si no se reconoce
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setError(null);
      setUploading(true);

      // Validate file
      validateFile(file);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Generate storage path
      const fileName = generateFileName(file);
      const storagePath = `${folder}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      // Forzar metadatos correctos para evitar application/octet-stream
      const detectedType = file.type || getContentTypeFromExtension(file.name);
      const metadata = {
        contentType: detectedType,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          folder: folder
        }
      };

      console.log('📤 ImageUploader: Subiendo archivo', {
        name: file.name,
        size: file.size,
        originalType: file.type,
        detectedType: detectedType,
        path: storagePath
      });

      // Upload file con metadatos explícitos
      await uploadBytes(storageRef, file, metadata);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Call onUpload callback
      if (onUpload) {
        onUpload(downloadURL);
      }

      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);

    } catch (err) {
      console.error('Error uploading image:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        serverResponse: err.serverResponse,
        customData: err.customData
      });
      setError(err.message);
      setPreview(currentImage); // Reset to current image on error
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const clearImage = () => {
    setPreview(null);
    setError(null);
    if (onUpload) {
      onUpload(null);
    }
  };

  return (
    <div className={`image-uploader ${className}`}>
      <div className="relative">
        {/* Upload Area */}
        <div className={`
          relative border-2 border-dashed rounded-lg transition-all
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <input
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            disabled={uploading || disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          {preview ? (
            /* Image Preview */
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.querySelector('input[type="file"]').click();
                    }}
                    disabled={uploading || disabled}
                    className="bg-white text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
                  >
                    Cambiar
                  </button>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImage();
                    }}
                    disabled={uploading || disabled}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Upload progress indicator */}
              {uploading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                    <span className="text-sm font-medium">Subiendo...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Upload Placeholder */
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="mb-4">
                {uploading ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>
              
              <div className="mb-2">
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  {uploading ? 'Subiendo imagen...' : 'Haz clic para subir una imagen'}
                </p>
              </div>
              
              <p className="text-xs text-gray-500">
                {allowedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()} hasta {maxSize}MB
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-2 text-xs text-gray-500">
          <p>Carpeta de destino: <span className="font-mono bg-gray-100 px-1 rounded">{folder}/</span></p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;