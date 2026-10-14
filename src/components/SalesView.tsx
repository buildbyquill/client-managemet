import React, { useState } from 'react';
import {
  CircleDollarSign,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Repeat,
  Receipt,
  FileText,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { CLIENT_STAGES, ClientStage, InvoiceStatus } from '../types';

export const SalesView: React.FC = () => {
  const {
    clients,
    invoices,
    markInvoicePaid,
    updateInvoice,
    deleteInvoice,
    addInvoice,
    setActiveTab,
  } = useWorkspace();

  const [invoiceFilter, setInvoiceFilter] = useState<string>('all');
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  // New invoice form state
  const [invClientId, setInvClientId] = useState(clients[0]?.id || '');
  const [invAmount, setInvAmount] = useState<number>(6500);
  const [invDesc, setInvDesc] = useState('Custom System Build Milestone');
  const [invDueDate, setInvDueDate] = useState('2026-09-30');

  // Metrics
  const cashCollected = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const outstanding = invoices
    .filter((i) => i.status === 'Sent' || i.status === 'Overdue')
    .reduce((sum, i) => sum + i.amount, 0);

  const pipelineStages: ClientStage[] = ['Proposal', 'Qualified', 'Call', 'Spec Project'];
  const inPipeline = clients
    .filter((c) => pipelineStages.includes(c.stage))
    .reduce((sum, c) => sum + (c.value || 0), 0);

  // Pipeline breakdown by stage
  const stageStats = CLIENT_STAGES.map((stage) => {
    const matched = clients.filter((c) => c.stage === stage);
    const count = matched.length;
    const value = matched.reduce((sum, c) => sum + (c.value || 0), 0);
    return { stage, count, value };
  });

  const filteredInvoices = invoices.filter((inv) => {
    if (invoiceFilter === 'all') return true;
    return inv.status.toLowerCase() === invoiceFilter.toLowerCase();
  });

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find((c) => c.id === invClientId);
    const clientName = selectedClient ? selectedClient.name : 'Custom Client';

    addInvoice({
      clientId: invClientId,
      clientName,
      amount: invAmount,
      status: 'Sent',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: invDueDate,
      description: invDesc,
      invoiceNumber: `INV-2026-00${invoices.length + 1}`,
    });

    setShowCreateInvoice(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CircleDollarSign className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sales, Pipeline & Invoicing
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Agency deal-flow economics, milestones, retainer billing, and cash collection.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateInvoice(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-[#4338CA] hover:bg-[#3730A3] rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Issue Invoice</span>
        </button>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cash collected</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              ${cashCollected.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Paid in bank</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Outstanding invoices</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              ${outstanding.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Pending payments</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active pipeline</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              ${inPipeline.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Proposals & calls</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Invoices</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {invoices.length}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Issued vouchers</div>
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pipeline Stage Value Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pipeline Value by Stage</h3>
            <button
              onClick={() => setActiveTab('clients')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Manage Deals</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {stageStats.map((item) => (
              <div
                key={item.stage}
                className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.stage}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({item.count})</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  ${item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Invoices Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Invoices & Milestones</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Track paid milestones and receipts</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
              {['all', 'paid', 'sent', 'overdue'].map((f) => (
                <button
                  key={f}
                  onClick={() => setInvoiceFilter(f)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                    invoiceFilter === f
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <Receipt className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                No invoices found in this view.
              </p>
              <button
                onClick={() => setShowCreateInvoice(true)}
                className="mt-3 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
              >
                Create Invoice
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3 font-medium">Invoice #</th>
                    <th className="p-3 font-medium">Client</th>
                    <th className="p-3 font-medium">Amount</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Due Date</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono font-semibold text-slate-900 dark:text-white">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{inv.clientName}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">{inv.description}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        ${inv.amount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <select
                          value={inv.status}
                          onChange={(e) => updateInvoice(inv.id, { status: e.target.value as InvoiceStatus })}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : inv.status === 'Overdue'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Paid">Paid</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </td>
                      <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{inv.dueDate}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status !== 'Paid' && (
                            <button
                              onClick={() => markInvoicePaid(inv.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded border border-emerald-200 dark:border-emerald-800 transition-colors"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => deleteInvoice(inv.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal Drawer */}
      {showCreateInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Invoice</h3>
              <button
                onClick={() => setShowCreateInvoice(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Client</label>
                {clients.length > 0 ? (
                  <select
                    value={invClientId}
                    onChange={(e) => setInvClientId(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company || c.niche})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-slate-400 text-xs">
                    No clients yet. Add a client first or type a name.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  value={invAmount}
                  onChange={(e) => setInvAmount(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Description / Deliverable</label>
                <input
                  type="text"
                  value={invDesc}
                  onChange={(e) => setInvDesc(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoice(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Create & Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
