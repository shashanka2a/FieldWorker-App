"use client";

import { useState, useRef } from 'react';
import { ChevronLeft, Camera, X, Upload, Check } from 'lucide-react';
import { Spinner } from './ui/spinner';
import { useRouter } from 'next/navigation';
import { getReportDate, getDateKey, saveNotes, formatReportDateLabel } from '@/lib/dailyReportStorage';

export function Notes() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cancelNavigating, setCancelNavigating] = useState(false);
  
  const currentProject = {
    name: 'North Valley Solar Farm',
  };

  const [category, setCategory] = useState('general');
  const [notes, setNotes] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'weather', label: 'Weather' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'safety', label: 'Safety' },
    { value: 'progress', label: 'Progress' },
  ];

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
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    const date = getReportDate();
    const dateKey = getDateKey(date);
    const submission = {
      id: Date.now().toString(),
      project: currentProject,
      timestamp: new Date().toISOString(),
      category,
      notes,
      photos,
    };
    saveNotes(dateKey, submission);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      router.push('/');
    }, 1200);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#0A84FF]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#0A84FF]" aria-hidden="true" />
          </div>
          <h2 className="text-white text-2xl font-semibold mb-2">Submitted!</h2>
          <p className="text-[#98989D]">Your note has been saved</p>
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
            onClick={() => { setCancelNavigating(true); router.push('/'); }}
            disabled={cancelNavigating}
            className="flex items-center gap-2 text-[#0A84FF] text-base touch-manipulation disabled:opacity-70"
            aria-label="Cancel and go back"
          >
            {cancelNavigating ? <Spinner size="sm" className="border-[#0A84FF] border-t-transparent" /> : <ChevronLeft className="w-5 h-5" />}
            <span>Cancel</span>
          </button>
          <h2 className="absolute left-1/2 -translate-x-1/2 text-white text-base font-semibold">
            Notes
          </h2>
          <div className="w-20" />
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 pb-32 space-y-6">
        {/* Project */}
        <div>
          <label className="block text-[#98989D] text-sm font-medium mb-2">
            Project
          </label>
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] px-4 py-3 rounded-xl">
            <div className="text-white font-medium">{currentProject.name}</div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-white text-sm font-medium mb-2">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#2C2C2E] text-white px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#0A84FF]"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-white text-sm font-medium mb-2">
            Notes <span className="text-[#FF453A]">*</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            placeholder="Enter your notes here..."
            required
            className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#0A84FF] resize-none"
          />
        </div>

        {/* Photos Section */}
        <div>
          <label className="block text-white text-sm font-medium mb-3">
            Photos
          </label>
          
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl border border-[#3A3A3C]"
                  />
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </form>

      {/* Fixed Bottom Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1C1C1E] border-t border-[#3A3A3C] p-4 pb-8">
        <p className="text-[#0A84FF] text-sm font-medium mb-2 text-center" aria-live="polite">
          Reporting for: {formatReportDateLabel(getReportDate())}
        </p>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#0A84FF] text-white py-4 rounded-xl font-semibold text-base active:opacity-80 transition-opacity disabled:opacity-50 touch-manipulation shadow-lg flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Spinner size="md" className="border-white border-t-transparent" />
              <span>Submitting...</span>
            </>
          ) : (
            'Submit Note'
          )}
        </button>
      </div>
    </div>
  );
}