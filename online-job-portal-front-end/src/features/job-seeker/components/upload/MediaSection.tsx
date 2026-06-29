'use client';

import { useRef, useState } from 'react';
import { useUploadAvatarMutation, useUploadCVMutation } from '@/redux/features/profile';
import { Button } from '@/components/ui/Btn';
import { toast } from 'sonner';
import { Upload, FileText, AlertCircle, Loader2, X, Download, Camera } from 'lucide-react';

interface MediaSectionProps {
  currentAvatarUrl?: string;
  currentCVUrl?: string;
  currentCVName?: string;
}

export default function MediaSection({
  currentAvatarUrl,
  currentCVUrl,
  currentCVName,
}: MediaSectionProps) {
  // Avatar state
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatarUrl || null);
  const [avatarSelectedFile, setAvatarSelectedFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();

  // CV state
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [cvSelectedFile, setCVSelectedFile] = useState<File | null>(null);
  const [cvError, setCVError] = useState('');
  const [uploadCV, { isLoading: isUploadingCV }] = useUploadCVMutation();

  // Constants
  const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
  const MAX_CV_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const ALLOWED_CV_TYPE = 'application/pdf';

  // ============ AVATAR HANDLERS ============

  const validateAvatarFile = (file: File): string => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, WebP, and GIF files are allowed';
    }
    if (file.size > MAX_AVATAR_SIZE) {
      return 'File size must be less than 2MB';
    }
    return '';
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setAvatarError(validationError);
      toast.error(validationError);
      return;
    }

    setAvatarError('');
    setAvatarSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setAvatarError(validationError);
      toast.error(validationError);
      return;
    }

    setAvatarError('');
    setAvatarSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarSelectedFile) {
      toast.error('Please select an avatar first');
      return;
    }

    try {
      setAvatarError('');
      const formData = new FormData();
      formData.append('avatar', avatarSelectedFile);

      await uploadAvatar(formData).unwrap();

      toast.success('Avatar uploaded successfully!');
      setAvatarSelectedFile(null);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to upload avatar';
      setAvatarError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleAvatarCancel = () => {
    setAvatarPreview(currentAvatarUrl || null);
    setAvatarSelectedFile(null);
    setAvatarError('');
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  // ============ CV HANDLERS ============

  const validateCVFile = (file: File): string => {
    if (file.type !== ALLOWED_CV_TYPE) {
      return 'Only PDF files are allowed';
    }
    if (file.size > MAX_CV_SIZE) {
      return 'File size must be less than 5MB';
    }
    return '';
  };

  const handleCVSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateCVFile(file);
    if (validationError) {
      setCVError(validationError);
      toast.error(validationError);
      return;
    }

    setCVError('');
    setCVSelectedFile(file);
  };

  const handleCVDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validationError = validateCVFile(file);
    if (validationError) {
      setCVError(validationError);
      toast.error(validationError);
      return;
    }

    setCVError('');
    setCVSelectedFile(file);
  };

  const handleCVUpload = async () => {
    if (!cvSelectedFile) {
      toast.error('Please select a CV file first');
      return;
    }

    try {
      setCVError('');
      const formData = new FormData();
      formData.append('cv', cvSelectedFile);

      await uploadCV(formData).unwrap();

      toast.success('CV uploaded successfully!');
      setCVSelectedFile(null);
      if (cvInputRef.current) {
        cvInputRef.current.value = '';
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to upload CV';
      setCVError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCVCancel = () => {
    setCVSelectedFile(null);
    setCVError('');
    if (cvInputRef.current) {
      cvInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-8">
      {/* AVATAR UPLOAD */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Profile Picture</h3>

        {avatarError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-700 text-sm">{avatarError}</p>
          </div>
        )}

        {/* Avatar Preview */}
        {avatarPreview && (
          <div className="mb-6 flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-orange-200 mb-3 bg-gray-100">
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            </div>
            {avatarSelectedFile && (
              <p className="text-xs text-gray-600 text-center">
                {avatarSelectedFile.name} ({(avatarSelectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={handleAvatarDrop}
          onClick={() => avatarInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            avatarPreview
              ? 'border-orange-300 bg-orange-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            className="hidden"
            disabled={isUploadingAvatar}
          />

          <Camera className="mx-auto text-orange-600 mb-2" size={28} />
          <p className="text-gray-900 font-medium text-sm">
            {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
          </p>
          <p className="text-gray-500 text-xs">Drag & drop or click to select</p>
          <p className="text-gray-400 text-xs mt-1">JPG, PNG, WebP, GIF up to 2MB</p>
        </div>

        {/* Upload Buttons */}
        {avatarSelectedFile && (
          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              onClick={handleAvatarCancel}
              disabled={isUploadingAvatar}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <X size={16} />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAvatarUpload}
              disabled={isUploadingAvatar}
              className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploadingAvatar ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload
                </>
              )}
            </Button>
          </div>
        )}
      </section>

      {/* CV UPLOAD */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Curriculum Vitae (CV)</h3>

        {cvError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-700 text-sm">{cvError}</p>
          </div>
        )}

        {/* Current CV Info */}
        {currentCVUrl && !cvSelectedFile && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-green-600" size={20} />
              <div>
                <p className="text-sm font-medium text-green-900">CV Uploaded</p>
                <p className="text-xs text-green-700">{currentCVName || 'resume.pdf'}</p>
              </div>
            </div>
            <a
              href={currentCVUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700"
            >
              <Download size={18} />
            </a>
          </div>
        )}

        {/* Selected CV Info */}
        {cvSelectedFile && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              <div>
                <p className="text-sm font-medium text-blue-900">Ready to Upload</p>
                <p className="text-xs text-blue-700">{cvSelectedFile.name}</p>
                <p className="text-xs text-blue-600">{formatFileSize(cvSelectedFile.size)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={handleCVDrop}
          onClick={() => cvInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            cvSelectedFile
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <input
            ref={cvInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleCVSelect}
            className="hidden"
            disabled={isUploadingCV}
          />

          <FileText className="mx-auto text-orange-600 mb-2" size={28} />
          <p className="text-gray-900 font-medium text-sm">
            {cvSelectedFile ? 'Change CV' : 'Upload CV'}
          </p>
          <p className="text-gray-500 text-xs">Drag & drop or click to select</p>
          <p className="text-gray-400 text-xs mt-1">PDF files only, up to 5MB</p>
        </div>

        {/* Upload Buttons */}
        {cvSelectedFile && (
          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              onClick={handleCVCancel}
              disabled={isUploadingCV}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <X size={16} />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCVUpload}
              disabled={isUploadingCV}
              className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploadingCV ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload
                </>
              )}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
