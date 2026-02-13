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

/** Collect all report photos with timestamps for Site Photos section */
function collectSitePhotos(data: ReportData): { src: string; time: string }[] {
  const out: { src: string; time: string }[] = [];
  data.notes.forEach((n) => {
    (n.photos ?? []).forEach((src) => out.push({ src, time: n.timestamp }));
  });
  data.chemicals.forEach((c) => {
    (c.photos ?? []).forEach((src) => out.push({ src, time: c.timestamp }));
  });
  data.metrics.forEach((m) => {
    (m.photos ?? []).forEach((src) => out.push({ src, time: m.timestamp }));
  });
  data.equipment.forEach((e) => {
    const photos = "photos" in e ? (e.photos ?? []) : [];
    const ts = "timestamp" in e ? e.timestamp : "";
    photos.forEach((src) => out.push({ src, time: ts }));
  });
  data.attachments.forEach((a) => {
    (a.previews ?? []).forEach((src) => out.push({ src, time: a.timestamp }));
  });
  return out;
}

const ORANGE = "#FF6633";

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
  const sitePhotos = useMemo(() => collectSitePhotos(data), [data]);
  const latestMetrics = useMemo(
    () => (data.metrics.length > 0 ? data.metrics[data.metrics.length - 1] : null),
    [data.metrics]
  );
  const latestChemicals = useMemo(
    () => (data.chemicals.length > 0 ? data.chemicals[data.chemicals.length - 1] : null),
    [data.chemicals]
  );

  const projectName = data.projectName;
  const projectAddress = "—";
  const jobNumber = "—";
  const preparedByLabel = data.signed?.preparedBy ?? preparedBy;

  return (
    <div
      className="bg-[#555] min-h-screen py-10 print:bg-white print:py-0"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties}
    >
      <div
        className="w-full max-w-[850px] mx-auto bg-white text-[#333] shadow-lg print:shadow-none print:max-w-none relative pb-14"
        style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}
      >
        {/* --- Header black bar --- */}
        <div
          className="flex justify-between items-center px-7 py-3.5 text-white text-[13px] font-semibold tracking-wide"
          style={{ backgroundColor: "#000", letterSpacing: "0.5px" }}
        >
          <span>Date {formatReportDateHeader(data.date)}</span>
          <span>Job # {jobNumber}</span>
          <span>Prepared By {preparedByLabel}</span>
        </div>

        {/* --- Header white section --- */}
        <div className="flex justify-between items-start px-7 py-6 border-b border-[#e0e0e0]">
          <div>
            <h1 className="m-0 mb-1 text-[22px] font-bold text-[#222]">{projectName}</h1>
            <p className="m-0 text-[13px] text-[#666]">{projectAddress}</p>
          </div>
          <div className="shrink-0">
            <UtilityVisionLogo size={40} />
          </div>
        </div>

        {/* --- Weather --- */}
        <div className="px-7 mt-5">
          <div
            className="py-2 px-4 text-white font-bold text-[15px] uppercase tracking-wide"
            style={{ backgroundColor: ORANGE, letterSpacing: "0.5px" }}
          >
            Weather
          </div>
          <div className="flex border border-[#ddd]">
            {[
              { time: "7:00 AM", temp: "—°", icon: "—", condition: "—", details: "Wind: — | Precip: — | Humidity: —" },
              { time: "12:00 PM", temp: "—°", icon: "—", condition: "—", details: "Wind: — | Precip: — | Humidity: —" },
              { time: "4:00 PM", temp: "—°", icon: "—", condition: "—", details: "Wind: — | Precip: — | Humidity: —" },
            ].map((w, i) => (
              <div
                key={w.time}
                className={`flex-1 text-center py-4 px-2 ${i < 2 ? "border-r border-[#ddd]" : ""}`}
              >
                <div className="text-[11px] font-bold uppercase mb-1">{w.time}</div>
                <div className="text-3xl font-bold text-[#222] my-2">{w.temp}</div>
                <div className="text-[13px] font-bold mb-2">{w.condition}</div>
                <div className="text-[10px] text-[#666] leading-snug">{w.details}</div>
              </div>
            ))}
          </div>
        </div>

        {/* --- General Notes --- */}
        <div className="px-7 mt-5">
          <div
            className="py-2 px-4 text-white font-bold text-[15px] uppercase tracking-wide"
            style={{ backgroundColor: ORANGE, letterSpacing: "0.5px" }}
          >
            General Notes
          </div>
          <div className="px-7 py-4">
            {data.notes.length === 0 ? (
              <p className="text-[13px] text-[#222] leading-relaxed">—</p>
            ) : (
              <>
                <div className="text-[13px] text-[#222] leading-relaxed space-y-2">
                  {data.notes.map((n, i) => (
                    <div key={n.id}>
                      <p className="mt-0"><strong>{i + 1}.</strong> {n.notes || "(No content)"}</p>
                      {(n.photos ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1 my-2">
                          {(n.photos ?? []).map((src, j) => (
                            <img key={j} src={src} alt="" className="w-16 h-16 object-cover border border-[#ddd]" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[11px] text-[#888] font-semibold">
                  {preparedByLabel} {data.notes.length > 0 && formatShortDate(data.notes[data.notes.length - 1].timestamp)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* --- Daily Metrics + Chemicals (two columns) --- */}
        <div className="px-7 mt-5 flex gap-5">
          <div className="flex-1">
            <div
              className="py-2 px-4 text-white font-bold text-[15px] uppercase tracking-wide"
              style={{ backgroundColor: ORANGE, letterSpacing: "0.5px" }}
            >
              Daily Metrics
            </div>
            <div className="border border-[#ddd] border-t-0 px-4 py-4">
              {!latestMetrics ? (
                <p className="text-[13px] text-[#666]">—</p>
              ) : (
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between border-b border-[#f5f5f5] pb-1">
                    <strong>Water Usage (GAL)</strong>
                    <span>{latestMetrics.waterUsage ?? "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#f5f5f5] pb-1">
                    <strong>Acres Completed</strong>
                    <span>{latestMetrics.acresCompleted ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <strong>Number of Operators</strong>
                    <span>{latestMetrics.numberOfOperators ?? "—"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div
              className="py-2 px-4 text-white font-bold text-[15px] uppercase tracking-wide"
              style={{ backgroundColor: ORANGE, letterSpacing: "0.5px" }}
            >
              Chemicals Left
            </div>
            <div className="border border-[#ddd] border-t-0 px-4 py-4">
              {!latestChemicals || latestChemicals.chemicals.length === 0 ? (
                <p className="text-[13px] text-[#666]">—</p>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                  {latestChemicals.chemicals.map((ch, i) => (
                    <div key={i}>
                      <strong>{ch.name}:</strong> {ch.quantity} {ch.unit}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Materials --- */}
        <div className="px-7 mt-5">
          <div
            className="py-2 px-4 text-white font-bold text-[15px] uppercase tracking-wide"
            style={{ backgroundColor: ORANGE, letterSpacing: "0.5px" }}
          >
            Materials
          </div>
          <div className="border border-[#ddd] border-t-0 px-7 py-4">
            {data.material.length === 0 ? (
              <p className="text-[13px] text-[#666]">—</p>
            ) : (
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr>
                    <th className="text-left border-b-2 border-[#ccc] py-2 px-1 text-[#444] font-bold">Material</th>
                    <th className="text-left border-b-2 border-[#ccc] py-2 px-1 text-[#444] font-bold">Day Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.material.map((m) => (
                    <tr key={m.id}>
                      <td className="border-b border-[#eee] py-2.5 px-1">{m.notes || m.value || "—"}</td>
                      <td className="border-b border-[#eee] py-2.5 px-1">{m.value} {m.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* --- Equipment Checklist --- */}
        <div className="px-7 mt-8">
          <div
            className="py-2 px-4 text-white font-bold text-[15px] uppercase tracking-wide"
            style={{ backgroundColor: ORANGE, letterSpacing: "0.5px" }}
          >
            Equipment Checklist
          </div>
          <div className="border border-[#ddd] border-t-0 px-7 py-4">
            {data.equipment.length === 0 ? (
              <p className="text-[13px] text-[#666]">—</p>
            ) : (
              <div className="space-y-4">
                {data.equipment.map((e) => {
                  if ("type" in e && (e as EquipmentChecklistEntry).type === "checklist") {
                    const c = e as EquipmentChecklistEntry;
                    const fd = c.formData;
                    return (
                      <div key={c.id} className="space-y-3">
                        <div
                          className="grid grid-cols-3 gap-4 p-2.5 rounded bg-[#f9f9f9] text-[13px] border border-[#eee]"
                        >
                          {Object.entries(fd).map(([k, v]) => (
                            <div key={k}>
                              <strong>{k.replace(/([A-Z])/g, " $1").trim()}:</strong> {v}
                            </div>
                          ))}
                        </div>
                        {c.signature && (
                          <img src={c.signature} alt="Signature" className="max-w-[200px] h-10 object-contain border-b-2 border-black" />
                        )}
                        {(c.photos ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {(c.photos ?? []).map((src, i) => (
                              <img key={i} src={src} alt="" className="w-16 h-16 object-cover border border-[#ddd]" />
                            ))}
                          </div>
                        )}
                        <div className="text-[11px] text-[#888] font-semibold">{formatShortDate(c.timestamp)}</div>
                      </div>
                    );
                  }
                  const eq = e as EquipmentEntry;
                  return (
                    <div key={eq.id} className="border-l-2 pl-2" style={{ borderColor: ORANGE }}>
                      <p className="text-[13px] text-[#222]">{eq.value} {eq.unit || ""}{eq.notes ? ` — ${eq.notes}` : ""}</p>
                      <div className="text-[11px] text-[#888] font-semibold mt-1">{formatShortDate(eq.timestamp)}</div>
                      {(eq.photos ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(eq.photos ?? []).map((src, i) => (
                            <img key={i} src={src} alt="" className="w-16 h-16 object-cover border border-[#ddd]" />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* --- Site Photos --- */}
        <div className="px-7 mt-5">
          <div
            className="py-2 px-4 text-white font-bold text-[15px] uppercase tracking-wide"
            style={{ backgroundColor: ORANGE, letterSpacing: "0.5px" }}
          >
            Site Photos
          </div>
          <div className="px-7 py-4">
            {sitePhotos.length === 0 ? (
              <p className="text-[13px] text-[#666]">—</p>
            ) : (
              <div className="grid grid-cols-4 gap-1">
                {sitePhotos.map((p, i) => (
                  <div key={i} className="relative bg-[#eee] aspect-square overflow-hidden">
                    <img src={p.src} alt="" className="w-full h-full object-cover block" />
                    <div
                      className="absolute bottom-0 left-0 right-0 flex justify-end pt-12 pb-1 px-1"
                      style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.6))" }}
                    >
                      <span className="text-white text-[10px] font-bold font-mono drop-shadow" style={{ textShadow: "1px 1px 1px rgba(0,0,0,0.8)" }}>
                        {formatShortDate(p.time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- Survey --- */}
        <div className="px-7 mt-5">
          <div
            className="py-2 px-4 text-white font-bold text-[15px] uppercase tracking-wide"
            style={{ backgroundColor: ORANGE, letterSpacing: "0.5px" }}
          >
            Survey
          </div>
          <div className="px-7 py-4">
            {!latestSurvey ? (
              <p className="text-[13px] text-[#666]">—</p>
            ) : (
              <>
                <table className="w-full border-collapse text-[12px]">
                  <thead>
                    <tr>
                      <th className="text-left border-b-2 border-[#ccc] py-2 px-1 text-[#444] font-bold">Questions</th>
                      <th className="w-10 text-center border-b-2 border-[#ccc] py-2 px-1 text-[#444] font-bold">N/A</th>
                      <th className="w-10 text-center border-b-2 border-[#ccc] py-2 px-1 text-[#444] font-bold">No</th>
                      <th className="w-10 text-center border-b-2 border-[#ccc] py-2 px-1 text-[#444] font-bold">Yes</th>
                      <th className="text-left border-b-2 border-[#ccc] py-2 px-1 text-[#444] font-bold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestSurvey.questions.map((q) => (
                      <tr key={q.id}>
                        <td className="border-b border-[#eee] py-2.5 px-1 align-top">{q.question}</td>
                        <td className="border-b border-[#eee] py-2.5 px-1 text-center align-top">
                          <span className="inline-flex w-3.5 h-3.5 border border-[#999] items-center justify-center text-[12px] bg-[#eee]">
                            {q.answer === "N/A" ? "✓" : ""}
                          </span>
                        </td>
                        <td className="border-b border-[#eee] py-2.5 px-1 text-center align-top">
                          <span className="inline-flex w-3.5 h-3.5 border border-[#999] items-center justify-center text-[12px] bg-[#eee]">
                            {q.answer === "No" ? "✓" : ""}
                          </span>
                        </td>
                        <td className="border-b border-[#eee] py-2.5 px-1 text-center align-top">
                          <span className="inline-flex w-3.5 h-3.5 border border-[#999] items-center justify-center text-[12px] bg-[#eee]">
                            {q.answer === "Yes" ? "✓" : ""}
                          </span>
                        </td>
                        <td className="border-b border-[#eee] py-2.5 px-1 align-top text-[#555] italic">{q.description || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 text-[11px] text-[#888] font-semibold">{preparedByLabel} | {formatShortDate(latestSurvey.timestamp)}</div>
              </>
            )}
          </div>
        </div>

        {/* --- Signature --- */}
        {showSignatureBlock && signatureDataUrl && (
          <div className="px-7 py-5 border-t border-[#eee] mt-5">
            <div className="text-[13px] font-bold mb-4">
              I, {preparedByLabel}, have reviewed and completed this report.
            </div>
            <img src={signatureDataUrl} alt="Signature" className="max-w-[280px] h-14 object-contain border-b-2 border-black" />
            {signedAt && (
              <div className="mt-2 text-[11px] text-[#888] font-semibold">{preparedByLabel} | {formatShortDate(signedAt)}</div>
            )}
          </div>
        )}

        {/* --- Footer --- */}
        <div className="mt-10 text-center text-[11px] text-[#999] border-t border-[#eee] pt-4 pb-5 px-7">
          Powered by <span className="font-extrabold tracking-wider" style={{ color: ORANGE }}>UTILITY VISION</span>
          <br />
          {projectName}
        </div>
      </div>
    </div>
  );
}
