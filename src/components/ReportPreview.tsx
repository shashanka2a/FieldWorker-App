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

  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto min-h-screen print:shadow-none">
      {/* Header */}
      <header className="border-b-2 border-black px-6 py-4">
        <h1 className="text-xl font-bold">{data.projectName}</h1>
        <p className="text-sm text-gray-600">Daily Field Report</p>
        <div className="mt-2 flex justify-between text-sm">
          <span>Date: {formatReportDate(data.date)}</span>
          <span>Prepared by: {data.signed?.preparedBy ?? preparedBy}</span>
        </div>
      </header>

      {/* Weather placeholder */}
      <section className="border-b border-gray-300 px-6 py-3">
        <h2 className="text-sm font-semibold uppercase text-gray-600">Weather</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium">7:00 AM</div>
            <div className="text-gray-600">—</div>
          </div>
          <div>
            <div className="font-medium">12:00 PM</div>
            <div className="text-gray-600">—</div>
          </div>
          <div>
            <div className="font-medium">4:00 PM</div>
            <div className="text-gray-600">—</div>
          </div>
        </div>
      </section>

      {/* General Notes */}
      <section className="border-b border-gray-300 px-6 py-3">
        <h2 className="text-sm font-semibold uppercase text-gray-600">General Notes</h2>
        {data.notes.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No notes for this date.</p>
        ) : (
          <ol className="list-decimal space-y-2 pl-4 text-sm">
            {data.notes.map((n, i) => (
              <li key={n.id}>
                <span>{n.notes || "(No content)"}</span>
                <span className="ml-2 text-gray-500">
                  {preparedBy} | {formatShortDate(n.timestamp)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Chemicals */}
      {data.chemicals.length > 0 && (
        <section className="border-b border-gray-300 px-6 py-3">
          <h2 className="text-sm font-semibold uppercase text-gray-600">Chemicals</h2>
          <ul className="space-y-1 text-sm">
            {data.chemicals.map((c) => (
              <li key={c.id}>
                {c.chemicals.map((ch) => `${ch.name}: ${ch.quantity} ${ch.unit}`).join(", ")}
                {c.notes && ` — ${c.notes}`}
                <span className="ml-2 text-gray-500">{formatShortDate(c.timestamp)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Material log */}
      {data.material.length > 0 && (
        <section className="border-b border-gray-300 px-6 py-3">
          <h2 className="text-sm font-semibold uppercase text-gray-600">Material</h2>
          <ul className="space-y-1 text-sm">
            {data.material.map((m) => (
              <li key={m.id}>
                {m.value} {m.unit}
                {m.notes && ` — ${m.notes}`}
                <span className="ml-2 text-gray-500">{formatShortDate(m.timestamp)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Daily Metrics */}
      {data.metrics.length > 0 && (
        <section className="border-b border-gray-300 px-6 py-3">
          <h2 className="text-sm font-semibold uppercase text-gray-600">Daily Metrics</h2>
          <ul className="space-y-1 text-sm">
            {data.metrics.map((m) => (
              <li key={m.id}>
                Water: {m.waterUsage ?? "—"} | Acres: {m.acresCompleted ?? "—"} | Operators:{" "}
                {m.numberOfOperators ?? "—"}
                {m.notes && ` — ${m.notes}`}
                <span className="ml-2 text-gray-500">{formatShortDate(m.timestamp)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Equipment */}
      {data.equipment.length > 0 && (
        <section className="border-b border-gray-300 px-6 py-3">
          <h2 className="text-sm font-semibold uppercase text-gray-600">Equipment</h2>
          <ul className="space-y-1 text-sm">
            {data.equipment.map((e) => {
              if ("type" in e && (e as EquipmentChecklistEntry).type === "checklist") {
                const c = e as EquipmentChecklistEntry;
                return (
                  <li key={c.id}>
                    Checklist: Machine #{c.formData.machineNumber} — {c.formData.operatorName} —{" "}
                    {formatShortDate(c.timestamp)}
                  </li>
                );
              }
              const eq = e as EquipmentEntry;
              return (
                <li key={eq.id}>
                  {eq.value && `${eq.value} ${eq.unit || ""}`}
                  {eq.notes && ` — ${eq.notes}`}
                  <span className="ml-2 text-gray-500">{formatShortDate(eq.timestamp)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Survey */}
      <section className="border-b border-gray-300 px-6 py-3">
        <h2 className="text-sm font-semibold uppercase text-gray-600">Survey</h2>
        {!latestSurvey ? (
          <p className="text-sm text-gray-500 italic">No survey for this date.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-1 font-semibold">Questions</th>
                    <th className="text-left py-1 font-semibold w-16">N/A</th>
                    <th className="text-left py-1 font-semibold w-16">No</th>
                    <th className="text-left py-1 font-semibold w-16">Yes</th>
                    <th className="text-left py-1 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {latestSurvey.questions.map((q) => (
                    <tr key={q.id} className="border-b border-gray-200">
                      <td className="py-1">{q.question}</td>
                      <td className="py-1">{q.answer === "N/A" ? "✓" : ""}</td>
                      <td className="py-1">{q.answer === "No" ? "✓" : ""}</td>
                      <td className="py-1">{q.answer === "Yes" ? "✓" : ""}</td>
                      <td className="py-1 text-gray-600">{q.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1 text-gray-500 text-xs">
              {preparedBy} | {formatShortDate(latestSurvey.timestamp)}
            </p>
          </>
        )}
      </section>

      {/* Attachments */}
      {data.attachments.length > 0 && (
        <section className="border-b border-gray-300 px-6 py-3">
          <h2 className="text-sm font-semibold uppercase text-gray-600">Attachments</h2>
          <ul className="space-y-1 text-sm">
            {data.attachments.map((a) => (
              <li key={a.id}>
                {a.fileNames.join(", ")}
                {a.notes && ` — ${a.notes}`}
                <span className="ml-2 text-gray-500">{formatShortDate(a.timestamp)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Signature block */}
      {showSignatureBlock && (
        <section className="border-b border-gray-300 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase text-gray-600 mb-2">Signature</h2>
          {signatureDataUrl ? (
            <div>
              <p className="text-sm mb-2">
                I, {data.signed?.preparedBy ?? preparedBy}, have reviewed and completed this report.
              </p>
              <img
                src={signatureDataUrl}
                alt="Signature"
                className="max-w-[280px] h-16 object-contain border-b border-black"
              />
              {signedAt && (
                <p className="text-xs text-gray-500 mt-1">{formatShortDate(signedAt)}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Not yet signed.</p>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-sm text-gray-500">
        Powered by Utility Vision
      </footer>
    </div>
  );
}
