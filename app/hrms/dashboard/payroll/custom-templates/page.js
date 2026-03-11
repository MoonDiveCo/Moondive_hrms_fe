'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Trash2, Zap, Tag, Calendar,
  ChevronRight, AlertTriangle, User,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { listPayslipTemplates, deletePayslipTemplate } from '@/services/payrollService';
import Modal from '@/components/Common/Modal';
import UploadTemplateModal from '@/components/Payroll/UploadTemplateModal';
import FillTemplateModal from '@/components/Payroll/FillTemplateModal';

// ─────────────────────────────────────────────────────────────────────────────
// Custom Templates page
// Upload branded DOCX payslip templates, auto-detect {{params}}, fill & send.
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 primaryShadow p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 w-20 bg-gray-100 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export default function CustomTemplatesPage() {
  const [templates, setTemplates]   = useState([]);
  const [loading, setLoading]       = useState(false);

  const [showUpload, setShowUpload] = useState(false);

  // Fill modal
  const [fillTemplate, setFillTemplate] = useState(null);

  // Delete confirm
  const [delTarget, setDelTarget]   = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPayslipTemplates();
      setTemplates(res.data?.result || res.data?.data || []);
    } catch {
      toast.error('Could not load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try {
      await deletePayslipTemplate(delTarget._id);
      toast.success('Template deleted');
      setDelTarget(null);
      load();
    } catch {
      toast.error('Could not delete template');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="h-full overflow-auto p-4 bg-background">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-blackText">Custom Payslip Templates</h1>
            <p className="text-sm text-primaryText mt-0.5">
              Upload your branded DOCX templates — auto-fill with payslip data, download or email
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Upload size={15} />
            Upload Template
          </button>
        </div>

        {/* ── How it works banner ─────────────────────────────────────── */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-[#FF7B30] mb-2 uppercase tracking-wide">How it works</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { n: '1', text: 'Upload your branded Word (.docx) payslip template with {{placeholders}}' },
              { n: '2', text: 'System auto-detects all {{params}} and shows which will be filled from payslip data' },
              { n: '3', text: 'Pick an employee + payslip — known fields auto-fill, you type the rest manually' },
              { n: '4', text: 'Download as DOCX (your exact branding) or PDF, or send directly to employee email' },
            ].map(({ n, text }) => (
              <div key={n} className="flex gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n}
                </div>
                <p className="text-xs text-primaryText leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Template grid ───────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 primaryShadow flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
              <FileText size={28} className="text-[#FF7B30]" />
            </div>
            <p className="text-sm font-semibold text-blackText">No templates yet</p>
            <p className="text-xs text-primaryText mt-1 max-w-xs">
              Upload a Word document with <span className="font-mono bg-gray-100 px-1 rounded">{'{{placeholders}}'}</span> to get started.
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Upload size={14} />
              Upload your first template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {templates.map((tmpl, idx) => (
                <TemplateCard
                  key={tmpl._id}
                  template={tmpl}
                  idx={idx}
                  onGenerate={() => setFillTemplate(tmpl)}
                  onDelete={() => setDelTarget(tmpl)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* ── Upload Modal ─────────────────────────────────────────────── */}
      {showUpload && (
        <UploadTemplateModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => { setShowUpload(false); load(); }}
        />
      )}

      {/* ── Fill / Generate Modal ────────────────────────────────────── */}
      {fillTemplate && (
        <FillTemplateModal
          template={fillTemplate}
          onClose={() => setFillTemplate(null)}
        />
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────── */}
      <Modal
        isVisible={!!delTarget}
        title="Delete Template"
        subtitle={`Are you sure you want to delete "${delTarget?.name}"? This cannot be undone.`}
        onClose={() => setDelTarget(null)}
        maxWidth="max-w-sm"
      >
        <div className="p-5 flex gap-3 justify-end border-t border-gray-100">
          <button
            onClick={() => setDelTarget(null)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ── Template Card ─────────────────────────────────────────────────────────────

function TemplateCard({ template, idx, onGenerate, onDelete }) {
  const params    = template.parameters || [];
  const maxShown  = 4;
  const overflow  = params.length - maxShown;
  const createdAt = template.createdAt
    ? new Date(template.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: idx * 0.05 }}
      className="bg-white rounded-xl border border-gray-200 primaryShadow p-5 flex flex-col"
    >
      {/* Card header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-[#FF7B30]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-blackText truncate text-sm">{template.name}</p>
          {template.description && (
            <p className="text-xs text-primaryText mt-0.5 line-clamp-1">{template.description}</p>
          )}
        </div>
      </div>

      {/* Params preview */}
      {params.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Tag size={9} /> Detected parameters ({params.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {params.slice(0, maxShown).map((p) => (
              <span
                key={p.key}
                className="text-[10px] bg-orange-50 text-[#FF7B30] border border-orange-100 px-1.5 py-0.5 rounded font-mono"
              >
                {`{{${p.key}}}`}
              </span>
            ))}
            {overflow > 0 && (
              <span className="text-[10px] bg-gray-50 text-primaryText border border-gray-100 px-1.5 py-0.5 rounded">
                +{overflow} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px] text-primaryText mb-4">
        {createdAt && (
          <span className="flex items-center gap-1">
            <Calendar size={10} /> {createdAt}
          </span>
        )}
        {template.createdBy && (
          <span className="flex items-center gap-1">
            <User size={10} />
            {template.createdBy.firstName} {template.createdBy.lastName}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2">
        <button
          onClick={onGenerate}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Zap size={13} />
          Generate Document
          <ChevronRight size={12} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete template"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
