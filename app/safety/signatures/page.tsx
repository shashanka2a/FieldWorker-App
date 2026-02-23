"use client";

import { Suspense } from "react";
import { GetSignatures } from "@/components/GetSignatures";

export default function SafetySignaturesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center text-[#98989D]">Loading…</div>}>
      <GetSignatures />
    </Suspense>
  );
}
