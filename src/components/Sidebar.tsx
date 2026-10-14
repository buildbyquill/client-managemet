/**
 * Sidebar.tsx — Quill Land Lead Manager
 *
 * Primary navigation:
 *   TODAY · LEADS · CALLING · ANALYTICS · SETTINGS
 *
 * Nothing else in the primary nav.
 * Quick actions: Add Lead, Import CSV, Export CSV.
 * Target Filters: All, High Priority, No Website, By Industry.
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CalendarCheck,
  Users,
  Phone,
  BarChart2,
  Settings,
  Plus,
  FileSpreadsheet,
  Download,
  Moon,
  Sun,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { exportLeadsToCSV } from '../utils/csvParser';
import { QuillLogo } from './QuillLogo';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const {
    clients,
    theme,
    toggleTheme,
    setNewClientModalOpen,
    setImportCSVModalOpen,
    leadFilters,
    updateLeadFilters,
    resetLeadFilters,
  } = useWorkspace();

  // ─── Counts ────────────────────────────────────────────────────────────────
  const activeClients = clients.filter((c) => !c.isRejected);

  const highPriorityCount = activeClients.filter(
    (c) => (c.leadPriority || c.priority) === 'High'
  ).length;

  const noWebsiteCount = activeClients.filter(
    (c) =>
      !c.websiteUrl ||
      c.websiteQuality === 'No Website' ||
      (c.problemFound && c.problemFound.toLowerCase().includes('no website'))
  ).length;

  const needsResearchCount = activeClients.filter(
    (c) => !c.researchStatus || c.researchStatus === 'Needs Research' || c.researchStatus === 'Researching'
  ).length;

  const readyToCallCount = activeClients.filter(
    (c) => c.status === 'Ready to Call' || c.researchStatus === 'Ready to Call'
  ).length;

  const followUpTodayCount = activeClients.filter((c) => {
    if (c.followUpStatus === 'Today' || c.followUpStatus === 'Overdue') return true;
    if (!c.nextFollowUpDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return c.nextFollowUpDate <= today;
  }).length;

  // ─── All industries ────────────────────────────────────────────────────────
  const allIndustries: string[] = Array.from(
    new Set<string>(activeClients.map((c) => String(c.industry || c.niche || 'General')))
  ).filter(Boolean).sort();

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const isActive = (path: string) => currentPath.startsWith(path);

  const navBtn = (path: string, label: string, Icon: React.FC<{ className?: string }>, badge?: string | number, badgeColor = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400') => (
    <button
      onClick={() => navigate(path)}
      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
        isActive(path)
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      {badge !== undefined && badge !== 0 && (
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${isActive(path) ? 'bg-white/20 text-white' : badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  );

  const filterBtn = (label: string, Icon: React.FC<{ className?: string }>, count: number, onClick: () => void, active: boolean, colorClass: string) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition ${
        active
          ? `${colorClass} font-semibold`
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <span className="font-mono text-[11px] font-bold">{count}</span>
    </button>
  );

  return (
    <aside className="w-64 glass-panel border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between shrink-0 select-none h-screen sticky top-0 overflow-y-auto transition-colors z-30">
      <div>
        {/* ── Brand Header ──────────────────────────────────────────────── */}
        <div className="px-5 py-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center gap-3">
          <div className="shrink-0">
            <QuillLogo size={34} className="rounded-xl shadow-xs" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>Quill Land</span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-500/20">
                LEAD
              </span>
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Collect · Research · Call
            </div>
          </div>
        </div>

        {/* ── Primary Navigation ─────────────────────────────────────────── */}
        <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60 space-y-1">
          {navBtn('/today', 'TODAY', CalendarCheck, followUpTodayCount > 0 ? followUpTodayCount : undefined, 'bg-amber-500/10 text-amber-600 dark:text-amber-400')}
          {navBtn('/leads', 'LEADS', Users, activeClients.length)}
          {navBtn('/calling', 'CALLING', Phone, readyToCallCount > 0 ? readyToCallCount : undefined, 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400')}
          {navBtn('/analytics', 'ANALYTICS', BarChart2)}
          {navBtn('/settings', 'SETTINGS', Settings)}
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
          <button
            onClick={() => setNewClientModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Lead</span>
          </button>
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button
              onClick={() => setImportCSVModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={() => exportLeadsToCSV(clients)}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* ── Quick Filters ─────────────────────────────────────────────── */}
        <div className="p-3 space-y-3">
          <div className="px-2 mb-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Quick Filters
          </div>
          <div className="space-y-0.5">
            {/* All */}
            <button
              onClick={() => { resetLeadFilters(); navigate('/leads'); }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                leadFilters.priority === 'all' && leadFilters.industry === 'all' && leadFilters.websiteStatus === 'all' && !leadFilters.searchQuery
                  ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>All Leads</span>
              </div>
              <span className="font-mono text-[11px]">{activeClients.length}</span>
            </button>

            {/* High Priority */}
            {filterBtn(
              'High Priority', Flame, highPriorityCount,
              () => { updateLeadFilters({ priority: leadFilters.priority === 'High' ? 'all' : 'High' }); navigate('/leads'); },
              leadFilters.priority === 'High',
              'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
            )}

            {/* No Website */}
            {filterBtn(
              'No Website', AlertTriangle, noWebsiteCount,
              () => { updateLeadFilters({ websiteStatus: leadFilters.websiteStatus === 'no-website' ? 'all' : 'no-website' }); navigate('/leads'); },
              leadFilters.websiteStatus === 'no-website',
              'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            )}

            {/* Needs Research */}
            {needsResearchCount > 0 && filterBtn(
              'Needs Research', Users, needsResearchCount,
              () => { updateLeadFilters({ researchStatus: 'Needs Research' }); navigate('/leads'); },
              leadFilters.researchStatus === 'Needs Research',
              'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
            )}
          </div>

          {/* By Industry */}
          {allIndustries.length > 0 && (
            <div className="mt-2">
              <div className="px-2 mb-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                By Industry
              </div>
              <div className="space-y-0.5 text-xs">
                {allIndustries.slice(0, 6).map((ind) => {
                  const count = activeClients.filter(
                    (c) => (c.industry || c.niche || 'General').toLowerCase() === ind.toLowerCase()
                  ).length;
                  const isSelected = leadFilters.industry.toLowerCase() === ind.toLowerCase();
                  return (
                    <button
                      key={ind}
                      onClick={() => {
                        updateLeadFilters({ industry: isSelected ? 'all' : ind });
                        navigate('/leads');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
                        isSelected
                          ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/30'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="truncate max-w-[130px]">{ind}</span>
                      <span className="font-mono text-[11px] text-slate-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom: Theme Toggle ─────────────────────────────────────────── */}
      <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/30">
        <button
          type="button"
          id="sidebar-theme-toggle-btn"
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
            theme === 'dark'
              ? 'bg-slate-900 border-indigo-500/30 text-indigo-300 hover:bg-slate-800/80'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
            {theme.toUpperCase()}
          </span>
        </button>
      </div>
    </aside>
  );
};
