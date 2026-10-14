// ─── Navigation ─────────────────────────────────────────────────────────────
export type NavigationTab =
  | 'today'
  | 'leads'
  | 'calling'
  | 'analytics'
  | 'settings'
  | 'dashboard'
  | 'clients'
  | 'pipeline'
  | 'sales'
  | 'finance'
  | 'projects'
  | 'team';

// ─── Projection/View Mode ──────────────────────────────────────────────────
export type ProjectionMode = 'cards' | 'table' | 'opportunity' | 'dialer' | 'kanban';

// ─── Research / Lead Status ──────────────────────────────────────────────────
export type ResearchStatus =
  | 'Needs Research'
  | 'Researching'
  | 'Research Complete'
  | 'Ready to Call'
  | 'New'
  | 'Ready for Outreach'
  | string;

export const RESEARCH_STATUSES: string[] = [
  'Needs Research',
  'Researching',
  'Research Complete',
  'Ready to Call',
];

// ─── Lead Status (simplified pipeline + backwards compatibility) ─────────────
export type LeadStatus =
  | 'Needs Research'
  | 'Ready to Call'
  | 'Contacted'
  | 'Follow-Up'
  | 'Interested'
  | 'Rejected'
  | 'New Lead'
  | 'Under Review'
  | 'Call Scheduled'
  | 'Proposal'
  | 'Converted'
  | 'Not Interested';

export const LEAD_STATUSES: LeadStatus[] = [
  'Needs Research',
  'Ready to Call',
  'Contacted',
  'Follow-Up',
  'Interested',
  'Rejected',
];

// ─── Call outcome (used by Speed Dialer) ─────────────────────────────────────
export type CallOutcome = "Didn't Pick Up" | 'Rejected' | 'Interested';

// ─── Priority ────────────────────────────────────────────────────────────────
export type LeadPriority = 'High' | 'Medium' | 'Low';

// ─── Website quality ─────────────────────────────────────────────────────────
export type WebsiteQuality = 'No Website' | 'Website Exists' | 'Needs Review' | string;

// ─── Opportunity type ─────────────────────────────────────────────────────────
export type OpportunityType =
  | 'WEBSITE NEEDED'
  | 'WEBSITE REDESIGN'
  | 'CONVERSION OPPORTUNITY'
  | 'SEO / VISIBILITY'
  | 'GOOD WEBSITE';

export const OPPORTUNITY_TYPES: OpportunityType[] = [
  'WEBSITE NEEDED',
  'WEBSITE REDESIGN',
  'CONVERSION OPPORTUNITY',
  'SEO / VISIBILITY',
  'GOOD WEBSITE',
];

// ─── Activity Log ─────────────────────────────────────────────────────────────
export interface ActivityLogItem {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'import' | 'audit' | 'research' | 'call' | 'email' | 'stage_change' | 'note' | 'outcome';
  author?: string;
  outcome?: CallOutcome;
}

// ─── Lead Filter State ────────────────────────────────────────────────────────
export interface LeadFilterState {
  searchQuery: string;
  industry: string;
  priority: string;
  websiteStatus: string;
  leadStatus: string;
  researchStatus?: string;
}

// ─── Core Client/Lead model ───────────────────────────────────────────────────
export type ClientStage =
  | 'Lead'
  | 'Qualified'
  | 'Research'
  | 'Outreach'
  | 'Reply'
  | 'Call'
  | 'Proposal'
  | 'Won'
  | 'Lost'
  | 'Spec Project';

export const CLIENT_STAGES: ClientStage[] = [
  'Lead', 'Qualified', 'Research', 'Outreach', 'Reply', 'Call', 'Proposal', 'Won', 'Lost', 'Spec Project',
];

export interface AuditChecklist {
  hasHttps: boolean;
  hasMobileViewport: boolean;
  hasClearCTA: boolean;
  hasOnlineBooking: boolean;
  hasMetaDescription: boolean;
  hasPhoneVisible: boolean;
}

export interface OpportunityProfile {
  auditScore: number;
  checks: AuditChecklist;
  recommendedOffer: string;
  whyReasons: string[];
}

export interface Client {
  id: string;
  name: string;
  company: string;
  handle?: string;
  email: string;
  phone?: string;
  stage: ClientStage;
  value: number;
  niche: string;
  platform?: string;
  bioLink?: string;
  keyDetail?: string;
  notes?: string;
  customNotes?: string;
  assignedTo: string;
  dateAdded: string;
  tags?: string[];
  priority?: string;

  // Lead / CSV fields
  title?: string;
  address?: string;
  phoneNumber?: string;
  websiteUrl?: string;
  industry?: string;
  city?: string;
  rating?: string | number | null;
  reviewCount?: string | number | null;
  leadPriority?: LeadPriority;
  mapsLink?: string;
  websiteQuality?: WebsiteQuality;
  problemFound?: string;
  status?: LeadStatus;

  // Contact tracking
  lastContactDate?: string;
  nextFollowUpDate?: string;
  followUpStatus?: 'Pending' | 'Today' | 'Overdue' | 'Completed';
  contactAttemptCount?: number;

  // Intelligence
  researchStatus?: ResearchStatus;
  opportunityTypes?: OpportunityType[];
  whyThisLead?: string;
  opportunityProfile?: OpportunityProfile;
  activityHistory?: ActivityLogItem[];
  nextAction?: string;
  nextActionDueDate?: string;
  nextActionOwner?: string;
  source?: string;
  searchQuery?: string;
  runName?: string;

  // AI research fields
  services?: string[];
  instagramAvailable?: boolean;
  instagramUrl?: string;
  pricingInfo?: string;
  opportunityStrength?: 'Strong' | 'Moderate' | 'Weak';
  aiResearchSummary?: string;
  isRejected?: boolean;
  rejectedAt?: string;
}

export interface Lead {
  id: string;
  title: string;
  address?: string;
  phoneNumber?: string;
  websiteUrl?: string;
  industry?: string;
  city?: string;
  rating?: string | number | null;
  reviewCount?: string | number | null;
  leadPriority?: LeadPriority;
  mapsLink?: string;
  websiteQuality?: WebsiteQuality;
  problemFound?: string;
  notes?: string;
  customNotes?: string;
  status?: LeadStatus;
  dateAdded?: string;
  [key: string]: any;
}

// ─── Theme ────────────────────────────────────────────────────────────────────
export type ThemeMode = 'light' | 'dark';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: string;
  avatarColor: string;
  initials: string;
  createdAt?: string;
}

// ─── Projects (kept in code, not in primary UI) ───────────────────────────────
export type ProjectStatus = 'Planning' | 'In Progress' | 'Review' | 'Completed' | 'On Hold';

export interface Project {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  description: string;
  budget: number;
  progress: number;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
  deadline?: string;
  assignee: string;
  type?: string;
  tags?: string[];
}

// ─── Content (kept in code, not in primary UI) ────────────────────────────────
export type ContentStage = 'Idea' | 'Research' | 'Writing' | 'Design' | 'Scheduled' | 'Published' | 'Performance';
export const CONTENT_STAGES: ContentStage[] = ['Idea','Research','Writing','Design','Scheduled','Published','Performance'];
export type ContentPlatform = 'X' | 'X / Twitter' | 'YouTube' | 'LinkedIn' | 'Instagram' | 'TikTok' | 'Meta Ads' | 'Google Ads' | 'Newsletter';
export type ContentFormat = 'Ad Campaign' | 'Short Video' | 'Carousel' | 'Thread' | 'Story' | 'Long Video' | 'Newsletter';

export interface ContentPiece {
  id: string;
  title: string;
  stage: ContentStage;
  platform: ContentPlatform;
  format: ContentFormat;
  angleHook: string;
  copyText?: string;
  adSpend?: number;
  roas?: number;
  author?: string;
  targetAudience?: string;
  scheduledDate?: string;
  metrics?: { views?: number; clicks?: number; spend?: number; roas?: number; conversions?: number };
  assignee?: string;
  tags?: string[];
  createdAt: string;
}

// ─── Sales (kept in code, not in primary UI) ──────────────────────────────────
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  description: string;
  lineItems?: { description: string; quantity: number; rate: number }[];
}

export interface Proposal {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  value: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
  sentDate: string;
  deliverables?: string[];
}

export interface Contract {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  value: number;
  status: 'Draft' | 'Pending Signature' | 'Active' | 'Completed';
  startDate: string;
  endDate: string;
}

export interface Payment {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  date: string;
  method: 'Stripe' | 'Bank Wire' | 'Wise' | 'Credit Card';
}

// ─── Ideas (kept in code, not in primary UI) ──────────────────────────────────
export type IdeaCategory = 'Ad Angle' | 'Client Pitch' | 'SaaS / Tool' | 'Content Hook' | 'Studio Growth' | 'Quick Note' | 'App Concept' | 'Service Offer' | 'Internal Automation' | 'Wild Experiment';

export interface DumpIdea {
  id: string;
  title: string;
  content?: string;
  description?: string;
  notes?: string;
  category: IdeaCategory;
  priority?: 'low' | 'medium' | 'high';
  tags: string[];
  votes: number;
  author: string;
  createdAt: string;
  status?: string;
  convertedTo?: { type: 'client' | 'project' | 'content'; id: string };
}

export type IdeaItem = DumpIdea;

// ─── Team ─────────────────────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarColor: string;
  initials: string;
  isOnline: boolean;
}

export interface TeamChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatarColor: string;
  authorId?: string;
  authorName?: string;
  text: string;
  timestamp: string;
  reactions?: Record<string, string[]>;
  referencedModule?: { type: 'client' | 'project' | 'content' | 'sales' | 'idea'; title: string };
}

export interface StudioSettings {
  studioName: string;
  tagline: string;
  currency: string;
  dateFormat: string;
  companyEmail: string;
  notificationsEnabled: boolean;
  geminiApiKey?: string;
}
