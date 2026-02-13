"use client";

import { useMemo } from "react";
import type { ReportData, EquipmentEntry, EquipmentChecklistEntry } from "@/lib/dailyReportStorage";

function formatReportDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).replace(/,/g, "");
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  const time = formatTime(iso).replace(/\s/g, "");
  return `${mm}/${dd}/${yy} | ${time}`;
}

interface ReportPreviewProps {
  data: ReportData;
  preparedBy?: string;
  showSignatureBlock?: boolean;
  signatureDataUrl?: string | null;
  signedAt?: string | null;
}

/** Renders a small photo grid from data URLs */
function PhotoGrid({ photos, label }: { photos: string[]; label?: string }) {
  if (!photos?.length) return null;
  return (
    <div className="mt-2">
      {label && <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {photos.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Photo ${i + 1}`}
            className="w-20 h-20 object-cover rounded border border-gray-200 print:break-inside-avoid"
          />
        ))}
      </div>
    </div>
  );
}

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

  const sectionClass = "border-b border-gray-200 px-6 py-4";
  const sectionTitleClass = "text-xs font-bold uppercase tracking-wide text-gray-500 mb-2";

  return (
    <div className="bg-white text-gray-900 max-w-[210mm] mx-auto min-h-screen print:shadow-none font-sans text-sm">
      {/* Header - branded */}
      <header className="bg-gray-50 border-b-2 border-gray-300 px-6 py-5">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{data.projectName}</h1>
            <p className="text-sm text-gray-600 mt-0.5">Daily Field Report</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div>Date: <span className="font-medium text-gray-900">{formatReportDate(data.date)}</span></div>
            <div className="mt-1">Prepared by: <span className="font-medium text-gray-900">{data.signed?.preparedBy ?? preparedBy}</span></div>
          </div>
        </div>
      </header>

      {/* Weather */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>1. Weather</h2>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-50 rounded p-2"><span className="font-medium">7:00 AM</span><span className="text-gray-500 ml-1">—</span></div>
          <div className="bg-gray-50 rounded p-2"><span className="font-medium">12:00 PM</span><span className="text-gray-500 ml-1">—</span></div>
          <div className="bg-gray-50 rounded p-2"><span className="font-medium">4:00 PM</span><span className="text-gray-500 ml-1">—</span></div>
        </div>
      </section>

      {/* 2. General Notes */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>2. General Notes</h2>
        {data.notes.length === 0 ? (
          <p className="text-gray-500 italic">No notes for this date.</p>
        ) : (
          <div className="space-y-3">
            {data.notes.map((n, i) => (
              <div key={n.id} className="border-l-2 border-gray-300 pl-3 py-1">
                <p className="text-gray-900">{n.notes || "(No content)"}</p>
                <p className="text-xs text-gray-500 mt-0.5">{preparedBy} | {formatShortDate(n.timestamp)} | Category: {n.category}</p>
                <PhotoGrid photos={n.photos ?? []} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Chemicals */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>3. Chemicals</h2>
        {data.chemicals.length === 0 ? (
          <p className="text-gray-500 italic">No chemical entries for this date.</p>
        ) : (
          <div className="space-y-2">
            {data.chemicals.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded p-2">
                <p className="text-gray-900">
                  {c.chemicals.map((ch) => `${ch.name}: ${ch.quantity} ${ch.unit}`).join("; ")}
                  {c.notes && <span className="text-gray-600"> — {c.notes}</span>}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{formatShortDate(c.timestamp)}</p>
                <PhotoGrid photos={c.photos ?? []} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Material */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>4. Material Log</h2>
        {data.material.length === 0 ? (
          <p className="text-gray-500 italic">No material entries for this date.</p>
        ) : (
          <div className="space-y-2">
            {data.material.map((m) => (
              <div key={m.id} className="bg-gray-50 rounded p-2">
                <p className="text-gray-900">{m.value} {m.unit}{m.notes ? ` — ${m.notes}` : ""}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatShortDate(m.timestamp)}</p>
                <PhotoGrid photos={m.photos ?? []} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Daily Metrics */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>5. Daily Metrics</h2>
        {data.metrics.length === 0 ? (
          <p className="text-gray-500 italic">No metrics for this date.</p>
        ) : (
          <div className="space-y-2">
            {data.metrics.map((m) => (
              <div key={m.id} className="bg-gray-50 rounded p-2">
                <p className="text-gray-900">
                  Water: {m.waterUsage ?? "—"} | Acres: {m.acresCompleted ?? "—"} | Operators: {m.numberOfOperators ?? "—"}
                  {m.notes && <span className="text-gray-600"> — {m.notes}</span>}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{formatShortDate(m.timestamp)}</p>
                <PhotoGrid photos={m.photos ?? []} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Equipment */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>6. Equipment</h2>
        {data.equipment.length === 0 ? (
          <p className="text-gray-500 italic">No equipment entries for this date.</p>
        ) : (
          <div className="space-y-2">
            {data.equipment.map((e) => {
              if ("type" in e && (e as EquipmentChecklistEntry).type === "checklist") {
                const c = e as EquipmentChecklistEntry;
                return (
                  <div key={c.id} className="bg-gray-50 rounded p-2">
                    <p className="text-gray-900 font-medium">Checklist</p>
                    <p className="text-gray-700 text-xs mt-0.5">
                      Machine #{c.formData.machineNumber} | Operator: {c.formData.operatorName} | Site: {c.formData.siteName || "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatShortDate(c.timestamp)}</p>
                    {c.signature && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-0.5">Signature:</p>
                        <img src={c.signature} alt="Checklist signature" className="max-w-[200px] h-12 object-contain border border-gray-200 rounded" />
                      </div>
                    )}
                    <PhotoGrid photos={c.photos ?? []} />
                  </div>
                );
              }
              const eq = e as EquipmentEntry;
              return (
                <div key={eq.id} className="bg-gray-50 rounded p-2">
                  <p className="text-gray-900">{eq.value && `${eq.value} ${eq.unit || ""}`}{eq.notes && ` — ${eq.notes}`}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatShortDate(eq.timestamp)}</p>
                  <PhotoGrid photos={eq.photos ?? []} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 7. Survey */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>7. Survey</h2>
        {!latestSurvey ? (
          <p className="text-gray-500 italic">No survey for this date.</p>
        ) : (
          <div>
            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-2 font-semibold text-gray-700 border-b border-gray-200">Question</th>
                    <th className="text-center py-2 px-2 font-semibold text-gray-700 border-b border-gray-200 w-12">N/A</th>
                    <th className="text-center py-2 px-2 font-semibold text-gray-700 border-b border-gray-200 w-12">No</th>
                    <th className="text-center py-2 px-2 font-semibold text-gray-700 border-b border-gray-200 w-12">Yes</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700 border-b border-gray-200">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {latestSurvey.questions.map((q) => (
                    <tr key={q.id} className="border-b border-gray-100">
                      <td className="py-1.5 px-2 text-gray-900">{q.question}</td>
                      <td className="py-1.5 px-2 text-center">{q.answer === "N/A" ? "✓" : ""}</td>
                      <td className="py-1.5 px-2 text-center">{q.answer === "No" ? "✓" : ""}</td>
                      <td className="py-1.5 px-2 text-center">{q.answer === "Yes" ? "✓" : ""}</td>
                      <td className="py-1.5 px-2 text-gray-600">{q.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-1">{preparedBy} | {formatShortDate(latestSurvey.timestamp)}</p>
          </div>
        )}
      </section>

      {/* 8. Attachments & Photos */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>8. Attachments &amp; Photos</h2>
        {data.attachments.length === 0 ? (
          <p className="text-gray-500 italic">No attachments for this date.</p>
        ) : (
          <div className="space-y-3">
            {data.attachments.map((a) => (
              <div key={a.id} className="bg-gray-50 rounded p-3">
                <p className="font-medium text-gray-900">Files: {a.fileNames.join(", ")}</p>
                {a.notes && <p className="text-gray-600 text-xs mt-0.5">{a.notes}</p>}
                <p className="text-xs text-gray-500 mt-0.5">{formatShortDate(a.timestamp)}</p>
                {a.previews && a.previews.length > 0 && (
                  <PhotoGrid photos={a.previews} label="Photos" />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Signature */}
      {showSignatureBlock && (
        <section className={`${sectionClass} bg-gray-50`}>
          <h2 className={sectionTitleClass}>Signature</h2>
          {signatureDataUrl ? (
            <div>
              <p className="text-gray-900 mb-2">
                I, {data.signed?.preparedBy ?? preparedBy}, have reviewed and completed this report.
              </p>
              <img
                src={signatureDataUrl}
                alt="Signature"
                className="max-w-[280px] h-16 object-contain border-b-2 border-gray-800"
              />
              {signedAt && <p className="text-xs text-gray-500 mt-1">{formatShortDate(signedAt)}</p>}
            </div>
          ) : (
            <p className="text-gray-500 italic">Not yet signed.</p>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-sm text-gray-500 border-t border-gray-200 bg-gray-50">
        Powered by Utility Vision
      </footer>
    </div>
  );
}
