"use client";

import { useState } from 'react';
import { ChevronLeft, Search, SlidersHorizontal, MapPin, Info, X } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { useRouter } from 'next/navigation';

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

export function Gallery() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Mock photo data
  const photoGroups: PhotoGroup[] = [
    {
      date: 'March 26, 2025',
      photos: [
        { 
          id: '1', 
          url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', 
          hasLocation: true,
          location: 'North Valley Solar Farm',
          timestamp: '2:45 PM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
        { 
          id: '2', 
          url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400', 
          hasLocation: true,
          location: 'North Valley Solar Farm',
          timestamp: '3:12 PM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
        { 
          id: '3', 
          url: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=400', 
          hasLocation: true,
          location: 'North Valley Solar Farm',
          timestamp: '4:30 PM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
      ]
    },
    {
      date: 'March 25, 2025',
      photos: [
        { 
          id: '4', 
          url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
          timestamp: '9:15 AM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
        { 
          id: '5', 
          url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400', 
          hasLocation: true,
          location: 'North Valley Solar Farm',
          timestamp: '10:22 AM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
        { 
          id: '6', 
          url: 'https://images.unsplash.com/photo-1581092918484-8313e1f7e8cc?w=400',
          timestamp: '11:45 AM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
        { 
          id: '7', 
          url: 'https://images.unsplash.com/photo-1581092918484-8313e1f7e8cc?w=400', 
          hasLocation: true,
          location: 'North Valley Solar Farm',
          timestamp: '1:30 PM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
        { 
          id: '8', 
          url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400',
          timestamp: '2:15 PM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
        { 
          id: '9', 
          url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400',
          timestamp: '3:00 PM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
        { 
          id: '10', 
          url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400', 
          hasLocation: true,
          location: 'North Valley Solar Farm',
          timestamp: '3:45 PM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
        { 
          id: '11', 
          url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400',
          timestamp: '4:30 PM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
      ]
    },
    {
      date: 'March 24, 2025',
      photos: [
        { 
          id: '12', 
          url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400', 
          hasLocation: true,
          location: 'North Valley Solar Farm',
          timestamp: '8:30 AM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
        { 
          id: '13', 
          url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
          timestamp: '10:15 AM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
        { 
          id: '14', 
          url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
          timestamp: '12:00 PM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
        { 
          id: '15', 
          url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
          timestamp: '2:30 PM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
        { 
          id: '16', 
          url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
          timestamp: '4:45 PM',
          project: 'North Valley Solar Farm',
          operator: 'Ricky Smith'
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-20">
      {/* Status Bar Spacer */}
      <div className="h-12" />

      {/* Header */}
      <header className="px-4 py-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#0A84FF] text-base touch-manipulation"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
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
        {photoGroups.map((group) => (
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
        ))}
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