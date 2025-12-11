'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BaseModal from '../../../components/Common/Modal';

export default function ShiftModal({
  mode = 'add',      
  shift = null,
  isVisible = false,
  onClose,
  onSaved,
  onDeleted,
}) {
  const [form, setForm] = useState({
    name: '',
    startTime: '',
    endTime: '',
    beforeShiftStart: '',
    afterShiftEnd: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (shift && (isEdit || isView)) {
      setForm({
        name: shift.name || '',
        startTime: shift.startTime || '',
        endTime: shift.endTime || '',
        beforeShiftStart: shift.shiftMargin?.beforeShiftStart || '',
        afterShiftEnd: shift.shiftMargin?.afterShiftEnd || '',
      });
    } else {
      setForm({
        name: '',
        startTime: '',
        endTime: '',
        beforeShiftStart: '',
        afterShiftEnd: '',
      });
    }
    setError('');
  }, [shift, mode, isVisible]);

  function updateField(name, value) {
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit() {
    setError('');
    if (!form.name.trim()) return setError('Name is required');
    if (!form.startTime.trim()) return setError('Start time is required');
    if (!form.endTime.trim()) return setError('End time is required');

    const payload = {
      name: form.name,
      startTime: form.startTime,
      endTime: form.endTime,
      shiftMargin: {
        beforeShiftStart: form.beforeShiftStart || undefined,
        afterShiftEnd: form.afterShiftEnd || undefined,
      },
    };

    setLoading(true);
    try {
      if (isEdit && shift && shift._id) {
        const res = await axios.put(
          `/hrms/organization/update-shift/${shift._id}`,
          payload
        );
        const updated = res?.data?.result || res?.data;
        onSaved && onSaved(updated);
      } else {
        const res = await axios.post('/hrms/organization/add-shift', payload);
        const created = res?.data?.result || res?.data;
        onSaved && onSaved(created);
      }
      onClose && onClose();
    } catch (err) {
      console.error('Error saving shift', err);
      const msg =
        err?.response?.data?.message || 'Failed to save shift';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!shift?._id) return;
    const ok = window.confirm('Delete this shift?');
    if (!ok) return;
    setLoading(true);
    try {
      await axios.delete(`/hrms/organization/delete-shift/${shift._id}`);
      onDeleted && onDeleted(shift._id);
      onClose && onClose();
    } catch (err) {
      console.error('Delete failed', err);
      setError('Failed to delete shift');
    } finally {
      setLoading(false);
    }
  }

  const headerTitle = isView
    ? 'View Shift'
    : isEdit
    ? 'Edit Shift'
    : 'Add Shift';

  const headerSubtitle = isView
    ? 'Read-only shift details'
    : 'Provide details for this shift';

  const rightHeaderContent = isEdit ? (
    <button
      onClick={handleDelete}
      className="px-3 py-2 rounded-md bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
    >
      Delete
    </button>
  ) : null;

  return (
    <BaseModal
      isVisible={isVisible}
      title={headerTitle}
      subtitle={headerSubtitle}
      onClose={onClose}
      rightHeaderContent={rightHeaderContent}
      maxWidth="800px"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              readOnly={isView}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="e.g. Morning Shift"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              value={form.startTime}
              onChange={(e) => updateField('startTime', e.target.value)}
              readOnly={isView}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="e.g. 09:00 AM"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              value={form.endTime}
              onChange={(e) => updateField('endTime', e.target.value)}
              readOnly={isView}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="e.g. 06:00 PM"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Margin Before Shift Start (minutes)
            </label>
            <input
              value={form.beforeShiftStart}
              onChange={(e) =>
                updateField('beforeShiftStart', e.target.value)
              }
              readOnly={isView}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="e.g. 15"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Margin After Shift End (minutes)
            </label>
            <input
              value={form.afterShiftEnd}
              onChange={(e) =>
                updateField('afterShiftEnd', e.target.value)
              }
              readOnly={isView}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="e.g. 30"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border rounded-md"
            >
              {isView ? 'Close' : 'Cancel'}
            </button>

            {!isView && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                {loading
                  ? isEdit
                    ? 'Saving...'
                    : 'Adding...'
                  : isEdit
                  ? 'Save changes'
                  : 'Add Shift'}
              </button>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
