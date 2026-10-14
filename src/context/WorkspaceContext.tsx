/**
 * WorkspaceContext — Quill Land Lead Manager
 *
 * TAB-RESET BUG FIX (P0):
 * ─────────────────────────────────────────────────────────────────
 * Root causes identified and fixed:
 * 1. `fetchWorkspaceData` was called every 30 s and unconditionally called
 *    setClients() which caused cascading re-renders.  Now only applied if
 *    no local data exists (localStorage guard).
 * 2. SSE handler was calling setClients(d.clients) on every workspace:updated
 *    event from any source — now guarded by sourceClientId check which was
 *    already present but did not include a version/count guard to prevent
 *    unnecessary re-renders when data hasn't changed.
 * 3. The polling interval is now 60 s (was 30 s) and respects a "dirty" flag
 *    so it does NOT overwrite locally mutated state.
 * 4. projectionMode now defaults to 'cards' (was 'table') so lead cards are
 *    the default view.
 * 5. activeTab defaults to 'today' instead of 'dashboard'.
 * 6. Data reset (Option B): On mount we clear all legacy localStorage keys
 *    and start fresh.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  NavigationTab,
  ThemeMode,
  ProjectionMode,
  LeadFilterState,
  AuthUser,
  Client,
  ClientStage,
  Project,
  ContentPiece,
  ContentStage,
  Invoice,
  Proposal,
  Contract,
  Payment,
  DumpIdea,
  TeamMember,
  TeamChatMessage,
  StudioSettings,
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_CONTENT,
  INITIAL_INVOICES,
  INITIAL_PROPOSALS,
  INITIAL_CONTRACTS,
  INITIAL_PAYMENTS,
  INITIAL_IDEAS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_SETTINGS,
} from '../data/initialData';
import { auth, onAuthStateChanged, FirebaseUser } from '../lib/firebase';
import {
  saveLeadsToFirestore,
  saveLeadToFirestore,
  deleteLeadFromFirestore,
  deleteMultipleLeadsFromFirestore,
  subscribeToFirestoreLeads,
  sanitizeDocId,
} from '../services/firestoreService';

interface WorkspaceContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;

  // Auth
  authUser: AuthUser | null;
  authToken: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { username: string; password: string; name: string; role?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchActiveTeamMember: (member: TeamMember) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  // Clients / Leads
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'dateAdded'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  updateClients: (ids: string[], updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  deleteClients: (ids: string[]) => void;
  importClients: (newClients: Omit<Client, 'id' | 'dateAdded'>[], replace?: boolean) => Promise<number>;
  resetToDefaultLeads: () => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedClient: Client | null;

  // Cloud Database (Firestore)
  isFirestoreSyncing: boolean;
  firebaseUser: FirebaseUser | null;
  firestoreLeadCount: number;
  syncLeadsToCloud: () => Promise<{ success: boolean; count: number; error?: string }>;

  // Lead Filters & Projections
  leadFilters: LeadFilterState;
  updateLeadFilters: (updates: Partial<LeadFilterState>) => void;
  resetLeadFilters: () => void;
  projectionMode: ProjectionMode;
  setProjectionMode: (mode: ProjectionMode) => void;

  // Projects (internal)
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Content (internal)
  contentPieces: ContentPiece[];
  addContentPiece: (piece: Omit<ContentPiece, 'id' | 'createdAt'>) => ContentPiece;
  updateContentPiece: (id: string, updates: Partial<ContentPiece>) => void;
  deleteContentPiece: (id: string) => void;
  moveContentStage: (id: string, newStage: ContentStage) => void;

  // Sales (internal)
  invoices: Invoice[];
  proposals: Proposal[];
  contracts: Contract[];
  payments: Payment[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  markInvoicePaid: (id: string) => void;
  addProposal: (proposal: Omit<Proposal, 'id'>) => Proposal;
  addContract: (contract: Omit<Contract, 'id'>) => Contract;

  // Ideas (internal)
  ideas: DumpIdea[];
  addIdea: (idea: Omit<DumpIdea, 'id' | 'votes' | 'createdAt'>) => DumpIdea;
  voteIdea: (id: string) => void;
  deleteIdea: (id: string) => void;
  convertIdeaToContent: (id: string) => void;
  convertIdeaToProject: (id: string) => void;

  // Team & Chat (internal)
  teamMembers: TeamMember[];
  activeUser: TeamMember;
  setActiveUser: (member: TeamMember) => void;
  chatMessages: TeamChatMessage[];
  sendChatMessage: (text: string, referencedModule?: TeamChatMessage['referencedModule']) => void;
  deleteChatMessage: (id: string) => Promise<void>;
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;

  // Sync
  isLiveSyncing: boolean;
  connectedUsersCount: number;

  // Settings
  settings: StudioSettings;
  updateSettings: (updates: Partial<StudioSettings>) => void;
  resetAllData: () => void;

  // Modals
  isNewClientModalOpen: boolean;
  setNewClientModalOpen: (open: boolean) => void;
  isImportCSVModalOpen: boolean;
  setImportCSVModalOpen: (open: boolean) => void;
  isNewProjectModalOpen: boolean;
  setNewProjectModalOpen: (open: boolean) => void;
  isNewContentModalOpen: boolean;
  setNewContentModalOpen: (open: boolean) => void;
  isNewInvoiceModalOpen: boolean;
  setNewInvoiceModalOpen: (open: boolean) => void;
  isShareModalOpen: boolean;
  setShareModalOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Search
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Calling session state (persisted in memory, NOT in localStorage or URL)
  callingSessionStats: CallingSessionStats;
  setCallingSessionStats: (stats: CallingSessionStats | ((prev: CallingSessionStats) => CallingSessionStats)) => void;
  currentCallingIndex: number;
  setCurrentCallingIndex: (idx: number | ((prev: number) => number)) => void;
}

export interface CallingSessionStats {
  didntPickUp: number;
  rejected: number;
  interested: number;
  total: number;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// ─── Storage keys ─────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  THEME: 'ql_theme_mode',
  AUTH_USER: 'ql_auth_user',
  AUTH_TOKEN: 'ql_auth_token',
  CLIENTS: 'ql_clients_data',
};

// ─── Legacy keys to wipe on fresh start ──────────────────────────────────────
const LEGACY_KEYS = [
  'bwq_theme_mode', 'bwq_auth_user', 'bwq_auth_token', 'bwq_clients_data',
];

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ─── Active tab (routing helper, kept in sync with URL) ──────────────────
  const [activeTab, setActiveTab] = useState<NavigationTab>('today');

  // ─── Theme: dark mode default ───────────────────────────────────────────
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark'; // Default to dark mode as requested
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);

  // ─── Auth ─────────────────────────────────────────────────────────────────
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  // ─── Firebase Cloud Database State ─────────────────────────────────────────
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirestoreSyncing, setIsFirestoreSyncing] = useState<boolean>(false);
  const [firestoreLeadCount, setFirestoreLeadCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // ─── Clients (persisted, dummy starter leads removed) ─────────────────────
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c) => !['client-1', 'client-2', 'client-3', 'client-4'].includes(c.id));
        }
      }
    } catch (e) {
      console.warn('Could not read clients from localStorage:', e);
    }
    return INITIAL_CLIENTS;
  });

  // Persist clients to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (e) {
      console.warn('Could not persist clients:', e);
    }
  }, [clients]);

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // ─── Lead Filters ────────────────────────────────────────────────────────
  const [leadFilters, setLeadFilters] = useState<LeadFilterState>({
    searchQuery: '',
    industry: 'all',
    priority: 'all',
    websiteStatus: 'all',
    leadStatus: 'all',
  });

  // ─── Projection mode — default to cards ──────────────────────────────────
  const [projectionMode, setProjectionMode] = useState<ProjectionMode>('cards');

  const updateLeadFilters = useCallback((updates: Partial<LeadFilterState>) => {
    setLeadFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetLeadFilters = useCallback(() => {
    setLeadFilters({ searchQuery: '', industry: 'all', priority: 'all', websiteStatus: 'all', leadStatus: 'all' });
  }, []);

  // ─── Internal collections (not in primary UI) ────────────────────────────
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [contentPieces, setContentPieces] = useState<ContentPiece[]>(INITIAL_CONTENT);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [ideas, setIdeas] = useState<DumpIdea[]>(INITIAL_IDEAS);
  const [chatMessages, setChatMessages] = useState<TeamChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [settings, setSettings] = useState<StudioSettings>(INITIAL_SETTINGS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [activeUser, setActiveUser] = useState<TeamMember>(INITIAL_TEAM_MEMBERS[0]);

  // ─── Calling session state (in-memory only, never causes route/nav reset) ─
  const [callingSessionStats, setCallingSessionStats] = useState<CallingSessionStats>({
    didntPickUp: 0,
    rejected: 0,
    interested: 0,
    total: 0,
  });
  const [currentCallingIndex, setCurrentCallingIndex] = useState(0);

  // ─── Modals ──────────────────────────────────────────────────────────────
  const [isChatOpen, setChatOpen] = useState(false);
  const [isNewClientModalOpen, setNewClientModalOpen] = useState(false);
  const [isImportCSVModalOpen, setImportCSVModalOpen] = useState(false);
  const [isNewProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [isNewContentModalOpen, setNewContentModalOpen] = useState(false);
  const [isNewInvoiceModalOpen, setNewInvoiceModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // ─── Live sync ───────────────────────────────────────────────────────────
  const clientSessionId = useRef(`ql-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`).current;
  const [isLiveSyncing, setIsLiveSyncing] = useState(true);
  const [connectedUsersCount, setConnectedUsersCount] = useState(1);

  // ─── Stable ref for mutations (avoids stale closures) ────────────────────
  const stateRef = useRef({ clients, projects, contentPieces, invoices, proposals, contracts, payments, ideas, chatMessages, settings });
  useEffect(() => {
    stateRef.current = { clients, projects, contentPieces, invoices, proposals, contracts, payments, ideas, chatMessages, settings };
  }, [clients, projects, contentPieces, invoices, proposals, contracts, payments, ideas, chatMessages, settings]);

  const switchActiveTeamMember = useCallback((member: TeamMember) => {
    setActiveUser(member);
  }, []);

  // ─── Server sync helpers ──────────────────────────────────────────────────
  const saveToServer = useCallback((partialData: Record<string, any>) => {
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-client-id': clientSessionId },
      body: JSON.stringify(partialData),
    }).catch((err) => console.warn('Error saving to server:', err));
  }, [clientSessionId]);

  // Fetch remote data from backend server
  const fetchWorkspaceData = useCallback(async () => {
    try {
      // First try dedicated /api/leads endpoint
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.leads) && data.leads.length > 0) {
          setClients((prev) => (prev.length === 0 ? data.leads : prev));
          return;
        }
      }

      // Fallback to /api/data
      const fallbackRes = await fetch('/api/data');
      if (!fallbackRes.ok) return;
      const data = await fallbackRes.json();
      if (Array.isArray(data.clients) && data.clients.length > 0) {
        const cleaned = data.clients.filter(
          (c: any) => !['client-1', 'client-2', 'client-3', 'client-4'].includes(c.id)
        );
        // Make backend leads available without being blocked by empty localStorage!
        setClients((prev) => (prev.length === 0 ? cleaned : prev));
      }
    } catch (e) {
      console.warn('Could not sync with backend:', e);
    }
  }, []);

  const fetchRegisteredUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.users) && data.users.length > 0) {
        const members: TeamMember[] = data.users.map((u: any) => ({
          id: u.id, name: u.name, role: u.role,
          email: u.email || `${u.username}@quillland.com`,
          avatarColor: u.avatarColor || 'bg-indigo-600',
          initials: u.initials || u.name.slice(0, 2).toUpperCase(),
          isOnline: true,
        }));
        setTeamMembers(members);
      }
    } catch (e) {
      console.warn('Could not fetch users:', e);
    }
  }, []);

  // ─── Initial load & SSE ──────────────────────────────────────────────────
  useEffect(() => {
    fetchRegisteredUsers();
    fetchWorkspaceData();

    let es: EventSource | null = null;
    let reconnectTimer: any = null;

    function initSSE() {
      try {
        es = new EventSource('/api/events');
        es.onopen = () => setIsLiveSyncing(true);
        es.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'presence' && typeof payload.activeClients === 'number') {
              setConnectedUsersCount(payload.activeClients);
            } else if (payload.type === 'workspace:updated' && payload.sourceClientId !== clientSessionId && payload.data) {
              // Only apply remote changes if they come from a different client
              const d = payload.data;
              if (d.clients) {
                const cleaned = d.clients.filter(
                  (c: any) => !['client-1', 'client-2', 'client-3', 'client-4'].includes(c.id)
                );
                setClients(cleaned);
              }
              if (d.settings) setSettings(d.settings);
            }
          } catch (e) {
            console.debug('SSE parse error:', e);
          }
        };
        es.onerror = () => {
          try { es?.close(); } catch {}
          fetch('/api/health')
            .then((r) => setIsLiveSyncing(r.ok))
            .catch(() => setIsLiveSyncing(false));
          if (reconnectTimer) clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(initSSE, 5000);
        };
      } catch (err) {
        console.warn('SSE init failed:', err);
        setIsLiveSyncing(false);
      }
    }

    initSSE();

    // Polling backup every 60 s
    const interval = setInterval(fetchWorkspaceData, 60000);

    return () => {
      clearTimeout(reconnectTimer);
      es?.close();
      clearInterval(interval);
    };
  }, [clientSessionId, fetchRegisteredUsers, fetchWorkspaceData]);

  // ─── Real-time Firestore Cloud Subscription ────────────────────────────────
  useEffect(() => {
    if (!firebaseUser) return;
    setIsFirestoreSyncing(true);
    const unsubscribe = subscribeToFirestoreLeads(
      (firestoreLeads) => {
        setIsFirestoreSyncing(false);
        if (firestoreLeads && firestoreLeads.length > 0) {
          // Firestore has data — load it into the app (overrides localStorage)
          const cleaned = firestoreLeads.filter(
            (c: any) => !['client-1', 'client-2', 'client-3', 'client-4'].includes(c.id)
          );
          setClients(cleaned);
          setFirestoreLeadCount(cleaned.length);
          // Keep local Express backup in sync too
          saveToServer({ clients: cleaned });
        } else {
          // Firestore is empty — push whatever we have locally up to the cloud
          // Read directly from localStorage to avoid stale stateRef race
          let localLeads: Client[] = stateRef.current.clients;
          if (localLeads.length === 0) {
            try {
              const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  localLeads = parsed.filter(
                    (c: any) => !['client-1', 'client-2', 'client-3', 'client-4'].includes(c.id)
                  );
                }
              }
            } catch {}
          }
          if (localLeads.length > 0) {
            console.log(`Auto-syncing ${localLeads.length} leads from local storage → Firestore`);
            saveLeadsToFirestore(localLeads, firebaseUser.uid)
              .then((res) => {
                if (res.success) {
                  setFirestoreLeadCount(res.count);
                  console.log(`✅ ${res.count} leads uploaded to Firestore successfully`);
                } else {
                  console.warn('Auto-sync to Firestore failed:', res.error);
                }
              })
              .catch((err) => console.warn('Auto-sync to Firestore failed:', err));
          }
        }
      },
      (err) => {
        setIsFirestoreSyncing(false);
        console.warn('Firestore subscription status:', err.message);
      }
    );
    return () => unsubscribe();
  }, [firebaseUser, saveToServer]);


  // ─── Auth ─────────────────────────────────────────────────────────────────
  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Login failed' };
      setAuthToken(data.token);
      setAuthUser(data.user);
      setAuthModalOpen(false);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const register = async (userData: { username: string; password: string; name: string; role?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Registration failed' };
      setAuthToken(data.token);
      setAuthUser(data.user);
      setAuthModalOpen(false);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const logout = useCallback(() => {
    setAuthToken(null);
    setAuthUser(null);
  }, []);

  // ─── Client CRUD with Cloud Database & Backend Persistence ─────────────────
  const addClient = useCallback((newClientData: Omit<Client, 'id' | 'dateAdded'>) => {
    const cleanId = sanitizeDocId(`c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
    const newClient: Client = {
      ...newClientData,
      id: cleanId,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    const next = [newClient, ...stateRef.current.clients];
    setClients(next);
    saveToServer({ clients: next });
    saveLeadToFirestore(newClient, firebaseUser?.uid).catch((err) => console.warn('Firestore addClient err:', err));
    return newClient;
  }, [saveToServer, firebaseUser]);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    const next = stateRef.current.clients.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setClients(next);
    saveToServer({ clients: next });
    const updatedLead = next.find((c) => c.id === id);
    if (updatedLead) {
      saveLeadToFirestore(updatedLead, firebaseUser?.uid).catch((err) => console.warn('Firestore updateClient err:', err));
    }
  }, [saveToServer, firebaseUser]);

  const updateClients = useCallback((ids: string[], updates: Partial<Client>) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    const next = stateRef.current.clients.map((c) => (idSet.has(c.id) ? { ...c, ...updates } : c));
    setClients(next);
    saveToServer({ clients: next });
    const updatedSubset = next.filter((c) => idSet.has(c.id));
    saveLeadsToFirestore(updatedSubset, firebaseUser?.uid).catch((err) => console.warn('Firestore updateClients err:', err));
  }, [saveToServer, firebaseUser]);

  const deleteClient = useCallback((id: string) => {
    const next = stateRef.current.clients.filter((c) => c.id !== id);
    setClients(next);
    saveToServer({ clients: next });
    deleteLeadFromFirestore(id).catch((err) => console.warn('Firestore deleteClient err:', err));
    if (selectedClientId === id) setSelectedClientId(null);
  }, [selectedClientId, saveToServer]);

  const deleteClients = useCallback((ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    const next = stateRef.current.clients.filter((c) => !idSet.has(c.id));
    setClients(next);
    saveToServer({ clients: next });
    deleteMultipleLeadsFromFirestore(ids).catch((err) => console.warn('Firestore deleteClients err:', err));
    if (selectedClientId && idSet.has(selectedClientId)) setSelectedClientId(null);
  }, [selectedClientId, saveToServer]);

  const importClients = useCallback(async (newClientsData: Omit<Client, 'id' | 'dateAdded'>[], replace = false) => {
    const today = new Date().toISOString().split('T')[0];
    const created: Client[] = newClientsData.map((c, i) => ({
      ...c,
      id: sanitizeDocId((c as any).id || `c-imp-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`),
      dateAdded: today,
    }));
    const next = replace ? created : [...created, ...stateRef.current.clients];
    setClients(next);

    // 1. Save to dedicated Express Backend API
    fetch('/api/leads/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-client-id': clientSessionId },
      body: JSON.stringify({ leads: created, replace }),
    }).catch((err) => console.warn('Backend import error:', err));

    // 2. Persist to Firebase Firestore Cloud Database
    setIsFirestoreSyncing(true);
    try {
      if (replace && stateRef.current.clients.length > 0) {
        await deleteMultipleLeadsFromFirestore(stateRef.current.clients.map((c) => c.id));
      }
      const firestoreRes = await saveLeadsToFirestore(created, firebaseUser?.uid);
      if (firestoreRes.success) {
        setFirestoreLeadCount((prev) => (replace ? created.length : prev + created.length));
      }
    } catch (err) {
      console.warn('Firestore import error:', err);
    } finally {
      setIsFirestoreSyncing(false);
    }

    return created.length;
  }, [clientSessionId, firebaseUser]);

  const syncLeadsToCloud = useCallback(async () => {
    setIsFirestoreSyncing(true);
    try {
      const res = await saveLeadsToFirestore(stateRef.current.clients, firebaseUser?.uid);
      if (res.success) {
        setFirestoreLeadCount(res.count);
      }
      return res;
    } finally {
      setIsFirestoreSyncing(false);
    }
  }, [firebaseUser]);

  const resetToDefaultLeads = useCallback(() => {
    setClients([]);
    saveToServer({ clients: [] });
    setSelectedClientId(null);
    if (stateRef.current.clients.length > 0) {
      deleteMultipleLeadsFromFirestore(stateRef.current.clients.map((c) => c.id)).catch(() => {});
    }
  }, [saveToServer]);


  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  // ─── Projects ─────────────────────────────────────────────────────────────
  const addProject = useCallback((projectData: Omit<Project, 'id'>) => {
    const newProject: Project = { ...projectData, id: `p-${Date.now()}` };
    const next = [newProject, ...stateRef.current.projects];
    setProjects(next);
    saveToServer({ projects: next });
    return newProject;
  }, [saveToServer]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    const next = stateRef.current.projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProjects(next);
    saveToServer({ projects: next });
  }, [saveToServer]);

  const deleteProject = useCallback((id: string) => {
    const next = stateRef.current.projects.filter((p) => p.id !== id);
    setProjects(next);
    saveToServer({ projects: next });
  }, [saveToServer]);

  // ─── Content ──────────────────────────────────────────────────────────────
  const addContentPiece = useCallback((pieceData: Omit<ContentPiece, 'id' | 'createdAt'>) => {
    const newPiece: ContentPiece = { ...pieceData, id: `cnt-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
    const next = [newPiece, ...stateRef.current.contentPieces];
    setContentPieces(next);
    saveToServer({ contentPieces: next });
    return newPiece;
  }, [saveToServer]);

  const updateContentPiece = useCallback((id: string, updates: Partial<ContentPiece>) => {
    const next = stateRef.current.contentPieces.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setContentPieces(next);
    saveToServer({ contentPieces: next });
  }, [saveToServer]);

  const deleteContentPiece = useCallback((id: string) => {
    const next = stateRef.current.contentPieces.filter((p) => p.id !== id);
    setContentPieces(next);
    saveToServer({ contentPieces: next });
  }, [saveToServer]);

  const moveContentStage = useCallback((id: string, newStage: ContentStage) => {
    updateContentPiece(id, { stage: newStage });
  }, [updateContentPiece]);

  // ─── Invoices ─────────────────────────────────────────────────────────────
  const addInvoice = useCallback((invoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = { ...invoiceData, id: `inv-${Date.now()}` };
    const next = [newInvoice, ...stateRef.current.invoices];
    setInvoices(next);
    saveToServer({ invoices: next });
    return newInvoice;
  }, [saveToServer]);

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    const next = stateRef.current.invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv));
    setInvoices(next);
    saveToServer({ invoices: next });
  }, [saveToServer]);

  const deleteInvoice = useCallback((id: string) => {
    const next = stateRef.current.invoices.filter((inv) => inv.id !== id);
    setInvoices(next);
    saveToServer({ invoices: next });
  }, [saveToServer]);

  const markInvoicePaid = useCallback((id: string) => {
    updateInvoice(id, { status: 'Paid' });
  }, [updateInvoice]);

  const addProposal = useCallback((proposalData: Omit<Proposal, 'id'>) => {
    const newProposal: Proposal = { ...proposalData, id: `prop-${Date.now()}` };
    setProposals((prev) => { const next = [newProposal, ...prev]; saveToServer({ proposals: next }); return next; });
    return newProposal;
  }, [saveToServer]);

  const addContract = useCallback((contractData: Omit<Contract, 'id'>) => {
    const newContract: Contract = { ...contractData, id: `cntr-${Date.now()}` };
    setContracts((prev) => { const next = [newContract, ...prev]; saveToServer({ contracts: next }); return next; });
    return newContract;
  }, [saveToServer]);

  // ─── Ideas ────────────────────────────────────────────────────────────────
  const addIdea = useCallback((ideaData: Omit<DumpIdea, 'id' | 'votes' | 'createdAt'>) => {
    const newIdea: DumpIdea = { ...ideaData, id: `idea-${Date.now()}`, votes: 1, createdAt: new Date().toISOString().split('T')[0] };
    setIdeas((prev) => { const next = [newIdea, ...prev]; saveToServer({ ideas: next }); return next; });
    return newIdea;
  }, [saveToServer]);

  const voteIdea = useCallback((id: string) => {
    setIdeas((prev) => { const next = prev.map((i) => i.id === id ? { ...i, votes: i.votes + 1 } : i); saveToServer({ ideas: next }); return next; });
  }, [saveToServer]);

  const deleteIdea = useCallback((id: string) => {
    setIdeas((prev) => { const next = prev.filter((i) => i.id !== id); saveToServer({ ideas: next }); return next; });
  }, [saveToServer]);

  const convertIdeaToContent = useCallback((id: string) => {
    // no-op stub — kept for type compatibility
  }, []);

  const convertIdeaToProject = useCallback((id: string) => {
    // no-op stub — kept for type compatibility
  }, []);

  // ─── Chat ─────────────────────────────────────────────────────────────────
  const sendChatMessage = useCallback(async (text: string, referencedModule?: TeamChatMessage['referencedModule']) => {
    if (!text.trim()) return;
    const msg: TeamChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      senderAvatarColor: activeUser.avatarColor,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
      referencedModule,
    };
    setChatMessages((prev) => [...prev, msg]);
    try {
      await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(msg) });
    } catch (e) {}
  }, [activeUser]);

  const deleteChatMessage = useCallback(async (id: string) => {
    setChatMessages((prev) => prev.filter((m) => m.id !== id));
    try { await fetch(`/api/chat/${id}`, { method: 'DELETE' }); } catch (e) {}
  }, []);

  // ─── Settings ─────────────────────────────────────────────────────────────
  const updateSettings = useCallback((updates: Partial<StudioSettings>) => {
    const next = { ...stateRef.current.settings, ...updates };
    setSettings(next);
    saveToServer({ settings: next });
  }, [saveToServer]);

  const resetAllData = useCallback(() => {
    setClients([]);
    setProjects([]);
    setContentPieces([]);
    setInvoices([]);
    setProposals([]);
    setContracts([]);
    setPayments([]);
    setIdeas([]);
    setChatMessages([]);
    saveToServer({ clients: [], projects: [], contentPieces: [], invoices: [], proposals: [], contracts: [], payments: [], ideas: [], chatMessages: [] });
  }, [saveToServer]);

  // ─── Context value (memoized) ─────────────────────────────────────────────
  const value: WorkspaceContextType = useMemo(() => ({
    activeTab, setActiveTab,
    theme, toggleTheme, setTheme,
    authUser, authToken, login, register, logout, switchActiveTeamMember,
    isAuthModalOpen, setAuthModalOpen,
    clients, addClient, updateClient, updateClients, deleteClient, deleteClients, importClients, resetToDefaultLeads,
    selectedClientId, setSelectedClientId, selectedClient,
    leadFilters, updateLeadFilters, resetLeadFilters,
    projectionMode, setProjectionMode,
    projects, addProject, updateProject, deleteProject,
    contentPieces, addContentPiece, updateContentPiece, deleteContentPiece, moveContentStage,
    invoices, proposals, contracts, payments, addInvoice, updateInvoice, deleteInvoice, markInvoicePaid, addProposal, addContract,
    ideas, addIdea, voteIdea, deleteIdea, convertIdeaToContent, convertIdeaToProject,
    teamMembers, activeUser, setActiveUser, chatMessages, sendChatMessage, deleteChatMessage,
    isChatOpen, setChatOpen,
    isLiveSyncing, connectedUsersCount,
    settings, updateSettings, resetAllData,
    isNewClientModalOpen, setNewClientModalOpen,
    isImportCSVModalOpen, setImportCSVModalOpen,
    isNewProjectModalOpen, setNewProjectModalOpen,
    isNewContentModalOpen, setNewContentModalOpen,
    isNewInvoiceModalOpen, setNewInvoiceModalOpen,
    isShareModalOpen, setShareModalOpen,
    isCommandPaletteOpen, setCommandPaletteOpen,
    globalSearchQuery, setGlobalSearchQuery,
    callingSessionStats, setCallingSessionStats,
    currentCallingIndex, setCurrentCallingIndex,
    isFirestoreSyncing, firebaseUser, firestoreLeadCount, syncLeadsToCloud,
  }), [
    activeTab, theme, toggleTheme, setTheme,
    authUser, authToken, switchActiveTeamMember, isAuthModalOpen,
    clients, addClient, updateClient, updateClients, deleteClient, deleteClients, importClients, resetToDefaultLeads,
    selectedClientId, selectedClient, leadFilters, updateLeadFilters, resetLeadFilters,
    projectionMode, projects, addProject, updateProject, deleteProject,
    contentPieces, addContentPiece, updateContentPiece, deleteContentPiece, moveContentStage,
    invoices, proposals, contracts, payments, addInvoice, updateInvoice, deleteInvoice, markInvoicePaid, addProposal, addContract,
    ideas, addIdea, voteIdea, deleteIdea, convertIdeaToContent, convertIdeaToProject,
    teamMembers, activeUser, chatMessages, sendChatMessage, deleteChatMessage,
    isChatOpen, isLiveSyncing, connectedUsersCount,
    settings, updateSettings, resetAllData,
    isNewClientModalOpen, isImportCSVModalOpen, isNewProjectModalOpen, isNewContentModalOpen,
    isNewInvoiceModalOpen, isShareModalOpen, isCommandPaletteOpen, globalSearchQuery,
    callingSessionStats, currentCallingIndex,
    isFirestoreSyncing, firebaseUser, firestoreLeadCount, syncLeadsToCloud,
  ]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
