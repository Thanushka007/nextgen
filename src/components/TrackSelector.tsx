import React from 'react';
import { 
  Code2, 
  Layers, 
  Brain, 
  Code, 
  Cloud, 
  ShieldCheck, 
  BarChart3, 
  Megaphone, 
  Palette, 
  TrendingUp, 
  Users,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DomainItem, TrackCategory } from '../types';

interface TrackSelectorProps {
  domains: DomainItem[];
  selectedCategory: 'all' | 'technical' | 'non-technical';
  onSelectCategory: (category: 'all' | 'technical' | 'non-technical') => void;
  selectedDomainIds: string[];
  onToggleDomain: (domainId: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Brain,
  Code,
  Cloud,
  ShieldCheck,
  BarChart3,
  Layers,
  Megaphone,
  Palette,
  TrendingUp,
  Users,
};

export const TrackSelector: React.FC<TrackSelectorProps> = ({
  domains,
  selectedCategory,
  onSelectCategory,
  selectedDomainIds,
  onToggleDomain,
}) => {
  const filteredDomains = selectedCategory === 'all'
    ? domains
    : domains.filter((d) => d.category === selectedCategory);

  const technicalCount = domains.filter((d) => d.category === 'technical').reduce((acc, d) => acc + d.activeCount, 0);
  const nonTechnicalCount = domains.filter((d) => d.category === 'non-technical').reduce((acc, d) => acc + d.activeCount, 0);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs">
      
      {/* Top Track Pill Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <span>Explore Career Tracks</span>
            <span className="text-xs font-medium text-[#64748B]">
              ({filteredDomains.length} domains active)
            </span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Select tracks & domains to tailor your live internship & hackathon feeds
          </p>
        </div>

        {/* 3-Way Segmented Control */}
        <div className="flex items-center p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-start sm:self-auto">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-white text-indigo-700 shadow-xs border border-[#E2E8F0]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            All Tracks ({technicalCount + nonTechnicalCount})
          </button>
          <button
            onClick={() => onSelectCategory('technical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'technical'
                ? 'bg-white text-cyan-700 shadow-xs border border-[#E2E8F0]'
                : 'text-[#64748B] hover:text-cyan-700'
            }`}
          >
            <Code2 className="h-3 w-3" />
            Technical ({technicalCount})
          </button>
          <button
            onClick={() => onSelectCategory('non-technical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'non-technical'
                ? 'bg-white text-emerald-700 shadow-xs border border-[#E2E8F0]'
                : 'text-[#64748B] hover:text-emerald-700'
            }`}
          >
            <Layers className="h-3 w-3" />
            Non-Technical ({nonTechnicalCount})
          </button>
        </div>
      </div>

      {/* Domain Cards Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {filteredDomains.map((domain) => {
          const Icon = ICON_MAP[domain.iconName] || Brain;
          const isSelected = selectedDomainIds.includes(domain.id);
          const isTech = domain.category === 'technical';

          return (
            <button
              key={domain.id}
              onClick={() => onToggleDomain(domain.id)}
              className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group ${
                isSelected
                  ? isTech
                    ? 'bg-cyan-50/60 border-cyan-300 shadow-xs ring-1 ring-cyan-200'
                    : 'bg-emerald-50/60 border-emerald-300 shadow-xs ring-1 ring-emerald-200'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    isTech
                      ? 'bg-white text-cyan-600 border border-cyan-100 shadow-xs'
                      : 'bg-white text-emerald-600 border border-emerald-100 shadow-xs'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isSelected
                      ? isTech ? 'bg-cyan-600 text-white' : 'bg-emerald-600 text-white'
                      : 'bg-white text-[#64748B] border border-[#E2E8F0]'
                  }`}
                >
                  {domain.activeCount} active
                </span>
              </div>

              <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-indigo-600 line-clamp-1 mb-1 transition-colors">
                {domain.name}
              </h4>
              <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed mb-2.5">
                {domain.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {domain.popularTags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white text-[#64748B] border border-[#E2E8F0]"
                  >
                    #{tag}
                  </span>
                ))}
                {domain.popularTags.length > 2 && (
                  <span className="text-[9px] text-[#94A3B8] px-1 py-0.5">
                    +{domain.popularTags.length - 2}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};
