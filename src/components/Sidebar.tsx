import React from 'react';
import { 
  Compass, 
  Bot, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Database, 
  Bookmark, 
  Sparkles, 
  Code2, 
  Briefcase, 
  Layers, 
  Palette, 
  ShieldCheck, 
  Flame, 
  Check, 
  Filter,
  Mail,
  Globe
} from 'lucide-react';
import { ViewMode, FilterState } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  filters: FilterState;
  onToggleTechnicalTrack: (enabled: boolean) => void;
  onToggleNonTechnicalTrack: (enabled: boolean) => void;
  onToggleDomain: (domainId: string) => void;
  onOpenEmailNotifications?: () => void;
  savedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  filters,
  onToggleTechnicalTrack,
  onToggleNonTechnicalTrack,
  onToggleDomain,
  onOpenEmailNotifications,
  savedCount,
}) => {
  const navItems: { id: ViewMode; label: string; icon: React.FC<{ className?: string }>; badge?: number | string }[] = [
    { id: 'feed', label: 'Daily Feed', icon: Compass },
    { id: 'api-explorer', label: 'API Hub & Sandbox', icon: Globe, badge: '7 Live' },
    { id: 'tutor', label: 'AI Tutor', icon: Bot, badge: 'Live' },
    { id: 'saved', label: 'My Events', icon: Calendar, badge: savedCount > 0 ? savedCount : undefined },
    { id: 'scanner', label: 'Resume Scanner', icon: FileText, badge: 'ATS AI' },
    { id: 'analytics', label: 'Streak Analytics', icon: TrendingUp },
    { id: 'schema', label: 'DB Schema & API', icon: Database },
  ];


  const technicalTags = [
    { id: 'ai-ml', label: 'AI/ML' },
    { id: 'web-dev', label: 'Web Dev' },
    { id: 'cloud-devops', label: 'Cloud / DevOps' },
    { id: 'cybersecurity', label: 'Cybersecurity' },
    { id: 'data-science', label: 'Data Science' },
  ];

  const nonTechnicalTags = [
    { id: 'product-mgmt', label: 'Product Mgmt' },
    { id: 'marketing-growth', label: 'Marketing' },
    { id: 'ui-ux-design', label: 'UI/UX Design' },
    { id: 'fintech-bizops', label: 'FinTech / Ops' },
    { id: 'community-devrel', label: 'Community DevRel' },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-white border-r border-[#E2E8F0] p-4 flex flex-col gap-6 select-none shadow-xs">
      
      {/* Primary Navigation Section */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2 px-2">
          Navigation
        </h3>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-[#64748B]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      typeof item.badge === 'number'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Interests Section - Clean Minimalism */}
      <div className="pt-4 border-t border-[#E2E8F0]">
        <div className="flex items-center justify-between px-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#334155]">
            Interests
          </span>
          <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
            Filters
          </span>
        </div>

        {/* TECHNICAL TRACK TOGGLE & CHIPS */}
        <div className="mb-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-cyan-600" />
              TECHNICAL
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.technicalEnabled}
                onChange={(e) => onToggleTechnicalTrack(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {technicalTags.map((tag) => {
              const isSelected = filters.selectedDomainIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  disabled={!filters.technicalEnabled}
                  onClick={() => onToggleDomain(tag.id)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all ${
                    !filters.technicalEnabled
                      ? 'opacity-40 bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent'
                      : isSelected
                      ? 'bg-cyan-50 text-cyan-700 font-semibold border border-cyan-300 shadow-xs'
                      : 'bg-white text-[#64748B] hover:bg-slate-50 hover:text-[#1E293B] border border-[#E2E8F0]'
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* NON-TECHNICAL TRACK TOGGLE & CHIPS */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-emerald-600" />
              NON-TECHNICAL
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.nonTechnicalEnabled}
                onChange={(e) => onToggleNonTechnicalTrack(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {nonTechnicalTags.map((tag) => {
              const isSelected = filters.selectedDomainIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  disabled={!filters.nonTechnicalEnabled}
                  onClick={() => onToggleDomain(tag.id)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all ${
                    !filters.nonTechnicalEnabled
                      ? 'opacity-40 bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent'
                      : isSelected
                      ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-300 shadow-xs'
                      : 'bg-white text-[#64748B] hover:bg-slate-50 hover:text-[#1E293B] border border-[#E2E8F0]'
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Email Alerts Trigger */}
      {onOpenEmailNotifications && (
        <button
          onClick={onOpenEmailNotifications}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-all shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-indigo-600" />
            <span>Email Alerts & Digest</span>
          </div>
          <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold">SMTP</span>
        </button>
      )}

      {/* Streak Pro Tip / Footer Card */}
      <div className="mt-auto p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs shadow-xs">
        <div className="flex items-center gap-1.5 text-indigo-700 font-semibold mb-1">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>AI Prep Tip</span>
        </div>
        <p className="text-[#475569] text-[11px] leading-relaxed">
          Hit "AI Tutor Prep" on any opportunity card to get 3 tailor-made interview questions and project ideas instantly.
        </p>
      </div>

    </aside>
  );
};
