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
        startTime: convert12To24(shift.startTime) || '',
        endTime: convert12To24(shift.endTime) || '',
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

  function convert24To12(time) {

    if (!time) return null;

    const [h, m] = time.split(":").map(Number);

    const period = h >= 12 ? "PM" : "AM";
    let hour = h % 12;

    if (hour === 0) hour = 12;

    return `${String(hour).padStart(2,'0')}:${String(m).padStart(2,'0')} ${period}`;

  }

  function convert12To24(time) {

    if (!time) return '';

    const match = time.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
    if (!match) return '';

    let hour = parseInt(match[1]);
    const minute = match[2];
    const period = match[3].toUpperCase();

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return `${String(hour).padStart(2,'0')}:${minute}`;

  }


  /* ---------------- Submit ---------------- */

  async function handleSubmit() {

    setError('');

    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!form.startTime || !form.endTime) {
      toast.error('Start and End time required');
      return;
    }

    if (form.startTime >= form.endTime) {
      toast.error("End time must be after start time");
      return;
    }

    const payload = {

      name: form.name.trim(),

      startTime: convert24To12(form.startTime),
      endTime: convert24To12(form.endTime),

      shiftMargin: {

        ...(form.beforeShiftStart !== '' && {
          beforeShiftStart: Number(form.beforeShiftStart)
        }),

        ...(form.afterShiftEnd !== '' && {
          afterShiftEnd: Number(form.afterShiftEnd)
        }),

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

        const res = await axios.post(
          '/hrms/organization/add-shift',
          payload
        );

        const created = res?.data?.result || res?.data;

        onSaved && onSaved(created);

        toast.success('Shift added', { id: tId });

      }

      onClose && onClose();

    } catch (err) {

      console.error(err);

      const msg = err?.response?.data?.message || 'Failed to save shift';

      setError(msg);

      toast.error(msg, { id: tId });

    } finally {

      setLoading(false);

    }

  }


  /* ---------------- Delete ---------------- */

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

      const msg = err?.response?.data?.message || 'Failed to delete shift';

      toast.error(msg, { id: tId });

    } finally {

      setLoading(false);

    }

  }


  /* ---------------- UI ---------------- */

  const headerTitle = isView
    ? 'View Shift'
    : isEdit
    ? 'Edit Shift'
    : 'Add Shift';

  const headerSubtitle = isView
    ? 'Read-only shift details'
    : 'Provide details for this shift';


  const rightHeaderContent = isEdit ? (deletePermission &&
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
            <label className="block text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>

            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              readOnly={isView}
              className="mt-1 w-full px-3 py-2 border rounded-md"
              placeholder="Morning Shift"
            />
          </div>


          <div>
            <label className="block text-sm font-medium">
              Start Time <span className="text-red-500">*</span>
            </label>

            <input
              type="time"
              value={form.startTime}
              onChange={(e) => updateField('startTime', e.target.value)}
              disabled={isView}
              className="mt-1 w-full px-3 py-2 border rounded-md"
            />
          </div>


          <div>
            <label className="block text-sm font-medium">
              End Time <span className="text-red-500">*</span>
            </label>

            <input
              type="time"
              value={form.endTime}
              onChange={(e) => updateField('endTime', e.target.value)}
              disabled={isView}
              className="mt-1 w-full px-3 py-2 border rounded-md"
            />
          </div>

        </div>


        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium">
              Margin Before Shift Start (minutes)
            </label>

            <input
              type="number"
              min="0"
              max="1440"
              value={form.beforeShiftStart}
              onChange={(e) => updateField('beforeShiftStart', e.target.value)}
              disabled={isView}
              className="mt-1 w-full px-3 py-2 border rounded-md"
              placeholder="15"
            />
          </div>


          <div>
            <label className="block text-sm font-medium">
              Margin After Shift End (minutes)
            </label>

            <input
              type="number"
              min="0"
              max="1440"
              value={form.afterShiftEnd}
              onChange={(e) => updateField('afterShiftEnd', e.target.value)}
              disabled={isView}
              className="mt-1 w-full px-3 py-2 border rounded-md"
              placeholder="30"
            />
          </div>


          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}


          <div className="flex justify-end gap-3 mt-6">

            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
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