/**
 * aiService.ts — Frontend client for Quill Land AI intelligence layer
 */

import { Client } from '../types';
import { AIResearchResult, AICallPrepResult, AIParsedNoteResult, DuplicateCheckResult } from './aiEngine';

export async function requestLeadResearch(lead: Partial<Client>): Promise<AIResearchResult> {
  const res = await fetch('/api/ai/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead: {
        title: lead.title || lead.name,
        industry: lead.industry || lead.niche,
        city: lead.city,
        rating: lead.rating,
        reviewCount: lead.reviewCount,
        websiteUrl: lead.websiteUrl,
        phoneNumber: lead.phoneNumber || lead.phone,
        address: lead.address,
      },
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'AI research request failed');
  }

  return res.json();
}

export async function requestCallPrep(lead: Partial<Client>): Promise<AICallPrepResult> {
  const res = await fetch('/api/ai/call-prep', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead: {
        title: lead.title || lead.name,
        industry: lead.industry || lead.niche,
        city: lead.city,
        websiteUrl: lead.websiteUrl,
        rating: lead.rating,
        reviewCount: lead.reviewCount,
        whyThisLead: lead.whyThisLead,
      },
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'AI call prep request failed');
  }

  return res.json();
}

export async function requestParseCallNote(noteText: string): Promise<AIParsedNoteResult> {
  const res = await fetch('/api/ai/parse-note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteText }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'AI note parse request failed');
  }

  return res.json();
}

export async function requestDuplicateCheck(
  candidate: { title: string; phoneNumber?: string; websiteUrl?: string; address?: string }
): Promise<DuplicateCheckResult> {
  const res = await fetch('/api/ai/check-duplicates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Duplicate check request failed');
  }

  return res.json();
}
