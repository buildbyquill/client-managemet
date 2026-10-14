import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Users,
  Sparkles,
  Paperclip,
  Smile,
  Copy,
  Check,
  Share2,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const TeamChatDrawer: React.FC = () => {
  const {
    isChatOpen,
    setChatOpen,
    chatMessages,
    sendChatMessage,
    deleteChatMessage,
    activeUser,
    authUser,
    teamMembers,
    isLiveSyncing,
    connectedUsersCount,
  } = useWorkspace();

  const [messageText, setMessageText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentDisplayName = authUser ? authUser.name : activeUser.name;
  const currentUserId = authUser ? authUser.id : activeUser.id;

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  if (!isChatOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendChatMessage(messageText.trim());
    setMessageText('');
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const quickPills = [
    'Reviewed the latest client specs 👍',
    'Sprint retainer setup completed',
    'Moving client to Proposal stage',
    'Systems architecture ready for review',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Studio Team Chat</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveSyncing ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                } inline-block`}
              />
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-400">
              Live collaboration • BuildWithQuill
            </div>
          </div>
        </div>

        <button
          onClick={() => setChatOpen(false)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Online Team Badges */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {teamMembers.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border transition-colors ${
                (authUser?.id || activeUser.id) === m.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full ${m.avatarColor} text-white flex items-center justify-center text-[8px] font-bold`}
              >
                {m.initials[0]}
              </span>
              <span>{m.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleCopyInvite}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-[10px] font-semibold flex items-center gap-1 shrink-0 ml-2"
          title="Share workspace link"
        >
          {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
          <span>{copiedLink ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800/80 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Live Team Room
            </p>
            <p className="text-[11px] leading-relaxed max-w-[200px]">
              Chat in real-time with Ayush, Jai, and Harvansh. All messages instantly sync across all 3 browsers.
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const senderId = msg.senderId || msg.authorId;
            const isMe = senderId === currentUserId;
            const senderDisplayName = msg.senderName || msg.authorName || 'Team';
            const avatarBg = msg.senderAvatarColor || 'bg-indigo-600';

            return (
              <div
                key={msg.id}
                className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'} text-xs`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 dark:text-slate-500">
                  {!isMe && (
                    <span
                      className={`w-3.5 h-3.5 rounded-full ${avatarBg} text-white flex items-center justify-center text-[8px] font-bold`}
                    >
                      {senderDisplayName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{senderDisplayName}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {msg.referencedModule && (
                    <span className="px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[9px] text-slate-500 dark:text-slate-400">
                      {(msg.referencedModule as any).title || (msg.referencedModule as any).name}
                    </span>
                  )}
                  <button
                    onClick={() => deleteChatMessage(msg.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity ml-1 p-0.5"
                    title="Delete message"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs shadow-2xs ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick response suggestions */}
      <div className="px-3 py-1.5 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px]">
        {quickPills.map((pill, i) => (
          <button
            key={i}
            onClick={() => sendChatMessage(pill)}
            className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0 whitespace-nowrap transition-colors"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Message as ${currentDisplayName.split(' ')[0]}...`}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={!messageText.trim()}
            className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-2xs shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
