"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Printer } from "lucide-react";
import { ReportPreview } from "@/components/ReportPreview";
import { getReportForDate } from "@/lib/dailyReportStorage";

const DEFAULT_PREPARED_BY = "Ricky Smith";

function ReportPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const dateParam = searchParams.get("date");
  const reportDate = useMemo(() => {
    if (dateParam) {
      const [y, m, d] = dateParam.split("-").map(Number);
      if (y && m && d) return new Date(y, m - 1, d);
    }
    return null;
  }, [dateParam]);

  const [data, setData] = useState<ReturnType<typeof getReportForDate> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadReport = useCallback(() => {
    const date =
      reportDate ??
      (() => {
        if (typeof window === "undefined") return new Date();
        const saved = localStorage.getItem("selectedDate");
        return saved ? new Date(saved) : new Date();
      })();
    setData(getReportForDate(date));
  }, [reportDate]);

  useEffect(() => {
    if (!mounted) return;
    loadReport();
  }, [mounted, loadReport]);

  useEffect(() => {
    if (!mounted) return;
    const onVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") loadReport();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [mounted, loadReport]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-24">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#3A3A3C] bg-[#1C1C1E] px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#0A84FF] text-base touch-manipulation"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-white text-base font-semibold">Report Preview</h1>
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg bg-[#2C2C2E] px-3 py-2 text-white text-sm"
          aria-label="Print"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      <div className="p-4 print:p-0">
        {data ? (
          <ReportPreview
            data={data}
            preparedBy={DEFAULT_PREPARED_BY}
            showSignatureBlock={!!data.signed}
            signatureDataUrl={data.signed?.signatureDataUrl ?? null}
            signedAt={data.signed?.signedAt ?? null}
          />
        ) : (
          <div className="rounded-xl bg-[#2C2C2E] p-8 text-center text-[#98989D]">
            Loading report…
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center text-[#98989D]">Loading…</div>}>
      <ReportPreviewContent />
    </Suspense>
  );
}
