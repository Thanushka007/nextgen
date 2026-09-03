import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  Terminal, 
  Zap, 
  Database, 
  Layers, 
  Copy, 
  Check, 
  Search, 
  Play, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  FileCode2, 
  Share2,
  Code2
} from 'lucide-react';
import { ApiPlatformSource, Opportunity, SyncResult } from '../types';
import { fetchConnectedApiSources, syncApiPlatforms, searchExternalApis } from '../services/api';

interface ApiExplorerViewProps {
  onSelectOpportunity?: (opp: Opportunity) => void;
}

export const ApiExplorerView: React.FC<ApiExplorerViewProps> = ({ onSelectOpportunity }) => {
  const [sources, setSources] = useState<ApiPlatformSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
  const [lastSyncReport, setLastSyncReport] = useState<{ timestamp: string; results: SyncResult[] } | null>(null);
  
  // Interactive API Query Sandbox State
  const [selectedSourceId, setSelectedSourceId] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('AI');
  const [searchCategory, setSearchCategory] = useState<string>('all');
  const [searchLocation, setSearchLocation] = useState<string>('all');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queryResults, setQueryResults] = useState<Opportunity[]>([]);
  const [queryResponseTime, setQueryResponseTime] = useState<number | null>(null);
  const [rawJsonCopied, setRawJsonCopied] = useState<boolean>(false);
  const [curlCopied, setCurlCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'curl'>('visual');

  useEffect(() => {
    loadSources();
    handleRunQuery();
  }, []);

  const loadSources = async () => {
    setIsLoading(true);
    try {
      const data = await fetchConnectedApiSources();
      setSources(data);
    } catch (e) {
      console.error('Failed to load API sources:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const resp = await syncApiPlatforms();
      if (resp.sources) {
        setSources(resp.sources);
      }
      if (resp.report) {
        setLastSyncReport(resp.report);
      }
      // Re-run current search query
      await handleRunQuery();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncSingleSource = async (sourceId: string) => {
    setSyncingSourceId(sourceId);
    try {
      const resp = await syncApiPlatforms(sourceId);
      if (resp.sources) {
        setSources(resp.sources);
      }
      if (resp.result) {
        setLastSyncReport({
          timestamp: new Date().toISOString(),
          results: [resp.result],
        });
      }
    } catch (err) {
      console.error(`Sync source ${sourceId} failed:`, err);
    } finally {
      setSyncingSourceId(null);
    }
  };

  const handleRunQuery = async () => {
    setIsQuerying(true);
    const start = performance.now();
    try {
      const results = await searchExternalApis({
        keyword: searchKeyword,
        platform: selectedSourceId,
        category: searchCategory,
        location: searchLocation,
      });
      setQueryResults(results);
      setQueryResponseTime(Math.round(performance.now() - start));
    } catch (err) {
      console.error('API query failed:', err);
    } finally {
      setIsQuerying(false);
    }
  };

  const totalEventsCataloged = sources.reduce((acc, s) => acc + s.itemCount, 0);

  const getSampleCurlCommand = () => {
    const params = new URLSearchParams();
    if (selectedSourceId && selectedSourceId !== 'all') params.set('platformSource', selectedSourceId);
    if (searchKeyword) params.set('search', searchKeyword);
    if (searchCategory && searchCategory !== 'all') params.set('category', searchCategory);
    return `curl -X GET "https://your-domain.run.app/api/opportunities?${params.toString()}" \\
  -H "Accept: application/json"`;
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(queryResults, null, 2));
    setRawJsonCopied(true);
    setTimeout(() => setRawJsonCopied(false), 2000);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(getSampleCurlCommand());
    setCurlCopied(true);
    setTimeout(() => setCurlCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Hero */}
      <div className="bg-linear-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-slate-700">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-36 top-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-indigo-400" />
                Live Multi-Platform Aggregator
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                7 APIs Operational
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Internship & Hackathon API Hub
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Real-time aggregation engine synchronizing live opportunities from <strong>Devpost, Devfolio, Major League Hacking (MLH), Unstop, Adzuna Jobs, RemoteOK</strong>, and <strong>GitHub Opportunities</strong>.
            </p>
          </div>

          {/* Sync Button & Stats */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0">
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Synchronizing Feeds...' : 'Sync All Live Feeds'}
            </button>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-indigo-400" />
              <span><strong>{totalEventsCataloged}</strong> live listings indexed</span>
            </div>
          </div>
        </div>

        {/* Sync notification banner if recently updated */}
        {lastSyncReport && (
          <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Last live sync refreshed {lastSyncReport.results.length} sources successfully
            </span>
            <span className="text-slate-400 font-mono">
              Timestamp: {new Date(lastSyncReport.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Connected API Platforms Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-600" />
              Connected Platforms & Open APIs
            </h2>
            <p className="text-xs text-[#64748B]">
              Direct connectors to global hackathon networks, Indian early-talent portals, and worldwide internship search engines.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 hidden sm:inline-block">
            Auto-Refreshed Feeds
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((source) => {
            const isThisSyncing = syncingSourceId === source.id;

            return (
              <div
                key={source.id}
                className="bg-white border border-[#E2E8F0] hover:border-indigo-200 rounded-xl p-4.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs"
                        style={{ backgroundColor: source.brandColor }}
                      >
                        {source.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#0F172A] leading-tight">
                          {source.name}
                        </h3>
                        <span className="text-[11px] font-medium text-slate-500">
                          {source.category === 'hackathon' ? '🏆 Hackathons' : source.category === 'internship' ? '💼 Internships' : '🏆 & 💼 Both'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      {source.status === 'synced' ? 'Active' : source.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#64748B] mb-3 line-clamp-2">
                    {source.description}
                  </p>

                  {/* Metadata Chips */}
                  <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg p-2.5 mb-3 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Protocol:</span>
                      <span className="font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {source.authType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Active Listings:</span>
                      <span className="font-bold text-indigo-600">
                        {source.itemCount} items
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Avg Latency:</span>
                      <span className="font-mono text-slate-700">
                        {source.latencyMs} ms
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Regions:</span>
                      <span className="text-slate-600 font-medium truncate max-w-[140px]">
                        {source.supportedRegions.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9]">
                  <a
                    href={source.apiDocsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    API / Feed
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <button
                    onClick={() => handleSyncSingleSource(source.id)}
                    disabled={isThisSyncing}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${isThisSyncing ? 'animate-spin text-indigo-600' : ''}`} />
                    {isThisSyncing ? 'Syncing...' : 'Sync'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive API Explorer & Query Sandbox */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Terminal className="h-5 w-5 text-indigo-600" />
              Live API Query Sandbox & Code Generator
            </h2>
            <p className="text-xs text-[#64748B]">
              Test real queries against integrated APIs and export JSON payloads or CURL endpoints directly.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('visual')}
              className={`text-xs font-semibold px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visual Cards ({queryResults.length})
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`text-xs font-semibold px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              JSON Response
            </button>
            <button
              onClick={() => setActiveTab('curl')}
              className={`text-xs font-semibold px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'curl'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              cURL & Integration Code
            </button>
          </div>
        </div>

        {/* Query Controls Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
          {/* Platform Source Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#64748B] mb-1">
              Target API Platform
            </label>
            <select
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] text-xs rounded-lg px-3 py-2 text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Connected Platforms (Aggregated)</option>
              <option value="devpost">Devpost Hackathons</option>
              <option value="devfolio">Devfolio Community</option>
              <option value="mlh">Major League Hacking (MLH)</option>
              <option value="unstop">Unstop (Dare2Compete)</option>
              <option value="adzuna">Adzuna Jobs & Internships API</option>
              <option value="remoteok">RemoteOK Student Tech</option>
              <option value="github">GitHub Open Opportunities</option>
            </select>
          </div>

          {/* Keyword Search */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#64748B] mb-1">
              Search Keyword
            </label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="e.g. AI, React, Python, Product"
                className="w-full bg-white border border-[#CBD5E1] text-xs rounded-lg pl-8 pr-3 py-2 text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Track Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#64748B] mb-1">
              Track Type
            </label>
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] text-xs rounded-lg px-3 py-2 text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Tracks</option>
              <option value="technical">Technical Tracks</option>
              <option value="non-technical">Non-Technical Tracks</option>
            </select>
          </div>

          {/* Location / Region */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#64748B] mb-1">
              Region / Format
            </label>
            <div className="flex gap-2">
              <select
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] text-xs rounded-lg px-2.5 py-2 text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">Any Location</option>
                <option value="india">India (Bengaluru, Hyderabad, NCR)</option>
                <option value="usa">USA (San Francisco, NYC)</option>
                <option value="remote">Remote (Worldwide)</option>
              </select>

              <button
                onClick={handleRunQuery}
                disabled={isQuerying}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-60"
              >
                {isQuerying ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-white" />}
                Execute
              </button>
            </div>
          </div>
        </div>

        {/* Execution Metadata Bar */}
        <div className="flex items-center justify-between text-xs text-[#64748B] px-1 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Status: 200 OK
            </span>
            <span>•</span>
            <span>Returned <strong>{queryResults.length}</strong> items</span>
            {queryResponseTime !== null && (
              <>
                <span>•</span>
                <span className="font-mono text-slate-600">Response time: {queryResponseTime}ms</span>
              </>
            )}
          </div>

          {activeTab === 'json' && (
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              {rawJsonCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {rawJsonCopied ? 'Copied JSON!' : 'Copy JSON'}
            </button>
          )}

          {activeTab === 'curl' && (
            <button
              onClick={handleCopyCurl}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              {curlCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {curlCopied ? 'Copied cURL!' : 'Copy cURL'}
            </button>
          )}
        </div>

        {/* Active Tab View */}
        {activeTab === 'visual' && (
          <div className="space-y-3">
            {queryResults.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Search className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-slate-700">No matching API items found</p>
                <p className="text-xs text-slate-500 mt-0.5">Try widening your search keyword or selecting &quot;All Connected Platforms&quot;.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {queryResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectOpportunity?.(item)}
                    className="bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] hover:border-indigo-300 rounded-xl p-4 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.type.toUpperCase()}
                      </span>

                      {item.source && (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-800 border border-slate-300 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          {item.source}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="text-xs text-[#64748B] font-medium mt-0.5">
                      {item.companyOrHost} • <span className="text-emerald-700 font-semibold">{item.stipendOrPrize}</span>
                    </p>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">{item.location}</span>
                      <a
                        href={item.registrationUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        Register
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'json' && (
          <div className="bg-[#0F172A] text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-[480px] border border-slate-800 leading-relaxed">
            <pre>{JSON.stringify({ 
              status: 200, 
              source: selectedSourceId, 
              total: queryResults.length,
              data: queryResults 
            }, null, 2)}</pre>
          </div>
        )}

        {activeTab === 'curl' && (
          <div className="space-y-4">
            <div className="bg-[#0F172A] text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800">
              <div className="text-slate-400 mb-2">// 1. Direct cURL Command</div>
              <pre className="text-emerald-400">{getSampleCurlCommand()}</pre>
            </div>

            <div className="bg-[#0F172A] text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800">
              <div className="text-slate-400 mb-2">// 2. Node.js / JavaScript Fetch Snippet</div>
              <pre className="text-sky-300">{`const response = await fetch('/api/opportunities?platformSource=${selectedSourceId}&search=${encodeURIComponent(searchKeyword)}');
const { opportunities } = await response.json();
console.log('Fetched live opportunities:', opportunities);`}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Developer API Key Guidance Section */}
      <div className="bg-linear-to-r from-slate-50 to-indigo-50/40 border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          API Key Management & Rate Limits
        </div>
        <p className="leading-relaxed">
          The application functions out of the box using public feeds and direct aggregator parsers for <strong>Devpost, Devfolio, MLH, Unstop, RemoteOK</strong>, and <strong>GitHub</strong>. For high-volume enterprise queries or custom geographic radius filters, you can optionally configure <code>ADZUNA_APP_ID</code> and <code>ADZUNA_APP_KEY</code> in your environment variables.
        </p>
      </div>
    </div>
  );
};
