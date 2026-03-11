'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Zap, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getStandardComponents,
  createSalaryStructure,
  reviseSalaryStructure,
  previewPayslip,
} from '@/services/payrollService';

// ─────────────────────────────────────────────────────────────────────────────
// SalaryStructureModal
//
// Props:
//   open          – boolean
//   onClose       – fn
//   onSuccess     – fn(savedStructure)
//   employees     – [{_id, firstName, lastName, employeeId, designationId, departmentId}]
//   existingId    – string | null  (if set → Revise mode, else → Create mode)
//   existingData  – object | null  (pre-fills form in Revise mode)
// ─────────────────────────────────────────────────────────────────────────────

const CALC_TYPES = [
  { value: 'FIXED',               label: 'Fixed (₹)' },
  { value: 'PERCENTAGE_OF_CTC',   label: '% of CTC' },
  { value: 'PERCENTAGE_OF_BASIC', label: '% of Basic' },
  { value: 'PERCENTAGE_OF_GROSS', label: '% of Gross' },
  { value: 'RESIDUAL',            label: 'Residual' },
];

const COMP_TYPES = [
  { value: 'EARNING',               label: 'Earning' },
  { value: 'DEDUCTION',             label: 'Deduction' },
  { value: 'EMPLOYER_CONTRIBUTION', label: 'Employer Contribution' },
];

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0);

const emptyComponent = () => ({
  name: '',
  code: '',
  type: 'EARNING',
  calculationType: 'FIXED',
  value: 0,
  cap: '',
  isTaxable: true,
  order: 0,
  isActive: true,
  _key: Math.random(),
});

export default function SalaryStructureModal({
  open,
  onClose,
  onSuccess,
  employees = [],
  existingId = null,
  existingData = null,
}) {
  const isRevise = !!existingId;

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [empSearch, setEmpSearch]               = useState('');
  const [showEmpDropdown, setShowEmpDropdown]   = useState(false);

  const [ctc, setCtc]               = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes]           = useState('');
  const [components, setComponents] = useState([]);
  const [preview, setPreview]       = useState(null);
  const [saving, setSaving]         = useState(false);
  const [loadingDefaults, setLoadingDefaults] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  // ── Pre-fill in revise mode ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (isRevise && existingData) {
      setCtc(String(existingData.ctc || ''));
      setNotes(existingData.notes || '');
      setEffectiveFrom(new Date().toISOString().split('T')[0]);
      setComponents(
        (existingData.components || []).map((c) => ({ ...c, _key: Math.random() }))
      );
      setSelectedEmployee(existingData.employee || null);
      setPreview(null);
    } else if (!isRevise) {
      resetForm();
    }
  }, [open, isRevise, existingData]);

  const resetForm = () => {
    setSelectedEmployee(null);
    setEmpSearch('');
    setCtc('');
    setEffectiveFrom(new Date().toISOString().split('T')[0]);
    setNotes('');
    setComponents([]);
    setPreview(null);
  };

  // ── Apply standard Indian payroll defaults ─────────────────────────────────
  const handleApplyDefaults = async () => {
    setLoadingDefaults(true);
    try {
      const res = await getStandardComponents();
      const defaults = res.data?.result || res.data?.data || [];
      setComponents(defaults.map((c) => ({ ...c, _key: Math.random() })));
      toast.success('Standard Indian payroll structure applied');
    } catch {
      toast.error('Could not load standard components');
    } finally {
      setLoadingDefaults(false);
    }
  };

  // ── Live preview whenever CTC or components change ─────────────────────────
  const runPreview = useCallback(async () => {
    const annualCtc = parseFloat(ctc);
    if (!annualCtc || components.length === 0) {
      setPreview(null);
      return;
    }
    setPreviewing(true);
    const now = new Date();
    try {
      const res = await previewPayslip({
        ctc: annualCtc,
        components: components.map(({ _key, ...c }) => ({
          ...c,
          value: parseFloat(c.value) || 0,
          cap: c.cap !== '' && c.cap !== null && c.cap !== undefined ? parseFloat(c.cap) : null,
        })),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        lopDays: 0,
        workingDays: 26,
      });
      setPreview(res.data?.result || res.data?.data || null);
    } catch {
      setPreview(null);
    } finally {
      setPreviewing(false);
    }
  }, [ctc, components]);

  useEffect(() => {
    const t = setTimeout(runPreview, 600);
    return () => clearTimeout(t);
  }, [runPreview]);

  // ── Component manipulation ────────────────────────────────────────────────
  const addComponent = () => setComponents((prev) => [...prev, emptyComponent()]);

  const removeComponent = (key) =>
    setComponents((prev) => prev.filter((c) => c._key !== key));

  const updateComponent = (key, field, val) =>
    setComponents((prev) =>
      prev.map((c) => (c._key === key ? { ...c, [field]: val } : c))
    );

  const moveComponent = (key, dir) => {
    setComponents((prev) => {
      const idx = prev.findIndex((c) => c._key === key);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!isRevise && !selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }
    if (!ctc || parseFloat(ctc) <= 0) {
      toast.error('Please enter a valid annual CTC');
      return;
    }
    if (components.length === 0) {
      toast.error('Add at least one salary component');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ctc: parseFloat(ctc),
        effectiveFrom,
        notes: notes || undefined,
        components: components.map(({ _key, ...c }, i) => ({
          ...c,
          value: parseFloat(c.value) || 0,
          cap: c.cap !== '' && c.cap !== null && c.cap !== undefined ? parseFloat(c.cap) : null,
          order: i,
        })),
      };

      let res;
      if (isRevise) {
        res = await reviseSalaryStructure(existingId, payload);
      } else {
        payload.employeeId = selectedEmployee._id;
        res = await createSalaryStructure(payload);
      }

      toast.success(isRevise ? 'Salary structure revised' : 'Salary structure created');
      onSuccess?.(res.data?.result || res.data?.data);
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save salary structure');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const filteredEmployees = employees.filter((e) => {
    const q = empSearch.toLowerCase();
    return (
      e.firstName?.toLowerCase().includes(q) ||
      e.lastName?.toLowerCase().includes(q) ||
      e.employeeId?.toLowerCase().includes(q)
    );
  });

  const earnings    = preview?.earnings    || [];
  const deductions  = preview?.deductions  || [];
  const grossEarnings   = preview?.grossEarnings   || 0;
  const totalDeductions = preview?.totalDeductions || 0;
  const netPay          = preview?.netPay          || 0;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full mx-4 max-w-5xl my-4 flex flex-col max-h-[95vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h4 className="text-lg font-semibold text-primaryText">
              {isRevise ? 'Revise Salary Structure' : 'Setup Salary Structure'}
            </h4>
            {isRevise && (
              <p className="text-xs text-gray-400 mt-0.5">
                Current structure will be archived. A new version will be created.
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-md text-gray-400 hover:text-primaryText transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Left Panel — Form ────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 border-r border-gray-100">

            {/* Employee Selector (create mode only) */}
            {!isRevise && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Employee</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search employee by name or ID…"
                    value={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : empSearch}
                    onChange={(e) => {
                      setEmpSearch(e.target.value);
                      setSelectedEmployee(null);
                      setShowEmpDropdown(true);
                    }}
                    onFocus={() => setShowEmpDropdown(true)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {showEmpDropdown && filteredEmployees.length > 0 && (
                    <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredEmployees.slice(0, 20).map((e) => (
                        <li
                          key={e._id}
                          onClick={() => {
                            setSelectedEmployee(e);
                            setEmpSearch('');
                            setShowEmpDropdown(false);
                          }}
                          className="px-3 py-2.5 hover:bg-orange-50 cursor-pointer text-sm flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-[#FF7B30]">
                              {e.firstName?.[0]}{e.lastName?.[0]}
                            </div>
                            <span className="font-medium">{e.firstName} {e.lastName}</span>
                          </div>
                          <span className="text-xs text-gray-400">{e.employeeId}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            {isRevise && selectedEmployee && (
              <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-2.5 text-sm text-gray-700 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-[#FF7B30]">
                  {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                </div>
                <span>Revising structure for <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong></span>
              </div>
            )}

            {/* CTC + Effective Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Annual CTC (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={ctc}
                  onChange={(e) => setCtc(e.target.value)}
                  placeholder="e.g. 1200000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {ctc && (
                  <p className="text-[11px] text-[#FF7B30] mt-1 font-medium">
                    Monthly: ₹{fmt(parseFloat(ctc) / 12)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Effective From</label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Apply defaults button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleApplyDefaults}
                disabled={loadingDefaults}
                className="flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg hover:bg-amber-100 transition disabled:opacity-50 font-medium"
              >
                <Zap size={13} />
                {loadingDefaults ? 'Loading…' : 'Apply Standard Indian Structure'}
              </button>
              <span className="text-xs text-gray-400">Basic 40% CTC, HRA, PF, PT…</span>
            </div>

            {/* Components */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Salary Components</p>
                <button
                  onClick={addComponent}
                  className="flex items-center gap-1 text-xs bg-primary hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition"
                >
                  <Plus size={13} /> Add Component
                </button>
              </div>

              <div className="space-y-2">
                {components.map((comp, idx) => (
                  <ComponentRow
                    key={comp._key}
                    comp={comp}
                    isFirst={idx === 0}
                    isLast={idx === components.length - 1}
                    onChange={(field, val) => updateComponent(comp._key, field, val)}
                    onRemove={() => removeComponent(comp._key)}
                    onMoveUp={() => moveComponent(comp._key, -1)}
                    onMoveDown={() => moveComponent(comp._key, 1)}
                  />
                ))}
                {components.length === 0 && (
                  <div className="text-center py-10 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                    <p className="font-medium">No components yet</p>
                    <p className="text-xs mt-1">Click &quot;Apply Standard Indian Structure&quot; or &quot;Add Component&quot;</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Notes (optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Mid-year appraisal revision"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
          </div>

          {/* ── Right Panel — Live Preview ───────────────────────── */}
          <div className="w-72 overflow-y-auto px-5 py-5 bg-gray-50 flex-shrink-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Monthly Breakdown Preview</p>

            {previewing && (
              <div className="space-y-2 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: i % 2 === 0 ? '80%' : '60%' }} />
                ))}
              </div>
            )}
            {!previewing && !preview && (
              <div className="text-center py-10 text-xs text-gray-400">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3 text-lg font-bold text-gray-300">₹</div>
                Enter CTC and components to see monthly breakdown
              </div>
            )}
            {!previewing && preview && (
              <div className="space-y-4">
                {/* Earnings */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Earnings</p>
                  {earnings.map((e, i) => (
                    <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-600 truncate">{e.name}</span>
                      <span className="font-semibold text-gray-800 ml-2">₹{fmt(e.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs font-bold text-[#FF7B30] border-t border-gray-200 pt-1.5 mt-1">
                    <span>Gross</span>
                    <span>₹{fmt(grossEarnings)}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Deductions</p>
                  {deductions.map((d, i) => (
                    <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-600 truncate">{d.name}</span>
                      <span className="font-semibold text-red-500 ml-2">₹{fmt(d.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs font-bold text-red-600 border-t border-gray-200 pt-1.5 mt-1">
                    <span>Total Deductions</span>
                    <span>₹{fmt(totalDeductions)}</span>
                  </div>
                </div>

                {/* Net Pay */}
                <div className="bg-primary rounded-xl p-4 text-white text-center">
                  <p className="text-[10px] opacity-80 uppercase tracking-wide">Net Pay / Month</p>
                  <p className="text-xl font-bold mt-1">₹{fmt(netPay)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition text-primaryText"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm bg-primary hover:bg-orange-600 text-white rounded-lg transition disabled:opacity-50 font-medium"
          >
            {saving ? 'Saving…' : isRevise ? 'Revise Structure' : 'Create Structure'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ComponentRow sub-component ────────────────────────────────────────────────

function ComponentRow({ comp, isFirst, isLast, onChange, onRemove, onMoveUp, onMoveDown }) {
  const typeColor = comp.type === 'EARNING'
    ? 'border-l-4 border-l-green-300'
    : comp.type === 'DEDUCTION'
    ? 'border-l-4 border-l-red-300'
    : 'border-l-4 border-l-blue-300';

  return (
    <div className={`border border-gray-200 rounded-xl p-3 text-xs bg-white transition ${typeColor} ${!comp.isActive ? 'opacity-50' : ''}`}>
      <div className="grid grid-cols-12 gap-2 items-start">
        {/* Name */}
        <div className="col-span-3">
          <label className="text-gray-400 text-[10px] uppercase tracking-wide">Name</label>
          <input
            value={comp.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="e.g. Basic Salary"
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs mt-0.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        {/* Code */}
        <div className="col-span-2">
          <label className="text-gray-400 text-[10px] uppercase tracking-wide">Code</label>
          <input
            value={comp.code}
            onChange={(e) => onChange('code', e.target.value.toUpperCase())}
            placeholder="BASIC"
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs mt-0.5 uppercase focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        {/* Type */}
        <div className="col-span-2">
          <label className="text-gray-400 text-[10px] uppercase tracking-wide">Type</label>
          <select
            value={comp.type}
            onChange={(e) => onChange('type', e.target.value)}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs mt-0.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
          >
            {COMP_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Calc Type */}
        <div className="col-span-2">
          <label className="text-gray-400 text-[10px] uppercase tracking-wide">Calculation</label>
          <select
            value={comp.calculationType}
            onChange={(e) => onChange('calculationType', e.target.value)}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs mt-0.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
          >
            {CALC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Value */}
        <div className="col-span-1">
          <label className="text-gray-400 text-[10px] uppercase tracking-wide">Value</label>
          <input
            type="number"
            min="0"
            value={comp.value}
            onChange={(e) => onChange('value', e.target.value)}
            disabled={comp.calculationType === 'RESIDUAL'}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs mt-0.5 focus:outline-none focus:ring-1 focus:ring-orange-400 disabled:bg-gray-50"
          />
        </div>

        {/* Cap */}
        <div className="col-span-1">
          <label className="text-gray-400 text-[10px] uppercase tracking-wide">Cap</label>
          <input
            type="number"
            min="0"
            value={comp.cap ?? ''}
            onChange={(e) => onChange('cap', e.target.value)}
            placeholder="—"
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs mt-0.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        {/* Controls */}
        <div className="col-span-1 flex flex-col items-end gap-1 pt-4">
          <button onClick={onMoveUp} disabled={isFirst} className="text-gray-300 hover:text-[#FF7B30] disabled:opacity-20 transition">
            <ChevronUp size={13} />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="text-gray-300 hover:text-[#FF7B30] disabled:opacity-20 transition">
            <ChevronDown size={13} />
          </button>
          <button onClick={onRemove} className="text-red-300 hover:text-red-500 mt-0.5 transition">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Toggles row */}
      <div className="flex items-center gap-4 mt-2.5 pt-2 border-t border-gray-100">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={comp.isTaxable}
            onChange={(e) => onChange('isTaxable', e.target.checked)}
            className="accent-orange-500"
          />
          <span className="text-[10px] text-gray-500">Taxable</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={comp.isActive}
            onChange={(e) => onChange('isActive', e.target.checked)}
            className="accent-orange-500"
          />
          <span className="text-[10px] text-gray-500">Active</span>
        </label>
        {comp.calculationType === 'RESIDUAL' && (
          <span className="text-[10px] text-amber-600 flex items-center gap-1">
            <AlertCircle size={11} /> Auto-computed
          </span>
        )}
      </div>
    </div>
  );
}
