import React, { useState } from 'react';
import { 
  Bookmark, 
  Clock, 
  Building2, 
  ExternalLink, 
  Bot, 
  Trash2, 
  CheckCircle2, 
  Trophy,
  Award,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Opportunity, OpportunityStatus } from '../types';

interface MyEventsViewProps {
  savedOpportunities: Opportunity[];
  onToggleSave: (id: string) => void;
  onUpdateStatus?: (id: string, status: OpportunityStatus) => void;
  onOpenAITutorPrep: (opportunity: Opportunity) => void;
  onSelectDetails: (opportunity: Opportunity) => void;
}

export const MyEventsView: React.FC<MyEventsViewProps> = ({
  savedOpportunities,
  onToggleSave,
  onUpdateStatus,
  onOpenAITutorPrep,
  onSelectDetails,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'Interested' | 'Applied' | 'Accepted'>('all');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const filtered = activeFilter === 'all'
    ? savedOpportunities
    : savedOpportunities.filter((o) => o.status === activeFilter);

  const handleStatusChange = (id: string, status: OpportunityStatus) => {
    setOpenDropdownId(null);
    if (status === 'Accepted') {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    if (onUpdateStatus) {
      onUpdateStatus(id, status);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-indigo-600" />
            <span>Tracked & Saved Opportunities</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              {savedOpportunities.length} Tracked
            </span>
          </h2>
          <p className="text-xs text-[#64748B]">
            Manage application statuses (Interested, Applied, Accepted) and launch targeted AI Tutor preparation.
          </p>
        </div>

        {/* Status Filter Switcher */}
        <div className="flex items-center p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'all' ? 'bg-white text-indigo-700 shadow-xs border border-[#E2E8F0]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            All ({savedOpportunities.length})
          </button>
          <button
            onClick={() => setActiveFilter('Interested')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'Interested' ? 'bg-white text-purple-700 shadow-xs border border-[#E2E8F0]' : 'text-[#64748B] hover:text-purple-700'
            }`}
          >
            Interested ({savedOpportunities.filter(o => o.status === 'Interested').length})
          </button>
          <button
            onClick={() => setActiveFilter('Applied')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'Applied' ? 'bg-white text-blue-700 shadow-xs border border-[#E2E8F0]' : 'text-[#64748B] hover:text-blue-700'
            }`}
          >
            Applied ({savedOpportunities.filter(o => o.status === 'Applied').length})
          </button>
          <button
            onClick={() => setActiveFilter('Accepted')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'Accepted' ? 'bg-white text-emerald-700 shadow-xs border border-[#E2E8F0]' : 'text-[#64748B] hover:text-emerald-700'
            }`}
          >
            Accepted ({savedOpportunities.filter(o => o.status === 'Accepted').length})
          </button>
        </div>
      </div>

      {/* List of Saved Items */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((opp) => {
            const currentStatus = opp.status || 'Interested';
            return (
              <div
                key={opp.id}
                onClick={() => onSelectDetails(opp)}
                className={`bg-white hover:bg-white border rounded-2xl p-5 transition-all cursor-pointer group flex flex-col justify-between shadow-xs hover:shadow-md relative overflow-visible ${
                  currentStatus === 'Accepted'
                    ? 'border-emerald-300 ring-1 ring-emerald-200'
                    : currentStatus === 'Applied'
                    ? 'border-blue-200'
                    : 'border-[#E2E8F0] hover:border-indigo-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        opp.category === 'technical' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {opp.category.toUpperCase()}
                      </span>

                      {/* Status Dropdown inside Card */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === opp.id ? null : opp.id);
                          }}
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border flex items-center gap-1 ${
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
                          <span>{currentStatus}</span>
                          <ChevronDown className="h-2.5 w-2.5 opacity-70" />
                        </button>

                        {openDropdownId === opp.id && (
                          <div
                            className="absolute left-0 top-full mt-1 w-36 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-30 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleStatusChange(opp.id, 'Interested')}
                              className={`w-full text-left px-2 py-1 rounded text-xs font-semibold flex items-center gap-1.5 ${
                                currentStatus === 'Interested' ? 'bg-purple-50 text-purple-700' : 'text-[#334155] hover:bg-slate-50'
                              }`}
                            >
                              <Bookmark className="h-3 w-3 text-purple-600" />
                              Interested
                            </button>
                            <button
                              onClick={() => handleStatusChange(opp.id, 'Applied')}
                              className={`w-full text-left px-2 py-1 rounded text-xs font-semibold flex items-center gap-1.5 ${
                                currentStatus === 'Applied' ? 'bg-blue-50 text-blue-700' : 'text-[#334155] hover:bg-slate-50'
                              }`}
                            >
                              <CheckCircle2 className="h-3 w-3 text-blue-600" />
                              Applied
                            </button>
                            <button
                              onClick={() => handleStatusChange(opp.id, 'Accepted')}
                              className={`w-full text-left px-2 py-1 rounded text-xs font-semibold flex items-center gap-1.5 ${
                                currentStatus === 'Accepted' ? 'bg-emerald-50 text-emerald-700' : 'text-[#334155] hover:bg-slate-50'
                              }`}
                            >
                              <Trophy className="h-3 w-3 text-emerald-600" />
                              Accepted 🎉
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-amber-600 font-medium shrink-0">
                      <Clock className="h-3 w-3" />
                      <span>{opp.daysRemaining}d left</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mb-3 flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-[#94A3B8]" />
                    {opp.companyOrHost} • {opp.location}
                  </p>

                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] mb-3">
                    <p className="text-[11px] text-[#334155] line-clamp-2">
                      {opp.summary[0]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#F1F5F9]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAITutorPrep(opp);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all shadow-xs"
                  >
                    <Bot className="h-3.5 w-3.5 text-indigo-600" />
                    <span>AI Prep</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(opp.id);
                      }}
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove from tracked"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <a
                      href={opp.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-xl transition-all shadow-xs"
                    >
                      <span>Apply</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center shadow-xs">
          <Bookmark className="h-8 w-8 text-[#CBD5E1] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#0F172A] mb-1">
            {activeFilter !== 'all' ? `No opportunities with status "${activeFilter}"` : 'No saved opportunities yet'}
          </h3>
          <p className="text-xs text-[#64748B] max-w-xs mx-auto">
            {activeFilter !== 'all'
              ? `Mark opportunities as ${activeFilter} from the feed to view them here.`
              : 'Click "Streak it! ⭐" or "Track Status" on any opportunity in the feed to manage them here.'}
          </p>
        </div>
      )}

    </div>
  );
};
