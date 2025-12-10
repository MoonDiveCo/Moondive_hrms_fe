'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

/**
 * AddDesignationModal
 * Props:
 * - mode: 'add' | 'edit' | 'view'
 * - designation: object | null
 * - isVisible: boolean
 * - onClose: fn
 * - onSaved: fn(updatedOrCreatedDesignation)
 * - onDeleted: fn(designationId)
 */
export default function AddDesignationModal({
  mode = 'add',
  designation = null,
  isVisible = false,
  onClose,
  onSaved,
  onDeleted,
}) {
  const modalRef = useRef(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    mailAlias: '',
    skillsRequired: [],
    skillInput: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (designation && (isEdit || isView)) {
      setForm({
        name: designation.name || '',
        description: designation.description || '',
        mailAlias: designation.mailAlias || '',
        skillsRequired: Array.isArray(designation.skillsRequired)
          ? designation.skillsRequired
          : [],
        skillInput: '',
      });
    } else {
      setForm({ name: '', description: '', mailAlias: '', skillsRequired: [], skillInput: '' });
    }
    setError('');
  }, [designation, mode, isVisible]);

  // close on Esc / outside click
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose && onClose();
    }
    function onDocClick(e) {
      if (!modalRef.current) return;
      if (!modalRef.current.contains(e.target)) onClose && onClose();
    }
    if (isVisible) {
      window.addEventListener('keydown', onKey);
      document.addEventListener('mousedown', onDocClick);
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  function updateField(name, value) {
    setForm((s) => ({ ...s, [name]: value }));
  }

  function addSkillFromInput() {
    const val = form.skillInput.trim();
    if (!val) return;
    if (!form.skillsRequired.includes(val)) {
      setForm((s) => ({ ...s, skillsRequired: [...s.skillsRequired, val], skillInput: '' }));
    } else {
      setForm((s) => ({ ...s, skillInput: '' }));
    }
  }

  function removeSkill(idx) {
    setForm((s) => {
      const copy = [...s.skillsRequired];
      copy.splice(idx, 1);
      return { ...s, skillsRequired: copy };
    });
  }

  function onSkillKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',' ) {
      e.preventDefault();
      addSkillFromInput();
    }
    if (e.key === 'Backspace' && form.skillInput === '' && form.skillsRequired.length > 0) {
      // remove last
      removeSkill(form.skillsRequired.length - 1);
    }
  }

  async function handleSubmit() {
    setError('');
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setLoading(true);
    try {
      if (isEdit && designation && designation._id) {
        const res = await axios.put(`/hrms/organization/update-designation/${designation._id}`, {
          name: form.name,
          description: form.description,
          skillsRequired: form.skillsRequired,
          mailAlias: form.mailAlias,
        });
        const updated = res?.data?.result || res?.data;
        onSaved && onSaved(updated);
      } else {
        const res = await axios.post('/hrms/organization/add-designation', {
          name: form.name,
          description: form.description,
          skillsRequired: form.skillsRequired,
          mailAlias: form.mailAlias,
        });
        const created = res?.data?.result || res?.data;
        onSaved && onSaved(created);
      }
      onClose && onClose();
    } catch (err) {
      console.error('Error saving designation', err);
      const msg = err?.response?.data?.message || 'Failed to save designation';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!designation?._id) return;
    const ok = window.confirm('Delete this designation?');
    if (!ok) return;
    setLoading(true);
    try {
      await axios.delete(`/hrms/organization/delete-designation/${designation._id}`);
      onDeleted && onDeleted(designation._id);
      onClose && onClose();
    } catch (err) {
      console.error('Delete failed', err);
      setError('Failed to delete designation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div ref={modalRef} className="relative bg-white rounded-2xl shadow-xl w-full max-w-[900px] mx-4 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h4 className="text-lg font-semibold text-[var(--color-blackText)]">
              {isView ? 'View Designation' : isEdit ? 'Edit Designation' : 'Add Designation'}
            </h4>
            <div className="text-sm text-[var(--color-primaryText)]">
              {isView ? 'Read-only' : 'Provide details for this designation'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEdit && (
              <button onClick={handleDelete} className="px-3 py-2 rounded-md bg-red-50 text-red-600 border border-red-100 hover:bg-red-100">
                Delete
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-md text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
              <input
                name="name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                readOnly={isView}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                readOnly={isView}
                rows={5}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] resize-none"
                placeholder="Describe responsibilities & expectations"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mail Alias</label>
              <input
                name="mailAlias"
                value={form.mailAlias}
                onChange={(e) => updateField('mailAlias', e.target.value)}
                readOnly={isView}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]"
                placeholder="designation@company.com"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Skills (press Enter or comma to add)</label>
              <div className="mt-1">
                <div className="flex flex-wrap gap-2">
                  {form.skillsRequired.map((s, i) => (
                    <div key={s + '-' + i} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm">
                      <span>{s}</span>
                      {!isView && (
                        <button
                          onClick={() => removeSkill(i)}
                          type="button"
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {!isView && (
                    <input
                      value={form.skillInput}
                      onChange={(e) => updateField('skillInput', e.target.value)}
                      onKeyDown={onSkillKeyDown}
                      onBlur={addSkillFromInput}
                      placeholder="Add skill..."
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]"
                    />
                  )}
                </div>
              </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={onClose} className="px-4 py-2 bg-white border rounded-md">
                {isView ? 'Close' : 'Cancel'}
              </button>

              {!isView && (
                <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md">
                  {loading ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save changes' : 'Add Designation')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
