'use client';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { X, User, CheckCircle, Send, Download } from 'lucide-react';
import apiClient from '@/lib/axiosClient';
import { resolveParameters, generateDocument, sendDocument } from '@/services/hrDocsService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const STEPS = ['Select Employee', 'Fill Parameters', 'Preview & Send'];

const isLetterheadHtml = (val) => typeof val === 'string' && val.trimStart().startsWith('<');

const isDocxTemplate = (tmpl) => tmpl?.templateType === 'DOCX';

export default function GenerateDocModal({ open, template, onClose, onSuccess }) {
  const [step, setStep] = useState(0);
  const [isNewJoiner, setIsNewJoiner] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [paramValues, setParamValues] = useState({});
  const [resolvedValues, setResolvedValues] = useState({});
  const [parameters, setParameters] = useState([]);
  const [resolving, setResolving] = useState(false);
  const [generating, setSaving] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [docxPreviewReady, setDocxPreviewReady] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const previewRef = useRef(null);
  const docxPreviewRef = useRef(null);

  // New joiner fields (basic)
  const [newJoinerForm, setNewJoinerForm] = useState({ name: '', email: '' });

  // Fetch employees list
  useEffect(() => {
    if (!open) return;
    apiClient.get('hrms/employee/list')
      .then((res) => setEmployees(res.data?.result || res.data?.data || []))
      .catch(() => {});
  }, [open]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(0);
      setIsNewJoiner(false);
      setSelectedEmployee(null);
      setParamValues({});
      setResolvedValues({});
      setGeneratedDoc(null);
      setNewJoinerForm({ name: '', email: '' });
    }
  }, [open]);

  // When employee is selected, resolve parameters
  const handleEmployeeSelect = async (emp) => {
    setSelectedEmployee(emp);
    setResolving(true);
    try {
      const res = await resolveParameters(template._id, emp._id);
      const data = res.data?.result || res.data?.data || {};
      setParameters(data.parameters || template.parameters || []);
      setResolvedValues(data.resolvedValues || {});
      setParamValues(data.resolvedValues || {});
      // Pre-fill email from employee
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

  // For new joiner — just use template parameters as-is
  const handleNewJoinerMode = () => {
    setIsNewJoiner(true);
    setSelectedEmployee(null);
    const params = template.parameters || [];
    setParameters(params);
    const blanks = {};
    params.forEach((p) => { blanks[p.key] = p.defaultValue || ''; });
    setParamValues(blanks);
    setResolvedValues({});
    setEmailForm((prev) => ({
      ...prev,
      subject: template.name || '',
    }));
  };

  const isSystemAutoFilled = (paramKey) =>
    resolvedValues[paramKey] !== undefined && resolvedValues[paramKey] !== '';

  const handleGenerate = async () => {
    // Validate required params
    const missing = parameters
      .filter((p) => p.required && !paramValues[p.key]?.trim())
      .map((p) => p.label || p.key);
    if (missing.length > 0) {
      toast.error(`Please fill: ${missing.join(', ')}`);
      return;
    }

    const employeeName = isNewJoiner
      ? newJoinerForm.name
      : `${selectedEmployee.firstName} ${selectedEmployee.lastName || ''}`;
    const employeeEmail = isNewJoiner ? newJoinerForm.email : selectedEmployee.email;

    if (!employeeName.trim()) {
      toast.error('Employee name is required');
      return;
    }

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

  // Render docx-preview when step 2 is reached for a DOCX template
  useEffect(() => {
    if (step !== 2 || !isDocxTemplate(template) || !generatedDoc?.docxBase64 || !docxPreviewRef.current) return;
    setDocxPreviewReady(false);
    (async () => {
      try {
        const { renderAsync } = await import('docx-preview');
        const binary = atob(generatedDoc.docxBase64);
        const bytes = new Uint8Array(binary.length);
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
        console.error('docx-preview error:', err);
      }
    })();
  }, [step, generatedDoc?.docxBase64]);

  // Download the filled .docx file directly
  const handleDownloadDocx = () => {
    if (!generatedDoc?.docxBase64) return;
    const binary = atob(generatedDoc.docxBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = (generatedDoc?.employeeName || 'document').replace(/\s+/g, '_');
    a.download = `${template.category}_${name}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Builds a multi-page A4 PDF from an HTML element
  const buildPdf = async (el) => {
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * pageW) / canvas.width;
    let heightLeft = imgH;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
      heightLeft -= pageH;
    }
    return pdf;
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current || downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      const pdf = await buildPdf(previewRef.current);
      const name = (generatedDoc?.employeeName || 'document').replace(/\s+/g, '_');
      pdf.save(`${template.category}_${name}.pdf`);
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSend = async () => {
    if (!emailForm.to) return toast.error('Recipient email is required');
    if (!emailForm.subject) return toast.error('Subject is required');

    try {
      setSending(true);
      // Generate PDF as base64
      let pdfBase64 = null;
      if (previewRef.current) {
        const pdf = await buildPdf(previewRef.current);
        pdfBase64 = pdf.output('datauristring').split(',')[1];
      }

      await sendDocument(generatedDoc._id, {
        to: emailForm.to,
        subject: emailForm.subject,
        body: emailForm.body,
        pdfBase64,
        fileName: `${template.category}_${generatedDoc?.employeeName || 'document'}.pdf`,
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
                    i < step ? 'bg-[#FF7B30] text-white' : i === step ? 'bg-orange-100 text-[#FF7B30] border-2 border-[#FF7B30]' : 'bg-gray-200 text-gray-500'
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
                            <p className="text-sm font-medium text-gray-800">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {emp.designationId?.name || emp.designation || '—'} •{' '}
                              {emp.departmentId?.name || emp.department || '—'}
                            </p>
                          </div>
                          {selectedEmployee?._id === emp._id && (
                            <CheckCircle className="w-4 h-4 text-[#FF7B30]" />
                          )}
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
                        {/* Auto-filled section */}
                        {!isNewJoiner && parameters.some((p) => isSystemAutoFilled(p.key)) && (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Auto-filled from employee record
                            </p>
                            {parameters
                              .filter((p) => isSystemAutoFilled(p.key))
                              .map((param) => (
                                <div key={param.key}>
                                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                                    {param.label || param.key}
                                  </label>
                                  <input
                                    value={paramValues[param.key] || ''}
                                    onChange={(e) => setParamValues((prev) => ({ ...prev, [param.key]: e.target.value }))}
                                    className="w-full border border-green-300 bg-green-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                  />
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Manual fill section */}
                        {parameters
                          .filter((p) => !isSystemAutoFilled(p.key) || isNewJoiner)
                          .map((param) => (
                            <div key={param.key}>
                              <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1.5 block">
                                {param.label || param.key}
                                {param.required && <span className="text-red-400">*</span>}
                                <span className="text-xs text-gray-400 font-normal font-mono">{`{{${param.key}}}`}</span>
                              </label>
                              <input
                                value={paramValues[param.key] || ''}
                                onChange={(e) =>
                                  setParamValues((prev) => ({ ...prev, [param.key]: e.target.value }))
                                }
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

            {/* STEP 2: Preview */}
            {step === 2 && generatedDoc && (
              <div className="space-y-3">
                {/* Actions bar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{generatedDoc.employeeName}</p>
                    <p className="text-xs text-gray-400">{generatedDoc.templateCategory?.replace(/_/g, ' ')}</p>
                  </div>
                  {isDocxTemplate(template) ? (
                    /* DOCX: download the actual Word file */
                    <button
                      onClick={handleDownloadDocx}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4" />
                      Download .docx
                    </button>
                  ) : (
                    /* QUILL: generate PDF from HTML canvas */
                    <button
                      onClick={handleDownloadPDF}
                      disabled={downloadingPdf}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {downloadingPdf ? (
                        <><div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> Generating...</>
                      ) : (
                        <><Download className="w-4 h-4" /> Download PDF</>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setSendModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FF7B30] text-white text-sm font-medium hover:bg-[#ff6a1a]"
                  >
                    <Send className="w-4 h-4" />
                    Send via Email
                  </button>
                </div>

                {/* Document Preview */}
                <div className="bg-gray-300 rounded-xl overflow-auto" style={{ maxHeight: '55vh' }}>
                  <div className="py-5 px-4">
                    {isDocxTemplate(template) ? (
                      /* DOCX preview — exact Word rendering with headers, footers, images */
                      <>
                        {!docxPreviewReady && (
                          <div className="flex items-center justify-center py-10">
                            <div className="w-5 h-5 border-2 border-[#FF7B30] border-t-transparent rounded-full animate-spin mr-2" />
                            <span className="text-sm text-gray-500">Rendering document...</span>
                          </div>
                        )}
                        <style>{`
                          .docx-gen-preview section.docx { box-shadow: 0 4px 24px rgba(0,0,0,0.18); margin: 0 auto 16px; }
                        `}</style>
                        <div ref={docxPreviewRef} className="docx-gen-preview" />
                      </>
                    ) : (
                      /* QUILL preview — A4 HTML */
                      <>
                        <style>{`
                          .md-doc-content { word-wrap: break-word; overflow-wrap: break-word; }
                          .md-doc-content * { background-color: transparent !important; background: transparent !important; }
                          .md-doc-content p, .md-doc-content span, .md-doc-content li {
                            overflow-wrap: break-word !important; word-break: break-word !important;
                          }
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

      {/* EMAIL SEND MODAL */}
      {sendModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-gray-900">Send Document</h5>
              <button onClick={() => setSendModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
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
              rows={3}
              value={emailForm.body}
              onChange={(e) => setEmailForm((p) => ({ ...p, body: e.target.value }))}
              placeholder="Email body (optional — document will be attached as PDF)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
            <div className="flex gap-3 pt-2">
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
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
