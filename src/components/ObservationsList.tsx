"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, Search, SlidersHorizontal, Eye } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { getReportDate, getDateKey, getObservations } from '@/lib/dailyReportStorage';
import type { ObservationEntry } from '@/lib/dailyReportStorage';

export function ObservationsList() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [observations, setObservations] = useState<ObservationEntry[]>([]);
    const [showCreateSheet, setShowCreateSheet] = useState(false);

    const reload = () => {
        const date = getReportDate();
        const dateKey = getDateKey(date);
        setObservations(getObservations(dateKey));
    };

    useEffect(() => { reload(); }, []);

    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') reload();
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

    useEffect(() => {
        window.addEventListener('focus', reload);
        return () => window.removeEventListener('focus', reload);
    }, []);

    const filtered = observations.filter(obs =>
        searchQuery === '' ||
        obs.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obs.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (iso: string) => {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[#1C1C1E] pb-20">
            {/* Header */}
            <header className="bg-[#1C1C1E] px-4 pt-4 pb-0 sticky top-0 z-20">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => router.push('/')}
                        className="text-[#0A84FF] text-base font-medium flex items-center gap-0.5 active:opacity-60"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </button>
                </div>
                <h1 className="text-white text-3xl font-bold mb-4">Observations</h1>

                {/* Search + Filter */}
                <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98989D]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full bg-[#3A3A3C] text-white placeholder-[#98989D] pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
                        />
                    </div>
                    <button className="w-10 h-10 bg-[#3A3A3C] rounded-xl flex items-center justify-center" aria-label="Filter">
                        <SlidersHorizontal className="w-5 h-5 text-[#98989D]" />
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="px-4">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-24">
                        <div className="w-20 h-20 rounded-full bg-[#2C2C2E] flex items-center justify-center mb-5">
                            <Eye className="w-10 h-10 text-[#636366]" />
                        </div>
                        <h2 className="text-white text-xl font-semibold mb-2">No observations</h2>
                        <p className="text-[#98989D] text-sm text-center leading-relaxed max-w-[260px]">
                            You currently have no observations.{'\n'}Add a new observation by tapping the + Icon!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {filtered.map((obs) => (
                            <div
                                key={obs.id}
                                className="border-b border-[#3A3A3C] py-4 flex items-center justify-between active:bg-[#2C2C2E] transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white text-base font-medium mb-1.5 truncate">
                                        {obs.type || 'Untitled Observation'}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-[#98989D]">
                                        <span className="flex items-center gap-1">
                                            <span className={`w-2 h-2 rounded-full ${obs.status === 'open' ? 'bg-[#98989D]' : 'bg-[#30D158]'}`} />
                                            {obs.status === 'open' ? 'Open' : 'Closed'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            📅 {formatDate(obs.timestamp)}
                                        </span>
                                        {obs.assignee && (
                                            <span className="flex items-center gap-1">
                                                👤 {obs.assignee}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[#636366] shrink-0" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => setShowCreateSheet(true)}
                className="fixed bottom-24 right-5 w-14 h-14 bg-[#FF6633] rounded-full flex items-center justify-center shadow-lg shadow-[#FF6633]/30 active:scale-95 transition-transform z-20"
                aria-label="Add observation"
            >
                <Plus className="w-7 h-7 text-white" />
            </button>

            {/* Bottom Sheet — Create new */}
            {showCreateSheet && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-30"
                        onClick={() => setShowCreateSheet(false)}
                    />
                    <div className="fixed bottom-0 left-0 right-0 z-40 animate-slideUp">
                        <div className="bg-[#2C2C2E] rounded-t-2xl mx-2 mb-2 overflow-hidden">
                            <div className="text-center text-[#98989D] text-sm font-medium py-3 border-b border-[#3A3A3C]">
                                Create new
                            </div>
                            <button
                                onClick={() => {
                                    setShowCreateSheet(false);
                                    router.push('/observations/new?category=negative');
                                }}
                                className="w-full py-4 text-center text-[#FF453A] text-lg font-medium border-b border-[#3A3A3C] active:bg-[#3A3A3C]"
                            >
                                Negative observation
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateSheet(false);
                                    router.push('/observations/new?category=positive');
                                }}
                                className="w-full py-4 text-center text-[#0A84FF] text-lg font-medium active:bg-[#3A3A3C]"
                            >
                                Positive observation
                            </button>
                        </div>
                        <button
                            onClick={() => setShowCreateSheet(false)}
                            className="w-full bg-[#2C2C2E] rounded-xl mx-2 mb-2 py-4 text-center text-[#0A84FF] text-lg font-bold active:bg-[#3A3A3C]"
                            style={{ width: 'calc(100% - 16px)' }}
                        >
                            Cancel
                        </button>
                    </div>
                </>
            )}

            <BottomNav activeTab="home" />
        </div>
    );
}
