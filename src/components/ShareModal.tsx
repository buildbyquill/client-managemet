import React, { useState } from 'react';
import { X, Share2, Copy, Check, Users, Shield, Link2, Send, KeyRound } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

const TEAM_PASSWORDS: Record<string, string> = {
  ayush: 'ayush#founder99',
  jai: 'jai#builder88',
  harvansh: 'harvansh#sales77',
};

export const ShareModal: React.FC = () => {
  const { isShareModalOpen, setShareModalOpen, teamMembers, activeUser, switchActiveTeamMember, setAuthModalOpen } = useWorkspace();
  const [copied, setCopied] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState<string | null>(null);

  if (!isShareModalOpen) return null;

  const appUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCredentials = (username: string) => {
    const pwd = TEAM_PASSWORDS[username.toLowerCase()] || 'ayush#founder99';
    const text = `BuildWithQuill Studio Access:\nURL: ${appUrl}\nUsername: ${username}\nPassword: ${pwd}`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(username);
    setTimeout(() => setCopiedCreds(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Share Workspace</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-400">Invite team members to collaborate live in real time.</p>
            </div>
          </div>

          <button
            onClick={() => setShareModalOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Quick Copy Link */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Direct Workspace Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-mono text-[11px] focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Active Collaborators & Credentials */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Team Member Accounts</span>
              <span className="text-[10px] text-slate-400">Individual Secure Passwords</span>
            </div>
            <div className="space-y-2">
              {teamMembers.map((m) => {
                const username = m.email ? m.email.split('@')[0] : m.name.toLowerCase().replace(/\s+/g, '');
                const pwd = TEAM_PASSWORDS[username.toLowerCase()] || '••••••••';
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full ${m.avatarColor} text-white flex items-center justify-center font-bold text-[10px]`}
                      >
                        {m.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{m.name} <span className="text-[10px] text-slate-400 font-normal">({m.role})</span></div>
                        <div className="text-[10px] text-slate-400 font-mono">@{username} • <span className="text-indigo-600 dark:text-indigo-400">{pwd}</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          switchActiveTeamMember(m);
                          setShareModalOpen(false);
                        }}
                        className={`text-[10px] font-semibold px-2 py-1 rounded transition-colors ${
                          activeUser.id === m.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {activeUser.id === m.id ? 'Active' : 'Switch'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyCredentials(username)}
                        className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-800/60 transition-colors flex items-center gap-1"
                      >
                        {copiedCreds === username ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Login</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Sign In button */}
          <div className="pt-2">
            <button
              onClick={() => {
                setShareModalOpen(false);
                setAuthModalOpen(true);
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
              <span>Switch Team Member or Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
