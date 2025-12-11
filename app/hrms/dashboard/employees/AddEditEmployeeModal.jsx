'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * AddEditEmployeeModal
 *
 * Props:
 * - mode: 'add' | 'edit' | 'view'
 * - employee: object | null (for edit/view)
 * - onClose: fn()
 * - onSave: fn(employee) -> called when form is saved (add or edit)
 *
 * This is a controlled internal form with 3 steps:
 *  1. Personal (first, last, email, mobile, dob, gender, image)
 *  2. Job (employeeId, department, designation, reportingManager, joinDate)
 *  3. Employment (employmentType, employmentStatus, availableLeave)
 *
 * For 'view' mode the fields are read-only.
 */

export default function AddEditEmployeeModal({ mode = 'add', employee = null, onClose, onSave }) {
  const modalRef = useRef(null);
  const [step, setStep] = useState(1);

  // init form (merge defaults)
  const empty = {
    employeeId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    imageUrl: '',
    mobileNumber: '',
    gender: '',
    about: '',
    departmentName: '',
    designationName: '',
    reportingManagerName: '',
    dateOfJoining: '',
    employmentType: 'Permanent',
    employmentStatus: 'Active',
    availableLeave: '',
  };

  const [form, setForm] = useState(() => ({ ...empty, ...(employee || {}) }));
  const [errors, setErrors] = useState({});

  // keep form in sync when employee changes (e.g. open edit)
  useEffect(() => {
    setForm({ ...empty, ...(employee || {}) });
    setStep(1);
    setErrors({});
  }, [employee]);

  // close on Esc
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // click outside to close
  useEffect(() => {
    function handleClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  function update(field, value) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  function validateStep(currentStep = step) {
    const e = {};
    if (currentStep === 1) {
      if (!form.firstName) e.firstName = 'Required';
      if (!form.email) e.email = 'Required';
    }
    if (currentStep === 2) {
      if (!form.departmentName) e.departmentName = 'Required';
      if (!form.designationName) e.designationName = 'Required';
    }
    // no strict validation for step 3 (optional)
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) {
      setStep((s) => Math.min(3, s + 1));
    }
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  function submit() {
    // validate all steps
    const ok = validateStep(1) && validateStep(2);
    if (!ok) {
      // jump to first error step
      if (!validateStep(1)) setStep(1);
      else if (!validateStep(2)) setStep(2);
      return;
    }

    // assemble employee object (simple)
    const out = {
      ...form,
      id: form.id || Date.now(), // temporary id
      name: `${form.firstName} ${form.lastName}`.trim(),
      department: form.departmentName,
      designation: form.designationName,
      avatar: form.imageUrl || `https://i.pravatar.cc/160?u=${form.email || Date.now()}`,
    };

    // call parent save
    onSave && onSave(out);
    onClose && onClose();
  }

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const primaryLabel = isView ? 'Close' : isEdit ? 'Save changes' : 'Create employee';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        ref={modalRef}
        className="relative w-[min(900px,95%)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-blackText)]">
              {mode === 'add' ? 'Add Employee' : mode === 'edit' ? 'Edit Employee' : 'View Employee'}
            </h2>
            <div className="text-sm text-[var(--color-primaryText)] mt-1">Multi-step employee form</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-[var(--color-primaryText)]">{/* step indicator */}</div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
            >
              ✕
            </button>
          </div>
        </div>

        {/* stepper */}
        <div className="px-6 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                <div className="text-sm text-[var(--color-primaryText)]">
                  {s === 1 ? 'Personal' : s === 2 ? 'Job' : 'Employment'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* body */}
        <div className="p-6">
          {/* Step 1: Personal */}
          <div hidden={step !== 1} className={step === 1 ? '' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">First name</label>
                <input
                  value={form.firstName || ''}
                  onChange={(e) => update('firstName', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
                {errors.firstName && <div className="text-xs text-red-500 mt-1">{errors.firstName}</div>}
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Last name</label>
                <input
                  value={form.lastName || ''}
                  onChange={(e) => update('lastName', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Email</label>
                <input
                  value={form.email || ''}
                  onChange={(e) => update('email', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
                {errors.email && <div className="text-xs text-red-500 mt-1">{errors.email}</div>}
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Mobile</label>
                <input
                  value={form.mobileNumber || ''}
                  onChange={(e) => update('mobileNumber', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Date of birth</label>
                <input
                  value={form.dateOfBirth || ''}
                  onChange={(e) => update('dateOfBirth', e.target.value)}
                  type="date"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Gender</label>
                <select
                  value={form.gender || ''}
                  onChange={(e) => update('gender', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled={isView}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-[var(--color-primaryText)]">Profile image URL</label>
                <input
                  value={form.imageUrl || ''}
                  onChange={(e) => update('imageUrl', e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
                {form.imageUrl && (
                  <div className="mt-2">
                    <img src={form.imageUrl} alt="preview" className="w-28 h-28 object-cover rounded-full" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Job */}
          <div hidden={step !== 2} className={step === 2 ? '' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Employee ID</label>
                <input
                  value={form.employeeId || ''}
                  onChange={(e) => update('employeeId', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Department</label>
                <input
                  value={form.departmentName || ''}
                  onChange={(e) => update('departmentName', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
                {errors.departmentName && <div className="text-xs text-red-500 mt-1">{errors.departmentName}</div>}
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Designation</label>
                <input
                  value={form.designationName || ''}
                  onChange={(e) => update('designationName', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
                {errors.designationName && <div className="text-xs text-red-500 mt-1">{errors.designationName}</div>}
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Reporting Manager</label>
                <input
                  value={form.reportingManagerName || ''}
                  onChange={(e) => update('reportingManagerName', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Date of Joining</label>
                <input
                  value={form.dateOfJoining || ''}
                  onChange={(e) => update('dateOfJoining', e.target.value)}
                  type="date"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>
            </div>
          </div>

          {/* Step 3: Employment */}
          <div hidden={step !== 3} className={step === 3 ? '' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Employment Type</label>
                <select
                  value={form.employmentType}
                  onChange={(e) => update('employmentType', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled={isView}
                >
                  <option>Permanent</option>
                  <option>Contract</option>
                  <option>Internship</option>
                  <option>Trainee</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Employment Status</label>
                <select
                  value={form.employmentStatus}
                  onChange={(e) => update('employmentStatus', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled={isView}
                >
                  <option>Active</option>
                  <option>On Probation</option>
                  <option>Resigned</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Available Leave (days)</label>
                <input
                  value={form.availableLeave || ''}
                  onChange={(e) => update('availableLeave', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-[var(--color-primaryText)]">About / Notes</label>
                <textarea
                  value={form.about || ''}
                  onChange={(e) => update('about', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  rows={3}
                  readOnly={isView}
                />
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <div>
            {!isView && (
              <>
                {step > 1 && (
                  <button onClick={back} className="px-3 py-2 rounded-md bg-white border text-sm mr-2">
                    Back
                  </button>
                )}
                {step < 3 && (
                  <button onClick={next} className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-white text-sm">
                    Continue
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-3 py-2 rounded-md bg-white border text-sm">
              Cancel
            </button>

            {!isView ? (
              <button onClick={submit} className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-white font-semibold">
                {primaryLabel}
              </button>
            ) : (
              <button onClick={onClose} className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-white font-semibold">
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
