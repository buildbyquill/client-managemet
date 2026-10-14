import React, { useMemo, useState } from 'react';
import {
  Users,
  Flame,
  AlertTriangle,
  Globe,
  Building2,
  Phone,
  ArrowRight,
  FileSpreadsheet,
  Download,
  Plus,
  ExternalLink,
  MapPin,
  Sparkles,
  PhoneCall,
  Target,
  Table,
  LayoutGrid,
  CheckCircle2,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { exportLeadsToCSV } from '../utils/csvParser';
import { LeadAnalyticsChart } from './LeadAnalyticsChart';
import { LeadPriority } from '../types';

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const {
    clients,
    setActiveTab,
    setNewClientModalOpen,
    setImportCSVModalOpen,
    leadFilters,
    updateLeadFilters,
    resetLeadFilters,
    setProjectionMode,
    setSelectedClientId,
  } = useWorkspace();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Core metrics
  const totalLeads = clients.length;

  const highPriorityCount = useMemo(
    () => clients.filter((c) => (c.leadPriority || c.priority) === 'High').length,
    [clients]
  );

  const noWebsiteCount = useMemo(
    () =>
      clients.filter(
        (c) =>
          !c.websiteUrl ||
          c.websiteQuality === 'No Website' ||
          (c.problemFound && c.problemFound.toLowerCase().includes('no website'))
      ).length,
    [clients]
  );

  const needsAuditCount = useMemo(
    () =>
      clients.filter(
        (c) =>
          Boolean(c.websiteUrl) &&
          c.websiteQuality !== 'No Website' &&
          !(c.problemFound && c.problemFound.toLowerCase().includes('no website'))
      ).length,
    [clients]
  );

  // 1. Operator Cockpit Action Counts
  const readyForResearchCount = useMemo(
    () => clients.filter((c) => !c.researchStatus || c.researchStatus === 'New' || c.researchStatus === 'Researching').length,
    [clients]
  );

  const auditsReadyCount = useMemo(
    () => clients.filter((c) => c.researchStatus === 'Research Complete').length,
    [clients]
  );

  const readyForOutreachCount = useMemo(
    () => clients.filter((c) => c.researchStatus === 'Ready for Outreach' || (c.leadPriority || c.priority) === 'High').length,
    [clients]
  );

  const contactedCount = useMemo(
    () => clients.filter((c) => c.status === 'Contacted' || c.status === 'Call Scheduled' || c.status === 'Proposal').length,
    [clients]
  );

  // Next 5 Immediate Actionable Tasks
  const nextActionsList = useMemo(() => {
    return clients
      .filter((c) => c.nextAction)
      .slice(0, 5)
      .map((c) => ({
        leadId: c.id,
        businessName: c.title || c.name,
        actionText: c.nextAction || 'Review lead opportunity & conduct initial audit',
        dueDate: c.nextActionDueDate || 'Today',
        priority: c.leadPriority || c.priority || 'Low',
        phone: c.phoneNumber || c.phone,
        status: c.status || 'New Lead',
        researchStatus: c.researchStatus || 'New',
      }));
  }, [clients]);

  // 2. High Priority Hot Prospects Queue (Top urgent outreach targets)
  const highPriorityLeads = useMemo(
    () => clients.filter((c) => (c.leadPriority || c.priority) === 'High').slice(0, 6),
    [clients]
  );

  // 3. Industry Breakdown Calculations
  const industrySummary = useMemo(() => {
    const counts: Record<string, { total: number; noWeb: number; high: number }> = {};
    clients.forEach((c) => {
      const ind = c.industry || c.niche || 'Other';
      if (!counts[ind]) {
        counts[ind] = { total: 0, noWeb: 0, high: 0 };
      }
      counts[ind].total += 1;
      const hasNoWeb =
        !c.websiteUrl ||
        c.websiteQuality === 'No Website' ||
        (c.problemFound && c.problemFound.toLowerCase().includes('no website'));
      if (hasNoWeb) counts[ind].noWeb += 1;
      if ((c.leadPriority || c.priority) === 'High') counts[ind].high += 1;
    });

    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        total: data.total,
        noWeb: data.noWeb,
        high: data.high,
        percentage: totalLeads > 0 ? Math.round((data.total / totalLeads) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [clients, totalLeads]);

  const copyToClipboard = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleNavigateWithFilter = (updates: Parameters<typeof updateLeadFilters>[0]) => {
    resetLeadFilters();
    updateLeadFilters(updates);
    setActiveTab('clients');
    navigate('/leads');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto space-y-7 animate-in fade-in duration-200">
      {/* Top Banner & Quick Operations Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Operator Cockpit
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Active Campaign • {totalLeads} Qualified Leads
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Good morning! Here is your daily action-oriented workflow cockpit for outreach and research.
          </p>
        </div>

        {/* Global Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('clients');
              navigate('/leads');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
          >
            <span>Browse All Leads ({totalLeads})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setImportCSVModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportLeadsToCSV(clients)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setNewClientModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* TODAY'S ACTIONS (OPERATOR COCKPIT - Action-Oriented Metric Cards) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-600" />
          <span>Today's Actions Workflow</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Leads Ready for Research */}
          <button
            type="button"
            onClick={() => handleNavigateWithFilter({ researchStatus: 'New' })}
            className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:shadow-xs transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">
                Ready for Research
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {readyForResearchCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                <span>Needs opportunity scan</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">
                  Start →
                </span>
              </div>
            </div>
          </button>

          {/* Card 2: Audits Completed */}
          <button
            type="button"
            onClick={() => handleNavigateWithFilter({ researchStatus: 'Research Complete' })}
            className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:shadow-xs transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 transition-colors">
                Audits Completed
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/60">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {auditsReadyCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                <span>Audits & offers generated</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline">
                  Review →
                </span>
              </div>
            </div>
          </button>

          {/* Card 3: Ready for Outreach */}
          <button
            type="button"
            onClick={() => handleNavigateWithFilter({ priority: 'High' })}
            className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs hover:border-rose-300 dark:hover:border-rose-700/60 hover:shadow-xs transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-rose-600 transition-colors">
                Ready for Outreach
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/60">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {readyForOutreachCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                <span>High intent priority</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold group-hover:underline">
                  Outreach →
                </span>
              </div>
            </div>
          </button>

          {/* Card 4: Active Pipelines */}
          <button
            type="button"
            onClick={() => handleNavigateWithFilter({ leadStatus: 'Contacted' })}
            className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs hover:border-amber-300 dark:hover:border-amber-700/60 hover:shadow-xs transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-amber-600 transition-colors">
                Active Pipelines
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/60">
                <PhoneCall className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {contactedCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                <span>In discussion / proposal</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:underline">
                  Follow up →
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* TODAY'S NEXT ACTIONS (OPERATOR TASK COCKPIT) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Today's Priority Actions Queue
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Top 5 tasks queued for Ayushmaan
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {nextActionsList.map((action, idx) => (
            <div
              key={action.leadId}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-3 rounded-xl transition"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {action.businessName}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {action.researchStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">Next Action:</strong> {action.actionText}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <span className="text-[11px] text-slate-400 font-medium">
                  Due: {action.dueDate}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClientId(action.leadId);
                    setActiveTab('clients');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
                >
                  <span>Execute</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* THE CHART SECTION (Projecting Market Distribution & Category Breakdown) */}
      <div className="space-y-2">
        <LeadAnalyticsChart
          clients={clients}
          activeFilterIndustry={leadFilters.industry}
          activeFilterPriority={leadFilters.priority}
          activeFilterWebsite={leadFilters.websiteStatus}
          onFilterIndustry={(ind) => handleNavigateWithFilter({ industry: ind })}
          onFilterPriority={(prio) => handleNavigateWithFilter({ priority: prio as LeadPriority })}
          onFilterWebsite={(web) => handleNavigateWithFilter({ websiteStatus: web })}
          onResetFilters={() => resetLeadFilters()}
        />
      </div>

      {/* THE IMPORTANT DATA ("IMP TATA") GRID: HOT PROSPECTS & MARKET BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): High Priority Hot Prospects Action Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    High Priority Outreach Queue
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Top prospects needing immediate phone outreach or custom web proposal
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleNavigateWithFilter({ priority: 'High' })}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View All ({highPriorityCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Leads Cards / Row List */}
            <div className="space-y-3">
              {highPriorityLeads.map((lead) => {
                const hasNoWeb =
                  !lead.websiteUrl ||
                  lead.websiteQuality === 'No Website' ||
                  (lead.problemFound && lead.problemFound.toLowerCase().includes('no website'));

                return (
                  <div
                    key={lead.id}
                    onClick={() => {
                      setSelectedClientId(lead.id);
                      setActiveTab('clients');
                    }}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {/* Business Title & Location */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {lead.title || lead.company}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {lead.industry || lead.niche}
                          </span>
                          {hasNoWeb ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              No Website
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              Needs Audit
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-md">{lead.address || 'Mohali'}</span>
                        </div>
                      </div>

                      {/* Phone & Direct Dial */}
                      <div className="flex items-center gap-2 shrink-0">
                        {lead.phoneNumber && (
                          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                            <a
                              href={`tel:${lead.phoneNumber}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition"
                              title="Direct call"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{lead.phoneNumber}</span>
                            </a>
                            <button
                              type="button"
                              onClick={(e) => copyToClipboard(lead.phoneNumber, lead.id, e)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition"
                              title="Copy phone"
                            >
                              {copiedId === lead.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </div>
                    </div>

                    {/* Sales Opportunity / Problem Found Hook */}
                    {(lead.problemFound || lead.notes) && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs flex flex-col sm:flex-row gap-2">
                        {lead.problemFound && (
                          <div className="flex-1 bg-amber-50/70 dark:bg-amber-950/30 rounded-lg p-2 border border-amber-200/50 dark:border-amber-800/40">
                            <span className="font-bold text-amber-800 dark:text-amber-300">
                              Problem Found:{' '}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">
                              {lead.problemFound}
                            </span>
                          </div>
                        )}
                        {lead.notes && (
                          <div className="flex-1 bg-slate-100/70 dark:bg-slate-800/60 rounded-lg p-2 border border-slate-200/60 dark:border-slate-700/50">
                            <span className="font-bold text-slate-600 dark:text-slate-300">
                              Pitch Hook:{' '}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">
                              {lead.notes}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Market Opportunities & Fast Launchpad */}
        <div className="space-y-6">
          {/* Quick Launchpad to Lead Views */}
          <div className="glass-card rounded-2xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Outreach Cockpits
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5">
              Launch directly into specialized lead views:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setProjectionMode('cards');
                  setActiveTab('clients');
                  navigate('/leads');
                }}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-1.5">
                  <LayoutGrid className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Cards Grid</div>
                <div className="text-[10px] text-slate-500">Visual dossiers</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProjectionMode('table');
                  setActiveTab('clients');
                  navigate('/leads');
                }}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-emerald-400 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-1.5">
                  <Table className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">CRM Table</div>
                <div className="text-[10px] text-slate-500">11-col data sheet</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProjectionMode('opportunity');
                  setActiveTab('clients');
                  navigate('/leads');
                }}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-rose-400 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-1.5">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Opportunities</div>
                <div className="text-[10px] text-slate-500">Targeted cold pitches</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProjectionMode('dialer');
                  setActiveTab('clients');
                  navigate('/leads');
                }}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-1.5">
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Speed Dialer</div>
                <div className="text-[10px] text-slate-500">Calling power sprint</div>
              </button>
            </div>
          </div>

          {/* Industry Distribution Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Industry Breakdown
              </h2>
              <span className="text-xs font-medium text-slate-400">
                {industrySummary.length} Niches
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {industrySummary.map((ind) => (
                <div
                  key={ind.name}
                  onClick={() => handleNavigateWithFilter({ industry: ind.name })}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800/80 bg-slate-50/40 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {ind.name}
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">
                      {ind.total} leads ({ind.percentage}%)
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className="bg-amber-500 h-full"
                      style={{ width: `${ind.total > 0 ? (ind.noWeb / ind.total) * 100 : 0}%` }}
                      title={`${ind.noWeb} No Website`}
                    />
                    <div
                      className="bg-indigo-500 h-full"
                      style={{
                        width: `${ind.total > 0 ? ((ind.total - ind.noWeb) / ind.total) * 100 : 0}%`,
                      }}
                      title={`${ind.total - ind.noWeb} Has Website`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    <span>
                      {ind.noWeb} No Website • {ind.high} High Priority
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline">
                      Filter →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
