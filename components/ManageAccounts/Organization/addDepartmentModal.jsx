'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

/**
 * Reusable Add/Edit/View Department Modal
 *
 * Props:
 * - mode: 'add' | 'edit' | 'view'
 * - department: object | null   (for edit/view)
 * - departments: array (for parent dropdown)
 * - isVisible: boolean
 * - onClose: fn()
 * - onSaved: fn(newDept) -> called after add or edit (parent updates list)
 * - onDeleted: fn(deptId) -> called after successful delete
 */
export default function AddDepartmentModal({
  mode = 'add',
  department = null,
  departments = [],
  isVisible = false,
  onClose,
  onSaved,
  onDeleted,
}) {
  const modalRef = useRef(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    parentDepartment: '',
    departmentLead: '',
    mailAlias: '',
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const title = isView
    ? 'View Department'
    : isEdit
    ? 'Edit Department'
    : 'Add Department';
  const submitLabel = isEdit ? 'Save changes' : 'Add Department';

  // sync form when department or mode changes
  useEffect(() => {
    if (department && (isEdit || isView)) {
      setForm({
        name: department.name || '',
        description: department.description || '',
        parentDepartment:
          department.parentDepartment?._id || department.parentDepartment || '',
        departmentLead:
          department.departmentLead?._id || department.departmentLead || '',
        mailAlias: department.mailAlias || '',
      });
    } else {
      setForm({
        name: '',
        description: '',
        parentDepartment: '',
        departmentLead: '',
        mailAlias: '',
      });
    }
    setError('');
  }, [department, mode, isVisible]);

  // fetch users for departmentLead select
  useEffect(() => {
    let mounted = true;
    async function fetchUsers() {
      try {
        const res = await axios.get('/hrms/employee/list');
        if (mounted) setUsers(res?.data?.result || []);
      } catch (err) {
        console.error('Error fetching users', err);
      }
    }
    fetchUsers();
    return () => (mounted = false);
  }, []);

  // close handlers (Esc + outside click)
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose && onClose();
    }
    function onDocClick(e) {
      if (!modalRef.current) return;
      if (!modalRef.current.contains(e.target)) {
        onClose && onClose();
      }
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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit() {
    setError('');
    if (!form.name || !form.departmentLead) {
      setError('Please fill required fields: Name and Department Head');
      return;
    }
    setLoading(true);
    try {
      if (isEdit && department && department._id) {
        const res = await axios.put(
          `/hrms/organization/update-department/${department._id}`,
          {
            name: form.name,
            description: form.description,
            parentDepartment: form.parentDepartment || '',
            departmentLead: form.departmentLead,
            mailAlias: form.mailAlias,
          }
        );
        const updated = res?.data?.result || res?.data;
        onSaved && onSaved(updated);
      } else {
        const res = await axios.post('/hrms/organization/add-department', {
          name: form.name,
          description: form.description,
          parentDepartment: form.parentDepartment || '',
          departmentLead: form.departmentLead,
          mailAlias: form.mailAlias,
        });
        const created = res?.data?.result || res?.data;
        onSaved && onSaved(created);
      }
      onClose && onClose();
    } catch (err) {
      console.error('Error saving department', err);
      const msg =
        err?.response?.data?.message || 'Failed to save department. Try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!department?._id) return;
    const ok = window.confirm(
      'Are you sure you want to delete this department? This action cannot be undone.'
    );
    if (!ok) return;
    setLoading(true);
    try {
      await axios.delete(
        `/hrms/organization/delete-department/${department._id}`
      );
      onDeleted && onDeleted(department._id);
      onClose && onClose();
    } catch (err) {
      console.error('Error deleting department', err);
      const msg =
        err?.response?.data?.message || 'Failed to delete department.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center'>
      {/* backdrop */}
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' />

      {/* modal (horizontal / wide) */}
      <div
        ref={modalRef}
        className='relative bg-white rounded-2xl shadow-xl w-full max-w-[980px] mx-4 overflow-hidden'
      >
        {/* header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10'>
          <div>
            <h4 className='text-lg font-semibold text-gray-900'>{title}</h4>
            <div className='text-sm text-[var(--color-primaryText)]'>
              {isView
                ? 'Viewing department details'
                : isEdit
                ? 'Edit department details'
                : 'Create a new department'}
            </div>
          </div>

          <div className='flex items-center gap-3'>
            {/* Only show Delete when editing */}
            {isEdit && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className='px-3 py-2 rounded-md bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
              >
                Delete
              </button>
            )}

            <button
              onClick={onClose}
              className='p-2 rounded-md text-gray-500 hover:text-gray-700'
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* body (2-column horizontal layout) */}
        <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            {/* Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Department Name <span className='text-red-500'>*</span>
              </label>
              <input
                name='name'
                value={form.name}
                onChange={handleChange}
                readOnly={isView}
                className='
  w-full px-3 py-2 border border-gray-300 rounded-md 
  focus:outline-none 
  focus:ring-0 
  focus:border-[var(--color-primary)]
'
                placeholder='e.g. Engineering'
              />
            </div>

            {/* Description */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Description
              </label>
              <textarea
                name='description'
                value={form.description}
                onChange={handleChange}
                readOnly={isView}
                rows={5}
                className='
  w-full px-3 py-2 border border-gray-300 rounded-md 
  focus:outline-none 
  focus:ring-0 
  focus:border-[var(--color-primary)]
'
                placeholder='Describe department responsibilities'
              />
            </div>

            {/* Mail Alias */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Mail Alias
              </label>
              <input
                name='mailAlias'
                value={form.mailAlias}
                onChange={handleChange}
                readOnly={isView}
                className='
  w-full px-3 py-2 border border-gray-300 rounded-md 
  focus:outline-none 
  focus:ring-0 
  focus:border-[var(--color-primary)]
'
                placeholder='department@company.com'
              />
            </div>
          </div>

          <div className='space-y-4'>
            {/* Parent Department */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Parent Department
              </label>
              <select
                name='parentDepartment'
                value={form.parentDepartment}
                onChange={handleChange}
                disabled={isView}
                className='
  w-full px-3 py-2 border border-gray-300 rounded-md 
  focus:outline-none 
  focus:ring-0 
  focus:border-[var(--color-primary)]
'
              >
                <option value=''>No parent</option>
                {departments?.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Lead */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Department Head <span className='text-red-500'>*</span>
              </label>
              <select
                name='departmentLead'
                value={form.departmentLead}
                onChange={handleChange}
                disabled={isView}
                className='
  w-full px-3 py-2 border border-gray-300 rounded-md 
  focus:outline-none 
  focus:ring-0 
  focus:border-[var(--color-primary)]
'
              >
                <option value=''>Select department head</option>
                {users?.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* small help text */}
            {error && <div className='text-sm text-red-600'>{error}</div>}

            {/* actions (when view mode, only close) */}
            <div className='flex justify-end gap-3 mt-6'>

              {!isView && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className='px-4 py-2 bg-[var(--color-primary)] text-white rounded-md'
                >
                  {loading ? (isEdit ? 'Saving...' : 'Adding...') : submitLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
