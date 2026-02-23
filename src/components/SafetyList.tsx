"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  HardHat,
  Plus,
  Play,
  CalendarClock,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
} from "lucide-react";
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

const TAB_CONFIG: {
  key: Tab;
  label: string;
  icon: React.ReactNode;
  activeColor: string;
  activeBg: string;
  badgeColor: string;
}[] = [
    {
      key: "upcoming",
      label: "Upcoming",
      icon: <Clock className="w-4 h-4" />,
      activeColor: "text-[#FF6633]",
      activeBg: "bg-[#FF6633]/15",
      badgeColor: "bg-[#FF6633]",
    },
    {
      key: "missed",
      label: "Missed",
      icon: <AlertTriangle className="w-4 h-4" />,
      activeColor: "text-[#FFD60A]",
      activeBg: "bg-[#FFD60A]/15",
      badgeColor: "bg-[#FFD60A]",
    },
    {
      key: "completed",
      label: "Done",
      icon: <CheckCircle2 className="w-4 h-4" />,
      activeColor: "text-[#30D158]",
      activeBg: "bg-[#30D158]/15",
      badgeColor: "bg-[#30D158]",
    },
  ];

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

  const countForTab = (tab: Tab) =>
    talks.filter((t) => getTabForTalk(t) === tab).length;

  const filteredTalks = talks
    .filter((talk) => getTabForTalk(talk) === activeTab)
    .filter((talk) =>
      talk.templateName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const hasTalks = filteredTalks.length > 0;
  const activeConfig = TAB_CONFIG.find((t) => t.key === activeTab)!;

  const statusColor = (tab: Tab) =>
    tab === "upcoming"
      ? "text-[#0A84FF] bg-[#0A84FF]/10"
      : tab === "missed"
        ? "text-[#FFD60A] bg-[#FFD60A]/10"
        : "text-[#30D158] bg-[#30D158]/10";

  const statusLabel = (tab: Tab) =>
    tab === "upcoming" ? "Upcoming" : tab === "missed" ? "Missed" : "Completed";

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-24">
      {/* Header */}
      <header className="bg-[#2C2C2E] border-b border-[#3A3A3C] px-4 pt-12 pb-3 sticky top-0 z-20 mb-1">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center active:bg-[#3A3A3C] rounded-xl transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-[#FF6633]" />
          </button>
          <h1 className="text-white text-2xl font-bold flex-1">Safety</h1>
        </div>

        {/* Search */}
        <div className="bg-[#2C2C2E] rounded-2xl flex items-center gap-2 px-3.5 py-3 mb-4 border border-[#3A3A3C]">
          <Search className="w-4 h-4 text-[#636366] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search safety talks…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-[#636366] outline-none text-[15px]"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {TAB_CONFIG.map((tab) => {
            const count = countForTab(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex-1 py-2.5 px-2 rounded-2xl text-sm font-semibold
                  flex items-center justify-center gap-1.5
                  transition-all duration-200 touch-manipulation relative overflow-hidden
                  ${isActive
                    ? `${tab.activeBg} ${tab.activeColor} border border-current/20`
                    : "bg-[#2C2C2E] text-white border border-transparent"}
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`
                      ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold
                      flex items-center justify-center text-white
                      ${isActive ? tab.badgeColor : "bg-[#636366]"}
                    `}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <div className="px-4 flex-1">
        {hasTalks ? (
          <div className="space-y-3 pt-1">
            {filteredTalks.map((talk) => {
              const tab = getTabForTalk(talk);
              const isEditable = tab === "upcoming" || tab === "missed";
              const isCompleted = tab === "completed";
              const isInteractive = isEditable || isCompleted;
              const CardEl = isInteractive ? "button" : "div";
              return (
                <CardEl
                  key={talk.id}
                  {...(isEditable
                    ? { onClick: () => router.push(`/safety/schedule?id=${talk.id}`) }
                    : isCompleted
                      ? { onClick: () => router.push(`/safety/read?template=${talk.templateId}&mode=start`) }
                      : {}
                  )}
                  className={`w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4 flex items-center gap-4 text-left transition-all ${isInteractive ? "active:scale-[0.98] active:bg-[#2C2C2E]/80" : ""
                    }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#FF6633]/15 flex items-center justify-center flex-shrink-0 border border-[#FF6633]/20">
                    <HardHat className="w-5 h-5 text-[#FF6633]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold truncate text-[15px]">
                      {talk.templateName}
                    </div>
                    <div className="text-[#8E8E93] text-sm mt-0.5">
                      {formatTalkDate(talk.date)}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusColor(tab)}`}
                  >
                    {statusLabel(tab)}
                  </span>
                  {isInteractive && (
                    <ChevronRight className="w-4 h-4 text-[#48484A] flex-shrink-0 ml-1" />
                  )}
                </CardEl>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 rounded-3xl bg-[#2C2C2E] border border-[#3A3A3C] flex items-center justify-center mb-5">
              <HardHat className="w-12 h-12 text-[#636366]" />
            </div>
            <h2 className="text-white text-xl font-semibold mb-2 text-center">
              No {activeTab} talks
            </h2>
            <p className="text-[#8E8E93] text-center text-sm max-w-xs leading-relaxed">
              {activeTab === "upcoming"
                ? "Schedule or start a safety talk using the + button below."
                : activeTab === "missed"
                  ? "Great work — no missed safety talks here."
                  : "Completed safety talks will appear here."}
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowActionSheet(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#FF6633] rounded-full shadow-lg shadow-[#FF6633]/40 flex items-center justify-center active:scale-95 transition-all z-30"
        aria-label="Add safety talk"
        style={{ boxShadow: "0 4px 24px rgba(255,102,51,0.45)" }}
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      {/* Action Sheet */}
      {showActionSheet && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
            onClick={() => setShowActionSheet(false)}
            aria-hidden
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] overflow-hidden"
            style={{ background: "linear-gradient(180deg, #2C2C2E 0%, #1C1C1E 100%)" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-[#48484A] rounded-full" />
            </div>

            {/* Title row */}
            <div className="flex items-center justify-between px-5 pb-4 pt-1">
              <div>
                <p className="text-white text-lg font-bold">Create New</p>
                <p className="text-[#8E8E93] text-sm">Choose an action</p>
              </div>
              <button
                onClick={() => setShowActionSheet(false)}
                className="w-9 h-9 rounded-full bg-[#3A3A3C] flex items-center justify-center active:bg-[#48484A] transition-colors"
              >
                <X className="w-4 h-4 text-[#8E8E93]" />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px mx-5 bg-[#3A3A3C]" />

            {/* Options */}
            <div className="px-4 py-3 space-y-2">
              {/* Start Talk */}
              <button
                onClick={() => {
                  setShowActionSheet(false);
                  router.push("/safety/template?mode=start");
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl active:bg-[#3A3A3C] transition-colors text-left group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FF6633]/15 border border-[#FF6633]/25 flex items-center justify-center flex-shrink-0 group-active:bg-[#FF6633]/25 transition-colors">
                  <Play className="w-5 h-5 text-[#FF6633]" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-[15px]">Start Talk Now</p>
                  <p className="text-[#8E8E93] text-sm mt-0.5">Begin a safety talk immediately</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-[#48484A] rotate-180 flex-shrink-0" />
              </button>

              {/* Schedule Talk */}
              <button
                onClick={() => {
                  setShowActionSheet(false);
                  router.push("/safety/template?mode=schedule");
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl active:bg-[#3A3A3C] transition-colors text-left group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0A84FF]/15 border border-[#0A84FF]/25 flex items-center justify-center flex-shrink-0 group-active:bg-[#0A84FF]/25 transition-colors">
                  <CalendarClock className="w-5 h-5 text-[#0A84FF]" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-[15px]">Schedule a Talk</p>
                  <p className="text-[#8E8E93] text-sm mt-0.5">Pick a date for a future talk</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-[#48484A] rotate-180 flex-shrink-0" />
              </button>
            </div>

            {/* Cancel */}
            <div className="px-4 pb-8 pt-1">
              <button
                onClick={() => setShowActionSheet(false)}
                className="w-full py-3.5 rounded-2xl bg-[#2C2C2E] border border-[#3A3A3C] text-[#8E8E93] font-semibold active:bg-[#3A3A3C] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      <BottomNav activeTab="more" />
    </div>
  );
}
