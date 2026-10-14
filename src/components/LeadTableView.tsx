import React, { useState, useMemo } from 'react';
import {
  Phone,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Flame,
  AlertTriangle,
  Eye,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  CheckSquare,
  Square,
  Users,
} from 'lucide-react';
import { Client, LeadStatus, LEAD_STATUSES, ResearchStatus, RESEARCH_STATUSES } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import { exportLeadsToCSV } from '../utils/csvParser';

interface LeadTableViewProps {
  leads: Client[];
  onSelectLead: (id: string) => void;
  getIndustryBadgeStyle: (ind: string) => string;
}

type SortField = 'title' | 'industry' | 'priority' | 'status' | 'phone' | 'researchStatus';
type SortDirection = 'asc' | 'desc';

export const LeadTableView: React.FC<LeadTableViewProps> = ({
  leads,
  onSelectLead,
  getIndustryBadgeStyle,
}) => {
  const { updateClient, deleteClient, deleteClients } = useWorkspace();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const copyToClipboard = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Sort leads
  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      let aVal = '';
      let bVal = '';

      if (sortField === 'title') {
        aVal = a.title || a.name || '';
        bVal = b.title || b.name || '';
      } else if (sortField === 'industry') {
        aVal = a.industry || a.niche || '';
        bVal = b.industry || b.niche || '';
      } else if (sortField === 'priority') {
        aVal = (a.leadPriority || a.priority) === 'High' ? '2' : '1';
        bVal = (b.leadPriority || b.priority) === 'High' ? '2' : '1';
      } else if (sortField === 'status') {
        aVal = a.status || 'New Lead';
        bVal = b.status || 'New Lead';
      } else if (sortField === 'phone') {
        aVal = a.phoneNumber || a.phone || '';
        bVal = b.phoneNumber || b.phone || '';
      } else if (sortField === 'researchStatus') {
        aVal = a.researchStatus || 'New';
        bVal = b.researchStatus || 'New';
      }

      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [leads, sortField, sortDir]);

  // Selection handlers
  const isAllSelected = leads.length > 0 && selectedLeadIds.length === leads.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  const toggleSelectLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Batch actions
  const handleBatchStatus = (newStatus: LeadStatus) => {
    selectedLeadIds.forEach((id) => {
      updateClient(id, {
        status: newStatus,
        stage: newStatus === 'Converted' ? 'Won' : newStatus === 'Contacted' ? 'Call' : 'Lead',
      });
    });
    setSelectedLeadIds([]);
  };

  const handleBatchPriority = (newPriority: 'High' | 'Low') => {
    selectedLeadIds.forEach((id) => {
      updateClient(id, {
        leadPriority: newPriority,
        priority: newPriority,
      });
    });
    setSelectedLeadIds([]);
  };

  const handleBatchExport = () => {
    const subset = leads.filter((l) => selectedLeadIds.includes(l.id));
    exportLeadsToCSV(subset);
  };

  const handleBatchDelete = () => {
    if (confirm(`Are you sure you want to permanently delete ${selectedLeadIds.length} selected lead(s)?`)) {
      deleteClients(selectedLeadIds);
      setSelectedLeadIds([]);
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
    );
  };

  return (
    <div className="space-y-3">
      {/* Floating Batch Actions Bar when rows selected */}
      {selectedLeadIds.length > 0 && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              {selectedLeadIds.length} leads selected
            </span>
            <button
              onClick={() => setSelectedLeadIds([])}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear selection
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => handleBatchStatus('Contacted')}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 font-semibold"
            >
              Mark as Contacted
            </button>
            <button
              onClick={() => handleBatchPriority('High')}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/50 font-semibold"
            >
              Mark High Priority 🔥
            </button>
            <button
              onClick={handleBatchExport}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Selected</span>
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedLeadIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* The Enhanced Data Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase select-none">
                {/* Select All Checkbox */}
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                    title={isAllSelected ? 'Deselect All' : 'Select All'}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>

                {/* Business Title (Sortable) */}
                <th
                  onClick={() => handleSort('title')}
                  className="py-3 px-3 min-w-[240px] cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Business / Title</span>
                    {renderSortIcon('title')}
                  </div>
                </th>

                {/* Industry (Sortable) */}
                <th
                  onClick={() => handleSort('industry')}
                  className="py-3 px-3 min-w-[120px] cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Industry</span>
                    {renderSortIcon('industry')}
                  </div>
                </th>

                {/* Phone Number (Sortable) */}
                <th
                  onClick={() => handleSort('phone')}
                  className="py-3 px-3 min-w-[140px] cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Phone Number</span>
                    {renderSortIcon('phone')}
                  </div>
                </th>

                {/* Website & Quality */}
                <th className="py-3 px-3 min-w-[160px]">Website & Quality</th>

                {/* Audit & Opportunity */}
                <th className="py-3 px-3 min-w-[180px]">Why This Lead?</th>

                {/* Priority (Sortable) */}
                <th
                  onClick={() => handleSort('priority')}
                  className="py-3 px-3 min-w-[90px] cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Priority</span>
                    {renderSortIcon('priority')}
                  </div>
                </th>

                {/* Problem Found */}
                <th className="py-3 px-3 min-w-[180px]">Problem Found</th>

                {/* Notes */}
                <th className="py-3 px-3 min-w-[180px]">Notes</th>

                {/* Map */}
                <th className="py-3 px-3 min-w-[70px] text-center">Map</th>

                {/* Research Status (Sortable) */}
                <th
                  onClick={() => handleSort('researchStatus')}
                  className="py-3 px-3 min-w-[140px] cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Research Status</span>
                    {renderSortIcon('researchStatus')}
                  </div>
                </th>

                {/* Outreach Status (Sortable) */}
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-3 min-w-[140px] cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Outreach Status</span>
                    {renderSortIcon('status')}
                  </div>
                </th>

                {/* Actions */}
                <th className="py-3 px-3 min-w-[70px] text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {sortedLeads.map((lead) => {
                const title = lead.title || lead.name;
                const phone = lead.phoneNumber || lead.phone;
                const website = lead.websiteUrl;
                const industry = lead.industry || lead.niche || 'General';
                const city = lead.city || 'Mohali';
                const priority = lead.leadPriority || lead.priority || 'Low';
                const quality = lead.websiteQuality || (!website ? 'No Website' : 'Needs Review');
                const problem =
                  lead.problemFound ||
                  lead.keyDetail ||
                  (website ? 'Website exists; audit required' : 'No website listed');
                const mapsLink =
                  lead.mapsLink ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    title + ', ' + (lead.address || '')
                  )}`;
                const isHigh = priority === 'High';
                const isNoWeb = !website || quality === 'No Website';
                const status: LeadStatus = (lead.status as LeadStatus) || 'New Lead';
                const isSelected = selectedLeadIds.includes(lead.id);

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead.id)}
                    className={`cursor-pointer transition group ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/40'
                        : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3.5 px-3 text-center"
                      onClick={(e) => toggleSelectLead(lead.id, e)}
                    >
                      <button className="p-1 text-slate-400 hover:text-indigo-600 transition">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Title & City */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug">
                        {title}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {city}
                        </span>
                        <span className="truncate max-w-[200px]" title={lead.address}>
                          {lead.address || 'No address provided'}
                        </span>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${getIndustryBadgeStyle(
                          industry
                        )}`}
                      >
                        {industry}
                      </span>
                    </td>

                    {/* Phone Number */}
                    <td
                      className="py-3.5 px-3 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {phone ? (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${phone}`}
                            className="font-mono text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                            title="Call"
                          >
                            {phone}
                          </a>
                          <button
                            onClick={(e) => copyToClipboard(phone, lead.id, e)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                            title="Copy Phone Number"
                          >
                            {copiedId === lead.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">—</span>
                      )}
                    </td>

                    {/* Website & Quality */}
                    <td className="py-3.5 px-3">
                      {website ? (
                        <div className="space-y-1">
                          <a
                            href={website.startsWith('http') ? website : `https://${website}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-[150px] font-medium"
                            title={website}
                          >
                            <span className="truncate">{website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                          <div>
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              {quality}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            No Website
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Why This Lead? Column */}
                    <td className="py-3.5 px-3 max-w-[220px]">
                      <div className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 bg-indigo-50/50 dark:bg-indigo-950/30 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                        {lead.whyThisLead || (website ? 'Site lacks mobile CTA' : 'No website listed on GBP')}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {isHigh ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 animate-pulse" />
                          High
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          Low
                        </span>
                      )}
                    </td>

                    {/* Problem Found */}
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                      <div className="text-[11px] line-clamp-2" title={problem}>
                        {problem || '—'}
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                      <div className="text-[11px] line-clamp-2" title={lead.notes}>
                        {lead.notes || '—'}
                      </div>
                    </td>

                    {/* Map */}
                    <td
                      className="py-3.5 px-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={mapsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-rose-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Open Google Maps Location"
                      >
                        <MapPin className="w-4 h-4 text-rose-500" />
                      </a>
                    </td>

                    {/* Research Status Selector */}
                    <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.researchStatus || 'New'}
                        onChange={(e) => {
                          updateClient(lead.id, {
                            researchStatus: e.target.value as ResearchStatus,
                          });
                        }}
                        className="text-[11px] font-semibold rounded-md px-2 py-1 border transition bg-amber-50/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      >
                        {RESEARCH_STATUSES.map((rs) => (
                          <option key={rs} value={rs}>
                            {rs}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Outreach Status Selector */}
                    <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={status}
                        onChange={(e) => {
                          updateClient(lead.id, {
                            status: e.target.value as LeadStatus,
                            stage:
                              e.target.value === 'Converted'
                                ? 'Won'
                                : e.target.value === 'Contacted'
                                ? 'Call'
                                : 'Lead',
                          });
                        }}
                        className={`text-[11px] font-medium rounded-md px-2 py-1 border transition ${
                          status === 'Converted'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : status === 'Contacted' || status === 'Call Scheduled'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {LEAD_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectLead(lead.id)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Inspect Lead Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove lead "${title}"?`)) {
                              deleteClient(lead.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
