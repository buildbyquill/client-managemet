import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  generateLeadResearch,
  generateCallPrep,
  parseCallNote,
  checkDuplicate,
} from './src/services/aiEngine';

const app = express();
const PORT = 3000;
const SESSION_SECRET = 'quill-labs-production-secret-2026';

app.use(express.json({ limit: '20mb' }));

// Ensure data persistence directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const WORKSPACE_FILE = path.join(DATA_DIR, 'workspace.json');

// Helper to hash passwords
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  name: string;
  role: string;
  avatarColor: string;
  initials: string;
  createdAt: string;
}

// Starter seed accounts for the 3 team members
function getStarterUsers(): StoredUser[] {
  const salt1 = 'a2633b310edf18aef044e98bf75c8358';
  const salt2 = '29c61826d03a31938a9ba5426086b508';
  const salt3 = '850629cbfd7d7db9d7def31e94c4b048';

  return [
    {
      id: 'usr-ayush',
      username: 'ayush',
      passwordHash: hashPassword('ayush#founder99', salt1),
      salt: salt1,
      name: 'Ayush',
      role: 'Founder',
      avatarColor: 'bg-indigo-600',
      initials: 'AY',
      createdAt: '2026-09-02T16:55:00.000Z',
    },
    {
      id: 'usr-jai',
      username: 'jai',
      passwordHash: hashPassword('jai#builder88', salt2),
      salt: salt2,
      name: 'Jai',
      role: 'Developer',
      avatarColor: 'bg-emerald-600',
      initials: 'JA',
      createdAt: '2026-09-02T16:55:00.000Z',
    },
    {
      id: 'usr-harvansh',
      username: 'harvansh',
      passwordHash: hashPassword('harvansh#sales77', salt3),
      salt: salt3,
      name: 'Harvansh',
      role: 'Outreach & Sales',
      avatarColor: 'bg-amber-600',
      initials: 'HA',
      createdAt: '2026-09-02T16:55:00.000Z',
    },
  ];
}

// Read and write users
function getUsers(): StoredUser[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      const starters = getStarterUsers();
      fs.writeFileSync(USERS_FILE, JSON.stringify(starters, null, 2), 'utf-8');
      return starters;
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const existing: StoredUser[] = JSON.parse(raw) || [];

    // Filter out old deprecated users (quill, alex, xyz) if present
    const starters = getStarterUsers();
    const starterUsernames = new Set(starters.map((s) => s.username.toLowerCase()));
    
    // Check if obsolete users exist
    const hasObsolete = existing.some((u) => ['quill', 'alex', 'xyz'].includes(u.username.toLowerCase()));
    let filtered = hasObsolete
      ? existing.filter((u) => !['quill', 'alex', 'xyz'].includes(u.username.toLowerCase()))
      : existing;

    // Ensure all 3 active users exist
    let modified = hasObsolete;
    for (const st of starters) {
      if (!filtered.some((u) => u.username.toLowerCase() === st.username.toLowerCase())) {
        filtered.push(st);
        modified = true;
      }
    }
    if (modified) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    }
    return filtered;
  } catch (err) {
    console.error('Error reading users file:', err);
    return getStarterUsers();
  }
}

function saveUsers(users: StoredUser[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users file:', err);
  }
}

// Workspace state
interface WorkspaceData {
  clients: any[];
  projects: any[];
  contentPieces: any[];
  invoices: any[];
  proposals: any[];
  contracts: any[];
  payments: any[];
  ideas: any[];
  chatMessages: any[];
  settings: any;
}

function getStarterWorkspaceData(): WorkspaceData {
  return {
    clients: [],
    projects: [],
    contentPieces: [
      {
        id: 'content-1',
        title: 'Why Most Founders Waste $10k on Slop Devs (And How to Build Lean)',
        platform: 'LinkedIn',
        format: 'Carousel Post',
        stage: 'Scheduled',
        angleHook: 'Contrarian breakdown of custom lean dev vs agency bloat.',
        copyText: 'Most agencies sell head-count instead of velocity. Here is how Quill ships full production systems in 14 days...',
        adSpend: 0,
        roas: 0,
      },
      {
        id: 'content-2',
        title: 'Automating 80% of Agency Delivery with Node & Vite',
        platform: 'YouTube',
        format: 'Video Breakdown',
        stage: 'Writing',
        angleHook: 'Technical deep-dive into real-time collaborative agency workflows.',
        copyText: 'Step-by-step walkthrough of SSE event broadcast and optimistic UI state management.',
        adSpend: 0,
        roas: 0,
      },
      {
        id: 'content-3',
        title: 'The 14-Day Sprint Retainer Blueprint for Modern Studios',
        platform: 'X / Twitter',
        format: 'Thread',
        stage: 'Drafted',
        angleHook: 'How to transition from hourly billing to high-velocity monthly retainers.',
        copyText: 'Hourly billing misaligns incentives. Here is our 4-step framework for pricing agency systems.',
        adSpend: 0,
        roas: 0,
      },
    ],
    invoices: [
      {
        id: 'inv-1',
        invoiceNumber: 'BWQ-2026-001',
        clientId: 'client-1',
        clientName: 'Nexus Media & AI',
        amount: 4250,
        status: 'Paid',
        issueDate: '2026-09-01',
        dueDate: '2026-09-15',
        description: 'Milestone 1: Architecture & Interactive Prototype',
        method: 'Stripe',
      },
      {
        id: 'inv-2',
        invoiceNumber: 'BWQ-2026-002',
        clientId: 'client-1',
        clientName: 'Nexus Media & AI',
        amount: 4250,
        status: 'Sent',
        issueDate: '2026-09-15',
        dueDate: '2026-09-30',
        description: 'Milestone 2: Final Deployment & Handover',
        method: 'Stripe',
      },
      {
        id: 'inv-3',
        invoiceNumber: 'BWQ-2026-003',
        clientId: 'client-4',
        clientName: 'Vanguard Automations',
        amount: 4750,
        status: 'Paid',
        issueDate: '2026-08-29',
        dueDate: '2026-09-12',
        description: 'Sprint Deposit: Webhook Engine Infrastructure',
        method: 'Bank Transfer',
      },
      {
        id: 'inv-4',
        invoiceNumber: 'BWQ-2026-004',
        clientId: 'client-4',
        clientName: 'Vanguard Automations',
        amount: 4750,
        status: 'Sent',
        issueDate: '2026-09-10',
        dueDate: '2026-09-24',
        description: 'Sprint Final Handover: Webhook Engine Delivery',
        method: 'Stripe',
      },
    ],
    proposals: [],
    contracts: [],
    payments: [],
    ideas: [
      {
        id: 'idea-1',
        title: 'Real-time SSE notification sound on client stage change',
        category: 'Studio Growth',
        tags: ['UX', 'Team'],
        votes: 3,
        author: 'Ayush',
        createdAt: '2026-09-02',
        description: 'Add optional subtle sound chime when team moves deals or sends chat.',
      },
      {
        id: 'idea-2',
        title: 'Direct Stripe webhook sync for invoice status auto-updates',
        category: 'Integrations',
        tags: ['Billing', 'Automations'],
        votes: 5,
        author: 'Jai',
        createdAt: '2026-09-02',
        description: 'Listen to invoice.paid events directly to mark client invoices as paid automatically.',
      },
    ],
    chatMessages: [
      {
        id: 'msg-welcome-ayush',
        senderId: 'usr-ayush',
        senderName: 'Ayush',
        senderRole: 'Founder',
        senderAvatarColor: 'bg-indigo-600',
        authorId: 'usr-ayush',
        authorName: 'Ayush',
        text: "Workspace ready for the team. Let's build!",
        timestamp: '09:00 AM',
        reactions: {},
      },
      {
        id: 'msg-welcome-jai',
        senderId: 'usr-jai',
        senderName: 'Jai',
        senderRole: 'Developer',
        senderAvatarColor: 'bg-emerald-600',
        authorId: 'usr-jai',
        authorName: 'Jai',
        text: 'Systems architecture and sprint pipelines deployed. Real-time sync is working smoothly.',
        timestamp: '09:05 AM',
        reactions: {},
      },
      {
        id: 'msg-welcome-harvansh',
        senderId: 'usr-harvansh',
        senderName: 'Harvansh',
        senderRole: 'Outreach & Sales',
        senderAvatarColor: 'bg-amber-600',
        authorId: 'usr-harvansh',
        authorName: 'Harvansh',
        text: 'Outreach pipeline is primed. Connecting with high-ticket prospects today!',
        timestamp: '09:12 AM',
        reactions: {},
      },
    ],
    settings: {
      studioName: 'BuildWithQuill',
      tagline: 'Business Systems Studio',
      currency: 'USD ($)',
      dateFormat: 'YYYY-MM-DD',
      companyEmail: 'buildbyquill@gmail.com',
      notificationsEnabled: true,
    },
  };
}

function getWorkspaceData(): WorkspaceData {
  const starters = getStarterWorkspaceData();

  try {
    if (!fs.existsSync(WORKSPACE_FILE)) {
      fs.writeFileSync(WORKSPACE_FILE, JSON.stringify(starters, null, 2), 'utf-8');
      return starters;
    }
    const raw = fs.readFileSync(WORKSPACE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...starters, ...parsed };
  } catch (err) {
    console.error('Error reading workspace file:', err);
    return starters;
  }
}

function saveWorkspaceData(data: Partial<WorkspaceData>) {
  try {
    const current = getWorkspaceData();
    const updated = { ...current, ...data };
    fs.writeFileSync(WORKSPACE_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('Error saving workspace data:', err);
    return getWorkspaceData();
  }
}

// Token management (HMAC signed so tokens survive server reboots)
const SESSIONS = new Map<string, string>();

function generateSessionToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  const token = `${payload}.${signature}`;
  SESSIONS.set(token, userId);
  return token;
}

function verifySessionToken(token: string): string | null {
  if (SESSIONS.has(token)) {
    return SESSIONS.get(token)!;
  }
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
    if (sig !== expectedSig) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (!data?.userId) return null;
    SESSIONS.set(token, data.userId);
    return data.userId;
  } catch {
    return null;
  }
}

function getAuthUserFromReq(req: express.Request): StoredUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const userId = verifySessionToken(token);
  if (!userId) return null;

  const users = getUsers();
  return users.find((u) => u.id === userId) || null;
}

// --- REAL-TIME SSE (Server-Sent Events) ---
const sseClients = new Set<express.Response>();

function broadcastSSE(payload: any) {
  const message = `data: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Keep-alive heartbeat every 15 seconds to prevent Cloud Run / proxy idle timeouts
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': heartbeat\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 15000);

// --- API ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    onlineUsers: sseClients.size,
    registeredCount: getUsers().length,
  });
});

// SSE Live Stream endpoint
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send initial comment to ensure socket is open immediately
  res.write(': handshake\n\n');

  sseClients.add(res);

  // Send initial handshake payload
  res.write(
    `data: ${JSON.stringify({
      type: 'connected',
      activeClients: sseClients.size,
      timestamp: Date.now(),
    })}\n\n`
  );

  // Broadcast presence update
  broadcastSSE({
    type: 'presence',
    activeClients: sseClients.size,
  });

  req.on('close', () => {
    sseClients.delete(res);
    broadcastSSE({
      type: 'presence',
      activeClients: sseClients.size,
    });
  });
});

// Grounded Intelligence API (Google Maps & Google Search Grounding)
app.post('/api/intelligence/grounded-research', async (req, res) => {
  const { businessName, city, query, mode } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
      fallbackText: `Live research for "${businessName || query}" in ${city || 'Mohali'}: Business identified. Local Maps listing verified. Recommend offering website redesign and 24/7 online booking calendar integration.`,
    });
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const promptText = mode === 'maps'
      ? `Search Google Maps for "${businessName || query}" in ${city || 'Mohali'}. Find address, phone number, rating, review count, missing website link, and business hours. Highlight sales opportunities for web development or booking calendar.`
      : `Search Google for "${businessName || query}" in ${city || 'Mohali'}. Check website status, social media presence, and competitive positioning.`;

    const toolsConfig = mode === 'maps' ? [{ googleMaps: {} }] : [{ googleSearch: {} }];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        tools: toolsConfig as any,
      },
    });

    res.json({
      text: response.text,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    });
  } catch (error: any) {
    console.error('Grounding API Error:', error);
    res.status(500).json({
      error: error.message || 'Grounding request failed',
      fallbackText: `Research analysis for "${businessName || query}": Business has active Google Maps listing. High priority target for website creation and automated customer booking.`,
    });
  }
});

// Register
app.post('/api/auth/register', (req, res) => {
  const { username, password, name, role } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Username, password, and name are required.' });
  }

  const cleanUsername = String(username).trim().toLowerCase();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters.' });
  }

  if (String(password).length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  const users = getUsers();
  const existing = users.find((u) => u.username.toLowerCase() === cleanUsername);
  if (existing) {
    return res.status(409).json({ error: 'A team member with this username already exists.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const colors = [
    'bg-indigo-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-blue-600',
    'bg-purple-600',
    'bg-rose-600',
    'bg-teal-600',
  ];
  const chosenColor = colors[users.length % colors.length];

  const nameParts = String(name).trim().split(' ');
  const initials = nameParts.length > 1
    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();

  const newUser: StoredUser = {
    id: `usr-${crypto.randomUUID().slice(0, 8)}`,
    username: cleanUsername,
    passwordHash,
    salt,
    name: String(name).trim(),
    role: role?.trim() || 'Team Member',
    avatarColor: chosenColor,
    initials,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  const token = generateSessionToken(newUser.id);

  const publicUser = {
    id: newUser.id,
    username: newUser.username,
    name: newUser.name,
    role: newUser.role,
    avatarColor: newUser.avatarColor,
    initials: newUser.initials,
  };

  // Broadcast user update to all active browsers
  broadcastSSE({
    type: 'users:updated',
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      avatarColor: u.avatarColor,
      initials: u.initials,
      email: `${u.username}@buildwithquill.com`,
    })),
    newUser: publicUser,
  });

  res.status(201).json({ token, user: publicUser });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const cleanUsername = String(username).trim().toLowerCase();
  const users = getUsers();
  const user = users.find((u) => u.username.toLowerCase() === cleanUsername);

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const checkHash = hashPassword(password, user.salt);
  if (checkHash !== user.passwordHash) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = generateSessionToken(user.id);

  const publicUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    avatarColor: user.avatarColor,
    initials: user.initials,
  };

  res.json({ token, user: publicUser });
});

// Get current user profile
app.get('/api/auth/me', (req, res) => {
  const user = getAuthUserFromReq(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      avatarColor: user.avatarColor,
      initials: user.initials,
    },
  });
});

// Get all team members
app.get('/api/auth/users', (req, res) => {
  const users = getUsers();
  const publicUsers = users.map((u) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    avatarColor: u.avatarColor,
    initials: u.initials,
    email: `${u.username}@buildwithquill.com`,
  }));
  res.json({ users: publicUsers });
});

// Get workspace data
app.get('/api/data', (req, res) => {
  const data = getWorkspaceData();
  res.json(data);
});

// Save workspace data & broadcast live to all other tabs/users
app.post('/api/data', (req, res) => {
  const updates = req.body;
  const sourceClientId = req.headers['x-client-id'] as string | undefined;
  const updated = saveWorkspaceData(updates);

  // Broadcast to all other connected teammates in real time!
  broadcastSSE({
    type: 'workspace:updated',
    data: updated,
    sourceClientId,
    timestamp: Date.now(),
  });

  res.json(updated);
});

// Get chat messages
app.get('/api/chat', (req, res) => {
  const current = getWorkspaceData();
  res.json({ messages: current.chatMessages || [] });
});

// Add chat message
app.post('/api/chat', (req, res) => {
  const { id, text, authorId, authorName, avatarColor, role, senderRole, referencedModule } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  const current = getWorkspaceData();
  const msgId = id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const newMsg = {
    id: msgId,
    senderId: authorId,
    senderName: authorName,
    senderRole: role || senderRole || 'Team Member',
    senderAvatarColor: avatarColor || 'bg-indigo-600',
    authorId,
    authorName,
    text: text.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    referencedModule,
    reactions: {},
  };

  const existingIdx = (current.chatMessages || []).findIndex((m: any) => m.id === msgId);
  if (existingIdx >= 0) {
    current.chatMessages[existingIdx] = newMsg;
  } else {
    current.chatMessages = [...(current.chatMessages || []), newMsg];
  }
  saveWorkspaceData({ chatMessages: current.chatMessages });

  // Broadcast new chat message to all connected teammates instantly!
  broadcastSSE({
    type: 'chat:new',
    message: newMsg,
    chatMessages: current.chatMessages,
    timestamp: Date.now(),
  });

  res.status(201).json({ message: newMsg, chatMessages: current.chatMessages });
});

// Delete chat message
app.delete('/api/chat/:id', (req, res) => {
  const { id } = req.params;
  const current = getWorkspaceData();
  current.chatMessages = (current.chatMessages || []).filter((m: any) => m.id !== id);
  saveWorkspaceData({ chatMessages: current.chatMessages });

  broadcastSSE({
    type: 'chat:deleted',
    messageId: id,
    chatMessages: current.chatMessages,
  });

  res.json({ success: true });
});

// ─── AI Intelligence Layer Endpoints ─────────────────────────────────────────

// AI Lead Research
app.post('/api/ai/research', async (req, res) => {
  try {
    const { lead, apiKey } = req.body;
    if (!lead || !lead.title) {
      return res.status(400).json({ error: 'Lead data with title required' });
    }
    const current = getWorkspaceData();
    const effectiveKey = apiKey || current.settings?.geminiApiKey || process.env.GEMINI_API_KEY;
    const result = await generateLeadResearch(lead, effectiveKey);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/ai/research:', err);
    res.status(500).json({ error: err.message || 'Research failed' });
  }
});

// AI Call Preparation & Opening Angle
app.post('/api/ai/call-prep', async (req, res) => {
  try {
    const { lead, apiKey } = req.body;
    if (!lead || !lead.title) {
      return res.status(400).json({ error: 'Lead data with title required' });
    }
    const current = getWorkspaceData();
    const effectiveKey = apiKey || current.settings?.geminiApiKey || process.env.GEMINI_API_KEY;
    const result = await generateCallPrep(lead, effectiveKey);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/ai/call-prep:', err);
    res.status(500).json({ error: err.message || 'Call prep failed' });
  }
});

// After-Call Smart Note Parser
app.post('/api/ai/parse-note', async (req, res) => {
  try {
    const { noteText, apiKey } = req.body;
    if (!noteText) {
      return res.status(400).json({ error: 'noteText required' });
    }
    const current = getWorkspaceData();
    const effectiveKey = apiKey || current.settings?.geminiApiKey || process.env.GEMINI_API_KEY;
    const result = await parseCallNote(noteText, effectiveKey);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/ai/parse-note:', err);
    res.status(500).json({ error: err.message || 'Note parsing failed' });
  }
});

// Duplicate Detection
app.post('/api/ai/check-duplicates', (req, res) => {
  try {
    const { candidate, candidates } = req.body;
    const current = getWorkspaceData();
    const existing = current.clients || [];

    if (candidate) {
      const match = checkDuplicate(candidate, existing);
      return res.json(match);
    }

    if (Array.isArray(candidates)) {
      const results = candidates.map((cand: any) => ({
        candidateId: cand.id || cand.title,
        ...checkDuplicate(cand, existing),
      }));
      return res.json({ results });
    }

    res.status(400).json({ error: 'candidate or candidates array required' });
  } catch (err: any) {
    console.error('Error in /api/ai/check-duplicates:', err);
    res.status(500).json({ error: err.message || 'Duplicate check failed' });
  }
});

// Start Express Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/data/**', '**/*.json'],
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, 'localhost', () => {
    console.log(`BuildWithQuill OS server running at http://localhost:${PORT}`);
  });
}

startServer();
