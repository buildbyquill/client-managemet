import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  Globe,
  Phone,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Sparkles,
  MessageSquare,
  Send,
  Eye,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Client, LeadStatus, LEAD_STATUSES } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';

interface LeadOpportunityViewProps {
  leads: Client[];
  onSelectLead: (id: string) => void;
  getIndustryBadgeStyle: (ind: string) => string;
}

type CampaignFilter = 'all' | 'no-website' | 'has-website' | 'high-priority';

export const LeadOpportunityView: React.FC<LeadOpportunityViewProps> = ({
  leads,
  onSelectLead,
  getIndustryBadgeStyle,
}) => {
  const { updateClient } = useWorkspace();
  const [activeCampaign, setActiveCampaign] = useState<CampaignFilter>('all');
  const [pitchExpandedLeadId, setPitchExpandedLeadId] = useState<string | null>(null);
  const [copiedPitchId, setCopiedPitchId] = useState<string | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Categorize leads
  const noWebsiteLeads = leads.filter(
    (c) =>
      !c.websiteUrl ||
      c.websiteQuality === 'No Website' ||
      (c.problemFound && c.problemFound.toLowerCase().includes('no website'))
  );

  const websiteAuditLeads = leads.filter(
    (c) =>
      c.websiteUrl &&
      c.websiteQuality !== 'No Website' &&
      !(c.problemFound && c.problemFound.toLowerCase().includes('no website'))
  );

  const highPriorityLeads = leads.filter(
    (c) => (c.leadPriority || c.priority) === 'High'
  );

  const displayedLeads =
    activeCampaign === 'no-website'
      ? noWebsiteLeads
      : activeCampaign === 'has-website'
      ? websiteAuditLeads
      : activeCampaign === 'high-priority'
      ? highPriorityLeads
      : leads;

  const copyText = (text: string, id: string, type: 'pitch' | 'phone', e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    if (type === 'pitch') {
      setCopiedPitchId(id);
      setTimeout(() => setCopiedPitchId(null), 1800);
    } else {
      setCopiedPhoneId(id);
      setTimeout(() => setCopiedPhoneId(null), 1800);
    }
  };

  const generatePitchScript = (lead: Client) => {
    const title = lead.title || lead.name;
    const ind = (lead.industry || lead.niche || 'business').toLowerCase();
    const city = lead.city || 'Mohali';
    const hasNoWeb =
      !lead.websiteUrl ||
      lead.websiteQuality === 'No Website' ||
      (lead.problemFound && lead.problemFound.toLowerCase().includes('no website'));

    if (hasNoWeb) {
      return {
        type: 'Missing Website Cold Pitch',
        script: `"Hi, is this the owner or manager at ${title}? My name is [Your Name] from [Your Agency]. I was researching top-rated ${ind} in ${city} and noticed your Google profile has fantastic customer reviews, but there is no website link attached! Right now, prospective customers searching for ${ind} in ${city} are seeing your listing but clicking to competitors who have an online menu or appointment booking. We build high-converting, modern websites for local ${ind} in ${city} that pay for themselves. Would you be open to a 5-minute preview of what a website could look like for ${title}?"`,
      };
    } else {
      return {
        type: 'Website Modernization Pitch',
        script: `"Hi, is this the clinic director or manager at ${title}? My name is [Your Name] from [Your Agency]. I came across your Google listing in ${city} and was checking out your website. We specialize in updating local ${ind} websites for faster mobile loading, direct online booking, and SEO rankings. We ran a quick visual audit on your current site and found 2-3 quick improvements that could increase patient/customer inquiries this month. Would you be opposed to me sending a 2-minute video audit of what we found?"`,
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Campaign Selector Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Opportunity Radar & Outreach Campaigns
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Action-Oriented View
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Grouping leads by real-world sales pain points rather than a flat spreadsheet. Every card includes a tailored cold pitch script.
            </p>
          </div>

          {/* Quick stats pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Ready Targets:</span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {displayedLeads.length} Prospects
            </span>
          </div>
        </div>

        {/* Campaign Tabs */}
        <div className="flex flex-wrap gap-2 pt-4">
          <button
            onClick={() => setActiveCampaign('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeCampaign === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Opportunities ({leads.length})
          </button>

          <button
            onClick={() => setActiveCampaign('no-website')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeCampaign === 'no-website'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Missing Website Campaign ({noWebsiteLeads.length})</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 font-mono">
              High Close Rate
            </span>
          </button>

          <button
            onClick={() => setActiveCampaign('has-website')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeCampaign === 'has-website'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 hover:bg-indigo-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Website Redesign Campaign ({websiteAuditLeads.length})</span>
          </button>

          <button
            onClick={() => setActiveCampaign('high-priority')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeCampaign === 'high-priority'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 hover:bg-amber-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>High-Priority Retainers ({highPriorityLeads.length})</span>
          </button>
        </div>
      </div>

      {/* Opportunity Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {displayedLeads.map((lead) => {
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
          const status = (lead.status as LeadStatus) || 'New Lead';
          const pitch = generatePitchScript(lead);
          const isPitchOpen = pitchExpandedLeadId === lead.id;

          return (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead.id)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getIndustryBadgeStyle(
                        industry
                      )}`}
                    >
                      {industry}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">{city}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isHigh && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        <Flame className="w-3 h-3" />
                        Priority
                      </span>
                    )}

                    <select
                      value={status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
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
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {LEAD_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Business Title */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-2">
                  {title}
                </h3>

                {/* Opportunity Banner */}
                <div
                  className={`p-3 rounded-lg border mb-3 ${
                    isNoWeb
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200'
                      : 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60 text-indigo-800 dark:text-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <div className="flex items-center gap-1.5">
                      {isNoWeb ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      ) : (
                        <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                      <span>
                        {isNoWeb
                          ? 'Missing Website Opportunity'
                          : 'Modernization & Redesign Prospect'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/60 dark:bg-slate-900/60">
                      {isNoWeb ? 'Easiest Close' : 'High Retainer'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {lead.problemFound ||
                      (isNoWeb
                        ? 'No website link on Google listing. Potential clients looking for services in Mohali cannot view menus or book.'
                        : 'Existing website requires audit for mobile speed and booking capability.')}
                  </p>
                </div>

                {/* Quick Info Bar */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 mb-3">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate" title={lead.address}>
                      {lead.address || city}
                    </span>
                  </div>
                  {phone ? (
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <a
                        href={`tel:${phone}`}
                        className="font-mono text-slate-800 dark:text-slate-200 font-semibold hover:text-indigo-600"
                      >
                        {phone}
                      </a>
                      <button
                        onClick={(e) => copyText(phone, lead.id, 'phone', e)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                        title="Copy Phone"
                      >
                        {copiedPhoneId === lead.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-right text-slate-400 italic">No phone</span>
                  )}
                </div>

                {/* Cold Outreach Script Accordion */}
                <div
                  className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/40 mb-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() =>
                      setPitchExpandedLeadId(isPitchOpen ? null : lead.id)
                    }
                    className="w-full px-3 py-2 text-left flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{pitch.type} (Click to view script)</span>
                    </div>
                    {isPitchOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isPitchOpen && (
                    <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs space-y-2.5">
                      <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                        {pitch.script}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          Tailored for {title} in {city}
                        </span>
                        <button
                          onClick={(e) => copyText(pitch.script, lead.id, 'pitch', e)}
                          className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-[11px] font-semibold flex items-center gap-1.5 transition"
                        >
                          {copiedPitchId === lead.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied Script!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Script</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div
                className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1.5">
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs inline-flex items-center gap-1"
                    title="View on Google Maps"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Google Maps</span>
                  </a>

                  {website && (
                    <a
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs inline-flex items-center gap-1"
                      title="Open Current Site"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Visit Site</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Now</span>
                    </a>
                  )}
                  <button
                    onClick={() => onSelectLead(lead.id)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold transition"
                  >
                    Details
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
