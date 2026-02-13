"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Camera, X, Upload, AlertCircle, Check, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Chemical {
  name: string;
  quantity: string;
  unit: string;
}

export function MaterialLog() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  
  const currentProject = {
    name: 'North Valley Solar Farm',
  };

  // Pre-populated chemical list with quantities
  const [chemicals, setChemicals] = useState<Chemical[]>([
    { name: 'Glyphosate', quantity: '', unit: 'GAL' },
    { name: 'Surfactant', quantity: '', unit: 'oz' },
    { name: 'Super Dye', quantity: '', unit: 'GAL' },
    { name: '2,4-D', quantity: '', unit: 'GAL' },
    { name: 'Ecomazapyr 2SL', quantity: '', unit: 'GAL' },
    { name: 'Regular Dye', quantity: '', unit: 'oz' },
  ]);
  
  const [notes, setNotes] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Check for unusual quantities
  useEffect(() => {
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
    const updated = [...chemicals];
    updated[index] = { ...updated[index], quantity };
    setChemicals(updated);
  };

  const updateChemicalName = (index: number, name: string) => {
    const updated = [...chemicals];
    updated[index] = { ...updated[index], name };
    setChemicals(updated);
  };

  const updateChemicalUnit = (index: number, unit: string) => {
    const updated = [...chemicals];
    updated[index] = { ...updated[index], unit };
    setChemicals(updated);
  };

  const addCustomChemical = () => {
    setChemicals([...chemicals, { name: '', quantity: '', unit: 'GAL' }]);
  };

  const removeChemical = (index: number) => {
    if (chemicals.length > 1) {
      setChemicals(chemicals.filter((_, i) => i !== index));
    }
  };

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
    
    // Only include chemicals with quantities
    const usedChemicals = chemicals.filter(c => c.quantity && parseFloat(c.quantity) > 0);
    
    const submission = {
      id: Date.now().toString(),
      project: currentProject,
      timestamp: new Date().toISOString(),
      chemicals: usedChemicals,
      notes,
      photos,
      syncStatus: 'synced',
    };
    
    console.log('Chemical Usage Submission:', submission);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#5856D6]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#5856D6]" aria-hidden="true" />
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
      <div className="h-12" />

      {/* Header */}
      <header className="px-4 py-4 mb-6 border-b border-[#3A3A3C] sticky top-0 bg-[#1C1C1E] z-10">
        <div className="flex items-center">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-[#0A84FF] text-base touch-manipulation"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h2 className="flex-1 text-center text-white text-base font-semibold pr-16">
            Chemicals
          </h2>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 pb-32 space-y-6">
        {/* Warning Banner */}
        {showWarning && (
          <div className="bg-[#FF9F0A]/20 border border-[#FF9F0A] rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#FF9F0A] flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[#FF9F0A] font-semibold mb-1">Warning</div>
              <div className="text-[#FF9F0A] text-sm">{warningMessage}</div>
            </div>
          </div>
        )}

        {/* Project */}
        <div>
          <label className="block text-[#98989D] text-sm font-medium mb-2">
            Project
          </label>
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] px-4 py-3 rounded-xl">
            <div className="text-white font-medium">{currentProject.name}</div>
          </div>
        </div>

        {/* Chemicals List */}
        <div className="space-y-3">
          <label className="block text-white text-sm font-medium mb-2">
            Chemicals Left
          </label>

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
                      className="w-full bg-[#1C1C1E] text-white placeholder-[#98989D] px-3 py-2.5 rounded-lg outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#5856D6]"
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
                      className="flex-1 bg-[#1C1C1E] text-white placeholder-[#98989D] px-3 py-2.5 rounded-lg outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#5856D6]"
                    />
                    {index >= 6 ? (
                      <select
                        value={chemical.unit}
                        onChange={(e) => updateChemicalUnit(index, e.target.value)}
                        className="bg-[#1C1C1E] text-white px-4 py-2.5 rounded-lg border border-[#3A3A3C] font-medium focus:ring-2 focus:ring-[#5856D6]"
                      >
                        <option value="GAL">GAL</option>
                        <option value="oz">oz</option>
                        <option value="lbs">lbs</option>
                      </select>
                    ) : (
                      <div className="bg-[#1C1C1E] text-[#98989D] px-4 py-2.5 rounded-lg border border-[#3A3A3C] font-medium min-w-[60px] text-center">
                        {chemical.unit}
                      </div>
                    )}
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

          {/* Add Custom Chemical Button */}
          <button
            type="button"
            onClick={addCustomChemical}
            className="w-full bg-[#2C2C2E] border-2 border-dashed border-[#5856D6] text-[#5856D6] py-3 rounded-xl flex items-center justify-center gap-2 active:bg-[#3A3A3C] transition-colors touch-manipulation"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">Add Custom Chemical</span>
          </button>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-white text-sm font-medium mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add any additional notes..."
            className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#5856D6] resize-none"
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
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#5856D6] text-white py-4 rounded-xl font-semibold text-base active:opacity-80 transition-opacity disabled:opacity-50 touch-manipulation shadow-lg"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Chemicals'}
        </button>
      </div>
    </div>
  );
}