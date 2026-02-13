"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ClipboardList, Droplet, BarChart3, Wrench, Camera, ChevronDown, ChevronLeft, ChevronRight, Calendar, Eye, PenTool } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Spinner } from './ui/spinner';

export function Home() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState({
    name: 'North Valley Solar Farm',
  });
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const today = new Date();
  
  // Load selected date from localStorage or default to today
  const [selectedDate, setSelectedDate] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedDate = localStorage.getItem('selectedDate');
      if (savedDate) {
        return new Date(savedDate);
      }
    }
    return today;
  });
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [navigatingToRoute, setNavigatingToRoute] = useState<string | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const calendarScrollRef = useRef<HTMLDivElement>(null);

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

  const primaryTasks = [
    { 
      id: 'notes', 
      name: 'Notes', 
      icon: FileText, 
      route: '/notes-list',
      color: '#0A84FF',
    },
    { 
      id: 'chemical', 
      name: 'Chemicals', 
      icon: Droplet, 
      route: '/material-log',
      color: '#5856D6',
    },
    { 
      id: 'metrics', 
      name: 'Metrics', 
      icon: BarChart3, 
      route: '/submit/metrics',
      color: '#34C759',
      description: 'Water, Acres, Operators'
    },
    { 
      id: 'survey', 
      name: 'Survey', 
      icon: ClipboardList, 
      route: '/submit/survey',
      color: '#FF9F0A',
    },
    { 
      id: 'equipment', 
      name: 'Equipment', 
      icon: Wrench, 
      route: '/checklist',
      color: '#FF453A',
    },
    { 
      id: 'attachments', 
      name: 'Attachments', 
      icon: Camera, 
      route: '/attachments-list',
      color: '#8E8E93',
    },
  ];

  // Check if any data exists for the selected date
  const hasDataForSelectedDate = () => {
    if (typeof window === 'undefined') return false;
    const dateKey = selectedDate.toISOString().split('T')[0];
    const dataTypes = ['notes', 'chemicals', 'metrics', 'survey', 'equipment', 'attachments'];
    
    return dataTypes.some(type => {
      const key = `${type}_${dateKey}`;
      const data = localStorage.getItem(key);
      return data && data !== '[]' && data !== '{}';
    });
  };

  const hasData = hasDataForSelectedDate();

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
        {/* Welcome & Weather */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[#98989D] text-xs">Welcome back</div>
            <h1 className="text-white text-xl font-bold">{currentUser.name}</h1>
          </div>
          <div className="text-right">
            <div className="text-white text-xl font-semibold">{temperature}</div>
            <div className="text-[#98989D] text-xs">{weatherCondition}</div>
          </div>
        </div>

        {/* Project Selector */}
        <div>
          <div className="text-[#98989D] text-xs uppercase tracking-wide font-semibold mb-1.5">Current Project</div>
          <button
            onClick={() => setShowProjectSelector(!showProjectSelector)}
            className="w-full bg-gradient-to-br from-[#E85D2F] to-[#F17A4F] rounded-2xl p-3.5 shadow-lg shadow-[#E85D2F]/20 text-left"
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
                  className={`w-full p-4 text-left hover:bg-[#3A3A3C] transition-colors ${
                    index !== projects.length - 1 ? 'border-b border-[#3A3A3C]' : ''
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-xl font-bold">Daily logs</h3>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-10 h-10 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl flex items-center justify-center active:bg-[#3A3A3C]"
            aria-label="Toggle calendar"
          >
            <Calendar className="w-5 h-5 text-[#0A84FF]" />
          </button>
        </div>

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
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                      isFutureDate
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
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <button
                    key={`day-${index}`}
                    onClick={() => {
                      handleDateClick(day);
                      setShowCalendar(false);
                    }}
                    disabled={!day}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      !day 
                        ? 'invisible' 
                        : isSelected(day)
                        ? 'bg-[#0A84FF] text-white'
                        : isToday(day)
                        ? 'bg-[#0A84FF]/30 text-[#0A84FF]'
                        : 'text-white hover:bg-[#3A3A3C]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Primary Tasks Grid */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          {primaryTasks.map((task) => {
            const Icon = task.icon;
            const isAttachments = task.id === 'attachments';
            const isLoading = navigatingToRoute === task.route;
            return (
              <button
                key={task.id}
                onClick={() => {
                  setNavigatingToRoute(task.route);
                  router.push(task.route);
                }}
                disabled={!!navigatingToRoute}
                className={`bg-[#2C2C2E] border rounded-2xl p-5 flex flex-col items-center justify-center gap-3 active:bg-[#3A3A3C] transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#FF6633] min-h-[140px] disabled:opacity-70 ${
                  isAttachments ? 'border-2 border-[#3A3A3C]' : 'border border-[#3A3A3C]'
                }`}
                aria-label={task.name}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${task.color}20` }}
                >
                  {isLoading ? (
                    <Spinner size="lg" className="border-current border-t-transparent" style={{ color: task.color }} />
                  ) : (
                    <Icon className="w-8 h-8" style={{ color: task.color }} aria-hidden="true" />
                  )}
                </div>
                <div className="text-white font-semibold text-base text-center leading-tight">{task.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report CTAs */}
      <div className="px-4 mb-4 mt-6 flex gap-3">
        <button
          onClick={() => console.log('Preview report for date:', selectedDate)}
          className="flex-1 bg-transparent border-2 border-[#FF6633] text-[#FF6633] py-4 rounded-xl font-semibold text-base active:bg-[#FF6633]/10 transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-5 h-5" />
          Preview Report
        </button>
        <button
          onClick={() => console.log('Sign & submit report for date:', selectedDate)}
          className="flex-1 bg-[#FF6633] text-white py-4 rounded-xl font-semibold text-base active:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <PenTool className="w-5 h-5" />
          Sign & Submit
        </button>
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