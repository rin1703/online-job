'use client';

import { useState } from 'react';
import { AlertCircle, Download, ExternalLink, FileText } from 'lucide-react';

import { Button } from '@/components/ui/Btn.tsx';

interface CVViewerProps {
  cvUrl?: string;
  cvName?: string;
}

export default function CVViewer({ cvUrl, cvName }: CVViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!cvUrl) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📄 View CV</h3>
            <p className="text-sm text-gray-600 mt-1">Preview your uploaded CV document</p>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-amber-600 mb-3" />
            <p className="text-amber-900 font-semibold mb-2">No CV Uploaded Yet</p>
            <p className="text-amber-800 text-sm mb-4">
              You haven't uploaded a CV yet. Go to the Media & Files section to upload your CV.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📄 View CV</h3>
            <p className="text-sm text-gray-600 mt-1">
              {cvName ? `Current CV: ${cvName}` : 'Preview your uploaded CV document'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* PDF Viewer Container */}
        {isFullscreen ? (
          // Fullscreen Modal
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
              <h3 className="text-white font-semibold">CV Viewer</h3>
              <button
                onClick={() => setIsFullscreen(false)}
                className="text-white hover:text-gray-200 transition"
                aria-label="Close fullscreen"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe src={`${cvUrl}#toolbar=0`} title="CV Viewer" className="w-full h-full" />
            </div>
          </div>
        ) : (
          <>
            {/* Embedded PDF Viewer */}
            <div className="border border-gray-300 rounded-lg overflow-hidden mb-6 bg-gray-100">
              <iframe
                src={`${cvUrl}#toolbar=0&navpanes=0`}
                title="CV Preview"
                className="w-full h-96"
                allow="fullscreen"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setIsFullscreen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                <ExternalLink size={18} />
                Open Fullscreen
              </Button>
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = cvUrl;
                  link.download = cvName || 'resume.pdf';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-blue-500 text-blue-500 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                <Download size={18} />
                Download
              </Button>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">💡 Tip:</span> You can view, download, or open this
                CV in fullscreen mode. To update your CV, go to the Media & Files section.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
