"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Search, AlertTriangle } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { getReportDate, getDateKey, getIncidents } from '@/lib/dailyReportStorage';
import type { IncidentEntry } from '@/lib/dailyReportStorage';

export function IncidentsList() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
    const [searchQuery, setSearchQuery] = useState('');
    const [incidents, setIncidents] = useState<IncidentEntry[]>([]);

    const reload = useCallback(() => {
        const date = getReportDate();
        const dateKey = getDateKey(date);
        setIncidents(getIncidents(dateKey));
    }, []);

    useEffect(() => { reload(); }, [reload]);

    useEffect(() => {
        const onFocus = () => reload();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [reload]);

    const filtered = incidents
        .filter(inc => inc.status === activeTab)
        .filter(inc =>
            searchQuery === '' ||
            inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.location.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1 className="text-white text-xl font-bold flex-1">Incidents</h1>
                </div>

                {/* Search */}
                <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98989D]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search incidents..."
                        className="w-full bg-[#3A3A3C] text-white placeholder-[#98989D] pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
                    />
                </div>

                {/* Tabs */}
                <div className="flex bg-[#3A3A3C] rounded-xl p-1 mt-3">
                    <button
                        onClick={() => setActiveTab('open')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'open'
                                ? 'bg-[#FF6633] text-white shadow'
                                : 'text-[#98989D]'
                            }`}
                    >
                        Open
                    </button>
                    <button
                        onClick={() => setActiveTab('closed')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'closed'
                                ? 'bg-[#30D158] text-white shadow'
                                : 'text-[#98989D]'
                            }`}
                    >
                        Closed
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="px-4 pt-4">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="w-20 h-20 rounded-full bg-[#FF6633]/20 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-10 h-10 text-[#FF6633]" />
                        </div>
                        <h3 className="text-white text-xl font-semibold mb-2">No incidents</h3>
                        <p className="text-[#98989D] text-center max-w-sm">
                            You currently have no {activeTab} incidents.{'\n'}Tap the + button to report a new incident.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((inc) => (
                            <div
                                key={inc.id}
                                className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#FF453A]/15 flex items-center justify-center shrink-0">
                                        <AlertTriangle className="w-5 h-5 text-[#FF453A]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-white font-semibold text-sm truncate">{inc.title || 'Untitled Incident'}</h3>
                                            {inc.recordable && (
                                                <span className="text-[9px] font-bold uppercase bg-[#FF453A]/20 text-[#FF453A] px-1.5 py-0.5 rounded shrink-0">
                                                    Recordable
                                                </span>
                                            )}
                                        </div>
                                        {inc.location && (
                                            <p className="text-[#98989D] text-xs mb-1">{inc.location}</p>
                                        )}
                                        <div className="text-[#98989D] text-xs flex items-center gap-2">
                                            <span>{formatDate(inc.incidentDate)}</span>
                                            <span>•</span>
                                            <span>{inc.incidentTime}</span>
                                            {(inc.photos?.length ?? 0) > 0 && (
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
                onClick={() => router.push('/incidents/new')}
                className="fixed bottom-24 right-6 w-14 h-14 bg-[#FF6633] rounded-full shadow-lg shadow-[#FF6633]/30 flex items-center justify-center active:scale-95 transition-transform z-30"
                aria-label="Add incident"
            >
                <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
            </button>

            <BottomNav activeTab="home" />
        </div>
    );
}
