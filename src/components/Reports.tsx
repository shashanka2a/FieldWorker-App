"use client";

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BottomNav } from './BottomNav';

export function Reports() {
  const router = useRouter();

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
            Reports
          </h2>
          <div className="w-16" />
        </div>
      </header>

      {/* Content */}
      <div className="px-4">
        <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-6 text-center">
          <div className="text-white text-lg font-semibold mb-2">Reports Coming Soon</div>
          <div className="text-[#98989D] text-sm">
            View and generate reports for your projects
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="more" />
    </div>
  );
}
