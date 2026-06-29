'use client';

import { useRef, useState } from 'react';
import { AlertCircle, Camera, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Btn';

import { useUploadAvatarMutation } from '@/redux/features/profile';

interface AvatarUploaderProps {
  currentAvatarUrl?: string;
  onUploadSuccess?: (url: string) => void;
}

export default function AvatarUploader({ currentAvatarUrl, onUploadSuccess }: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [uploadAvatar, { isLoading }] = useUploadAvatarMutation();

  // Validation
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const validateFile = (file: File): string => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, WebP, and GIF files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 2MB';
    }
    return '';
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError('');
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle drag & drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError('');
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setError('');
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const result = await uploadAvatar(formData).unwrap();

      toast.success('Avatar uploaded successfully!');
      if (result.avatar) {
        onUploadSuccess?.(result.avatar);
      }

      // Reset
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to upload avatar';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRemovePreview = () => {
    setPreview(currentAvatarUrl || null);
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mb-6 flex flex-col items-center">
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-orange-200 mb-4 bg-gray-100">
              <img src={preview} alt="Avatar preview" className="w-full h-full object-cover" />
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-600 text-center">
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            preview
              ? 'border-orange-300 bg-orange-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading}
          />

          <Camera className="mx-auto text-orange-600 mb-3" size={32} />
          <p className="text-gray-900 font-medium mb-1">
            {preview ? 'Change Avatar' : 'Upload Avatar'}
          </p>
          <p className="text-gray-500 text-sm mb-3">Drag and drop or click to select</p>
          <p className="text-gray-400 text-xs">JPG, PNG, WebP, GIF up to 2MB</p>
        </div>

        {/* Action Buttons */}
        {selectedFile && (
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              onClick={handleRemovePreview}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <X size={18} />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Avatar
                </>
              )}
            </Button>
          </div>
        )}

        {!selectedFile && !preview && (
          <p className="text-gray-500 text-sm text-center mt-6">
            No avatar yet. Upload your profile picture to get started.
          </p>
        )}

        {!selectedFile && preview && (
          <p className="text-gray-500 text-sm text-center mt-6">
            Current avatar is displayed above. Click to change.
          </p>
        )}
      </div>
    </div>
  );
}
