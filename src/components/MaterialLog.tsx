"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Camera, X, Upload, AlertCircle, Check, Plus, Droplets, SprayCan } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Spinner } from './ui/spinner';
import { getReportDate, getDateKey, saveChemicals, formatReportDateLabel } from '@/lib/dailyReportStorage';

type ApplicationType = 'wicking' | 'spraying';

interface Chemical {
  name: string;
  quantity: string;
  unit: string;
}

export function MaterialLog() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [backNavigating, setBackNavigating] = useState(false);
  const [applicationType, setApplicationType] = useState<ApplicationType>('wicking');

  const currentProject = {
    name: 'North Valley Solar Farm',
  };

  const defaultChemicals: Chemical[] = [
    { name: 'Glyphosate', quantity: '', unit: 'GAL' },
    { name: 'Surfactant', quantity: '', unit: 'oz' },
    { name: 'Super Dye', quantity: '', unit: 'GAL' },
    { name: '2,4-D', quantity: '', unit: 'GAL' },
    { name: 'Ecomazapyr 2SL', quantity: '', unit: 'GAL' },
    { name: 'Regular Dye', quantity: '', unit: 'oz' },
  ];

  // Separate state per application type
  const [wickingData, setWickingData] = useState<{ chemicals: Chemical[]; notes: string; photos: string[] }>({
    chemicals: defaultChemicals.map(c => ({ ...c })),
    notes: '',
    photos: [],
  });
  const [sprayingData, setSprayingData] = useState<{ chemicals: Chemical[]; notes: string; photos: string[] }>({
    chemicals: defaultChemicals.map(c => ({ ...c })),
    notes: '',
    photos: [],
  });

  // Derive current data from active tab
  const currentData = applicationType === 'wicking' ? wickingData : sprayingData;
  const setCurrentData = applicationType === 'wicking' ? setWickingData : setSprayingData;
  const chemicals = currentData.chemicals;
  const notes = currentData.notes;
  const photos = currentData.photos;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Check for unusual quantities
  useEffect(() => {
    setShowWarning(false);
    chemicals.forEach((chemical) => {
      const qty = parseFloat(chemical.quantity);
      if (chemical.name === 'Glyphosate' && qty > 100) {
        setShowWarning(true);
        setWarningMessage('Glyphosate quantity seems unusually high (>100 GAL)');
      } else if (chemical.name === 'Surfactant' && qty > 128) {
        setShowWarning(true);
        setWarningMessage('Surfactant quantity seems unusually high (>128 oz)');
      }
    });
  }, [chemicals]);

  const updateChemicalQuantity = (index: number, quantity: string) => {
    setCurrentData(prev => {
      const updated = [...prev.chemicals];
      updated[index] = { ...updated[index], quantity };
      return { ...prev, chemicals: updated };
    });
  };

  const updateChemicalName = (index: number, name: string) => {
    setCurrentData(prev => {
      const updated = [...prev.chemicals];
      updated[index] = { ...updated[index], name };
      return { ...prev, chemicals: updated };
    });
  };

  const updateChemicalUnit = (index: number, unit: string) => {
    setCurrentData(prev => {
      const updated = [...prev.chemicals];
      updated[index] = { ...updated[index], unit };
      return { ...prev, chemicals: updated };
    });
  };

  const addCustomChemical = () => {
    setCurrentData(prev => ({
      ...prev,
      chemicals: [...prev.chemicals, { name: '', quantity: '', unit: 'GAL' }],
    }));
  };

  const removeChemical = (index: number) => {
    if (chemicals.length > 1) {
      setCurrentData(prev => ({
        ...prev,
        chemicals: prev.chemicals.filter((_, i) => i !== index),
      }));
    }
  };

  const setNotes = (value: string) => {
    setCurrentData(prev => ({ ...prev, notes: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentData(prev => ({
          ...prev,
          photos: [...prev.photos, event.target?.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setCurrentData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    const usedChemicals = chemicals.filter(c => c.quantity && parseFloat(c.quantity) > 0);
    const date = getReportDate();
    const dateKey = getDateKey(date);
    const submission = {
      id: Date.now().toString(),
      project: currentProject,
      timestamp: new Date().toISOString(),
      applicationType,
      chemicals: usedChemicals,
      notes,
      photos,
    };
    saveChemicals(dateKey, submission);

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
          <div className="w-20 h-20 bg-[#FF6633]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#FF6633]" aria-hidden="true" />
          </div>
          <h2 className="text-white text-2xl font-semibold mb-2">Submitted!</h2>
          <p className="text-[#98989D]">Your chemical usage has been saved</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C1C1E]">
      {/* Status Bar Spacer */}
      {/* Header */}
      <header className="bg-[#2C2C2E] border-b border-[#3A3A3C] px-4 py-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setBackNavigating(true); router.push('/'); }}
            disabled={backNavigating}
            className="w-10 h-10 flex items-center justify-center active:bg-[#3A3A3C] rounded-lg transition-colors disabled:opacity-70"
            aria-label="Go back"
          >
            {backNavigating ? <Spinner size="sm" className="border-[#FF6633] border-t-transparent" /> : <ChevronLeft className="w-6 h-6 text-[#FF6633]" />}
          </button>
          <h1 className="text-white text-xl font-bold flex-1">Chemicals</h1>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 pt-6 pb-32">
        {/* Warning Banner */}
        {showWarning && (
          <div className="bg-[#FF9F0A]/20 border border-[#FF9F0A] rounded-xl p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-[#FF9F0A] flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[#FF9F0A] font-semibold mb-1">Warning</div>
              <div className="text-[#FF9F0A] text-sm">{warningMessage}</div>
            </div>
          </div>
        )}

        {/* Project */}
        <div className="mb-6">
          <label className="block text-[#98989D] text-sm font-medium mb-2">
            Project
          </label>
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] px-4 py-3 rounded-xl">
            <div className="text-white font-medium">{currentProject.name}</div>
          </div>
        </div>

        {/* Application Type Selector — Wicking / Spraying */}
        <div className="mb-6">
          <label className="block text-[#98989D] text-sm font-medium mb-2">
            Application Type
          </label>
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-1.5 flex gap-1.5">
            <button
              type="button"
              onClick={() => setApplicationType('wicking')}
              className={`flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${applicationType === 'wicking'
                ? 'bg-[#FF6633] text-white shadow-lg shadow-[#FF6633]/25'
                : 'text-[#98989D] active:bg-[#3A3A3C]'
                }`}
            >
              <Droplets className="w-4.5 h-4.5" aria-hidden="true" />
              <span>Wicking</span>
            </button>
            <button
              type="button"
              onClick={() => setApplicationType('spraying')}
              className={`flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${applicationType === 'spraying'
                ? 'bg-[#FF6633] text-white shadow-lg shadow-[#FF6633]/25'
                : 'text-[#98989D] active:bg-[#3A3A3C]'
                }`}
            >
              <SprayCan className="w-4.5 h-4.5" aria-hidden="true" />
              <span>Spraying</span>
            </button>
          </div>
        </div>

        {/* Chemicals List */}
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-3">
            Chemicals Left
          </label>
          <div className="space-y-3">
            {chemicals.map((chemical, index) => (
              <div key={index} className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    {index >= 6 ? (
                      <input
                        type="text"
                        value={chemical.name}
                        onChange={(e) => updateChemicalName(index, e.target.value)}
                        placeholder="Chemical name"
                        className="w-full bg-[#1C1C1E] text-white placeholder-[#98989D] px-3 py-2.5 rounded-lg outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
                      />
                    ) : (
                      <div className="text-white font-medium">{chemical.name}</div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={chemical.quantity}
                        onChange={(e) => updateChemicalQuantity(index, e.target.value)}
                        placeholder="0.0"
                        className="flex-1 bg-[#1C1C1E] text-white placeholder-[#98989D] px-3 py-2.5 rounded-lg outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
                      />
                      <div className="relative">
                        <select
                          value={chemical.unit}
                          onChange={(e) => updateChemicalUnit(index, e.target.value)}
                          className="appearance-none bg-[#1C1C1E] text-white pl-3 pr-8 py-2.5 rounded-lg border border-[#3A3A3C] font-medium focus:ring-2 focus:ring-[#FF6633] min-w-[80px] outline-none"
                        >
                          <option value="GAL">GAL</option>
                          <option value="oz">oz</option>
                          <option value="lbs">lbs</option>
                          <option value="L">L</option>
                          <option value="mL">mL</option>
                        </select>
                        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98989D] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                  {index >= 6 && (
                    <button
                      type="button"
                      onClick={() => removeChemical(index)}
                      className="w-7 h-7 bg-[#FF453A] rounded-full flex items-center justify-center touch-manipulation shadow-lg flex-shrink-0"
                      aria-label="Remove custom chemical"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Chemical Button */}
          <button
            type="button"
            onClick={addCustomChemical}
            className="w-full bg-[#2C2C2E] border-2 border-dashed border-[#FF6633] text-[#FF6633] py-3 rounded-xl flex items-center justify-center gap-2 active:bg-[#3A3A3C] transition-colors touch-manipulation mt-3"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">Add Custom Chemical</span>
          </button>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label htmlFor="notes" className="block text-white text-sm font-medium mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add any additional notes..."
            className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633] resize-none"
          />
        </div>

        {/* Photos Section */}
        <div className="mb-6">
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
          className="w-full bg-[#FF6633] text-white py-4 rounded-xl font-semibold text-base active:opacity-80 transition-opacity disabled:opacity-50 touch-manipulation shadow-lg flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Spinner size="md" className="border-white border-t-transparent" />
              <span>Submitting...</span>
            </>
          ) : (
            'Submit Chemicals'
          )}
        </button>
      </div>
    </div>
  );
}