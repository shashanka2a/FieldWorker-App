"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, FileText, Plus } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { getReportDate, getReportForDate, formatReportDateLabel } from '@/lib/dailyReportStorage';
import type { NoteEntry } from '@/lib/dailyReportStorage';

interface Note {
  id: string;
  content: string;
  timestamp: string;
  date: string;
  hasPhotos?: boolean;
}

function formatNoteTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function loadNotesFromStorage(): Note[] {
  const date = getReportDate();
  const report = getReportForDate(date);
  return report.notes
    .map((entry: NoteEntry) => ({
      id: entry.id,
      content: entry.notes || "(No content)",
      date: formatReportDateLabel(new Date(entry.timestamp)),
      timestamp: formatNoteTime(entry.timestamp),
      hasPhotos: (entry.photos?.length ?? 0) > 0,
    }))
    .reverse();
}

export function NotesList() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);

  const refreshNotes = useCallback(() => {
    setNotes(loadNotesFromStorage());
  }, []);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  useEffect(() => {
    const onFocus = () => refreshNotes();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshNotes]);

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
          <h1 className="text-white text-xl font-bold flex-1">Notes</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 pt-4">
        {notes.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 rounded-full bg-[#0A84FF]/20 flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-[#0A84FF]" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">No notes yet</h3>
            <p className="text-[#98989D] text-center max-w-sm">
              Tap the + button to add your first note
            </p>
          </div>
        ) : (
          // Notes List
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A84FF]/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#0A84FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm leading-relaxed mb-2 line-clamp-3">
                      {note.content}
                    </p>
                    <div className="text-[#98989D] text-xs flex items-center gap-2">
                      <span>{note.date} • {note.timestamp}</span>
                      {note.hasPhotos && (
                        <span className="text-[#0A84FF] text-[10px] font-medium">Photo</span>
                      )}
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
        onClick={() => router.push('/submit/notes')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#0A84FF] rounded-full shadow-lg shadow-[#0A84FF]/30 flex items-center justify-center active:scale-95 transition-transform z-30"
        aria-label="Add new note"
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
}
