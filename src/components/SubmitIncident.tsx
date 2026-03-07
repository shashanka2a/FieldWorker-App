"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Camera, Upload, X, Check, AlertTriangle } from 'lucide-react';
import { Spinner } from './ui/spinner';
import { getReportDate, getDateKey, saveIncident, formatReportDateLabel } from '@/lib/dailyReportStorage';

export function SubmitIncident() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState<'open' | 'closed'>('open');
    const [recordable, setRecordable] = useState(false);

    const now = new Date();
    const [incidentDate, setIncidentDate] = useState(now.toISOString().split('T')[0]);
    const [incidentTime, setIncidentTime] = useState(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0, 5)
    );
    const [location, setLocation] = useState('');
    const [injuryType, setInjuryType] = useState('');
    const [employeeInfo, setEmployeeInfo] = useState('');
    const [investigation, setInvestigation] = useState('');
    const [outcome, setOutcome] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [cancelNavigating, setCancelNavigating] = useState(false);

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

    const removePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setIsSubmitting(true);

        const date = getReportDate();
        const dateKey = getDateKey(date);

        saveIncident(dateKey, {
            id: Date.now().toString(),
            project: { name: 'North Valley Solar Farm' },
            timestamp: new Date().toISOString(),
            title,
            status,
            recordable,
            incidentDate: incidentDate || new Date().toISOString().split('T')[0],
            incidentTime,
            location,
            injuryType,
            employeeInfo,
            investigation,
            outcome,
            photos: photos.length > 0 ? photos : undefined,
        });

        await new Promise(resolve => setTimeout(resolve, 800));
        setIsSubmitting(false);
        setShowSuccess(true);
        setTimeout(() => router.push('/incidents'), 1200);
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-20 h-20 bg-[#FF6633]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-[#FF6633]" aria-hidden="true" />
                    </div>
                    <h2 className="text-white text-2xl font-semibold mb-2">Submitted!</h2>
                    <p className="text-[#98989D]">Your incident has been saved</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1C1C1E]">
            {/* Status Bar Spacer */}
            <div className="h-12" />

            {/* Header */}
            <header className="px-4 py-4 mb-6 border-b border-[#3A3A3C] sticky top-0 bg-[#1C1C1E] z-10">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => { setCancelNavigating(true); router.push('/incidents'); }}
                        disabled={cancelNavigating}
                        className="flex items-center gap-2 text-[#FF6633] text-base touch-manipulation disabled:opacity-70"
                        aria-label="Cancel and go back"
                    >
                        {cancelNavigating ? <Spinner size="sm" className="border-[#FF6633] border-t-transparent" /> : <ChevronLeft className="w-5 h-5" />}
                        <span>Cancel</span>
                    </button>
                    <h2 className="absolute left-1/2 -translate-x-1/2 text-white text-base font-semibold">
                        New Incident
                    </h2>
                    <div className="w-20" />
                </div>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-4 pb-32 space-y-6">
                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-white text-sm font-medium mb-2">
                        Title <span className="text-[#FF453A]">*</span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Incident title"
                        required
                        className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
                    />
                </div>

                {/* Status & Recordable row */}
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
                        <label className="block text-white text-sm font-medium mb-2">Recordable</label>
                        <button
                            type="button"
                            onClick={() => setRecordable(!recordable)}
                            className={`w-full py-3 rounded-xl text-sm font-semibold border transition-all ${recordable
                                    ? 'bg-[#FF453A]/15 border-[#FF453A] text-[#FF453A]'
                                    : 'bg-[#2C2C2E] border-[#3A3A3C] text-[#98989D]'
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {recordable ? 'Yes' : 'No'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Incident Details Section */}
                <div>
                    <h3 className="text-[#FF6633] text-sm font-bold uppercase tracking-wide mb-4">
                        Incident Details
                    </h3>

                    <div className="space-y-4">
                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="incidentDate" className="block text-[#98989D] text-sm font-medium mb-2">Date</label>
                                <input
                                    id="incidentDate"
                                    type="date"
                                    value={incidentDate}
                                    onChange={(e) => setIncidentDate(e.target.value)}
                                    className="w-full bg-[#2C2C2E] text-white px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633] text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="incidentTime" className="block text-[#98989D] text-sm font-medium mb-2">Time</label>
                                <input
                                    id="incidentTime"
                                    type="time"
                                    value={incidentTime}
                                    onChange={(e) => setIncidentTime(e.target.value)}
                                    className="w-full bg-[#2C2C2E] text-white px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633] text-sm"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="location" className="block text-[#98989D] text-sm font-medium mb-2">Location</label>
                            <input
                                id="location"
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Enter incident location"
                                className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
                            />
                        </div>

                        {/* Injury Type */}
                        <div>
                            <label htmlFor="injuryType" className="block text-[#98989D] text-sm font-medium mb-2">Injury / Illness Type</label>
                            <input
                                id="injuryType"
                                type="text"
                                value={injuryType}
                                onChange={(e) => setInjuryType(e.target.value)}
                                placeholder="e.g. Laceration, Sprain, Chemical Exposure"
                                className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
                            />
                        </div>
                    </div>
                </div>

                {/* Additional Info Section */}
                <div>
                    <h3 className="text-[#FF6633] text-sm font-bold uppercase tracking-wide mb-4">
                        Additional Information
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="employeeInfo" className="block text-[#98989D] text-sm font-medium mb-2">Injured Employee Info</label>
                            <textarea
                                id="employeeInfo"
                                value={employeeInfo}
                                onChange={(e) => setEmployeeInfo(e.target.value)}
                                placeholder="Name, role, department..."
                                rows={3}
                                className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633] resize-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="investigation" className="block text-[#98989D] text-sm font-medium mb-2">Investigation Notes</label>
                            <textarea
                                id="investigation"
                                value={investigation}
                                onChange={(e) => setInvestigation(e.target.value)}
                                placeholder="Describe the investigation details..."
                                rows={3}
                                className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633] resize-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="outcome" className="block text-[#98989D] text-sm font-medium mb-2">Outcome</label>
                            <textarea
                                id="outcome"
                                value={outcome}
                                onChange={(e) => setOutcome(e.target.value)}
                                placeholder="Describe the outcome..."
                                rows={3}
                                className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633] resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Photos */}
                <div>
                    <label className="block text-white text-sm font-medium mb-3">Photos</label>

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
                        'Submit Incident'
                    )}
                </button>
            </div>
        </div>
    );
}
