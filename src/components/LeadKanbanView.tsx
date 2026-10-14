import React, { useState } from 'react';
import {
  Plus,
  Phone,
  ExternalLink,
  MapPin,
  Flame,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Client, LeadStatus, LEAD_STATUSES } from '../types';

interface LeadKanbanViewProps {
  leads: Client[];
  onSelectLead: (id: string) => void;
  getIndustryBadgeStyle: (ind: string) => string;
}

const KANBAN_STAGES: {
  id: LeadStatus;
  title: string;
  badgeColor: string;
  columnBorder: string;
  headerBg: string;
  iconColor: string;
}[] = [
  {
    id: 'New Lead',
    title: 'New Leads',
    badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    columnBorder: 'border-slate-200 dark:border-slate-800',
    headerBg: 'bg-slate-50/80 dark:bg-slate-900/80',
    iconColor: 'text-slate-500',
  },
  {
    id: 'Under Review',
    title: 'Under Review',
    badgeColor: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
    columnBorder: 'border-purple-200 dark:border-purple-900/50',
    headerBg: 'bg-purple-50/40 dark:bg-purple-950/20',
    iconColor: 'text-purple-500',
  },
  {
    id: 'Contacted',
    title: 'Contacted / Pitched',
    badgeColor: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    columnBorder: 'border-blue-200 dark:border-blue-900/50',
    headerBg: 'bg-blue-50/40 dark:bg-blue-950/20',
    iconColor: 'text-blue-500',
  },
  {
    id: 'Call Scheduled',
    title: 'Call Scheduled',
    badgeColor: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    columnBorder: 'border-amber-200 dark:border-amber-900/50',
    headerBg: 'bg-amber-50/40 dark:bg-amber-950/20',
    iconColor: 'text-amber-500',
  },
  {
    id: 'Converted',
    title: 'Client Won 🎉',
    badgeColor: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    columnBorder: 'border-emerald-200 dark:border-emerald-900/50',
    headerBg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
    iconColor: 'text-emerald-500',
  },
  {
    id: 'Not Interested',
    title: 'Archived / Cold',
    badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
    columnBorder: 'border-slate-200 dark:border-slate-800',
    headerBg: 'bg-slate-50/40 dark:bg-slate-900/40',
    iconColor: 'text-slate-400',
  },
];

export const LeadKanbanView: React.FC<LeadKanbanViewProps> = ({
  leads,
  onSelectLead,
  getIndustryBadgeStyle,
}) => {
  const { updateClient, setNewClientModalOpen } = useWorkspace();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getStageIndex = (stage: LeadStatus) => {
    return KANBAN_STAGES.findIndex((s) => s.id === stage);
  };

  const moveStage = (leadId: string, currentStage: LeadStatus, direction: 'next' | 'prev', e: React.MouseEvent) => {
    e.stopPropagation();
    const curIdx = getStageIndex(currentStage);
    if (direction === 'next' && curIdx < KANBAN_STAGES.length - 1) {
      const nextStage = KANBAN_STAGES[curIdx + 1].id;
      updateClient(leadId, {
        status: nextStage,
        stage: nextStage === 'Converted' ? 'Won' : nextStage === 'Contacted' ? 'Call' : 'Lead',
      });
    } else if (direction === 'prev' && curIdx > 0) {
      const prevStage = KANBAN_STAGES[curIdx - 1].id;
      updateClient(leadId, {
        status: prevStage,
        stage: prevStage === 'Converted' ? 'Won' : prevStage === 'Contacted' ? 'Call' : 'Lead',
      });
    }
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[1400px]">
        {KANBAN_STAGES.map((col, colIdx) => {
          const stageLeads = leads.filter((lead) => {
            const currentStatus = (lead.status as LeadStatus) || 'New Lead';
            return currentStatus === col.id;
          });

          return (
            <div
              key={col.id}
              className={`flex-1 min-w-[280px] max-w-[340px] rounded-xl border ${col.columnBorder} bg-slate-50/50 dark:bg-slate-900/30 flex flex-col max-h-[calc(100vh-250px)] shadow-2xs`}
            >
              {/* Column Header */}
              <div
                className={`p-3.5 border-b ${col.columnBorder} ${col.headerBg} rounded-t-xl flex items-center justify-between sticky top-0 z-10`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {col.title}
                  </span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold ${col.badgeColor}`}
                  >
                    {stageLeads.length}
                  </span>
                </div>
              </div>

              {/* Column Cards List */}
              <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1">
                {stageLeads.length === 0 ? (
                  <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 dark:text-slate-500 text-xs">
                    No leads in this stage
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const title = lead.title || lead.name;
                    const phone = lead.phoneNumber || lead.phone;
                    const website = lead.websiteUrl;
                    const industry = lead.industry || lead.niche || 'General';
                    const city = lead.city || 'Mohali';
                    const priority = lead.leadPriority || lead.priority || 'Low';
                    const isHigh = priority === 'High';
                    const isNoWeb =
                      !website ||
                      lead.websiteQuality === 'No Website' ||
                      (lead.problemFound && lead.problemFound.toLowerCase().includes('no website'));
                    const mapsLink =
                      lead.mapsLink ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        title + ', ' + (lead.address || '')
                      )}`;
                    const curStatus = (lead.status as LeadStatus) || 'New Lead';

                    return (
                      <div
                        key={lead.id}
                        onClick={() => onSelectLead(lead.id)}
                        className="p-3.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-2xs hover:shadow-sm cursor-pointer transition flex flex-col justify-between group"
                      >
                        <div>
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getIndustryBadgeStyle(
                                industry
                              )}`}
                            >
                              {industry}
                            </span>
                            {isHigh && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                                title="High Priority Prospect"
                              >
                                <Flame className="w-3 h-3" />
                                High
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug mb-1 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {title}
                          </h4>

                          {/* Address / City */}
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mb-2">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.address || city}</span>
                          </div>

                          {/* Opportunity Flag */}
                          {isNoWeb ? (
                            <div className="mb-2 px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[10px] font-medium border border-rose-200/60 dark:border-rose-900/50 flex items-center gap-1.5">
                              <AlertTriangle className="w-3 h-3 shrink-0 text-rose-500" />
                              <span>No Website Listed (Web Dev Pitch)</span>
                            </div>
                          ) : (
                            <div className="mb-2 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-[10px] font-medium border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                              <span className="truncate">Site: {website?.replace(/^https?:\/\//, '')}</span>
                              <span className="text-[9px] px-1 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded font-bold">
                                Audit
                              </span>
                            </div>
                          )}

                          {/* Phone Row */}
                          {phone && (
                            <div
                              className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <a
                                href={`tel:${phone}`}
                                className="font-mono hover:text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                              >
                                <Phone className="w-3 h-3 text-emerald-600" />
                                {phone}
                              </a>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => copyToClipboard(phone, lead.id, e)}
                                  className="p-1 text-slate-400 hover:text-slate-600"
                                  title="Copy Phone"
                                >
                                  {copiedId === lead.id ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                                <a
                                  href={mapsLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 text-slate-400 hover:text-rose-500"
                                  title="Google Maps"
                                >
                                  <MapPin className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Stage Mover Buttons */}
                        <div
                          className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            disabled={colIdx === 0}
                            onClick={(e) => moveStage(lead.id, curStatus, 'prev', e)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed text-[10px] flex items-center gap-0.5"
                            title="Move to previous stage"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Back</span>
                          </button>

                          <button
                            disabled={colIdx === KANBAN_STAGES.length - 1}
                            onClick={(e) => moveStage(lead.id, curStatus, 'next', e)}
                            className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-[10px] font-semibold flex items-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed transition"
                            title="Advance to next stage"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
