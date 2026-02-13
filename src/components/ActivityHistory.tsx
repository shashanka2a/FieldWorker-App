"use client";

import { useState } from 'react';
import { BottomNav } from './BottomNav';
import { FileText, Droplet, Wrench, BarChart3, ClipboardList, CheckCircle2, Clock, Filter } from 'lucide-react';

interface Activity {
  id: string;
  type: 'notes' | 'chemical' | 'equipment' | 'metrics' | 'survey';
  title: string;
  timestamp: string;
  status: 'synced' | 'pending';
  project: string;
}

export function ActivityHistory() {
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

  // Load activities from localStorage dynamically
  const activities: Activity[] = [];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'notes': return FileText;
      case 'chemical': return Droplet;
      case 'equipment': return Wrench;
      case 'metrics': return BarChart3;
      case 'survey': return ClipboardList;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    // Use consistent blue for all activity types
    return '#0A84FF';
  };

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-20">
      {/* Status Bar Spacer */}
      <div className="h-12" />

      {/* Header */}
      <header className="px-4 py-4 mb-6 border-b border-[#3A3A3C] sticky top-0 bg-[#1C1C1E] z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-2xl font-bold">Activity</h1>
          <button className="w-10 h-10 bg-[#2C2C2E] rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-[#FF6633] text-white'
                : 'bg-[#2C2C2E] text-[#98989D]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === 'today'
                ? 'bg-[#FF6633] text-white'
                : 'bg-[#2C2C2E] text-[#98989D]'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === 'week'
                ? 'bg-[#FF6633] text-white'
                : 'bg-[#2C2C2E] text-[#98989D]'
            }`}
          >
            This Week
          </button>
        </div>
      </header>

      {/* Activity List */}
      <div className="px-4 space-y-3 pb-6">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-[#2C2C2E] rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="w-10 h-10 text-[#98989D]" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">No Activity Yet</h3>
            <p className="text-[#98989D] text-center text-sm">
              Your submitted logs and reports will appear here
            </p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const color = getActivityColor(activity.type);
            
            return (
              <div
                key={activity.id}
                className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4 active:bg-[#3A3A3C] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-white font-semibold">{activity.title}</h3>
                      {activity.status === 'synced' ? (
                        <CheckCircle2 className="w-5 h-5 text-[#34C759] flex-shrink-0" />
                      ) : (
                        <Clock className="w-5 h-5 text-[#FF9F0A] flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="text-[#98989D] text-sm mb-1">{activity.project}</div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[#98989D] text-xs">{activity.timestamp}</span>
                      <span className="text-[#3A3A3C]">•</span>
                      <span className={`text-xs font-semibold ${
                        activity.status === 'synced' ? 'text-[#34C759]' : 'text-[#FF9F0A]'
                      }`}>
                        {activity.status === 'synced' ? 'Synced' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="activity" />
    </div>
  );
}