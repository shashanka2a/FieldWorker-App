"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Spinner } from './ui/spinner';
import { getReportDate, getDateKey, saveAttachments, formatReportDateLabel } from '@/lib/dailyReportStorage';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
}

export function SubmitAttachments() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = Math.random().toString(36).substr(2, 9);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedFiles(prev => [...prev, {
            id,
            file,
            preview: event.target?.result as string
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push({ id, file });
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const date = getReportDate();
    const dateKey = getDateKey(date);
    const fileNames = uploadedFiles.map(f => f.file.name);
    const previews = uploadedFiles
      .map(f => f.preview)
      .filter((p): p is string => !!p);
    saveAttachments(dateKey, {
      id: Date.now().toString(),
      project: { name: 'North Valley Solar Farm' },
      timestamp: new Date().toISOString(),
      fileNames,
      notes,
      previews: previews.length ? previews : undefined,
    });
    router.push('/attachments-list');
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-[#8E8E93]" />;
    }
    return <FileText className="w-6 h-6 text-[#8E8E93]" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-20">
      {/* Header */}
      <header className="bg-[#2C2C2E] border-b border-[#3A3A3C] px-4 py-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/attachments-list')}
            className="w-10 h-10 flex items-center justify-center active:bg-[#3A3A3C] rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-[#FF6633]" />
          </button>
          <h1 className="text-white text-xl font-bold flex-1">Add Photos</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 pt-4">
        {/* Upload Area */}
        <div className="mb-4">
          <label className="text-[#98989D] text-sm font-semibold mb-2 block">
            Files
          </label>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-[#2C2C2E] border-2 border-dashed border-[#FF6633]/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 active:bg-[#3A3A3C] transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-[#FF6633]/15 flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#FF6633]" />
            </div>
            <div className="text-white font-medium">Tap to upload files</div>
            <div className="text-[#98989D] text-sm">Images, PDFs, or Documents</div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,.doc,.docx"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mb-4">
            <label className="text-[#98989D] text-sm font-semibold mb-2 block">
              Uploaded Files ({uploadedFiles.length})
            </label>
            <div className="space-y-2">
              {uploadedFiles.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-3 flex items-center gap-3"
                >
                  {fileItem.preview ? (
                    <img
                      src={fileItem.preview}
                      alt={fileItem.file.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#3A3A3C] flex items-center justify-center">
                      {getFileIcon(fileItem.file)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">
                      {fileItem.file.name}
                    </div>
                    <div className="text-[#98989D] text-xs">
                      {formatFileSize(fileItem.file.size)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(fileItem.id)}
                    className="w-8 h-8 rounded-full bg-[#FF453A]/20 flex items-center justify-center active:bg-[#FF453A]/30 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4 text-[#FF453A]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <label className="text-[#98989D] text-sm font-semibold mb-2 block">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about these photos..."
            className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white placeholder-[#98989D] focus:outline-none focus:ring-2 focus:ring-[#FF6633] min-h-[100px]"
          />
        </div>
      </div>

      {/* Fixed bottom submit — sits just above the bottom nav bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-[#1C1C1E] border-t border-[#3A3A3C] px-4 pt-3 pb-4">
        <p className="text-[#FF6633] text-sm font-medium mb-2 text-center" aria-live="polite">
          Reporting for: {formatReportDateLabel(getReportDate())}
        </p>
        <button
          onClick={handleSubmit}
          disabled={uploadedFiles.length === 0 || isSubmitting}
          className="w-full bg-[#FF6633] text-white py-4 rounded-xl font-semibold text-base active:opacity-80 transition-opacity disabled:opacity-50 touch-manipulation shadow-lg shadow-[#FF6633]/20 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Spinner size="md" className="border-white border-t-transparent" />
              <span>Submitting...</span>
            </>
          ) : (
            'Submit Photos'
          )}
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
}
