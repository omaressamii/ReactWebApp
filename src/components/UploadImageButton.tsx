import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, FileImage, CheckCircle, AlertCircle } from 'lucide-react';
import apiService from '@/services/api';

interface UploadImageButtonProps {
  onUpload: (fileUrl: string, fileName: string) => void;
  buttonText?: string;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
}

interface UploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export const UploadImageButton: React.FC<UploadImageButtonProps> = ({
  onUpload,
  buttonText = "Upload Image",
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = "",
  disabled = false,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    error: null,
    success: false,
  });

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      let errorMessage = 'File rejected';

      if (error.code === 'file-too-large') {
        errorMessage = `File size must be less than ${maxSize / (1024 * 1024)}MB`;
      } else if (error.code === 'file-invalid-type') {
        errorMessage = `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
      }

      setUploadState(prev => ({ ...prev, error: errorMessage }));
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const preview = URL.createObjectURL(file);

      setUploadState({
        file,
        preview,
        uploading: false,
        progress: 0,
        error: null,
        success: false,
      });
    }
  }, [acceptedTypes, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false,
    disabled: uploadState.uploading,
  });

  const handleUpload = async () => {
    if (!uploadState.file) return;

    setUploadState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null,
      success: false,
    }));

    try {
      const formData = new FormData();
      formData.append('file', uploadState.file);
      formData.append('type', 'image');

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      const response = await apiService.postByEndpoint(
        'UPLOAD',
        'IMAGE',
        formData,
        {},
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadState(prev => ({ ...prev, progress: percentCompleted }));
          },
        }
      );

      clearInterval(progressInterval);

      if (response.status === 1 && response.data) {
        setUploadState(prev => ({
          ...prev,
          uploading: false,
          progress: 100,
          success: true,
        }));

        // Call the onUpload callback with the file URL
        onUpload(response.data.url || response.data.fileUrl, uploadState.file.name);

        // Close dialog after a short delay
        setTimeout(() => {
          setIsDialogOpen(false);
          resetUpload();
        }, 1500);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: error.message || 'Upload failed',
        success: false,
      }));
    }
  };

  const resetUpload = () => {
    if (uploadState.preview) {
      URL.revokeObjectURL(uploadState.preview);
    }
    setUploadState({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      error: null,
      success: false,
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetUpload();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={className}
          disabled={disabled}
          onClick={() => setIsDialogOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!uploadState.file && !uploadState.uploading && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              <input {...getInputProps()} />
              <FileImage className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p className="text-primary font-medium">Drop the image here...</p>
              ) : (
                <div>
                  <p className="font-medium mb-2">Drag & drop an image here, or click to select</p>
                  <p className="text-sm text-gray-500">
                    Supported formats: {acceptedTypes.map(type => type.split('/')[1]).join(', ')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Maximum size: {maxSize / (1024 * 1024)}MB
                  </p>
                </div>
              )}
            </div>
          )}

          {uploadState.preview && uploadState.file && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={uploadState.preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                {!uploadState.uploading && !uploadState.success && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={resetUpload}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>File:</strong> {uploadState.file.name}</p>
                <p><strong>Size:</strong> {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}

          {uploadState.uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadState.progress}%</span>
              </div>
              <Progress value={uploadState.progress} className="w-full" />
            </div>
          )}

          {uploadState.success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Image uploaded successfully!
              </AlertDescription>
            </Alert>
          )}

          {uploadState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {uploadState.error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {uploadState.file && !uploadState.uploading && !uploadState.success && (
              <Button onClick={handleUpload} className="flex-1">
                Upload Image
              </Button>
            )}
            <Button onClick={handleDialogClose} variant="outline">
              {uploadState.success ? 'Close' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};