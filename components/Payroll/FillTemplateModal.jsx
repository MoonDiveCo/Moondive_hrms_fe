'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X, Search, CheckCircle2, ChevronRight, ChevronLeft,
  Download, Send, Loader2, FileText, Zap, Tag,
  Mail, Info, Eye,
} from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  listPayslips,
  getTemplateParams,
  generateFromTemplate,
  sendFromTemplate,
} from '@/services/payrollService';

// ─────────────────────────────────────────────────────────────────────────────
// FillTemplateModal — 3-step modal
//
// Step 1: Pick a payslip (auto-fills employee/salary params)
// Step 2: Review auto-filled params + type manual ones
// Step 3: Live preview (docx-preview — renders headers/footers/letterhead)
//         → Download DOCX (exact branding) / PDF / Send email
//
// KEY: uses docx-preview (not mammoth) so Word headers, footers, and
// letterheads render correctly in the preview and PDF capture.
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: 'Select Payslip' },
  { n: 2, label: 'Fill Parameters' },
  { n: 3, label: 'Preview & Export' },
];

export default function FillTemplateModal({ template, onClose }) {
  const [step, setStep] = useState(1);

  // Step 1
  const [empSearch,   setEmpSearch]   = useState('');
  const [allPayslips, setAllPayslips] = useState([]);
  const [loadingPS,   setLoadingPS]   = useState(false);
  const [selectedPS,  setSelectedPS]  = useState(null);

  // Step 2
  const [resolvedParams, setResolvedParams] = useState({});
  const [manualKeys,     setManualKeys]     = useState([]);
  const [manualValues,   setManualValues]   = useState({});
  const [loadingParams,  setLoadingParams]  = useState(false);
  const [allParamKeys,   setAllParamKeys]   = useState([]);

  // Step 3
  const [generating,    setGenerating]    = useState(false);
  const [docxB64,       setDocxB64]       = useState('');
  const [filename,      setFilename]      = useState('payslip.docx');
  const [previewLoading,setPreviewLoading]= useState(false);
  const [toEmail,       setToEmail]       = useState('');
  const [emailSubject,  setEmailSubject]  = useState('');
  const [emailBody,     setEmailBody]     = useState('');
  const [sendFormat,    setSendFormat]    = useState('PDF'); // 'PDF' | 'DOCX'
  const [sending,       setSending]       = useState(false);
  const [pdfLoading,    setPdfLoading]    = useState(false);

  // docx-preview renders into this div — it preserves headers/footers/letterhead
  const previewRef = useRef(null);

  // ── Step 1: load payslips ────────────────────────────────────────────────
  const loadPayslips = useCallback(async () => {
    setLoadingPS(true);
    try {
      const res = await listPayslips({ limit: 100 });
      const data = res.data?.result || res.data?.data || {};
      setAllPayslips(data.docs || []);
    } catch {
      toast.error('Could not load payslips');
    } finally {
      setLoadingPS(false);
    }
  }, []);

  useEffect(() => { loadPayslips(); }, [loadPayslips]);

  const filteredPayslips = empSearch.trim()
    ? allPayslips.filter((p) =>
        (p.employeeName || '').toLowerCase().includes(empSearch.toLowerCase()) ||
        (p.employeeCode || '').toLowerCase().includes(empSearch.toLowerCase())
      )
    : allPayslips;

  // ── Step 2: resolve params from backend ─────────────────────────────────
  const resolveParams = useCallback(async () => {
    if (!template?._id) return;
    setLoadingParams(true);
    try {
      const res = await getTemplateParams(template._id, selectedPS?._id);
      const data = res.data?.result || res.data?.data || {};
      setAllParamKeys(data.detectedKeys || []);
      setResolvedParams(data.auto || {});
      setManualKeys(data.manual || []);
      const init = {};
      (data.manual || []).forEach((k) => { init[k] = ''; });
      setManualValues(init);
    } catch {
      toast.error('Could not resolve template parameters');
    } finally {
      setLoadingParams(false);
    }
  }, [template?._id, selectedPS?._id]);

  useEffect(() => {
    if (step === 2) resolveParams();
  }, [step, resolveParams]);

  // ── Step 3: generate filled DOCX ────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Merge: auto-resolved overrides take values from the editable green boxes
      const mergedManual = { ...manualValues };
      // Any auto-resolved field the user edited in the green boxes is already
      // stored in manualValues keyed by the same key, so this just works.
      Object.entries(resolvedParams).forEach(([key, val]) => {
        if (mergedManual[key] === undefined) mergedManual[key] = val;
      });

      const res = await generateFromTemplate(template._id, {
        payslipId:    selectedPS?._id || null,
        manualParams: mergedManual,
      });
      const data = res.data?.result || res.data?.data || {};
      const b64  = data.docxBase64 || '';
      const fname = data.filename || 'payslip.docx';
      setDocxB64(b64);
      setFilename(fname);

      setToEmail(selectedPS?.employeeEmail || '');
      setEmailSubject(`Your Payslip — ${selectedPS?.payPeriod || 'Monthly'}`);
      setEmailBody(`Dear ${selectedPS?.employeeName || 'Employee'},\n\nPlease find your payslip attached.\n\nRegards,\nHR Team`);

      setStep(3);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not generate document');
    } finally {
      setGenerating(false);
    }
  };

  // ── Render docx-preview into the ref div (runs after step → 3) ──────────
  // Uses docx-preview which renders headers, footers, and letterheads correctly.
  useEffect(() => {
    if (step !== 3 || !docxB64) return;

    let cancelled = false;
    const render = async () => {
      if (!previewRef.current) return;
      setPreviewLoading(true);
      try {
        // Dynamic import so this browser-only lib is never bundled for SSR
        const { renderAsync } = await import('docx-preview');
        const arrayBuf = Uint8Array.from(atob(docxB64), (c) => c.charCodeAt(0)).buffer;
        if (cancelled) return;
        previewRef.current.innerHTML = '';
        await renderAsync(arrayBuf, previewRef.current, null, {
          renderHeaders:  true,
          renderFooters:  true,
          renderFootnotes: true,
          breakPages:     true,
          ignoreWidth:    false,
          ignoreHeight:   false,
          trimXmlDeclaration: true,
        });
      } catch (err) {
        console.error('docx-preview error:', err);
        if (!cancelled && previewRef.current) {
          previewRef.current.innerHTML =
            '<p style="color:#999;padding:24px;font-size:13px">Preview unavailable — download DOCX to view.</p>';
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    };

    render();
    return () => { cancelled = true; };
  }, [step, docxB64]);

  // ── Download DOCX ────────────────────────────────────────────────────────
  const handleDownloadDocx = () => {
    if (!docxB64) return;
    const byteArr = Uint8Array.from(atob(docxB64), (c) => c.charCodeAt(0));
    const blob = new Blob([byteArr], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Download PDF — captures the docx-preview div (headers/footers included)
  const handleDownloadPdf = async () => {
    if (!previewRef.current || previewLoading) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      const pw  = pdf.internal.pageSize.getWidth();
      const ph  = (canvas.height * pw) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pw, ph);
      pdf.save(filename.replace(/\.docx$/i, '.pdf'));
    } catch {
      toast.error('Could not generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Send email ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!toEmail.trim())      return toast.error('Recipient email is required');
    if (!emailSubject.trim()) return toast.error('Subject is required');
    setSending(true);
    try {
      const mergedManual = { ...manualValues };
      Object.entries(resolvedParams).forEach(([key, val]) => {
        if (mergedManual[key] === undefined) mergedManual[key] = val;
      });

      let pdfBase64 = null;
      if (sendFormat === 'PDF' && previewRef.current) {
        const canvas  = await html2canvas(previewRef.current, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf     = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
        const pw      = pdf.internal.pageSize.getWidth();
        const ph      = (canvas.height * pw) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pw, ph);
        pdfBase64 = pdf.output('datauristring').split(',')[1];
      }

      await sendFromTemplate(template._id, {
        payslipId:        selectedPS?._id || null,
        manualParams:     mergedManual,
        to:               toEmail.trim(),
        subject:          emailSubject.trim(),
        body:             emailBody.trim(),
        attachmentFormat: sendFormat,
        pdfBase64,
      });
      toast.success(`Payslip sent to ${toEmail}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col my-4 max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-primaryText">{template.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Generate payslip document from your branded template</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const done   = step > s.n;
              const active = step === s.n;
              return (
                <div key={s.n} className="flex items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      done   ? 'bg-primary text-white' :
                      active ? 'bg-orange-100 text-[#FF7B30] border-2 border-[#FF7B30]' :
                               'bg-gray-100 text-gray-400'
                    }`}>
                      {done ? <CheckCircle2 size={12} /> : s.n}
                    </div>
                    <span className={`text-xs font-medium ${active ? 'text-[#FF7B30]' : done ? 'text-primaryText' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && <div className="h-px bg-gray-200 w-6 mx-1" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── STEP 1: Select Payslip ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="p-6 space-y-4">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-start gap-2">
                <Info size={13} className="text-[#FF7B30] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-primaryText">
                  Select a payslip to auto-fill employee name, salary, and pay details into your template.
                  Or proceed without selecting to fill everything manually.
                </p>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  placeholder="Search by employee name or ID…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                {loadingPS ? (
                  <div className="flex items-center justify-center h-20 text-sm text-primaryText">
                    <Loader2 size={15} className="animate-spin mr-2 text-[#FF7B30]" /> Loading…
                  </div>
                ) : filteredPayslips.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-20 text-xs text-primaryText">
                    <FileText size={18} className="text-gray-300 mb-1" /> No payslips found
                  </div>
                ) : (
                  filteredPayslips.map((p) => {
                    const isSelected = selectedPS?._id === p._id;
                    return (
                      <button
                        key={p._id}
                        onClick={() => setSelectedPS(isSelected ? null : p)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-100 last:border-0 transition-colors ${
                          isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-[#FF7B30] text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {(p.employeeName || '?')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blackText truncate">{p.employeeName}</p>
                          <p className="text-xs text-primaryText">{p.payPeriod} · {p.designation || ''}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-[#FF7B30]">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p.netPay || 0)}
                          </p>
                          <p className="text-[10px] text-primaryText">Net Pay</p>
                        </div>
                        {isSelected && <CheckCircle2 size={15} className="text-[#FF7B30] flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>

              {selectedPS ? (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-xs text-green-700 flex items-center gap-2">
                  <CheckCircle2 size={13} />
                  <span><strong>{selectedPS.employeeName}</strong> — {selectedPS.payPeriod} selected</span>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center">No payslip selected — you can fill all fields manually</p>
              )}
            </div>
          )}

          {/* ── STEP 2: Fill Parameters ────────────────────────────────────── */}
          {step === 2 && (
            <div className="p-6 space-y-4">
              {loadingParams ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 size={20} className="animate-spin text-[#FF7B30] mr-2" />
                  <span className="text-sm text-primaryText">Resolving parameters…</span>
                </div>
              ) : (
                <>
                  {/* Auto-filled (editable overrides) */}
                  {Object.keys(resolvedParams).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-primaryText mb-2 flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-green-500" />
                        Auto-filled from payslip ({Object.keys(resolvedParams).length})
                        <span className="font-normal text-gray-400 ml-1">— click to override</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(resolvedParams).map(([key, val]) => (
                          <div key={key} className="bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                            <p className="text-[10px] text-green-600 font-mono mb-0.5">{`{{${key}}}`}</p>
                            <input
                              value={manualValues[key] !== undefined ? manualValues[key] : val}
                              onChange={(e) => setManualValues((prev) => ({ ...prev, [key]: e.target.value }))}
                              className="w-full text-xs text-blackText font-medium bg-transparent border-none outline-none focus:ring-0 p-0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual fields */}
                  {manualKeys.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-primaryText mb-2 flex items-center gap-1.5">
                        <Tag size={12} className="text-[#FF7B30]" />
                        Manual input required ({manualKeys.length})
                      </p>
                      <div className="space-y-2">
                        {manualKeys.map((key) => (
                          <div key={key}>
                            <label className="text-[10px] font-mono text-[#FF7B30] block mb-1">{`{{${key}}}`}</label>
                            <input
                              value={manualValues[key] || ''}
                              onChange={(e) => setManualValues((prev) => ({ ...prev, [key]: e.target.value }))}
                              placeholder={`Enter value for ${key.replace(/_/g, ' ')}`}
                              className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-blackText"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {allParamKeys.length === 0 && (
                    <div className="text-center py-10 text-xs text-gray-400">
                      <Tag size={22} className="mx-auto mb-2 text-gray-300" />
                      No {'{{placeholders}}'} detected in this template.
                      <br />You can still generate and download it.
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── STEP 3: Preview & Export ────────────────────────────────────── */}
          {step === 3 && (
            <div className="p-5 space-y-4">
              {/* Live document preview — docx-preview renders headers/footers/letterhead */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                  <Eye size={12} className="text-primaryText" />
                  <span className="text-xs font-medium text-primaryText">
                    Document preview — your letterhead & formatting preserved
                  </span>
                  {previewLoading && (
                    <Loader2 size={12} className="animate-spin text-[#FF7B30] ml-auto" />
                  )}
                </div>
                {/* docx-preview renders INTO this div, including headers/footers */}
                <div className="max-h-64 overflow-y-auto bg-gray-100 flex justify-center py-3">
                  <div
                    ref={previewRef}
                    className="bg-white shadow-sm"
                    style={{ minWidth: '500px', maxWidth: '700px' }}
                  />
                </div>
              </div>

              {/* Download row */}
              <div>
                <p className="text-xs font-semibold text-primaryText uppercase tracking-wide mb-2.5">Download</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadDocx}
                    className="flex items-center justify-center gap-2 py-3 border-2 border-[#FF7B30] text-[#FF7B30] rounded-xl hover:bg-orange-50 transition-colors text-sm font-medium"
                  >
                    <FileText size={16} />
                    DOCX
                    <span className="text-[10px] font-normal opacity-70 ml-0.5">(full branding)</span>
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading || previewLoading}
                    className="flex items-center justify-center gap-2 py-3 bg-primary hover:bg-orange-600 text-white rounded-xl transition-colors text-sm font-medium disabled:opacity-60"
                  >
                    {pdfLoading ? (
                      <><Loader2 size={15} className="animate-spin" /> Generating…</>
                    ) : (
                      <><Download size={15} /> PDF</>
                    )}
                  </button>
                </div>
              </div>

              {/* Send via email */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-primaryText uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Mail size={12} /> Send via Email
                </p>

                {/* Format selector */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { val: 'PDF',  label: 'PDF',  desc: 'Universal, print-ready' },
                    { val: 'DOCX', label: 'DOCX', desc: 'Editable Word format'   },
                  ].map(({ val, label, desc }) => (
                    <button
                      key={val}
                      onClick={() => setSendFormat(val)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 text-left transition-all ${
                        sendFormat === val
                          ? 'border-[#FF7B30] bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {val === 'PDF'
                        ? <Download size={14} className={sendFormat === val ? 'text-[#FF7B30]' : 'text-gray-400'} />
                        : <FileText  size={14} className={sendFormat === val ? 'text-[#FF7B30]' : 'text-gray-400'} />
                      }
                      <div>
                        <p className={`text-xs font-semibold ${sendFormat === val ? 'text-[#FF7B30]' : 'text-gray-700'}`}>{label}</p>
                        <p className="text-[10px] text-gray-400">{desc}</p>
                      </div>
                      {sendFormat === val && <CheckCircle2 size={12} className="text-[#FF7B30] ml-auto" />}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs text-primaryText block mb-1">Recipient Email</label>
                      <input
                        type="email"
                        value={toEmail}
                        onChange={(e) => setToEmail(e.target.value)}
                        placeholder="employee@company.com"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-primaryText block mb-1">Subject</label>
                      <input
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Your Payslip — March 2026"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-primaryText block mb-1">Message (optional)</label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={sending || !toEmail.trim() || (sendFormat === 'PDF' && previewLoading)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    {sending ? (
                      <><Loader2 size={14} className="animate-spin" /> Sending…</>
                    ) : (
                      <><Send size={14} /> Send as {sendFormat}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-primaryText"
          >
            <ChevronLeft size={14} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-5 py-2 text-sm bg-primary hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              {selectedPS ? 'Next — Fill Parameters' : 'Skip — Fill Manually'}
              <ChevronRight size={14} />
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleGenerate}
              disabled={generating || loadingParams}
              className="flex items-center gap-1.5 px-5 py-2 text-sm bg-primary hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-60"
            >
              {generating ? (
                <><Loader2 size={14} className="animate-spin" /> Generating…</>
              ) : (
                <><Zap size={14} /> Generate Document</>
              )}
            </button>
          )}

          {step === 3 && (
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-primaryText rounded-lg transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
