"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, PenLine, CheckCircle2 } from "lucide-react";
import { ReportPreview } from "@/components/ReportPreview";
import { getReportForDate, getDateKey } from "@/lib/dailyReportStorage";

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

  const isSigned = !!data?.signed;

  const handleSign = useCallback(() => {
    if (!data) return;
    const dateKey = data.dateKey;
    router.push(`/report/sign?date=${dateKey}`);
  }, [data, router]);

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-24">
      <header className="bg-[#2C2C2E] border-b border-[#3A3A3C] px-4 py-4 sticky top-0 z-10 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center active:bg-[#3A3A3C] rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-[#FF6633]" />
        </button>
        <h1 className="text-white text-xl font-bold flex-1">Report Preview</h1>

        {/* Sign / Signed indicator */}
        {isSigned ? (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#30D158]/15">
            <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
            <span className="text-[#30D158] text-sm font-semibold">Signed</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSign}
            className="flex items-center gap-1.5 rounded-lg bg-[#FF6633] px-3 py-2 text-white text-sm font-semibold active:opacity-80 transition-opacity"
            aria-label="Sign report"
          >
            <PenLine className="w-4 h-4" />
            Sign
          </button>
        )}
      </header>

      <div className="p-4 print:p-0">
        {data ? (
          <ReportPreview
            data={data}
            preparedBy={DEFAULT_PREPARED_BY}
            showSignatureBlock={isSigned}
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
