"use client";

import { 
  FileText, 
  CheckSquare, 
  Clock, 
  Package, 
  Wrench, 
  ClipboardList, 
  MessageSquare, 
  Users, 
  Eye, 
  AlertTriangle, 
  FileCheck, 
  FolderOpen, 
  Image, 
  BarChart3, 
  HardHat,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { BottomNav } from './BottomNav';
import { useRouter } from 'next/navigation';

interface Tool {
  id: string;
  name: string;
  icon: any;
  route: string;
  color: string;
}

export function Profile() {
  const router = useRouter();
  const currentProject = {
    name: 'North Valley Solar Farm',
    jobNumber: 'NVSF-2026-01',
  };

  const tools: Tool[] = [
    { id: 'daily-checklist', name: 'Daily Checklist', icon: FileText, route: '/checklist', color: '#FF6633' },
    { id: 'tasks', name: 'Tasks', icon: CheckSquare, route: '#', color: '#FF6633' },
    { id: 'time-cards', name: 'Time cards', icon: Clock, route: '#', color: '#FF6633' },
    { id: 'materials', name: 'Materials', icon: Package, route: '/material-log', color: '#FF6633' },
    { id: 'equipment', name: 'Equipment', icon: Wrench, route: '/submit/equipment', color: '#FF6633' },
    { id: 'checklists', name: 'Checklists', icon: ClipboardList, route: '#', color: '#FF6633' },
    { id: 'safety', name: 'Safety', icon: HardHat, route: '/safety', color: '#FF6633' },
    { id: 'directory', name: 'Directory', icon: Users, route: '#', color: '#FF6633' },
    { id: 'observations', name: 'Observations', icon: Eye, route: '#', color: '#FF6633' },
    { id: 'incidents', name: 'Incidents', icon: AlertTriangle, route: '/submit/incident', color: '#FF6633' },
    { id: 'forms', name: 'Forms', icon: FileCheck, route: '#', color: '#FF6633' },
    { id: 'documents', name: 'Documents', icon: FolderOpen, route: '#', color: '#FF6633' },
    { id: 'gallery', name: 'Gallery', icon: Image, route: '/gallery', color: '#FF6633' },
    { id: 'insights', name: 'Insights', icon: BarChart3, route: '#', color: '#FF6633' },
    { id: 'kiosk', name: 'Kiosk', icon: HardHat, route: '#', color: '#FF6633' },
  ];

  const handleToolClick = (route: string) => {
    if (route !== '#') {
      router.push(route);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-20">
      {/* Status Bar Spacer */}
      <div className="h-12" />

      {/* Header */}
      <header className="px-4 py-4 mb-2">
        <div className="flex items-center justify-between mb-6">
          <button className="text-[#0A84FF] text-base font-medium touch-manipulation">
            Switch
          </button>
          <h2 className="text-white text-base font-semibold">{currentProject.name}</h2>
          <button className="p-1 touch-manipulation" aria-label="More options">
            <MoreHorizontal className="w-6 h-6 text-white" />
          </button>
        </div>

        <h1 className="text-white text-3xl font-bold">Project tools</h1>
      </header>

      {/* Tools Grid */}
      <div className="px-4 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="grid grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.route)}
                className="flex flex-col items-center gap-3 touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#FF6633] rounded-2xl p-1"
                aria-label={tool.name}
              >
                <div className="w-[72px] h-[72px] bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl flex items-center justify-center">
                  <Icon className="w-8 h-8 text-[#FF6633]" aria-hidden="true" />
                </div>
                <span className="text-white text-sm text-center leading-tight">{tool.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="profile" />
    </div>
  );
}