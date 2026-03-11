'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  bulkGeneratePayslips,
  bulkSendPayslips,
  listPayslips,
} from '@/services/payrollService';

// ─────────────────────────────────────────────────────────────────────────────
// BulkGenerateModal
//
// Tab 1 — Bulk Generate: Select month/year → Generate for all employees
// Tab 2 — Bulk Send: Shows FINALISED payslips → Confirm → Send
//
// Props:
//   open       – boolean
//   onClose    – fn
//   onSuccess  – fn
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_BADGES = {
  DRAFT:      'bg-gray-100 text-gray-600',
  FINALISED:  'bg-blue-100 text-blue-700',
  SENT:       'bg-green-100 text-green-700',
  ACKNOWLEDGED: 'bg-purple-100 text-purple-700',
};

export default function BulkGenerateModal({ open, onClose, onSuccess }) {
  const [tab, setTab] = useState('generate');
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());

  // Generate tab
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult]   = useState(null);

  // Send tab
  const [finalisedSlips, setFinalisedSlips] = useState([]);
  const [loadingSlips, setLoadingSlips]     = useState(false);
  const [selectedIds, setSelectedIds]       = useState([]);
  const [sending, setSending]               = useState(false);
  const [sendProgress, setSendProgress]     = useState(null);
  const [emailSubject, setEmailSubject]     = useState('');

  useEffect(() => {
    if (!open) {
      setTab('generate');
      setGenResult(null);
      setFinalisedSlips([]);
      setSelectedIds([]);
      setSendProgress(null);
    }
  }, [open]);

  // Load FINALISED payslips when Send tab is active
  useEffect(() => {
    if (tab !== 'send' || !open) return;
    setLoadingSlips(true);
    setFinalisedSlips([]);
    listPayslips({ month, year, status: 'FINALISED' })
      .then((res) => {
        const data = res.data?.result || res.data?.data || {};
        setFinalisedSlips(data.docs || []);
        setSelectedIds((data.docs || []).map((s) => s._id));
      })
      .catch(() => toast.error('Failed to load finalised payslips'))
      .finally(() => setLoadingSlips(false));
  }, [tab, month, year, open]);

  // ── Bulk Generate ─────────────────────────────────────────────────────────
  const handleBulkGenerate = async () => {
    setGenerating(true);
    setGenResult(null);
    try {
      const res = await bulkGeneratePayslips({ month, year });
      const result = res.data?.result || res.data?.data || {};
      setGenResult(result);
      if ((result.generated?.length || 0) > 0) {
        toast.success(`${result.generated.length} payslip(s) generated`);
        onSuccess?.();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Bulk generation failed');
    } finally {
      setGenerating(false);
    }
  };

  // ── Bulk Send ─────────────────────────────────────────────────────────────
  const handleBulkSend = async () => {
    if (selectedIds.length === 0) {
      toast.error('No payslips selected');
      return;
    }
    setSending(true);
    setSendProgress({ total: selectedIds.length, done: 0, failed: 0 });
    try {
      const res = await bulkSendPayslips({
        month,
        year,
        payslipIds: selectedIds,
        emailSubject: emailSubject || `Payslip for ${MONTHS[month]} ${year}`,
      });
      const result = res.data?.result || res.data?.data || {};
      setSendProgress({
        total: selectedIds.length,
        done: result.sent?.length || 0,
        failed: result.failed?.length || 0,
      });
      toast.success(`${result.sent?.length || 0} payslip(s) sent`);
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Bulk send failed');
    } finally {
      setSending(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === finalisedSlips.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(finalisedSlips.map((s) => s._id));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full mx-4 max-w-2xl my-4 flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-primaryText">Bulk Payroll Actions</h4>
          <button onClick={onClose} className="p-2 rounded-md text-gray-400 hover:text-primaryText transition">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          <button
            onClick={() => setTab('generate')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === 'generate'
                ? 'border-[#FF7B30] text-[#FF7B30]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Bulk Generate
          </button>
          <button
            onClick={() => setTab('send')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ml-2 ${
              tab === 'send'
                ? 'border-[#FF7B30] text-[#FF7B30]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Bulk Send
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Month / Year selector (shared) */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {MONTHS.slice(1).map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                min={2020} max={2099}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* ── Generate Tab ─────────────────────────────────────── */}
          {tab === 'generate' && (
            <div>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-gray-800 mb-2">What this does</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-primaryText">
                  <li>Finds all employees with an active salary structure</li>
                  <li>Skips employees who already have a payslip for this month</li>
                  <li>Generates payslips in DRAFT status for review before sending</li>
                </ul>
              </div>

              {genResult && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
                    <CheckCircle size={16} className="flex-shrink-0" />
                    <span><strong>{genResult.generated?.length || 0}</strong> payslip{(genResult.generated?.length || 0) !== 1 ? 's' : ''} generated successfully</span>
                  </div>
                  {(genResult.skipped?.length || 0) > 0 && (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      {genResult.skipped?.length} employee(s) skipped — payslip already exists for this period
                    </div>
                  )}
                  {(genResult.failed?.length || 0) > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-700">
                      <p className="font-semibold mb-1">{genResult.failed.length} failed:</p>
                      {genResult.failed.map((f, i) => (
                        <p key={i} className="text-red-600">{f.employeeName || f.employeeId} — {f.reason}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Send Tab ─────────────────────────────────────────── */}
          {tab === 'send' && (
            <div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Email Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder={`Payslip for ${MONTHS[month]} ${year}`}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {loadingSlips && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
                  <Loader2 size={16} className="animate-spin" /> Loading finalised payslips…
                </div>
              )}

              {!loadingSlips && finalisedSlips.length === 0 && (
                <div className="text-center py-10">
                  <AlertCircle size={28} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">No FINALISED payslips for {MONTHS[month]} {year}</p>
                  <p className="text-xs text-gray-400 mt-1">Generate and finalise payslips first</p>
                </div>
              )}

              {!loadingSlips && finalisedSlips.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === finalisedSlips.length && finalisedSlips.length > 0}
                        onChange={toggleAll}
                        className="accent-orange-500"
                      />
                      <span className="font-medium">Select All ({finalisedSlips.length})</span>
                    </label>
                    <span className="text-xs text-[#FF7B30] font-semibold">{selectedIds.length} selected</span>
                  </div>
                  <div className="space-y-1 max-h-56 overflow-y-auto">
                    {finalisedSlips.map((s) => {
                      const emp = s.employeeId;
                      const initials = `${emp?.firstName?.[0] || ''}${emp?.lastName?.[0] || ''}`.toUpperCase();
                      return (
                        <label
                          key={s._id}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(s._id)}
                            onChange={() => toggleSelect(s._id)}
                            className="accent-orange-500"
                          />
                          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7B30] text-[10px] font-bold flex-shrink-0">
                            {initials || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {emp?.firstName} {emp?.lastName}
                            </p>
                            <p className="text-xs text-gray-400">{emp?.employeeId}</p>
                          </div>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_BADGES[s.status] || ''}`}>
                            {s.status}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}

              {sendProgress && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="flex-shrink-0" />
                    <span className="font-semibold">Send complete</span>
                  </div>
                  <p className="text-xs text-green-700">
                    {sendProgress.done} sent successfully
                    {sendProgress.failed > 0 && ` · ${sendProgress.failed} failed`}
                  </p>
                  <div className="w-full bg-green-100 rounded-full h-1.5 mt-3">
                    <div
                      className="bg-green-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(sendProgress.done / sendProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition text-primaryText"
          >
            Close
          </button>

          {tab === 'generate' && (
            <button
              onClick={handleBulkGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-primary hover:bg-orange-600 text-white rounded-lg transition disabled:opacity-50 font-medium"
            >
              {generating ? (
                <><Loader2 size={14} className="animate-spin" /> Generating…</>
              ) : (
                'Generate for All Employees'
              )}
            </button>
          )}

          {tab === 'send' && (
            <button
              onClick={handleBulkSend}
              disabled={sending || selectedIds.length === 0}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-primary hover:bg-orange-600 text-white rounded-lg transition disabled:opacity-50 font-medium"
            >
              {sending ? (
                <><Loader2 size={14} className="animate-spin" /> Sending…</>
              ) : (
                <><Send size={14} /> Send {selectedIds.length} Payslip{selectedIds.length !== 1 ? 's' : ''}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
