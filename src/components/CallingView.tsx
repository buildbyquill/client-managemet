/**
 * CallingView.tsx — Quill Land Lead Manager
 *
 * Speed Dialer workspace.
 *
 * IMPORTANT:
 * - The laptop does NOT make phone calls. No tel: links.
 * - Provides: Copy Number · Open Maps · Open Dossier
 * - Outcomes: Didn't Pick Up · Rejected · Interested
 * - Updates lead status/priority WITHOUT navigating away (P0 fix)
 * - Calling session state lives in WorkspaceContext (in-memory) so it
 *   survives lead mutations without resetting.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Copy,
  Check,
  MapPin,
  ExternalLink,
  Flame,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Star,
  Calendar,
  ChevronDown,
  X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Client, LeadPriority, ActivityLogItem, CallOutcome } from '../types';

// ─── Follow-up date picker ────────────────────────────────────────────────────
const FOLLOWUP_PRESETS = [
  { label: 'Tomorrow', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
];

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function priorityDown(p?: LeadPriority): LeadPriority {
  if (p === 'High') return 'Medium';
  if (p === 'Medium') return 'Low';
  return 'Low';
}

// ─── Follow-up modal ──────────────────────────────────────────────────────────
interface FollowUpModalProps {
  lead: Client;
  onSave: (followUpDate: string, note: string) => void;
  onSkip: () => void;
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({ lead, onSave, onSkip }) => {
  const [date, setDate] = useState(addDays(3));
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            Schedule Follow-up
          </h3>
          <button onClick={onSkip} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
            🎉 {lead.title || lead.name} is interested! Schedule a follow-up so this lead isn't forgotten.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-2">Quick Select</label>
          <div className="grid grid-cols-2 gap-2">
            {FOLLOWUP_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setDate(addDays(p.days))}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                  date === addDays(p.days)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1.5">Custom Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1.5">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Owner interested, send portfolio"
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSave(date, note)}
            className="flex-1 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"
          >
            Set Follow-up for {date}
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main CallingView ─────────────────────────────────────────────────────────
export const CallingView: React.FC = () => {
  const {
    clients,
    updateClient,
    setSelectedClientId,
    callingSessionStats,
    setCallingSessionStats,
    currentCallingIndex,
    setCurrentCallingIndex,
  } = useWorkspace();

  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [pendingFollowUp, setPendingFollowUp] = useState<Client | null>(null);
  const [showNoteField, setShowNoteField] = useState(false);

  // ─── Filter to active, ready-to-call leads (or all active if none ready) ──
  const callingQueue = useMemo(() => {
    const active = clients.filter((c) => !c.isRejected);
    const ready = active.filter((c) => c.status === 'Ready to Call' || c.researchStatus === 'Ready to Call');
    if (ready.length > 0) return ready;
    // Fall back to high priority leads
    const high = active.filter((c) => (c.leadPriority || c.priority) === 'High');
    if (high.length > 0) return high;
    return active;
  }, [clients]);

  // Initialise session total when queue changes
  useEffect(() => {
    if (callingQueue.length > 0) {
      setCallingSessionStats((prev) => ({
        ...prev,
        total: callingQueue.length,
      }));
    }
  }, [callingQueue.length, setCallingSessionStats]);

  const safeIndex = Math.min(currentCallingIndex, Math.max(0, callingQueue.length - 1));
  const lead = callingQueue[safeIndex];

  const copyPhone = useCallback(() => {
    const phone = lead?.phoneNumber || lead?.phone;
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [lead]);

  // ─── Record outcome (NO navigation, NO page reload) ────────────────────────
  const handleOutcome = useCallback(
    (outcome: CallOutcome, noteText: string) => {
      if (!lead) return;

      const now = new Date();
      const timestamp = now.toISOString();
      const displayDate = now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      const logEntry: ActivityLogItem = {
        id: `act-${Date.now()}`,
        date: now.toISOString().split('T')[0],
        title: `Called — ${outcome}`,
        description: noteText || outcome,
        type: 'call',
        outcome,
        author: 'You',
      };

      let updates: Partial<Client> = {
        lastContactDate: timestamp,
        contactAttemptCount: (lead.contactAttemptCount ?? 0) + 1,
        activityHistory: [logEntry, ...(lead.activityHistory ?? [])],
      };

      if (outcome === "Didn't Pick Up") {
        updates = {
          ...updates,
          status: 'Contacted',
          leadPriority: priorityDown(lead.leadPriority),
          priority: priorityDown((lead.priority as LeadPriority) || undefined),
        };
        setCallingSessionStats((prev) => ({ ...prev, didntPickUp: prev.didntPickUp + 1 }));
        // Advance to next lead immediately
        if (safeIndex < callingQueue.length - 1) {
          setCurrentCallingIndex((prev) => prev + 1);
        }
      } else if (outcome === 'Rejected') {
        updates = {
          ...updates,
          status: 'Rejected',
          isRejected: true,
          rejectedAt: timestamp,
        };
        setCallingSessionStats((prev) => ({ ...prev, rejected: prev.rejected + 1 }));
        // Advance to next lead
        if (safeIndex < callingQueue.length - 1) {
          setCurrentCallingIndex((prev) => prev + 1);
        }
      } else if (outcome === 'Interested') {
        updates = {
          ...updates,
          status: 'Interested',
          followUpStatus: 'Pending',
        };
        setCallingSessionStats((prev) => ({ ...prev, interested: prev.interested + 1 }));
        // Show follow-up modal
        updateClient(lead.id, updates);
        setNote('');
        setShowNoteField(false);
        setPendingFollowUp(lead);
        return; // don't advance yet — wait for follow-up
      }

      updateClient(lead.id, updates);
      setNote('');
      setShowNoteField(false);
    },
    [lead, safeIndex, callingQueue, updateClient, setCallingSessionStats, setCurrentCallingIndex]
  );

  const handleFollowUpSave = useCallback(
    (followUpDate: string, followUpNote: string) => {
      if (!pendingFollowUp) return;
      updateClient(pendingFollowUp.id, {
        nextFollowUpDate: followUpDate,
        followUpStatus: 'Pending',
        customNotes: followUpNote || pendingFollowUp.customNotes,
        activityHistory: [
          {
            id: `act-fu-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            title: `Follow-up scheduled for ${followUpDate}`,
            description: followUpNote || 'Follow-up scheduled after interest expressed.',
            type: 'note',
            author: 'You',
          },
          ...(pendingFollowUp.activityHistory ?? []),
        ],
      });
      setPendingFollowUp(null);
      // Advance to next lead
      if (safeIndex < callingQueue.length - 1) {
        setCurrentCallingIndex((prev) => prev + 1);
      }
    },
    [pendingFollowUp, safeIndex, callingQueue, updateClient, setCurrentCallingIndex]
  );

  const { didntPickUp, rejected, interested, total } = callingSessionStats;
  const completed = didntPickUp + rejected + interested;

  // ─── Empty state ───────────────────────────────────────────────────────────
  if (callingQueue.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[500px] gap-4">
        <CheckCircle2 className="w-16 h-16 text-emerald-400" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No leads in the calling queue</h2>
        <p className="text-sm text-slate-500">Import leads or mark them as "Ready to Call" to start a session.</p>
      </div>
    );
  }

  const phone = lead.phoneNumber || lead.phone;
  const industry = lead.industry || lead.niche || 'General';
  const city = lead.city || '';
  const mapsLink = lead.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((lead.title || lead.name) + ' ' + (lead.address || city))}`;
  const isNoWeb = !lead.websiteUrl || lead.websiteQuality === 'No Website' || (lead.problemFound?.toLowerCase().includes('no website'));
  const isHigh = (lead.leadPriority || lead.priority) === 'High';

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Follow-up modal */}
      {pendingFollowUp && (
        <FollowUpModal
          lead={pendingFollowUp}
          onSave={handleFollowUpSave}
          onSkip={() => {
            setPendingFollowUp(null);
            if (safeIndex < callingQueue.length - 1) {
              setCurrentCallingIndex((prev) => prev + 1);
            }
          }}
        />
      )}

      {/* ── Session ribbon ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Today's Calling Session
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lead {safeIndex + 1} of {callingQueue.length} · Copy the number, call from your phone
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-semibold text-slate-900 dark:text-white">
            {completed} / {total}
          </span>
          <div className="flex gap-2 text-[11px]">
            <span className="text-slate-400">DNP: <strong className="text-slate-700 dark:text-slate-200">{didntPickUp}</strong></span>
            <span className="text-rose-500">Rej: <strong>{rejected}</strong></span>
            <span className="text-emerald-500">Int: <strong>{interested}</strong></span>
          </div>
        </div>
      </div>

      {/* ── Progress bar ────────────────────────────────────────────────────── */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${((safeIndex + 1) / callingQueue.length) * 100}%` }}
        />
      </div>

      {/* ── Main lead card ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {industry}
              </span>
              {city && <span className="text-xs text-slate-500">{city}</span>}
              {isHigh && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <Flame className="w-3 h-3" /> HIGH PRIORITY
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{lead.title || lead.name}</h1>
            {lead.address && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>{lead.address}</span>
              </div>
            )}
            {/* Rating */}
            {lead.rating && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{lead.rating} · {lead.reviewCount ?? 0} reviews</span>
              </div>
            )}
          </div>

          {/* Prev/Next stepper */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              disabled={safeIndex === 0}
              onClick={() => setCurrentCallingIndex((p) => Math.max(0, p - 1))}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 px-1">{safeIndex + 1}/{callingQueue.length}</span>
            <button
              disabled={safeIndex === callingQueue.length - 1}
              onClick={() => setCurrentCallingIndex((p) => Math.min(callingQueue.length - 1, p + 1))}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Phone number + Copy ─────────────────────────────────────────── */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Phone Number</div>
            <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white">
              {phone || 'No phone on record'}
            </div>
          </div>

          {phone && (
            <button
              onClick={copyPhone}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition shadow-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Number'}</span>
            </button>
          )}
        </div>

        {/* ── Website & Maps ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className={`p-4 rounded-xl border ${isNoWeb ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900' : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'}`}>
            <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
              {isNoWeb ? (
                <><AlertTriangle className="w-4 h-4 text-rose-600" /><span className="text-rose-800 dark:text-rose-200">NO WEBSITE</span></>
              ) : (
                <><ExternalLink className="w-4 h-4 text-emerald-600" /><span className="text-emerald-800 dark:text-emerald-200">WEBSITE EXISTS</span></>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isNoWeb ? 'Strong pitch: no website on Google listing.' : lead.websiteUrl}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-2">
            <div className="text-xs text-slate-500 font-medium">Quick Links</div>
            <div className="flex flex-wrap gap-2">
              <a
                href={mapsLink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-rose-600 flex items-center gap-1.5 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />Open Maps
              </a>
              <button
                onClick={() => setSelectedClientId(lead.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Open Dossier
              </button>
            </div>
          </div>
        </div>

        {/* ── AI Research summary ─────────────────────────────────────────── */}
        {(lead.aiResearchSummary || lead.whyThisLead || lead.problemFound) && (
          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Research Summary
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {lead.aiResearchSummary || lead.whyThisLead || lead.problemFound}
            </p>
            {lead.services && lead.services.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {lead.services.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">{s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Optional note ───────────────────────────────────────────────── */}
        <div>
          {!showNoteField ? (
            <button
              onClick={() => setShowNoteField(true)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
            >
              + Add a short note
            </button>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Short note</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Owner interested, send portfolio"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* ── Outcome buttons ─────────────────────────────────────────────── */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Call Outcome:</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleOutcome("Didn't Pick Up", note)}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex flex-col items-center gap-1.5 transition"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Didn't Pick Up</span>
            </button>

            <button
              onClick={() => handleOutcome('Rejected', note)}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 text-slate-600 dark:text-slate-300 text-xs font-semibold flex flex-col items-center gap-1.5 transition"
            >
              <XCircle className="w-4 h-4 text-slate-400" />
              <span>Rejected</span>
            </button>

            <button
              onClick={() => handleOutcome('Interested', note)}
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex flex-col items-center gap-1.5 transition shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Interested</span>
            </button>
          </div>
        </div>

        {/* ── Previous call history ───────────────────────────────────────── */}
        {lead.activityHistory && lead.activityHistory.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Call History</div>
            <div className="space-y-1.5">
              {lead.activityHistory.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-start gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.date}</span>
                    {' · '}
                    <span className="text-slate-500">{item.title}</span>
                    {item.description && item.description !== item.title && (
                      <span className="text-slate-400"> — {item.description}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
