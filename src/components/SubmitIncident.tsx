"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, X, Camera, Upload } from 'lucide-react';
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
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    );
    const [location, setLocation] = useState('');
    const [injuryType, setInjuryType] = useState('');
    const [employeeInfo, setEmployeeInfo] = useState('');
    const [investigation, setInvestigation] = useState('');
    const [outcome, setOutcome] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
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

    const removePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        const date = getReportDate();
        const dateKey = getDateKey(date);

        const formattedDate = incidentDate || new Date().toISOString().split('T')[0];

        saveIncident(dateKey, {
            id: Date.now().toString(),
            project: { name: 'North Valley Solar Farm' },
            timestamp: new Date().toISOString(),
            title,
            status,
            recordable,
            incidentDate: formattedDate,
            incidentTime,
            location,
            injuryType,
            employeeInfo,
            investigation,
            outcome,
            photos: photos.length > 0 ? photos : undefined,
        });

        await new Promise(resolve => setTimeout(resolve, 600));
        router.push('/incidents');
    };

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[#1C1C1E] pb-20">
            {/* Header */}
            <header className="bg-[#2C2C2E] border-b border-[#3A3A3C] px-4 py-4 sticky top-0 z-20">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push('/incidents')}
                        className="text-[#0A84FF] text-base font-medium active:opacity-60"
                    >
                        Cancel
                    </button>
                    <h1 className="text-white text-lg font-bold">New incident</h1>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="text-[#636366] text-base font-medium disabled:opacity-50 active:opacity-60"
                    >
                        {isSubmitting ? <Spinner size="sm" className="border-[#636366] border-t-transparent" /> : 'Save'}
                    </button>
                </div>
            </header>

            <div className="px-4 pt-4">
                {/* Title */}
                <div className="mb-0 border-b border-[#3A3A3C] py-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        className="w-full bg-transparent text-white placeholder-[#98989D] text-base outline-none"
                    />
                </div>

                {/* Status */}
                <button
                    onClick={() => setStatus(status === 'open' ? 'closed' : 'open')}
                    className="w-full flex items-center justify-between border-b border-[#3A3A3C] py-4 active:bg-[#2C2C2E] transition-colors"
                >
                    <div>
                        <div className="text-[#98989D] text-xs mb-0.5">Status</div>
                        <div className="text-white text-base font-medium capitalize">{status}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#636366]" />
                </button>

                {/* Recordable */}
                <div className="flex items-start justify-between border-b border-[#3A3A3C] py-4">
                    <div className="flex-1 pr-4">
                        <div className="text-white text-base font-semibold mb-1">Recordable</div>
                        <div className="text-[#98989D] text-sm leading-snug">
                            Switch on if this incident is classified as a recordable by your regulatory agency
                        </div>
                    </div>
                    <button
                        onClick={() => setRecordable(!recordable)}
                        className={`w-[51px] h-[31px] rounded-full p-[2px] transition-colors duration-200 shrink-0 ${recordable ? 'bg-[#30D158]' : 'bg-[#636366]'
                            }`}
                    >
                        <div
                            className={`w-[27px] h-[27px] bg-white rounded-full shadow transition-transform duration-200 ${recordable ? 'translate-x-[20px]' : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>

                {/* Incident details heading */}
                <div className="pt-8 pb-4">
                    <h2 className="text-[#0A84FF] text-xl font-semibold">Incident details</h2>
                </div>

                {/* Incident Date */}
                <div className="flex items-center justify-between border-b border-[#3A3A3C] py-4">
                    <div className="flex-1">
                        <div className="text-[#98989D] text-xs mb-0.5">Incident Date</div>
                        <div className="text-white text-base font-medium">{formatDateDisplay(incidentDate)}</div>
                    </div>
                    <label className="w-10 h-10 rounded-lg bg-[#3A3A3C] flex items-center justify-center cursor-pointer">
                        <Calendar className="w-5 h-5 text-[#98989D]" />
                        <input
                            type="date"
                            value={incidentDate}
                            onChange={(e) => setIncidentDate(e.target.value)}
                            className="sr-only"
                        />
                    </label>
                </div>

                {/* Incident Time */}
                <div className="flex items-center justify-between border-b border-[#3A3A3C] py-4">
                    <div className="flex-1">
                        <div className="text-[#98989D] text-xs mb-0.5">Incident Time</div>
                        <input
                            type="time"
                            value={incidentTime}
                            onChange={(e) => setIncidentTime(e.target.value)}
                            className="bg-transparent text-white text-base font-medium outline-none"
                        />
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#3A3A3C] flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#98989D]" />
                    </div>
                </div>

                {/* Location */}
                <div className="flex items-center justify-between border-b border-[#3A3A3C] py-4">
                    <div className="flex-1 pr-3">
                        <div className="text-[#98989D] text-xs mb-0.5">Incident location</div>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Enter location"
                            className="w-full bg-transparent text-white placeholder-[#636366] text-base font-medium outline-none"
                        />
                    </div>
                    {location && (
                        <button onClick={() => setLocation('')} className="w-6 h-6 rounded-full bg-[#636366] flex items-center justify-center">
                            <X className="w-3.5 h-3.5 text-white" />
                        </button>
                    )}
                </div>

                {/* Injury/illness type */}
                <button
                    className="w-full flex items-center justify-between border-b border-[#3A3A3C] py-4 active:bg-[#2C2C2E] transition-colors"
                >
                    <div className="flex-1">
                        <div className="text-[#98989D] text-xs mb-0.5">Injury/illness type</div>
                        <input
                            type="text"
                            value={injuryType}
                            onChange={(e) => setInjuryType(e.target.value)}
                            placeholder="Select type"
                            className="w-full bg-transparent text-white placeholder-[#636366] text-base outline-none"
                        />
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#636366]" />
                </button>

                {/* Expandable sections */}
                <div className="mt-6 space-y-0">
                    {/* Employee Info */}
                    <div className="border-b border-[#3A3A3C] py-4">
                        <label className="text-white text-base font-semibold block mb-2">
                            Injured employee info
                        </label>
                        <textarea
                            value={employeeInfo}
                            onChange={(e) => setEmployeeInfo(e.target.value)}
                            placeholder="Enter employee details..."
                            className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white placeholder-[#636366] text-sm outline-none focus:ring-2 focus:ring-[#FF6633] min-h-[80px]"
                        />
                    </div>

                    {/* Investigation */}
                    <div className="border-b border-[#3A3A3C] py-4">
                        <label className="text-white text-base font-semibold block mb-2">
                            Incident investigation
                        </label>
                        <textarea
                            value={investigation}
                            onChange={(e) => setInvestigation(e.target.value)}
                            placeholder="Describe the investigation..."
                            className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white placeholder-[#636366] text-sm outline-none focus:ring-2 focus:ring-[#FF6633] min-h-[80px]"
                        />
                    </div>

                    {/* Outcome */}
                    <div className="border-b border-[#3A3A3C] py-4">
                        <label className="text-white text-base font-semibold block mb-2">
                            Incident outcome
                        </label>
                        <textarea
                            value={outcome}
                            onChange={(e) => setOutcome(e.target.value)}
                            placeholder="Describe the outcome..."
                            className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white placeholder-[#636366] text-sm outline-none focus:ring-2 focus:ring-[#FF6633] min-h-[80px]"
                        />
                    </div>
                </div>

                {/* Photos */}
                <div className="mt-6 mb-6">
                    <label className="text-white text-sm font-medium mb-3 block">Photos</label>
                    <div className="flex gap-3 mb-4">
                        <button
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex-1 bg-[#2C2C2E] border border-[#3A3A3C] text-white py-3 rounded-xl flex items-center justify-center gap-2 active:bg-[#3A3A3C] transition-colors"
                        >
                            <Camera className="w-5 h-5 text-[#FF6633]" />
                            <span className="text-sm">Camera</span>
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 bg-[#2C2C2E] border border-[#3A3A3C] text-white py-3 rounded-xl flex items-center justify-center gap-2 active:bg-[#3A3A3C] transition-colors"
                        >
                            <Upload className="w-5 h-5 text-[#FF6633]" />
                            <span className="text-sm">Upload</span>
                        </button>
                    </div>
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />

                    {photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                            {photos.map((src, i) => (
                                <div key={i} className="relative aspect-square">
                                    <img src={src} alt="" className="w-full h-full object-cover rounded-xl border border-[#3A3A3C]" />
                                    <button
                                        onClick={() => removePhoto(i)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF453A] rounded-full flex items-center justify-center shadow"
                                    >
                                        <X className="w-3.5 h-3.5 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
