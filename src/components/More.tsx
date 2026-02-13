"use client";

import { FileText, Image, Briefcase, Settings, LogOut } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { useRouter } from 'next/navigation';

export function More() {
  const router = useRouter();

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
      color: '#0A84FF',
      description: 'View and generate reports',
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
    console.log('Sign out clicked');
    // Handle sign out logic here
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
        <div className="bg-gradient-to-br from-[#E85D2F] to-[#F17A4F] rounded-2xl p-6 shadow-lg shadow-[#E85D2F]/20">
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
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.route)}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4 flex items-center gap-4 active:bg-[#3A3A3C] transition-colors"
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <Icon className="w-6 h-6" style={{ color: item.color }} aria-hidden="true" />
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
          className="w-full bg-[#2C2C2E] border border-[#FF453A] rounded-2xl p-4 flex items-center gap-4 active:bg-[#3A3A3C] transition-colors"
        >
          <div className="w-12 h-12 bg-[#FF453A]/20 rounded-full flex items-center justify-center flex-shrink-0">
            <LogOut className="w-6 h-6 text-[#FF453A]" aria-hidden="true" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-[#FF453A] font-semibold">Sign Out</div>
            <div className="text-[#98989D] text-sm">Log out of your account</div>
          </div>
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="more" />
    </div>
  );
}