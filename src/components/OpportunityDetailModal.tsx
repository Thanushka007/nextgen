import React from 'react';
import { 
  X, 
  Flame, 
  Bot, 
  MapPin, 
  DollarSign, 
  Trophy, 
  Building2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Bookmark,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Opportunity, OpportunityStatus } from '../types';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  onToggleSave: (id: string) => void;
  onUpdateStatus?: (id: string, status: OpportunityStatus) => void;
  onOpenAITutorPrep: (opportunity: Opportunity) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  onToggleSave,
  onUpdateStatus,
  onOpenAITutorPrep,
}) => {
  if (!opportunity) return null;

  const isTech = opportunity.category === 'technical';
  const isHackathon = opportunity.type === 'hackathon';
  const currentStatus: OpportunityStatus = opportunity.status || 'None';

  const handleStreakClick = () => {
    if (!opportunity.isSaved) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#f97316', '#eab308', '#6366f1'],
      });
    }
    onToggleSave(opportunity.id);
  };

  const handleStatusChange = (status: OpportunityStatus) => {
    if (status === 'Accepted') {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
      });
    }
    if (onUpdateStatus) {
      onUpdateStatus(opportunity.id, status);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-[#E2E8F0] bg-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                isTech
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {isTech ? 'TECHNICAL' : 'NON-TECHNICAL'}
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                isHackathon
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isHackathon ? 'HACKATHON' : 'INTERNSHIP'}
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
              {opportunity.format.toUpperCase()}
            </span>
            {opportunity.source && (
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                {opportunity.source}
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-[#0F172A] mb-2">{opportunity.title}</h2>

          <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap">
            <span className="flex items-center gap-1 text-[#334155] font-semibold">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" /> {opportunity.companyOrHost}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#94A3B8]" /> {opportunity.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold font-mono">
              {isHackathon ? <Trophy className="h-3.5 w-3.5 text-emerald-600" /> : <DollarSign className="h-3.5 w-3.5 text-emerald-600" />}
              {opportunity.stipendOrPrize}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto bg-white">
          
          {/* Status Tracker Bar inside Modal */}
          <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#0F172A] block mb-0.5">Application Status</span>
              <span className="text-[11px] text-[#64748B]">Track your progress for this opportunity</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleStatusChange('Interested')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  currentStatus === 'Interested'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                }`}
              >
                <Bookmark className="h-3 w-3" />
                Interested
              </button>
              <button
                onClick={() => handleStatusChange('Applied')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  currentStatus === 'Applied'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
                Applied
              </button>
              <button
                onClick={() => handleStatusChange('Accepted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  currentStatus === 'Accepted'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <Award className="h-3 w-3" />
                Accepted 🎉
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
              Overview
            </h3>
            <p className="text-xs text-[#334155] leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
              {opportunity.description}
            </p>
          </div>

          {/* Key Highlights & Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
              Key Highlights
            </h3>
            <ul className="space-y-2 text-xs text-[#334155]">
              {opportunity.summary.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Required Skills & Tech Stack */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
              Target Skills & Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {opportunity.requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium px-3 py-1 rounded-lg bg-indigo-50/70 text-indigo-700 border border-indigo-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Perks & Benefits */}
          {opportunity.perks && opportunity.perks.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
                Perks & Benefits
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {opportunity.perks.map((perk, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#334155] bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deadline Warning */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
            <div className="flex items-center gap-2 text-amber-800">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>Application Deadline: <strong>{opportunity.deadline}</strong></span>
            </div>
            <span className="font-bold text-amber-700 font-mono">{opportunity.daysRemaining} days remaining</span>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStreakClick}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                opportunity.isSaved
                  ? 'bg-orange-50 text-orange-700 border border-orange-300'
                  : 'bg-white hover:bg-slate-50 text-[#334155] border border-[#E2E8F0]'
              }`}
            >
              <Flame className={`h-4 w-4 ${opportunity.isSaved ? 'text-orange-600 fill-orange-500' : 'text-[#94A3B8]'}`} />
              <span>{opportunity.isSaved ? 'Streaked! 🔥' : 'Streak it!'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAITutorPrep(opportunity);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-xs"
            >
              <Bot className="h-4 w-4 text-indigo-600" />
              <span>Launch AI Tutor Prep</span>
            </button>
          </div>

          <a
            href={opportunity.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs"
          >
            <span>Apply on Official Portal</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

      </div>
    </div>
  );
};
