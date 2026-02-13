"use client";

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Search, SlidersHorizontal, MapPin, Info, X } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { useRouter } from 'next/navigation';
import { Spinner } from './ui/spinner';
import { getReportForDate, getDateKey } from '@/lib/dailyReportStorage';

interface PhotoGroup {
  date: string;
  photos: Photo[];
}

interface Photo {
  id: string;
  url: string;
  hasLocation?: boolean;
  location?: string;
  timestamp?: string;
  project?: string;
  operator?: string;
}

function formatPhotoTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function loadPhotoGroupsFromStorage(): PhotoGroup[] {
  if (typeof window === "undefined") return [];
  const result: PhotoGroup[] = [];
  const today = new Date();

  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = getDateKey(d);
    const report = getReportForDate(d);

    const dateLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    const photos: Photo[] = [];
    let idx = 0;

    report.notes.forEach((n) => {
      (n.photos ?? []).forEach((src) => {
        photos.push({
          id: `n-${dateKey}-${idx++}`,
          url: src,
          timestamp: formatPhotoTime(n.timestamp),
          project: n.project?.name,
        });
      });
    });
    report.attachments.forEach((a) => {
      (a.previews ?? []).forEach((src) => {
        photos.push({
          id: `a-${dateKey}-${idx++}`,
          url: src,
          timestamp: formatPhotoTime(a.timestamp),
          project: a.project?.name,
        });
      });
    });
    report.chemicals.forEach((c) => {
      (c.photos ?? []).forEach((src) => {
        photos.push({
          id: `c-${dateKey}-${idx++}`,
          url: src,
          timestamp: formatPhotoTime(c.timestamp),
          project: c.project?.name,
        });
      });
    });
    report.metrics.forEach((m) => {
      (m.photos ?? []).forEach((src) => {
        photos.push({
          id: `m-${dateKey}-${idx++}`,
          url: src,
          timestamp: formatPhotoTime(m.timestamp),
          project: m.project?.name,
        });
      });
    });
    report.equipment.forEach((e) => {
      const ph = "photos" in e ? (e.photos ?? []) : [];
      const ts = "timestamp" in e ? e.timestamp : "";
      ph.forEach((src) => {
        photos.push({
          id: `e-${dateKey}-${idx++}`,
          url: src,
          timestamp: ts ? formatPhotoTime(ts) : undefined,
          project: "project" in e ? (e.project?.name) : undefined,
        });
      });
    });

    if (photos.length > 0) result.push({ date: dateLabel, photos });
  }

  return result;
}

export function Gallery() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [photoGroups, setPhotoGroups] = useState<PhotoGroup[]>([]);

  const loadPhotos = useCallback(() => {
    setPhotoGroups(loadPhotoGroupsFromStorage());
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  useEffect(() => {
    const onFocus = () => loadPhotos();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadPhotos]);

  const filteredGroups = searchQuery.trim()
    ? photoGroups.map((g) => ({
        ...g,
        photos: g.photos.filter(
          (p) =>
            (p.project?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.timestamp?.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
      })).filter((g) => g.photos.length > 0)
    : photoGroups;

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-20">
      {/* Status Bar Spacer */}
      <div className="h-12" />

      {/* Header */}
      <header className="px-4 py-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => { setNavigating(true); router.back(); }}
            disabled={navigating}
            className="flex items-center gap-2 text-[#0A84FF] text-base touch-manipulation disabled:opacity-70"
            aria-label="Go back"
          >
            {navigating ? <Spinner size="sm" className="border-[#0A84FF] border-t-transparent" /> : <ChevronLeft className="w-5 h-5" />}
            <span>Back</span>
          </button>
          <h2 className="absolute left-1/2 -translate-x-1/2 text-white text-base font-semibold">
            Gallery
          </h2>
          <div className="w-16" />
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-[#2C2C2E] rounded-xl flex items-center gap-2 px-3 py-2.5">
            <Search className="w-5 h-5 text-[#98989D]" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-[#98989D] outline-none"
            />
          </div>
          <button 
            className="w-10 h-10 bg-[#2C2C2E] rounded-xl flex items-center justify-center touch-manipulation"
            aria-label="Filters"
          >
            <SlidersHorizontal className="w-5 h-5 text-[#98989D]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors touch-manipulation ${
              activeTab === 'all'
                ? 'bg-[#3A3A3C] text-white'
                : 'bg-transparent text-[#98989D]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors touch-manipulation ${
              activeTab === 'favorites'
                ? 'bg-[#3A3A3C] text-white'
                : 'bg-transparent text-[#98989D]'
            }`}
          >
            Favorites
          </button>
        </div>
      </header>

      {/* Photo Groups */}
      <div className="px-4 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {filteredGroups.length === 0 ? (
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-8 text-center">
            <div className="text-white font-semibold mb-2">No photos yet</div>
            <div className="text-[#98989D] text-sm">
              {photoGroups.length === 0
                ? "Add photos in Notes, Attachments, or other report entries to see them here"
                : "No photos match your search"}
            </div>
          </div>
        ) : (
        filteredGroups.map((group) => (
          <div key={group.date} className="mb-6">
            <h3 className="text-white text-xl font-bold mb-3">{group.date}</h3>
            <div className="grid grid-cols-2 gap-2">
              {group.photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square">
                  <img
                    src={photo.url}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {photo.hasLocation && (
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-white" />
                      <span className="text-white text-xs">Location</span>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedPhoto(photo)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center touch-manipulation"
                    aria-label="View photo info"
                  >
                    <Info className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))) }
      </div>

      {/* Photo Info Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-[#2C2C2E] rounded-t-3xl p-6 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold">Photo Details</h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-8 h-8 bg-[#3A3A3C] rounded-full flex items-center justify-center touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <img
                  src={selectedPhoto.url}
                  alt="Selected photo"
                  className="w-full aspect-video object-cover rounded-xl mb-4"
                />
              </div>

              <div className="space-y-3">
                {selectedPhoto.timestamp && (
                  <div className="flex items-start gap-3">
                    <div className="text-[#98989D] text-sm w-24">Time</div>
                    <div className="text-white text-sm font-medium flex-1">{selectedPhoto.timestamp}</div>
                  </div>
                )}

                {selectedPhoto.location && (
                  <div className="flex items-start gap-3">
                    <div className="text-[#98989D] text-sm w-24">Location</div>
                    <div className="text-white text-sm font-medium flex-1">{selectedPhoto.location}</div>
                  </div>
                )}

                {selectedPhoto.project && (
                  <div className="flex items-start gap-3">
                    <div className="text-[#98989D] text-sm w-24">Project</div>
                    <div className="text-white text-sm font-medium flex-1">{selectedPhoto.project}</div>
                  </div>
                )}

                {selectedPhoto.operator && (
                  <div className="flex items-start gap-3">
                    <div className="text-[#98989D] text-sm w-24">Operator</div>
                    <div className="text-white text-sm font-medium flex-1">{selectedPhoto.operator}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab="gallery" />
    </div>
  );
}