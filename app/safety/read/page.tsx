import { Suspense } from "react";
import { SafetyTalkReader } from "@/components/SafetyTalkReader";

export default function SafetyReadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center text-[#98989D]">Loading…</div>}>
      <SafetyTalkReader />
    </Suspense>
  );
}
