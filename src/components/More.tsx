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
      {/* Status Bar Spacer */}
      <div className="h-12" />

      {/* Header */}
      <header className="px-4 py-6 mb-3">
        <h1 className="text-white text-3xl font-bold mb-2">More</h1>
        <div className="text-[#98989D] text-sm">Additional features and settings</div>
      </header>

      {/* Profile Section */}
      <div className="px-4 mb-6">
        <div className="bg-[#FF6633] rounded-2xl p-6 shadow-lg shadow-[#FF6633]/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <div className="text-white text-xl font-bold">{currentUser.name}</div>
              <div className="text-white/90 text-sm">{currentUser.role}</div>
              <div className="text-white/80 text-xs mt-1">{currentUser.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 mb-6 space-y-3">
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
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4 flex items-center gap-4 active:bg-[#3A3A3C] transition-colors disabled:opacity-70"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${item.color}20` }}
              >
                {isLoading ? (
                  <Spinner size="sm" className="border-t-transparent" style={{ color: item.color }} />
                ) : (
                  <Icon className="w-6 h-6" style={{ color: item.color }} aria-hidden="true" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-semibold">{item.name}</div>
                <div className="text-[#98989D] text-sm">{item.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sign Out Button */}
      <div className="px-4 mb-6">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full bg-[#2C2C2E] border border-[#FF453A] rounded-2xl p-4 flex items-center gap-4 active:bg-[#3A3A3C] transition-colors disabled:opacity-70"
        >
          <div className="w-12 h-12 bg-[#FF453A]/20 rounded-full flex items-center justify-center flex-shrink-0">
            {signingOut ? (
              <Spinner size="sm" className="border-[#FF453A] border-t-transparent" />
            ) : (
              <LogOut className="w-6 h-6 text-[#FF453A]" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1 text-left">
            <div className="text-[#FF453A] font-semibold">{signingOut ? 'Signing out...' : 'Sign Out'}</div>
            <div className="text-[#98989D] text-sm">Log out of your account</div>
          </div>
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="more" />
    </div>
  );
}