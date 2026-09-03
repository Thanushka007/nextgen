import React, { useState } from 'react';
import { 
  Search, 
  Briefcase, 
  Trophy, 
  ArrowUpDown, 
  X,
  Compass,
  Bookmark,
  CheckCircle2,
  Award,
  Mail,
  BellRing,
  Globe,
  Zap,
  Code2
} from 'lucide-react';
import { Opportunity, DomainItem, FilterState, OpportunityStatus, ExternalPlatformId } from '../types';
import { OpportunityCard } from './OpportunityCard';

interface OpportunityFeedProps {
  opportunities: Opportunity[];
  domains: DomainItem[];
  filters: FilterState;
  onUpdateFilters: (updater: (prev: FilterState) => FilterState) => void;
  onToggleSave: (id: string) => void;
  onUpdateStatus?: (id: string, status: OpportunityStatus) => void;
  onOpenAITutorPrep: (opportunity: Opportunity) => void;
  onSelectDetails: (opportunity: Opportunity) => void;
  onOpenEmailNotifications?: () => void;
  onOpenApiExplorer?: () => void;
  isLoading: boolean;
}

export const OpportunityFeed: React.FC<OpportunityFeedProps> = ({
  opportunities,
  domains,
  filters,
  onUpdateFilters,
  onToggleSave,
  onUpdateStatus,
  onOpenAITutorPrep,
  onSelectDetails,
  onOpenEmailNotifications,
  onOpenApiExplorer,
  isLoading,
}) => {
  const [sortBy, setSortBy] = useState<'deadline' | 'reward' | 'popular'>('deadline');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Interested' | 'Applied' | 'Accepted'>('all');

  const handleTypeTabChange = (type: 'all' | 'internship' | 'hackathon') => {
    onUpdateFilters((prev) => ({ ...prev, type }));
  };

  const handlePlatformChange = (platformSource: ExternalPlatformId) => {
    onUpdateFilters((prev) => ({ ...prev, platformSource }));
  };

  const handleSearchChange = (search: string) => {
    onUpdateFilters((prev) => ({ ...prev, search }));
  };

  const clearSearch = () => {
    onUpdateFilters((prev) => ({ ...prev, search: '' }));
  };

  // Filter by status if selected
  const filteredByStatus = opportunities.filter((opp) => {
    if (statusFilter === 'all') return true;
    return opp.status === statusFilter;
  });

  // Filter by platform source if selected
  const activePlatform = filters.platformSource || 'all';
  const filteredByPlatform = filteredByStatus.filter((opp) => {
    if (activePlatform === 'all') return true;
    return opp.externalPlatform === activePlatform || opp.source?.toLowerCase().includes(activePlatform);
  });

  // Sort logic
  const sortedOpportunities = [...filteredByPlatform].sort((a, b) => {
    if (sortBy === 'deadline') {
      return a.daysRemaining - b.daysRemaining;
    }
    if (sortBy === 'reward') {
      return (b.stipendAmount || 0) - (a.stipendAmount || 0);
    }
    if (sortBy === 'popular') {
      return (b.participantCount || 0) - (a.participantCount || 0);
    }
    return 0;
  });

  const internshipCount = opportunities.filter((o) => o.type === 'internship').length;
  const hackathonCount = opportunities.filter((o) => o.type === 'hackathon').length;
  const interestedCount = opportunities.filter((o) => o.status === 'Interested').length;
  const appliedCount = opportunities.filter((o) => o.status === 'Applied').length;
  const acceptedCount = opportunities.filter((o) => o.status === 'Accepted').length;

  const platformList: { id: ExternalPlatformId; label: string; tag: string }[] = [
    { id: 'all', label: 'All Feeds', tag: '7 APIs' },
    { id: 'devpost', label: 'Devpost', tag: 'Hackathons' },
    { id: 'devfolio', label: 'Devfolio', tag: 'Web3 & AI' },
    { id: 'mlh', label: 'MLH League', tag: 'Collegiate' },
    { id: 'unstop', label: 'Unstop', tag: 'India Corporate' },
    { id: 'adzuna', label: 'Adzuna API', tag: 'Jobs & Interns' },
    { id: 'remoteok', label: 'RemoteOK', tag: 'Global Remote' },
    { id: 'github', label: 'GitHub GSoC', tag: 'Open Source' },
  ];

  return (
    <div className="space-y-5">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col gap-3 bg-white border border-[#E2E8F0] p-3 sm:p-4 rounded-2xl shadow-xs">
        
        {/* Row 1: Type Tabs & Email Notification / API Hub Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Type Tabs: All / Internships / Hackathons */}
          <div className="flex items-center p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-start">
            <button
              onClick={() => handleTypeTabChange('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filters.type === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs border border-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All Roles ({opportunities.length})
            </button>
            <button
              onClick={() => handleTypeTabChange('internship')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filters.type === 'internship'
                  ? 'bg-white text-amber-700 shadow-xs border border-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-amber-700'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              Internships ({internshipCount})
            </button>
            <button
              onClick={() => handleTypeTabChange('hackathon')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filters.type === 'hackathon'
                  ? 'bg-white text-indigo-700 shadow-xs border border-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-indigo-700'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              Hackathons ({hackathonCount})
            </button>
          </div>

          {/* Quick Actions (API Hub & Email Alerts) */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenApiExplorer && (
              <button
                onClick={onOpenApiExplorer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Explore Connected APIs & Test Queries"
              >
                <Code2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>API Hub & Sandbox</span>
              </button>
            )}

            {onOpenEmailNotifications && (
              <button
                onClick={onOpenEmailNotifications}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Email Alerts</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Platform Sources Quick Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-[11px] font-bold text-[#64748B] shrink-0 mr-1 flex items-center gap-1">
            <Globe className="h-3 w-3 text-indigo-600" />
            Source API:
          </span>
          {platformList.map((p) => {
            const isSelected = (filters.platformSource || 'all') === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handlePlatformChange(p.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                    : 'bg-[#F8FAFC] text-slate-600 border border-[#E2E8F0] hover:bg-slate-100'
                }`}
              >
                <span>{p.label}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-600'}`}>
                  {p.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Status Filter Pills, Search Bar & Sort Dropdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-[#F1F5F9]">
          
          {/* Status Quick Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#64748B] mr-1">Status:</span>
            
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-slate-100'
              }`}
            >
              All
            </button>

            <button
              onClick={() => setStatusFilter('Interested')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'Interested'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              <Bookmark className="h-3 w-3" />
              Interested ({interestedCount})
            </button>

            <button
              onClick={() => setStatusFilter('Applied')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'Applied'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
              Applied ({appliedCount})
            </button>

            <button
              onClick={() => setStatusFilter('Accepted')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'Accepted'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Award className="h-3 w-3" />
              Accepted ({acceptedCount})
            </button>
          </div>

          {/* Search Bar & Sort Dropdown */}
          <div className="flex items-center gap-2.5 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search skills, companies, roles, topics..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-8 py-1.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-hidden focus:border-indigo-400 focus:bg-white transition-colors"
              />
              {filters.search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Sort Menu */}
            <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 py-1.5 text-xs text-[#475569]">
              <ArrowUpDown className="h-3 w-3 text-[#94A3B8]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-hidden text-xs font-semibold text-[#0F172A] cursor-pointer"
              >
                <option value="deadline">Closing Soonest</option>
                <option value="reward">Highest Stipend/Prize</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {filters.selectedDomainIds.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-[#64748B]">
          <span>Filtered by {filters.selectedDomainIds.length} domains:</span>
          {filters.selectedDomainIds.map((domainId) => {
            const d = domains.find((item) => item.id === domainId);
            return (
              <span
                key={domainId}
                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md text-[11px] font-medium"
              >
                {d?.name || domainId}
                <button
                  onClick={() =>
                    onUpdateFilters((prev) => ({
                      ...prev,
                      selectedDomainIds: prev.selectedDomainIds.filter((id) => id !== domainId),
                    }))
                  }
                  className="hover:text-indigo-900"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            );
          })}
          <button
            onClick={() => onUpdateFilters((prev) => ({ ...prev, selectedDomainIds: [] }))}
            className="text-[11px] text-indigo-600 hover:underline font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs animate-pulse">
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-20 bg-slate-100 rounded"></div>
                <div className="h-5 w-24 bg-slate-100 rounded"></div>
              </div>
              <div className="h-6 w-2/3 bg-slate-100 rounded mb-4"></div>
              <div className="space-y-2 mb-4">
                <div className="h-3 w-full bg-slate-100 rounded"></div>
                <div className="h-3 w-4/5 bg-slate-100 rounded"></div>
              </div>
              <div className="h-8 w-32 bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* Opportunity Cards List */}
      {!isLoading && sortedOpportunities.length > 0 && (
        <div className="space-y-4">
          {sortedOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onToggleSave={onToggleSave}
              onUpdateStatus={onUpdateStatus}
              onOpenAITutorPrep={onOpenAITutorPrep}
              onSelectDetails={onSelectDetails}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedOpportunities.length === 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A] mb-1">
            {statusFilter !== 'all' ? `No opportunities marked as "${statusFilter}"` : 'No opportunities found'}
          </h3>
          <p className="text-xs text-[#64748B] max-w-sm mb-4">
            {statusFilter !== 'all' 
              ? `You haven't marked any opportunities as ${statusFilter} yet. Use the "Track Status" button on any listing.` 
              : 'Try adjusting your search query, enabling more track categories, or resetting domain filters.'}
          </p>
          <button
            onClick={() => {
              setStatusFilter('all');
              onUpdateFilters((prev) => ({
                ...prev,
                search: '',
                selectedDomainIds: [],
                category: 'all',
                type: 'all',
                format: 'all',
                technicalEnabled: true,
                nonTechnicalEnabled: true,
              }));
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      )}

    </div>
  );
};
