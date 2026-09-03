import React, { useState, useRef, useEffect } from 'react';
import { 
  Flame, 
  MapPin, 
  FileText, 
  Bot, 
  ChevronDown, 
  Mail, 
  LocateFixed,
  User,
  LogOut,
  RotateCcw,
  UserPlus,
  Zap,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserStreakState, UserProfile } from '../types';

interface HeaderProps {
  streakState: UserStreakState | null;
  currentUser?: UserProfile | null;
  onCheckInStreak: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  onResetStreak?: () => void;
  onSwitchDemo?: () => void;
  selectedLocation: string;
  onChangeLocation: (loc: string) => void;
  selectedFormat: string;
  onChangeFormat: (format: string) => void;
  selectedRadius: number;
  onChangeRadius: (radius: number) => void;
  onOpenResumeScanner: () => void;
  onOpenAITutor: () => void;
  onOpenEmailNotifications?: () => void;
  onOpenLocationModal?: () => void;
  isLiveTracking?: boolean;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  streakState,
  currentUser,
  onCheckInStreak,
  onOpenAuth,
  onLogout,
  onResetStreak,
  onSwitchDemo,
  selectedLocation,
  onChangeLocation,
  selectedFormat,
  onChangeFormat,
  selectedRadius,
  onChangeRadius,
  onOpenResumeScanner,
  onOpenAITutor,
  onOpenEmailNotifications,
  onOpenLocationModal,
  isLiveTracking = false,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStreakClick = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.2 },
      colors: ['#f97316', '#eab308', '#6366f1', '#3b82f6'],
    });
    onCheckInStreak();
  };

  const streakDays = streakState?.currentStreak ?? (currentUser?.streakState?.currentStreak ?? 0);
  const goalCompleted = streakState?.daysCompletedThisWeek ?? (currentUser?.streakState?.daysCompletedThisWeek ?? 0);
  const goalTarget = streakState?.weeklyGoalDays ?? (currentUser?.streakState?.weeklyGoalDays ?? 5);
  const progressPercent = Math.min(100, Math.round((goalCompleted / Math.max(goalTarget, 1)) * 100));

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ME';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Brand Identity & Location Focus */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white shadow-xs flex items-center justify-center font-bold text-lg">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-[#0F172A] tracking-tight">
                  NextGen <span className="text-indigo-600 font-semibold">Portal</span>
                </span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  AI Hub
                </span>
              </div>
              <p className="text-xs text-[#64748B] hidden sm:flex items-center gap-1">
                <span>Near</span>
                <button
                  onClick={onOpenLocationModal}
                  className="text-indigo-600 font-semibold hover:underline flex items-center gap-0.5 text-left truncate max-w-[200px]"
                  title="Click to change live location"
                >
                  <span className="truncate">{selectedLocation}</span>
                  {isLiveTracking && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  )}
                </button>
              </p>
            </div>
          </div>

          {/* Quick Location & Live GPS Popover Trigger */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 py-1 text-xs text-[#475569]">
            {/* Live GPS Button */}
            {onOpenLocationModal && (
              <button
                onClick={onOpenLocationModal}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors cursor-pointer border border-indigo-100"
                title="Detect Live Location via GPS API"
              >
                <LocateFixed className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                <span className="hidden sm:inline">Live GPS</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-1.5 text-[#64748B]">
              <MapPin className="h-3.5 w-3.5 text-indigo-600" />
            </div>

            <select
              value={selectedLocation}
              onChange={(e) => onChangeLocation(e.target.value)}
              className="bg-transparent text-indigo-700 font-semibold focus:outline-none cursor-pointer pr-1 text-xs max-w-[140px] sm:max-w-[190px] truncate"
            >
              <optgroup label="🇮🇳 India - Tech Hubs">
                <option value="Bengaluru, Karnataka" className="bg-white text-[#1E293B]">Bengaluru, KA (Silicon Valley)</option>
                <option value="Hyderabad, Telangana" className="bg-white text-[#1E293B]">Hyderabad, TS (HITEC City)</option>
                <option value="Pune, Maharashtra" className="bg-white text-[#1E293B]">Pune, MH</option>
                <option value="Delhi NCR" className="bg-white text-[#1E293B]">Delhi NCR (Gurgaon/Noida)</option>
                <option value="Mumbai, Maharashtra" className="bg-white text-[#1E293B]">Mumbai, MH (FinTech)</option>
                <option value="Chennai, Tamil Nadu" className="bg-white text-[#1E293B]">Chennai, TN (SaaS)</option>
                <option value="Kolkata, West Bengal" className="bg-white text-[#1E293B]">Kolkata, WB</option>
                <option value="Ahmedabad, Gujarat" className="bg-white text-[#1E293B]">Ahmedabad / GIFT City</option>
                <option value="Kochi, Kerala" className="bg-white text-[#1E293B]">Kochi, KL (Infopark)</option>
                <option value="India (Pan-India)" className="bg-white text-[#1E293B]">🇮🇳 All Across India</option>
              </optgroup>
              <optgroup label="🌍 Global & Remote">
                <option value="Remote (Worldwide)" className="bg-white text-[#1E293B]">Remote (India & Global)</option>
                <option value="San Francisco, CA" className="bg-white text-[#1E293B]">San Francisco, CA</option>
                <option value="San Jose, CA" className="bg-white text-[#1E293B]">San Jose / Silicon Valley</option>
                <option value="New York, NY" className="bg-white text-[#1E293B]">New York, NY</option>
                <option value="Seattle, WA" className="bg-white text-[#1E293B]">Seattle, WA</option>
                <option value="Anywhere" className="bg-white text-[#1E293B]">Anywhere / Worldwide</option>
              </optgroup>
            </select>

            <span className="text-[#CBD5E1] hidden sm:inline">|</span>

            <div className="hidden sm:flex items-center gap-1 text-[#64748B]">
              <span>Format:</span>
              <select
                value={selectedFormat}
                onChange={(e) => onChangeFormat(e.target.value)}
                className="bg-transparent text-[#334155] font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value="all" className="bg-white text-[#1E293B]">All</option>
                <option value="in-person" className="bg-white text-[#1E293B]">In-Person</option>
                <option value="remote" className="bg-white text-[#1E293B]">Remote</option>
                <option value="hybrid" className="bg-white text-[#1E293B]">Hybrid</option>
              </select>
            </div>

            <span className="text-[#CBD5E1] hidden md:inline">|</span>

            <div className="hidden md:flex items-center gap-1 text-[#64748B]">
              <span>Radius:</span>
              <select
                value={selectedRadius}
                onChange={(e) => onChangeRadius(Number(e.target.value))}
                className="bg-transparent text-[#334155] font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value={15} className="bg-white text-[#1E293B]">15 mi (~25km)</option>
                <option value={25} className="bg-white text-[#1E293B]">25 mi (~40km)</option>
                <option value={50} className="bg-white text-[#1E293B]">50 mi (~80km)</option>
                <option value={100} className="bg-white text-[#1E293B]">Pan-India / Any</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Daily Streak Counter & AI Action Launchers & User Account */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          
          {/* Email Alerts Modal Button */}
          {onOpenEmailNotifications && (
            <button
              onClick={onOpenEmailNotifications}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-indigo-50 text-[#334155] hover:text-indigo-700 border border-[#E2E8F0] hover:border-indigo-200 text-xs font-semibold transition-all shadow-xs"
              title="Email Notifications & Deadline Alerts"
            >
              <Mail className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Email Alerts</span>
            </button>
          )}

          {/* Daily Streak Widget */}
          <button
            onClick={handleStreakClick}
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 hover:border-orange-300 rounded-xl px-2.5 py-1.5 transition-all shadow-xs hover:shadow-sm text-left cursor-pointer"
            title="Click to check-in your daily streak & celebrate progress!"
          >
            <div className="h-7 w-7 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 group-hover:scale-105 transition-transform">
              <Flame className="h-4 w-4 text-orange-600 fill-orange-500" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-[#334155]">
                  <strong className="text-orange-600 font-bold">{streakDays}d 🔥</strong>
                  {streakDays === 0 && (
                    <span className="text-[10px] text-orange-700 ml-1 font-normal">(Start Today)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-12 h-1 bg-orange-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[9px] text-orange-700 font-mono font-medium">{goalCompleted}/{goalTarget}d</span>
              </div>
            </div>
          </button>

          {/* Quick AI Action: ATS Resume Scanner */}
          <button
            onClick={onOpenResumeScanner}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#334155] border border-[#E2E8F0] hover:border-indigo-200 text-xs font-semibold transition-all shadow-xs group cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-600 group-hover:text-indigo-700" />
            <span className="hidden sm:inline">Resume Matcher</span>
          </button>

          {/* Quick AI Action: AI Tutor Chat */}
          <button
            onClick={onOpenAITutor}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow-sm text-xs font-semibold transition-all group cursor-pointer"
          >
            <Bot className="h-3.5 w-3.5 text-indigo-100 group-hover:scale-105 transition-transform" />
            <span>AI Tutor</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          </button>

          {/* User Account Controls */}
          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title="Account Menu"
              >
                <div className="h-6 w-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {initials}
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-xs font-semibold text-slate-800 block leading-tight max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-orange-600 font-bold block leading-none">
                    {streakDays}d Streak
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between bg-orange-50/80 border border-orange-200/80 rounded-lg px-2.5 py-1 text-xs">
                      <span className="text-orange-900 text-[11px] font-medium">Daily Streak:</span>
                      <span className="font-bold text-orange-600">{streakDays} Days 🔥</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAuth('signup');
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Create New Account (0d Streak)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAuth('login');
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span>Switch Account / Sign In</span>
                    </button>

                    {onResetStreak && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onResetStreak();
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-orange-500" />
                        <span>Reset My Streak to 0</span>
                      </button>
                    )}

                    {onSwitchDemo && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSwitchDemo();
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        <span>Switch to Demo (37d streak)</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>Create Account</span>
                <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.2 rounded-full font-bold">0d</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
