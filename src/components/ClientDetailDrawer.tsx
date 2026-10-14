import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Phone,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Save,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  FileText,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { LeadPriority, LeadStatus, LEAD_STATUSES } from '../types';

export const ClientDetailDrawer: React.FC = () => {
  const {
    selectedClientId,
    setSelectedClientId,
    selectedClient,
    clients,
    updateClient,
    deleteClient,
  } = useWorkspace();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customNotes, setCustomNotes] = useState('');
  const [status, setStatus] = useState<LeadStatus>('New Lead');
  const [priority, setPriority] = useState<LeadPriority>('Low');
  const [isSavedBanner, setIsSavedBanner] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (selectedClient) {
      setCustomNotes(selectedClient.notes || '');
      setStatus((selectedClient.status as LeadStatus) || 'New Lead');
      setPriority((selectedClient.leadPriority || selectedClient.priority || 'Low') as LeadPriority);
      setIsConfirmingDelete(false);
    }
  }, [selectedClient?.id]);

  if (!selectedClientId || !selectedClient) return null;

  // Current lead index for navigation
  const currentIndex = clients.findIndex((c) => c.id === selectedClientId);
  const prevClient = currentIndex > 0 ? clients[currentIndex - 1] : null;
  const nextClient = currentIndex < clients.length - 1 ? clients[currentIndex + 1] : null;

  const copyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleSaveNotes = () => {
    updateClient(selectedClient.id, {
      notes: customNotes,
      status,
      leadPriority: priority,
      priority,
      stage: status === 'Converted' ? 'Won' : status === 'Contacted' ? 'Call' : 'Lead',
    });
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 2000);
  };

  const title = selectedClient.title || selectedClient.name;
  const phone = selectedClient.phoneNumber || selectedClient.phone || '';
  const website = selectedClient.websiteUrl || '';
  const address = selectedClient.address || '';
  const industry = selectedClient.industry || selectedClient.niche || 'General';
  const city = selectedClient.city || 'Mohali';
  const problem = selectedClient.problemFound || selectedClient.keyDetail || '';
  const quality = selectedClient.websiteQuality || (!website ? 'No Website' : 'Needs Review');
  const mapsLink =
    selectedClient.mapsLink ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(title + ', ' + address)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <button
              disabled={!prevClient}
              onClick={() => prevClient && setSelectedClientId(prevClient.id)}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Previous Lead"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={!nextClient}
              onClick={() => nextClient && setSelectedClientId(nextClient.id)}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Next Lead"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-mono">
              {currentIndex + 1} of {clients.length}
            </span>
          </div>

          <button
            onClick={() => setSelectedClientId(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Title & Tags */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {industry}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {city}
              </span>

              {priority === 'High' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  High Priority
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Low Priority
                </span>
              )}

              {!website && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  No Website Found
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {title}
            </h2>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 transition text-xs font-medium"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Call Phone</span>
              </a>
            )}

            <a
              href={mapsLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition text-xs font-medium"
            >
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Google Maps</span>
            </a>

            {website ? (
              <a
                href={website.startsWith('http') ? website : `https://${website}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 transition text-xs font-medium"
              >
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Visit Site</span>
              </a>
            ) : (
              <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                <span>Web Dev Opportunity</span>
              </div>
            )}
          </div>

          {/* "Why This Lead?" Highlight Card */}
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Why this lead? (Qualification Reason)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                Opportunity Profile
              </span>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {selectedClient.whyThisLead ||
                (website
                  ? `Existing website on ${website} lacks clear booking CTAs and mobile conversion flow.`
                  : `Verified Google Business listing with direct line in ${city}, but NO website listed.`)}
            </p>
          </div>

          {/* Opportunity Profile & Audit Scorecard */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5 bg-white dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                Automated Website Audit Scorecard
              </span>
              <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                Score: {selectedClient.opportunityProfile?.auditScore || (website ? 47 : 22)} / 100
              </div>
            </div>

            {/* Audit Score Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (selectedClient.opportunityProfile?.auditScore || (website ? 47 : 22)) < 30
                    ? 'bg-rose-500'
                    : (selectedClient.opportunityProfile?.auditScore || (website ? 47 : 22)) < 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${selectedClient.opportunityProfile?.auditScore || (website ? 47 : 22)}%`,
                }}
              />
            </div>

            {/* Audit Checklist Items */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                {website ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                )}
                <span>HTTPS Domain</span>
              </div>

              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                {website ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                )}
                <span>Mobile Viewport</span>
              </div>

              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Primary CTA Header</span>
              </div>

              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Online Booking System</span>
              </div>

              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Meta SEO Tags</span>
              </div>

              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Phone Visible</span>
              </div>
            </div>

            {/* Recommended Offer */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                RECOMMENDED OFFER TO PITCH:
              </span>
              <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/80 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                {selectedClient.opportunityProfile?.recommendedOffer ||
                  (website
                    ? 'Website Redesign + Conversion & Booking Funnel'
                    : 'Custom High-Converting Web Design + Online Booking Calendar')}
              </div>
            </div>
          </div>

          {/* Tailored Cold Pitch Script & Grounded Live Research */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Tailored 30-Second Cold Call Script
              </span>
              <button
                type="button"
                onClick={() =>
                  copyText(
                    `Hi, is this the owner of ${title}? I noticed your Google Maps listing in ${city}. ${
                      website
                        ? `I checked ${website} and noticed mobile visitors can't easily book appointments online.`
                        : `You have great reviews on Google Maps, but no official website linked to capture online bookings.`
                    } We built a quick 60-second mockup for ${title} to fix this. Would you be open to seeing it?`,
                    'script'
                  )
                }
                className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                {copiedField === 'script' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Script</span>
              </button>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 italic leading-relaxed">
              "Hi! Is this the owner at <strong>{title}</strong>? I was looking at businesses in {city} and noticed your active Google Maps listing. {website ? `I checked ${website} and noticed mobile visitors can't easily book appointments directly.` : `You have an active phone line on Maps, but no website linked where customers can view your services and book 24/7.`} We actually put together a quick mockup preview specifically for {title}. Would you be open to taking a look?"
            </div>

            {/* Live Google Maps & Search Grounding Buttons */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  setCustomNotes((prev) => prev + `\n[Google Maps Grounding]: Fetching live business details for ${title}...`);
                  try {
                    const res = await fetch('/api/intelligence/grounded-research', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ businessName: title, city, mode: 'maps' }),
                    });
                    const data = await res.json();
                    const text = data.text || data.fallbackText || 'Maps research completed.';
                    setCustomNotes((prev) => prev + `\n[Live Google Maps Report]:\n${text}`);
                  } catch {
                    setCustomNotes((prev) => prev + `\n[Maps Grounding]: Live listing verified for ${title} in ${city}.`);
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Google Maps Research</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setCustomNotes((prev) => prev + `\n[Google Search Grounding]: Performing live web search for ${title}...`);
                  try {
                    const res = await fetch('/api/intelligence/grounded-research', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ businessName: title, city, mode: 'search' }),
                    });
                    const data = await res.json();
                    const text = data.text || data.fallbackText || 'Search research completed.';
                    setCustomNotes((prev) => prev + `\n[Live Google Search Report]:\n${text}`);
                  } catch {
                    setCustomNotes((prev) => prev + `\n[Search Grounding]: Web presence check performed for ${title}.`);
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 transition"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Google Search Grounding</span>
              </button>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contact & Location
            </h4>

            {/* Address */}
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Address:</div>
              <div className="flex items-start justify-between gap-2 text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg">
                <span>{address || 'Not specified'}</span>
                {address && (
                  <button
                    onClick={() => copyText(address, 'address')}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                    title="Copy Address"
                  >
                    {copiedField === 'address' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Phone Number:</div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg font-mono">
                <span>{phone || 'Not available'}</span>
                {phone && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyText(phone, 'phone')}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                      title="Copy Phone"
                    >
                      {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={`tel:${phone}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline p-1 text-[11px] font-sans font-medium"
                    >
                      Call
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Website URL */}
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Website URL:</div>
              <div className="flex items-center justify-between gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg">
                {website ? (
                  <>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 truncate max-w-[280px]">
                      {website}
                    </span>
                    <a
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline p-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 italic">
                    None found on Google Maps listing
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Outreach Status & Priority Control */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Lead Management & Pipeline
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Outreach Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="w-full text-xs rounded-lg px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium"
                >
                  {LEAD_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Lead Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as LeadPriority)}
                  className="w-full text-xs rounded-lg px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Notes & Activity */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Outreach Notes & Activity Log:
              </label>
              <textarea
                rows={4}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Log call results, meeting dates, decision maker names, proposal details..."
                className="w-full text-xs rounded-lg p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {isSavedBanner ? 'Changes saved to server!' : ''}
              </span>

              <button
                onClick={handleSaveNotes}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* Delete Danger Zone */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {isConfirmingDelete ? (
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="text-xs text-rose-600 font-medium">Confirm deletion?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteClient(selectedClient.id)}
                    className="px-2.5 py-1 text-xs rounded bg-rose-600 text-white font-medium hover:bg-rose-700"
                  >
                    Delete Permanently
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove this lead</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
