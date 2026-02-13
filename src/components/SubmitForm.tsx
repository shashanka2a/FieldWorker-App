"use client";

import { useState, useRef } from 'react';
import { ChevronLeft, Camera, X, Check, Upload } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Spinner } from './ui/spinner';
import { getReportDate, getDateKey, saveMaterial, saveEquipment, formatReportDateLabel } from '@/lib/dailyReportStorage';

export function SubmitForm() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as string;
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cancelNavigating, setCancelNavigating] = useState(false);
  
  // Current project (read-only, pre-filled)
  const currentProject = {
    name: 'North Valley Solar Farm',
  };

  // Form fields
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  const [hours, setHours] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [incidentType, setIncidentType] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const getFormTitle = () => {
    switch (type) {
      case 'material':
        return 'Material Log';
      case 'equipment':
        return 'Equipment Hours';
      case 'note':
        return 'General Note';
      case 'incident':
        return 'Safety Incident';
      default:
        return 'Submit';
    }
  };

  const getFormColor = () => {
    switch (type) {
      case 'material':
        return '#0A84FF';
      case 'equipment':
        return '#FF9F0A';
      case 'note':
        return '#34C759';
      case 'incident':
        return '#FF453A';
      default:
        return '#FF6633';
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Material Log validation
    if (type === 'material') {
      if (!value.trim()) newErrors.value = 'Value is required';
      if (!unit) newErrors.unit = 'Unit is required';
    }

    // Equipment Hours validation
    if (type === 'equipment') {
      if (!value.trim()) newErrors.value = 'Hours is required';
      if (!unit) newErrors.unit = 'Unit is required';
    }

    // Safety Incident validation
    if (type === 'incident') {
      if (!notes.trim()) newErrors.notes = 'Description is required for safety incidents';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    const date = getReportDate();
    const dateKey = getDateKey(date);
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();
    const payload = { id, project: currentProject, timestamp, notes, photos };

    if (type === 'material') {
      saveMaterial(dateKey, { ...payload, value, unit });
    } else if (type === 'equipment') {
      saveEquipment(dateKey, { ...payload, value: value || undefined, unit: unit || undefined });
    }
    
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
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${getFormColor()}20` }}
          >
            <Check className="w-10 h-10" style={{ color: getFormColor() }} aria-hidden="true" />
          </div>
          <h2 className="text-white text-2xl font-semibold mb-2">Submitted!</h2>
          <p className="text-[#98989D]">Your {getFormTitle().toLowerCase()} has been saved</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C1C1E]">
      {/* Status Bar Spacer */}
      <div className="h-12" />

      {/* Header */}
      <header className="px-4 py-4 mb-6 border-b border-[#3A3A3C]">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => { setCancelNavigating(true); router.push('/'); }}
            disabled={cancelNavigating}
            className="flex items-center gap-2 text-[#0A84FF] text-base touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#FF6633] rounded-lg px-2 py-1 disabled:opacity-70"
            aria-label="Cancel and go back"
          >
            {cancelNavigating ? <Spinner size="sm" className="border-[#0A84FF] border-t-transparent" /> : <ChevronLeft className="w-5 h-5" />}
            <span>Cancel</span>
          </button>
          <h2 className="absolute left-1/2 -translate-x-1/2 text-white text-base font-semibold">
            {getFormTitle()}
          </h2>
          <div className="w-20" />
        </div>
        <p className="text-[#0A84FF] text-sm font-medium -mt-2 pb-2" aria-live="polite">
          Reporting for: {formatReportDateLabel(getReportDate())}
        </p>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 pb-32 space-y-6">
        {/* Read-Only Project Field */}
        <div>
          <label className="block text-[#98989D] text-sm font-medium mb-2">
            Project
          </label>
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] px-4 py-3 rounded-xl">
            <div className="text-white font-medium">{currentProject.name}</div>
          </div>
        </div>

        {/* Material Log Fields */}
        {type === 'material' && (
          <>
            <div>
              <label htmlFor="value" className="block text-white text-sm font-medium mb-2">
                Value <span className="text-[#FF453A]">*</span>
              </label>
              <input
                id="value"
                type="number"
                step="0.1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.0"
                className={`w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border ${
                  errors.value ? 'border-[#FF453A]' : 'border-[#3A3A3C]'
                } focus:ring-2 focus:ring-[#0A84FF]`}
              />
              {errors.value && <p className="text-[#FF453A] text-sm mt-1">{errors.value}</p>}
            </div>

            <div>
              <label htmlFor="unit" className="block text-white text-sm font-medium mb-2">
                Unit <span className="text-[#FF453A]">*</span>
              </label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={`w-full bg-[#2C2C2E] text-white px-4 py-3 rounded-xl outline-none border ${
                  errors.unit ? 'border-[#FF453A]' : 'border-[#3A3A3C]'
                } focus:ring-2 focus:ring-[#0A84FF]`}
              >
                <option value="">Select unit</option>
                <option value="Acres">Acres</option>
                <option value="Tons">Tons</option>
                <option value="Yards">Cubic Yards</option>
                <option value="Units">Units</option>
              </select>
              {errors.unit && <p className="text-[#FF453A] text-sm mt-1">{errors.unit}</p>}
            </div>
          </>
        )}

        {/* Equipment Hours Fields */}
        {type === 'equipment' && (
          <>
            <div>
              <label htmlFor="value" className="block text-white text-sm font-medium mb-2">
                Hours <span className="text-[#FF453A]">*</span>
              </label>
              <input
                id="value"
                type="number"
                step="0.1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.0"
                className={`w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border ${
                  errors.value ? 'border-[#FF453A]' : 'border-[#3A3A3C]'
                } focus:ring-2 focus:ring-[#FF9F0A]`}
              />
              {errors.value && <p className="text-[#FF453A] text-sm mt-1">{errors.value}</p>}
            </div>

            <div>
              <label htmlFor="unit" className="block text-white text-sm font-medium mb-2">
                Unit <span className="text-[#FF453A]">*</span>
              </label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={`w-full bg-[#2C2C2E] text-white px-4 py-3 rounded-xl outline-none border ${
                  errors.unit ? 'border-[#FF453A]' : 'border-[#3A3A3C]'
                } focus:ring-2 focus:ring-[#FF9F0A]`}
              >
                <option value="">Select unit</option>
                <option value="hrs">Hours</option>
              </select>
              {errors.unit && <p className="text-[#FF453A] text-sm mt-1">{errors.unit}</p>}
            </div>
          </>
        )}

        {/* General Note Fields */}
        {type === 'note' && (
          <div>
            <label htmlFor="notes" className="block text-white text-sm font-medium mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              placeholder="Add your note here..."
              className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#34C759] resize-none"
            />
          </div>
        )}

        {/* Safety Incident Fields */}
        {type === 'incident' && (
          <>
            <div>
              <label htmlFor="notes" className="block text-white text-sm font-medium mb-2">
                Description <span className="text-[#FF453A]">*</span>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={8}
                placeholder="Describe what happened..."
                className={`w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border ${
                  errors.notes ? 'border-[#FF453A]' : 'border-[#3A3A3C]'
                } focus:ring-2 focus:ring-[#FF453A] resize-none`}
              />
              {errors.notes && <p className="text-[#FF453A] text-sm mt-1">{errors.notes}</p>}
            </div>
          </>
        )}

        {/* Notes field for Material and Equipment */}
        {(type === 'material' || type === 'equipment') && (
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
              className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 resize-none"
              style={{ outlineColor: getFormColor() }}
            />
          </div>
        )}

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
              className="flex-1 bg-[#2C2C2E] border border-[#3A3A3C] text-white py-3 rounded-xl flex items-center justify-center gap-2 active:bg-[#3A3A3C] transition-colors touch-manipulation focus:outline-none focus:ring-2"
              style={{ outlineColor: getFormColor() }}
            >
              <Camera className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">Take Photo</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-[#2C2C2E] border border-[#3A3A3C] text-white py-3 rounded-xl flex items-center justify-center gap-2 active:bg-[#3A3A3C] transition-colors touch-manipulation focus:outline-none focus:ring-2"
              style={{ outlineColor: getFormColor() }}
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
          className="w-full text-white py-4 rounded-xl font-semibold text-base active:opacity-80 transition-opacity disabled:opacity-50 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1C1C1E] shadow-lg flex items-center justify-center gap-2"
          style={{ backgroundColor: getFormColor(), outlineColor: getFormColor() }}
        >
          {isSubmitting ? (
            <>
              <Spinner size="md" className="border-white border-t-transparent" />
              <span>Submitting...</span>
            </>
          ) : (
            'Submit'
          )}
        </button>
      </div>
    </div>
  );
}