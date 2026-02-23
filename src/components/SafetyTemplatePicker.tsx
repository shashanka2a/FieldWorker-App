"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText, Search } from "lucide-react";
import { SAFETY_TEMPLATES } from "@/lib/safetyTemplates";

export function SafetyTemplatePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "start";
  const [search, setSearch] = useState("");

  const filtered = SAFETY_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const handleSelect = (templateId: string) => {
    if (mode === "schedule") {
      router.push(`/safety/schedule?template=${templateId}`);
    } else {
      router.push(`/safety/read?template=${templateId}&mode=${mode}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-20">
      <header className="px-4 pt-12 pb-4 border-b border-[#3A3A3C] sticky top-0 bg-[#1C1C1E] z-10">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center active:bg-[#3A3A3C] rounded-lg"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-[#0A84FF]" />
          </button>
          <h1 className="text-white text-xl font-bold flex-1">
            Choose template
          </h1>
        </div>
        <p className="text-[#98989D] text-sm mb-3">
          Select a safety talk PDF to {mode === "schedule" ? "schedule" : "start"}.
        </p>
        <div className="bg-[#2C2C2E] rounded-xl flex items-center gap-2 px-3 py-2.5">
          <Search className="w-4 h-4 text-[#98989D] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search templates"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-[#98989D] outline-none"
          />
        </div>
      </header>

      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-[#98989D] text-center py-12">No templates match your search.</div>
        ) : (
          filtered.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelect(template.id)}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4 flex items-center gap-4 text-left active:bg-[#3A3A3C] transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FF6633]/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-[#FF6633]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold">{template.name}</div>
                {template.description && (
                  <div className="text-[#98989D] text-sm mt-0.5">{template.description}</div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-[#98989D] flex-shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
