import { Client, LeadPriority, WebsiteQuality, LeadStatus } from '../types';

/**
 * Robust CSV parser adhering to RFC 4180 (handles commas inside quotes, escaped quotes, newlines)
 */
export function parseCSVString(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let current = '';

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"' && inQuotes && next === '"') {
      current += '"';
      i++; // skip escaped quote
    } else if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      row.push(current.trim());
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        lines.push(row);
      }
      row = [];
      current = '';
    } else {
      current += c;
    }
  }

  if (current || row.length > 0) {
    row.push(current.trim());
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Maps parsed CSV rows to Client / Lead objects with exact column matching
 */
export function convertRowsToLeads(rows: string[][]): Omit<Client, 'id' | 'dateAdded'>[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim().replace(/^["']|["']$/g, ''));

  // Header column index resolvers
  const titleIdx = headers.findIndex((h) => h === 'title' || h.includes('title') || h === 'name' || h.includes('business'));
  const addressIdx = headers.findIndex((h) => h === 'address' || h.includes('address') || h.includes('location'));
  const phoneIdx = headers.findIndex((h) => h === 'phonenumber' || h.includes('phone') || h.includes('mobile') || h.includes('tel'));
  const websiteIdx = headers.findIndex((h) => h === 'websiteurl' || h === 'website' || h.includes('website') || h.includes('url') || h.includes('site'));
  const industryIdx = headers.findIndex((h) => h === 'industry' || h.includes('industry') || h.includes('category') || h.includes('niche'));
  const cityIdx = headers.findIndex((h) => h === 'city' || h.includes('city') || h.includes('town'));
  const ratingIdx = headers.findIndex((h) => h === 'rating' || h.includes('rating') || h.includes('stars'));
  const reviewCountIdx = headers.findIndex((h) => h === 'reviewcount' || h.includes('review'));
  const priorityIdx = headers.findIndex((h) => h === 'leadpriority' || h === 'priority' || h.includes('priority'));
  const mapsLinkIdx = headers.findIndex((h) => h === 'mapslink' || h.includes('maps') || h.includes('map'));
  const qualityIdx = headers.findIndex((h) => h === 'websitequality' || h.includes('quality'));
  const problemIdx = headers.findIndex((h) => h === 'problemfound' || h.includes('problem') || h.includes('issue'));
  const notesIdx = headers.findIndex((h) => h === 'notes' || h === 'note' || h.includes('note'));
  const statusIdx = headers.findIndex((h) => h === 'status' || h.includes('stage'));

  const results: Omit<Client, 'id' | 'dateAdded'>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || !row[0]) continue;

    const title = (titleIdx !== -1 ? row[titleIdx] : row[0]) || 'Untitled Business';
    const address = addressIdx !== -1 ? row[addressIdx] : '';
    const phone = phoneIdx !== -1 ? row[phoneIdx] : '';
    const website = websiteIdx !== -1 ? row[websiteIdx] : '';
    const industry = (industryIdx !== -1 ? row[industryIdx] : '') || 'General';
    const city = (cityIdx !== -1 ? row[cityIdx] : '') || 'Mohali';
    const rating = ratingIdx !== -1 && row[ratingIdx] ? parseFloat(row[ratingIdx]) || row[ratingIdx] : null;
    const reviewCount = reviewCountIdx !== -1 && row[reviewCountIdx] ? parseInt(row[reviewCountIdx], 10) || row[reviewCountIdx] : null;

    let priority: LeadPriority = 'Low';
    if (priorityIdx !== -1 && row[priorityIdx]) {
      const p = row[priorityIdx].toLowerCase();
      if (p.includes('high')) priority = 'High';
      else if (p.includes('med')) priority = 'Medium';
      else priority = 'Low';
    } else if (!website) {
      priority = 'High'; // No website default to high opportunity
    }

    let mapsLink = mapsLinkIdx !== -1 ? row[mapsLinkIdx] : '';
    if (!mapsLink && (title || address)) {
      mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title}, ${address}`)}`;
    }

    const quality: WebsiteQuality = qualityIdx !== -1 && row[qualityIdx] 
      ? row[qualityIdx] 
      : (!website ? 'No Website' : 'Needs Review');

    const problem = problemIdx !== -1 && row[problemIdx] 
      ? row[problemIdx] 
      : (!website ? 'No website listed on Google Maps' : 'Website exists; manual website audit required');

    const notes = notesIdx !== -1 && row[notesIdx] 
      ? row[notesIdx] 
      : (!website ? 'Potential website-development lead.' : 'Website found on Google Maps; review before outreach.');

    let status: LeadStatus = 'New Lead';
    if (statusIdx !== -1 && row[statusIdx]) {
      const s = row[statusIdx].toLowerCase();
      if (s.includes('contact')) status = 'Contacted';
      else if (s.includes('call') || s.includes('sched')) status = 'Call Scheduled';
      else if (s.includes('won') || s.includes('convert')) status = 'Converted';
      else if (s.includes('review')) status = 'Under Review';
      else if (s.includes('lost') || s.includes('not')) status = 'Not Interested';
    }

    results.push({
      name: title,
      company: title,
      title,
      address,
      phoneNumber: phone,
      phone,
      websiteUrl: website,
      email: website ? `info@${website.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}` : '',
      industry,
      niche: industry,
      city,
      rating,
      reviewCount,
      leadPriority: priority,
      priority,
      mapsLink,
      websiteQuality: quality,
      problemFound: problem,
      notes,
      keyDetail: problem,
      status,
      stage: status === 'Converted' ? 'Won' : status === 'Contacted' ? 'Call' : 'Lead',
      value: priority === 'High' ? 2500 : 1200,
      assignedTo: 'Outreach',
      tags: [industry, quality, priority === 'High' ? 'High Priority' : 'Standard'],
    });
  }

  return results;
}

/**
 * Standard 11 CSV columns matching the user's finalized format:
 * Title, Address, PhoneNumber, WebsiteURL, Industry, City, LeadPriority, MapsLink, WebsiteQuality, ProblemFound, Notes
 */
export const STANDARD_CSV_HEADERS = [
  'Title',
  'Address',
  'PhoneNumber',
  'WebsiteURL',
  'Industry',
  'City',
  'LeadPriority',
  'MapsLink',
  'WebsiteQuality',
  'ProblemFound',
  'Notes',
];

/**
 * Generates sample CSV template matching user's exact 11 columns
 */
export function getSampleCSVTemplate(): string {
  const sampleRows = [
    STANDARD_CSV_HEADERS.join(','),
    '"Mohali Dental Care","SCO 14, Phase 7, Mohali","+91 98141 12345","","Dentist","Mohali","High","https://maps.google.com","No Website","No website found on Google Maps; high appointment demand","Cold pitch custom appointment booking web design"',
    '"The Golden Crust Bakery","Shop 8, Sector 70, Mohali","+91 98765 43210","https://goldencrust.in","Bakery","Mohali","Medium","https://maps.google.com","Needs Review","Slow mobile load speed & no online ordering menu","Pitch WooCommerce menu & cake preorder portal"',
    '"Karat Jewels","Sector 82, JLPL Industrial Area, Mohali","+91 98888 77777","","Jewellery","Mohali","High","https://maps.google.com","No Website","High ticket luxury brand with no portfolio website","Pitch catalog showcase with WhatsApp catalogue integration"',
  ];
  return sampleRows.join('\n');
}

/**
 * Exports current client leads to a standard CSV file matching exact 11 CSV headers
 */
export function exportLeadsToCSV(leads: Client[]) {
  const headers = STANDARD_CSV_HEADERS;

  const escapeCell = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = leads.map((l) => [
    escapeCell(l.title || l.name),
    escapeCell(l.address || ''),
    escapeCell(l.phoneNumber || l.phone || ''),
    escapeCell(l.websiteUrl || ''),
    escapeCell(l.industry || l.niche || ''),
    escapeCell(l.city || 'Mohali'),
    escapeCell(l.leadPriority || l.priority || 'Low'),
    escapeCell(l.mapsLink || ''),
    escapeCell(l.websiteQuality || (!l.websiteUrl ? 'No Website' : 'Needs Review')),
    escapeCell(l.problemFound || l.keyDetail || ''),
    escapeCell(l.notes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `leads_directory_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
