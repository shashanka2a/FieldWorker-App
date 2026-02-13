"use client";

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BottomNav } from './BottomNav';
import { Spinner } from './ui/spinner';
import { getSignedReportDateKeys, getSignedReport } from '@/lib/dailyReportStorage';

function formatReportListDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatSignedAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
}

export function Reports() {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const [signedReports, setSignedReports] = useState<{ dateKey: string; projectName: string; signedAt: string }[]>([]);

  const loadReports = useCallback(() => {
    const keys = getSignedReportDateKeys();
    const list = keys
      .map((dateKey) => {
        const signed = getSignedReport(dateKey);
        if (!signed) return null;
        return {
          dateKey,
          projectName: signed.projectName,
          signedAt: signed.signedAt,
        };
      })
      .filter((r): r is { dateKey: string; projectName: string; signedAt: string } => r !== null);
    setSignedReports(list);
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    const onFocus = () => loadReports();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadReports]);

  const handleBack = () => {
    setNavigating(true);
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-20">
      <div className="h-12" />
      <header className="px-4 py-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            disabled={navigating}
            className="flex items-center gap-2 text-[#0A84FF] text-base touch-manipulation disabled:opacity-70"
            aria-label="Go back"
          >
            {navigating ? <Spinner size="sm" className="border-[#0A84FF] border-t-transparent" /> : <ChevronLeft className="w-5 h-5" />}
            <span>Back</span>
          </button>
          <h2 className="absolute left-1/2 -translate-x-1/2 text-white text-base font-semibold">
            Reports
          </h2>
          <div className="w-16" />
        </div>
      </header>

      <div className="px-4">
        {signedReports.length === 0 ? (
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-6 text-center">
            <div className="text-white text-lg font-semibold mb-2">No submitted reports yet</div>
            <div className="text-[#98989D] text-sm">
              Sign and submit a report from Home to see it here
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {signedReports.map((report) => (
              <button
                key={report.dateKey}
                onClick={() => {
                  setNavigating(true);
                  router.push(`/report/preview?date=${report.dateKey}`);
                }}
                className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4 flex items-center gap-4 text-left active:bg-[#3A3A3C] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FF6633]/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-[#FF6633]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate">{report.projectName}</div>
                  <div className="text-[#98989D] text-sm mt-0.5">{formatReportListDate(report.dateKey)}</div>
                  <div className="text-[#98989D] text-xs mt-0.5">Signed {formatSignedAt(report.signedAt)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav activeTab="more" />
    </div>
  );
}
