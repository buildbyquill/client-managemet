/**
 * TodayView.tsx — Quill Land Lead Manager
 *
 * Operational work screen (not a dashboard).
 * Shows: Research Queue · Follow-ups Today · Overdue Follow-ups · Calling Session
 */

import React, { useMemo } from 'react';
import {
  Search,
  Phone,
  Bell,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  PhoneMissed,
  ArrowRight,
  CalendarClock,
  Flame,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';

export const TodayView: React.FC = () => {
  const navigate = useNavigate();
  const { clients, callingSessionStats, setProjectionMode } = useWorkspace();

  const today = new Date().toISOString().split('T')[0];

  // ─── Computed counts ────────────────────────────────────────────────────────
  const activeClients = useMemo(() => clients.filter((c) => !c.isRejected), [clients]);

  const researchQueue = useMemo(
    () => activeClients.filter(
      (c) => !c.researchStatus || c.researchStatus === 'Needs Research' || c.researchStatus === 'Researching'
    ),
    [activeClients]
  );

  const followUpsToday = useMemo(
    () =>
      activeClients.filter((c) => {
        if (!c.nextFollowUpDate) return false;
        return c.nextFollowUpDate === today && c.followUpStatus !== 'Completed';
      }),
    [activeClients, today]
  );

  const overdueFollowUps = useMemo(
    () =>
      activeClients.filter((c) => {
        if (!c.nextFollowUpDate) return false;
        return c.nextFollowUpDate < today && c.followUpStatus !== 'Completed';
      }),
    [activeClients, today]
  );

  const readyToCall = useMemo(
    () => activeClients.filter((c) => c.status === 'Ready to Call' || c.researchStatus === 'Ready to Call'),
    [activeClients]
  );

  const { didntPickUp, rejected, interested, total } = callingSessionStats;
  const completed = didntPickUp + rejected + interested;
  const remaining = Math.max(0, total - completed);

  // ─── Section card ──────────────────────────────────────────────────────────
  const SectionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    count: number;
    subtitle: string;
    buttonLabel: string;
    buttonColor: string;
    urgent?: boolean;
    onClick: () => void;
  }> = ({ icon, title, count, subtitle, buttonLabel, buttonColor, urgent, onClick }) => (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border ${urgent ? 'border-rose-200 dark:border-rose-800/60' : 'border-slate-200 dark:border-slate-800'} p-5 shadow-xs flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
        </div>
        {urgent && count > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            URGENT
          </span>
        )}
      </div>

      <div>
        <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{count}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</div>
      </div>

      {count > 0 && (
        <button
          onClick={onClick}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-white transition shadow-sm ${buttonColor}`}
        >
          <span>{buttonLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Today's Work
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── Overdue follow-ups (top-priority alert) ─────────────────────────── */}
      {overdueFollowUps.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-4 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-bold text-rose-800 dark:text-rose-200">
              {overdueFollowUps.length} overdue follow-up{overdueFollowUps.length > 1 ? 's' : ''}
            </div>
            <div className="text-xs text-rose-700 dark:text-rose-300 mt-0.5 space-y-0.5">
              {overdueFollowUps.slice(0, 4).map((c) => (
                <div key={c.id}>
                  • {c.title || c.name} — {c.nextFollowUpDate} ({c.status})
                </div>
              ))}
              {overdueFollowUps.length > 4 && (
                <div className="font-medium">…and {overdueFollowUps.length - 4} more</div>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate('/leads')}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition"
          >
            View All
          </button>
        </div>
      )}

      {/* ── Action cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SectionCard
          icon={<Search className="w-4 h-4 text-blue-500" />}
          title="Research Queue"
          count={researchQueue.length}
          subtitle={researchQueue.length === 0 ? 'All leads researched 🎉' : 'leads need research'}
          buttonLabel="Start Researching"
          buttonColor="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setProjectionMode('cards');
            navigate('/leads');
          }}
        />

        <SectionCard
          icon={<Bell className="w-4 h-4 text-amber-500" />}
          title="Follow-ups Today"
          count={followUpsToday.length}
          subtitle={followUpsToday.length === 0 ? 'No follow-ups due today' : 'follow-ups scheduled'}
          buttonLabel="View Follow-ups"
          buttonColor="bg-amber-500 hover:bg-amber-600"
          onClick={() => navigate('/leads')}
        />

        <SectionCard
          icon={<Phone className="w-4 h-4 text-emerald-500" />}
          title="Ready to Call"
          count={readyToCall.length}
          subtitle={readyToCall.length === 0 ? 'No leads ready to call yet' : 'leads ready to call'}
          buttonLabel="START CALLING"
          buttonColor="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => navigate('/calling')}
        />
      </div>

      {/* ── Today's Calling Session progress ──────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-500" />
            Today's Calling Session
          </h2>
          <button
            onClick={() => navigate('/calling')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Open Dialer <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {total === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            No calling session started today.{' '}
            <button onClick={() => navigate('/calling')} className="text-indigo-600 hover:underline font-semibold">
              Go to Calling
            </button>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {completed} / {total} completed
                </span>
                <span>{remaining} remaining</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Outcome pills */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <PhoneMissed className="w-4 h-4 text-slate-400 mb-1" />
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">{didntPickUp}</span>
                <span className="text-[11px] text-slate-500 text-center">Didn't Pick Up</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50">
                <XCircle className="w-4 h-4 text-rose-400 mb-1" />
                <span className="text-lg font-extrabold text-rose-700 dark:text-rose-300">{rejected}</span>
                <span className="text-[11px] text-rose-600/80 dark:text-rose-400 text-center">Rejected</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1" />
                <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{interested}</span>
                <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400 text-center">Interested</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── High priority leads quick view ─────────────────────────────────── */}
      {activeClients.filter((c) => (c.leadPriority || c.priority) === 'High').length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              High Priority Leads
            </h2>
            <button
              onClick={() => navigate('/leads')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {activeClients
              .filter((c) => (c.leadPriority || c.priority) === 'High')
              .slice(0, 5)
              .map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 transition cursor-pointer"
                  onClick={() => navigate('/leads')}
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{c.title || c.name}</div>
                    <div className="text-xs text-slate-500">{c.industry || c.niche} · {c.city}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      !c.websiteUrl || c.websiteQuality === 'No Website'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                    }`}>
                      {!c.websiteUrl || c.websiteQuality === 'No Website' ? 'No Website' : 'Has Website'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{c.status || 'Needs Research'}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeClients.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">No leads yet</p>
          <p className="text-sm mt-1">Import a CSV or add leads manually to get started.</p>
        </div>
      )}
    </div>
  );
};
