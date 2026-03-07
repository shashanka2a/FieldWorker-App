"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Search, Eye } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { getReportDate, getDateKey, getObservations } from '@/lib/dailyReportStorage';
import type { ObservationEntry } from '@/lib/dailyReportStorage';

const PRIORITY_COLORS: Record<string, string> = {
    low: '#30D158',
    medium: '#FF9F0A',
    high: '#FF6633',
    critical: '#FF453A',
};

export function ObservationsList() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [observations, setObservations] = useState<ObservationEntry[]>([]);
    const [showCreateSheet, setShowCreateSheet] = useState(false);

    const reload = useCallback(() => {
        const date = getReportDate();
        const dateKey = getDateKey(date);
        setObservations(getObservations(dateKey));
    }, []);

    useEffect(() => { reload(); }, [reload]);

    useEffect(() => {
        const onFocus = () => reload();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [reload]);

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
            <header className="bg-[#2C2C2E] border-b border-[#3A3A3C] px-4 py-4 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="w-10 h-10 flex items-center justify-center active:bg-[#3A3A3C] rounded-lg transition-colors"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="w-6 h-6 text-[#FF6633]" />
                    </button>
                    <h1 className="text-white text-xl font-bold flex-1">Observations</h1>
                </div>

                {/* Search */}
                <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98989D]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search observations..."
                        className="w-full bg-[#3A3A3C] text-white placeholder-[#98989D] pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
                    />
                </div>
            </header>

            {/* Content */}
            <div className="px-4 pt-4">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="w-20 h-20 rounded-full bg-[#FF6633]/20 flex items-center justify-center mb-4">
                            <Eye className="w-10 h-10 text-[#FF6633]" />
                        </div>
                        <h3 className="text-white text-xl font-semibold mb-2">No observations</h3>
                        <p className="text-[#98989D] text-center max-w-sm">
                            Tap the + button to add a new observation
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((obs) => (
                            <div
                                key={obs.id}
                                className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: obs.category === 'negative' ? 'rgba(255,69,58,0.15)' : 'rgba(48,209,88,0.15)' }}
                                    >
                                        <Eye
                                            className="w-5 h-5"
                                            style={{ color: obs.category === 'negative' ? '#FF453A' : '#30D158' }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-white font-semibold text-sm truncate">
                                                {obs.type || 'Untitled Observation'}
                                            </h3>
                                            <span
                                                className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white shrink-0"
                                                style={{
                                                    backgroundColor: obs.category === 'negative' ? '#FF453A' : '#30D158',
                                                }}
                                            >
                                                {obs.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="flex items-center gap-1 text-xs text-[#98989D]">
                                                <span
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: obs.status === 'open' ? '#98989D' : '#30D158' }}
                                                />
                                                {obs.status === 'open' ? 'Open' : 'Closed'}
                                            </span>
                                            <span className="text-[#3A3A3C]">•</span>
                                            <span
                                                className="text-xs font-semibold"
                                                style={{ color: PRIORITY_COLORS[obs.priority] || '#98989D' }}
                                            >
                                                {obs.priority.charAt(0).toUpperCase() + obs.priority.slice(1)}
                                            </span>
                                        </div>
                                        <div className="text-[#98989D] text-xs flex items-center gap-2">
                                            <span>{formatDate(obs.timestamp)}</span>
                                            {obs.assignee && (
                                                <>
                                                    <span>•</span>
                                                    <span>{obs.assignee}</span>
                                                </>
                                            )}
                                            {(obs.photos?.length ?? 0) > 0 && (
                                                <span className="text-[#FF6633] text-[10px] font-medium">Photo</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => setShowCreateSheet(true)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-[#FF6633] rounded-full shadow-lg shadow-[#FF6633]/30 flex items-center justify-center active:scale-95 transition-transform z-30"
                aria-label="Add observation"
            >
                <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
            </button>

            {/* Bottom Sheet — Create new */}
            {showCreateSheet && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        onClick={() => setShowCreateSheet(false)}
                    />
                    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 animate-slideUp">
                        <div className="bg-[#2C2C2E] rounded-2xl overflow-hidden mb-2">
                            <div className="text-center text-[#98989D] text-sm font-medium py-3 border-b border-[#3A3A3C]">
                                Create new
                            </div>
                            <button
                                onClick={() => {
                                    setShowCreateSheet(false);
                                    router.push('/observations/new?category=negative');
                                }}
                                className="w-full py-4 text-center text-[#FF453A] text-lg font-medium border-b border-[#3A3A3C] active:bg-[#3A3A3C] transition-colors"
                            >
                                Negative observation
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateSheet(false);
                                    router.push('/observations/new?category=positive');
                                }}
                                className="w-full py-4 text-center text-[#30D158] text-lg font-medium active:bg-[#3A3A3C] transition-colors"
                            >
                                Positive observation
                            </button>
                        </div>
                        <button
                            onClick={() => setShowCreateSheet(false)}
                            className="w-full bg-[#2C2C2E] rounded-2xl py-4 text-center text-[#0A84FF] text-lg font-bold active:bg-[#3A3A3C] transition-colors"
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
