"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronLeft, ChevronRight, Calendar, Eye, PenTool } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Spinner } from './ui/spinner';
import { getDateKey, getSignedReport, getReportForDate } from '@/lib/dailyReportStorage';

export function Home() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState({
    name: 'North Valley Solar Farm',
  });
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const today = new Date();

  // Stable initial value (same on server + client) — localStorage synced after mount
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [mounted, setMounted] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);
  const [navigatingToRoute, setNavigatingToRoute] = useState<string | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const calendarScrollRef = useRef<HTMLDivElement>(null);

  // After mount: read localStorage and set the real selected date
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('selectedDate');
    if (saved) {
      const parsed = new Date(saved);
      if (!isNaN(parsed.getTime())) setSelectedDate(parsed);
    } else {
      localStorage.setItem('selectedDate', today.toISOString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const syncFromStorage = () => {
      const saved = localStorage.getItem('selectedDate');
      if (saved) {
        const parsed = new Date(saved);
        if (!isNaN(parsed.getTime()))
          setSelectedDate((prev) => (prev.getTime() === parsed.getTime() ? prev : parsed));
      }
    };
    window.addEventListener('visibilitychange', syncFromStorage);
    return () => window.removeEventListener('visibilitychange', syncFromStorage);
  }, [mounted]);

  const projects = [
    { name: 'North Valley Solar Farm' },
    { name: 'East Ridge Pipeline' },
    { name: 'Mountain View Substation' },
  ];

  const currentUser = {
    name: 'Ricky Smith',
    role: 'Field Supervisor',
  };

  // Get current date info
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const temperature = '72°F';
  const weatherCondition = 'Sunny';

  // Calendar logic
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const isToday = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentYear, currentMonth, day);
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentYear, currentMonth, day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (day: number | null) => {
    if (day) {
      const newDate = new Date(currentYear, currentMonth, day);
      setSelectedDate(newDate);
      // Save to localStorage
      localStorage.setItem('selectedDate', newDate.toISOString());
    }
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    setSelectedDate(newDate);
    // Save to localStorage
    localStorage.setItem('selectedDate', newDate.toISOString());
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    setSelectedDate(newDate);
    // Save to localStorage
    localStorage.setItem('selectedDate', newDate.toISOString());
  };

  // Returns the status of a given calendar day for indicator rendering
  type DayStatus = 'signed' | 'unsigned' | 'missing' | 'none';
  const getDayStatus = (day: number): DayStatus => {
    if (typeof window === 'undefined') return 'none';
    const date = new Date(currentYear, currentMonth, day);
    // No indicators for weekends (Sat = 6, Sun = 0)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'none';
    // Don't show indicators for future dates
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (date > todayStart) return 'none';
    const dateKey = getDateKey(date);
    const report = getReportForDate(date);
    const hasData = (
      report.notes.length > 0 ||
      report.chemicals.length > 0 ||
      report.metrics.length > 0 ||
      report.survey.length > 0 ||
      report.equipment.length > 0 ||
      report.attachments.length > 0
    );
    const isSigned = !!getSignedReport(dateKey);
    if (isSigned) return 'signed';
    if (hasData) return 'unsigned';
    return 'missing';
  };

  const primaryTasks = [
    {
      id: 'notes',
      name: 'Notes',
      route: '/notes-list',
      svg: (
        <svg width="100%" height="100%" viewBox="0 0 34 34" fill="none">
          {/* Sticky note body with folded corner */}
          <path d="M6 4h16l6 6v20a2 2 0 01-2 2H8a2 2 0 01-2-2V4z" fill="white" stroke="#E5E5EA" strokeWidth="0.5" />
          {/* Folded corner */}
          <path d="M22 4l6 6h-4a2 2 0 01-2-2V4z" fill="#FF6633" opacity="0.25" />
          {/* Writing lines */}
          <rect x="10" y="14" width="14" height="1.5" rx="0.75" fill="#C7C7CC" />
          <rect x="10" y="18" width="11" height="1.5" rx="0.75" fill="#C7C7CC" />
          <rect x="10" y="22" width="13" height="1.5" rx="0.75" fill="#E5E5EA" />
          {/* Orange pen/pencil accent line at top */}
          <rect x="10" y="9" width="9" height="2" rx="1" fill="#FF6633" />
        </svg>
      ),
    },
    {
      id: 'chemical',
      name: 'Chemicals',
      route: '/material-log',
      svg: (
        <svg width="100%" height="100%" viewBox="0 0 34 34" fill="none">
          <path d="M13 4h8v8l5 13a3 3 0 01-2.8 4H10.8A3 3 0 018 25L13 12V4z" fill="white" stroke="#E5E5EA" strokeWidth="0.5" />
          <path d="M13 16l-3 9a1.5 1.5 0 001.4 2h11.2a1.5 1.5 0 001.4-2l-3-9H13z" fill="#FF6633" opacity="0.85" />
          <rect x="11" y="4" width="12" height="3" rx="1.5" fill="#C7C7CC" />
        </svg>
      ),
    },
    {
      id: 'metrics',
      name: 'Metrics',
      route: '/submit/metrics',
      svg: (
        <svg width="100%" height="100%" viewBox="0 0 34 34" fill="none">
          {/* White dial face */}
          <circle cx="17" cy="19" r="13" fill="white" stroke="#E5E5EA" strokeWidth="0.75" />
          {/* Outer arc track (grey) — 210° from bottom-left to bottom-right */}
          <path d="M6.2 26.5 A12 12 0 1 1 27.8 26.5" stroke="#E5E5EA" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Orange filled arc — ~60% of range */}
          <path d="M6.2 26.5 A12 12 0 0 1 26 11.5" stroke="#FF6633" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
          {/* Centre hub */}
          <circle cx="17" cy="19" r="2" fill="#FF6633" />
          {/* Needle pointing ~60% (upper-right direction) */}
          <line x1="17" y1="19" x2="24" y2="10.5" stroke="#FF6633" strokeWidth="1.5" strokeLinecap="round" />
          {/* Tick marks */}
          <line x1="5.5" y1="19" x2="7" y2="19" stroke="#C7C7CC" strokeWidth="1" strokeLinecap="round" />
          <line x1="17" y1="7.5" x2="17" y2="9" stroke="#C7C7CC" strokeWidth="1" strokeLinecap="round" />
          <line x1="28.5" y1="19" x2="27" y2="19" stroke="#C7C7CC" strokeWidth="1" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'survey',
      name: 'Survey',
      route: '/submit/survey',
      svg: (
        <svg width="100%" height="100%" viewBox="0 0 34 34" fill="none">
          <rect x="6" y="4" width="22" height="26" rx="3" fill="white" stroke="#E5E5EA" strokeWidth="0.5" />
          <circle cx="11" cy="11" r="2" fill="#FF6633" />
          <rect x="16" y="9.5" width="8" height="2" rx="1" fill="#C7C7CC" />
          <circle cx="11" cy="17" r="2" fill="#FF6633" />
          <rect x="16" y="15.5" width="8" height="2" rx="1" fill="#C7C7CC" />
          <circle cx="11" cy="23" r="2" fill="#E5E5EA" />
          <rect x="16" y="21.5" width="8" height="2" rx="1" fill="#E5E5EA" />
        </svg>
      ),
    },
    {
      id: 'equipment',
      name: 'Equipment',
      route: '/checklist',
      svg: (
        <svg width="100%" height="100%" viewBox="0 0 34 34" fill="none">
          {/* Clipboard body */}
          <rect x="6" y="7" width="22" height="24" rx="3" fill="white" stroke="#E5E5EA" strokeWidth="0.5" />
          {/* Orange header bar */}
          <rect x="6" y="7" width="22" height="7" rx="3" fill="#FF6633" />
          <rect x="6" y="11" width="22" height="3" fill="#FF6633" />
          {/* Clip at top */}
          <rect x="12" y="4" width="10" height="5" rx="2" fill="#E5E5EA" stroke="#C7C7CC" strokeWidth="0.5" />
          {/* Row 1: checkbox + line */}
          <rect x="10" y="19" width="4" height="4" rx="1" fill="#FF6633" opacity="0.15" stroke="#FF6633" strokeWidth="1" />
          <path d="M11 21l1 1 2-2" stroke="#FF6633" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="16" y="20.5" width="8" height="1.5" rx="0.75" fill="#C7C7CC" />
          {/* Row 2: checkbox + line */}
          <rect x="10" y="25" width="4" height="4" rx="1" fill="white" stroke="#C7C7CC" strokeWidth="1" />
          <rect x="16" y="26.5" width="6" height="1.5" rx="0.75" fill="#E5E5EA" />
        </svg>
      ),
    },
    {
      id: 'attachments',
      name: 'Photos',
      route: '/attachments-list',
      svg: (
        <svg width="100%" height="100%" viewBox="0 0 34 34" fill="none">
          <rect x="3" y="9" width="28" height="20" rx="3" fill="white" stroke="#E5E5EA" strokeWidth="0.5" />
          <path d="M11 9V7a2 2 0 012-2h8a2 2 0 012 2v2" stroke="#C7C7CC" strokeWidth="1.5" />
          <circle cx="17" cy="19" r="5" fill="#FF6633" opacity="0.15" />
          <circle cx="17" cy="19" r="3.5" fill="#FF6633" />
          <circle cx="25" cy="13" r="2" fill="#FF6633" opacity="0.6" />
        </svg>
      ),
    },
    {
      id: 'safety',
      name: 'Safety',
      route: '/safety',
      svg: (
        <svg width="100%" height="100%" viewBox="0 0 34 34" fill="none">
          <path d="M17 3L6 8v9c0 7 5 13 11 15 6-2 11-8 11-15V8L17 3z" fill="white" stroke="#E5E5EA" strokeWidth="0.5" />
          <path d="M17 5L8 9.5v7.5c0 5.5 4 10 9 12 5-2 9-6.5 9-12V9.5L17 5z" fill="#FF6633" opacity="0.15" />
          <path d="M13 17l3 3 5-6" stroke="#FF6633" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'report',
      name: 'Report',
      route: '/report/preview',
      svg: (
        <svg width="100%" height="100%" viewBox="0 0 34 34" fill="none">
          {/* Document base */}
          <rect x="5" y="3" width="24" height="28" rx="3" fill="white" stroke="#E5E5EA" strokeWidth="0.5" />
          {/* Orange top header band */}
          <rect x="5" y="3" width="24" height="6" rx="3" fill="#FF6633" />
          <rect x="5" y="6" width="24" height="3" fill="#FF6633" />
          {/* Mini bar chart inside document */}
          <rect x="9" y="20" width="3" height="7" rx="1" fill="#FF6633" opacity="0.8" />
          <rect x="14" y="16" width="3" height="11" rx="1" fill="#FF6633" opacity="0.55" />
          <rect x="19" y="18" width="3" height="9" rx="1" fill="#FF6633" opacity="0.4" />
          <rect x="24" y="14" width="3" height="13" rx="1" fill="#FF6633" opacity="0.25" />
          {/* Base line */}
          <line x1="8" y1="27" x2="28" y2="27" stroke="#E5E5EA" strokeWidth="1" />
        </svg>
      ),
    },
  ];

  // Check if any data exists for the selected date (same key as report storage)
  const hasDataForSelectedDate = () => {
    if (typeof window === 'undefined') return false;
    const dateKey = getDateKey(selectedDate);
    const dataTypes = ['notes', 'chemicals', 'metrics', 'survey', 'equipment', 'attachments', 'material'];

    return dataTypes.some(type => {
      const key = `${type}_${dateKey}`;
      const data = localStorage.getItem(key);
      return data && data !== '[]' && data !== '{}';
    });
  };

  const hasData = hasDataForSelectedDate();

  const reportDateParam = getDateKey(selectedDate);
  const reportPreviewUrl = `/report/preview?date=${reportDateParam}`;
  const reportSignUrl = `/report/sign?date=${reportDateParam}`;
  const isSignedForSelectedDate = typeof window !== "undefined" && !!getSignedReport(reportDateParam);

  const handleAttachmentClick = () => {
    attachmentInputRef.current?.click();
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      console.log('Attachments uploaded:', files);
      // Handle file upload logic here
    }
  };

  const handleGenerateReport = () => {
    console.log('Generate report for date:', selectedDate);
    // Handle report generation logic here
  };

  useEffect(() => {
    const currentRef = calendarScrollRef.current;
    if (currentRef) {
      // Find the selected date button
      const buttons = currentRef.querySelectorAll('button');
      const selectedButton = Array.from(buttons).find(button => {
        const dateStr = selectedDate.toDateString();
        const buttonDate = new Date(selectedDate);
        buttonDate.setDate(selectedDate.getDate() - 10 + Array.from(buttons).indexOf(button));
        return buttonDate.toDateString() === dateStr;
      });

      if (selectedButton) {
        const buttonLeft = (selectedButton as HTMLElement).offsetLeft;
        const buttonWidth = (selectedButton as HTMLElement).offsetWidth;
        const containerWidth = currentRef.offsetWidth;
        const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        currentRef.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-20">
      {/* Status Bar Spacer */}
      <div className="h-10" />

      {/* Header */}
      <header className="px-4 py-3 mb-2">

        {/* Project Selector */}
        <div>
          <div className="text-[#98989D] text-xs uppercase tracking-wide font-semibold mb-1.5">Current Project</div>
          <button
            onClick={() => setShowProjectSelector(!showProjectSelector)}
            className="w-full bg-[#FF6633] rounded-2xl p-3.5 shadow-lg shadow-[#FF6633]/20 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-lg font-bold">{selectedProject.name}</h2>
              </div>
              <ChevronDown className={`w-5 h-5 text-white transition-transform ${showProjectSelector ? 'rotate-180' : ''}`} />
            </div>
          </button>
        </div>

        {/* Project Dropdown */}
        {showProjectSelector && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
              onClick={() => setShowProjectSelector(false)}
            />

            {/* Dropdown Menu */}
            <div className="relative z-40 mt-3 bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl overflow-hidden">
              {projects.map((project, index) => (
                <button
                  key={project.name}
                  onClick={() => {
                    setSelectedProject(project);
                    setShowProjectSelector(false);
                  }}
                  className={`w-full p-4 text-left hover:bg-[#3A3A3C] transition-colors ${index !== projects.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                    } ${selectedProject.name === project.name ? 'bg-[#3A3A3C]' : ''}`}
                >
                  <div className="text-white font-semibold">{project.name}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </header>

      {/* Daily Logs Calendar Section */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white text-xl font-bold">Daily logs</h3>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-10 h-10 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl flex items-center justify-center active:bg-[#3A3A3C]"
            aria-label="Toggle calendar"
          >
            <Calendar className="w-5 h-5 text-[#FF6633]" />
          </button>
        </div>
        <p className="text-[#FF6633] text-sm font-medium mb-2" aria-live="polite">
          Reporting for: {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
        </p>

        {/* Horizontal Scrollable Calendar */}
        <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-3">
          {/* Day Labels */}
          <div className="flex gap-6 overflow-x-auto scrollbar-hide" style={{ scrollBehavior: 'smooth' }} ref={calendarScrollRef}>
            {(() => {
              const dates = [];
              const start = new Date(selectedDate);
              start.setDate(start.getDate() - 10); // Show 10 days before

              for (let i = 0; i < 21; i++) {
                const date = new Date(start);
                date.setDate(start.getDate() + i);
                dates.push(date);
              }

              return dates.map((date, idx) => {
                const isSelectedDate = date.toDateString() === selectedDate.toDateString();
                const isTodayDate = date.toDateString() === today.toDateString();
                const isFutureDate = date > today;
                const dayLetter = date.toLocaleDateString('en-US', { weekday: 'short' })[0];
                const dayNum = date.getDate();

                return (
                  <button
                    key={`scroll-${idx}`}
                    onClick={() => {
                      if (!isFutureDate) {
                        const newDate = new Date(date);
                        setSelectedDate(newDate);
                        localStorage.setItem('selectedDate', newDate.toISOString());
                      }
                    }}
                    disabled={isFutureDate}
                    className="flex flex-col items-center gap-2 flex-shrink-0"
                  >
                    <div className={`text-xs font-medium ${isFutureDate ? 'text-[#48484A]' : 'text-[#98989D]'}`}>{dayLetter}</div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${isFutureDate
                      ? 'text-[#48484A] cursor-not-allowed'
                      : isSelectedDate
                        ? 'bg-[#0A84FF] text-white'
                        : isTodayDate
                          ? 'bg-[#0A84FF]/30 text-[#0A84FF]'
                          : 'text-white hover:bg-[#3A3A3C]'
                      }`}>
                      {dayNum}
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* Expanded Full Month Calendar */}
        {showCalendar && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setShowCalendar(false)}
            />

            {/* Calendar Modal */}
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="text-white font-semibold">{monthName}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="w-8 h-8 bg-[#1C1C1E] rounded-lg flex items-center justify-center active:bg-[#3A3A3C]"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="w-8 h-8 bg-[#1C1C1E] rounded-lg flex items-center justify-center active:bg-[#3A3A3C]"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {daysOfWeek.map((day, idx) => (
                  <div key={idx} className="text-center text-[#98989D] text-sm font-medium">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const status = day ? getDayStatus(day) : 'none';
                  return (
                    <button
                      key={`day-${index}`}
                      onClick={() => {
                        handleDateClick(day);
                        setShowCalendar(false);
                      }}
                      disabled={!day}
                      className={`flex flex-col items-center justify-start pt-1.5 pb-1 rounded-lg text-sm font-medium transition-colors h-12 ${!day
                        ? 'invisible'
                        : isSelected(day)
                          ? 'bg-[#FF6633] text-white'
                          : isToday(day)
                            ? 'bg-[#FF6633]/20 text-[#FF6633]'
                            : 'text-white hover:bg-[#3A3A3C]'
                        }`}
                    >
                      <span>{day}</span>
                      {/* Status indicator */}
                      <span className="mt-0.5 flex items-center justify-center h-2">
                        {status === 'signed' && (
                          // Green dot — report fully submitted
                          <span style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', background: '#30D158' }} />
                        )}
                        {status === 'unsigned' && (
                          // Yellow line — data exists, unsigned
                          <span style={{ display: 'block', width: 14, height: 2.5, borderRadius: 1.5, background: '#FFD60A' }} />
                        )}
                        {status === 'missing' && (
                          // Red triangle — no data logged
                          <svg width="7" height="6" viewBox="0 0 7 6">
                            <polygon points="3.5,0 7,6 0,6" fill="#FF453A" />
                          </svg>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Primary Tasks Grid — 3×3 */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-4">
          {primaryTasks.map((task) => {
            const isLoading = navigatingToRoute === task.route;
            return (
              <button
                key={task.id}
                onClick={() => {
                  setNavigatingToRoute(task.route);
                  router.push(task.route);
                }}
                disabled={!!navigatingToRoute}
                className="flex flex-col items-center gap-2.5 touch-manipulation focus:outline-none disabled:opacity-60"
                aria-label={task.name}
              >
                {/* Icon tile */}
                <div className="w-full aspect-square bg-[#2C2C2E] rounded-[22px] flex items-center justify-center border border-[#3A3A3C] active:scale-95 transition-transform"
                  style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.4)' }}
                >
                  {isLoading ? (
                    <Spinner size="lg" className="border-[#FF6633] border-t-transparent" />
                  ) : (
                    <div className="w-[65%] h-[65%] flex items-center justify-center">
                      {task.svg}
                    </div>
                  )}
                </div>
                {/* Label */}
                <span className="text-white text-[14px] font-semibold text-center leading-tight w-full">
                  {task.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>



      {/* Hidden File Input for Attachments */}
      <input
        ref={attachmentInputRef}
        type="file"
        accept="image/*,application/pdf,.doc,.docx"
        multiple
        onChange={handleAttachmentUpload}
        className="hidden"
      />

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
}