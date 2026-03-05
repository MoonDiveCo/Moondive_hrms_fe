'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { ACTION_PERMISSIONS } from '@/constants/NestedDashboard';
import { MODULE_INFO } from '@/constants/ModuleInfor';


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
      const parts = perm.split(':'); 
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

  const allPossiblePermissions = useMemo(() => {
    return Object.values(ACTION_PERMISSIONS);
  }, []);

  const allSelected = useMemo(() => {
    return allPossiblePermissions.length > 0 &&
      allPossiblePermissions.every((p) => permissions.includes(p));
  }, [permissions, allPossiblePermissions]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setPermissions([]);
    } else {
      setPermissions([...allPossiblePermissions]);
    }
  };

  const isRowAllSelected = (module, actions) => {
    return ACTION_COLUMNS.every((action) => {
      if (!actions.includes(action)) return true;
      const permission = Object.values(ACTION_PERMISSIONS).find(
        (p) => p.endsWith(`:${module}:${action}`)
      );
      return permission && permissions.includes(permission);
    });
  };

  const toggleRowAll = (module, actions) => {
    const rowPerms = ACTION_COLUMNS
      .filter((action) => actions.includes(action))
      .map((action) =>
        Object.values(ACTION_PERMISSIONS).find(
          (p) => p.endsWith(`:${module}:${action}`)
        )
      )
      .filter(Boolean);

    const allChecked = isRowAllSelected(module, actions);

    if (allChecked) {
      // Uncheck all in this row
      setPermissions((prev) => prev.filter((p) => !rowPerms.includes(p)));
    } else {
      // Check all in this row
      setPermissions((prev) => [...new Set([...prev, ...rowPerms])]);
    }
  };

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
        permissionsObj:permissions,
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
            <h4 className="text-primaryText">
              {mode === 'edit' ? 'Edit Role' : 'Add Role'}
            </h4>
            <p className="text-sm text-gray-500">
              Create a new user role
            </p>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        
        <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Role Name + Select All */}
          <div className="flex items-end justify-between gap-4">
            <div className="max-w-md flex-1">
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

            {/* Select All Toggle */}
            <button
              type="button"
              onClick={toggleSelectAll}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border
                ${allSelected
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                }
              `}
            >
              <div className={`
                h-4 w-4 rounded border-2 flex items-center justify-center transition-all
                ${allSelected
                  ? 'border-white bg-white'
                  : 'border-gray-400'
                }
              `}>
                {allSelected && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          
          <div>
            <h4 className="text-sm font-medium mb-3">Permissions</h4>

            <div className="overflow-hidden border border-[#D0D5DD] rounded-lg">
              
              {/* Scrollable table with sticky header */}
              <div className="max-h-[45vh] overflow-y-auto">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50 sticky top-0 z-10 shadow-[0_1px_0_0_#D0D5DD]">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold w-1/3 bg-gray-50">
                        Module
                      </th>
                      {ACTION_COLUMNS.map((action) => (
                        <th
                          key={action}
                          className="px-3 py-3 text-center text-sm font-semibold bg-gray-50"
                        >
                          {action}
                        </th>
                      ))}
                      <th className="px-3 py-3 text-center text-sm font-semibold bg-gray-50">
                        ALL
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y bg-white">
                    {permissionMatrix.map(({ module, actions }) => {
                      const rowAllSelected = isRowAllSelected(module, actions);

                      return (
                        <tr
                          key={module}
                          className="hover:bg-gray-50 border border-[#D0D5DD]"
                        >
                          <td className="px-4 py-4 font-medium flex items-center">
                          {module}

                          {MODULE_INFO[module] && (
                            <InfoTooltip info={MODULE_INFO[module]} />
                          )}
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
                                <label className={`inline-flex items-center justify-center ${!allowed ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                  <input
                                    type="checkbox"
                                    disabled={!allowed}
                                    checked={checked}
                                    onChange={() =>
                                      allowed &&
                                      togglePermission(permission)
                                    }
                                    className="sr-only peer"
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
                                          ? 'opacity-40'
                                          : 'hover:border-[var(--color-primary)]'
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
                                </label>
                              </td>
                            );
                          })}

                          {/* ALL column — toggle all permissions in this row */}
                          <td className="px-3 py-4 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={rowAllSelected}
                                onChange={() => toggleRowAll(module, actions)}
                                className="sr-only peer"
                              />
                              <div
                                className={`
                                  h-5 w-5 rounded border-2
                                  flex items-center justify-center
                                  ${
                                    rowAllSelected
                                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                                      : 'border-gray-400 bg-white hover:border-[var(--color-primary)]'
                                  }
                                  peer-focus:ring-2
                                  peer-focus:ring-[var(--color-primary)]
                                  peer-focus:ring-offset-2
                                `}
                              >
                                {rowAllSelected && (
                                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                    <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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

function InfoTooltip({ info }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);

  const handleEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPos({
        top: rect.top - 8,   // above the icon with a small gap
        left: rect.left + rect.width / 2,
      });
    }
    setShow(true);
  };

  return (
    <>
      <span
        ref={iconRef}
        className="ml-2 cursor-pointer text-gray-400 hover:text-gray-600 inline-block"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
      >
        ⓘ
      </span>

      {show && (
        <div
          className="fixed z-[9999] w-72 rounded-lg border bg-white p-4 text-sm shadow-xl"
          style={{
            top: pos.top,
            left: pos.left,
            transform: 'translate(-50%, -100%)',
          }}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
        >
          {/* Arrow pointing down */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />

          <p className="font-semibold mb-1">{info.title}</p>
          <p className="text-gray-600 mb-2">{info.description}</p>

          {info.features?.length > 0 && (
            <ul className="list-disc pl-4 space-y-1 text-gray-700">
              {info.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
