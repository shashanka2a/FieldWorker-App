"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Smartphone, Camera } from "lucide-react";
import { getTemplateById } from "@/lib/safetyTemplates";

export function GetSignatures() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const talkId = searchParams.get("talk") || "";
  const mode = searchParams.get("mode") || "start";

  const template = talkId ? getTemplateById(talkId) : null;

  const handleDigitally = () => {
    router.push(`/safety/signatures/digital?talk=${talkId}&mode=${mode}`);
  };

  const handleTakePhoto = () => {
    router.push(`/safety/signatures/photo?talk=${talkId}&mode=${mode}`);
  };

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-20">
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
          <h1 className="text-white text-xl font-bold">Get signatures</h1>
        </div>
      </header>

      <div className="px-4 py-8">
        <p className="text-white text-lg font-medium mb-6">
          How would you like to collect signatures?
        </p>

        <div className="space-y-4">
          <button
            onClick={handleDigitally}
            className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4 flex items-center gap-4 text-left active:bg-[#3A3A3C] transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0A84FF]/20 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-[#0A84FF]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold">Digitally</div>
              <div className="text-[#98989D] text-sm mt-0.5">
                Select your workers and pass your device around to start collecting signatures.
              </div>
            </div>
            <span className="text-[#98989D]">›</span>
          </button>

          <button
            onClick={handleTakePhoto}
            className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4 flex items-center gap-4 text-left active:bg-[#3A3A3C] transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-[#34C759]/20 flex items-center justify-center flex-shrink-0">
              <Camera className="w-6 h-6 text-[#34C759]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold">Take A Photo</div>
              <div className="text-[#98989D] text-sm mt-0.5">
                Take a photo of your sign-in sheet to document signatures.
              </div>
            </div>
            <span className="text-[#98989D]">›</span>
          </button>
        </div>

        {template && (
          <p className="text-[#98989D] text-sm mt-6 text-center">
            Safety talk: {template.name}
          </p>
        )}
      </div>
    </div>
  );
}
