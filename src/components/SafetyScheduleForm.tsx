"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Check,
  Trash2,
} from "lucide-react";
import { getTemplateById } from "@/lib/safetyTemplates";
import {
  addScheduledSafetyTalk,
  updateScheduledSafetyTalk,
  deleteScheduledSafetyTalk,
  getTalkById,
} from "@/lib/safetyStorage";
import { getDateKey } from "@/lib/dailyReportStorage";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDateKey(key: string): { year: number; month: number; day: number } {
  const [y, m, d] = key.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

function buildCalendar(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7).concat(Array(7).fill(null)).slice(0, 7));
  }
  return weeks;
}

export function SafetyScheduleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Edit mode: ?id=<talk-id>  |  Create mode: ?template=<templateId>
  const editId = searchParams.get("id") || "";
  const existingTalk = editId ? getTalkById(editId) : undefined;
  const isEditMode = !!existingTalk;

  const templateId =
    existingTalk?.templateId || searchParams.get("template") || "";
  const template = getTemplateById(templateId);

  const todayKey = getDateKey(new Date());
  const todayParsed = parseDateKey(todayKey);

  const initialDateKey = existingTalk?.date || todayKey;
  const initialParsed = parseDateKey(initialDateKey);

  const [selectedKey, setSelectedKey] = useState<string>(initialDateKey);
  const [viewYear, setViewYear] = useState(initialParsed.year);
  const [viewMonth, setViewMonth] = useState(initialParsed.month);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!template) {
    return (
      <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white font-semibold mb-2">Template not found</p>
          <button onClick={() => router.back()} className="text-[#0A84FF] font-medium">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!selectedKey) return;
    setSaving(true);
    if (isEditMode) {
      updateScheduledSafetyTalk(editId, selectedKey, template.id, template.name);
    } else {
      addScheduledSafetyTalk(selectedKey, template.id, template.name);
    }
    setSaving(false);
    router.push("/safety");
  };

  const handleDelete = () => {
    deleteScheduledSafetyTalk(editId);
    router.push("/safety");
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const weeks = buildCalendar(viewYear, viewMonth);
  const isToday = (day: number) =>
    day === todayParsed.day && viewMonth === todayParsed.month && viewYear === todayParsed.year;

  const isSelected = (day: number) =>
    toDateKey(viewYear, viewMonth, day) === selectedKey;

  const selectedParsed = parseDateKey(selectedKey);
  const selectedDisplay = new Date(
    selectedParsed.year,
    selectedParsed.month,
    selectedParsed.day
  ).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-20">
      <div className="h-12" />

      {/* Nav */}
      <header className="px-4 py-4 border-b border-[#2C2C2E] flex items-center justify-between sticky top-0 bg-[#1C1C1E] z-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-[#0A84FF] text-[15px] font-medium touch-manipulation"
          aria-label="Cancel"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Cancel</span>
        </button>
        <h1 className="text-white text-base font-semibold">
          {isEditMode ? "Edit Talk" : "Schedule Talk"}
        </h1>
        <button
          onClick={() => handleSubmit()}
          disabled={!selectedKey || saving}
          className="text-[#0A84FF] text-[15px] font-bold disabled:opacity-40 transition-opacity"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </header>

      <div className="px-4 pt-5 space-y-4">

        {/* Selected Talk */}
        <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <p className="text-[#8E8E93] text-xs uppercase tracking-wider font-semibold">
              Selected Talk
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/safety/template?mode=schedule")}
            className="w-full flex items-center gap-3 px-4 py-3 active:bg-[#3A3A3C] transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FF6633]/15 border border-[#FF6633]/25 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-[#FF6633]" />
            </div>
            <span className="flex-1 text-left text-white font-medium text-[15px] truncate">
              {template.name}
            </span>
            <ChevronRight className="w-4 h-4 text-[#48484A] flex-shrink-0" />
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#3A3A3C]">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-xl active:bg-[#3A3A3C] transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-[#0A84FF]" />
            </button>
            <span className="text-white font-semibold text-base">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-xl active:bg-[#3A3A3C] transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 text-[#0A84FF]" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[#636366] text-xs font-semibold py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="px-3 pb-4 space-y-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-y-1">
                {week.map((day, di) => {
                  if (!day) return <div key={di} />;
                  const today_ = isToday(day);
                  const selected = isSelected(day);
                  return (
                    <button
                      key={di}
                      onClick={() => setSelectedKey(toDateKey(viewYear, viewMonth, day))}
                      className={`
                        mx-auto w-9 h-9 rounded-full flex items-center justify-center
                        text-sm font-medium transition-all duration-150 touch-manipulation
                        ${selected
                          ? "bg-[#0A84FF] text-white shadow-lg shadow-[#0A84FF]/30"
                          : today_
                            ? "text-[#0A84FF] bg-[#0A84FF]/10 font-bold"
                            : "text-white active:bg-[#3A3A3C]"}
                      `}
                      aria-label={`${MONTHS[viewMonth]} ${day}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation chip */}
        <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl flex items-center gap-3 px-4 py-3.5">
          <div className="w-8 h-8 rounded-full bg-[#30D158]/15 border border-[#30D158]/25 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-[#30D158]" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <p className="text-[#8E8E93] text-xs uppercase tracking-wider font-semibold mb-0.5">
              {isEditMode ? "Rescheduled for" : "Scheduled for"}
            </p>
            <p className="text-white font-medium text-[15px]">{selectedDisplay}</p>
          </div>
        </div>

        {/* Delete (edit mode only) */}
        {isEditMode && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-[#FF453A]/30 bg-[#FF453A]/10 text-[#FF453A] font-semibold text-[15px] active:bg-[#FF453A]/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Scheduled Talk
          </button>
        )}
      </div>

      {/* Delete confirm sheet */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#2C2C2E] rounded-t-[28px] px-4 pb-10 pt-3">
            <div className="w-10 h-1 bg-[#48484A] rounded-full mx-auto mb-5" />
            <div className="w-14 h-14 rounded-full bg-[#FF453A]/15 border border-[#FF453A]/25 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-[#FF453A]" />
            </div>
            <h2 className="text-white text-lg font-bold text-center mb-1">Delete Talk?</h2>
            <p className="text-[#8E8E93] text-sm text-center mb-6 px-4">
              This will permanently remove <span className="text-white font-medium">"{template.name}"</span> from your schedule.
            </p>
            <button
              onClick={handleDelete}
              className="w-full py-4 rounded-2xl bg-[#FF453A] text-white font-bold text-[15px] mb-2 active:opacity-80 transition-opacity"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full py-4 rounded-2xl bg-[#3A3A3C] text-white font-semibold text-[15px] active:bg-[#48484A] transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
