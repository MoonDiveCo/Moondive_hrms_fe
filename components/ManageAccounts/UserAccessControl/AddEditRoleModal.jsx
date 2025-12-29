'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { ACTION_PERMISSIONS } from '@/constants/NestedDashboard';


const ACTION_COLUMNS = ['WRITE', 'EDIT', 'VIEW', 'DELETE'];

export default function AddEditRoleModal({
  onClose,
  onSuccess,
  mode = 'add',
  role = null,
}) {
  const modalRef = useRef(null);

  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && role) {
      setRoleName(role.name || '');
      setPermissions(role.permissions || []);
    }
  }, [mode, role]);

  const permissionMatrix = useMemo(() => {
    const matrix = {};

    Object.values(ACTION_PERMISSIONS).forEach((perm) => {
      const parts = perm.split(':'); // HRMS:EMPLOYEE:WRITE
      if (parts.length !== 3) return;

      const module = parts[1];
      const action = parts[2];

      if (!matrix[module]) matrix[module] = new Set();
      matrix[module].add(action);
    });

    return Object.entries(matrix).map(([module, actions]) => ({
      module,
      actions: Array.from(actions),
    }));
  }, []);


  const togglePermission = (permission) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };


  const handleSubmit = async () => {
    if (!roleName.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        name: roleName.trim(),
        permissions,
      };

      if (mode === 'edit') {
        await axios.patch(`/hrms/roles/update-role/${role._id}`, payload);
      } else {
        await axios.post('/hrms/roles/add-role', payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden"
      >
        
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h3 className="text-xl font-semibold">
              {mode === 'edit' ? 'Edit Role' : 'Add Role'}
            </h3>
            <p className="text-sm text-gray-500">
              Create a new user role
            </p>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        
        <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          <div className="max-w-md">
            <label className="block text-sm font-medium">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="mt-2 w-full rounded-md border px-3 py-2 focus:border-[var(--color-primary)]"
              placeholder="e.g. HR, Manager"
            />
          </div>

          
          <div>
            <h4 className="text-sm font-medium mb-3">Permissions</h4>

            <div className="overflow-hidden border border-[#D0D5DD] rounded-lg">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold w-1/3">
                      Module
                    </th>
                    {ACTION_COLUMNS.map((action) => (
                      <th
                        key={action}
                        className="px-3 py-3 text-center text-sm font-semibold"
                      >
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y bg-white">
                  {permissionMatrix.map(({ module, actions }) => (
                    <tr
                      key={module}
                      className="hover:bg-gray-50 border border-[#D0D5DD]"
                    >
                      <td className="px-4 py-4 font-medium">
                        {module}
                      </td>

                      {ACTION_COLUMNS.map((action) => {
                        const permission = Object.values(
                          ACTION_PERMISSIONS
                        ).find(
                          (p) =>
                            p.endsWith(`:${module}:${action}`)
                        );

                        const allowed = actions.includes(action);
                        const checked =
                          permission &&
                          permissions.includes(permission);

                        return (
                          <td
                            key={action}
                            className="px-3 py-4 text-center"
                          >
                            <div className="relative inline-flex items-center">
                              <input
                                type="checkbox"
                                disabled={!allowed}
                                checked={checked}
                                onChange={() =>
                                  allowed &&
                                  togglePermission(permission)
                                }
                                className="absolute opacity-0 peer"
                              />

                              <div
                                className={`
                                  h-5 w-5 rounded-full border-2
                                  flex items-center justify-center
                                  ${
                                    checked
                                      ? 'border-[var(--color-primary)] bg-white'
                                      : 'border-gray-400 bg-white'
                                  }
                                  ${
                                    !allowed
                                      ? 'opacity-40 cursor-not-allowed'
                                      : 'cursor-pointer hover:border-[var(--color-primary)]'
                                  }
                                  peer-focus:ring-2
                                  peer-focus:ring-[var(--color-primary)]
                                  peer-focus:ring-offset-2
                                `}
                              >
                                {checked && (
                                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
                                )}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="px-6 py-4 flex justify-end gap-3 border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md border"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-md bg-[var(--color-primary)] text-white"
          >
            {loading
              ? mode === 'edit'
                ? 'Updating...'
                : 'Adding...'
              : mode === 'edit'
              ? 'Update Role'
              : 'Add Role'}
          </button>
        </div>
      </div>
    </div>
  );
}
