'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BaseModal from '../../../components/Common/Modal';
import { toast, Toaster } from 'sonner';

export default function ShiftModal({
  mode = 'add',
  shift = null,
  isVisible = false,
  onClose,
  onSaved,
  onDeleted,
  deletePermission
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
        beforeShiftStart: shift.shiftMargin?.beforeShiftStart ?? '',
        afterShiftEnd: shift.shiftMargin?.afterShiftEnd ?? '',
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

  const to12Hour = (hour24, minute) => {
    const period = hour24 >= 12 ? 'PM' : 'AM';
    let h12 = hour24 % 12;
    if (h12 === 0) h12 = 12;
    return `${String(h12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
  };

  function normalizeTime(value) {
    if (!value && value !== 0) return null;
    const v = String(value).trim();

    const m = v.match(/^(\d{1,2}):([0-5][0-9])\s*(AM|PM|am|pm)?$/);
    if (!m) return null;

    let hour = parseInt(m[1], 10);
    const minute = parseInt(m[2], 10);
    const ampm = m[3];

    if (ampm) {
      const up = ampm.toUpperCase();
      if (hour < 1 || hour > 12) return null;
      if (up === 'AM') {
        if (hour === 12) hour = 0;
      } else {
        if (hour !== 12) hour = hour + 12;
      }
      return to12Hour(hour, minute);
    } else {
      if (hour < 0 || hour > 23) return null;
      return to12Hour(hour, minute);
    }
  }

  function parseMargin(val) {
    if (val === '' || val === null || val === undefined) return undefined;
    const s = String(val).trim();
    if (!/^\d+$/.test(s)) return NaN;
    const n = Number(s);
    if (!Number.isInteger(n) || n < 0 || n > 1440) return NaN;
    return n;
  }

  async function handleSubmit() {
    setError('');

    if (!form.name.trim()) {
      setError('Name is required');
      toast.error('Name is required');
      return;
    }
    const normalizedStart = normalizeTime(form.startTime || '');
    const normalizedEnd = normalizeTime(form.endTime || '');

    if (!normalizedStart) {
      setError('Start time is invalid. Use HH:MM AM/PM (e.g. 09:00 AM) or 24h 13:30');
      toast.error('Start time is invalid. Use HH:MM AM/PM (e.g. 09:00 AM) or 24h 13:30');
      return;
    }
    if (!normalizedEnd) {
      setError('End time is invalid. Use HH:MM AM/PM (e.g. 06:00 PM) or 24h 18:00');
      toast.error('End time is invalid. Use HH:MM AM/PM (e.g. 06:00 PM) or 24h 18:00');
      return;
    }

    const before = parseMargin(form.beforeShiftStart);
    const after = parseMargin(form.afterShiftEnd);
    if (Number.isNaN(before) || Number.isNaN(after)) {
      setError('Shift margin must be whole minutes between 0 and 1440');
      toast.error('Shift margin must be whole minutes between 0 and 1440');
      return;
    }
    const payload = {
      name: form.name.trim(),
      startTime: normalizedStart,
      endTime: normalizedEnd,
      shiftMargin: {
        ...(before !== undefined ? { beforeShiftStart: before } : {}),
        ...(after !== undefined ? { afterShiftEnd: after } : {}),
      },
    };

    setLoading(true);
    const tId = toast.loading(isEdit ? 'Saving shift...' : 'Adding shift...');

    try {
      if (isEdit && shift && shift._id) {
        const res = await axios.put(
          `/hrms/organization/update-shift/${shift._id}`,
          payload
        );
        const updated = res?.data?.result || res?.data;
        onSaved && onSaved(updated);
        toast.success('Shift updated', { id: tId });
      } else {
        const res = await axios.post('/hrms/organization/add-shift', payload);
        const created = res?.data?.result || res?.data;
        onSaved && onSaved(created);
        toast.success('Shift added', { id: tId });
      }
      onClose && onClose();
    } catch (err) {
      console.error('Error saving shift', err);
      const msg = err?.response?.data?.message || 'Failed to save shift';
      setError(msg);
      toast.error(msg, { id: tId });
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

    async function handleDelete() {
  if (!shift?._id) return;
 

  setLoading(true);
  const tId = toast.loading('Deleting shift...');

  try {
    await axios.delete(`/hrms/organization/delete-shift/${shift._id}`);
    onDeleted && onDeleted(shift._id);
    toast.success('Shift deleted', { id: tId });
    onClose && onClose();
  } catch (err) {
    console.error('Delete failed', err);
    const msg = err?.response?.data?.message || 'Failed to delete shift';
    setError(msg);
    toast.error(msg, { id: tId });
  } finally {
    setLoading(false);
  }
}
  const rightHeaderContent = isEdit ? (deletePermission&&
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
      <Toaster richColors position="top-right" />

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
              placeholder="e.g. 09:00 AM or 13:30"
            />
            <div className="text-xs text-gray-400 mt-1">Format: <strong>HH:MM AM/PM</strong> (or 24h <strong>HH:MM</strong>)</div>
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
              placeholder="e.g. 06:00 PM or 18:00"
            />
            <div className="text-xs text-gray-400 mt-1">Format: <strong>HH:MM AM/PM</strong> (or 24h <strong>HH:MM</strong>)</div>
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
            <div className="text-xs text-gray-400 mt-1">Whole minutes, 0–1440</div>
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
            <div className="text-xs text-gray-400 mt-1">Whole minutes, 0–1440</div>
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
