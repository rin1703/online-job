import { useState } from 'react';
import { ExternalLink, Eye, FileText, Trash2, Upload } from 'lucide-react';

type CVSectionProps = {
  cvUrl?: string;
  onUpdate: (cvUrl: string) => void;
  isPublicView?: boolean;
};

function CVSection({ cvUrl, onUpdate, isPublicView }: CVSectionProps) {
  const [inputUrl, setInputUrl] = useState(cvUrl || '');
  const [isEditing, setIsEditing] = useState(!cvUrl);

  // Chuyển đổi Google Drive link sang dạng có thể xem
  const getViewableUrl = (url: string) => {
    // Nếu là link Google Drive dạng: https://drive.google.com/file/d/FILE_ID/view
    const driveMatch = url.match(/\/file\/d\/([^\\/]+)/);
    if (driveMatch) {
      const fileId = driveMatch[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url;
  };

  // Kiểm tra xem có phải link Google Drive không
  const isGoogleDriveUrl = (url: string) => {
    return url.includes('drive.google.com');
  };

  const handleSave = () => {
    if (inputUrl.trim()) {
      onUpdate(inputUrl.trim());
      setIsEditing(false);
    }
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to delete this CV?')) {
      onUpdate('');
      setInputUrl('');
      setIsEditing(true);
    }
  };
  const handleCancel = () => {
    setInputUrl(cvUrl || '');
    setIsEditing(false);
  };

  return (
    <section className="w-full  p-6 bg-card rounded-lg shadow-md border border-border">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">CV/Resume</h2>
            <p className="text-sm text-muted-foreground">
              {cvUrl ? 'CV uploaded' : 'CV not uploaded yet'}
            </p>
          </div>
        </div>
        {cvUrl && !isEditing && !isPublicView && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            <Upload className="h-4 w-4" />
            Update
          </button>
        )}
      </div>

      {/* Form nhập URL */}
      {isEditing ? (
        <div className="space-y-4">
          <div>
            {/*Google Drive URL hoặc URL khác*/}
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              💡 Note: For Google Drive, make sure the file is shared publicly (Anyone with the link
              can view)
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={!inputUrl.trim()}
              className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Save
            </button>
            {cvUrl && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : cvUrl ? (
        <div className="space-y-4">
          {/* Preview CV */}
          <div className="rounded-lg border border-border bg-white overflow-hidden">
            {isGoogleDriveUrl(cvUrl) ? (
              <iframe
                src={getViewableUrl(cvUrl)}
                className="w-full h-[800px] lg:h-[1000px]"
                title="CV Preview"
                allow="autoplay"
              />
            ) : (
              <div className="p-8 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-muted-foreground mb-4">This file cannot be previewed.</p>
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open file in a new tab
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              <Eye className="h-4 w-4" />
              View Full Screen
            </a>
            {!isPublicView && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete CV
              </button>
            )}
          </div>

          {/* CV URL Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Current URL:</p>
            <p className="text-sm text-foreground break-all">{cvUrl}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default CVSection;
