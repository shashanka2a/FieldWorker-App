"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, PenTool } from "lucide-react";
import { ReportPreview } from "@/components/ReportPreview";
import {
  getReportForDate,
  getDateKey,
  saveSignedReport,
  getSignedReport,
} from "@/lib/dailyReportStorage";
import { Spinner } from "@/components/ui/spinner";

const DEFAULT_PREPARED_BY = "Ricky Smith";

function ReportSignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<ReturnType<typeof getReportForDate> | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dateParam = searchParams.get("date");
  const reportDate = useMemo(() => {
    if (dateParam) {
      const [y, m, d] = dateParam.split("-").map(Number);
      if (y && m && d) return new Date(y, m - 1, d);
    }
    return null;
  }, [dateParam]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const date =
      reportDate ??
      (() => {
        if (typeof window === "undefined") return new Date();
        const saved = localStorage.getItem("selectedDate");
        return saved ? new Date(saved) : new Date();
      })();
    setData(getReportForDate(date));
    const existing = getSignedReport(getDateKey(date));
    if (existing) {
      setSignatureDataUrl(existing.signatureDataUrl);
      setSubmitted(true);
    }
  }, [mounted, reportDate]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
      e.preventDefault();
    },
    [isDrawing]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      setSignatureDataUrl(dataUrl);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, [mounted]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureDataUrl("");
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!data || !signatureDataUrl) return;
    setIsSubmitting(true);
    const dateKey = data.dateKey;
    const signedAt = new Date().toISOString();
    saveSignedReport(dateKey, {
      signedAt,
      preparedBy: DEFAULT_PREPARED_BY,
      signatureDataUrl,
      projectName: data.projectName,
    });
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => router.push("/"), 1500);
  }, [data, signatureDataUrl, router]);

  const alreadySigned = !!data?.signed;

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-32">
      <div className="sticky top-0 z-10 flex items-center border-b border-[#3A3A3C] bg-[#1C1C1E] px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#0A84FF] text-base touch-manipulation"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="flex-1 text-center text-white text-base font-semibold">Sign & Submit Report</h1>
        <div className="w-16" />
      </div>

      <div className="p-4">
        {data && (
          <>
            <div className="mb-4 rounded-xl bg-[#2C2C2E] p-4">
              <ReportPreview
                data={data}
                preparedBy={DEFAULT_PREPARED_BY}
                showSignatureBlock={alreadySigned || !!signatureDataUrl}
                signatureDataUrl={(data.signed?.signatureDataUrl ?? signatureDataUrl) || null}
                signedAt={data.signed?.signedAt ?? null}
              />
            </div>

            {alreadySigned || submitted ? (
              <div className="rounded-xl bg-[#34C759]/20 border border-[#34C759] p-4 text-center">
                <p className="text-[#34C759] font-semibold">Report signed and submitted.</p>
                <p className="text-[#98989D] text-sm mt-1">Redirecting to home…</p>
              </div>
            ) : (
              <div className="rounded-xl bg-[#2C2C2E] border border-[#3A3A3C] p-4">
                <p className="text-white font-medium mb-2">Sign below</p>
                <p className="text-[#98989D] text-sm mb-3">
                  I, {DEFAULT_PREPARED_BY}, have reviewed and completed this report.
                </p>
                <div className="border border-[#3A3A3C] rounded-lg bg-white overflow-hidden touch-none">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-32 block"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{ touchAction: "none" }}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex-1 py-2 rounded-lg border border-[#3A3A3C] text-white text-sm"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!signatureDataUrl || isSubmitting}
                    className="flex-1 py-2 rounded-lg bg-[#FF6633] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="border-white border-t-transparent" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <PenTool className="w-4 h-4" />
                        Sign & Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {!data && mounted && (
          <div className="rounded-xl bg-[#2C2C2E] p-8 text-center text-[#98989D]">Loading…</div>
        )}
      </div>
    </div>
  );
}

export default function ReportSignPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center text-[#98989D]">Loading…</div>}>
      <ReportSignContent />
    </Suspense>
  );
}
