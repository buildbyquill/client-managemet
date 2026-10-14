import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Phone,
  ExternalLink,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Eye,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  LayoutGrid,
  List,
  Sparkles,
  ChevronDown,
  Building2,
  Globe,
  Star,
  Flame,
  Kanban,
  Table,
  Target,
  PhoneCall,
  Lightbulb,
  X,
  Zap,
  Archive,
  AlignJustify,
  Square,
  CheckSquare,
  Inbox,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Client, LeadPriority, LeadStatus, LEAD_STATUSES, RESEARCH_STATUSES, ProjectionMode } from '../types';
import { exportLeadsToCSV } from '../utils/csvParser';
import { useDebounce } from '../utils/useDebounce';
import { LeadTableView } from './LeadTableView';
import { LeadOpportunityView } from './LeadOpportunityView';
import { LeadDialerView } from './LeadDialerView';
import { LeadStrategiesModal } from './LeadStrategiesModal';
import { LeadCardsView } from './LeadCardsView';
import { LeadCompactTableView } from './LeadCompactTableView';

export type ActionBucket = 'all' | 'ready-to-pitch' | 'needs-audit' | 'follow-up-today' | 'closing-queue';

export const ClientsView: React.FC = () => {
  const {
    clients,
    updateClient,
    updateClients,
    deleteClient,
    setNewClientModalOpen,
    setImportCSVModalOpen,
    setSelectedClientId,
    resetToDefaultLeads,
    leadFilters,
    updateLeadFilters,
    resetLeadFilters,
    projectionMode,
    setProjectionMode,
  } = useWorkspace();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isStrategiesModalOpen, setIsStrategiesModalOpen] = useState(false);

  // 1. 🚀 ONE-CLICK ACTION BUCKETS STATE
  const [activeBucket, setActiveBucket] = useState<ActionBucket>('all');

  // 2. ☑️ DISPLAY DENSITY & BATCH SELECTION
  const [densityMode, setDensityMode] = useState<'comfortable' | 'compact'>('compact');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Batch selection handlers
  const toggleSelectLead = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // ⌨️ KEYBOARD HOTKEYS
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't fire if typing in an input, textarea, or select
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      // Don't fire if modifier key is held (except Escape)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case 'n':
        case 'N':
          e.preventDefault();
          setNewClientModalOpen(true);
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          setImportCSVModalOpen(true);
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          exportLeadsToCSV(clients);
          break;
        case '1':
          e.preventDefault();
          setProjectionMode('cards');
          break;
        case '2':
          e.preventDefault();
          setProjectionMode('table');
          break;
        case '3':
          e.preventDefault();
          setProjectionMode('opportunity');
          break;
        case '4':
          e.preventDefault();
          setProjectionMode('dialer');
          break;
        case 'Escape':
          if (selectedIds.size > 0) {
            deselectAll();
          } else {
            updateLeadFilters({ searchQuery: '' });
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIds, deselectAll, setNewClientModalOpen, setImportCSVModalOpen, setProjectionMode, updateLeadFilters, clients]);

  // Action Bucket Predicates
  // Ready to Pitch = Qualified + actionable problem + reachable contact
  const readyToPitchPredicate = useCallback((c: Client) => {
    const hasContact = Boolean(c.phoneNumber || c.phone);
    const hasProblemOrQualified =
      (c.leadPriority || c.priority) === 'High' || Boolean(c.problemFound) || Boolean(c.keyDetail);
    const isNotClosed = c.status !== 'Converted' && c.status !== 'Not Interested';
    return hasContact && hasProblemOrQualified && isNotClosed;
  }, []);

  // Needs Audit = New lead or unreviewed research
  const needsAuditPredicate = useCallback((c: Client) => {
    const isPending =
      !c.researchStatus ||
      c.researchStatus === 'New' ||
      c.researchStatus === 'Researching' ||
      c.websiteQuality === 'Needs Review';
    const isNotClosed = c.status !== 'Converted' && c.status !== 'Not Interested';
    return isPending && isNotClosed;
  }, []);

  // Follow-Up Today = Action scheduled or nextAction due
  const followUpTodayPredicate = useCallback((c: Client) => {
    return c.status === 'Call Scheduled' || Boolean(c.nextAction) || Boolean(c.nextActionDueDate);
  }, []);

  // Closing Queue = Proposals out or calls booked
  const closingQueuePredicate = useCallback((c: Client) => {
    return (
      c.status === 'Call Scheduled' ||
      c.status === 'Proposal' ||
      c.stage === 'Call' ||
      c.stage === 'Proposal'
    );
  }, []);

  // Live Counts for Action Buckets
  const bucketCounts = useMemo(() => {
    return {
      readyToPitch: clients.filter(readyToPitchPredicate).length,
      needsAudit: clients.filter(needsAuditPredicate).length,
      followUpToday: clients.filter(followUpTodayPredicate).length,
      closingQueue: clients.filter(closingQueuePredicate).length,
    };
  }, [clients, readyToPitchPredicate, needsAuditPredicate, followUpTodayPredicate, closingQueuePredicate]);


  // Extract unique industries from current leads
  const industries = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      const ind = c.industry || c.niche;
      if (ind) set.add(ind);
    });
    return Array.from(set).sort();
  }, [clients]);

  // Dynamic metrics calculation
  const metrics = useMemo(() => {
    const total = clients.length;
    const highPriority = clients.filter(
      (c) => (c.leadPriority || c.priority) === 'High'
    ).length;
    const noWebsite = clients.filter(
      (c) =>
        !c.websiteUrl ||
        c.websiteQuality === 'No Website' ||
        (c.problemFound && c.problemFound.toLowerCase().includes('no website'))
    ).length;
    const needsReview = clients.filter(
      (c) => c.websiteQuality === 'Needs Review'
    ).length;
    const contacted = clients.filter(
      (c) => c.status && c.status !== 'New Lead'
    ).length;

    return { total, highPriority, noWebsite, needsReview, contacted };
  }, [clients]);

  // Debounce search query to prevent re-filtering on every single keystroke
  const debouncedSearch = useDebounce(leadFilters.searchQuery, 180);

  // Filtered leads derived from global leadFilters, debounced search, and active action bucket
  const filteredLeads = useMemo(() => {
    return clients.filter((client) => {
      // Always exclude rejected leads from the active view
      if (client.isRejected) return false;
      // 1. Action Bucket Filter
      if (activeBucket === 'ready-to-pitch' && !readyToPitchPredicate(client)) return false;
      if (activeBucket === 'needs-audit' && !needsAuditPredicate(client)) return false;
      if (activeBucket === 'follow-up-today' && !followUpTodayPredicate(client)) return false;
      if (activeBucket === 'closing-queue' && !closingQueuePredicate(client)) return false;

      // 2. Search Query Filter
      const title = (client.title || client.name || '').toLowerCase();
      const address = (client.address || '').toLowerCase();
      const phone = (client.phoneNumber || client.phone || '').toLowerCase();
      const industry = (client.industry || client.niche || '').toLowerCase();
      const city = (client.city || '').toLowerCase();
      const notes = (client.notes || '').toLowerCase();
      const problem = (client.problemFound || client.keyDetail || '').toLowerCase();

      const query = (debouncedSearch || '').toLowerCase().trim();
      const matchesSearch =
        !query ||
        title.includes(query) ||
        address.includes(query) ||
        phone.includes(query) ||
        industry.includes(query) ||
        city.includes(query) ||
        notes.includes(query) ||
        problem.includes(query);

      // 3. Dropdown Filters
      const clientInd = client.industry || client.niche || '';
      const matchesIndustry =
        leadFilters.industry === 'all' ||
        clientInd.toLowerCase().includes(leadFilters.industry.toLowerCase());

      const clientPrio = client.leadPriority || client.priority || 'Low';
      const matchesPriority =
        leadFilters.priority === 'all' || clientPrio === leadFilters.priority;

      const hasNoWeb =
        !client.websiteUrl ||
        client.websiteQuality === 'No Website' ||
        (client.problemFound && client.problemFound.toLowerCase().includes('no website'));
      const matchesWebStatus =
        leadFilters.websiteStatus === 'all' ||
        (leadFilters.websiteStatus === 'no-website' && hasNoWeb) ||
        (leadFilters.websiteStatus === 'has-website' && !hasNoWeb);

      const clientStatus = client.status || 'New Lead';
      const matchesLeadStatus =
        leadFilters.leadStatus === 'all' || clientStatus === leadFilters.leadStatus;

      const clientResearchStatus = client.researchStatus || 'New';
      const matchesResearchStatus =
        !leadFilters.researchStatus ||
        leadFilters.researchStatus === 'all' ||
        clientResearchStatus === leadFilters.researchStatus;

      return (
        matchesSearch &&
        matchesIndustry &&
        matchesPriority &&
        matchesWebStatus &&
        matchesLeadStatus &&
        matchesResearchStatus
      );
    });
  }, [
    clients,
    activeBucket,
    readyToPitchPredicate,
    needsAuditPredicate,
    followUpTodayPredicate,
    closingQueuePredicate,
    leadFilters.industry,
    leadFilters.priority,
    leadFilters.websiteStatus,
    leadFilters.leadStatus,
    leadFilters.researchStatus,
    debouncedSearch,
  ]);

  const selectAllFiltered = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filteredLeads.length && filteredLeads.length > 0) {
        return new Set();
      }
      return new Set(filteredLeads.map((c) => c.id));
    });
  }, [filteredLeads]);

  // Batch actions
  const handleBatchAdvance = (newStatus: LeadStatus) => {
    const ids = Array.from(selectedIds);
    updateClients(ids, {
      status: newStatus,
      stage: newStatus === 'Converted' ? 'Won' : newStatus === 'Contacted' ? 'Call' : 'Lead',
    });
    deselectAll();
  };

  const handleBatchSetPriority = (newPriority: LeadPriority) => {
    const ids = Array.from(selectedIds);
    updateClients(ids, { leadPriority: newPriority, priority: newPriority });
    deselectAll();
  };

  const handleBatchExport = () => {
    const selectedClients = clients.filter((c) => selectedIds.has(c.id));
    exportLeadsToCSV(selectedClients.length > 0 ? selectedClients : filteredLeads);
  };

  const handleBatchArchive = () => {
    const ids = Array.from(selectedIds);
    updateClients(ids, { status: 'Not Interested', stage: 'Lost' });
    deselectAll();
  };

  const copyToClipboard = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getIndustryBadgeStyle = (ind: string) => {
    const lower = ind.toLowerCase();
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

  const hasActiveFilters =
    leadFilters.industry !== 'all' ||
    leadFilters.priority !== 'all' ||
    leadFilters.websiteStatus !== 'all' ||
    leadFilters.leadStatus !== 'all' ||
    (Boolean(leadFilters.researchStatus) && leadFilters.researchStatus !== 'all') ||
    Boolean(leadFilters.searchQuery);

  return (
    <div className="p-6 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Leads
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {clients.filter(c => !c.isRejected).length} Active Leads
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, filter, and research your lead database.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setImportCSVModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => exportLeadsToCSV(clients)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setNewClientModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* 🚀 ONE-CLICK ACTION BUCKETS BAR */}
      <div className="flex flex-wrap items-center gap-2">
        {/* All */}
        <button
          onClick={() => setActiveBucket('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activeBucket === 'all'
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 bg-white dark:bg-slate-900'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>All Leads</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
            activeBucket === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}>{clients.length}</span>
        </button>

        {/* Ready to Pitch */}
        <button
          onClick={() => setActiveBucket(activeBucket === 'ready-to-pitch' ? 'all' : 'ready-to-pitch')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activeBucket === 'ready-to-pitch'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 bg-white dark:bg-slate-900'
          }`}
          title="Ready to Pitch: Qualified + has contact info + actionable problem found"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Ready to Pitch</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
            activeBucket === 'ready-to-pitch' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
          }`}>{bucketCounts.readyToPitch}</span>
        </button>

        {/* Needs Audit */}
        <button
          onClick={() => setActiveBucket(activeBucket === 'needs-audit' ? 'all' : 'needs-audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activeBucket === 'needs-audit'
              ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
              : 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 bg-white dark:bg-slate-900'
          }`}
          title="Needs Audit: New or unreviewed leads that need research"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Needs Audit</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
            activeBucket === 'needs-audit' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
          }`}>{bucketCounts.needsAudit}</span>
        </button>

        {/* Follow-Up Today */}
        <button
          onClick={() => setActiveBucket(activeBucket === 'follow-up-today' ? 'all' : 'follow-up-today')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activeBucket === 'follow-up-today'
              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
              : 'border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 bg-white dark:bg-slate-900'
          }`}
          title="Follow-Up Today: Call scheduled or has a next action due"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Follow-Up Today</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
            activeBucket === 'follow-up-today' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
          }`}>{bucketCounts.followUpToday}</span>
        </button>

        {/* Closing Queue */}
        <button
          onClick={() => setActiveBucket(activeBucket === 'closing-queue' ? 'all' : 'closing-queue')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activeBucket === 'closing-queue'
              ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
              : 'border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 bg-white dark:bg-slate-900'
          }`}
          title="Closing Queue: Proposal sent or call booked — almost there"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Closing Queue</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
            activeBucket === 'closing-queue' ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
          }`}>{bucketCounts.closingQueue}</span>
        </button>

        {/* Hotkeys hint */}
        <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-600 hidden lg:block font-mono">
          N=new · I=import · E=export · 1=cards · 2=table · Esc=clear
        </span>
      </div>

      {/* Projection Mode Switcher & Filter Toolbar (Direct, Clean Glass Panel) */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm">
        {/* Row 1: Search & Projection Modes */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by title, address, phone number, industry, audit notes..."
              value={leadFilters.searchQuery}
              onChange={(e) => updateLeadFilters({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition"
            />
            {leadFilters.searchQuery && (
              <button
                onClick={() => updateLeadFilters({ searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2 View Mode Buttons: Cards & Table */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setProjectionMode('cards')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                  projectionMode === 'cards'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Cards Grid (default)"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
                <span>Cards</span>
              </button>

              <button
                onClick={() => setProjectionMode('table')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                  projectionMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Table View"
              >
                <Table className="w-3.5 h-3.5 text-emerald-600" />
                <span>Table</span>
              </button>
            </div>

            {/* Density Toggle */}
            <button
              onClick={() => setDensityMode(d => d === 'comfortable' ? 'compact' : 'comfortable')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium transition shadow-2xs"
              title={`Toggle density: currently ${densityMode}`}
            >
              {densityMode === 'compact' ? (
                <AlignJustify className="w-3.5 h-3.5" />
              ) : (
                <List className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{densityMode === 'compact' ? 'Compact' : 'Comfortable'}</span>
            </button>

            {/* Select All Visible */}
            <button
              onClick={selectAllFiltered}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition shadow-2xs ${
                selectedIds.size > 0 && selectedIds.size === filteredLeads.length
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={selectedIds.size === filteredLeads.length ? 'Deselect all' : `Select all ${filteredLeads.length} visible leads`}
            >
              {selectedIds.size > 0 && selectedIds.size === filteredLeads.length ? (
                <CheckSquare className="w-3.5 h-3.5" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select All'}
              </span>
            </button>

            {/* Reset to Default 40 CSV Leads */}
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition shadow-2xs"
              title="Reset to 40 Initial CSV Leads"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Dropdown Filters & Active Filter Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Industry Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Industry:</span>
              <select
                value={leadFilters.industry}
                onChange={(e) => updateLeadFilters({ industry: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="all">All Industries ({clients.length})</option>
                {industries.map((ind) => {
                  const count = clients.filter((c) => (c.industry || c.niche) === ind).length;
                  return (
                    <option key={ind} value={ind}>
                      {ind} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Priority Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Priority:</span>
              <select
                value={leadFilters.priority}
                onChange={(e) => updateLeadFilters({ priority: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="all">All Priorities</option>
                <option value="High">High Priority ({metrics.highPriority})</option>
                <option value="Low">Low Priority ({clients.length - metrics.highPriority})</option>
              </select>
            </div>

            {/* Website Status Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Website:</span>
              <select
                value={leadFilters.websiteStatus}
                onChange={(e) => updateLeadFilters({ websiteStatus: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="all">All Websites</option>
                <option value="no-website">No Website ({metrics.noWebsite})</option>
                <option value="has-website">Has Website ({clients.length - metrics.noWebsite})</option>
              </select>
            </div>

            {/* Research Status Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Research Status:</span>
              <select
                value={leadFilters.researchStatus || 'all'}
                onChange={(e) => updateLeadFilters({ researchStatus: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium"
              >
                <option value="all">All Research Progress</option>
                {RESEARCH_STATUSES.map((rs) => (
                  <option key={rs} value={rs}>
                    {rs}
                  </option>
                ))}
              </select>
            </div>

            {/* Outreach Status Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Outreach:</span>
              <select
                value={leadFilters.leadStatus}
                onChange={(e) => updateLeadFilters({ leadStatus: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="all">All Outreach Stages</option>
                {LEAD_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset All Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={() => resetLeadFilters()}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Showing count indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredLeads.length}</strong> of{' '}
            {clients.length} leads
          </span>
          {hasActiveFilters && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
              Filters Active
            </span>
          )}
        </div>

        {filteredLeads.length === 0 && (
          <div className="flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              No leads match current filters
            </span>
            <button
              onClick={() => resetLeadFilters()}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* RENDER ACTIVE PROJECTION MODE */}
      {projectionMode === 'table' && (
        <LeadTableView
          leads={filteredLeads}
          onSelectLead={setSelectedClientId}
          getIndustryBadgeStyle={getIndustryBadgeStyle}
        />
      )}

      {projectionMode === 'opportunity' && (
        <LeadOpportunityView
          leads={filteredLeads}
          onSelectLead={setSelectedClientId}
          getIndustryBadgeStyle={getIndustryBadgeStyle}
        />
      )}

      {projectionMode === 'dialer' && (
        <LeadDialerView
          leads={filteredLeads}
          onSelectLead={setSelectedClientId}
          getIndustryBadgeStyle={getIndustryBadgeStyle}
        />
      )}

      {(projectionMode === 'cards' || projectionMode === ('kanban' as any)) && (
        <LeadCardsView
          leads={filteredLeads}
          onSelectLead={setSelectedClientId}
          getIndustryBadgeStyle={getIndustryBadgeStyle}
        />
      )}

      {/* Better Ways to Project Leads Modal */}
      <LeadStrategiesModal
        isOpen={isStrategiesModalOpen}
        onClose={() => setIsStrategiesModalOpen(false)}
        currentMode={projectionMode}
        onSelectMode={setProjectionMode}
      />

      {/* ☑️ FLOATING BATCH OPERATIONS TOOLBAR */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 shadow-2xl shadow-black/40 text-white">
            {/* Count */}
            <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">{selectedIds.size} selected</span>
            </div>

            {/* Stage Updates */}
            <button
              onClick={() => handleBatchAdvance('Contacted')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/30 transition"
              title="Mark selected as Contacted"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contacted</span>
            </button>

            <button
              onClick={() => handleBatchAdvance('Proposal')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 transition"
              title="Move selected to Proposal stage"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Proposal</span>
            </button>

            {/* Priority Updates */}
            <div className="w-px h-5 bg-slate-700" />

            <button
              onClick={() => handleBatchSetPriority('High')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 transition"
              title="Set priority to High"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>High Priority</span>
            </button>

            {/* Export selected */}
            <button
              onClick={handleBatchExport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 hover:bg-slate-600/80 text-slate-200 border border-slate-600 transition"
              title="Export selected leads to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {/* Archive */}
            <button
              onClick={handleBatchArchive}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-600 transition"
              title="Archive selected leads (mark as Not Interested)"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>

            {/* Dismiss */}
            <div className="w-px h-5 bg-slate-700" />
            <button
              onClick={deselectAll}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="Deselect all (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation modal for Reset to 40 Initial Leads */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Reset to 40 Sample Leads?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This will reload the 40 original leads from your CSV file (Dentists, Bakeries, and Jewelry Brands in Mohali).
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToDefaultLeads();
                  setIsResetConfirmOpen(false);
                }}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
