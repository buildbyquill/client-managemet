import React, { useState } from 'react';
import {
  ExternalLink,
  Phone,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { Client, LeadStatus, LeadPriority, LEAD_STATUSES } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';

interface LeadCompactTableViewProps {
  leads: Client[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onSelectLead: (id: string) => void;
  getIndustryBadgeStyle: (ind: string) => string;
}

export const LeadCompactTableView: React.FC<LeadCompactTableViewProps> = ({
  leads,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onSelectLead,
  getIndustryBadgeStyle,
}) => {
  const { updateClient } = useWorkspace();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isAllSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l.id));
  const isSomeSelected = leads.some((l) => selectedIds.has(l.id)) && !isAllSelected;

  const copyPhone = (phone: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800/80">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold select-none">
              <th className="py-2.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isSomeSelected;
                  }}
                  onChange={onSelectAll}
                  aria-label="Select all leads"
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                />
              </th>
              <th className="py-2.5 px-3 min-w-[200px]">Business & Location</th>
              <th className="py-2.5 px-3 w-24">Priority</th>
              <th className="py-2.5 px-3 min-w-[240px]">Problem & Outreach Angle</th>
              <th className="py-2.5 px-3 min-w-[140px]">Phone Contact</th>
              <th className="py-2.5 px-3 w-36">Pipeline Stage</th>
              <th className="py-2.5 px-3 w-16 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {leads.map((client) => {
              const isSelected = selectedIds.has(client.id);
              const title = client.title || client.name;
              const phone = client.phoneNumber || client.phone || '';
              const industry = client.industry || client.niche || 'General';
              const problem = client.problemFound || client.keyDetail || 'No website found on Maps listing';
              const priority = (client.leadPriority || client.priority || 'Low') as LeadPriority;
              const status = client.status || 'New Lead';

              return (
                <tr
                  key={client.id}
                  onClick={() => onSelectLead(client.id)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Checkbox */}
                  <td
                    className="py-2 px-3 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(client.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(client.id)}
                      aria-label={`Select ${title}`}
                      className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                    />
                  </td>

                  {/* Business Name & City */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
                        {title}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${getIndustryBadgeStyle(industry)}`}>
                        {industry}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {client.city || 'Mohali'} {client.address ? `• ${client.address}` : ''}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-2 px-3">
                    {priority === 'High' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <Flame className="w-3 h-3" />
                        HIGH
                      </span>
                    ) : priority === 'Medium' ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        MED
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                        LOW
                      </span>
                    )}
                  </td>

                  {/* Identified Problem / Pitch Angle */}
                  <td className="py-2 px-3">
                    <div className="text-slate-700 dark:text-slate-300 text-[11px] truncate max-w-[280px]" title={problem}>
                      {problem}
                    </div>
                  </td>

                  {/* Phone & Direct Action */}
                  <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                    {phone ? (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${phone}`}
                          className="font-mono text-[11px] text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 hover:underline"
                        >
                          <Phone className="w-3 h-3 text-emerald-500" />
                          <span>{phone}</span>
                        </a>
                        <button
                          type="button"
                          onClick={(e) => copyPhone(phone, client.id, e)}
                          title="Copy phone"
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {copiedId === client.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">No phone</span>
                    )}
                  </td>

                  {/* Pipeline Stage Select */}
                  <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={status}
                      onChange={(e) =>
                        updateClient(client.id, {
                          status: e.target.value as LeadStatus,
                          stage: e.target.value === 'Converted' ? 'Won' : e.target.value === 'Contacted' ? 'Call' : 'Lead',
                        })
                      }
                      className="text-[11px] font-semibold py-1 px-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    >
                      {LEAD_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* View Details */}
                  <td className="py-2 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectLead(client.id)}
                      aria-label="Open lead dossier"
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
