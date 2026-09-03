import React from 'react';
import { 
  Flame, 
  Trophy, 
  Calendar, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Bookmark, 
  Brain, 
  Sparkles,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserStreakState } from '../types';

interface StreakAnalyticsViewProps {
  streakState: UserStreakState | null;
  onCheckInStreak: () => void;
}

export const StreakAnalyticsView: React.FC<StreakAnalyticsViewProps> = ({
  streakState,
  onCheckInStreak,
}) => {
  const handleCheckIn = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.4 },
      colors: ['#f97316', '#eab308', '#6366f1', '#10b981'],
    });
    onCheckInStreak();
  };

  const streakDays = streakState?.currentStreak || 37;
  const longest = streakState?.longestStreak || 45;
  const applications = streakState?.totalApplications || 12;
  const prepHours = streakState?.totalPrepHours || 18.5;

  // Generate 35 mock days for the streak matrix (5 weeks x 7 days)
  const heatmapDays = Array.from({ length: 35 }).map((_, i) => {
    const isCompleted = i > 3 && i !== 12 && i !== 23;
    const isToday = i === 34;
    return {
      dayIndex: i + 1,
      isCompleted,
      isToday,
      dateLabel: `Day ${i + 1}`,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-white to-amber-50 border border-orange-200 rounded-2xl p-6 relative overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
              <Flame className="h-9 w-9 fill-orange-500 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
                  {streakDays} Day Active Streak 🔥
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                  Level 4 Accelerator
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1 max-w-md">
                You've consistently logged applications, practiced mock questions, or analyzed skills for {streakDays} consecutive days!
              </p>
            </div>
          </div>

          <button
            onClick={handleCheckIn}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Zap className="h-4 w-4 fill-white" />
            <span>Check In Today's Streak</span>
          </button>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-semibold">Current Streak</span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">{streakDays} <span className="text-sm font-normal text-[#64748B]">Days</span></div>
          <span className="text-[10px] text-emerald-600 font-medium">Top 3% of builders</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-semibold">Longest Streak</span>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">{longest} <span className="text-sm font-normal text-[#64748B]">Days</span></div>
          <span className="text-[10px] text-[#64748B]">Personal Best record</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-semibold">Total Applications</span>
            <FileCheck className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">{applications} <span className="text-sm font-normal text-[#64748B]">Roles</span></div>
          <span className="text-[10px] text-indigo-600 font-medium">4 responses pending</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-semibold">AI Prep Hours</span>
            <Clock className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">{prepHours} <span className="text-sm font-normal text-[#64748B]">Hours</span></div>
          <span className="text-[10px] text-cyan-700 font-medium">Mock interviews & prep</span>
        </div>
      </div>

      {/* 30-Day Activity Heatmap */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              Streak Heatmap Matrix
            </h3>
            <p className="text-xs text-[#64748B]">35-day rolling consistency timeline</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
            <span>Inactive</span>
            <span className="h-3 w-3 rounded bg-[#F1F5F9] inline-block border border-[#E2E8F0]" />
            <span className="h-3 w-3 rounded bg-orange-500 inline-block" />
            <span>Active Day</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 gap-2">
          {heatmapDays.map((d) => (
            <div
              key={d.dayIndex}
              title={`${d.dateLabel}: ${d.isCompleted ? 'Completed streak activity' : 'Rest day'}`}
              className={`h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                d.isCompleted
                  ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#94A3B8]'
              } ${d.isToday ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white' : ''}`}
            >
              {d.dayIndex}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#0F172A] mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          Recent Streak Timeline
        </h3>
        <div className="space-y-2.5">
          {streakState?.recentActivity?.map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span className="text-[#1E293B] font-medium">{act.action}</span>
              </div>
              <span className="text-[10px] text-[#94A3B8]">{act.timestamp}</span>
            </div>
          )) || <p className="text-xs text-[#94A3B8]">No recent activity logged yet.</p>}
        </div>
      </div>

    </div>
  );
};
