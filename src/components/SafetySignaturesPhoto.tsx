"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Camera } from "lucide-react";

export function SafetySignaturesPhoto() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const talkId = searchParams.get("talk") || "";
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      router.push("/safety");
    }
  };

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
          <h1 className="text-white text-xl font-bold">Photo of sign-in sheet</h1>
        </div>
      </header>

      <div className="px-4 py-8">
        <p className="text-[#98989D] text-sm mb-6">
          Take a photo of the physical sign-in sheet to document signatures for this safety talk.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          className="hidden"
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full bg-[#2C2C2E] border-2 border-dashed border-[#3A3A3C] rounded-2xl p-12 flex flex-col items-center gap-4 active:bg-[#3A3A3C]"
        >
          <div className="w-20 h-20 rounded-full bg-[#34C759]/20 flex items-center justify-center">
            <Camera className="w-10 h-10 text-[#34C759]" />
          </div>
          <span className="text-white font-semibold">Take photo</span>
        </button>
      </div>
    </div>
  );
}
