"use client";

import { useState, useRef } from 'react';
import { ChevronLeft, Camera, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Spinner } from './ui/spinner';

export function DailyChecklist() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backNavigating, setBackNavigating] = useState(false);
  const [signature, setSignature] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    machineNumber: '',
    lastFourVIN: '',
    operatorName: '', // Make editable - not auto-filled
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    siteName: '',
    asvHours: '',
    motorOil: 'FULL',
    motorOilAmount: '',
    coolant: 'FULL',
    coolantAmount: '',
    hydraulicOil: 'FULL',
    hydraulicOilAmount: '',
    hoses: 'GOOD',
    fanBelt: 'TIGHT',
    attachmentNumber: '',
    attachmentCondition: 'GOOD',
    repairsNeeded: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const startSigning = () => {
    setIsSigning(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignature('');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setSignature(dataUrl);
      setIsSigning(false);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    console.log('Checklist submitted:', formData);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#1C1C1E]">
      {/* Status Bar Spacer */}
      <div className="h-12" />

      {/* Header */}
      <header className="px-4 py-4 mb-6 border-b border-[#3A3A3C] sticky top-0 bg-[#1C1C1E] z-10">
        <div className="flex items-center">
          <button 
            onClick={() => { setBackNavigating(true); router.back(); }}
            disabled={backNavigating}
            className="flex items-center gap-2 text-[#0A84FF] text-base touch-manipulation disabled:opacity-70"
            aria-label="Go back"
          >
            {backNavigating ? <Spinner size="sm" className="border-[#0A84FF] border-t-transparent" /> : <ChevronLeft className="w-5 h-5" />}
            <span>Back</span>
          </button>
          <h2 className="flex-1 text-center text-white text-base font-semibold pr-16">
            Equipment Checklist
          </h2>
        </div>
      </header>

      {/* Form */}
      <div className="px-4 pb-32 space-y-6">
        {/* Machine and Operator Details */}
        <div className="space-y-4">
          <div>
            <label htmlFor="machineNumber" className="block text-white text-sm font-medium mb-2">
              Machine # <span className="text-[#FF453A]">*</span>
            </label>
            <input
              id="machineNumber"
              type="text"
              value={formData.machineNumber}
              onChange={(e) => handleInputChange('machineNumber', e.target.value)}
              placeholder="Enter machine number"
              className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
            />
          </div>

          <div>
            <label htmlFor="lastFourVIN" className="block text-white text-sm font-medium mb-2">
              Last 4 VIN <span className="text-[#FF453A]">*</span>
            </label>
            <input
              id="lastFourVIN"
              type="text"
              maxLength={4}
              value={formData.lastFourVIN}
              onChange={(e) => handleInputChange('lastFourVIN', e.target.value)}
              placeholder="0000"
              className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Operator Name
            </label>
            <input
              type="text"
              value={formData.operatorName}
              onChange={(e) => handleInputChange('operatorName', e.target.value)}
              placeholder="Enter operator name"
              className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Date</label>
              <div className="w-full bg-[#2C2C2E] text-[#98989D] px-4 py-3 rounded-xl border border-[#3A3A3C]">
                {formData.date}
              </div>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Time</label>
              <div className="w-full bg-[#2C2C2E] text-[#98989D] px-4 py-3 rounded-xl border border-[#3A3A3C]">
                {formData.time}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="siteName" className="block text-white text-sm font-medium mb-2">
              Site Name <span className="text-[#FF453A]">*</span>
            </label>
            <select
              id="siteName"
              value={formData.siteName}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
              className="w-full bg-[#2C2C2E] text-white px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
            >
              <option value="">Select site</option>
              <option value="North Valley Solar Farm">North Valley Solar Farm</option>
              <option value="East Ridge Pipeline">East Ridge Pipeline</option>
              <option value="Mountain View Substation">Mountain View Substation</option>
            </select>
          </div>

          <div>
            <label htmlFor="asvHours" className="block text-white text-sm font-medium mb-2">
              ASV Hours <span className="text-[#FF453A]">*</span>
            </label>
            <input
              id="asvHours"
              type="number"
              step="0.1"
              value={formData.asvHours}
              onChange={(e) => handleInputChange('asvHours', e.target.value)}
              placeholder="0.0"
              className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
            />
          </div>
        </div>

        {/* Fluid Levels */}
        <div className="space-y-4">
          <div>
            <h3 className="text-white text-lg font-semibold">Fluid Levels</h3>
            <p className="text-[#98989D] text-sm mt-1">Select an option below</p>
          </div>
          
          {/* Motor Oil */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Motor Oil</label>
            <div className="flex gap-3 mb-2">
              <button
                onClick={() => handleInputChange('motorOil', 'FULL')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  formData.motorOil === 'FULL'
                    ? 'bg-[#2C2C2E] border-2 border-[#FF6633] text-[#FF6633]'
                    : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                }`}
              >
                FULL
              </button>
              <button
                onClick={() => handleInputChange('motorOil', 'LOW')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  formData.motorOil === 'LOW'
                    ? 'bg-[#2C2C2E] border-2 border-[#FF6633] text-[#FF6633]'
                    : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                }`}
              >
                LOW
              </button>
            </div>
            {formData.motorOil === 'LOW' && (
              <input
                type="text"
                placeholder="Amount added (e.g., 2 quarts)"
                value={formData.motorOilAmount}
                onChange={(e) => handleInputChange('motorOilAmount', e.target.value)}
                className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
              />
            )}
          </div>

          {/* Coolant */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Coolant</label>
            <div className="flex gap-3 mb-2">
              <button
                onClick={() => handleInputChange('coolant', 'FULL')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  formData.coolant === 'FULL'
                    ? 'bg-[#2C2C2E] border-2 border-[#FF6633] text-[#FF6633]'
                    : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                }`}
              >
                FULL
              </button>
              <button
                onClick={() => handleInputChange('coolant', 'LOW')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  formData.coolant === 'LOW'
                    ? 'bg-[#2C2C2E] border-2 border-[#FF6633] text-[#FF6633]'
                    : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                }`}
              >
                LOW
              </button>
            </div>
            {formData.coolant === 'LOW' && (
              <input
                type="text"
                placeholder="Amount added"
                value={formData.coolantAmount}
                onChange={(e) => handleInputChange('coolantAmount', e.target.value)}
                className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
              />
            )}
          </div>

          {/* Hydraulic Oil */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Hydraulic Oil</label>
            <div className="flex gap-3 mb-2">
              <button
                onClick={() => handleInputChange('hydraulicOil', 'FULL')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  formData.hydraulicOil === 'FULL'
                    ? 'bg-[#2C2C2E] border-2 border-[#FF6633] text-[#FF6633]'
                    : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                }`}
              >
                FULL
              </button>
              <button
                onClick={() => handleInputChange('hydraulicOil', 'LOW')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  formData.hydraulicOil === 'LOW'
                    ? 'bg-[#2C2C2E] border-2 border-[#FF6633] text-[#FF6633]'
                    : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                }`}
              >
                LOW
              </button>
            </div>
            {formData.hydraulicOil === 'LOW' && (
              <input
                type="text"
                placeholder="Amount added"
                value={formData.hydraulicOilAmount}
                onChange={(e) => handleInputChange('hydraulicOilAmount', e.target.value)}
                className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
              />
            )}
          </div>
        </div>

        {/* Equipment Condition */}
        <div className="space-y-4">
          <div>
            <h3 className="text-white text-lg font-semibold">Equipment Condition</h3>
            <p className="text-[#98989D] text-sm mt-1">Select an option below</p>
          </div>
          
          {/* Hoses */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Hoses</label>
            <div className="flex gap-3">
              <button
                onClick={() => handleInputChange('hoses', 'GOOD')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  formData.hoses === 'GOOD'
                    ? 'bg-[#2C2C2E] border-2 border-[#FF6633] text-[#FF6633]'
                    : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                }`}
              >
                GOOD
              </button>
              <button
                onClick={() => handleInputChange('hoses', 'BAD')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  formData.hoses === 'BAD'
                    ? 'bg-[#2C2C2E] border-2 border-[#FF6633] text-[#FF6633]'
                    : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                }`}
              >
                BAD
              </button>
            </div>
          </div>

          {/* Fan Belt */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Fan Belt</label>
            <div className="flex gap-3">
              <button
                onClick={() => handleInputChange('fanBelt', 'TIGHT')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  formData.fanBelt === 'TIGHT'
                    ? 'bg-[#2C2C2E] border-2 border-[#FF6633] text-[#FF6633]'
                    : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                }`}
              >
                TIGHT
              </button>
              <button
                onClick={() => handleInputChange('fanBelt', 'LOOSE')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  formData.fanBelt === 'LOOSE'
                    ? 'bg-[#2C2C2E] border-2 border-[#FF6633] text-[#FF6633]'
                    : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                }`}
              >
                LOOSE
              </button>
            </div>
          </div>

          {/* Attachment */}
          <div>
            <label htmlFor="attachmentNumber" className="block text-white text-sm font-medium mb-2">
              Attachment # (Optional)
            </label>
            <input
              id="attachmentNumber"
              type="text"
              value={formData.attachmentNumber}
              onChange={(e) => handleInputChange('attachmentNumber', e.target.value)}
              placeholder="Enter attachment number"
              className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633]"
            />
          </div>

          {formData.attachmentNumber && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">Attachment Condition</label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleInputChange('attachmentCondition', 'GOOD')}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    formData.attachmentCondition === 'GOOD'
                      ? 'bg-[#2C2C2E] border-2 border-[#FF6633] text-[#FF6633]'
                      : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                  }`}
                >
                  GOOD
                </button>
                <button
                  onClick={() => handleInputChange('attachmentCondition', 'BAD')}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    formData.attachmentCondition === 'BAD'
                      ? 'bg-[#2C2C2E] border-2 border-[#FF6633] text-[#FF6633]'
                      : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                  }`}
                >
                  BAD
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Repairs & Issues */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold">Repairs & Issues</h3>
          
          <div>
            <label htmlFor="repairsNeeded" className="block text-white text-sm font-medium mb-2">
              Repairs Needed
            </label>
            <textarea
              id="repairsNeeded"
              value={formData.repairsNeeded}
              onChange={(e) => handleInputChange('repairsNeeded', e.target.value)}
              rows={4}
              placeholder="Describe any repairs needed..."
              className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF6633] resize-none"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-white text-sm font-medium mb-3">
              Photos {formData.hoses === 'BAD' || formData.fanBelt === 'LOOSE' || formData.attachmentCondition === 'BAD' ? 
                <span className="text-[#FF453A]">*</span> : null}
            </label>
            
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Issue ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-xl border border-[#3A3A3C]"
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] text-white py-3 rounded-xl flex items-center justify-center gap-2 active:bg-[#3A3A3C] transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span className="font-medium">Take Photo</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoCapture}
              className="hidden"
            />
          </div>
        </div>

        {/* Digital Signature */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold">Operator Signature <span className="text-[#FF453A]">*</span></h3>
          
          {!signature ? (
            <div className="space-y-3">
              <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-4">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={150}
                  className="w-full h-32 bg-white rounded-lg touch-none"
                  onPointerDown={(e) => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    const rect = canvas.getBoundingClientRect();
                    ctx.beginPath();
                    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                  }}
                  onPointerMove={(e) => {
                    const canvas = canvasRef.current;
                    if (!canvas || e.buttons !== 1) return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    const rect = canvas.getBoundingClientRect();
                    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                    ctx.stroke();
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="flex-1 bg-[#2C2C2E] border border-[#3A3A3C] text-white py-3 rounded-xl font-semibold"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={saveSignature}
                  className="flex-1 bg-[#FF6633] text-white py-3 rounded-xl font-semibold"
                >
                  Save Signature
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-4">
                <img src={signature} alt="Signature" className="w-full h-32 object-contain bg-white rounded-lg" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSignature('');
                  clearSignature();
                }}
                className="w-full bg-[#2C2C2E] border border-[#3A3A3C] text-[#FF453A] py-3 rounded-xl font-semibold"
              >
                Reset Signature
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1C1C1E] border-t border-[#3A3A3C] p-4 pb-8">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#FF6633] text-white py-4 rounded-xl font-semibold text-base active:opacity-80 transition-opacity shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Spinner size="md" className="border-white border-t-transparent" />
              <span>Saving...</span>
            </>
          ) : (
            'Submit Checklist'
          )}
        </button>
      </div>
    </div>
  );
}