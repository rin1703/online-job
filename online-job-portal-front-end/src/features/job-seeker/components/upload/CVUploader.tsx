'use client';

import { useRef, useState } from 'react';
import { AlertCircle, Download, FileText, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Btn';
import { useUploadCVMutation } from '@/redux/features/profile';

interface CVUploaderProps {
  currentCVUrl?: string;
  currentCVName?: string;
  onUploadSuccess?: (url: string) => void;
}

export default function CVUploader({
  currentCVUrl,
  currentCVName,
  onUploadSuccess,
}: CVUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [uploadCV, { isLoading }] = useUploadCVMutation();

  // Validation
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPE = 'application/pdf';

  const validateFile = (file: File): string => {
    if (file.type !== ALLOWED_TYPE) {
      return 'Only PDF files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
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
      formData.append('cv', selectedFile);

      const result = await uploadCV(formData).unwrap();

      toast.success('CV uploaded successfully!');
      if (result.cv) {
        onUploadSuccess?.(result.cv);
      }

      // Reset
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to upload CV';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRemoveSelection = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    <div className="w-full">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Curriculum Vitae (CV)</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Current CV Info */}
        {currentCVUrl && !selectedFile && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <FileText className="text-green-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-medium text-green-900">CV Uploaded</p>
                  <p className="text-sm text-green-700 mt-1">{currentCVName || 'resume.pdf'}</p>
                </div>
              </div>
              <a
                href={currentCVUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 transition"
              >
                <Download size={20} />
              </a>
            </div>
          </div>
        )}

        {/* Selected File Info */}
        {selectedFile && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <FileText className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-medium text-blue-900">Ready to Upload</p>
                  <p className="text-sm text-blue-700 mt-1">{selectedFile.name}</p>
                  <p className="text-xs text-blue-600 mt-1">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            selectedFile
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading}
          />

          <FileText className="mx-auto text-orange-600 mb-3" size={32} />
          <p className="text-gray-900 font-medium mb-1">
            {selectedFile ? 'Change CV' : 'Upload CV'}
          </p>
          <p className="text-gray-500 text-sm mb-3">Drag and drop or click to select</p>
          <p className="text-gray-400 text-xs">PDF files only, up to 5MB</p>
        </div>

        {/* Action Buttons */}
        {selectedFile && (
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              onClick={handleRemoveSelection}
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
                  Upload CV
                </>
              )}
            </Button>
          </div>
        )}

        {!selectedFile && !currentCVUrl && (
          <p className="text-gray-500 text-sm text-center mt-6">
            No CV uploaded yet. Upload your resume to complete your profile.
          </p>
        )}

        {!selectedFile && currentCVUrl && (
          <p className="text-gray-500 text-sm text-center mt-6">
            Your CV is ready. Click to update with a new version.
          </p>
        )}
      </div>
    </div>
  );
}
