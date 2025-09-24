import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface UploadOptions {
  endpoint: string;
  fieldName?: string;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  onProgress?: (progress: number) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
  headers?: Record<string, string>;
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File, options: UploadOptions) => {
      const {
        endpoint,
        fieldName = 'file',
        maxSize = 10 * 1024 * 1024, // 10MB default
        acceptedTypes = ['image/*', 'application/pdf'],
        onProgress,
        onSuccess,
        onError,
        headers = {},
      } = options;

      // Reset state
      setError(null);
      setProgress(0);
      setIsUploading(true);

      try {
        // Validate file
        if (file.size > maxSize) {
          throw new Error(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        }

        if (
          acceptedTypes.length > 0 &&
          !acceptedTypes.some((type) => {
            if (type.endsWith('/*')) {
              return file.type.startsWith(type.split('/*')[0]);
            }
            return file.type === type;
          })
        ) {
          throw new Error(
            `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`
          );
        }

        const formData = new FormData();
        formData.append(fieldName, file);

        // Create custom fetch with progress tracking
        const xhr = new XMLHttpRequest();
        
        return new Promise((resolve, reject) => {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentCompleted = Math.round((event.loaded * 100) / event.total);
              setProgress(percentCompleted);
              onProgress?.(percentCompleted);
            }
          });

          xhr.addEventListener('load', async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
                toast.success('File uploaded successfully');
                onSuccess?.(data);
                resolve(data);
              } catch (error) {
                console.error('Error parsing response:', error);
                reject(new Error('Failed to parse server response'));
              }
            } else {
              let errorMessage = 'Upload failed';
              try {
                const errorData = xhr.responseText ? JSON.parse(xhr.responseText) : {};
                errorMessage = errorData.message || errorMessage;
              } catch (e) {}
              
              const error = new Error(errorMessage);
              setError(errorMessage);
              toast.error(errorMessage);
              onError?.(error);
              reject(error);
            }
            setIsUploading(false);
          });

          xhr.addEventListener('error', () => {
            const error = new Error('Network error occurred');
            setError('Network error occurred');
            toast.error('Network error occurred');
            onError?.(error);
            setIsUploading(false);
            reject(error);
          });

          xhr.open('POST', `/api${endpoint}`, true);
          
          // Set headers
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
          
          // Get the session token for authorization
          const token = localStorage.getItem('token');
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }
          
          xhr.send(formData);
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
        setError(errorMessage);
        toast.error(errorMessage);
        onError?.(error as Error);
        setIsUploading(false);
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setProgress(0);
    setError(null);
    setIsUploading(false);
  }, []);

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    reset,
  };
}

// Example usage:
/*
function FileUploader() {
  const { uploadFile, isUploading, progress } = useFileUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadFile(file, {
        endpoint: '/documents/upload',
        maxSize: 5 * 1024 * 1024, // 5MB
        onProgress: (progress) => console.log(`Upload progress: ${progress}%`),
        onSuccess: (data) => console.log('Upload successful:', data),
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} disabled={isUploading} />
      {isUploading && (
        <div>
          <progress value={progress} max="100" />
          <span>{progress}%</span>
        </div>
      )}
    </div>
  );
}
*/
