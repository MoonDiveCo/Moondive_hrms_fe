'use client';

import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Download, Eye, FileText,
  TrendingUp, Wallet, Calendar, Clock, CheckCircle2, Send, X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { AuthContext } from '@/context/authContext';
import SubModuleProtectedRoute from '@/lib/routeProtection/SubModuleProtectedRoute';
import { getEmployeePayslips, getPayslip } from '@/services/payrollService';
import PayslipPreviewPanel from '@/components/Payroll/PayslipPreviewPanel';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ─────────────────────────────────────────────────────────────────────────────
// My Payslips — self-service page for employees.
// Uses the self-access endpoint — no special PAYROLL:VIEW permission required.
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_CONFIG = {
  DRAFT:        { label: 'Draft',       cls: 'bg-gray-100 text-gray-600',    icon: Clock },
  FINALISED:    { label: 'Finalised',   cls: 'bg-blue-100 text-blue-700',    icon: FileText },
  SENT:         { label: 'Sent',        cls: 'bg-green-100 text-green-700',  icon: Send },
  ACKNOWLEDGED: { label: 'Acknowledged',cls: 'bg-purple-100 text-purple-700',icon: CheckCircle2 },
};

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const LIMIT = 12;

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="border-b border-gray-100 last:border-0">
      {[1, 2, 3, 4, 5, 6].map((j) => (
        <td key={j} className="px-5 py-4">
          <div className="animate-pulse bg-gray-100 rounded h-4 w-full" />
        </td>
      ))}
    </tr>
  ));
}

export default function MyPayslipsPage() {
  const { user } = useContext(AuthContext);

  const [payslips, setPayslips] = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);

  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  const [viewPayslip, setViewPayslip] = useState(null);
  const [loadingView, setLoadingView] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef(null);

  const fetchPayslips = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await getEmployeePayslips(user._id, {
        page,
        limit: LIMIT,
        year: yearFilter || undefined,
      });
      const data = res.data?.result || res.data?.data || {};
      setPayslips(data.docs || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Could not load payslips');
    } finally {
      setLoading(false);
    }
  }, [user?._id, page, yearFilter]);

  useEffect(() => { fetchPayslips(); }, [fetchPayslips]);
  useEffect(() => { setPage(1); }, [yearFilter]);

  const handleView = async (id) => {
    setLoadingView(true);
    try {
      const res = await getPayslip(id);
      setViewPayslip(res.data?.result || res.data?.data || null);
    } catch {
      toast.error('Could not load payslip details');
    } finally {
      setLoadingView(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current || !viewPayslip) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      const pdfWidth  = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Payslip_${MONTHS[viewPayslip.month]}_${viewPayslip.year}.pdf`);
    } catch {
      toast.error('Could not generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const totalPages  = Math.ceil(total / LIMIT);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Derived stats from loaded payslips
  const yearlyNetPay = payslips.reduce((s, p) => s + (p.netPay || 0), 0);
  const yearlyGross  = payslips.reduce((s, p) => s + (p.grossEarnings || 0), 0);

  return (
    <SubModuleProtectedRoute requiredPermissionPrefixes={['HRMS:HRMS_OVERVIEW']}>
      <div className="h-full overflow-auto p-4 bg-background">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-blackText">My Payslips</h1>
              <p className="text-sm text-primaryText mt-0.5">View and download your monthly salary statements</p>
            </div>

            {/* Year selector */}
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-primaryText" />
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-blackText"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Stats Cards ─────────────────────────────────────────────── */}
          {!loading && payslips.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 primaryShadow p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-[#FF7B30]" />
                </div>
                <div>
                  <p className="text-xs text-primaryText">Payslips in {yearFilter}</p>
                  <p className="text-lg font-bold text-blackText">{total}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 primaryShadow p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={16} className="text-[#FF7B30]" />
                </div>
                <div>
                  <p className="text-xs text-primaryText">Gross Earned</p>
                  <p className="text-lg font-bold text-blackText">{fmt(yearlyGross)}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 primaryShadow p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Wallet size={16} className="text-[#FF7B30]" />
                </div>
                <div>
                  <p className="text-xs text-primaryText">Take-Home</p>
                  <p className="text-lg font-bold text-[#FF7B30]">{fmt(yearlyNetPay)}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Table ───────────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden primaryShadow">
            {loading ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Period', 'Gross Earnings', 'Total Deductions', 'Net Pay', 'Status', ''].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody><SkeletonRows /></tbody>
              </table>
            ) : payslips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                  <FileText size={24} className="text-[#FF7B30]" />
                </div>
                <p className="text-sm font-semibold text-blackText">No payslips for {yearFilter}</p>
                <p className="text-xs text-primaryText mt-1">Your payslips will appear here once generated by the accounts team.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Period</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Gross Earnings</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Deductions</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Net Pay</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payslips.map((slip, idx) => {
                    const s = STATUS_CONFIG[slip.status] || STATUS_CONFIG.DRAFT;
                    const StatusIcon = s.icon;
                    return (
                      <motion.tr
                        key={slip._id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Period */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-[#FF7B30] leading-none text-center">
                                {MONTHS[slip.month]?.slice(0, 3).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-blackText">{MONTHS[slip.month]} {slip.year}</p>
                              <p className="text-[11px] text-primaryText">{slip.payPeriod || `${MONTHS[slip.month]} ${slip.year}`}</p>
                            </div>
                          </div>
                        </td>

                        {/* Gross */}
                        <td className="px-5 py-4 text-primaryText">{fmt(slip.grossEarnings)}</td>

                        {/* Deductions */}
                        <td className="px-5 py-4 text-red-500">{fmt(slip.totalDeductions)}</td>

                        {/* Net Pay */}
                        <td className="px-5 py-4 font-bold text-[#FF7B30]">{fmt(slip.netPay)}</td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${s.cls}`}>
                            <StatusIcon size={11} />
                            {s.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleView(slip._id)}
                            disabled={loadingView}
                            title="View Payslip"
                            className="p-1.5 text-gray-400 hover:text-[#FF7B30] hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-primaryText">
              <span>
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} payslip{total !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-lg">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Payslip View Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {viewPayslip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-4 flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <div>
                  <h2 className="text-base font-semibold text-blackText">
                    Payslip — {MONTHS[viewPayslip.month]} {viewPayslip.year}
                  </h2>
                  <p className="text-xs text-primaryText mt-0.5">
                    {viewPayslip.designation || ''}{viewPayslip.designation && viewPayslip.department ? ' · ' : ''}{viewPayslip.department || ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-60"
                  >
                    <Download size={14} />
                    {downloading ? 'Downloading…' : 'Download PDF'}
                  </button>
                  <button
                    onClick={() => setViewPayslip(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Net Pay summary strip */}
              <div
                className="px-6 py-3 flex items-center justify-between text-white text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FF7B30 0%, #FF9A5C 100%)' }}
              >
                <span className="opacity-80 text-xs uppercase tracking-wide">Net Pay (Take Home)</span>
                <span className="text-xl font-bold">{fmt(viewPayslip.netPay)}</span>
              </div>

              {/* Preview area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <PayslipPreviewPanel ref={previewRef} payslip={viewPayslip} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SubModuleProtectedRoute>
  );
}
