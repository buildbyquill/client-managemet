import React from 'react';
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  Users,
  Folder,
  CircleDollarSign,
  Megaphone,
  Layers,
  CheckCircle2,
  HelpCircle,
  Command,
  FileSpreadsheet,
  MessageSquare,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const HowToUseView: React.FC = () => {
  const { setActiveTab } = useWorkspace();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">How to use</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">The operating manual for BuildWithQuill.</p>
        </div>
      </div>

      {/* 4 Quick Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">11</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pipeline stages</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">6</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Content & ad formats</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">5</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Project delivery statuses</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">1</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Unified team workspace</div>
        </div>
      </div>

      {/* Section 1: The Core Agency Workflow */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 shadow-2xs transition-colors">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            The Core Workflow: From Prospect to Paid Client
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            How BuildWithQuill sources, qualifies, closes, and delivers for creators.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              step: '1',
              title: 'Capture Prospects & Mass Import',
              desc: 'Use the Clients tab to enter creators individually or use Mass Import CSV to parse Google Sheets / CSV prospect lists in one click. Every client card tracks handle, niche, key monetization gap, and pipeline value.',
              tab: 'clients',
            },
            {
              step: '2',
              title: 'Deep Research & NotebookLM Concept Spec',
              desc: 'Move candidates through Lead → Qualified → Research. Prepare custom application specs before sending outreach so our team never sends generic cold DMs.',
              tab: 'clients',
            },
            {
              step: '3',
              title: 'Outreach & Follow-Up Cadence',
              desc: 'Log personalized initial touches and follow-ups. Ensure follow-up dates are set so the Home dashboard alerts you of upcoming due dates in the next 7 days.',
              tab: 'home',
            },
            {
              step: '4',
              title: 'Discovery Calls, Proposals & Closing',
              desc: 'Run discovery calls to pinpoint the creator’s funnel bottleneck. Issue custom proposals and close with contracts.',
              tab: 'sales',
            },
            {
              step: '5',
              title: 'Sprint Delivery & Milestones',
              desc: 'Turn closed clients into delivery projects in the Projects tab. Track completion %, adjust progress sliders, and issue milestone invoices in the Sales tab.',
              tab: 'projects',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {item.step}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <button
                    onClick={() => setActiveTab(item.tab as any)}
                    className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open {item.tab}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Content & Ad Campaigns */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-2xs transition-colors">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Content & Ad Planning Strategy
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Planning, writing, and measuring paid traffic campaigns.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white mb-1">1. Creative Hooks</div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Test bold direct-response hooks that spotlight creator pain points (e.g. manual spreadsheets, unmonetized communities).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white mb-1">2. Multi-Platform Delivery</div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Tag assets for Meta Ads, YouTube, X, or Newsletter syndication to keep copy and formats aligned.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white mb-1">3. ROAS & Spend Feedback</div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Log ad spend and ROAS metrics directly on each card so the marketing team knows which creatives drive high-ticket inquiries.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Keyboard Shortcuts & Team Sync */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-2xs transition-colors">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Team Collaboration & Pro Tips</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <Command className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Command Palette (⌘K)</div>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Press ⌘K or click the search box in the top bar to jump anywhere, trigger modals, or switch tabs instantly.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Team Chat & Accounts</div>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Each team member can create their own account with a username and password. Chat messages and workspace data persist in the Express backend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
