"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getTemplateById } from "@/lib/safetyTemplates";

export function SafetyTalkReader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "";
  const mode = searchParams.get("mode") || "start";
  const [view, setView] = useState<"reader" | "original">("reader");

  const template = getTemplateById(templateId);

  const handleNext = () => {
    router.push(`/safety/signatures?talk=${templateId}&mode=${mode}`);
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white font-semibold mb-2">Template not found</p>
          <button
            onClick={() => router.back()}
            className="text-[#0A84FF] font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C1C1E] flex flex-col">
      <div className="h-12" />
      <header className="sticky top-12 z-20 bg-[#000] text-white px-4 py-3 flex items-center justify-between border-b border-[#3A3A3C]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-white/90 text-sm touch-manipulation"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <span className="text-sm font-medium truncate max-w-[45%]" title={template.name}>
          {template.name.length > 28 ? template.name.slice(0, 28) + "…" : template.name}
        </span>
        <button
          onClick={handleNext}
          className="text-[#FF6633] font-semibold text-sm py-1 px-3 touch-manipulation"
        >
          Next
        </button>
      </header>

      <div className="flex bg-[#2C2C2E] border-b border-[#3A3A3C]">
        <button
          onClick={() => setView("reader")}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            view === "reader" ? "text-white border-b-2 border-[#FF6633]" : "text-[#98989D]"
          }`}
        >
          Reader
        </button>
        <button
          onClick={() => setView("original")}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            view === "original" ? "text-white border-b-2 border-[#FF6633]" : "text-[#98989D]"
          }`}
        >
          Original
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-white min-h-[60vh]">
        {view === "original" ? (
          <iframe
            src={template.pdfUrl}
            title={template.name}
            className="w-full h-full min-h-[70vh] border-0"
          />
        ) : (
          <div className="p-6 text-[#333] max-w-[850px] mx-auto prose">
            <h1 className="text-2xl font-bold mb-4">{template.name}</h1>
            <p className="text-sm text-[#666] mb-6">
              Safety talk notes and discussion points. Review with your team before collecting signatures.
            </p>
            <section className="mb-6">
              <h2 className="text-lg font-bold mb-2">Summary</h2>
              <p className="text-sm leading-relaxed">
                This safety talk template covers key points for your team discussion. Ensure all field workers on this project have reviewed the material before signing.
              </p>
            </section>
            <section className="mb-6">
              <h2 className="text-lg font-bold mb-2">Discussion points</h2>
              <ul className="list-decimal list-inside text-sm space-y-2">
                <li>Review the main safety topics with the crew.</li>
                <li>Answer any questions before collecting signatures.</li>
                <li>Document attendance and sign-off.</li>
              </ul>
            </section>
            <p className="text-xs text-[#999] mt-8">
              Tap Next to collect signatures from field workers for this project.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
