"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Search, HardHat, AlertTriangle } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { getReportDate, getDateKey, getIncidents } from '@/lib/dailyReportStorage';
import type { IncidentEntry } from '@/lib/dailyReportStorage';

export function IncidentsList() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
    const [searchQuery, setSearchQuery] = useState('');
    const [incidents, setIncidents] = useState<IncidentEntry[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const date = getReportDate();
        const dateKey = getDateKey(date);
        setIncidents(getIncidents(dateKey));
    }, []);

    // Reload on visibility change (returning from form)
    useEffect(() => {
        if (!mounted) return;
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                const date = getReportDate();
                const dateKey = getDateKey(date);
                setIncidents(getIncidents(dateKey));
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [mounted]);

    // Also reload when navigating back (using focus)
    useEffect(() => {
        const handleFocus = () => {
            const date = getReportDate();
            const dateKey = getDateKey(date);
            setIncidents(getIncidents(dateKey));
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const filtered = incidents
        .filter(inc => inc.status === activeTab)
        .filter(inc =>
            searchQuery === '' ||
            inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.location.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[#1C1C1E] pb-20">
            {/* Header */}
            <header className="bg-[#2C2C2E] border-b border-[#3A3A3C] px-4 pt-4 pb-0 sticky top-0 z-20">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => router.push('/')}
                        className="text-[#0A84FF] text-base font-medium flex items-center gap-0.5 active:opacity-60"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </button>
                </div>
                <h1 className="text-white text-3xl font-bold mb-4 px-0">Incidents</h1>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98989D]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="w-full bg-[#3A3A3C] text-white placeholder-[#98989D] pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
                    />
                </div>

                {/* Tabs */}
                <div className="bg-[#3A3A3C] rounded-lg p-0.5 flex mb-0">
                    <button
                        onClick={() => setActiveTab('open')}
                        className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'open'
                                ? 'bg-[#636366] text-white shadow'
                                : 'text-[#98989D]'
                            }`}
                    >
                        Open
                    </button>
                    <button
                        onClick={() => setActiveTab('closed')}
                        className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'closed'
                                ? 'bg-[#636366] text-white shadow'
                                : 'text-[#98989D]'
                            }`}
                    >
                        Closed
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="px-4 pt-6">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-24">
                        <div className="w-20 h-20 rounded-full bg-[#2C2C2E] flex items-center justify-center mb-5">
                            <HardHat className="w-10 h-10 text-[#636366]" />
                        </div>
                        <h2 className="text-white text-xl font-semibold mb-2">No incidents</h2>
                        <p className="text-[#98989D] text-sm text-center leading-relaxed max-w-[260px]">
                            You currently have no incidents.{'\n'}Add a new incident by tapping the + Icon!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((inc) => (
                            <div
                                key={inc.id}
                                className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-4 active:bg-[#3A3A3C] transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#FF453A]/15 flex items-center justify-center shrink-0 mt-0.5">
                                        <AlertTriangle className="w-5 h-5 text-[#FF453A]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-white font-semibold text-base truncate">{inc.title || 'Untitled Incident'}</h3>
                                            {inc.recordable && (
                                                <span className="text-[10px] font-bold uppercase bg-[#FF453A]/20 text-[#FF453A] px-1.5 py-0.5 rounded">
                                                    Recordable
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[#98989D] text-sm mb-1">{inc.location || '—'}</p>
                                        <div className="flex items-center gap-3 text-xs text-[#636366]">
                                            <span>{formatDate(inc.incidentDate)}</span>
                                            <span>{inc.incidentTime}</span>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-xs font-semibold px-2 py-1 rounded-lg ${inc.status === 'open'
                                                ? 'bg-[#FF9F0A]/15 text-[#FF9F0A]'
                                                : 'bg-[#30D158]/15 text-[#30D158]'
                                            }`}
                                    >
                                        {inc.status === 'open' ? 'Open' : 'Closed'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FAB — Add Incident */}
            <button
                onClick={() => router.push('/incidents/new')}
                className="fixed bottom-24 right-5 w-14 h-14 bg-[#FF6633] rounded-full flex items-center justify-center shadow-lg shadow-[#FF6633]/30 active:scale-95 transition-transform z-20"
                aria-label="Add incident"
            >
                <Plus className="w-7 h-7 text-white" />
            </button>

            <BottomNav activeTab="home" />
        </div>
    );
}
