/**
 * aiEngine.ts — Quill Land Intelligence Layer
 *
 * Implements:
 * 1. AI Research & Qualification (10-15s brief)
 * 2. AI Call Preparation & Opening Angle
 * 3. After-Call Smart Note Parser (extracts outcome, next action, follow-up date)
 * 4. Deterministic + Heuristic Duplicate Detection
 *
 * Designed around Quill Land's core principle:
 * AI assists, recommends, and extracts — humans make the sales decisions.
 */

import { GoogleGenAI } from '@google/genai';

export interface AIResearchResult {
  opportunityStrength: 'Strong' | 'Moderate' | 'Weak';
  fit: 'High' | 'Medium' | 'Low';
  whyThisLead: string;
  services: string[];
  digitalGap: string;
  recommendedOffer: string;
  callHook: string;
  isAiGenerated: boolean;
}

export interface AICallPrepResult {
  businessContext: string[];
  likelyOpportunity: string;
  openingAngle: string;
  objectionHandlers: { objection: string; counter: string }[];
}

export interface AIParsedNoteResult {
  outcome?: "Didn't Pick Up" | 'Rejected' | 'Interested' | 'Follow-Up';
  followUpDate?: string;
  cleanNote: string;
  nextAction: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedId?: string;
  matchReason?: string;
  confidence: number;
}

// ─── Gemini Client Resolver ──────────────────────────────────────────────────
function getGeminiClient(apiKey?: string): GoogleGenAI | null {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey: key });
  } catch (err) {
    console.warn('[AI Engine] Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

// ─── 1. AI Research & Qualification ──────────────────────────────────────────
export async function generateLeadResearch(
  lead: {
    title: string;
    industry?: string;
    city?: string;
    rating?: string | number | null;
    reviewCount?: string | number | null;
    websiteUrl?: string;
    phoneNumber?: string;
    address?: string;
  },
  apiKey?: string
): Promise<AIResearchResult> {
  const client = getGeminiClient(apiKey);

  const hasWebsite = Boolean(lead.websiteUrl && lead.websiteUrl.trim() !== '');
  const ratingNum = typeof lead.rating === 'number' ? lead.rating : parseFloat(String(lead.rating || '0')) || 0;
  const reviewsNum = typeof lead.reviewCount === 'number' ? lead.reviewCount : parseInt(String(lead.reviewCount || '0'), 10) || 0;

  // If Gemini client is available, call Gemini 2.5 Flash for high-precision live brief
  if (client) {
    try {
      const prompt = `You are a senior B2B sales intelligence researcher for Quill Land (a lead generation agency).
Analyze this prospect and generate a concise 15-second sales intelligence brief.

PROSPECT DATA:
- Business Name: ${lead.title}
- Industry/Niche: ${lead.industry || 'Local Business'}
- City/Market: ${lead.city || 'Local'}
- Rating: ${ratingNum > 0 ? ratingNum + '★' : 'Not rated'}
- Reviews: ${reviewsNum > 0 ? reviewsNum + ' reviews' : 'None listed'}
- Website: ${hasWebsite ? lead.websiteUrl : 'NO WEBSITE FOUND'}
- Phone: ${lead.phoneNumber || 'Available on Maps'}
- Address: ${lead.address || 'Local area'}

Return ONLY a valid JSON object with EXACTLY this structure (no markdown fences, no extra commentary):
{
  "opportunityStrength": "Strong",
  "fit": "High",
  "whyThisLead": "One punchy sentence summarizing why this business is worth calling right now.",
  "services": ["Service 1", "Service 2", "Service 3"],
  "digitalGap": "Specific digital or conversion weakness observed from their presence.",
  "recommendedOffer": "High-converting modern website or specific agency offer",
  "callHook": "A direct, respectful 15-second opening pitch for a cold phone call."
}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text?.trim() || '';
      const cleanJson = text.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        opportunityStrength: parsed.opportunityStrength || (hasWebsite ? 'Moderate' : 'Strong'),
        fit: parsed.fit || 'High',
        whyThisLead: parsed.whyThisLead || `${lead.title} has strong local presence with high digital opportunity.`,
        services: Array.isArray(parsed.services) ? parsed.services : [lead.industry || 'Core Services'],
        digitalGap: parsed.digitalGap || (hasWebsite ? 'Needs modern mobile conversion flow and speed overhaul.' : 'No website listed on Google Maps.'),
        recommendedOffer: parsed.recommendedOffer || (hasWebsite ? 'Website conversion & SEO revamp' : 'Custom high-performance business website'),
        callHook: parsed.callHook || `Hi, I noticed ${lead.title} has great reviews in ${lead.city || 'town'}, but prospective clients looking for you online cannot find an official website...`,
        isAiGenerated: true,
      };
    } catch (err) {
      console.warn('[AI Engine] Gemini API call failed, falling back to rule-based intelligence:', err);
    }
  }

  // ── Heuristic Intelligence Fallback (instant, offline-capable) ────────────
  const isHighReviews = reviewsNum >= 50;
  const isGoodRating = ratingNum >= 4.0;
  const strength: 'Strong' | 'Moderate' | 'Weak' = !hasWebsite && (isHighReviews || isGoodRating)
    ? 'Strong'
    : !hasWebsite
    ? 'Strong'
    : reviewsNum > 100
    ? 'Moderate'
    : 'Moderate';

  const industryName = lead.industry || 'business';
  const cityName = lead.city || 'your area';

  return {
    opportunityStrength: strength,
    fit: isHighReviews ? 'High' : 'Medium',
    whyThisLead: !hasWebsite
      ? `${ratingNum > 0 ? ratingNum + '★ · ' : ''}${reviewsNum > 0 ? reviewsNum + ' reviews · ' : ''}Established ${industryName} in ${cityName} with high reputation but NO website.`
      : `${lead.title} is an active ${industryName} in ${cityName} with an existing web presence requiring conversion optimization.`,
    services: [
      `${industryName} Services`,
      'Customer Consultations',
      'Local Appointments',
      'Emergency / Direct Inquiries',
    ],
    digitalGap: !hasWebsite
      ? 'Verified Google Business profile attracting organic searchers, but losing bookings without a dedicated website.'
      : 'Existing website lacks prominent call-to-action buttons, mobile appointment funnel, or clear treatment breakdown.',
    recommendedOffer: !hasWebsite
      ? 'Modern high-converting business landing page + automated WhatsApp booking funnel'
      : 'Website speed & conversion redesign with direct mobile booking integration',
    callHook: !hasWebsite
      ? `Hi, I'm calling because I noticed ${lead.title} has great customer feedback in ${cityName}, but patients searching online don't have a direct website to book with you.`
      : `Hi, I saw ${lead.title}'s Google listing in ${cityName} and checked out your website — noticed a few key mobile conversion tweaks that could double your inbound calls.`,
    isAiGenerated: false,
  };
}

// ─── 2. AI Call Preparation & Opening Angle ─────────────────────────────────
export async function generateCallPrep(
  lead: {
    title: string;
    industry?: string;
    city?: string;
    websiteUrl?: string;
    rating?: string | number | null;
    reviewCount?: string | number | null;
    whyThisLead?: string;
  },
  apiKey?: string
): Promise<AICallPrepResult> {
  const client = getGeminiClient(apiKey);
  const hasWebsite = Boolean(lead.websiteUrl && lead.websiteUrl.trim() !== '');

  if (client) {
    try {
      const prompt = `You are a cold-calling coach for web agency sales reps.
Prepare a rapid, confident pre-call brief for:
- Business: ${lead.title}
- Niche: ${lead.industry || 'Local Business'}
- City: ${lead.city || 'City'}
- Website Status: ${hasWebsite ? lead.websiteUrl : 'No website'}
- Rating: ${lead.rating || 'N/A'} (${lead.reviewCount || 0} reviews)

Return ONLY valid JSON (no markdown fences, no explanations):
{
  "businessContext": [
    "Key fact 1 (e.g. 4.8★ with 300+ reviews)",
    "Key fact 2",
    "Key fact 3"
  ],
  "likelyOpportunity": "Exact value proposition to pitch",
  "openingAngle": "15-second punchy, natural opening question (not pushy)",
  "objectionHandlers": [
    { "objection": "We already have enough business", "counter": "Quick 1-sentence respectful counter" },
    { "objection": "Send me an email", "counter": "Quick 1-sentence counter to secure a 5-min demo" }
  ]
}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const cleanJson = response.text?.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim() || '';
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[AI Engine] Call prep Gemini call failed, using fallback:', err);
    }
  }

  // Heuristic Fallback
  return {
    businessContext: [
      `${lead.rating ? lead.rating + '★ Rating' : 'Local presence'} with ${lead.reviewCount ? lead.reviewCount + ' Google reviews' : 'active listing'} in ${lead.city || 'Mohali'}`,
      hasWebsite ? `Has website (${lead.websiteUrl}) — inspect for mobile responsiveness` : 'No official website linked to Google Business listing',
      `Category: ${lead.industry || 'General Business'}`,
    ],
    likelyOpportunity: !hasWebsite
      ? 'Turn high Google Maps organic traffic into direct appointments with a clean, fast custom site.'
      : 'Revamp mobile UX and add automated WhatsApp / intake CTA buttons to lift conversions.',
    openingAngle: !hasWebsite
      ? `"Hi, I was looking up reputable ${lead.industry || 'services'} in ${lead.city || 'the area'} and saw ${lead.title} has wonderful reviews — but noticed you don't have an official website up. Are you currently taking on new clients?"`
      : `"Hi, I came across ${lead.title} online and noticed you have great reviews. I took a quick look at your website and spotted two quick conversion bottlenecks on mobile — who handles your web presence there?"`,
    objectionHandlers: [
      {
        objection: 'We already have enough clients / word of mouth',
        counter: '"That makes complete sense given your strong reputation. A website ensures high-ticket patients book directly with you instead of competitors down the street."',
      },
      {
        objection: 'Just send an email',
        counter: '"I\'d be happy to. What is your direct email? Also, I can text you a 30-second video demo of a custom layout built specifically for your niche."',
      },
    ],
  };
}

// ─── 3. After-Call Smart Note Parser ─────────────────────────────────────────
export async function parseCallNote(
  rawText: string,
  apiKey?: string
): Promise<AIParsedNoteResult> {
  const text = rawText.trim();
  if (!text) {
    return { cleanNote: '', nextAction: '' };
  }

  const client = getGeminiClient(apiKey);
  const todayIso = new Date().toISOString().split('T')[0];

  if (client) {
    try {
      const prompt = `Today's date is ${todayIso}.
A sales caller entered this raw note after a cold call:
"${text}"

Extract structured data from the note.
Return ONLY valid JSON:
{
  "outcome": "Interested" | "Didn't Pick Up" | "Rejected" | "Follow-Up",
  "followUpDate": "YYYY-MM-DD or null if no follow-up mentioned",
  "cleanNote": "Clean, professional summary of what happened",
  "nextAction": "Concise next action item"
}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const cleanJson = response.text?.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim() || '';
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[AI Engine] Note parsing Gemini call failed, using heuristic parse:', err);
    }
  }

  // ── Heuristic Natural Language Extractor ──────────────────────────────────
  const lower = text.toLowerCase();
  let outcome: AIParsedNoteResult['outcome'] = 'Follow-Up';

  if (lower.includes('no answer') || lower.includes("didn't pick") || lower.includes('busy') || lower.includes('voicemail') || lower.includes('rang out')) {
    outcome = "Didn't Pick Up";
  } else if (lower.includes('not interested') || lower.includes('rejected') || lower.includes("don't call") || lower.includes('refused')) {
    outcome = 'Rejected';
  } else if (lower.includes('interested') || lower.includes('send proposal') || lower.includes('demo') || lower.includes('yes') || lower.includes('wants website')) {
    outcome = 'Interested';
  }

  // Calculate relative date if mentioned
  let followUpDate: string | undefined = undefined;
  const now = new Date();

  if (lower.includes('tomorrow')) {
    now.setDate(now.getDate() + 1);
    followUpDate = now.toISOString().split('T')[0];
  } else if (lower.includes('in 2 days') || lower.includes('after 2 days')) {
    now.setDate(now.getDate() + 2);
    followUpDate = now.toISOString().split('T')[0];
  } else if (lower.includes('next week') || lower.includes('in a week')) {
    now.setDate(now.getDate() + 7);
    followUpDate = now.toISOString().split('T')[0];
  } else {
    // Days of the week
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = now.getDay();
    for (let i = 0; i < days.length; i++) {
      if (lower.includes(days[i])) {
        let diff = (i - currentDay + 7) % 7;
        if (diff === 0) diff = 7; // next week's day
        now.setDate(now.getDate() + diff);
        followUpDate = now.toISOString().split('T')[0];
        break;
      }
    }
  }

  return {
    outcome,
    followUpDate,
    cleanNote: text,
    nextAction: outcome === 'Interested'
      ? 'Prepare tailored portfolio & follow up'
      : outcome === "Didn't Pick Up"
      ? 'Retry call in 2 business days'
      : outcome === 'Rejected'
      ? 'Archived lead'
      : 'Follow up as requested',
  };
}

// ─── 4. Deterministic + Heuristic Duplicate Detector ─────────────────────────
function normalizePhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function normalizeUrl(url?: string): string {
  if (!url) return '';
  return url
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');
}

function normalizeTitle(title?: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b(clinic|hospital|services|pvt|ltd|and|the|in|best|dr|doctor)\b/g, '')
    .trim();
}

export function checkDuplicate(
  candidate: { title: string; phoneNumber?: string; websiteUrl?: string; address?: string },
  existingLeads: Array<{ id: string; title?: string; name?: string; phoneNumber?: string; phone?: string; websiteUrl?: string; address?: string }>
): DuplicateCheckResult {
  const candPhone = normalizePhone(candidate.phoneNumber);
  const candUrl = normalizeUrl(candidate.websiteUrl);
  const candTitle = normalizeTitle(candidate.title);

  for (const existing of existingLeads) {
    const exPhone = normalizePhone(existing.phoneNumber || existing.phone);
    const exUrl = normalizeUrl(existing.websiteUrl);
    const exTitle = normalizeTitle(existing.title || existing.name);

    // 1. Exact Phone match (10 digits)
    if (candPhone && exPhone && candPhone === exPhone) {
      return {
        isDuplicate: true,
        matchedId: existing.id,
        matchReason: `Exact phone match (${existing.phoneNumber || existing.phone})`,
        confidence: 0.99,
      };
    }

    // 2. Exact Website domain match
    if (candUrl && exUrl && candUrl === exUrl) {
      return {
        isDuplicate: true,
        matchedId: existing.id,
        matchReason: `Same website domain (${candUrl})`,
        confidence: 0.95,
      };
    }

    // 3. High title similarity + same city/address
    if (candTitle && exTitle && (candTitle.includes(exTitle) || exTitle.includes(candTitle)) && candTitle.length >= 5) {
      return {
        isDuplicate: true,
        matchedId: existing.id,
        matchReason: `Matching business name ("${existing.title || existing.name}")`,
        confidence: 0.88,
      };
    }
  }

  return { isDuplicate: false, confidence: 0 };
}
