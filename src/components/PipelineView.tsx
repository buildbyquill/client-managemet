import React, { useMemo } from 'react';
import {
  Kanban,
  Plus,
  FileSpreadsheet,
  Download,
  Filter,
  Sparkles,
  ArrowRight,
  Target,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { LeadKanbanView } from './LeadKanbanView';
import { exportLeadsToCSV } from '../utils/csvParser';

export const PipelineView: React.FC = () => {
  const {
    clients,
    setSelectedClientId,
    setNewClientModalOpen,
    setImportCSVModalOpen,
    leadFilters,
    updateLeadFilters,
  } = useWorkspace();

  const metrics = useMemo(() => {
    const total = clients.length;
    const newLeads = clients.filter((c) => !c.status || c.status === 'New Lead').length;
    const underReview = clients.filter((c) => c.status === 'Under Review').length;
    const contacted = clients.filter((c) => c.status === 'Contacted').length;
    const scheduled = clients.filter((c) => c.status === 'Call Scheduled').length;
    const won = clients.filter((c) => c.status === 'Converted').length;

    // Projected pipeline value (assuming $1.5k avg agency deal size)
    const pipelineValue = (contacted + scheduled) * 1500 + won * 2500;

    return { total, newLeads, underReview, contacted, scheduled, won, pipelineValue };
  }, [clients]);

  const getIndustryBadgeStyle = (ind: string) => {
    const lower = (ind || '').toLowerCase();
    if (lower.includes('dentist')) {
      return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    }
    if (lower.includes('baker')) {
      return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
    if (lower.includes('jewel')) {
      return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
    return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Kanban className="w-6 h-6 text-indigo-500" />
              <span>Agency Pipeline & Stages</span>
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {clients.length} Total Deals
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visual stage progression: Find → Research → Qualify → Outreach → Pipeline → Close.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportCSVModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Import</span>
          </button>
          <button
            onClick={() => exportLeadsToCSV(clients)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setNewClientModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Pipeline Velocity KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-card p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">New Leads</div>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">{metrics.newLeads}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Awaiting audit</div>
        </div>

        <div className="glass-card p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Research</div>
          <div className="text-xl font-bold text-purple-700 dark:text-purple-300 mt-1">{metrics.underReview}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Auditing profile</div>
        </div>

        <div className="glass-card p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Pitched</div>
          <div className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-1">{metrics.contacted}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Outreach sent</div>
        </div>

        <div className="glass-card p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Call Set</div>
          <div className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1">{metrics.scheduled}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Hot opportunities</div>
        </div>

        <div className="glass-card p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Won / Clients</div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{metrics.won}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Closed deals 🎉</div>
        </div>

        <div className="glass-card p-3.5 rounded-xl border border-indigo-200/60 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20">
          <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Est. Pipeline</div>
          <div className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">
            ${metrics.pipelineValue.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active value</div>
        </div>
      </div>

      {/* Interactive Kanban Board */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 overflow-hidden">
        <LeadKanbanView
          leads={clients}
          onSelectLead={setSelectedClientId}
          getIndustryBadgeStyle={getIndustryBadgeStyle}
        />
      </div>
    </div>
  );
};
