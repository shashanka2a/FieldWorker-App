"use client";

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Camera, Upload, X, Check, Plus, Trash2 } from 'lucide-react';
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

const PRIORITIES = [
    { value: 'low' as const, label: 'Low', color: '#30D158' },
    { value: 'medium' as const, label: 'Medium', color: '#FF9F0A' },
    { value: 'high' as const, label: 'High', color: '#FF6633' },
    { value: 'critical' as const, label: 'Critical', color: '#FF453A' },
];

function SubmitObservationInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category') as 'negative' | 'positive' | null;

    const [category, setCategory] = useState<'negative' | 'positive'>(categoryParam || 'negative');
    const [type, setType] = useState('');
    const [status, setStatus] = useState<'open' | 'closed'>('open');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
    const [description, setDescription] = useState('');
    const [assignee, setAssignee] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [resolution, setResolution] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [resolutionPhotos, setResolutionPhotos] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [cancelNavigating, setCancelNavigating] = useState(false);

    const cameraInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resolutionFileRef = useRef<HTMLInputElement>(null);

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

    const handleResolutionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setResolutionPhotos((prev) => [...prev, event.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const removePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
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

        await new Promise(resolve => setTimeout(resolve, 800));
        setIsSubmitting(false);
        setShowSuccess(true);
        setTimeout(() => router.push('/observations'), 1200);
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-20 h-20 bg-[#FF6633]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-[#FF6633]" aria-hidden="true" />
                    </div>
                    <h2 className="text-white text-2xl font-semibold mb-2">Submitted!</h2>
                    <p className="text-[#98989D]">Your observation has been saved</p>
                </div>
            </div>
        );
    }

    const priorityInfo = PRIORITIES.find(p => p.value === priority)!;

    return (
        <div className="min-h-screen bg-[#1C1C1E]">
            {/* Status Bar Spacer */}
            <div className="h-12" />

            {/* Header */}
            <header className="px-4 py-4 mb-6 border-b border-[#3A3A3C] sticky top-0 bg-[#1C1C1E] z-10">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => { setCancelNavigating(true); router.push('/observations'); }}
                        disabled={cancelNavigating}
                        className="flex items-center gap-2 text-[#FF6633] text-base touch-manipulation disabled:opacity-70"
                        aria-label="Cancel and go back"
                    >
                        {cancelNavigating ? <Spinner size="sm" className="border-[#FF6633] border-t-transparent" /> : <ChevronLeft className="w-5 h-5" />}
                        <span>Cancel</span>
                    </button>
                    <h2 className="absolute left-1/2 -translate-x-1/2 text-white text-base font-semibold">
                        New Observation
                    </h2>
                    <div className="w-20" />
                </div>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-4 pb-32 space-y-6">
                {/* Category */}
                <div>
                    <label className="block text-white text-sm font-medium mb-2">Category</label>
                    <div className="flex bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setCategory('negative')}
                            className={`flex-1 py-3 text-sm font-semibold transition-all ${category === 'negative' ? 'bg-[#FF453A] text-white' : 'text-[#98989D]'
                                }`}
                        >
                            Negative
                        </button>
                        <button
                            type="button"
                            onClick={() => setCategory('positive')}
                            className={`flex-1 py-3 text-sm font-semibold transition-all ${category === 'positive' ? 'bg-[#30D158] text-white' : 'text-[#98989D]'
                                }`}
                        >
                            Positive
                        </button>
                    </div>
                </div>

                {/* Type */}
                <div>
                    <label htmlFor="type" className="block text-white text-sm font-medium mb-2">
                        Observation Type <span className="text-[#FF453A]">*</span>
                    </label>
                    <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        required
                        className="w-full bg-[#2C2C2E] text-white px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
                    >
                        <option value="">Select type...</option>
                        {OBSERVATION_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* Status & Priority */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">Status</label>
                        <div className="flex bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setStatus('open')}
                                className={`flex-1 py-3 text-sm font-semibold transition-all ${status === 'open' ? 'bg-[#FF6633] text-white' : 'text-[#98989D]'
                                    }`}
                            >
                                Open
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('closed')}
                                className={`flex-1 py-3 text-sm font-semibold transition-all ${status === 'closed' ? 'bg-[#30D158] text-white' : 'text-[#98989D]'
                                    }`}
                            >
                                Closed
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-white text-sm font-medium mb-2">Priority</label>
                        <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-3 py-2.5 flex items-center justify-between">
                            {PRIORITIES.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setPriority(p.value)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${priority === p.value ? 'scale-110' : 'opacity-40'
                                        }`}
                                    style={{
                                        borderColor: p.color,
                                        backgroundColor: priority === p.value ? p.color : 'transparent',
                                    }}
                                    aria-label={p.label}
                                    title={p.label}
                                >
                                    {priority === p.value && <Check className="w-3.5 h-3.5 text-white" />}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs mt-1 font-medium" style={{ color: priorityInfo.color }}>{priorityInfo.label}</p>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-white text-sm font-medium mb-2">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the observation..."
                        rows={4}
                        className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633] resize-none"
                    />
                </div>

                {/* Assignee & Due Date */}
                <div>
                    <h3 className="text-[#FF6633] text-sm font-bold uppercase tracking-wide mb-4">
                        Assignment
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="assignee" className="block text-[#98989D] text-sm font-medium mb-2">Assignee</label>
                            {assignee ? (
                                <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#30D158] flex items-center justify-center text-white font-bold text-xs shrink-0">
                                        {assignee.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-white text-sm font-medium flex-1">{assignee}</span>
                                    <button type="button" onClick={() => setAssignee('')}>
                                        <Trash2 className="w-4 h-4 text-[#98989D]" />
                                    </button>
                                </div>
                            ) : (
                                <input
                                    id="assignee"
                                    type="text"
                                    value={assignee}
                                    onChange={(e) => setAssignee(e.target.value)}
                                    placeholder="Enter assignee name"
                                    className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
                                />
                            )}
                        </div>

                        <div>
                            <label htmlFor="dueDate" className="block text-[#98989D] text-sm font-medium mb-2">Due Date</label>
                            <input
                                id="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full bg-[#2C2C2E] text-white px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633] text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Resolution */}
                <div>
                    <h3 className="text-[#FF6633] text-sm font-bold uppercase tracking-wide mb-4">
                        Resolution
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="resolution" className="block text-[#98989D] text-sm font-medium mb-2">Resolution Notes</label>
                            <textarea
                                id="resolution"
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                placeholder="Describe the resolution..."
                                rows={3}
                                className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633] resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[#98989D] text-sm font-medium mb-2">Resolution Photos</label>
                            {resolutionPhotos.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    {resolutionPhotos.map((src, i) => (
                                        <div key={i} className="relative aspect-square">
                                            <img src={src} alt="" className="w-full h-full object-cover rounded-xl border border-[#3A3A3C]" />
                                            <button
                                                type="button"
                                                onClick={() => setResolutionPhotos(prev => prev.filter((_, j) => j !== i))}
                                                className="absolute -top-2 -right-2 w-7 h-7 bg-[#FF453A] rounded-full flex items-center justify-center shadow-lg"
                                            >
                                                <X className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => resolutionFileRef.current?.click()}
                                className="bg-[#2C2C2E] border border-[#3A3A3C] text-white py-3 px-6 rounded-xl flex items-center gap-2 active:bg-[#3A3A3C] transition-colors touch-manipulation"
                            >
                                <Plus className="w-5 h-5 text-[#FF6633]" />
                                <span className="font-medium text-sm">Add Resolution Photo</span>
                            </button>
                            <input ref={resolutionFileRef} type="file" accept="image/*" multiple onChange={handleResolutionUpload} className="hidden" />
                        </div>
                    </div>
                </div>

                {/* Photos */}
                <div>
                    <label className="block text-white text-sm font-medium mb-3">Observation Photos</label>

                    {photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            {photos.map((photo, index) => (
                                <div key={index} className="relative aspect-square">
                                    <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover rounded-xl border border-[#3A3A3C]" />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute -top-2 -right-2 w-7 h-7 bg-[#FF453A] rounded-full flex items-center justify-center touch-manipulation shadow-lg"
                                        aria-label={`Remove photo ${index + 1}`}
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex-1 bg-[#2C2C2E] border border-[#3A3A3C] text-white py-3 rounded-xl flex items-center justify-center gap-2 active:bg-[#3A3A3C] transition-colors touch-manipulation"
                        >
                            <Camera className="w-5 h-5" aria-hidden="true" />
                            <span className="font-medium">Take Photo</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 bg-[#2C2C2E] border border-[#3A3A3C] text-white py-3 rounded-xl flex items-center justify-center gap-2 active:bg-[#3A3A3C] transition-colors touch-manipulation"
                        >
                            <Upload className="w-5 h-5" aria-hidden="true" />
                            <span className="font-medium">Upload</span>
                        </button>
                    </div>

                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                </div>
            </form>

            {/* Fixed Bottom Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#1C1C1E] border-t border-[#3A3A3C] p-4 pb-8">
                <p className="text-[#FF6633] text-sm font-medium mb-2 text-center" aria-live="polite">
                    Reporting for: {formatReportDateLabel(getReportDate())}
                </p>
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-[#FF6633] text-white py-4 rounded-xl font-semibold text-base active:opacity-80 transition-opacity disabled:opacity-50 touch-manipulation shadow-lg flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Spinner size="md" className="border-white border-t-transparent" />
                            <span>Submitting...</span>
                        </>
                    ) : (
                        'Submit Observation'
                    )}
                </button>
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
