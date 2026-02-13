"use client";

import { useMemo } from "react";
import type { ReportData, EquipmentEntry, EquipmentChecklistEntry } from "@/lib/dailyReportStorage";

// PDF style: Thu 05/02/2026
function formatReportDateHeader(d: Date): string {
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${weekday} ${dd}/${mm}/${yyyy}`;
}

// PDF style: 05/02/26 | 07:02PM
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
        <img key={i} src={src} alt="" className="w-16 h-16 object-cover border border-black/20" />
      ))}
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

  const projectName = data.projectName;
  const projectAddress = "—"; // From API or project settings when available
  const jobNumber = "—"; // From API when available

  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto min-h-screen print:shadow-none text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Header - PDF style: project name, address, date + job # */}
      <header className="border-b border-black pb-2 mb-2">
        <h1 className="text-base font-bold leading-tight">{projectName}</h1>
        <p className="text-sm leading-tight">{projectAddress}</p>
        <p className="text-sm mt-0.5">Date {formatReportDateHeader(data.date)} Job # {jobNumber}</p>
      </header>

      {/* Weather - PDF style: 7 AM, 12 PM, 4 PM with temp, condition, wind, precip, humidity */}
      <section className="mb-3">
        <h2 className="text-sm font-bold mb-1">Weather</h2>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="font-medium">7:00 AM</div>
            <div>—°</div>
            <div>—</div>
            <div>Wind: | | .0&quot; Precipitation: —% Humidity:</div>
          </div>
          <div>
            <div className="font-medium">12:00 PM</div>
            <div>—°</div>
            <div>—</div>
            <div>Wind: | | .0&quot; Precipitation: —% Humidity:</div>
          </div>
          <div>
            <div className="font-medium">4:00 PM</div>
            <div>—°</div>
            <div>—</div>
            <div>Wind: | | .0&quot; Precipitation: —% Humidity:</div>
          </div>
        </div>
      </section>

      {/* Materials - PDF style table (Material, Cost Code, Day Total, Week Total, Quantities to Date) */}
      <section className="mb-3">
        <h2 className="text-sm font-bold mb-1">Materials</h2>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr>
              <th className="border border-black px-2 py-1 text-left font-bold">Material</th>
              <th className="border border-black px-2 py-1 text-left font-bold">Cost Code</th>
              <th className="border border-black px-2 py-1 text-left font-bold">Day Total</th>
              <th className="border border-black px-2 py-1 text-left font-bold">Week Total</th>
              <th className="border border-black px-2 py-1 text-left font-bold">Quantities to Date</th>
            </tr>
          </thead>
          <tbody>
            {data.material.length === 0 ? (
              <tr>
                <td colSpan={5} className="border border-black px-2 py-1">—</td>
              </tr>
            ) : (
              data.material.map((m) => (
                <tr key={m.id}>
                  <td className="border border-black px-2 py-1">{m.notes || m.value || "—"}</td>
                  <td className="border border-black px-2 py-1">—</td>
                  <td className="border border-black px-2 py-1">{m.value} {m.unit}</td>
                  <td className="border border-black px-2 py-1">—</td>
                  <td className="border border-black px-2 py-1">—</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {data.material.length > 0 && (
          <>
            <p className="text-sm mt-0.5">{data.signed?.preparedBy ?? preparedBy} | {formatShortDate(data.material[data.material.length - 1].timestamp)}</p>
            <p className="text-sm mt-0.5">Material Log Photos</p>
          </>
        )}
      </section>

      {/* General Notes - PDF style: numbered list, Author | date | time under each */}
      <section className="mb-3">
        <h2 className="text-sm font-bold mb-1">General Notes</h2>
        {data.notes.length === 0 ? (
          <p>—</p>
        ) : (
          <div className="space-y-1">
            {data.notes.map((n, i) => (
              <div key={n.id}>
                <p>{i + 1}. {n.notes || "(No content)"}</p>
                <p className="text-sm">{preparedBy} | {formatShortDate(n.timestamp)}</p>
                <PhotoGrid photos={n.photos ?? []} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Chemicals */}
      {data.chemicals.length > 0 && (
        <section className="mb-3">
          <h2 className="text-sm font-bold mb-1">Chemicals</h2>
          <div className="space-y-1">
            {data.chemicals.map((c) => (
              <div key={c.id}>
                <p>{c.chemicals.map((ch) => `${ch.name}: ${ch.quantity} ${ch.unit}`).join("; ")}{c.notes ? ` — ${c.notes}` : ""}</p>
                <p className="text-sm">{preparedBy} | {formatShortDate(c.timestamp)}</p>
                <PhotoGrid photos={c.photos ?? []} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily Metrics */}
      {data.metrics.length > 0 && (
        <section className="mb-3">
          <h2 className="text-sm font-bold mb-1">Daily Metrics</h2>
          <div className="space-y-1">
            {data.metrics.map((m) => (
              <div key={m.id}>
                <p>Water: {m.waterUsage ?? "—"} | Acres: {m.acresCompleted ?? "—"} | Operators: {m.numberOfOperators ?? "—"}{m.notes ? ` — ${m.notes}` : ""}</p>
                <p className="text-sm">{preparedBy} | {formatShortDate(m.timestamp)}</p>
                <PhotoGrid photos={m.photos ?? []} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Equipment */}
      {data.equipment.length > 0 && (
        <section className="mb-3">
          <h2 className="text-sm font-bold mb-1">Equipment</h2>
          <div className="space-y-1">
            {data.equipment.map((e) => {
              if ("type" in e && (e as EquipmentChecklistEntry).type === "checklist") {
                const c = e as EquipmentChecklistEntry;
                return (
                  <div key={c.id}>
                    <p>Checklist: Machine #{c.formData.machineNumber} — {c.formData.operatorName}</p>
                    <p className="text-sm">{formatShortDate(c.timestamp)}</p>
                    {c.signature && <img src={c.signature} alt="Signature" className="max-w-[200px] h-10 object-contain border-b border-black mt-0.5" />}
                    <PhotoGrid photos={c.photos ?? []} />
                  </div>
                );
              }
              const eq = e as EquipmentEntry;
              return (
                <div key={eq.id}>
                  <p>{eq.value} {eq.unit || ""}{eq.notes ? ` — ${eq.notes}` : ""}</p>
                  <p className="text-sm">{formatShortDate(eq.timestamp)}</p>
                  <PhotoGrid photos={eq.photos ?? []} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Survey - PDF style table: Questions | N/A | No | Yes | Description */}
      <section className="mb-3">
        <h2 className="text-sm font-bold mb-1">Survey</h2>
        {!latestSurvey ? (
          <p>—</p>
        ) : (
          <>
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr>
                  <th className="border border-black px-2 py-1 text-left font-bold">Questions</th>
                  <th className="border border-black px-2 py-1 text-left font-bold w-12">N/A</th>
                  <th className="border border-black px-2 py-1 text-left font-bold w-12">No</th>
                  <th className="border border-black px-2 py-1 text-left font-bold w-12">Yes</th>
                  <th className="border border-black px-2 py-1 text-left font-bold">Description</th>
                </tr>
              </thead>
              <tbody>
                {latestSurvey.questions.map((q) => (
                  <tr key={q.id}>
                    <td className="border border-black px-2 py-0.5">{q.question}</td>
                    <td className="border border-black px-2 py-0.5">{q.answer === "N/A" ? "✓" : ""}</td>
                    <td className="border border-black px-2 py-0.5">{q.answer === "No" ? "✓" : ""}</td>
                    <td className="border border-black px-2 py-0.5">{q.answer === "Yes" ? "✓" : ""}</td>
                    <td className="border border-black px-2 py-0.5">{q.description || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm mt-0.5">{preparedBy} | {formatShortDate(latestSurvey.timestamp)}</p>
          </>
        )}
      </section>

      {/* Attachments & Photos */}
      {data.attachments.length > 0 && (
        <section className="mb-3">
          <h2 className="text-sm font-bold mb-1">Attachments &amp; Photos</h2>
          <div className="space-y-1">
            {data.attachments.map((a) => (
              <div key={a.id}>
                <p>Files: {a.fileNames.join(", ")}{a.notes ? ` — ${a.notes}` : ""}</p>
                <p className="text-sm">{formatShortDate(a.timestamp)}</p>
                {a.previews?.length ? <PhotoGrid photos={a.previews} /> : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Signature */}
      {showSignatureBlock && signatureDataUrl && (
        <section className="mb-3">
          <h2 className="text-sm font-bold mb-1">Signature</h2>
          <p className="text-sm mb-0.5">I, {data.signed?.preparedBy ?? preparedBy}, have reviewed and completed this report.</p>
          <img src={signatureDataUrl} alt="Signature" className="max-w-[280px] h-14 object-contain border-b border-black" />
          {signedAt && <p className="text-sm mt-0.5">{data.signed?.preparedBy ?? preparedBy} | {formatShortDate(signedAt)}</p>}
        </section>
      )}

      {/* Footer - PDF style: "1 of 1 | Project Name" and "Powered by Utility Vision" */}
      <footer className="border-t border-black pt-2 mt-4 text-center text-sm">
        <p>1 of 1 | {projectName}</p>
        <p className="mt-1">Powered by Utility Vision</p>
      </footer>
    </div>
  );
}
