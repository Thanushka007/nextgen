import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Bot, 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  RefreshCw, 
  ArrowRight, 
  Flame, 
  ChevronRight, 
  Copy, 
  Check, 
  BrainCircuit, 
  Trophy, 
  Lightbulb, 
  FileCheck,
  Building2,
  ExternalLink
} from 'lucide-react';
import { Opportunity, ResumeScanResult, TutorChatMessage, DomainItem } from '../types';
import { scanResume, sendTutorChatMessage } from '../services/api';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'scanner' | 'tutor';
  selectedOpportunityForPrep?: Opportunity | null;
  domains: DomainItem[];
  allOpportunities: Opportunity[];
  onSelectOpportunity: (opportunity: Opportunity) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  initialMode,
  selectedOpportunityForPrep,
  domains,
  allOpportunities,
  onSelectOpportunity,
}) => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'tutor'>(initialMode);
  
  // Update activeTab if initialMode changes
  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  /* ------------------- RESUME SCANNER STATE ------------------- */
  const [targetDomain, setTargetDomain] = useState<string>('ai-ml');
  const [resumeText, setResumeText] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ResumeScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ------------------- AI TUTOR STATE ------------------- */
  const [prepMode, setPrepMode] = useState<'interview' | 'hackathon' | 'general' | 'resume'>('general');
  const [userQuery, setUserQuery] = useState<string>('');
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);
  const [tutorMessages, setTutorMessages] = useState<TutorChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `👋 **Welcome to StreakMind AI Career Tutor!**\n\nI can help you:\n- **Prepare for mock interviews** with real domain questions\n- **Architect winning hackathon projects**\n- **Polish your resume bullets** using the Google XYZ formula\n\nWhat would you like to practice today?`,
      timestamp: 'Just now',
      suggestedPrompts: [
        'Give me 3 tough interview questions for my domain',
        'Brainstorm high-impact hackathon project ideas',
        'How can I stand out in my upcoming application?'
      ]
    }
  ]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // If a specific opportunity was passed for prep, insert a prep prompt
  useEffect(() => {
    if (selectedOpportunityForPrep) {
      setActiveTab('tutor');
      setPrepMode(selectedOpportunityForPrep.type === 'hackathon' ? 'hackathon' : 'interview');
      setTutorMessages((prev) => [
        ...prev,
        {
          id: `prep-${Date.now()}`,
          sender: 'tutor',
          text: `🎯 **Loaded Prep Context for:** **${selectedOpportunityForPrep.title}** (${selectedOpportunityForPrep.companyOrHost})\n\nRequired Skills: \`${selectedOpportunityForPrep.requiredSkills.join(', ')}\`\n\nI am ready! Would you like to run a mock interview, brainstorm project architectures, or optimize your tailored application summary?`,
          timestamp: 'Just now',
          suggestedPrompts: [
            `Simulate a technical interview for ${selectedOpportunityForPrep.title}`,
            `Give me 2 winning project concepts tailored to this role`,
            `What key skills should I emphasize in my application?`
          ]
        }
      ]);
    }
  }, [selectedOpportunityForPrep]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutorMessages, isTutorLoading]);

  /* ------------------- RESUME FILE HANDLERS ------------------- */
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      setUploadedFileName(file.name);
      readResumeFileText(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setUploadedFileName(file.name);
      readResumeFileText(file);
    }
  };

  const readResumeFileText = (file: File) => {
    const fileName = file.name.toLowerCase();
    // Only read plain text into textarea for .txt and .md files
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setResumeText(text.slice(0, 8000));
        }
      };
      reader.readAsText(file);
    } else {
      // For PDF/DOC, keep the file attached directly for multimodal transmission
      setResumeText('');
    }
  };

  const handleRunResumeScan = async () => {
    if (!resumeText.trim() && !uploadedFile) {
      setScanError('Please enter resume text or drop a file first.');
      return;
    }
    setScanError(null);
    setIsScanning(true);

    try {
      let result: ResumeScanResult;
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('resumeFile', uploadedFile);
        formData.append('targetDomain', targetDomain);
        if (selectedOpportunityForPrep) {
          formData.append('targetOpportunityTitle', selectedOpportunityForPrep.title);
        }
        result = await scanResume(formData);
      } else {
        result = await scanResume({
          resumeText,
          targetDomain,
          targetOpportunityTitle: selectedOpportunityForPrep?.title,
        });
      }
      setScanResult(result);
    } catch (err: any) {
      setScanError(err.message || 'Failed to scan resume. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadSampleResume = () => {
    const sample = `Alex Chen — Software Engineer & AI Researcher
Email: alex.chen@example.edu | GitHub: github.com/alexchen | Portfolio: alexchen.dev

EDUCATION:
B.S. in Computer Science & Applied Mathematics, Expected May 2027
Relevant Coursework: Data Structures & Algorithms, Distributed Systems, Machine Learning, Operating Systems

TECHNICAL SKILLS:
Languages: TypeScript, JavaScript, Python, C++, SQL
Frameworks & Libraries: React, Node.js, Express, Next.js, PyTorch, Tailwind CSS, FastAPI
Tools & Cloud: Git, Docker, PostgreSQL, AWS (S3, Lambda), Vercel, Supabase, Google Cloud

EXPERIENCE & PROJECTS:
Full-Stack Developer | Open-Source Civic Tech Project
- Engineered scalable REST APIs handling 5,000+ daily requests using Node.js and PostgreSQL.
- Built interactive dashboard in React and Tailwind with sub-100ms response rendering.
- Integrated automated CI/CD deployment pipeline via GitHub Actions and Docker containers.

AI Multi-Modal Assistant | 1st Place Winner, Bay Area Tech Hackathon
- Developed a real-time question-answering tool using Gemini 3.7 Flash and Pinecone vector search.
- Achieved 94% user satisfaction across 300+ live demo participants.`;
    setResumeText(sample);
    setUploadedFileName('Alex_Chen_SWE_Resume.txt');
  };

  /* ------------------- AI TUTOR HANDLERS ------------------- */
  const handleSendChatMessage = async (overrideText?: string) => {
    const messageToSend = overrideText || userQuery;
    if (!messageToSend.trim() || isTutorLoading) return;

    const newMsg: TutorChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: messageToSend,
      timestamp: 'Just now',
    };

    setTutorMessages((prev) => [...prev, newMsg]);
    setUserQuery('');
    setIsTutorLoading(true);

    try {
      const history = tutorMessages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

      const context = {
        domain: domains.find((d) => d.id === targetDomain)?.name || targetDomain,
        opportunityTitle: selectedOpportunityForPrep?.title,
        opportunityDetails: selectedOpportunityForPrep ? `${selectedOpportunityForPrep.summary.join('. ')} Required Skills: ${selectedOpportunityForPrep.requiredSkills.join(', ')}` : undefined,
        prepMode,
      };

      const response = await sendTutorChatMessage(messageToSend, history, context);

      setTutorMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'tutor',
          text: response.reply,
          timestamp: 'Just now',
          suggestedPrompts: response.suggestedPrompts,
        },
      ]);
    } catch (err: any) {
      setTutorMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'tutor',
          text: `⚠️ **Error connecting to AI Tutor**: ${err.message || 'Please check your connection and try again.'}`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs transition-opacity flex justify-end">
      
      {/* Slide-over Drawer Body */}
      <div className="w-full max-w-2xl bg-white border-l border-[#E2E8F0] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header with Dual Mode Tabs */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
              {activeTab === 'scanner' ? <FileText className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <span>StreakMind AI Assistant</span>
                <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Gemini 3.7 Flash
                </span>
              </h2>
              <p className="text-xs text-[#64748B]">
                {activeTab === 'scanner' ? 'ATS Resume Matcher & Keyword Gap Analyzer' : 'Domain-Specific AI Career & Hackathon Tutor'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <button
                onClick={() => setActiveTab('scanner')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'scanner'
                    ? 'bg-white text-indigo-700 shadow-xs border border-[#E2E8F0]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <FileText className="h-3 w-3" />
                Resume Scan
              </button>
              <button
                onClick={() => setActiveTab('tutor')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'tutor'
                    ? 'bg-white text-indigo-700 shadow-xs border border-[#E2E8F0]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Bot className="h-3 w-3" />
                AI Tutor
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ================= RESUME SCANNER TAB ================= */}
        {activeTab === 'scanner' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            
            {/* Target Domain Selector */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#334155] mb-2">
                1. Select Target Career Domain
              </label>
              <select
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] font-medium focus:outline-none focus:border-indigo-500"
              >
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.category.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Resume Upload / Paste Area */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#334155]">
                  2. Upload PDF or Paste Resume Text
                </label>
                <button
                  type="button"
                  onClick={handleLoadSampleResume}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Load Sample Resume
                </button>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#CBD5E1] hover:border-indigo-400 rounded-xl p-5 text-center cursor-pointer bg-white hover:bg-indigo-50/30 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,.doc,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <UploadCloud className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#1E293B]">
                  {uploadedFileName ? (
                    <span className="text-emerald-700 font-bold flex items-center justify-center gap-1.5">
                      <FileCheck className="h-4 w-4 text-emerald-600" /> {uploadedFileName}
                    </span>
                  ) : (
                    'Click to upload or drag & drop PDF / text resume'
                  )}
                </p>
                <p className="text-[10px] text-[#64748B] mt-1">Supports PDF, DOCX, TXT, MD up to 10MB</p>
              </div>

              {/* Text Area for manual paste */}
              <div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Or paste your resume text here (education, skills, work experience, projects)..."
                  rows={4}
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl p-3 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {scanError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Run ATS Analysis Button */}
              <button
                disabled={isScanning}
                onClick={handleRunResumeScan}
                className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                  isScanning
                    ? 'bg-indigo-400 text-white cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing ATS Compatibility with Gemini 3.7 Flash...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-4 w-4" />
                    <span>Run AI Resume ATS Scan</span>
                  </>
                )}
              </button>
            </div>

            {/* SCAN RESULTS DISPLAY */}
            {scanResult && (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-5 shadow-xs animate-in fade-in duration-300">
                
                {/* Match Score Gauge Banner */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-slate-50 to-white border border-indigo-100">
                  <div className="flex items-center gap-4">
                    {/* Score Circle Gauge */}
                    <div className="relative h-16 w-16 rounded-full bg-white border-4 border-indigo-600 shadow-xs flex items-center justify-center">
                      <span className="text-xl font-extrabold text-[#0F172A]">
                        {scanResult.matchScore}%
                      </span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-[#0F172A]">
                          {scanResult.candidateName || 'ATS Match Compatibility'}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {scanResult.careerReadinessLevel}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1">
                        Domain: <strong className="text-indigo-700">{scanResult.targetDomain}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Executive Assessment */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                    Assessment Summary
                  </h5>
                  <p className="text-xs text-[#334155] leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                    {scanResult.summaryAssessment}
                  </p>
                </div>

                {/* Matched Skills & Missing Keywords Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Matched Skills */}
                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5">
                    <h5 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Detected Strong Skills ({scanResult.matchedSkills.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.matchedSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium px-2 py-0.5 rounded bg-white text-emerald-700 border border-emerald-200 shadow-2xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-3.5">
                    <h5 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-2">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                      Critical Missing Keywords ({scanResult.missingKeywords.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.missingKeywords.map((k, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium px-2 py-0.5 rounded bg-white text-rose-700 border border-rose-200 shadow-2xs"
                        >
                          +{k}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Actionable Recommendations */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                    Resume Bullet Improvements
                  </h5>
                  <ul className="space-y-1.5 text-xs text-[#334155]">
                    {scanResult.improvementRecommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Gap-Filling Projects */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2 flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-indigo-600" />
                    Suggested Portfolio & Hackathon Projects
                  </h5>
                  <div className="space-y-2">
                    {scanResult.suggestedProjects.map((proj, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-[#334155] flex items-center justify-between gap-2">
                        <span>{proj}</span>
                        <button
                          onClick={() => {
                            setActiveTab('tutor');
                            setPrepMode('hackathon');
                            handleSendChatMessage(`Can you give me a complete architectural blueprint and MVP plan for: "${proj}"?`);
                          }}
                          className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold shrink-0 flex items-center gap-1"
                        >
                          <span>Architect</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ================= AI TUTOR TAB ================= */}
        {activeTab === 'tutor' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            
            {/* Mode & Context Banner */}
            <div className="px-5 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#64748B]">Prep Mode:</span>
                <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-lg p-0.5">
                  <button
                    onClick={() => setPrepMode('general')}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                      prepMode === 'general' ? 'bg-indigo-600 text-white' : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setPrepMode('interview')}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                      prepMode === 'interview' ? 'bg-indigo-600 text-white' : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    Interview
                  </button>
                  <button
                    onClick={() => setPrepMode('hackathon')}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                      prepMode === 'hackathon' ? 'bg-indigo-600 text-white' : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    Hackathon
                  </button>
                  <button
                    onClick={() => setPrepMode('resume')}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                      prepMode === 'resume' ? 'bg-indigo-600 text-white' : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    Resume
                  </button>
                </div>
              </div>

              {selectedOpportunityForPrep && (
                <div className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="truncate max-w-[200px]">{selectedOpportunityForPrep.title}</span>
                </div>
              )}
            </div>

            {/* Chat Message Scroll List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
              {tutorMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                    {/* Quick Follow-up Suggestions */}
                    {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-indigo-600 block">
                          Suggested Next Questions:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedPrompts.map((prompt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendChatMessage(prompt)}
                              className="text-[11px] text-left bg-white hover:bg-indigo-50 text-[#334155] hover:text-indigo-700 px-2.5 py-1 rounded-lg border border-[#E2E8F0] transition-colors shadow-2xs"
                            >
                              💡 {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#94A3B8] mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isTutorLoading && (
                <div className="flex items-center gap-2 text-xs text-indigo-600 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0] w-fit shadow-xs">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                  <span>StreakMind AI Tutor is thinking...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 bg-white border-t border-[#E2E8F0]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder={
                    prepMode === 'interview'
                      ? 'Ask for a mock question, evaluate your answer...'
                      : prepMode === 'hackathon'
                      ? 'Ask for project concepts, tech stacks, or pitch tips...'
                      : 'Ask anything about internships, hackathons, or skills...'
                  }
                  className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={!userQuery.trim() || isTutorLoading}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
