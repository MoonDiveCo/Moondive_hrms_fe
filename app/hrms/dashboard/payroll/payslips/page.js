'use client';

import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  Plus, Send, Trash2, Download, Eye, Search,
  ChevronLeft, ChevronRight, Layers, X, Loader2,
  FileText, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AuthContext } from '@/context/authContext';
import {
  listPayslips,
  getPayslip,
  sendPayslip,
  deletePayslip,
} from '@/services/payrollService';
import GeneratePayslipModal from '@/components/Payroll/GeneratePayslipModal';
import BulkGenerateModal from '@/components/Payroll/BulkGenerateModal';
import PayslipPreviewPanel from '@/components/Payroll/PayslipPreviewPanel';
import Modal from '@/components/Common/Modal';
import apiClient from '@/lib/axiosClient';

// ─────────────────────────────────────────────────────────────────────────────
// Payslips Page
// ─────────────────────────────────────────────────────────────────────────────

const PERM_VIEW   = 'HRMS:PAYROLL:VIEW';
const PERM_WRITE  = 'HRMS:PAYROLL:WRITE';
const PERM_SEND   = 'HRMS:PAYROLL:SEND';
const PERM_DELETE = 'HRMS:PAYROLL:DELETE';

const STATUS_BADGES = {
  DRAFT:        'bg-gray-100 text-gray-600',
  FINALISED:    'bg-blue-100 text-blue-700',
  SENT:         'bg-green-100 text-green-700',
  ACKNOWLEDGED: 'bg-purple-100 text-purple-700',
};

const STATUS_ICONS = {
  DRAFT:        <Clock className="w-3 h-3" />,
  FINALISED:    <FileText className="w-3 h-3" />,
  SENT:         <Send className="w-3 h-3" />,
  ACKNOWLEDGED: <CheckCircle2 className="w-3 h-3" />,
};

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function PayslipsPage() {
  const { allUserPermissions = [], userData } = useContext(AuthContext);

  const canView   = allUserPermissions.includes('*') || allUserPermissions.includes(PERM_VIEW);
  const canWrite  = allUserPermissions.includes('*') || allUserPermissions.includes(PERM_WRITE);
  const canSend   = allUserPermissions.includes('*') || allUserPermissions.includes(PERM_SEND);
  const canDelete = allUserPermissions.includes('*') || allUserPermissions.includes(PERM_DELETE);

  const now = new Date();
  const [filterMonth, setFilterMonth]   = useState('');
  const [filterYear, setFilterYear]     = useState(String(now.getFullYear()));
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage]                 = useState(1);

  const [payslips, setPayslips]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(false);
  const [employees, setEmployees] = useState([]);

  // Modals
  const [generateOpen, setGenerateOpen] = useState(false);
  const [bulkOpen, setBulkOpen]         = useState(false);
  const [viewSlip, setViewSlip]         = useState(null);
  const [viewLoading, setViewLoading]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting]           = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Send modal
  const [sendModalOpen, setSendModalOpen] = useState(null);
  const [sendEmail, setSendEmail]         = useState('');
  const [sendSubject, setSendSubject]     = useState('');
  const [isSending, setIsSending]         = useState(false);

  const previewRef = useRef(null);
  const LIMIT = 15;

  useEffect(() => {
    apiClient.get('hrms/employee/list')
      .then((res) => setEmployees(res.data?.result || res.data?.data || []))
      .catch(() => {});
  }, []);

  const fetchPayslips = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (filterMonth)  params.month  = filterMonth;
    if (filterYear)   params.year   = filterYear;
    if (filterStatus) params.status = filterStatus;
    try {
      const res = await listPayslips(params);
      const data = res.data?.result || res.data?.data || {};
      setPayslips(data.docs || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load payslips');
    } finally {
      setLoading(false);
    }
  }, [page, filterMonth, filterYear, filterStatus]);

  useEffect(() => { fetchPayslips(); }, [fetchPayslips]);
  useEffect(() => { setPage(1); }, [filterMonth, filterYear, filterStatus]);

  const handleView = async (id) => {
    setViewLoading(true);
    try {
      const res = await getPayslip(id);
      setViewSlip(res.data?.result || res.data?.data || null);
    } catch {
      toast.error('Failed to load payslip');
    } finally {
      setViewLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current || !viewSlip) return;
    setDownloadingPdf(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`Payslip_${viewSlip.employeeCode || ''}_${viewSlip.payPeriod?.replace(' ', '_') || ''}.pdf`);
    } catch {
      toast.error('Could not generate PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const openSendModal = (slip) => {
    setSendModalOpen(slip);
    setSendEmail(slip.employeeEmail || '');
    setSendSubject(`Payslip for ${slip.payPeriod}`);
  };

  const handleSend = async () => {
    if (!sendEmail) { toast.error('Enter recipient email'); return; }
    if (!sendModalOpen) return;
    setIsSending(true);
    try {
      let pdfBase64 = null;
      if (previewRef.current) {
        const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
        pdfBase64 = canvas.toDataURL('image/png').split(',')[1];
      }
      await sendPayslip(sendModalOpen._id, {
        to: sendEmail,
        subject: sendSubject,
        pdfBase64,
        fileName: `Payslip_${sendModalOpen.payPeriod?.replace(' ', '_')}.pdf`,
      });
      toast.success('Payslip sent successfully');
      setSendModalOpen(null);
      fetchPayslips();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Send failed');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deletePayslip(deleteConfirm._id);
      toast.success('Payslip deleted');
      setDeleteConfirm(null);
      fetchPayslips();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = filterMonth || filterStatus;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="h-full overflow-auto p-4 bg-background">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold text-blackText">Payslips</h4>
            <p className="text-sm text-primaryText mt-0.5">
              {total > 0 ? `${total} payslip${total !== 1 ? 's' : ''}` : 'Generate and manage monthly payslips'}
            </p>
          </div>
          {canWrite && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBulkOpen(true)}
                className="flex items-center gap-1.5 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                <Layers size={14} /> Bulk Actions
              </button>
              <button
                onClick={() => setGenerateOpen(true)}
                className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={15} /> Generate Payslip
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Months</option>
            {MONTHS.slice(1).map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            min={2020} max={2099}
            className="w-24 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="FINALISED">Finalised</option>
            <option value="SENT">Sent</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
          </select>
          {hasFilters && (
            <button
              onClick={() => { setFilterMonth(''); setFilterStatus(''); setPage(1); }}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors"
            >
              <X className="w-4 h-4" /> Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden primaryShadow">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Employee', 'Pay Period', 'Gross', 'Deductions', 'Net Pay', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 0 ? '70%' : '55%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-7 h-7 text-[#FF7B30]" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">No payslips found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {hasFilters ? 'Try clearing the filters' : 'Generate the first payslip to get started'}
                    </p>
                    {canWrite && !hasFilters && (
                      <button
                        onClick={() => setGenerateOpen(true)}
                        className="mt-4 text-sm text-[#FF7B30] hover:underline font-medium"
                      >
                        Generate a payslip →
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                payslips.map((s, idx) => {
                  const emp = s.employeeId || {};
                  const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();
                  return (
                    <motion.tr
                      key={s._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7B30] text-xs font-bold flex-shrink-0">
                            {initials || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-gray-400">{emp.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">{s.payPeriod}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">{fmt(s.grossEarnings)}</td>
                      <td className="px-4 py-3.5 text-sm text-red-500">{fmt(s.totalDeductions)}</td>
                      <td className="px-4 py-3.5 text-sm font-bold text-[#FF7B30]">{fmt(s.netPay)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit ${STATUS_BADGES[s.status] || 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_ICONS[s.status]}
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleView(s._id)}
                            title="View Payslip"
                            className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-[#FF7B30] transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          {canSend && s.status === 'FINALISED' && (
                            <button
                              onClick={() => openSendModal(s)}
                              title="Send via Email"
                              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                            >
                              <Send size={15} />
                            </button>
                          )}
                          {canDelete && ['DRAFT', 'FINALISED'].includes(s.status) && (
                            <button
                              onClick={() => setDeleteConfirm(s)}
                              title="Delete"
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="text-primaryText">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition">
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 text-xs font-medium">{page} / {totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Generate Payslip Modal */}
      <GeneratePayslipModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onSuccess={() => fetchPayslips()}
        employees={employees}
        orgName={userData?.organizationId?.name || ''}
      />

      {/* Bulk Actions Modal */}
      <BulkGenerateModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onSuccess={() => fetchPayslips()}
      />

      {/* View Payslip Modal */}
      {(viewSlip || viewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-semibold text-primaryText">
                  {viewSlip ? `Payslip — ${viewSlip.payPeriod}` : 'Loading…'}
                </h3>
                {viewSlip && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {viewSlip.employeeName} · {viewSlip.department || viewSlip.designation || ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {viewSlip && (
                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="flex items-center gap-1.5 text-sm bg-primary hover:bg-orange-600 text-white rounded-lg px-3 py-1.5 disabled:opacity-50 transition"
                  >
                    <Download size={14} />
                    {downloadingPdf ? 'Generating…' : 'Download PDF'}
                  </button>
                )}
                <button
                  onClick={() => setViewSlip(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto p-4">
              {viewLoading && (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 size={20} className="animate-spin mr-2" /> Loading payslip…
                </div>
              )}
              {viewSlip && (
                <PayslipPreviewPanel
                  ref={previewRef}
                  payslip={viewSlip}
                  orgName={userData?.organizationId?.name || ''}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      <Modal
        isVisible={!!sendModalOpen}
        title="Send Payslip via Email"
        subtitle={`Payslip for ${sendModalOpen?.payPeriod || ''}`}
        onClose={() => setSendModalOpen(null)}
        maxWidth="480px"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1.5">Recipient Email</label>
            <input
              type="email"
              value={sendEmail}
              onChange={(e) => setSendEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="employee@company.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1.5">Email Subject</label>
            <input
              type="text"
              value={sendSubject}
              onChange={(e) => setSendSubject(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          {/* Hidden payslip for PDF generation */}
          <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
            <PayslipPreviewPanel
              ref={previewRef}
              payslip={sendModalOpen}
              orgName={userData?.organizationId?.name || ''}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={() => setSendModalOpen(null)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="flex items-center gap-1.5 px-5 py-2 text-sm bg-primary hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 transition"
          >
            {isSending
              ? <><Loader2 size={13} className="animate-spin" /> Sending…</>
              : <><Send size={13} /> Send Payslip</>
            }
          </button>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isVisible={!!deleteConfirm}
        title="Delete Payslip?"
        onClose={() => setDeleteConfirm(null)}
        maxWidth="420px"
      >
        <p className="text-sm text-primaryText mb-6">
          Delete the <strong className="text-blackText">{deleteConfirm?.payPeriod}</strong> payslip for{' '}
          <strong className="text-blackText">
            {deleteConfirm?.employeeId?.firstName} {deleteConfirm?.employeeId?.lastName}
          </strong>? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
