"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Calendar } from "lucide-react";
import { getTemplateById } from "@/lib/safetyTemplates";
import { addScheduledSafetyTalk } from "@/lib/safetyStorage";
import { getDateKey } from "@/lib/dailyReportStorage";

export function SafetyScheduleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "";
  const template = getTemplateById(templateId);
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return getDateKey(today);
  });
  const [saving, setSaving] = useState(false);

  if (!template) {
    return (
      <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white font-semibold mb-2">Template not found</p>
          <button
            onClick={() => router.back()}
            className="text-[#0A84FF] font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setSaving(true);
    addScheduledSafetyTalk(date, template.id, template.name);
    setSaving(false);
    router.push("/safety");
  };

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-20">
      <div className="h-12" />
      <header className="px-4 py-4 border-b border-[#3A3A3C] flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-[#0A84FF] text-base touch-manipulation"
          aria-label="Cancel"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Cancel</span>
        </button>
        <h1 className="text-white text-base font-semibold">
          Schedule safety talk
        </h1>
        <button
          onClick={handleSubmit}
          disabled={!date || saving}
          className="text-[#0A84FF] text-base font-semibold disabled:opacity-50"
        >
          Save
        </button>
      </header>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[#98989D] text-xs uppercase tracking-wide font-semibold mb-1">
                Scheduled date
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-white text-base outline-none"
              />
            </div>
            <Calendar className="w-5 h-5 text-[#98989D]" />
          </div>

          <div className="h-px bg-[#3A3A3C]" />

          <div>
            <span className="text-[#98989D] text-xs uppercase tracking-wide font-semibold mb-1 block">
              Selected talk
            </span>
            <button
              type="button"
              onClick={() => router.push("/safety/template?mode=schedule")}
              className="w-full text-left text-white font-medium py-2 flex items-center justify-between"
            >
              <span className="truncate">{template.name}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

