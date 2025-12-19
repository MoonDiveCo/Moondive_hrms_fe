'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const ALL_PERMISSIONS = [
  'USER_CREATE',
  'USER_VIEW',
  'USER_UPDATE',
  'USER_DELETE',
  'ROLE_MANAGE',
  'LEAVE_APPROVE',
  'DEPARTMENT_MANAGE',
];

export default function AddUserRole({ onClose, onSuccess }) {
  const modalRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    permissions: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  const togglePermission = (permission) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await axios.post('/hrms/roles/add-role', {
        name: form.name.trim(),
        permissions: form.permissions,
      });

      onSuccess(); // refresh list
      onClose();   // close modal
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-[980px] mx-4 overflow-hidden"
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              Add Role
            </h4>
            <div className="text-sm text-gray-500">
              Create a new user role
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            {/* Role Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={handleChange}
                className="
                  w-full px-3 py-2 border border-gray-300 rounded-md
                  focus:outline-none focus:ring-0
                  focus:border-[var(--color-primary)]
                "
                placeholder="e.g. HR, Manager"
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Permissions
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_PERMISSIONS.map((permission) => (
                <label
                  key={permission}
                  className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                  />
                  <span className="text-sm text-gray-700">
                    {permission}
                  </span>
                </label>
              ))}
            </div>

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            {/* actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md"
              >
                {loading ? 'Adding...' : 'Add Role'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
