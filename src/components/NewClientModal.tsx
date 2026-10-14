import React, { useState } from 'react';
import { X, Plus, MapPin, Phone, Globe, AlertTriangle, Building2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { LeadPriority, LeadStatus, WebsiteQuality, LEAD_STATUSES } from '../types';

export const NewClientModal: React.FC = () => {
  const { isNewClientModalOpen, setNewClientModalOpen, addClient } = useWorkspace();

  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Dentists');
  const [city, setCity] = useState('Mohali');
  const [priority, setPriority] = useState<LeadPriority>('High');
  const [quality, setQuality] = useState<WebsiteQuality>('No Website');
  const [problem, setProblem] = useState('No website listed on Google Maps');
  const [notes, setNotes] = useState('Potential website-development lead.');
  const [status, setStatus] = useState<LeadStatus>('New Lead');
  const [mapsLink, setMapsLink] = useState('');

  if (!isNewClientModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalMapsLink =
      mapsLink.trim() ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${title.trim()}, ${address.trim() || city}`
      )}`;

    addClient({
      name: title.trim(),
      company: title.trim(),
      title: title.trim(),
      address: address.trim(),
      phoneNumber: phone.trim(),
      phone: phone.trim(),
      websiteUrl: website.trim(),
      email: website.trim() ? `info@${website.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')}` : '',
      industry: industry.trim() || 'General',
      niche: industry.trim() || 'General',
      city: city.trim() || 'Mohali',
      leadPriority: priority,
      priority,
      websiteQuality: quality,
      problemFound: problem.trim(),
      keyDetail: problem.trim(),
      notes: notes.trim(),
      status,
      stage: status === 'Converted' ? 'Won' : status === 'Contacted' ? 'Call' : 'Lead',
      mapsLink: finalMapsLink,
      value: priority === 'High' ? 2500 : 1200,
      assignedTo: 'Lead Gen',
      tags: [industry, quality, priority === 'High' ? 'High Priority' : 'Standard'],
    });

    setNewClientModalOpen(false);
    // Reset form
    setTitle('');
    setAddress('');
    setPhone('');
    setWebsite('');
    setProblem('No website listed on Google Maps');
    setNotes('Potential website-development lead.');
    setMapsLink('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add New Lead
            </h3>
            <p className="text-xs text-slate-500">
              Input lead information matching the CSV dataset
            </p>
          </div>
          <button
            onClick={() => setNewClientModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Business / Lead Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dr. Gupta Dental Clinic"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Industry & City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Industry
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Dentists, Bakeries, Jewelry"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mohali"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Phone & Website */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 09876543210"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Website URL (optional)
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  if (e.target.value) {
                    setQuality('Needs Review');
                    setProblem('Website exists; manual website audit required');
                  } else {
                    setQuality('No Website');
                    setProblem('No website listed on Google Maps');
                  }
                }}
                placeholder="e.g. drguptaclinic.com"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. SCO 45, Sector 70, Mohali, Punjab 160071"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Priority & Website Quality */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lead Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Website Quality
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as WebsiteQuality)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              >
                <option value="No Website">No Website</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Average">Average</option>
                <option value="Good">Good</option>
              </select>
            </div>
          </div>

          {/* Problem Found */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Problem Found / Audit Flag
            </label>
            <input
              type="text"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g. No website listed on Google Maps"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Potential website-development lead."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewClientModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
            >
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
