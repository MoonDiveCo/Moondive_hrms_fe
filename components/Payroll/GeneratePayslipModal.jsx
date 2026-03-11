'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  previewPayslip,
  generatePayslip,
  getEmployeeSalaryStructure,
} from '@/services/payrollService';
import PayslipPreviewPanel from './PayslipPreviewPanel';

// ─────────────────────────────────────────────────────────────────────────────
// GeneratePayslipModal
//
// 3-step wizard:
//   Step 1 — Select Employee
//   Step 2 — Month Details + auto-computed breakdown (editable)
//   Step 3 — Review (PayslipPreviewPanel) + Save as Draft / Finalise
//
// Props:
//   open        – boolean
//   onClose     – fn
//   onSuccess   – fn(payslip)
//   employees   – [{_id, firstName, lastName, employeeId, ...}]
//   orgName     – string
//   orgLogo     – string | null
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = ['Select Employee', 'Month Details', 'Review & Generate'];
const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0);

export default function GeneratePayslipModal({
  open,
  onClose,
  onSuccess,
  employees = [],
  orgName = '',
  orgLogo = null,
}) {
  const [step, setStep] = useState(0);

  // Step 1
  const [empSearch, setEmpSearch]     = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [structure, setStructure]     = useState(null);
  const [loadingStruct, setLoadingStruct] = useState(false);

  // Step 2
  const now = new Date();
  const [month, setMonth]               = useState(now.getMonth() + 1);
  const [year, setYear]                 = useState(now.getFullYear());
  const [workingDays, setWorkingDays]   = useState(26);
  const [daysWorked, setDaysWorked]     = useState(26);
  const [lopDays, setLopDays]           = useState(0);
  const [overrides, setOverrides]       = useState({});
  const [preview, setPreview]           = useState(null);
  const [previewing, setPreviewing]     = useState(false);

  // Step 3
  const [notes, setNotes]             = useState('');
  const [generating, setGenerating]   = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const previewRef = useRef(null);

  const reset = () => {
    setStep(0);
    setEmpSearch('');
    setSelectedEmp(null);
    setStructure(null);
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    setWorkingDays(26);
    setDaysWorked(26);
    setLopDays(0);
    setOverrides({});
    setPreview(null);
    setNotes('');
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  // Load salary structure when employee is selected
  useEffect(() => {
    if (!selectedEmp) return;
    setLoadingStruct(true);
    getEmployeeSalaryStructure(selectedEmp._id)
      .then((res) => {
        const data = res.data?.result || res.data?.data || {};
        setStructure(data.active || null);
      })
      .catch(() => setStructure(null))
      .finally(() => setLoadingStruct(false));
  }, [selectedEmp]);

  // Auto-preview whenever month params or overrides change
  const runPreview = useCallback(async () => {
    if (!selectedEmp || !structure) return;
    setPreviewing(true);
    try {
      const res = await previewPayslip({
        employeeId: selectedEmp._id,
        salaryStructureId: structure._id,
        month,
        year,
        lopDays: parseInt(lopDays) || 0,
        workingDays: parseInt(workingDays) || 26,
        componentOverrides: overrides,
      });
      setPreview(res.data?.result || res.data?.data || null);
    } catch {
      // silent
    } finally {
      setPreviewing(false);
    }
  }, [selectedEmp, structure, month, year, lopDays, workingDays, overrides]);

  useEffect(() => {
    if (step !== 1) return;
    const t = setTimeout(runPreview, 500);
    return () => clearTimeout(t);
  }, [runPreview, step]);

  // ── Step navigation ──────────────────────────────────────────────────────
  const goToStep2 = () => {
    if (!selectedEmp) { toast.error('Please select an employee'); return; }
    if (!structure)   { toast.error('This employee has no active salary structure. Set one up first.'); return; }
    setStep(1);
  };

  const goToStep3 = () => {
    if (!preview) { toast.error('Preview is not available. Check salary structure.'); return; }
    setStep(2);
  };

  // ── Generate ────────────────────────────────────────────────────────────
  const handleGenerate = async (status) => {
    setGenerating(true);
    try {
      const res = await generatePayslip({
        employeeId: selectedEmp._id,
        salaryStructureId: structure._id,
        employeeName: `${selectedEmp.firstName || ''} ${selectedEmp.lastName || ''}`.trim(),
        employeeEmail: selectedEmp.companyEmail || selectedEmp.email || '',
        employeeCode: selectedEmp.employeeId || '',
        designation: selectedEmp.designation || selectedEmp.designationId?.name || '',
        department: selectedEmp.department || selectedEmp.departmentId?.name || '',
        month,
        year,
        lopDays: parseInt(lopDays) || 0,
        workingDays: parseInt(workingDays) || 26,
        daysWorked: parseInt(daysWorked) || parseInt(workingDays) || 26,
        componentOverrides: overrides,
        status,
        notes: notes || undefined,
      });
      const slip = res.data?.result || res.data?.data;
      toast.success(status === 'FINALISED' ? 'Payslip finalised' : 'Payslip saved as draft');
      onSuccess?.(slip);
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate payslip');
    } finally {
      setGenerating(false);
    }
  };

  // ── PDF Download ──────────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    setDownloadingPdf(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      const pdfWidth  = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Payslip_${selectedEmp?.employeeId || selectedEmp?._id}_${MONTHS[month]}_${year}.pdf`);
    } catch {
      toast.error('Could not generate PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (!open) return null;

  const filteredEmps = employees.filter((e) => {
    const q = empSearch.toLowerCase();
    return (
      e.firstName?.toLowerCase().includes(q) ||
      e.lastName?.toLowerCase().includes(q) ||
      e.employeeId?.toLowerCase().includes(q)
    );
  });

  const previewPayslipObj = preview
    ? {
        ...preview,
        employeeName: `${selectedEmp?.firstName || ''} ${selectedEmp?.lastName || ''}`.trim(),
        employeeCode: selectedEmp?.employeeId || '',
        designation: selectedEmp?.designationId?.name || '',
        department: selectedEmp?.departmentId?.name || '',
        payPeriod: `${MONTHS[month]} ${year}`,
        workingDays,
        daysWorked,
        lopDays,
      }
    : null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full mx-4 max-w-3xl my-4 flex flex-col max-h-[95vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h4 className="text-lg font-semibold text-primaryText">Generate Payslip</h4>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mt-1.5">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                    i < step  ? 'bg-primary text-white' :
                    i === step ? 'bg-orange-100 text-[#FF7B30] border border-[#FF7B30]' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-[11px] font-medium ${i === step ? 'text-[#FF7B30]' : 'text-gray-400'}`}>
                    {s}
                  </span>
                  {i < STEPS.length - 1 && <span className="text-gray-200 text-sm">›</span>}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md text-gray-400 hover:text-primaryText transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* ── Step 1: Select Employee ─────────────────────────── */}
          {step === 0 && (
            <div>
              <p className="text-sm text-primaryText mb-4">Search and select the employee to generate a payslip for.</p>
              <input
                type="text"
                placeholder="Search by name or employee ID…"
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {filteredEmps.slice(0, 30).map((e) => (
                  <button
                    key={e._id}
                    onClick={() => setSelectedEmp(e)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition ${
                      selectedEmp?._id === e._id
                        ? 'bg-orange-50 border border-orange-200 text-gray-900'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7B30] font-bold text-xs flex-shrink-0">
                      {e.firstName?.[0]}{e.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-blackText">{e.firstName} {e.lastName}</p>
                      <p className="text-xs text-gray-400 truncate">{e.employeeId} · {e.designationId?.name || '—'}</p>
                    </div>
                    {selectedEmp?._id === e._id && <CheckCircle size={16} className="text-[#FF7B30] flex-shrink-0" />}
                  </button>
                ))}
                {filteredEmps.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No employees found</p>
                )}
              </div>

              {selectedEmp && loadingStruct && (
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <Loader2 size={13} className="animate-spin" /> Checking salary structure…
                </div>
              )}
              {selectedEmp && !loadingStruct && !structure && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-3 text-sm text-amber-800">
                  <span>⚠️</span>
                  <span>
                    <strong>{selectedEmp.firstName}</strong> has no active salary structure.
                    Set one up in the Salary Structures tab first.
                  </span>
                </div>
              )}
              {selectedEmp && !loadingStruct && structure && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mt-3 text-sm text-green-800">
                  <CheckCircle size={14} className="flex-shrink-0" />
                  Active salary structure found — CTC ₹{fmt(structure.ctc)} (v{structure.version})
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Month Details ───────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
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
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    min={2020}
                    max={2099}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Working Days</label>
                  <input
                    type="number"
                    value={workingDays}
                    onChange={(e) => setWorkingDays(e.target.value)}
                    min={1} max={31}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">LOP Days</label>
                  <input
                    type="number"
                    value={lopDays}
                    onChange={(e) => setLopDays(e.target.value)}
                    min={0} max={workingDays}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {lopDays > 0 && preview && (
                    <p className="text-[11px] text-amber-600 mt-1 font-medium">
                      LOP deduction: ₹{fmt(preview.lopDeduction)}
                    </p>
                  )}
                </div>
              </div>

              {/* Per-component overrides */}
              {previewing && (
                <div className="space-y-2 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              )}
              {!previewing && preview && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Component Amounts <span className="text-gray-400 font-normal normal-case">(edit to override)</span>
                  </p>
                  <div className="space-y-2">
                    {[...preview.earnings, ...preview.deductions].map((c, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="flex-1 text-primaryText truncate">{c.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          c.type === 'EARNING' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                        }`}>{c.type}</span>
                        <input
                          type="number"
                          value={overrides[c.code] !== undefined ? overrides[c.code] : c.amount}
                          onChange={(e) =>
                            setOverrides((prev) => ({ ...prev, [c.code]: parseFloat(e.target.value) || 0 }))
                          }
                          className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm font-bold border-t border-gray-200 pt-3">
                    <span className="text-primaryText">Net Pay</span>
                    <span className="text-[#FF7B30] text-base">₹{fmt(preview.netPay)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Review ──────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                {previewPayslipObj && (
                  <div className="transform scale-75 origin-top-left" style={{ width: '133%' }}>
                    <PayslipPreviewPanel
                      ref={previewRef}
                      payslip={previewPayslipObj}
                      orgName={orgName}
                      orgLogo={orgLogo}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Notes (optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this payslip…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition text-primaryText"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition">
              Cancel
            </button>
            {step === 0 && (
              <button
                onClick={goToStep2}
                disabled={!selectedEmp || loadingStruct}
                className="px-5 py-2 text-sm bg-primary hover:bg-orange-600 text-white rounded-lg transition disabled:opacity-50 font-medium"
              >
                Next →
              </button>
            )}
            {step === 1 && (
              <button
                onClick={goToStep3}
                disabled={!preview || previewing}
                className="px-5 py-2 text-sm bg-primary hover:bg-orange-600 text-white rounded-lg transition disabled:opacity-50 font-medium"
              >
                Review →
              </button>
            )}
            {step === 2 && (
              <>
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 text-primaryText"
                >
                  {downloadingPdf ? 'Generating…' : 'Preview PDF'}
                </button>
                <button
                  onClick={() => handleGenerate('DRAFT')}
                  disabled={generating}
                  className="px-4 py-2 text-sm border border-orange-200 text-[#FF7B30] rounded-lg hover:bg-orange-50 transition disabled:opacity-50 font-medium"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleGenerate('FINALISED')}
                  disabled={generating}
                  className="px-5 py-2 text-sm bg-primary hover:bg-orange-600 text-white rounded-lg transition disabled:opacity-50 font-medium"
                >
                  {generating ? <span className="flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" /> Generating…</span> : 'Finalise Payslip'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
