import React, { useState } from 'react';
import { 
  Flame, 
  Bot, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Building2, 
  Trophy, 
  Clock, 
  Users,
  CheckCircle2,
  ChevronDown,
  Bookmark,
  Check,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Opportunity, OpportunityStatus } from '../types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onToggleSave: (id: string) => void;
  onUpdateStatus?: (id: string, status: OpportunityStatus) => void;
  onOpenAITutorPrep: (opportunity: Opportunity) => void;
  onSelectDetails: (opportunity: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onToggleSave,
  onUpdateStatus,
  onOpenAITutorPrep,
  onSelectDetails,
}) => {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const isTech = opportunity.category === 'technical';
  const isHackathon = opportunity.type === 'hackathon';
  const currentStatus: OpportunityStatus = opportunity.status || 'None';

  const handleStreakClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!opportunity.isSaved) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f97316', '#eab308', '#6366f1'],
      });
    }
    onToggleSave(opportunity.id);
  };

  const handleStatusSelect = (e: React.MouseEvent, status: OpportunityStatus) => {
    e.stopPropagation();
    setIsStatusDropdownOpen(false);
    if (status === 'Accepted') {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
      });
    } else if (status === 'Applied') {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#6366f1'],
      });
    }
    if (onUpdateStatus) {
      onUpdateStatus(opportunity.id, status);
    }
  };

  const handleTutorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenAITutorPrep(opportunity);
  };

  const formatBadge = () => {
    if (opportunity.format === 'remote') return 'REMOTE';
    if (opportunity.format === 'hybrid') return `${opportunity.location.split(',')[0].toUpperCase()} / HYBRID`;
    return `${opportunity.location.split(',')[0].toUpperCase()} / IN-PERSON`;
  };

  const getStatusBadgeStyle = (status: OpportunityStatus) => {
    switch (status) {
      case 'Interested':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
      case 'Applied':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'Accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold hover:bg-emerald-100';
      default:
        return 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-slate-100';
    }
  };

  return (
    <div 
      onClick={() => onSelectDetails(opportunity)}
      className={`bg-white border rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-md group cursor-pointer relative overflow-visible ${
        currentStatus === 'Accepted'
          ? 'border-emerald-300 ring-1 ring-emerald-200 bg-linear-to-r from-emerald-50/20 to-transparent'
          : currentStatus === 'Applied'
          ? 'border-blue-200'
          : 'border-[#E2E8F0] hover:border-indigo-300'
      }`}
    >
      {/* Top Banner Row: Title + Badges + Status Tracker Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {/* TECHNICAL / NON-TECHNICAL Pill */}
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wider ${
                isTech
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {isTech ? 'TECHNICAL' : 'NON-TECHNICAL'}
            </span>

            {/* HACKATHON / INTERNSHIP Pill */}
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wider ${
                isHackathon
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isHackathon ? 'HACKATHON' : 'INTERNSHIP'}
            </span>

            {/* Location / Format Pill */}
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
              {formatBadge()}
            </span>

            {/* Live API / Platform Source Badge */}
            {opportunity.source && (
              <span
                className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
                title={`Synced live via ${opportunity.source}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {opportunity.source}
              </span>
            )}

            {opportunity.isHot && (
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-200 flex items-center gap-1">
                <Flame className="h-3 w-3 fill-orange-500" />
                HOT
              </span>
            )}

            {/* Application Status Pill Indicator */}
            {currentStatus !== 'None' && (
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                  currentStatus === 'Accepted'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : currentStatus === 'Applied'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}
              >
                {currentStatus === 'Accepted' && <Trophy className="h-3 w-3 text-emerald-600" />}
                {currentStatus === 'Applied' && <CheckCircle2 className="h-3 w-3 text-blue-600" />}
                {currentStatus === 'Interested' && <Bookmark className="h-3 w-3 text-purple-600" />}
                Status: {currentStatus}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-indigo-600 transition-colors">
            {opportunity.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-[#334155] font-medium">
              <Building2 className="h-3.5 w-3.5 text-[#94A3B8]" />
              {opportunity.companyOrHost}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#94A3B8]" />
              {opportunity.location}
            </span>
            {opportunity.distanceKm !== undefined && (
              <>
                <span>•</span>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                  ~{opportunity.distanceKm} km away
                </span>
              </>
            )}
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold font-mono">
              {isHackathon ? <Trophy className="h-3 w-3 text-emerald-600" /> : <DollarSign className="h-3 w-3 text-emerald-600" />}
              {opportunity.stipendOrPrize}
            </span>
          </div>
        </div>

        {/* Top Right: Countdown & Status Tracker Button */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
          
          {/* Status Tracker Dropdown Control */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsStatusDropdownOpen(!isStatusDropdownOpen);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${getStatusBadgeStyle(currentStatus)}`}
              title="Track Application Status"
            >
              {currentStatus === 'Accepted' && <Award className="h-3.5 w-3.5 text-emerald-600" />}
              {currentStatus === 'Applied' && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />}
              {currentStatus === 'Interested' && <Bookmark className="h-3.5 w-3.5 text-purple-600" />}
              {currentStatus === 'None' && <span className="text-[#94A3B8]">•</span>}
              <span>{currentStatus === 'None' ? 'Track Status' : currentStatus}</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>

            {/* Status Dropdown Menu */}
            {isStatusDropdownOpen && (
              <div 
                className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-30 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-[#94A3B8] tracking-wider border-b border-[#F1F5F9] mb-1">
                  Update Status
                </div>

                <button
                  onClick={(e) => handleStatusSelect(e, 'Interested')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    currentStatus === 'Interested' ? 'bg-purple-50 text-purple-700' : 'text-[#334155] hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="h-3.5 w-3.5 text-purple-600" />
                    Interested
                  </span>
                  {currentStatus === 'Interested' && <Check className="h-3.5 w-3.5 text-purple-600" />}
                </button>

                <button
                  onClick={(e) => handleStatusSelect(e, 'Applied')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    currentStatus === 'Applied' ? 'bg-blue-50 text-blue-700' : 'text-[#334155] hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                    Applied
                  </span>
                  {currentStatus === 'Applied' && <Check className="h-3.5 w-3.5 text-blue-600" />}
                </button>

                <button
                  onClick={(e) => handleStatusSelect(e, 'Accepted')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    currentStatus === 'Accepted' ? 'bg-emerald-50 text-emerald-700' : 'text-[#334155] hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-emerald-600" />
                    Accepted 🎉
                  </span>
                  {currentStatus === 'Accepted' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                </button>

                {currentStatus !== 'None' && (
                  <button
                    onClick={(e) => handleStatusSelect(e, 'None')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors border-t border-[#F1F5F9] mt-1"
                  >
                    Clear Status
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155]">
            <Clock className="h-3 w-3 text-amber-500" />
            <span>{opportunity.daysRemaining} days left</span>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mb-4 bg-[#F8FAFC] rounded-xl p-3.5 border border-[#F1F5F9]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
          Summary
        </h4>
        <ul className="space-y-1 text-xs text-[#334155] leading-relaxed">
          {opportunity.summary.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold text-sm leading-none">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Required Skills Chips */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-[#64748B] mr-1">Skills:</span>
          {opportunity.requiredSkills.map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50/60 text-indigo-700 border border-indigo-100/80"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#F1F5F9] flex-wrap">
        
        <div className="flex items-center gap-2">
          {/* Streak It Button */}
          <button
            onClick={handleStreakClick}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              opportunity.isSaved
                ? 'bg-orange-50 text-orange-700 border border-orange-300'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}
          >
            <Flame className={`h-3.5 w-3.5 ${opportunity.isSaved ? 'text-orange-600 fill-orange-500' : 'text-indigo-600'}`} />
            <span>{opportunity.isSaved ? 'Streaked! 🔥' : 'Streak it!'}</span>
          </button>

          {/* AI Tutor Prep Button */}
          <button
            onClick={handleTutorClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F8FAFC] hover:bg-indigo-50 text-[#334155] hover:text-indigo-700 border border-[#E2E8F0] hover:border-indigo-200 text-xs font-semibold transition-all shadow-xs group/prep"
          >
            <Bot className="h-3.5 w-3.5 text-indigo-600 group-hover/prep:scale-105 transition-transform" />
            <span>AI Tutor Prep</span>
            <span className="text-[#94A3B8] text-[10px]">💬</span>
          </button>
        </div>

        {/* View Details / External Apply */}
        <div className="flex items-center gap-2">
          <a
            href={opportunity.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-indigo-600 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-[#F8FAFC]"
          >
            <span>Apply Link</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

      </div>

    </div>
  );
};
