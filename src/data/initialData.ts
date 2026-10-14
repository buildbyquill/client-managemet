import {
  Client,
  Project,
  ContentPiece,
  Invoice,
  Proposal,
  Contract,
  Payment,
  DumpIdea,
  TeamMember,
  TeamChatMessage,
  StudioSettings,
} from '../types';

// ─── Option B: Fresh start — all collections are empty ───────────────────────
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_CONTENT: ContentPiece[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_PROPOSALS: Proposal[] = [];
export const INITIAL_CONTRACTS: Contract[] = [];
export const INITIAL_PAYMENTS: Payment[] = [];
export const INITIAL_IDEAS: DumpIdea[] = [];
export const INITIAL_CHAT_MESSAGES: TeamChatMessage[] = [];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'usr-owner',
    name: 'Owner',
    role: 'Founder',
    email: 'owner@quillland.com',
    avatarColor: 'bg-indigo-600',
    initials: 'OW',
    isOnline: true,
  },
];

export const INITIAL_SETTINGS: StudioSettings = {
  studioName: 'Quill Land',
  tagline: 'Lead Management · COLLECT → CLEAN → RESEARCH → PRIORITIZE → CALL → FOLLOW UP',
  currency: 'INR (₹)',
  dateFormat: 'YYYY-MM-DD',
  companyEmail: '',
  notificationsEnabled: true,
};
