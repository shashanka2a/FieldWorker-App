"use client";

import { useState, useEffect } from 'react';
import { Home, Clock, MoreHorizontal } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Spinner } from './ui/spinner';

interface BottomNavProps {
  activeTab: string;
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  const handleNav = (path: string) => {
    if (pathname === path) return;
    setNavigatingTo(path);
    router.push(path);
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'activity', label: 'Activity', icon: Clock, path: '/activity' },
    { id: 'more', label: 'More', icon: MoreHorizontal, path: '/more' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-[#2C2C2E] border-t border-[#48484A] pb-safe"
      role="navigation"
      aria-label="Main navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-[72px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isLoading = navigatingTo === tab.path;

          return (
            <button
              key={tab.id}
              onClick={() => handleNav(tab.path)}
              disabled={!!navigatingTo}
              className={`flex flex-col items-center justify-center gap-1.5 flex-1 h-full touch-manipulation focus:outline-none disabled:opacity-70 transition-colors ${isActive ? 'text-[#0A84FF]' : 'text-[#AEAEB2]'
                }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isLoading ? (
                <Spinner size="sm" className="border-current border-t-transparent" />
              ) : (
                <Icon className="w-7 h-7" strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
              )}
              <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}