'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { X, User, CheckCircle, Send, Download, FileText, Eye, Loader2, Maximize2, Minimize2, ZoomIn, ZoomOut, Info } from 'lucide-react';
import apiClient from '@/lib/axiosClient';
import { resolveParameters, generateDocument, sendDocument } from '@/services/hrDocsService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const STEPS = ['Select Employee', 'Fill Parameters', 'Preview & Send'];

const isLetterheadHtml = (val) => typeof val === 'string' && val.trimStart().startsWith('<');
const isDocxTemplate   = (tmpl) => tmpl?.templateType === 'DOCX';

export default function GenerateDocModal({ open, template, onClose, onSuccess }) {
  const [step,             setStep]             = useState(0);
  const [isNewJoiner,      setIsNewJoiner]      = useState(false);
  const [employees,        setEmployees]        = useState([]);
  const [employeeSearch,   setEmployeeSearch]   = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [paramValues,      setParamValues]      = useState({});
  const [resolvedValues,   setResolvedValues]   = useState({});
  const [parameters,       setParameters]       = useState([]);
  const [resolving,        setResolving]        = useState(false);
  const [generating,       setSaving]           = useState(false);
  const [generatedDoc,     setGeneratedDoc]     = useState(null);
  const [sendModalOpen,    setSendModalOpen]    = useState(false);
  const [emailForm,        setEmailForm]        = useState({ to: '', subject: '', body: '' });
  const [sendFormat,       setSendFormat]       = useState('PDF'); // 'PDF' | 'DOCX'
  const [sending,           setSending]           = useState(false);
  const [docxPreviewReady,  setDocxPreviewReady]  = useState(false);
  const [downloadingPdf,    setDownloadingPdf]    = useState(false);
  const [newJoinerForm,     setNewJoinerForm]     = useState({ name: '', email: '' });
  const [previewZoom,       setPreviewZoom]       = useState(100);   // percentage
  const [isFullscreen,      setIsFullscreen]      = useState(false);

  // previewRef    → QUILL HTML div (used for PDF capture for QUILL templates)
  // docxPreviewRef → docx-preview div (fallback if server PDF unavailable)
  const previewRef     = useRef(null);
  const docxPreviewRef = useRef(null);

  // ── Fetch employees ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    apiClient.get('hrms/employee/list')
      .then((res) => setEmployees(res.data?.result || res.data?.data || []))
      .catch(() => {});
  }, [open]);

  // ── Reset on open ───────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setStep(0);
      setIsNewJoiner(false);
      setSelectedEmployee(null);
      setParamValues({});
      setResolvedValues({});
      setGeneratedDoc(null);
      setNewJoinerForm({ name: '', email: '' });
      setSendFormat('PDF');
    }
  }, [open]);

  // ── Select employee ─────────────────────────────────────────────────────
  const handleEmployeeSelect = async (emp) => {
    setSelectedEmployee(emp);
    setResolving(true);
    try {
      const res = await resolveParameters(template._id, emp._id);
      const data = res.data?.result || res.data?.data || {};
      setParameters(data.parameters || template.parameters || []);
      setResolvedValues(data.resolvedValues || {});
      setParamValues(data.resolvedValues || {});
      setEmailForm((prev) => ({
        ...prev,
        to: emp.email || '',
        subject: `${template.name} — ${emp.firstName} ${emp.lastName}`,
      }));
    } catch {
      toast.error('Could not resolve parameters');
    } finally {
      setResolving(false);
    }
  };

  const handleNewJoinerMode = () => {
    setIsNewJoiner(true);
    setSelectedEmployee(null);
    const params = template.parameters || [];
    setParameters(params);
    const blanks = {};
    params.forEach((p) => { blanks[p.key] = p.defaultValue || ''; });
    setParamValues(blanks);
    setResolvedValues({});
    setEmailForm((prev) => ({ ...prev, subject: template.name || '' }));
  };

  const isSystemAutoFilled = (key) =>
    resolvedValues[key] !== undefined && resolvedValues[key] !== '';

  // ── Generate document ───────────────────────────────────────────────────
  const handleGenerate = async () => {
    const missing = parameters
      .filter((p) => p.required && !paramValues[p.key]?.trim())
      .map((p) => p.label || p.key);
    if (missing.length > 0) { toast.error(`Please fill: ${missing.join(', ')}`); return; }

    const employeeName  = isNewJoiner
      ? newJoinerForm.name
      : `${selectedEmployee.firstName} ${selectedEmployee.lastName || ''}`;
    const employeeEmail = isNewJoiner ? newJoinerForm.email : selectedEmployee.email;
    if (!employeeName.trim()) { toast.error('Employee name is required'); return; }

    try {
      setSaving(true);
      const res = await generateDocument({
        templateId: template._id,
        employeeId: isNewJoiner ? null : selectedEmployee._id,
        employeeName,
        employeeEmail: employeeEmail || null,
        parameterValues: paramValues,
      });
      const doc = res.data?.result || res.data?.data;
      setGeneratedDoc(doc);
      setStep(2);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate document');
    } finally {
      setSaving(false);
    }
  };

  // ── Render docx-preview when arriving at step 2 with a DOCX doc ─────────
  useEffect(() => {
    if (step !== 2 || !isDocxTemplate(template) || !generatedDoc?.docxBase64) return;
    const t = setTimeout(() => renderDocxPreview(), 50);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, generatedDoc?.docxBase64]);

  // ── docx-preview renderer ─────────────────────────────────────────────────
  const renderDocxPreview = useCallback(async () => {
    if (!generatedDoc?.docxBase64 || !docxPreviewRef.current) return;
    setDocxPreviewReady(false);
    try {
      const { renderAsync } = await import('docx-preview');
      const binary = atob(generatedDoc.docxBase64);
      const bytes  = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      docxPreviewRef.current.innerHTML = '';
      await renderAsync(bytes.buffer, docxPreviewRef.current, null, {
        className: 'docx-preview',
        inWrapper: false,
        ignoreWidth: true,
        renderHeaders: true,
        renderFooters: true,
        renderFootnotes: true,
        breakPages: true,
        useBase64URL: true,
      });
      setDocxPreviewReady(true);
    } catch (err) {
      console.error('docx-preview fallback error:', err);
    }
  }, [generatedDoc?.docxBase64]);

  // ── Download .docx ──────────────────────────────────────────────────────
  const handleDownloadDocx = () => {
    if (!generatedDoc?.docxBase64) return;
    const binary = atob(generatedDoc.docxBase64);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    const name = (generatedDoc?.employeeName || 'document').replace(/\s+/g, '_');
    a.download = `${template.category}_${name}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Build PDF from the correct element (DOCX → docxPreviewRef, QUILL → previewRef) ──
  const buildPdf = async (el) => {
    const canvas  = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#fff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf     = new jsPDF('p', 'mm', 'a4');
    const pageW   = pdf.internal.pageSize.getWidth();
    const pageH   = pdf.internal.pageSize.getHeight();
    const imgH    = (canvas.height * pageW) / canvas.width;
    let heightLeft = imgH;
    let position   = 0;
    pdf.addImage(imgData, 'PNG', 0, position, pageW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pageW, imgH);
      heightLeft -= pageH;
    }
    return pdf;
  };

  // Returns the correct ref element based on template type
  const getPreviewEl = () =>
    isDocxTemplate(template) ? docxPreviewRef.current : previewRef.current;

  // ── Download PDF ────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    const el = getPreviewEl();
    if (!el || downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      const pdf  = await buildPdf(el);
      const name = (generatedDoc?.employeeName || 'document').replace(/\s+/g, '_');
      pdf.save(`${template.category}_${name}.pdf`);
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // ── Send email ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!emailForm.to)      return toast.error('Recipient email is required');
    if (!emailForm.subject) return toast.error('Subject is required');

    try {
      setSending(true);
      const name = (generatedDoc?.employeeName || 'document').replace(/\s+/g, '_');

      let pdfBase64  = null;
      let docxBase64 = null;

      if (sendFormat === 'PDF') {
        const el = getPreviewEl();
        if (el) {
          const pdf = await buildPdf(el);
          pdfBase64 = pdf.output('datauristring').split(',')[1];
        }
      } else {
        // DOCX format
        docxBase64 = generatedDoc?.docxBase64 || null;
      }

      await sendDocument(generatedDoc._id, {
        to:               emailForm.to,
        subject:          emailForm.subject,
        body:             emailForm.body,
        pdfBase64,
        docxBase64,
        attachmentFormat: sendFormat,
        fileName:         `${template.category}_${name}.${sendFormat === 'DOCX' ? 'docx' : 'pdf'}`,
      });

      toast.success('Document sent successfully!');
      setSendModalOpen(false);
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send document');
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  const filteredEmployees = employees.filter((e) => {
    const q = employeeSearch.toLowerCase();
    return (
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.employeeId?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h4 className="font-semibold text-gray-900">Generate Document</h4>
              <p className="text-xs text-gray-400 mt-0.5">{template?.name}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP INDICATOR */}
          <div className="flex items-center gap-2 px-6 py-3 border-b bg-gray-50">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${i <= step ? 'text-[#FF7B30]' : 'text-gray-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < step  ? 'bg-[#FF7B30] text-white'
                    : i === step ? 'bg-orange-100 text-[#FF7B30] border-2 border-[#FF7B30]'
                    : 'bg-gray-200 text-gray-500'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  {s}
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-[#FF7B30]' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* STEP 0: Select Employee */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => { setIsNewJoiner(false); setSelectedEmployee(null); }}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      !isNewJoiner ? 'border-[#FF7B30] bg-orange-50 text-[#FF7B30]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <User className="w-4 h-4 mx-auto mb-1" />
                    Existing Employee
                  </button>
                  <button
                    onClick={handleNewJoinerMode}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      isNewJoiner ? 'border-[#FF7B30] bg-orange-50 text-[#FF7B30]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <User className="w-4 h-4 mx-auto mb-1" />
                    New Joiner
                  </button>
                </div>

                {!isNewJoiner ? (
                  <div>
                    <input
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      placeholder="Search by name, email, or ID..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                      {filteredEmployees.slice(0, 20).map((emp) => (
                        <button
                          key={emp._id}
                          onClick={() => handleEmployeeSelect(emp)}
                          className={`w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center justify-between transition-colors ${
                            selectedEmployee?._id === emp._id ? 'bg-orange-50' : ''
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-gray-400">
                              {emp.designationId?.name || emp.designation || '—'} · {emp.departmentId?.name || emp.department || '—'}
                            </p>
                          </div>
                          {selectedEmployee?._id === emp._id && <CheckCircle className="w-4 h-4 text-[#FF7B30]" />}
                        </button>
                      ))}
                      {filteredEmployees.length === 0 && (
                        <p className="text-center text-sm text-gray-400 py-6">No employees found</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      New joiner is not yet in the system — you'll fill all fields manually.
                    </p>
                    <input
                      value={newJoinerForm.name}
                      onChange={(e) => setNewJoinerForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Full Name *"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                      value={newJoinerForm.email}
                      onChange={(e) => setNewJoinerForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="Email address"
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 1: Fill Parameters */}
            {step === 1 && (
              <div className="space-y-4">
                {resolving ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-[#FF7B30] border-t-transparent rounded-full animate-spin" />
                    <span className="ml-3 text-sm text-gray-500">Resolving parameters...</span>
                  </div>
                ) : (
                  <>
                    {parameters.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        This template has no parameters. Ready to generate!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {!isNewJoiner && parameters.some((p) => isSystemAutoFilled(p.key)) && (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" /> Auto-filled from employee record
                            </p>
                            {parameters.filter((p) => isSystemAutoFilled(p.key)).map((param) => (
                              <div key={param.key}>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">{param.label || param.key}</label>
                                <input
                                  value={paramValues[param.key] || ''}
                                  onChange={(e) => setParamValues((prev) => ({ ...prev, [param.key]: e.target.value }))}
                                  className="w-full border border-green-300 bg-green-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        {parameters.filter((p) => !isSystemAutoFilled(p.key) || isNewJoiner).map((param) => (
                          <div key={param.key}>
                            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1.5 block">
                              {param.label || param.key}
                              {param.required && <span className="text-red-400">*</span>}
                              <span className="text-xs text-gray-400 font-normal font-mono">{`{{${param.key}}}`}</span>
                            </label>
                            <input
                              value={paramValues[param.key] || ''}
                              onChange={(e) => setParamValues((prev) => ({ ...prev, [param.key]: e.target.value }))}
                              placeholder={param.placeholder || `Enter ${param.label || param.key}`}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* STEP 2: Preview & Actions */}
            {step === 2 && generatedDoc && (
              <div className="space-y-3">
                {/* Actions bar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{generatedDoc.employeeName}</p>
                    <p className="text-xs text-gray-400">{generatedDoc.templateCategory?.replace(/_/g, ' ')}</p>
                  </div>

                  {/* DOCX templates get both buttons; QUILL gets PDF only */}
                  {isDocxTemplate(template) && (
                    <button
                      onClick={handleDownloadDocx}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FileText className="w-4 h-4" />
                      Download .docx
                    </button>
                  )}

                  {/* Download PDF — works for both DOCX (docxPreviewRef) and QUILL (previewRef) */}
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloadingPdf || (isDocxTemplate(template) && !docxPreviewReady)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {downloadingPdf ? (
                      <><div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> Generating...</>
                    ) : (
                      <><Download className="w-4 h-4" /> Download PDF</>
                    )}
                  </button>

                  <button
                    onClick={() => setSendModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FF7B30] text-white text-sm font-medium hover:bg-[#ff6a1a]"
                  >
                    <Send className="w-4 h-4" />
                    Send via Email
                  </button>
                </div>

                {/* Document preview */}
                <div
                  className="rounded-xl overflow-hidden border border-gray-200"
                  style={{
                    height: isFullscreen ? '78vh' : '58vh',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#e5e7eb',
                  }}
                >
                  {/* Toolbar: zoom + fullscreen (only for DOCX) */}
                  {isDocxTemplate(template) && (
                    <div
                      style={{
                        position: 'absolute', top: 8, right: 8, zIndex: 20,
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: 'rgba(255,255,255,0.95)',
                        boxShadow: '0 1px 8px rgba(0,0,0,0.12)',
                        borderRadius: 10,
                        padding: '4px 8px',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <button
                        onClick={() => setPreviewZoom((z) => Math.max(50, z - 25))}
                        style={{ padding: '2px 6px', cursor: 'pointer', background: 'none', border: 'none', color: '#555', borderRadius: 4, display: 'flex', alignItems: 'center' }}
                        title="Zoom out"
                      >
                        <ZoomOut size={14} />
                      </button>
                      <span style={{ fontSize: 12, color: '#555', minWidth: 38, textAlign: 'center' }}>{previewZoom}%</span>
                      <button
                        onClick={() => setPreviewZoom((z) => Math.min(200, z + 25))}
                        style={{ padding: '2px 6px', cursor: 'pointer', background: 'none', border: 'none', color: '#555', borderRadius: 4, display: 'flex', alignItems: 'center' }}
                        title="Zoom in"
                      >
                        <ZoomIn size={14} />
                      </button>
                      <div style={{ width: 1, height: 16, background: '#ddd', margin: '0 4px' }} />
                      <button
                        onClick={() => setIsFullscreen((f) => !f)}
                        style={{ padding: '2px 6px', cursor: 'pointer', background: 'none', border: 'none', color: '#555', borderRadius: 4, display: 'flex', alignItems: 'center' }}
                        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                      >
                        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                      </button>
                    </div>
                  )}

                  {/* Scrollable content area */}
                  <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                    {isDocxTemplate(template) ? (
                      <>
                        <div style={{ margin: '12px 12px 0', padding: '10px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
                          <Info size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                          <p style={{ fontSize: 12, color: '#1e40af', margin: 0 }}>
                            This is an approximate preview. Download the .docx file for the exact design with all backgrounds and formatting.
                          </p>
                        </div>
                        <div style={{ padding: '16px 12px' }}>
                          {!docxPreviewReady && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: 8 }}>
                              <div className="w-5 h-5 border-2 border-[#FF7B30] border-t-transparent rounded-full animate-spin" />
                              <span style={{ fontSize: 13, color: '#888' }}>Rendering document…</span>
                            </div>
                          )}
                          <div
                            style={{
                              transformOrigin: 'top center',
                              transform: `scale(${previewZoom / 100})`,
                              width: `${10000 / previewZoom}%`,
                              transition: 'transform 0.15s ease',
                            }}
                          >
                            <div ref={docxPreviewRef} className="docx-gen-preview" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <style>{`
                          .md-doc-content { word-wrap: break-word; overflow-wrap: break-word; }
                          .md-doc-content * { background-color: transparent !important; background: transparent !important; }
                          .md-doc-content p, .md-doc-content span, .md-doc-content li { overflow-wrap: break-word !important; word-break: break-word !important; }
                          .md-doc-content img { max-width: 100% !important; height: auto !important; }
                          .md-doc-content table { max-width: 100% !important; table-layout: fixed !important; border-collapse: collapse; }
                          .md-doc-content td, .md-doc-content th { word-break: break-word !important; }
                          .md-doc-content pre { white-space: pre-wrap !important; }
                        `}</style>
                        <div
                          ref={previewRef}
                          style={{
                            width: '100%', maxWidth: '210mm', minHeight: '297mm', margin: '0 auto',
                            backgroundColor: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                            fontFamily: 'Arial, sans-serif', overflowX: 'hidden',
                          }}
                        >
                          {template?.letterheadDataUrl ? (
                            isLetterheadHtml(template.letterheadDataUrl) ? (
                              <div dangerouslySetInnerHTML={{ __html: template.letterheadDataUrl }} />
                            ) : (
                              <img src={template.letterheadDataUrl} alt="Company Letterhead" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            )
                          ) : (
                            <div style={{ padding: '10mm 20mm 6mm', borderBottom: '2px solid #FF7B30' }}>
                              <p style={{ margin: 0, fontSize: '16pt', fontWeight: 700, color: '#0D1B2A' }}>
                                {generatedDoc.templateCategory?.replace(/_/g, ' ')}
                              </p>
                            </div>
                          )}
                          <div
                            className="md-doc-content prose prose-sm max-w-none"
                            style={{ padding: '8mm 20mm 20mm', fontSize: '11pt', lineHeight: 1.8, color: '#111827' }}
                            dangerouslySetInnerHTML={{ __html: generatedDoc.generatedContent }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="border-t px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => step > 0 ? setStep((s) => s - 1) : onClose()}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
            {step === 0 && (
              <button
                onClick={() => setStep(1)}
                disabled={!isNewJoiner && !selectedEmployee}
                className="px-5 py-2 rounded-lg bg-[#FF7B30] text-white text-sm font-medium hover:bg-[#ff6a1a] disabled:opacity-40"
              >
                Continue
              </button>
            )}
            {step === 1 && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-5 py-2 rounded-lg bg-[#FF7B30] text-white text-sm font-medium hover:bg-[#ff6a1a] disabled:opacity-40"
              >
                {generating ? 'Generating...' : 'Generate Document'}
              </button>
            )}
            {step === 2 && (
              <button
                onClick={onSuccess}
                className="px-5 py-2 rounded-lg bg-[#FF7B30] text-white text-sm font-medium hover:bg-[#ff6a1a]"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── EMAIL SEND MODAL ────────────────────────────────────────────── */}
      {sendModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col my-4">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h5 className="font-semibold text-gray-900">Send Document via Email</h5>
              <button onClick={() => setSendModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: '75vh' }}>

              {/* Format selector */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Send as</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'PDF',  label: 'PDF',  desc: 'Universal, print-ready', icon: Download },
                    { val: 'DOCX', label: 'DOCX', desc: 'Editable Word format',   icon: FileText },
                  ].map(({ val, label, desc, icon: Icon }) => (
                    <button
                      key={val}
                      onClick={() => setSendFormat(val)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                        sendFormat === val
                          ? 'border-[#FF7B30] bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${sendFormat === val ? 'text-[#FF7B30]' : 'text-gray-500'}`} />
                      <div>
                        <p className={`text-sm font-semibold ${sendFormat === val ? 'text-[#FF7B30]' : 'text-gray-700'}`}>{label}</p>
                        <p className="text-[11px] text-gray-400">{desc}</p>
                      </div>
                      {sendFormat === val && <CheckCircle className="w-4 h-4 text-[#FF7B30] ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document preview before sending */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">
                    Preview — what will be sent as {sendFormat}
                  </span>
                </div>
                <div
                  className="overflow-y-auto bg-gray-100 flex justify-center py-3"
                  style={{ maxHeight: '220px' }}
                >
                  {isDocxTemplate(template) ? (
                    <div className="bg-white shadow-sm" style={{ minWidth: '440px', maxWidth: '600px' }}>
                      {/* Reuse the already-rendered docx-preview by cloning its content */}
                      <div
                        className="docx-gen-preview"
                        style={{ transform: 'scale(0.7)', transformOrigin: 'top left', width: '143%' }}
                        dangerouslySetInnerHTML={{
                          __html: docxPreviewRef.current?.innerHTML || '<p style="padding:16px;color:#aaa;font-size:13px">Loading preview…</p>',
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{ width: '440px', background: 'white', padding: '12px 20px', fontSize: '9pt', lineHeight: 1.6, boxShadow: '0 2px 8px rgba(0,0,0,.1)', transform: 'scale(0.85)', transformOrigin: 'top center' }}
                    >
                      {template?.letterheadDataUrl && (
                        isLetterheadHtml(template.letterheadDataUrl)
                          ? <div dangerouslySetInnerHTML={{ __html: template.letterheadDataUrl }} />
                          : <img src={template.letterheadDataUrl} alt="Letterhead" style={{ width: '100%', display: 'block' }} />
                      )}
                      <div dangerouslySetInnerHTML={{ __html: generatedDoc?.generatedContent || '' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Email fields */}
              <input
                value={emailForm.to}
                onChange={(e) => setEmailForm((p) => ({ ...p, to: e.target.value }))}
                placeholder="Recipient email *"
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                value={emailForm.subject}
                onChange={(e) => setEmailForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Subject *"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <textarea
                rows={2}
                value={emailForm.body}
                onChange={(e) => setEmailForm((p) => ({ ...p, body: e.target.value }))}
                placeholder={`Email body (optional — document will be attached as ${sendFormat})`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setSendModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="flex-1 py-2.5 rounded-lg bg-[#FF7B30] text-white text-sm font-medium hover:bg-[#ff6a1a] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send as {sendFormat}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
