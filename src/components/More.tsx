"use client";

import { useState, useEffect } from 'react';
import { FileText, Image, Briefcase, Settings, LogOut } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { useRouter, usePathname } from 'next/navigation';
import { Spinner } from './ui/spinner';

export function More() {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  const currentUser = {
    name: 'Ricky Smith',
    role: 'Field Supervisor',
    email: 'ricky.smith@utilityvision.com',
  };

  const menuItems = [
    {
      id: 'reports',
      name: 'Reports',
      icon: FileText,
      route: '/reports',
      color: '#FF6633',
      description: 'View submitted reports',
    },
    {
      id: 'gallery',
      name: 'Gallery',
      icon: Image,
      route: '/gallery',
      color: '#FF9F0A',
      description: 'Photos and documents',
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: Briefcase,
      route: '/projects',
      color: '#5856D6',
      description: 'Manage your projects',
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      route: '/settings',
      color: '#34C759',
      description: 'App preferences',
    },
  ];

  const handleSignOut = () => {
    setSigningOut(true);
    console.log('Sign out clicked');
    // Handle sign out logic here - e.g. await signOut(); router.push('/login');
    setTimeout(() => setSigningOut(false), 800);
  };

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-20">
      {/* Header */}
      <header className="bg-[#2C2C2E] border-b border-[#3A3A3C] px-4 py-3 sticky top-0 z-20">
        <h1 className="text-white text-lg font-bold">More</h1>
      </header>

      {/* Profile Section */}
      <div className="px-4 mt-3 mb-3">
        <div className="bg-[#FF6633] rounded-xl p-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-base font-bold">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-white text-base font-bold leading-tight">{currentUser.name}</div>
              <div className="text-white/85 text-xs">{currentUser.role} · {currentUser.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 mb-3 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isLoading = navigatingTo === item.route;
          return (
            <button
              key={item.id}
              onClick={() => {
                setNavigatingTo(item.route);
                router.push(item.route);
              }}
              disabled={!!navigatingTo}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-3 flex items-center gap-3 active:bg-[#3A3A3C] transition-colors disabled:opacity-70"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${item.color}20` }}
              >
                {isLoading ? (
                  <Spinner size="sm" className="border-t-transparent" style={{ color: item.color }} />
                ) : (
                  <Icon className="w-5 h-5" style={{ color: item.color }} aria-hidden="true" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-semibold text-sm">{item.name}</div>
                <div className="text-[#98989D] text-xs">{item.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sign Out Button */}
      <div className="px-4">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full bg-[#2C2C2E] border border-[#FF453A]/40 rounded-xl p-3 flex items-center gap-3 active:bg-[#3A3A3C] transition-colors disabled:opacity-70"
        >
          <div className="w-10 h-10 bg-[#FF453A]/15 rounded-xl flex items-center justify-center flex-shrink-0">
            {signingOut ? (
              <Spinner size="sm" className="border-[#FF453A] border-t-transparent" />
            ) : (
              <LogOut className="w-5 h-5 text-[#FF453A]" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1 text-left">
            <div className="text-[#FF453A] font-semibold text-sm">{signingOut ? 'Signing out...' : 'Sign Out'}</div>
            <div className="text-[#98989D] text-xs">Log out of your account</div>
          </div>
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="more" />
    </div>
  );
}