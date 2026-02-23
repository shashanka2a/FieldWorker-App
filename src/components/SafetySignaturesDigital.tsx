"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const MOCK_WORKERS = [
  { id: "1", name: "Ricky Smith" },
  { id: "2", name: "Gavin Hall" },
  { id: "3", name: "Alex Rivera" },
];

export function SafetySignaturesDigital() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const talkId = searchParams.get("talk") || "";

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-24">
      <div className="h-12" />
      <header className="px-4 py-4 border-b border-[#3A3A3C]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center active:bg-[#3A3A3C] rounded-lg"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-[#0A84FF]" />
          </button>
          <h1 className="text-white text-xl font-bold">Collect signatures</h1>
        </div>
      </header>

      <div className="px-4 py-6">
        <p className="text-[#98989D] text-sm mb-4">
          Pass your device to each worker to sign. Signatures are collected for this project.
        </p>
        <div className="space-y-3">
          {MOCK_WORKERS.map((w) => (
            <div
              key={w.id}
              className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4 flex items-center justify-between"
            >
              <span className="text-white font-medium">{w.name}</span>
              <span className="text-[#98989D] text-sm">Not signed</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push("/safety")}
          className="w-full mt-6 bg-[#FF6633] text-white py-4 rounded-xl font-semibold active:opacity-90"
        >
          Done
        </button>
      </div>
    </div>
  );
}
