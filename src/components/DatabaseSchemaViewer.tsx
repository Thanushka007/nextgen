import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Code2, 
  Copy, 
  Check, 
  FileCode, 
  Layers, 
  Sparkles, 
  RefreshCw,
  Server
} from 'lucide-react';
import { fetchSchemaDocs } from '../services/api';

export const DatabaseSchemaViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prisma' | 'sql' | 'seed'>('prisma');
  const [copied, setCopied] = useState<boolean>(false);
  const [docs, setDocs] = useState<{ prismaSchema: string; sqlDdl: string; seedJs: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSchemaDocs()
      .then((data) => setDocs(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const getCodeContent = () => {
    if (!docs) return '// Loading schema...';
    if (activeTab === 'prisma') return docs.prismaSchema;
    if (activeTab === 'sql') return docs.sqlDdl;
    return docs.seedJs;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-[#0F172A]">
              Database Schema & Backend Architecture
            </h2>
          </div>
          <p className="text-xs text-[#64748B]">
            Production-ready PostgreSQL models (Prisma ORM), DDL statements, and complete seed script
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('prisma')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'prisma' ? 'bg-white text-indigo-700 shadow-xs border border-[#E2E8F0]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Prisma Schema
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'sql' ? 'bg-white text-indigo-700 shadow-xs border border-[#E2E8F0]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            PostgreSQL DDL
          </button>
          <button
            onClick={() => setActiveTab('seed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'seed' ? 'bg-white text-indigo-700 shadow-xs border border-[#E2E8F0]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            seed.js Script
          </button>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        
        {/* Code Header Bar */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-xs font-mono text-slate-400 ml-2">
              {activeTab === 'prisma' ? 'schema.prisma' : activeTab === 'sql' ? 'schema.sql' : 'seed.js'}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg transition-colors border border-slate-700"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Body */}
        <div className="p-4 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-xs text-slate-400 gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
              <span>Loading schema documents...</span>
            </div>
          ) : (
            <pre className="font-mono text-xs text-slate-200 leading-relaxed">
              <code>{getCodeContent()}</code>
            </pre>
          )}
        </div>

      </div>

      {/* Entity Relationship Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-indigo-600">Model: Users</span>
          <p className="text-xs text-[#334155] mt-1">Tracks student streak days, chosen track, target domain, and scan history.</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-cyan-600">Model: Domains</span>
          <p className="text-xs text-[#334155] mt-1">Technical & non-technical categories with popular tech stack tags.</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-600">Model: Opportunities</span>
          <p className="text-xs text-[#334155] mt-1">Internships and Hackathons with stipends, deadlines, and required skills.</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-emerald-600">Model: ResumeScans</span>
          <p className="text-xs text-[#334155] mt-1">ATS match scores, missing keyword analysis, and project recommendations.</p>
        </div>
      </div>

    </div>
  );
};
