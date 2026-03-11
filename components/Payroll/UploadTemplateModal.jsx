'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Tag, Info,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadPayslipTemplate } from '@/services/payrollService';

// ─────────────────────────────────────────────────────────────────────────────
// UploadTemplateModal
//
// Drag-drop DOCX upload. Reads the file, converts to base64, sends to backend.
// Backend auto-detects {{params}} from the DOCX XML and returns the list.
// Shows which params will be auto-filled from payslip data vs. manual input.
// ─────────────────────────────────────────────────────────────────────────────

// Params that the system can auto-fill from payslip data
const AUTO_FILL_KEYS = new Set([
  'employee_name','employee_code','employee_id','designation','department',
  'pay_period','month','year','working_days','days_worked','lop_days','lop_deduction',
  'gross_earnings','total_deductions','net_pay',
  'basic_salary','hra','conveyance','medical','special_allowance',
  'pf_employee','professional_tax','current_date','organization_name',
]);

export default function UploadTemplateModal({ onClose, onSuccess }) {
  const [name, setName]       = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile]       = useState(null);      // File object
  const [base64, setBase64]   = useState('');
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [detectedParams, setDetectedParams] = useState(null); // null = not yet uploaded
  const fileInputRef = useRef(null);

  // Convert DOCX → base64 and read params preview client-side
  const processFile = useCallback((f) => {
    if (!f) return;
    if (!f.name.endsWith('.docx')) {
      toast.error('Please upload a .docx file');
      return;
    }
    setFile(f);
    if (!name) setName(f.name.replace(/\.docx$/i, '').replace(/[_-]/g, ' '));

    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target.result.split(',')[1]; // strip data:...;base64,
      setBase64(b64);

      // Client-side param preview using JSZip / docx-preview isn't available here,
      // so we'll show the param list after backend upload.
      setDetectedParams(null);
    };
    reader.readAsDataURL(f);
  }, [name]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleFileInput = (e) => {
    const f = e.target.files[0];
    if (f) processFile(f);
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Template name is required');
    if (!base64)      return toast.error('Please select a .docx file');

    setSaving(true);
    try {
      const res = await uploadPayslipTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
        docxBase64: base64,
      });

      const data = res.data?.result || res.data?.data || {};
      setDetectedParams(data.detectedParams || []);

      toast.success('Template uploaded successfully!');
      // Show detected params for a moment, then close
      setTimeout(() => onSuccess(), 1800);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-primaryText">Upload Payslip Template</h2>
            <p className="text-xs text-gray-400 mt-0.5">Upload a .docx file with {'{{placeholders}}'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">

          {/* Template name */}
          <div>
            <label className="block text-xs font-medium text-primaryText mb-1.5">
              Template Name <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly Payslip — Standard"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-blackText"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-primaryText mb-1.5">Description (optional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Used for permanent employees"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-blackText"
            />
          </div>

          {/* Drop zone */}
          <div>
            <label className="block text-xs font-medium text-primaryText mb-1.5">
              DOCX File <span className="text-red-400">*</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                dragging
                  ? 'border-[#FF7B30] bg-orange-50'
                  : file
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                onChange={handleFileInput}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <FileText size={18} className="text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-blackText">{file.name}</p>
                    <p className="text-xs text-primaryText">{(file.size / 1024).toFixed(1)} KB — click to change</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-2">
                    <Upload size={18} className="text-[#FF7B30]" />
                  </div>
                  <p className="text-sm font-medium text-blackText">Drag & drop your .docx file here</p>
                  <p className="text-xs text-primaryText mt-0.5">or click to browse</p>
                </>
              )}
            </div>
          </div>

          {/* How to use placeholders hint */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 mb-2">
              <Info size={12} /> How to write placeholders in Word
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                ['{{employee_name}}', 'Auto — employee name'],
                ['{{net_pay}}', 'Auto — net salary'],
                ['{{pay_period}}', 'Auto — e.g. March 2026'],
                ['{{basic_salary}}', 'Auto — Basic component'],
                ['{{hra}}', 'Auto — HRA component'],
                ['{{custom_field}}', 'Manual — you type this'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] bg-white border border-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{key}</span>
                  <span className="text-[10px] text-blue-600">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detected params result (after upload) */}
          {detectedParams !== null && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={14} className="text-green-500" />
                <p className="text-xs font-semibold text-green-700">
                  Template uploaded! {detectedParams.length} parameter{detectedParams.length !== 1 ? 's' : ''} detected.
                </p>
              </div>
              {detectedParams.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detectedParams.map((key) => (
                    <span
                      key={key}
                      className={`text-[10px] px-2 py-1 rounded-full border font-mono flex items-center gap-1 ${
                        AUTO_FILL_KEYS.has(key)
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-orange-50 border-orange-200 text-[#FF7B30]'
                      }`}
                    >
                      {AUTO_FILL_KEYS.has(key) ? <CheckCircle2 size={9} /> : <Tag size={9} />}
                      {key}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-gray-400 mt-2">
                <span className="text-green-600 font-medium">Green</span> = auto-filled from payslip &nbsp;|&nbsp;
                <span className="text-[#FF7B30] font-medium">Orange</span> = manual input required
              </p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-primaryText"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !file || !name.trim()}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-primary hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 size={14} className="animate-spin" /> Uploading…</>
            ) : (
              <><Upload size={14} /> Upload Template</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
