"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Paperclip, Plus, FileText, Image as ImageIcon } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { getReportDate, getReportForDate } from '@/lib/dailyReportStorage';
import type { AttachmentEntry } from '@/lib/dailyReportStorage';

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document';
  size: string;
  timestamp: string;
  date: string;
  fileCount: number;
  preview?: string;
}

function formatAttachmentTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function loadAttachmentsFromStorage(): Attachment[] {
  const date = getReportDate();
  const report = getReportForDate(date);
  return report.attachments
    .map((entry: AttachmentEntry) => {
      const hasImages = (entry.previews?.length ?? 0) > 0;
      const name = entry.fileNames.length === 1
        ? entry.fileNames[0]
        : `${entry.fileNames.length} files`;
      return {
        id: entry.id,
        name,
        type: hasImages ? 'image' as const : 'document' as const,
        size: entry.fileNames.length > 1 ? `${entry.fileNames.length} files` : '—',
        date: formatReportDateLabel(new Date(entry.timestamp)),
        timestamp: formatAttachmentTime(entry.timestamp),
        fileCount: entry.fileNames.length,
        preview: entry.previews?.[0],
      };
    })
    .reverse();
}

export function AttachmentsList() {
  const router = useRouter();
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const refreshAttachments = useCallback(() => {
    setAttachments(loadAttachmentsFromStorage());
  }, []);

  useEffect(() => {
    refreshAttachments();
  }, [refreshAttachments]);

  useEffect(() => {
    const onFocus = () => refreshAttachments();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshAttachments]);

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-[#8E8E93]" />;
      case 'pdf':
      case 'document':
        return <FileText className="w-5 h-5 text-[#8E8E93]" />;
      default:
        return <Paperclip className="w-5 h-5 text-[#8E8E93]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-20">
      {/* Status Bar Spacer */}
      <div className="h-12" />

      {/* Header */}
      <header className="bg-[#2C2C2E] border-b border-[#3A3A3C] px-4 py-3 sticky top-12 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 flex items-center justify-center active:bg-[#3A3A3C] rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-[#0A84FF]" />
          </button>
          <h1 className="text-white text-xl font-bold flex-1">Attachments</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 pt-4">
        {attachments.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 rounded-full bg-[#8E8E93]/20 flex items-center justify-center mb-4">
              <Paperclip className="w-10 h-10 text-[#8E8E93]" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">No attachments yet</h3>
            <p className="text-[#98989D] text-center max-w-sm">
              Tap the + button to add your first attachment
            </p>
          </div>
        ) : (
          // Attachments List
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8E8E93]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {attachment.preview ? (
                      <img src={attachment.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getAttachmentIcon(attachment.type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium mb-1 truncate">
                      {attachment.name}
                    </p>
                    <div className="text-[#98989D] text-xs">
                      {attachment.fileCount > 1 ? `${attachment.fileCount} files • ` : ""}{attachment.date} • {attachment.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => router.push('/submit/attachments')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#8E8E93] rounded-full shadow-lg shadow-[#8E8E93]/30 flex items-center justify-center active:scale-95 transition-transform z-30"
        aria-label="Add new attachment"
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
}
