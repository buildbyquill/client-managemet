import React, { useState } from 'react';
import {
  Phone,
  Globe,
  ExternalLink,
  MapPin,
  AlertTriangle,
  Flame,
  Copy,
  Check,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Info,
  Trash2,
  Download,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Client, LeadStatus, LEAD_STATUSES, ResearchStatus, RESEARCH_STATUSES } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import { exportLeadsToCSV } from '../utils/csvParser';

interface LeadCardsViewProps {
  leads: Client[];
  onSelectLead: (id: string) => void;
  getIndustryBadgeStyle: (industry: string) => string;
}

export const LeadCardsView: React.FC<LeadCardsViewProps> = ({
  leads,
  onSelectLead,
  getIndustryBadgeStyle,
}) => {
  const { updateClient, deleteClients } = useWorkspace();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  const copyToClipboard = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

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

  const handleBatchDelete = () => {
    if (
      confirm(
        `Are you sure you want to permanently delete ${selectedLeadIds.length} selected lead(s)?`
      )
    ) {
      deleteClients(selectedLeadIds);
      setSelectedLeadIds([]);
    }
  };

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

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'New Lead':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      case 'Under Review':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Contacted':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Call Scheduled':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Proposal':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Converted':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Not Interested':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (leads.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <Info className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          No client leads match this filter
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Try clearing search terms or selecting 'All' in the category and priority tabs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Control Toolbar / Floating Bulk Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
          >
            {isAllSelected ? (
              <>
                <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Deselect All ({leads.length})</span>
              </>
            ) : (
              <>
                <Square className="w-4 h-4 text-slate-400" />
                <span>Select All ({leads.length})</span>
              </>
            )}
          </button>

          {selectedLeadIds.length > 0 && (
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
              {selectedLeadIds.length} lead(s) selected
            </span>
          )}
        </div>

        {selectedLeadIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs animate-in fade-in">
            <button
              onClick={() => handleBatchStatus('Contacted')}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 font-medium"
            >
              Mark Contacted
            </button>
            <button
              onClick={() => handleBatchPriority('High')}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 font-medium"
            >
              Mark High Priority 🔥
            </button>
            <button
              onClick={handleBatchExport}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 font-medium flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedLeadIds.length})</span>
            </button>
            <button
              onClick={() => setSelectedLeadIds([])}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline ml-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map((lead) => {
          const title = lead.title || lead.name;
          const phone = lead.phoneNumber || lead.phone;
          const website = lead.websiteUrl;
          const industry = lead.industry || lead.niche || 'General';
          const city = lead.city || 'Mohali';
          const priority = lead.leadPriority || lead.priority || 'Low';
          const quality = lead.websiteQuality || (!website ? 'No Website' : 'Needs Review');
          const problem = lead.problemFound || lead.keyDetail || '';
          const notes = lead.notes || '';
          const mapsLink =
            lead.mapsLink ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              title + ', ' + (lead.address || '')
            )}`;
          const isHigh = priority === 'High';
          const status = lead.status || 'New Lead';
          const hasNoWebsite =
            !website ||
            quality === 'No Website' ||
            problem.toLowerCase().includes('no website');
          const isSelected = selectedLeadIds.includes(lead.id);

          return (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead.id)}
              className={`group bg-white dark:bg-slate-900 border ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/30 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20'
                  : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600'
              } rounded-2xl p-5 cursor-pointer shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden`}
            >
              {/* Top Indicator Strip for High Priority */}
              {isHigh && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
              )}

              <div>
                {/* Header: Select Checkbox + Category Badge + Research Status */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => toggleSelectLead(lead.id, e)}
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-600 focus:outline-hidden"
                      title={isSelected ? 'Deselect lead' : 'Select lead for batch deletion/export'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-950" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400" />
                      )}
                    </button>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border tracking-wide ${getIndustryBadgeStyle(
                        industry
                      )}`}
                    >
                      {industry}
                    </span>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.researchStatus || 'New'}
                      onChange={(e) => {
                        updateClient(lead.id, {
                          researchStatus: e.target.value as ResearchStatus,
                        });
                      }}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500 cursor-pointer"
                      title="Change Lead Intelligence Research Progress"
                    >
                      {RESEARCH_STATUSES.map((rs) => (
                        <option key={rs} value={rs}>
                          {rs}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Opportunity Badges */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {!hasNoWebsite ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      🟠 WEBSITE REDESIGN
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      🔴 WEBSITE NEEDED
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    🟡 CONVERSION OPPORTUNITY
                  </span>
                </div>

                {/* Title / Business Name */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-1 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {title}
                </h3>

                {/* Location / Address & Audit Score */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <div className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{lead.address || 'Address in ' + city}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                    <span>Audit Score:</span>
                    <span>{lead.opportunityProfile?.auditScore || (hasNoWebsite ? 22 : 47)}/100</span>
                  </div>
                </div>

                {/* "Why This Lead?" Intelligence Box */}
                <div className="bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl p-2.5 mb-3 border border-indigo-200/60 dark:border-indigo-800/50 text-[11px]">
                  <div className="font-bold text-indigo-900 dark:text-indigo-200 mb-0.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Why this lead?</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 line-clamp-2 leading-tight">
                    {lead.whyThisLead ||
                      (!hasNoWebsite
                        ? 'Existing site lacks online booking CTA and has weak mobile conversion flow.'
                        : 'Active Google Maps listing with verified phone line, but no website linked.')}
                  </div>
                </div>

              {/* Direct Outreach Info (Phone & Website) */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-2 border border-slate-200/60 dark:border-slate-700/60 text-xs mb-3.5">
                {/* Phone */}
                <div
                  className="flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-slate-400 font-medium">Direct Line:</span>
                  {phone ? (
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${phone}`}
                        className="font-mono font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700"
                        title="Click to dial"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{phone}</span>
                      </a>
                      <button
                        onClick={(e) => copyToClipboard(phone, lead.id, e)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                        title="Copy phone number"
                      >
                        {copiedId === lead.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No phone listed</span>
                  )}
                </div>

                {/* Website */}
                <div
                  className="flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-slate-400 font-medium">Website:</span>
                  {hasNoWebsite ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      No Website
                    </span>
                  ) : (
                    <a
                      href={website?.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[170px] hover:underline"
                    >
                      <span className="truncate">{website?.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                </div>
              </div>

              {/* Problem Found & Sales Notes */}
              {(problem || notes) && (
                <div className="space-y-2 mb-3.5">
                  {problem && (
                    <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-xl p-2.5 text-[11px] border border-amber-200/60 dark:border-amber-800/40">
                      <div className="font-bold text-amber-800 dark:text-amber-300 mb-0.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Problem Found:</span>
                      </div>
                      <div className="line-clamp-2 text-slate-700 dark:text-slate-300">
                        {problem}
                      </div>
                    </div>
                  )}

                  {notes && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 text-[11px] border border-slate-200/60 dark:border-slate-700/60">
                      <div className="font-bold text-slate-600 dark:text-slate-300 mb-0.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span>Notes / Outreach Strategy:</span>
                      </div>
                      <div className="line-clamp-2 text-slate-600 dark:text-slate-400">
                        {notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card Footer: Status Selector & Direct Maps Action */}
            <div
              className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Outreach Stage Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Stage:</span>
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
                  className={`text-xs rounded-lg px-2.5 py-1 font-semibold border ${getStatusColor(
                    status
                  )} focus:outline-hidden focus:ring-1 focus:ring-indigo-500`}
                >
                  {LEAD_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs inline-flex items-center gap-1 transition shadow-2xs"
                  title="View on Google Maps"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Map</span>
                </a>

                <button
                  onClick={() => onSelectLead(lead.id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition"
                >
                  <span>Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};
