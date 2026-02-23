import { Suspense } from "react";
import { SafetyTemplatePicker } from "@/components/SafetyTemplatePicker";

export default function SafetyTemplatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center text-[#98989D]">Loading…</div>}>
      <SafetyTemplatePicker />
    </Suspense>
  );
}
