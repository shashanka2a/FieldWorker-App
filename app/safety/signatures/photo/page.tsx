import { Suspense } from "react";
import { SafetySignaturesPhoto } from "@/components/SafetySignaturesPhoto";

export default function SafetySignaturesPhotoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center text-[#98989D]">Loading…</div>}>
      <SafetySignaturesPhoto />
    </Suspense>
  );
}
