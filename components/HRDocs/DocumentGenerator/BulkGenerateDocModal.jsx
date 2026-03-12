'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, CheckCircle, AlertCircle, Loader2, ChevronRight, ChevronLeft,
  Eye, Trash2, Edit3, Download, FileText, Info, Check, Users
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getTemplates, resolveParameters, bulkGenerateDocuments,
  deleteDocument, updateDocument, getDocument
} from '@/services/hrDocsService';

// ─────────────────────────────────────────────────────────────────────────────
// Smart Bulk Generate — 3 steps:
//  1. Select template + employees
//  2. Fill manual params (auto-resolved params pre-filled, manual ones editable)
//  3. Review generated docs — view preview, edit content, delete unwanted
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = ['Select', 'Parameters', 'Review'];

export default function BulkGenerateDocModal({ open, onClose, onSuccess, employees = [] }) {
  const [step, setStep] = useState(0);

  // Step 1
  const [templates, setTemplates]           = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [empSearch, setEmpSearch]           = useState('');
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [expiresAt, setExpiresAt]           = useState('');

  // Step 2
  const [resolving, setResolving]           = useState(false);
  const [parameters, setParameters]         = useState([]);   // template.parameters
  const [autoValues, setAutoValues]         = useState({});   // resolved by server
  const [manualValues, setManualValues]     = useState({});   // filled by HR

  // Step 3
  const [generating, setGenerating]         = useState(false);
  const [generatedDocs, setGeneratedDocs]   = useState([]);   // [{employeeId, employeeName, documentId, deleted}]
  const [failedDocs, setFailedDocs]         = useState([]);
  const [previewDoc, setPreviewDoc]         = useState(null); // full doc for preview modal
  const [previewLoading, setPreviewLoading] = useState(false);
  const [editDoc, setEditDoc]               = useState(null); // {id, content}
  const [saving, setSaving]                 = useState(false);
  const docxPreviewRef = useRef(null);
  const [docxReady, setDocxReady]           = useState(false);

  // ── Reset on close ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setStep(0);
      setSelectedTemplate(null);
      setTemplateSearch('');
      setSelectedEmpIds([]);
      setEmpSearch('');
      setExpiresAt('');
      setParameters([]);
      setAutoValues({});
      setManualValues({});
      setGeneratedDocs([]);
      setFailedDocs([]);
      setPreviewDoc(null);
      setEditDoc(null);
      return;
    }
    setLoadingTemplates(true);
    getTemplates({ limit: 100 })
      .then((res) => {
        const data = res.data?.result || res.data?.data || {};
        const docs = data.docs || data;
        setTemplates(Array.isArray(docs) ? docs : []);
      })
      .catch(() => toast.error('Could not load templates'))
      .finally(() => setLoadingTemplates(false));
  }, [open]);

  // ── Render docx-preview when previewDoc changes ─────────────────────────────
  useEffect(() => {
    if (!previewDoc?.docxBase64 || !docxPreviewRef.current) return;
    setDocxReady(false);
    (async () => {
      try {
        const { renderAsync } = await import('docx-preview');
        const binary = atob(previewDoc.docxBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        docxPreviewRef.current.innerHTML = '';
        await renderAsync(bytes.buffer, docxPreviewRef.current, null, {
          className: 'docx-preview', inWrapper: false, ignoreWidth: true,
          renderHeaders: true, renderFooters: true, breakPages: true, useBase64URL: true,
        });
        setDocxReady(true);
      } catch (err) {
        console.error('docx-preview error:', err);
      }
    })();
  }, [previewDoc?.docxBase64]);

  const filteredEmployees = employees.filter((e) => {
    const q = empSearch.toLowerCase();
    return e.firstName?.toLowerCase().includes(q) ||
      e.lastName?.toLowerCase().includes(q) ||
      e.employeeId?.toLowerCase().includes(q);
  });

  const filteredTemplates = templates.filter((t) => {
    const q = templateSearch.toLowerCase();
    return t.name?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q);
  });

  const toggleEmployee = (id) =>
    setSelectedEmpIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelectedEmpIds(
      selectedEmpIds.length === filteredEmployees.length && filteredEmployees.length > 0
        ? [] : filteredEmployees.map((e) => e._id)
    );

  // ── Step 1 → Step 2: resolve params using first selected employee ───────────
  const handleNextToParams = async () => {
    if (!selectedTemplate || selectedEmpIds.length === 0) return;
    setResolving(true);
    try {
      const res = await resolveParameters(selectedTemplate._id, selectedEmpIds[0]);
      const data = res.data?.result || res.data?.data || {};
      const params = data.parameters || [];
      const resolved = data.resolvedValues || {};
      setParameters(params);
      setAutoValues(resolved);
      // Pre-fill manualValues: empty string for unresolved, resolved value for auto
      const manual = {};
      params.forEach((p) => {
        manual[p.key] = resolved[p.key] || p.defaultValue || '';
      });
      setManualValues(manual);
      setStep(1);
    } catch (err) {
      toast.error('Failed to resolve parameters');
    } finally {
      setResolving(false);
    }
  };

  // ── Step 2 → Step 3: bulk generate ─────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await bulkGenerateDocuments({
        templateId: selectedTemplate._id,
        employeeIds: selectedEmpIds,
        parameterOverrides: manualValues,
        expiresAt: expiresAt || null,
      });
      const data = res.data?.result || res.data?.data || {};
      setGeneratedDocs((data.generated || []).map((d) => ({ ...d, deleted: false })));
      setFailedDocs(data.failed || []);
      if ((data.generated?.length || 0) > 0) onSuccess?.();
      setStep(2);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Bulk generation failed');
    } finally {
      setGenerating(false);
    }
  };

  // ── Open preview ────────────────────────────────────────────────────────────
  const handlePreview = async (docId) => {
    setPreviewLoading(true);
    setPreviewDoc(null);
    setDocxReady(false);
    try {
      const res = await getDocument(docId);
      setPreviewDoc(res.data?.result || res.data?.data);
    } catch {
      toast.error('Failed to load document');
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── Delete a generated doc ──────────────────────────────────────────────────
  const handleDelete = async (docId) => {
    try {
      await deleteDocument(docId);
      setGeneratedDocs((prev) =>
        prev.map((d) => d.documentId === docId ? { ...d, deleted: true } : d)
      );
      toast.success('Document removed');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  // ── Save edited content ─────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editDoc) return;
    setSaving(true);
    try {
      await updateDocument(editDoc.id, { generatedContent: editDoc.content });
      toast.success('Document updated');
      setEditDoc(null);
      // Refresh preview if open
      if (previewDoc?._id === editDoc.id) {
        setPreviewDoc((p) => ({ ...p, generatedContent: editDoc.content }));
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ── Download docx ────────────────────────────────────────────────────────────
  const handleDownload = (doc) => {
    if (!doc?.docxBase64) return;
    const binary = atob(doc.docxBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.templateCategory || 'document'}_${doc.employeeName || ''}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Which params are manual (not auto-resolved) ─────────────────────────────
  const manualParams = parameters.filter(
    (p) => p.type === 'MANUAL_INPUT' || !autoValues[p.key]
  );
  const autoParams = parameters.filter(
    (p) => p.type !== 'MANUAL_INPUT' && autoValues[p.key]
  );

  if (!open) return null;

  return (
    <>
      {/* ── MAIN MODAL ───────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '90vh' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Bulk Generate Documents</h2>
              <div className="flex items-center gap-2 mt-1.5">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${
                      i < step ? 'text-green-600' : i === step ? 'text-[#FF7B30]' : 'text-gray-400'
                    }`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                        i < step ? 'bg-green-500 border-green-500 text-white' :
                        i === step ? 'bg-[#FF7B30] border-[#FF7B30] text-white' :
                        'border-gray-300 text-gray-400'
                      }`}>
                        {i < step ? <Check size={10} /> : i + 1}
                      </div>
                      {s}
                    </div>
                    {i < STEPS.length - 1 && <ChevronRight size={12} className="text-gray-300" />}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* ── STEP 1: Select template + employees ── */}
            {step === 0 && (
              <div className="space-y-5">
                {/* Template */}
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1.5">Select Template</label>
                  {loadingTemplates ? (
                    <p className="text-xs text-gray-400">Loading templates…</p>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Search templates…"
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-100 rounded-lg p-1">
                        {filteredTemplates.map((t) => (
                          <button
                            key={t._id}
                            onClick={() => setSelectedTemplate(t)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between ${
                              selectedTemplate?._id === t._id
                                ? 'bg-orange-50 border border-orange-200 text-orange-900'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div>
                              <p className="font-medium">{t.name}</p>
                              <p className="text-xs text-gray-400">{t.category?.replace(/_/g, ' ')} · {t.templateType}</p>
                            </div>
                            {selectedTemplate?._id === t._id && <CheckCircle size={15} className="text-orange-500 flex-shrink-0" />}
                          </button>
                        ))}
                        {filteredTemplates.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No templates found</p>}
                      </div>
                    </>
                  )}
                </div>

                {/* Employees */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-700">Select Employees</label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                      <input type="checkbox"
                        checked={selectedEmpIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                        onChange={toggleAll} className="accent-orange-500"
                      />
                      Select All
                    </label>
                  </div>
                  <input
                    type="text" placeholder="Search employees…"
                    value={empSearch} onChange={(e) => setEmpSearch(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-1">
                    {filteredEmployees.map((e) => (
                      <label key={e._id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={selectedEmpIds.includes(e._id)}
                          onChange={() => toggleEmployee(e._id)} className="accent-orange-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{e.firstName} {e.lastName}</p>
                          <p className="text-xs text-gray-400">{e.employeeId}</p>
                        </div>
                      </label>
                    ))}
                    {filteredEmployees.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No employees found</p>}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{selectedEmpIds.length} employee(s) selected</p>
                </div>

                {/* Expiry */}
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Expiry Date (optional)</label>
                  <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 2: Parameters ── */}
            {step === 1 && (
              <div className="space-y-4">
                {manualParams.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      <p className="text-xs font-semibold text-gray-700">Manual Parameters — fill these in</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">These values cannot be auto-resolved and will be applied to all {selectedEmpIds.length} employee documents.</p>
                    <div className="space-y-3">
                      {manualParams.map((p) => (
                        <div key={p.key}>
                          <label className="text-xs font-medium text-gray-700 block mb-1">
                            {p.label || p.key.replace(/_/g, ' ')}
                            {p.required && <span className="text-red-400 ml-0.5">*</span>}
                          </label>
                          <input
                            type="text"
                            value={manualValues[p.key] || ''}
                            onChange={(e) => setManualValues((prev) => ({ ...prev, [p.key]: e.target.value }))}
                            placeholder={p.placeholder || `Enter ${p.label || p.key}`}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {autoParams.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <p className="text-xs font-semibold text-gray-700">Auto-Resolved Parameters</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">These are resolved from employee profiles. You can override any value if needed.</p>
                    <div className="space-y-3">
                      {autoParams.map((p) => (
                        <div key={p.key}>
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            {p.label || p.key.replace(/_/g, ' ')}
                            <span className="ml-2 text-[10px] text-green-600 font-normal">auto</span>
                          </label>
                          <input
                            type="text"
                            value={manualValues[p.key] || ''}
                            onChange={(e) => setManualValues((prev) => ({ ...prev, [p.key]: e.target.value }))}
                            className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {manualParams.length === 0 && autoParams.length === 0 && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-800">All parameters are auto-resolved. You can proceed to generate.</p>
                  </div>
                )}

                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Employee-specific values (name, designation, etc.) will still be resolved individually per employee. The values above are shared overrides.
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP 3: Review generated docs ── */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="flex gap-3">
                  {generatedDocs.filter(d => !d.deleted).length > 0 && (
                    <div className="flex-1 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
                      <CheckCircle size={15} />
                      <span>{generatedDocs.filter(d => !d.deleted).length} document(s) generated</span>
                    </div>
                  )}
                  {failedDocs.length > 0 && (
                    <div className="flex-1 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                      <AlertCircle size={15} />
                      <span>{failedDocs.length} failed</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500">Review each document below. You can preview, edit content, or delete any document before closing.</p>

                {/* Generated list */}
                <div className="space-y-2">
                  {generatedDocs.map((doc) => (
                    <div key={doc.documentId} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
                      doc.deleted ? 'bg-gray-50 border-gray-200 opacity-50' : 'bg-white border-gray-200 hover:border-orange-200'
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7B30] text-xs font-bold flex-shrink-0">
                        {doc.employeeName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{doc.employeeName}</p>
                        {doc.deleted && <p className="text-xs text-red-400">Deleted</p>}
                      </div>
                      {!doc.deleted && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePreview(doc.documentId)}
                            className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-[#FF7B30] transition"
                            title="Preview"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={async () => {
                              const res = await getDocument(doc.documentId).catch(() => null);
                              const d = res?.data?.result || res?.data?.data;
                              if (d) setEditDoc({ id: doc.documentId, content: d.generatedContent || '', isDocx: !!d.docxBase64 });
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition"
                            title="Edit content"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.documentId)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Failed list */}
                {failedDocs.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700 space-y-1">
                    <p className="font-semibold mb-1">Failed:</p>
                    {failedDocs.map((f, i) => <p key={i}>{f.employeeId} — {f.reason}</p>)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <button
              onClick={() => step === 0 ? onClose() : setStep((s) => s - 1)}
              disabled={generating || resolving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              {step > 0 && <ChevronLeft size={14} />}
              {step === 0 ? 'Cancel' : 'Back'}
            </button>

            {step === 0 && (
              <button
                onClick={handleNextToParams}
                disabled={!selectedTemplate || selectedEmpIds.length === 0 || resolving}
                className="flex items-center gap-2 px-5 py-2 text-sm bg-[#FF7B30] text-white rounded-lg hover:bg-[#ff6a1a] transition disabled:opacity-50"
              >
                {resolving ? <><Loader2 size={14} className="animate-spin" /> Resolving…</> : <><ChevronRight size={14} /> Next</>}
              </button>
            )}

            {step === 1 && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-5 py-2 text-sm bg-[#FF7B30] text-white rounded-lg hover:bg-[#ff6a1a] transition disabled:opacity-50"
              >
                {generating
                  ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
                  : <><Users size={14} /> Generate for {selectedEmpIds.length} Employee{selectedEmpIds.length !== 1 ? 's' : ''}</>
                }
              </button>
            )}

            {step === 2 && (
              <button onClick={onClose} className="px-5 py-2 text-sm bg-[#FF7B30] text-white rounded-lg hover:bg-[#ff6a1a] transition">
                Done
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── PREVIEW MODAL ────────────────────────────────────────────────────── */}
      {(previewDoc || previewLoading) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '88vh' }}>
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div>
                <p className="text-sm font-semibold text-gray-900">{previewDoc?.templateName || 'Preview'}</p>
                <p className="text-xs text-gray-400 mt-0.5">{previewDoc?.employeeName}</p>
              </div>
              <div className="flex items-center gap-2">
                {previewDoc?.docxBase64 && (
                  <button onClick={() => handleDownload(previewDoc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Download size={12} /> Download .docx
                  </button>
                )}
                <button onClick={() => setPreviewDoc(null)} className="p-1.5 rounded-full hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              {previewLoading && (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF7B30]" />
                </div>
              )}
              {previewDoc && previewDoc.docxBase64 && (
                <>
                  <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info size={13} className="text-blue-500 flex-shrink-0" />
                    <p className="text-xs text-blue-700">Approximate preview. Download .docx for exact design.</p>
                  </div>
                  {!docxReady && (
                    <div className="flex items-center justify-center py-8 gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#FF7B30]" />
                      <span className="text-sm text-gray-500">Rendering…</span>
                    </div>
                  )}
                  <div ref={docxPreviewRef} />
                </>
              )}
              {previewDoc && !previewDoc.docxBase64 && (
                <div className="bg-white rounded-xl p-6 shadow prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewDoc.generatedContent || '<p>No content</p>' }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT CONTENT MODAL ───────────────────────────────────────────────── */}
      {editDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '88vh' }}>
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <p className="text-sm font-semibold text-gray-900">Edit Document Content</p>
              <button onClick={() => setEditDoc(null)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            {editDoc.isDocx ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-center">
                <FileText size={40} className="text-gray-300" />
                <p className="text-sm text-gray-600">DOCX documents cannot be edited in-browser.</p>
                <p className="text-xs text-gray-400">Download the .docx file, edit it in Word, then re-upload as a new template.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto p-4">
                  <textarea
                    value={editDoc.content}
                    onChange={(e) => setEditDoc((prev) => ({ ...prev, content: e.target.value }))}
                    className="w-full h-96 border border-gray-200 rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                    placeholder="Document content (HTML)"
                  />
                  <p className="text-xs text-gray-400 mt-1">Editing raw HTML content. Changes apply only to this generated document.</p>
                </div>
                <div className="flex items-center justify-end gap-3 px-5 py-3 border-t">
                  <button onClick={() => setEditDoc(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleSaveEdit} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 text-sm bg-[#FF7B30] text-white rounded-lg hover:bg-[#ff6a1a] disabled:opacity-50">
                    {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
