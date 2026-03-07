"use client";

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, X, Camera, Upload, Trash2, Plus } from 'lucide-react';
import { Spinner } from './ui/spinner';
import { getReportDate, getDateKey, saveObservation, formatReportDateLabel } from '@/lib/dailyReportStorage';

const OBSERVATION_TYPES = [
    'Hazardous Materials – Chemicals',
    'PPE Violation',
    'Housekeeping',
    'Electrical Safety',
    'Fall Protection',
    'Vehicle/Equipment Safety',
    'Environmental',
    'Fire Safety',
    'Other',
];

const PRIORITIES: Array<{ value: 'low' | 'medium' | 'high' | 'critical'; label: string; color: string }> = [
    { value: 'low', label: 'Low', color: '#30D158' },
    { value: 'medium', label: 'Medium', color: '#FF9F0A' },
    { value: 'high', label: 'High', color: '#FF6633' },
    { value: 'critical', label: 'Critical', color: '#FF453A' },
];

function SubmitObservationInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category') as 'negative' | 'positive' | null;

    const [category, setCategory] = useState<'negative' | 'positive'>(categoryParam || 'negative');
    const [type, setType] = useState('');
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [status, setStatus] = useState<'open' | 'closed'>('open');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
    const [description, setDescription] = useState('');
    const [assignee, setAssignee] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [resolution, setResolution] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [resolutionPhotos, setResolutionPhotos] = useState<string[]>([]);
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const cameraInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhotos((prev) => [...prev, event.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        const date = getReportDate();
        const dateKey = getDateKey(date);

        saveObservation(dateKey, {
            id: Date.now().toString(),
            project: { name: 'North Valley Solar Farm' },
            timestamp: new Date().toISOString(),
            category,
            type,
            status,
            priority,
            description,
            assignee,
            dueDate,
            resolution,
            resolutionPhotos: resolutionPhotos.length > 0 ? resolutionPhotos : undefined,
            photos: photos.length > 0 ? photos : undefined,
        });

        await new Promise(resolve => setTimeout(resolve, 600));
        router.push('/observations');
    };

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return 'Not set';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const priorityInfo = PRIORITIES.find(p => p.value === priority)!;

    return (
        <div className="min-h-screen bg-[#1C1C1E] pb-20">
            {/* Header */}
            <header className="bg-[#2C2C2E] border-b border-[#3A3A3C] px-4 py-4 sticky top-0 z-20">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push('/observations')}
                        className="text-[#0A84FF] text-base font-medium active:opacity-60"
                    >
                        Cancel
                    </button>
                    <h1 className="text-white text-lg font-bold">Edit observation</h1>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="text-[#FF6633] text-base font-semibold disabled:opacity-50 active:opacity-60"
                    >
                        {isSubmitting ? <Spinner size="sm" className="border-[#FF6633] border-t-transparent" /> : 'Save'}
                    </button>
                </div>
            </header>

            <div className="px-4 pt-2">
                {/* Attachments */}
                <div className="flex items-center justify-between border-b border-[#3A3A3C] py-4">
                    <span className="text-white text-base">Attachments</span>
                    <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="w-10 h-10 flex items-center justify-center"
                    >
                        <Camera className="w-5 h-5 text-[#98989D]" />
                    </button>
                </div>
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />

                {photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 py-3 border-b border-[#3A3A3C]">
                        {photos.map((src, i) => (
                            <div key={i} className="relative aspect-square">
                                <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
                                <button
                                    onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF453A] rounded-full flex items-center justify-center"
                                >
                                    <X className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed border-[#3A3A3C] rounded-lg flex items-center justify-center"
                        >
                            <Plus className="w-5 h-5 text-[#636366]" />
                        </button>
                    </div>
                )}

                {/* Observation Category */}
                <div className="flex items-center justify-between border-b border-[#3A3A3C] py-4 mt-4 bg-[#2C2C2E] -mx-4 px-4 rounded-t-xl">
                    <span className="text-[#FF6633] text-base font-medium">Observation Category</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCategory(category === 'negative' ? 'positive' : 'negative')}
                            className={`px-3 py-1 rounded-full text-sm font-bold ${category === 'negative'
                                    ? 'bg-[#FF453A] text-white'
                                    : 'bg-[#30D158] text-white'
                                }`}
                        >
                            {category === 'negative' ? 'Negative' : 'Positive'}
                        </button>
                        <ChevronRight className="w-5 h-5 text-[#636366]" />
                    </div>
                </div>

                {/* Type */}
                <button
                    onClick={() => setShowTypePicker(!showTypePicker)}
                    className="w-full flex items-center justify-between border-b border-[#3A3A3C] py-4 bg-[#2C2C2E] -mx-4 px-4 active:bg-[#3A3A3C]"
                >
                    <div>
                        <div className="text-[#98989D] text-xs mb-0.5">Type</div>
                        <div className="text-white text-base font-medium">{type || 'Select type'}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#636366]" />
                </button>

                {showTypePicker && (
                    <div className="bg-[#2C2C2E] -mx-4 px-4 border-b border-[#3A3A3C]">
                        {OBSERVATION_TYPES.map((t) => (
                            <button
                                key={t}
                                onClick={() => {
                                    setType(t);
                                    setShowTypePicker(false);
                                }}
                                className={`w-full text-left py-3 text-sm border-b border-[#3A3A3C] last:border-0 ${type === t ? 'text-[#FF6633] font-semibold' : 'text-white'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                )}

                {/* Status */}
                <button
                    onClick={() => setStatus(status === 'open' ? 'closed' : 'open')}
                    className="w-full flex items-center justify-between border-b border-[#3A3A3C] py-4 bg-[#2C2C2E] -mx-4 px-4 active:bg-[#3A3A3C]"
                >
                    <div>
                        <div className="text-[#98989D] text-xs mb-0.5">Status</div>
                        <div className="text-white text-base font-medium capitalize">{status}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#636366]" />
                </button>

                {/* Priority */}
                <div className="flex items-center justify-between border-b border-[#3A3A3C] py-4 bg-[#2C2C2E] -mx-4 px-4 rounded-b-xl">
                    <div>
                        <div className="text-[#98989D] text-xs mb-0.5">Priority</div>
                        <div className="text-white text-base font-medium">{priorityInfo.label}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        {PRIORITIES.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setPriority(p.value)}
                                className={`w-7 h-7 rounded-full border-2 transition-all ${priority === p.value ? 'scale-110' : 'opacity-40'
                                    }`}
                                style={{
                                    borderColor: p.color,
                                    backgroundColor: priority === p.value ? p.color : 'transparent',
                                }}
                                aria-label={p.label}
                            />
                        ))}
                    </div>
                </div>

                {/* MORE INFO toggle */}
                <button
                    onClick={() => setShowMoreInfo(!showMoreInfo)}
                    className="flex items-center gap-1 py-4 text-[#FF6633] font-semibold text-sm"
                >
                    MORE INFO
                    <ChevronRight className={`w-4 h-4 transition-transform ${showMoreInfo ? 'rotate-90' : ''}`} />
                </button>

                {showMoreInfo && (
                    <div className="space-y-4 mb-4">
                        <div>
                            <label className="text-[#98989D] text-sm block mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the observation..."
                                className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white placeholder-[#636366] text-sm outline-none focus:ring-2 focus:ring-[#FF6633] min-h-[80px]"
                            />
                        </div>
                    </div>
                )}

                {/* Assignees */}
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white text-lg font-semibold">Assignees ({assignee ? 1 : 0})</h3>
                        <button className="w-8 h-8 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {assignee ? (
                        <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-4 flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#30D158] flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {assignee.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-medium text-sm">{assignee}</div>
                            </div>
                            <button
                                onClick={() => setAssignee('')}
                                className="w-8 h-8 flex items-center justify-center"
                            >
                                <Trash2 className="w-4 h-4 text-[#98989D]" />
                            </button>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <input
                                type="text"
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                placeholder="Enter assignee name"
                                className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white placeholder-[#636366] text-sm outline-none focus:ring-2 focus:ring-[#FF6633]"
                            />
                        </div>
                    )}
                </div>

                {/* Due Date */}
                <div className="mb-4">
                    <div className="text-[#98989D] text-sm mb-1">Due Date: <span className="text-white">{formatDateDisplay(dueDate)}</span></div>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-2 text-white text-sm outline-none"
                    />
                </div>

                {/* Resolution */}
                <div className="mb-4">
                    <div className="text-[#98989D] text-sm mb-1">
                        Resolution Photos: <span className="text-[#FF6633]">{resolutionPhotos.length > 0 ? `${resolutionPhotos.length} added` : 'Not added'}</span>
                    </div>
                    <button
                        onClick={() => {
                            // Reuse camera for resolution photos
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.multiple = true;
                            input.onchange = (e) => {
                                const files = (e.target as HTMLInputElement).files;
                                if (!files) return;
                                Array.from(files).forEach((file) => {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        setResolutionPhotos(prev => [...prev, ev.target?.result as string]);
                                    };
                                    reader.readAsDataURL(file);
                                });
                            };
                            input.click();
                        }}
                        className="inline-block border-2 border-[#FF6633] text-[#FF6633] font-semibold text-sm px-4 py-2 rounded-lg active:bg-[#FF6633]/10 transition-colors"
                    >
                        Add Resolution
                    </button>
                </div>

                {/* Team Member Notifications */}
                <div className="border-t border-[#3A3A3C] pt-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white text-lg font-semibold">Team Member Notifications (0)</h3>
                        <button className="w-8 h-8 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SubmitObservation() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center text-[#98989D]">Loading…</div>}>
            <SubmitObservationInner />
        </Suspense>
    );
}
