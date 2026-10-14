import React, { useState } from 'react';
import {
  Phone,
  Copy,
  Check,
  MapPin,
  ExternalLink,
  Flame,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Volume2,
  Share2,
  SkipForward,
  RotateCcw,
} from 'lucide-react';
import { Client, LeadStatus, LEAD_STATUSES } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';

interface LeadDialerViewProps {
  leads: Client[];
  onSelectLead: (id: string) => void;
  getIndustryBadgeStyle: (ind: string) => string;
}

export const LeadDialerView: React.FC<LeadDialerViewProps> = ({
  leads,
  onSelectLead,
  getIndustryBadgeStyle,
}) => {
  const { updateClient } = useWorkspace();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    callsLogged: 0,
    meetingsBooked: 0,
    contacted: 0,
  });
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);

  if (leads.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500">No leads available with current filters.</p>
      </div>
    );
  }

  // Ensure safe index
  const safeIndex = Math.min(currentIndex, leads.length - 1);
  const currentLead = leads[safeIndex];

  const title = currentLead.title || currentLead.name;
  const phone = currentLead.phoneNumber || currentLead.phone;
  const website = currentLead.websiteUrl;
  const industry = currentLead.industry || currentLead.niche || 'General';
  const city = currentLead.city || 'Mohali';
  const priority = currentLead.leadPriority || currentLead.priority || 'Low';
  const isHigh = priority === 'High';
  const isNoWeb =
    !website ||
    currentLead.websiteQuality === 'No Website' ||
    (currentLead.problemFound && currentLead.problemFound.toLowerCase().includes('no website'));
  const mapsLink =
    currentLead.mapsLink ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      title + ', ' + (currentLead.address || '')
    )}`;
  const status = (currentLead.status as LeadStatus) || 'New Lead';

  const copyPhone = () => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleOutcome = (newStatus: LeadStatus, isMeeting = false, isContacted = false) => {
    updateClient(currentLead.id, {
      status: newStatus,
      stage: newStatus === 'Converted' ? 'Won' : newStatus === 'Contacted' ? 'Call' : 'Lead',
    });

    setSessionStats((prev) => ({
      callsLogged: prev.callsLogged + 1,
      meetingsBooked: isMeeting ? prev.meetingsBooked + 1 : prev.meetingsBooked,
      contacted: isContacted || isMeeting ? prev.contacted + 1 : prev.contacted,
    }));

    if (isMeeting) {
      setCelebrationMsg(`🎉 Meeting booked with ${title}! Added to pipeline.`);
      setTimeout(() => setCelebrationMsg(null), 3000);
    }

    // Advance to next lead if available
    if (safeIndex < leads.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Script generator
  const coldScript = isNoWeb
    ? `Hello, is this the owner or manager at ${title}?
My name is [Your Name]. I saw your Google listing in ${city} with great reviews, but saw you don't have a website link. 
Local customers looking for ${industry} in ${city} can't view your services or book online, so they go to competitors. 
We help local businesses set up fast, modern websites. Would you be open to a 3-minute chat on how this works?`
    : `Hello, is this the manager at ${title}?
My name is [Your Name]. I was reviewing top ${industry} in ${city} and looked at your website. 
We found 2 quick improvements regarding mobile speed and direct booking that can help bring in more clients this month. 
Do you have 2 minutes to hear the recommendations?`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Session Ribbon */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <Phone className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Speed Outreach Cockpit</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Lead {safeIndex + 1} of {leads.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              High-focus calling mode. Dial, record outcome, and instantly move forward.
            </p>
          </div>
        </div>

        {/* Live Session Counter */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Logged:</span>
            <strong className="text-slate-900 dark:text-white font-mono">
              {sessionStats.callsLogged}
            </strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Booked:</span>
            <strong className="font-mono">{sessionStats.meetingsBooked}</strong>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((safeIndex + 1) / leads.length) * 100}%` }}
        />
      </div>

      {/* Celebration Notification */}
      {celebrationMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <span>{celebrationMsg}</span>
        </div>
      )}

      {/* Main Focus Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
        {/* Card Header & Navigation */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getIndustryBadgeStyle(
                  industry
                )}`}
              >
                {industry}
              </span>
              <span className="text-xs text-slate-500 font-medium">{city}</span>

              {isHigh && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <Flame className="w-3.5 h-3.5" />
                  High Priority
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {title}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{currentLead.address || 'Address in ' + city}</span>
            </div>
          </div>

          {/* Stepper buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              disabled={safeIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous Lead"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 px-1">
              {safeIndex + 1}/{leads.length}
            </span>
            <button
              disabled={safeIndex === leads.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(leads.length - 1, prev + 1))}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next Lead"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Phone Call Cockpit */}
        <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Direct Phone Line
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-white">
              {phone || 'No phone number'}
            </div>
          </div>

          {phone ? (
            <div className="flex items-center gap-2">
              <button
                onClick={copyPhone}
                className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition shadow-2xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <a
                href={`tel:${phone}`}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm transition"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No phone in CSV</span>
          )}
        </div>

        {/* Opportunity Flag & Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-xl border ${
              isNoWeb
                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold mb-1">
              {isNoWeb ? (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              ) : (
                <ExternalLink className="w-4 h-4 text-indigo-600" />
              )}
              <span className={isNoWeb ? 'text-rose-800 dark:text-rose-200' : 'text-indigo-800 dark:text-indigo-200'}>
                {isNoWeb ? 'Audit: Missing Website' : 'Audit: Website Active'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentLead.problemFound ||
                (isNoWeb
                  ? 'No website listed on Google listing. Strongest pitch: local customers cannot view offerings.'
                  : 'Site exists; recommend quick audit for speed and online booking.')}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div className="text-xs text-slate-500 font-medium mb-2">Quick Reference Links</div>
            <div className="flex flex-wrap gap-2">
              <a
                href={mapsLink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-rose-500 flex items-center gap-1.5 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Open Google Maps</span>
              </a>

              {website && (
                <a
                  href={website.startsWith('http') ? website : `https://${website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit Website</span>
                </a>
              )}

              <button
                onClick={() => onSelectLead(currentLead.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Full Dossier
              </button>
            </div>
          </div>
        </div>

        {/* Live Cold Call Pitch Script Assistant */}
        <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Recommended Cold Call Script</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(coldScript);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>Copy Script</span>
            </button>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 text-xs font-sans text-slate-800 dark:text-slate-200 leading-relaxed">
            {coldScript}
          </div>
        </div>

        {/* Action Outcome Buttons (1-Click Outcome Logger) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Log Call Outcome & Advance:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleOutcome('Call Scheduled', true, true)}
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-xs transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Meeting Booked! 📅</span>
            </button>

            <button
              onClick={() => handleOutcome('Contacted', false, true)}
              className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-xs transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Spoke / Follow Up 💬</span>
            </button>

            <button
              onClick={() => handleOutcome('Contacted', false, false)}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>No Answer / Busy 📞</span>
            </button>

            <button
              onClick={() => handleOutcome('Not Interested', false, false)}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 text-slate-600 dark:text-slate-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition"
            >
              <XCircle className="w-4 h-4 text-slate-400" />
              <span>Not Interested ❌</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
