'use client';
import 'react-quill-new/dist/quill.snow.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { X, Plus, Trash2, ChevronDown, Tag, Info, FileText, ImageIcon, Upload } from 'lucide-react';
import { createTemplate, updateTemplate, getSystemParameters, getTemplate } from '@/services/hrDocsService';
import dynamic from 'next/dynamic';

// Quill loaded dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const CATEGORIES = [
  { value: 'OFFER_LETTER', label: 'Offer Letter' },
  { value: 'CONTRACT_OF_EMPLOYMENT', label: 'Contract of Employment' },
  { value: 'APPRAISAL_LETTER', label: 'Appraisal Letter' },
  { value: 'EXPERIENCE_LETTER', label: 'Experience Letter' },
  { value: 'RELIEVING_LETTER', label: 'Relieving Letter' },
  { value: 'NDA', label: 'Non-Disclosure Agreement' },
  { value: 'WARNING_LETTER', label: 'Warning Letter' },
  { value: 'PROMOTION_LETTER', label: 'Promotion Letter' },
  { value: 'ONBOARDING_SOP', label: 'Onboarding SOP' },
  { value: 'POLICY', label: 'Policy Document' },
  { value: 'OTHER', label: 'Other' },
];


const extractParamKeys = (html) => {
  const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  const keys = new Set();
  let match;
  while ((match = regex.exec(html)) !== null) keys.add(match[1]);
  return Array.from(keys);
};

export default function CreateTemplateModal({ open, onClose, editTemplate, onSuccess }) {
  const quillRef = useRef(null);
  const wordInputRef = useRef(null);
  const letterheadInputRef = useRef(null);
  const docxInputRef = useRef(null);
  const docxPreviewRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    category: '',
    subCategory: '',
    description: '',
    content: '',
    tags: [],
    letterheadDataUrl: null,
    templateType: 'QUILL', // 'QUILL' | 'DOCX'
    docxBase64: null,
  });
  const [docxFileName, setDocxFileName] = useState(null);
  const [docxPreviewReady, setDocxPreviewReady] = useState(false);
  const [parameters, setParameters] = useState([]);
  const [systemParams, setSystemParams] = useState([]);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [paramPickerOpen, setParamPickerOpen] = useState(false);
  const [detectedParams, setDetectedParams] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [editorMode, setEditorMode] = useState('edit'); // 'edit' | 'preview'

  useEffect(() => {
    getSystemParameters()
      .then((res) => setSystemParams(res.data?.result || res.data?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editTemplate) {
      // List API excludes content/docxBase64 — fetch full template for edit
      const populateForm = (tmpl) => {
        setForm({
          name: tmpl.name || '',
          category: tmpl.category || '',
          subCategory: tmpl.subCategory || '',
          description: tmpl.description || '',
          content: tmpl.content || '',
          tags: tmpl.tags || [],
          letterheadDataUrl: tmpl.letterheadDataUrl || null,
          templateType: tmpl.templateType || 'QUILL',
          docxBase64: tmpl.docxBase64 || null,
        });
        setDocxFileName(tmpl.templateType === 'DOCX' && tmpl.docxBase64 ? 'template.docx' : null);
        setDocxPreviewReady(false);
        setParameters(tmpl.parameters || []);
      };

      if (!editTemplate.content && !editTemplate.docxBase64) {
        // Fetch full template (list endpoint strips content/docxBase64)
        getTemplate(editTemplate._id)
          .then((res) => {
            const full = res.data?.result || res.data?.data || editTemplate;
            populateForm(full);
          })
          .catch(() => populateForm(editTemplate));
      } else {
        populateForm(editTemplate);
      }
    } else {
      setForm({ name: '', category: '', subCategory: '', description: '', content: '', tags: [], letterheadDataUrl: null, templateType: 'QUILL', docxBase64: null });
      setDocxFileName(null);
      setDocxPreviewReady(false);
      setParameters([]);
    }
    setDetectedParams([]);
    setEditorMode('edit');
  }, [editTemplate, open]);

  const handleContentChange = useCallback((html) => {
    setForm((prev) => ({ ...prev, content: html }));
    const found = extractParamKeys(html);
    setDetectedParams(found);
    setParameters((prev) => {
      const existingKeys = prev.map((p) => p.key);
      const newParams = found
        .filter((key) => !existingKeys.includes(key))
        .map((key) => {
          // Case-insensitive match against system params
          const systemMatch = systemParams.find((sp) => sp.key.toLowerCase() === key.toLowerCase());
          return {
            key,
            label: systemMatch?.label || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            type: systemMatch ? 'SYSTEM_FIELD' : 'MANUAL_INPUT',
            systemField: systemMatch ? systemMatch.key : null,
            required: true,
            placeholder: `Enter ${key.replace(/_/g, ' ')}`,
            defaultValue: '',
          };
        });
      return [...prev, ...newParams];
    });
  }, [systemParams]);

  // ── WORD IMPORT ───────────────────────────────────────────────────────────
  const handleWordImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset input so same file can be re-imported
    e.target.value = '';

    try {
      setImporting(true);
      const mammoth = await import('mammoth/mammoth.browser');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      if (result.value) {
        handleContentChange(result.value);
        toast.success('Word document imported — review and adjust formatting as needed');
      } else {
        toast.error('Could not extract content from this file');
      }
    } catch (err) {
      console.error('Word import error:', err);
      toast.error('Failed to import Word document');
    } finally {
      setImporting(false);
    }
  };

  // ── DOCX TEMPLATE UPLOAD ──────────────────────────────────────────────────
  const handleDocxTemplateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    if (!file.name.endsWith('.docx') && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      toast.error('Please upload a .docx Word file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }
    try {
      setImporting(true);
      const arrayBuffer = await file.arrayBuffer();
      // Convert to base64 for storage
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      bytes.forEach(b => { binary += String.fromCharCode(b); });
      const base64 = btoa(binary);
      setForm(prev => ({ ...prev, docxBase64: base64, templateType: 'DOCX', content: '' }));
      setDocxFileName(file.name);
      setDocxPreviewReady(false);
      // Extract {{param}} keys from docx content via mammoth
      const mammoth = await import('mammoth/mammoth.browser');
      const result = await mammoth.convertToHtml({ arrayBuffer });
      if (result.value) {
        const found = extractParamKeys(result.value);
        setDetectedParams(found);
        setParameters(prev => {
          const existingKeys = prev.map(p => p.key);
          const newParams = found
            .filter(key => !existingKeys.includes(key))
            .map(key => {
              // Case-insensitive match so {{Employee_name}} maps to employee_name system field
              const systemMatch = systemParams.find(sp => sp.key.toLowerCase() === key.toLowerCase());
              return {
                key,
                label: systemMatch?.label || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                type: systemMatch ? 'SYSTEM_FIELD' : 'MANUAL_INPUT',
                systemField: systemMatch ? systemMatch.key : null,
                required: true,
                placeholder: `Enter ${key.replace(/_/g, ' ')}`,
                defaultValue: '',
              };
            });
          return [...prev, ...newParams];
        });
        toast.success(`Word template uploaded — ${found.length} parameter${found.length !== 1 ? 's' : ''} detected`);
      } else {
        toast.success('Word template uploaded');
      }
    } catch (err) {
      console.error('DOCX upload error:', err);
      toast.error('Failed to process Word file');
    } finally {
      setImporting(false);
    }
  };

  // Render docx-preview when the preview panel mounts (DOCX mode)
  useEffect(() => {
    if (editorMode !== 'preview' || form.templateType !== 'DOCX' || !form.docxBase64 || !docxPreviewRef.current) return;
    setDocxPreviewReady(false);
    (async () => {
      try {
        const { renderAsync } = await import('docx-preview');
        // Decode base64 → ArrayBuffer
        const binary = atob(form.docxBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        docxPreviewRef.current.innerHTML = '';
        await renderAsync(bytes.buffer, docxPreviewRef.current, null, {
          className: 'docx-preview',
          inWrapper: false,
          ignoreWidth: true,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          useBase64URL: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
        });
        setDocxPreviewReady(true);
      } catch (err) {
        console.error('docx-preview error:', err);
        toast.error('Could not render preview');
      }
    })();
  }, [editorMode, form.docxBase64, form.templateType]);

  // ── LETTERHEAD UPLOAD — supports .docx (converted to HTML) and image (base64) ──
  const [letterheadLoading, setLetterheadLoading] = useState(false);

  const handleLetterheadUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      toast.error('Letterhead file must be under 5MB.');
      return;
    }

    const isDocx = file.name.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isImage = file.type.startsWith('image/');

    if (!isDocx && !isImage) {
      toast.error('Upload a .docx or an image file (PNG/JPG)');
      return;
    }

    try {
      setLetterheadLoading(true);

      if (isDocx) {
        // Convert Word doc → HTML (mammoth embeds images as base64 inline)
        const mammoth = await import('mammoth/mammoth.browser');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (!result.value?.trim()) {
          toast.error('Could not extract content from this Word file');
          return;
        }
        setForm((prev) => ({ ...prev, letterheadDataUrl: result.value }));
        toast.success('Word letterhead imported successfully');
      } else {
        // Image → base64 data URL
        const reader = new FileReader();
        reader.onload = (event) => {
          setForm((prev) => ({ ...prev, letterheadDataUrl: event.target.result }));
          toast.success('Letterhead image uploaded');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Letterhead upload error:', err);
      toast.error('Failed to process letterhead file');
    } finally {
      setLetterheadLoading(false);
    }
  };

  const removeLetterhead = () => {
    setForm((prev) => ({ ...prev, letterheadDataUrl: null }));
  };

  // Detect whether letterhead is HTML (from docx) or an image (base64 data URL)
  const isLetterheadHtml = (val) => typeof val === 'string' && val.trimStart().startsWith('<');

  // ── PARAMETER HELPERS ─────────────────────────────────────────────────────
  const insertParam = (paramKey) => {
    const quill = quillRef.current?.getEditor?.();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertText(range.index, `{{${paramKey}}}`, 'user');
      quill.setSelection(range.index + paramKey.length + 4);
    }
    setParamPickerOpen(false);
  };

  const updateParam = (idx, field, value) => {
    setParameters((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  // Sets both type + systemField from the combined mapping dropdown
  const setParamMapping = (idx, value) => {
    setParameters((prev) => {
      const updated = [...prev];
      if (value === 'MANUAL_INPUT' || value === 'DATE') {
        updated[idx] = { ...updated[idx], type: value, systemField: null };
      } else {
        // value is a systemField key (e.g. "employee_name", "joining_date")
        updated[idx] = { ...updated[idx], type: 'SYSTEM_FIELD', systemField: value };
      }
      return updated;
    });
  };

  const removeParam = (idx) => setParameters((prev) => prev.filter((_, i) => i !== idx));

  const addManualParam = () => {
    const key = `param_${parameters.length + 1}`;
    setParameters((prev) => [
      ...prev,
      { key, label: '', type: 'MANUAL_INPUT', systemField: null, required: true, placeholder: '', defaultValue: '' },
    ]);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Template name is required');
    if (!form.category) return toast.error('Please select a category');
    if (form.templateType === 'DOCX') {
      if (!form.docxBase64) return toast.error('Please upload a Word document (.docx)');
    } else {
      if (!form.content.trim() || form.content === '<p><br></p>') return toast.error('Template content cannot be empty');
    }

    try {
      setSaving(true);
      const payload = { ...form, parameters };

      if (editTemplate) {
        await updateTemplate(editTemplate._id, payload);
        toast.success('Template updated successfully');
      } else {
        await createTemplate(payload);
        toast.success('Template created successfully');
      }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      [{ font: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'clean'],
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm">
      {/* LEFT PANEL: Editor */}
      <div className="flex flex-col bg-white w-full max-w-3xl h-full shadow-xl border-r border-gray-200">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h4 className="text-primaryText font-semibold">
              {editTemplate ? 'Edit Template' : 'Create New Template'}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              {form.templateType === 'DOCX'
                ? 'Upload a Word (.docx) file with {{param}} placeholders'
                : 'Use {{parameter_name}} in your content to insert smart parameters'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* TEMPLATE TYPE TOGGLE */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
              <button
                onClick={() => { setForm(p => ({ ...p, templateType: 'QUILL' })); setEditorMode('edit'); }}
                className={`px-3 py-1.5 transition-colors flex items-center gap-1.5 ${form.templateType === 'QUILL' ? 'bg-[#FF7B30] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <span>✏️</span> Editor
              </button>
              <button
                onClick={() => { setForm(p => ({ ...p, templateType: 'DOCX' })); setEditorMode('edit'); }}
                className={`px-3 py-1.5 transition-colors flex items-center gap-1.5 ${form.templateType === 'DOCX' ? 'bg-[#FF7B30] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <span>📄</span> Word File
              </button>
            </div>
            {/* EDIT / PREVIEW TOGGLE */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
              <button
                onClick={() => setEditorMode('edit')}
                className={`px-3 py-1.5 transition-colors ${editorMode === 'edit' ? 'bg-gray-700 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Edit
              </button>
              <button
                onClick={() => setEditorMode('preview')}
                className={`px-3 py-1.5 transition-colors ${editorMode === 'preview' ? 'bg-gray-700 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Preview
              </button>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PREVIEW MODE */}
        {editorMode === 'preview' && (
          <div className="flex-1 overflow-auto bg-gray-300 px-6 py-6">
            {form.templateType === 'DOCX' ? (
              /* DOCX preview — rendered by docx-preview (renders headers, footers, images, exact layout) */
              <div>
                {!form.docxBase64 ? (
                  <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                    No Word file uploaded yet — go back to Edit and upload a .docx
                  </div>
                ) : (
                  <>
                    {!docxPreviewReady && (
                      <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-[#FF7B30] border-t-transparent rounded-full animate-spin mr-3" />
                        <span className="text-sm text-gray-500">Rendering Word document...</span>
                      </div>
                    )}
                    <style>{`
                      .docx-preview-wrapper section.docx { box-shadow: 0 4px 24px rgba(0,0,0,0.18); margin: 0 auto 16px; }
                    `}</style>
                    <div ref={docxPreviewRef} className="docx-preview-wrapper" />
                  </>
                )}
              </div>
            ) : (
              /* QUILL preview — A4 styled HTML */
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
                  style={{
                    width: '210mm', minHeight: '297mm', margin: '0 auto',
                    backgroundColor: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                    fontFamily: 'Arial, sans-serif', overflowX: 'hidden',
                  }}
                >
                  {form.letterheadDataUrl ? (
                    isLetterheadHtml(form.letterheadDataUrl) ? (
                      <div dangerouslySetInnerHTML={{ __html: form.letterheadDataUrl }} />
                    ) : (
                      <img src={form.letterheadDataUrl} alt="Letterhead" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    )
                  ) : (
                    <div style={{ padding: '10mm 20mm 4mm', borderBottom: '2px solid #FF7B30' }}>
                      <p style={{ margin: 0, fontSize: '18pt', fontWeight: 700, color: '#0D1B2A' }}>{form.name || 'Document Title'}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '9pt', color: '#6b7280' }}>No letterhead uploaded</p>
                    </div>
                  )}
                  <div
                    className="md-doc-content prose prose-sm max-w-none"
                    style={{ padding: '8mm 20mm 20mm', fontSize: '11pt', lineHeight: 1.8, color: '#111827' }}
                    dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:#9ca3af">No content yet.</p>' }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* EDIT MODE — BODY */}
        <div className={`flex-1 overflow-y-auto px-6 py-5 space-y-5 ${editorMode === 'preview' ? 'hidden' : ''}`}>
          {/* TEMPLATE META */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Template Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Offer Letter — Software Engineer"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Sub-category
              </label>
              <input
                value={form.subCategory}
                onChange={(e) => setForm((p) => ({ ...p, subCategory: e.target.value }))}
                placeholder="e.g. Intern, 2yr Exp, 5yr Exp"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description of when to use this template"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>
          </div>

          {/* DOCX MODE: File upload panel */}
          {form.templateType === 'DOCX' && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Word Template File (.docx)</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Create your letter in Word using <code className="bg-blue-100 px-1 rounded">{'{{param_name}}'}</code> placeholders.
                      Upload here — parameters are auto-detected. Preview shows exact Word layout.
                    </p>
                  </div>
                </div>
                {form.docxBase64 ? (
                  <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-blue-200">
                    <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1 truncate">{docxFileName || 'template.docx'}</span>
                    <button
                      onClick={() => docxInputRef.current?.click()}
                      disabled={importing}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Replace
                    </button>
                    <button
                      onClick={() => { setForm(p => ({ ...p, docxBase64: null })); setDocxFileName(null); setDocxPreviewReady(false); }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => docxInputRef.current?.click()}
                    disabled={importing}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-100 text-sm font-medium disabled:opacity-60 transition-colors"
                  >
                    {importing ? (
                      <><span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> Processing...</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Click to upload .docx Word file</>
                    )}
                  </button>
                )}
                <input
                  ref={docxInputRef}
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={handleDocxTemplateUpload}
                />
              </div>
              {detectedParams.length > 0 && (
                <div className="flex items-start gap-2 p-2.5 bg-green-50 rounded-lg border border-green-200">
                  <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-700">
                    <span className="font-semibold">{detectedParams.length} parameter{detectedParams.length !== 1 ? 's' : ''} found in document:</span>{' '}
                    {detectedParams.map(k => `{{${k}}}`).join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* QUILL MODE: Import from Word (extract text into editor) */}
          {form.templateType === 'QUILL' && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-800">Import from Word document</p>
                <p className="text-xs text-blue-500 mt-0.5">
                  Upload a .docx file — text and basic formatting will be extracted into the editor
                </p>
              </div>
              <input
                ref={wordInputRef}
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleWordImport}
              />
              <button
                onClick={() => wordInputRef.current?.click()}
                disabled={importing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-60 flex-shrink-0"
              >
                {importing ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Importing...</>
                ) : (
                  <><Upload className="w-3.5 h-3.5" /> Upload .docx</>
                )}
              </button>
            </div>
          )}

          {/* CONTENT EDITOR — only shown in QUILL mode */}
          <div className={form.templateType === 'DOCX' ? 'hidden' : ''}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Template Content *
              </label>
              {/* INSERT PARAMETER BUTTON */}
              <div className="relative">
                <button
                  onClick={() => setParamPickerOpen((p) => !p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-[#FF7B30] text-xs font-medium hover:bg-orange-100 border border-orange-200"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Insert Parameter
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {paramPickerOpen && (
                  <div className="absolute right-0 top-9 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-72 max-h-72 overflow-y-auto">
                    <div className="px-3 py-2 border-b">
                      <p className="text-xs font-semibold text-gray-500">SYSTEM PARAMETERS (auto-fill)</p>
                    </div>
                    {systemParams.map((sp) => (
                      <button
                        key={sp.key}
                        onClick={() => insertParam(sp.key)}
                        className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-xs font-medium text-gray-800">{sp.label}</p>
                          <p className="text-xs text-gray-400 font-mono">{`{{${sp.key}}}`}</p>
                        </div>
                        <span className="text-xs text-[#FF7B30] opacity-0 group-hover:opacity-100">Insert</span>
                      </button>
                    ))}
                    <div className="px-3 py-2 border-t">
                      <p className="text-xs font-semibold text-gray-500">CUSTOM</p>
                    </div>
                    <button
                      onClick={() => {
                        const key = prompt('Enter parameter key (no spaces, use underscore):\ne.g. annual_ctc, notice_period');
                        if (key && /^[a-zA-Z0-9_]+$/.test(key)) insertParam(key);
                        else if (key) toast.error('Key must only contain letters, numbers, underscores');
                        setParamPickerOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-orange-50 text-xs text-[#FF7B30] font-medium flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Type custom parameter key...
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <ReactQuill
                ref={quillRef}
                value={form.content}
                onChange={handleContentChange}
                modules={quillModules}
                theme="snow"
                style={{ minHeight: '280px' }}
                placeholder="Write your template here. Use the 'Insert Parameter' button to add {{parameter}} placeholders, or import from a Word document above."
              />
            </div>

            {detectedParams.length > 0 && (
              <div className="mt-2 flex items-start gap-2 p-2.5 bg-blue-50 rounded-lg">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">{detectedParams.length} parameter{detectedParams.length !== 1 ? 's' : ''} detected:</span>{' '}
                  {detectedParams.map((k) => `{{${k}}}`).join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* TAGS */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Tags</label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag and press Enter"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button onClick={addTag} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs">
                    {tag}
                    <button onClick={() => setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* LETTERHEAD — only shown in QUILL mode (DOCX has its own letterhead built in) */}
          <div className={form.templateType === 'DOCX' ? 'hidden' : ''}>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Letterhead
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Upload your company letterhead as a <strong>.docx Word file</strong> (recommended — preserves layout and logo) or as a PNG/JPG image. Max 5MB.
            </p>

            {form.letterheadDataUrl ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
                  <p className="text-xs text-gray-500 font-medium">
                    Letterhead Preview
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 text-xs font-normal">
                      {isLetterheadHtml(form.letterheadDataUrl) ? 'Word / HTML' : 'Image'}
                    </span>
                  </p>
                </div>
                <div className="p-3 max-h-40 overflow-y-auto bg-white">
                  {isLetterheadHtml(form.letterheadDataUrl) ? (
                    <div
                      className="prose prose-sm max-w-none text-xs"
                      dangerouslySetInnerHTML={{ __html: form.letterheadDataUrl }}
                    />
                  ) : (
                    <img
                      src={form.letterheadDataUrl}
                      alt="Letterhead preview"
                      className="w-full max-h-28 object-contain rounded border border-gray-100"
                    />
                  )}
                </div>
                <div className="px-3 pb-3 flex gap-2 border-t pt-2">
                  <button
                    onClick={() => letterheadInputRef.current?.click()}
                    disabled={letterheadLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Replace
                  </button>
                  <button
                    onClick={removeLetterhead}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !letterheadLoading && letterheadInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  letterheadLoading
                    ? 'border-gray-200 cursor-default'
                    : 'border-gray-300 cursor-pointer hover:border-orange-400 hover:bg-orange-50'
                }`}
              >
                {letterheadLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-500">Converting Word document...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <FileText className="w-7 h-7 text-blue-400" />
                      <span className="text-gray-300 text-lg">or</span>
                      <ImageIcon className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Click to upload letterhead</p>
                    <p className="text-xs text-gray-400 mt-1">.docx Word file <span className="text-orange-500 font-medium">(recommended)</span> or PNG / JPG • Max 5MB</p>
                  </>
                )}
              </div>
            )}

            <input
              ref={letterheadInputRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleLetterheadUpload}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-[#FF7B30] text-white text-sm font-medium hover:bg-[#ff6a1a] disabled:opacity-50"
          >
            {saving ? (editTemplate ? 'Updating...' : 'Creating...') : (editTemplate ? 'Update Template' : 'Create Template')}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: Parameter definitions */}
      <div className="flex flex-col bg-gray-50 w-full max-w-sm h-full overflow-y-auto border-l border-gray-200">
        <div className="px-5 py-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-gray-800">Parameters</h5>
              <p className="text-xs text-gray-400 mt-0.5">Configure how each {'{{param}}'} behaves</p>
            </div>
            <button
              onClick={addManualParam}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 text-[#FF7B30] text-xs font-medium hover:bg-orange-100"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
          {parameters.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">
                Insert {'{{params}}'} in your content — they'll appear here automatically
              </p>
            </div>
          ) : (
            parameters.map((param, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#FF7B30] font-semibold">{`{{${param.key}}}`}</span>
                  <button onClick={() => removeParam(idx)} className="text-gray-300 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  value={param.key}
                  onChange={(e) => updateParam(idx, 'key', e.target.value.replace(/\s+/g, '_'))}
                  placeholder="parameter_key"
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-orange-400"
                />

                <input
                  value={param.label}
                  onChange={(e) => updateParam(idx, 'label', e.target.value)}
                  placeholder="Display label (e.g. Annual CTC)"
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                />

                {/* Combined mapping dropdown — always visible on every parameter */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fill behaviour</label>
                  <select
                    value={param.type === 'SYSTEM_FIELD' ? (param.systemField || '') : param.type}
                    onChange={(e) => setParamMapping(idx, e.target.value)}
                    className={`w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400 ${
                      param.type === 'SYSTEM_FIELD' && param.systemField
                        ? 'border-green-400 bg-green-50 text-green-800'
                        : param.type === 'SYSTEM_FIELD' && !param.systemField
                        ? 'border-orange-300 bg-orange-50 text-orange-700'
                        : 'border-gray-200'
                    }`}
                  >
                    <option value="MANUAL_INPUT">Manual input (fill when generating)</option>
                    <option value="DATE">Date field (manual)</option>
                    <optgroup label="── Auto-fill from employee record ──">
                      {systemParams.map((sp) => (
                        <option key={sp.key} value={sp.key}>{sp.label}</option>
                      ))}
                    </optgroup>
                  </select>
                  {param.type === 'SYSTEM_FIELD' && param.systemField && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Auto-fills from <span className="font-mono font-semibold">{param.systemField}</span>
                    </p>
                  )}
                  {param.type === 'SYSTEM_FIELD' && !param.systemField && (
                    <p className="text-xs text-orange-500 mt-1">
                      ⚠ Select which DB field this maps to
                    </p>
                  )}
                </div>

                <input
                  value={param.placeholder}
                  onChange={(e) => updateParam(idx, 'placeholder', e.target.value)}
                  placeholder="Hint text for this field"
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                />

                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={param.required}
                    onChange={(e) => updateParam(idx, 'required', e.target.checked)}
                    className="rounded"
                  />
                  Required field
                </label>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
