"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, HardHat, Plus } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { getSafetyTalks, SafetyTalk } from "@/lib/safetyStorage";

type Tab = "upcoming" | "missed" | "completed";

function formatTalkDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTabForTalk(talk: SafetyTalk): Tab {
  if (talk.status === "conducted") return "completed";
  const [y, m, d] = talk.date.split("-").map(Number);
  const talkDate = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  talkDate.setHours(0, 0, 0, 0);
  if (talkDate < today) return "missed";
  return "upcoming";
}

export function SafetyList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [talks, setTalks] = useState<SafetyTalk[]>([]);

  const refreshTalks = useCallback(() => {
    setTalks(getSafetyTalks());
  }, []);

  useEffect(() => {
    refreshTalks();
  }, [refreshTalks]);

  useEffect(() => {
    const onFocus = () => refreshTalks();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshTalks]);

  const filteredTalks = talks
    .filter((talk) => getTabForTalk(talk) === activeTab)
    .filter((talk) =>
      talk.templateName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const hasTalks = filteredTalks.length > 0;

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-24">
      <div className="h-12" />
      <header className="px-4 py-4 mb-2">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center active:bg-[#3A3A3C] rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-[#0A84FF]" />
          </button>
          <h1 className="text-white text-2xl font-bold flex-1">Safety</h1>
        </div>

        <div className="bg-[#2C2C2E] rounded-xl flex items-center gap-2 px-3 py-2.5 mb-4">
          <span className="text-[#98989D]">🔍</span>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-[#98989D] outline-none text-base"
          />
        </div>

        <div className="flex gap-2">
          {(["upcoming", "missed", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors touch-manipulation ${
                activeTab === tab
                  ? "bg-[#3A3A3C] text-white"
                  : "bg-transparent text-[#98989D]"
              }`}
            >
              {tab === "completed" ? "Completed" : tab}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 flex-1">
        {hasTalks ? (
          <div className="space-y-3 pt-2">
            {filteredTalks.map((talk) => (
              <div
                key={talk.id}
                className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-[#FF6633]/20 flex items-center justify-center flex-shrink-0">
                  <HardHat className="w-5 h-5 text-[#FF6633]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate">
                    {talk.templateName}
                  </div>
                  <div className="text-[#98989D] text-sm mt-0.5">
                    {formatTalkDate(talk.date)}
                  </div>
                  <div className="text-[#98989D] text-xs mt-0.5">
                    {getTabForTalk(talk) === "upcoming"
                      ? "Upcoming"
                      : getTabForTalk(talk) === "missed"
                      ? "Missed"
                      : "Completed"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 rounded-full bg-[#8E8E93]/20 flex items-center justify-center mb-4">
              <HardHat className="w-12 h-12 text-[#8E8E93]" />
            </div>
            <h2 className="text-white text-xl font-semibold mb-2 text-center">
              No safety talks
            </h2>
            <p className="text-[#98989D] text-center max-w-sm">
              You currently have no safety talks. Start or schedule a talk by
              tapping the + button.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowActionSheet(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#FF6633] rounded-full shadow-lg shadow-[#FF6633]/30 flex items-center justify-center active:scale-95 transition-transform z-30"
        aria-label="Add safety talk"
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      {showActionSheet && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setShowActionSheet(false)}
            aria-hidden
          />
          <div className="fixed bottom-0 left-0 right-0 bg-[#2C2C2E] rounded-t-3xl p-4 pb-8 z-50 border-t border-[#3A3A3C]">
            <div className="w-10 h-1 bg-[#3A3A3C] rounded-full mx-auto mb-4" />
            <p className="text-[#98989D] text-sm px-1 mb-2">Create new</p>
            <button
              onClick={() => {
                setShowActionSheet(false);
                router.push("/safety/template?mode=start");
              }}
              className="w-full py-3.5 text-[#0A84FF] font-semibold text-left px-4 rounded-xl active:bg-[#3A3A3C] transition-colors"
            >
              Start talk
            </button>
            <button
              onClick={() => {
                setShowActionSheet(false);
                router.push("/safety/template?mode=schedule");
              }}
              className="w-full py-3.5 text-[#0A84FF] font-semibold text-left px-4 rounded-xl active:bg-[#3A3A3C] transition-colors"
            >
              Schedule talks
            </button>
            <button
              onClick={() => setShowActionSheet(false)}
              className="w-full py-3.5 text-[#0A84FF] font-semibold text-left px-4 rounded-xl active:bg-[#3A3A3C] transition-colors mt-2"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      <BottomNav activeTab="more" />
    </div>
  );
}
