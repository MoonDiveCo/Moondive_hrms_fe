'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getTemplates, bulkGenerateDocuments } from '@/services/hrDocsService';

// ─────────────────────────────────────────────────────────────────────────────
// BulkGenerateDocModal
//
// Allows HR to generate the same document template for multiple employees
// at once. Supports optional document expiry date and shared manual param
// overrides for fields that can't be auto-resolved.
//
// Props:
//   open       – boolean
//   onClose    – fn
//   onSuccess  – fn
//   employees  – [{_id, firstName, lastName, employeeId, ...}]
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'OFFER_LETTER', 'CONTRACT_OF_EMPLOYMENT', 'APPRAISAL_LETTER', 'EXPERIENCE_LETTER',
  'RELIEVING_LETTER', 'NDA', 'WARNING_LETTER', 'PROMOTION_LETTER', 'POLICY', 'OTHER',
];

export default function BulkGenerateDocModal({ open, onClose, onSuccess, employees = [] }) {
  const [templates, setTemplates]           = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateSearch, setTemplateSearch] = useState('');

  const [empSearch, setEmpSearch]     = useState('');
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);

  const [expiresAt, setExpiresAt] = useState('');

  const [generating, setGenerating] = useState(false);
  const [result, setResult]         = useState(null);

  useEffect(() => {
    if (!open) {
      setSelectedTemplate(null);
      setTemplateSearch('');
      setSelectedEmpIds([]);
      setEmpSearch('');
      setExpiresAt('');
      setResult(null);
      return;
    }
    // Load templates on open
    setLoadingTemplates(true);
    getTemplates({ limit: 100 })
      .then((res) => {
        const data = res.data?.result || res.data?.data || {};
        setTemplates(data.docs || data || []);
      })
      .catch(() => toast.error('Could not load templates'))
      .finally(() => setLoadingTemplates(false));
  }, [open]);

  const toggleEmployee = (id) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedEmpIds.length === filteredEmployees.length) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(filteredEmployees.map((e) => e._id));
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }
    if (selectedEmpIds.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }

    setGenerating(true);
    setResult(null);
    try {
      const res = await bulkGenerateDocuments({
        templateId: selectedTemplate._id,
        employeeIds: selectedEmpIds,
        parameterOverrides: {},
        expiresAt: expiresAt || null,
      });
      const data = res.data?.result || res.data?.data || {};
      setResult(data);
      if ((data.generated?.length || 0) > 0) {
        toast.success(`${data.generated.length} document(s) generated`);
        onSuccess?.();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Bulk generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const filteredEmployees = employees.filter((e) => {
    const q = empSearch.toLowerCase();
    return (
      e.firstName?.toLowerCase().includes(q) ||
      e.lastName?.toLowerCase().includes(q) ||
      e.employeeId?.toLowerCase().includes(q)
    );
  });

  const filteredTemplates = templates.filter((t) => {
    const q = templateSearch.toLowerCase();
    return t.name?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q);
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Bulk Generate Documents</h2>
            <p className="text-xs text-gray-500 mt-0.5">Generate the same template for multiple employees at once</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Template selector */}
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
                        <p className="text-xs text-gray-400">{t.category?.replace(/_/g, ' ')}</p>
                      </div>
                      {selectedTemplate?._id === t._id && <CheckCircle size={15} className="text-orange-500 flex-shrink-0" />}
                    </button>
                  ))}
                  {filteredTemplates.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No templates found</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Employee selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-700">Select Employees</label>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedEmpIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                  onChange={toggleAll}
                  className="accent-orange-500"
                />
                Select All
              </label>
            </div>
            <input
              type="text"
              placeholder="Search employees…"
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-1">
              {filteredEmployees.map((e) => (
                <label
                  key={e._id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedEmpIds.includes(e._id)}
                    onChange={() => toggleEmployee(e._id)}
                    className="accent-orange-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{e.firstName} {e.lastName}</p>
                    <p className="text-xs text-gray-400">{e.employeeId}</p>
                  </div>
                </label>
              ))}
              {filteredEmployees.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No employees found</p>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{selectedEmpIds.length} employee(s) selected</p>
          </div>

          {/* Optional expiry date */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Document Expiry Date (optional)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="text-[11px] text-gray-400 mt-0.5">
              e.g. NDA validity period, offer letter acceptance deadline
            </p>
          </div>

          {/* Result */}
          {result && (
            <div className="space-y-2">
              {(result.generated?.length || 0) > 0 && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
                  <CheckCircle size={15} />
                  {result.generated.length} document(s) generated successfully
                </div>
              )}
              {(result.failed?.length || 0) > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700">
                  <p className="font-semibold mb-1">{result.failed.length} failed:</p>
                  {result.failed.map((f, i) => (
                    <p key={i}>{f.employeeId} — {f.reason}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              onClick={handleGenerate}
              disabled={generating || !selectedTemplate || selectedEmpIds.length === 0}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-[#FF7B30] text-white rounded-lg hover:bg-[#ff6a1a] transition disabled:opacity-50"
            >
              {generating ? (
                <><Loader2 size={14} className="animate-spin" /> Generating…</>
              ) : (
                `Generate for ${selectedEmpIds.length || 0} Employee${selectedEmpIds.length !== 1 ? 's' : ''}`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
