'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ACTION_PERMISSIONS } from '@/constants/NestedDashboard';

const ACTION_COLUMNS = [
  { label: 'ADD', value: 'WRITE' },
  { label: 'EDIT', value: 'EDIT' },
  { label: 'VIEW', value: 'VIEW' },
  { label: 'DELETE', value: 'DELETE' },
];

export default function AssignAdditionalPermissionModal({
  employee,
  onClose,
  onSuccess,
}) {
  const isEdit = !!employee;

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(
    employee?._id || ''
  );

  const [permissions, setPermissions] = useState(
    employee?.additionalPermissions || []
  );

  const [loading, setLoading] = useState(false);

  /* Build module → actions map from ACTION_PERMISSIONS */
  const permissionMatrix = useMemo(() => {
    const matrix = {};

    Object.values(ACTION_PERMISSIONS).forEach((perm) => {
      const [scope, module, action] = perm.split(':');
      if (!module || !action) return;

      if (!matrix[module]) matrix[module] = new Set();
      matrix[module].add(action);
    });

    return Object.entries(matrix).map(([module, actions]) => ({
      module,
      actions: Array.from(actions),
    }));
  }, []);

  /* Fetch employees in create mode */
  useEffect(() => {
    if (!isEdit) {
      axios.get('/hrms/employee/list').then((res) => {
        setEmployees(res.data.result || []);
      });
    }
  }, [isEdit]);

  /* Toggle permission */
  const togglePermission = (permission) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  /* Submit */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.patch(
        `/hrms/roles/update-additional-permission/${selectedEmployee}`,
        {
          additionalPermissions: permissions,
          mode: isEdit ? 'edit' : 'add',
        }
      );
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[1000px] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h3 className="text-xl font-semibold">
              {isEdit ? 'Edit Role' : 'Add Role'}
            </h3>
            <p className="text-sm text-gray-500">
              Create a new user role
            </p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Employee */}
          {isEdit ? (
            <input
              disabled
              value={`${employee.firstName} ${employee.lastName}`}
              className="w-full max-w-md rounded-md border px-3 py-2 bg-gray-100"
            />
          ) : (
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full max-w-md rounded-md border px-3 py-2"
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          )}

          {/* Permissions */}
          <div>
            <h4 className="text-sm font-medium mb-3">Permissions</h4>

            <div className="overflow-hidden border border-[#D0D5DD] rounded-lg">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold w-1/3">
                      Module
                    </th>
                    {ACTION_COLUMNS.map((col) => (
                      <th
                        key={col.value}
                        className="px-3 py-3 text-center text-sm font-semibold"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y bg-white">
                  {permissionMatrix.map(({ module, actions }) => (
                    <tr key={module} className="hover:bg-gray-50 border border-[#D0D5DD]">
                      <td className="px-4 py-4 font-medium">
                        {module}
                      </td>

                      {ACTION_COLUMNS.map(({ value }) => {
                        const permission = Object.values(
                          ACTION_PERMISSIONS
                        ).find(
                          (p) =>
                            p.endsWith(`:${module}:${value}`)
                        );

                        const checked =
                          permission &&
                          permissions.includes(permission);

                        const allowed = actions.includes(value);

                        return (
                          <td
                            key={value}
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
                                h-5 w-5 rounded-full
                                border-2
                                flex items-center justify-center
                                transition-all
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
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md border"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!selectedEmployee || loading}
            className="px-5 py-2 rounded-md bg-orange-500 text-white"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
