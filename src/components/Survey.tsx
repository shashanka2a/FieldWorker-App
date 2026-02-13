"use client";

import { useState, useRef } from 'react';
import { ChevronLeft, Camera, X, Upload, Check } from 'lucide-react';
import { Spinner } from './ui/spinner';
import { useRouter } from 'next/navigation';
import { getReportDate, getDateKey, saveSurvey, formatReportDateLabel } from '@/lib/dailyReportStorage';

interface SurveyQuestion {
  id: number;
  question: string;
  answer: 'N/A' | 'No' | 'Yes' | '';
  description: string;
}

export function Survey() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [backNavigating, setBackNavigating] = useState(false);
  
  const currentProject = {
    name: 'North Valley Solar Farm',
  };

  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    { id: 1, question: 'Any equipment malfunctions/accidents today?', answer: '', description: '' },
    { id: 2, question: 'Any accidents affecting personnel today?', answer: '', description: '' },
    { id: 3, question: 'Did weather cause any delays?', answer: '', description: '' },
    { id: 4, question: "Any areas that can't be worked on?", answer: '', description: '' },
    { id: 5, question: 'Any schedule delays occur?', answer: '', description: '' },
    { id: 6, question: 'Any visitors on site? (FPL, Nextera, and/or other Contractors)', answer: '', description: '' },
    { id: 7, question: 'Any equipment rented on site?', answer: '', description: '' },
    { id: 8, question: 'Did you verify all receipts were submitted in DEXT?', answer: '', description: '' },
    { id: 9, question: 'Have all employees clocked in and out on Wicked Workforce?', answer: '', description: '' },
  ]);

  const handleAnswerChange = (id: number, answer: 'N/A' | 'No' | 'Yes') => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, answer } : q
    ));
  };

  const handleDescriptionChange = (id: number, description: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, description } : q
    ));
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
      questions,
    };
    saveSurvey(dateKey, submission);
    
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
          <div className="w-20 h-20 bg-[#FF9F0A]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#FF9F0A]" aria-hidden="true" />
          </div>
          <h2 className="text-white text-2xl font-semibold mb-2">Submitted!</h2>
          <p className="text-[#98989D]">Your survey has been saved</p>
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
            onClick={() => { setBackNavigating(true); router.push('/'); }}
            disabled={backNavigating}
            className="flex items-center gap-2 text-[#0A84FF] text-base touch-manipulation disabled:opacity-70"
            aria-label="Go back"
          >
            {backNavigating ? <Spinner size="sm" className="border-[#0A84FF] border-t-transparent" /> : <ChevronLeft className="w-5 h-5" />}
            <span>Back</span>
          </button>
          <h2 className="flex-1 text-center text-white text-base font-semibold pr-16">
            Site Survey
          </h2>
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

        {/* Survey Questions */}
        {questions.map(q => (
          <div key={q.id} className="space-y-4">
            <h3 className="text-white font-semibold">{q.question}</h3>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleAnswerChange(q.id, 'N/A')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  q.answer === 'N/A'
                    ? 'bg-[#FF9F0A] text-white'
                    : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                }`}
              >
                N/A
              </button>
              <button
                type="button"
                onClick={() => handleAnswerChange(q.id, 'No')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  q.answer === 'No'
                    ? 'bg-[#34C759] text-white'
                    : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => handleAnswerChange(q.id, 'Yes')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  q.answer === 'Yes'
                    ? 'bg-[#FF453A] text-white'
                    : 'bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D]'
                }`}
              >
                Yes
              </button>
            </div>

            {q.answer !== 'N/A' && (
              <div>
                <label htmlFor={`description-${q.id}`} className="block text-white text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id={`description-${q.id}`}
                  value={q.description}
                  onChange={(e) => handleDescriptionChange(q.id, e.target.value)}
                  rows={3}
                  placeholder="Provide details..."
                  className="w-full bg-[#2C2C2E] text-white placeholder-[#98989D] px-4 py-3 rounded-xl outline-none border border-[#3A3A3C] focus:ring-2 focus:ring-[#FF9F0A] resize-none"
                />
              </div>
            )}
          </div>
        ))}
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
          className="w-full bg-[#FF9F0A] text-white py-4 rounded-xl font-semibold text-base active:opacity-80 transition-opacity disabled:opacity-50 touch-manipulation shadow-lg flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Spinner size="md" className="border-white border-t-transparent" />
              <span>Submitting...</span>
            </>
          ) : (
            'Submit Survey'
          )}
        </button>
      </div>
    </div>
  );
}