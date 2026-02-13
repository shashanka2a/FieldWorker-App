"use client";

import { useMemo } from "react";
import type { ReportData, EquipmentEntry, EquipmentChecklistEntry } from "@/lib/dailyReportStorage";
import { UtilityVisionLogo } from "./UtilityVisionLogo";

function formatReportDateHeader(d: Date): string {
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${weekday} ${dd}/${mm}/${yyyy}`;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).replace(/\s/g, "");
  return `${dd}/${mm}/${yy} | ${time}`;
}

interface ReportPreviewProps {
  data: ReportData;
  preparedBy?: string;
  showSignatureBlock?: boolean;
  signatureDataUrl?: string | null;
  signedAt?: string | null;
}

function PhotoGrid({ photos }: { photos: string[] }) {
  if (!photos?.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {photos.map((src, i) => (
        <img key={i} src={src} alt="" className="w-16 h-16 object-cover border border-black" />
      ))}
    </div>
  );
}

const SECTION_HEADER = "text-xs font-bold uppercase tracking-wide text-white bg-[#FF6633] px-2 py-1.5 border border-black";

export function ReportPreview({
  data,
  preparedBy = "Field User",
  showSignatureBlock = false,
  signatureDataUrl = null,
  signedAt = null,
}: ReportPreviewProps) {
  const latestSurvey = useMemo(
    () => (data.survey.length > 0 ? data.survey[data.survey.length - 1] : null),
    [data.survey]
  );

  const projectName = data.projectName;
  const preparedByLabel = data.signed?.preparedBy ?? preparedBy;

  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto min-h-screen print:shadow-none text-sm border border-black" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <header className="border-b-4 border-[#FF6633] bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-black leading-tight">{projectName}</h1>
            <p className="text-sm text-black/80 mt-0.5">Date: {formatReportDateHeader(data.date)}</p>
          </div>
          <UtilityVisionLogo size={32} className="shrink-0" />
        </div>
      </header>

      {/* 1. General Notes */}
      <section className="border-b border-black">
        <h2 className={SECTION_HEADER}>1. General Notes</h2>
        <div className="px-3 py-2 bg-white">
          {data.notes.length === 0 ? (
            <p className="text-black/70">—</p>
          ) : (
            <div className="space-y-2">
              {data.notes.map((n, i) => (
                <div key={n.id} className="border-l-2 border-[#FF6633] pl-2">
                  <p className="text-black">{i + 1}. {n.notes || "(No content)"}</p>
                  <p className="text-xs text-black/70">{preparedByLabel} | {formatShortDate(n.timestamp)}</p>
                  <PhotoGrid photos={n.photos ?? []} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. Chemicals */}
      <section className="border-b border-black">
        <h2 className={SECTION_HEADER}>2. Chemicals</h2>
        <div className="px-3 py-2 bg-white">
          {data.chemicals.length === 0 ? (
            <p className="text-black/70">—</p>
          ) : (
            <div className="space-y-2">
              {data.chemicals.map((c) => (
                <div key={c.id} className="border-l-2 border-[#FF6633] pl-2">
                  <p className="text-black">{c.chemicals.map((ch) => `${ch.name}: ${ch.quantity} ${ch.unit}`).join("; ")}{c.notes ? ` — ${c.notes}` : ""}</p>
                  <p className="text-xs text-black/70">{preparedByLabel} | {formatShortDate(c.timestamp)}</p>
                  <PhotoGrid photos={c.photos ?? []} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Materials */}
      <section className="border-b border-black">
        <h2 className={SECTION_HEADER}>3. Materials</h2>
        <div className="px-3 py-2 bg-white">
          {data.material.length === 0 ? (
            <p className="text-black/70">—</p>
          ) : (
            <>
              <table className="w-full border-collapse border border-black text-sm">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="border border-black px-2 py-1 text-left font-bold text-xs">Material</th>
                    <th className="border border-black px-2 py-1 text-left font-bold text-xs">Day Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.material.map((m) => (
                    <tr key={m.id}>
                      <td className="border border-black px-2 py-1 text-black">{m.notes || m.value || "—"}</td>
                      <td className="border border-black px-2 py-1 text-black">{m.value} {m.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-black/70 mt-1">{preparedByLabel} | {formatShortDate(data.material[data.material.length - 1].timestamp)}</p>
            </>
          )}
        </div>
      </section>

      {/* 4. Daily Metrics */}
      <section className="border-b border-black">
        <h2 className={SECTION_HEADER}>4. Daily Metrics</h2>
        <div className="px-3 py-2 bg-white">
          {data.metrics.length === 0 ? (
            <p className="text-black/70">—</p>
          ) : (
            <div className="space-y-2">
              {data.metrics.map((m) => (
                <div key={m.id} className="border-l-2 border-[#FF6633] pl-2">
                  <p className="text-black">Water: {m.waterUsage ?? "—"} | Acres: {m.acresCompleted ?? "—"} | Operators: {m.numberOfOperators ?? "—"}{m.notes ? ` — ${m.notes}` : ""}</p>
                  <p className="text-xs text-black/70">{preparedByLabel} | {formatShortDate(m.timestamp)}</p>
                  <PhotoGrid photos={m.photos ?? []} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Equipment */}
      <section className="border-b border-black">
        <h2 className={SECTION_HEADER}>5. Equipment</h2>
        <div className="px-3 py-2 bg-white">
          {data.equipment.length === 0 ? (
            <p className="text-black/70">—</p>
          ) : (
            <div className="space-y-2">
              {data.equipment.map((e) => {
                if ("type" in e && (e as EquipmentChecklistEntry).type === "checklist") {
                  const c = e as EquipmentChecklistEntry;
                  return (
                    <div key={c.id} className="border-l-2 border-[#FF6633] pl-2">
                      <p className="text-black">Checklist: Machine #{c.formData.machineNumber} — {c.formData.operatorName}</p>
                      <p className="text-xs text-black/70">{formatShortDate(c.timestamp)}</p>
                      {c.signature && <img src={c.signature} alt="Signature" className="max-w-[200px] h-10 object-contain border-b-2 border-black mt-0.5" />}
                      <PhotoGrid photos={c.photos ?? []} />
                    </div>
                  );
                }
                const eq = e as EquipmentEntry;
                return (
                  <div key={eq.id} className="border-l-2 border-[#FF6633] pl-2">
                    <p className="text-black">{eq.value} {eq.unit || ""}{eq.notes ? ` — ${eq.notes}` : ""}</p>
                    <p className="text-xs text-black/70">{formatShortDate(eq.timestamp)}</p>
                    <PhotoGrid photos={eq.photos ?? []} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 6. Survey */}
      <section className="border-b border-black">
        <h2 className={SECTION_HEADER}>6. Survey</h2>
        <div className="px-3 py-2 bg-white">
          {!latestSurvey ? (
            <p className="text-black/70">—</p>
          ) : (
            <>
              <table className="w-full border-collapse border border-black text-sm">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="border border-black px-2 py-1 text-left font-bold text-xs">Question</th>
                    <th className="border border-black px-2 py-1 text-center font-bold text-xs w-14">N/A</th>
                    <th className="border border-black px-2 py-1 text-center font-bold text-xs w-14">No</th>
                    <th className="border border-black px-2 py-1 text-center font-bold text-xs w-14">Yes</th>
                    <th className="border border-black px-2 py-1 text-left font-bold text-xs">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {latestSurvey.questions.map((q) => (
                    <tr key={q.id}>
                      <td className="border border-black px-2 py-1 text-black">{q.question}</td>
                      <td className="border border-black px-2 py-1 text-center">{q.answer === "N/A" ? "✓" : ""}</td>
                      <td className="border border-black px-2 py-1 text-center">{q.answer === "No" ? "✓" : ""}</td>
                      <td className="border border-black px-2 py-1 text-center">{q.answer === "Yes" ? "✓" : ""}</td>
                      <td className="border border-black px-2 py-1 text-black">{q.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-black/70 mt-1">{preparedByLabel} | {formatShortDate(latestSurvey.timestamp)}</p>
            </>
          )}
        </div>
      </section>

      {/* Signature */}
      {showSignatureBlock && signatureDataUrl && (
        <section className="border-b border-black">
          <h2 className={SECTION_HEADER}>Signature</h2>
          <div className="px-3 py-2 bg-white">
            <p className="text-sm text-black mb-1">I, {preparedByLabel}, have reviewed and completed this report.</p>
            <img src={signatureDataUrl} alt="Signature" className="max-w-[280px] h-14 object-contain border-b-2 border-black" />
            {signedAt && <p className="text-xs text-black/70 mt-1">{preparedByLabel} | {formatShortDate(signedAt)}</p>}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-black text-white px-4 py-3 text-center text-sm">
        <p className="font-medium">{projectName} — {formatReportDateHeader(data.date)}</p>
        <p className="mt-1.5 flex items-center justify-center gap-2 text-white/90">
          <UtilityVisionLogo size={14} className="shrink-0 opacity-90" />
          Powered by Utility Vision
        </p>
      </footer>
    </div>
  );
}
