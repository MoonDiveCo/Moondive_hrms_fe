'use client';
import React, { useMemo, useState, useEffect } from 'react';

export default function AddOrganizationFileModal({
  open,
  onClose,
  form,
  update,
  file,
  setFile,
  users,
  selectedUsers,
  setSelectedUsers,
  uploading,
  onSubmit,
  editMode = false,
  existingFile = null,
}) {
  const [selectedDesignation, setSelectedDesignation] = useState('');

  /* ---------------- POPULATE FORM FOR EDIT MODE ---------------- */
  useEffect(() => {
    if (open && editMode && existingFile) {
      update('fileName', existingFile.fileName || '');
      update('description', existingFile.description || '');
      update('folder', existingFile.folder || '');
      
      // Extract user IDs from allowedUsers
      const userIds = existingFile.allowedUsers?.map(u => u.user?._id || u.user) || [];
      setSelectedUsers(userIds);
    } else if (open && !editMode) {
      // Reset for add mode
      update('fileName', '');
      update('description', '');
      update('folder', '');
      setSelectedUsers([]);
      setFile(null);
    }
  }, [open, editMode, existingFile]);

  /* ---------------- GROUP USERS BY DESIGNATION ---------------- */
  const designations = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      const name = u.designationId?.name || 'Other';
      if (!map[name]) map[name] = [];
      map[name].push(u);
    });
    return map;
  }, [users]);

  /* ---------------- USERS TO SHOW ---------------- */
  const usersToShow = useMemo(() => {
    if (selectedDesignation === 'ALL_USERS') return users;
    if (!selectedDesignation) return [];
    return designations[selectedDesignation] || [];
  }, [selectedDesignation, users, designations]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-full shadow-xl flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">
              {editMode ? 'Edit Organization File' : 'Add Organization File'}
            </h3>
            <p className="text-xs text-gray-500">
              {editMode 
                ? 'Update document details and permissions' 
                : 'Quickly upload and configure documents'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* FILE SELECTION */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              FILE SELECTION {!editMode && '*'}
            </p>
            
            {editMode && existingFile?.fileUrl && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg text-sm">
                <p className="text-blue-700 font-medium mb-1">Current File:</p>
                <a 
                  href={existingFile.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs"
                >
                  {existingFile.originalFileName || existingFile.fileName}
                </a>
                <p className="text-xs text-gray-500 mt-1">
                  {editMode ? 'Upload a new file to replace (optional)' : ''}
                </p>
              </div>
            )}
            
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  setFile(selectedFile);
                  // Auto-populate fileName if empty
                  if (selectedFile && !form.fileName) {
                    update('fileName', selectedFile.name);
                  }
                }}
              />
              <label
                htmlFor="fileUpload"
                className="cursor-pointer text-blue-600 text-sm font-medium"
              >
                {editMode ? 'Choose new file (optional)' : 'Choose file from Desktop / Others'}
              </label>
              {file && (
                <p className="mt-2 text-sm text-gray-700">{file.name}</p>
              )}
            </div>
          </div>

          {/* FILE DETAILS */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              FILE DETAILS
            </p>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="File name *"
                value={form.fileName}
                onChange={(e) => update('fileName', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />

              <textarea
                rows={3}
                placeholder="Description"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />

              <select
                value={form.folder}
                onChange={(e) => update('folder', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select Folder *</option>
                <option value="HR Policies">HR Policies</option>
                <option value="Company Docs">Company Docs</option>
              </select>
            </div>
          </div>

          {/* PERMISSIONS */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              PERMISSIONS
            </p>

            {/* DESIGNATION DROPDOWN */}
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm mb-3"
            >
              <option value="">-- Select a Designation --</option>
              <option value="ALL_USERS">
                All Users ({users.length})
              </option>
              {Object.keys(designations).map((d) => (
                <option key={d} value={d}>
                  {d} ({designations[d].length})
                </option>
              ))}
            </select>

            {/* USER CHECKLIST */}
            {usersToShow.length > 0 && (
              <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                {usersToShow.map((u) => {
                  const checked = selectedUsers.includes(u._id);

                  return (
                    <label
                      key={u._id}
                      className="flex items-start gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedUsers((prev) =>
                            checked
                              ? prev.filter((id) => id !== u._id)
                              : [...prev, u._id]
                          )
                        }
                        className="sr-only"
                      />

                      <span
                        className={`w-4 h-4 mt-1 flex items-center justify-center rounded border
                          ${
                            checked
                              ? 'bg-orange-500 border-orange-500'
                              : 'border-gray-400'
                          }`}
                      >
                        {checked && (
                          <svg
                            viewBox="0 0 24 24"
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>

                      <div className="flex flex-col flex-1">
                        <span className="font-medium">
                          {u.firstName} {u.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {u.departmentId?.name || '—'} •{' '}
                          {u.designationId?.name || '—'}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* SELECTED GROUP MEMBERS */}
            {selectedUsers.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500">
                    SELECTED GROUP MEMBERS
                  </p>

                  <button
                    onClick={() => setSelectedUsers([])}
                    className="px-2 py-1 text-sm text-white bg-orange-400 hover:bg-orange-500 font-medium rounded-sm"
                  >
                    Unselect all
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {users
                    .filter((u) => selectedUsers.includes(u._id))
                    .map((u) => (
                      <span
                        key={u._id}
                        className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm"
                      >
                        {u.firstName} {u.lastName}
                        <button
                          onClick={() =>
                            setSelectedUsers((prev) =>
                              prev.filter((id) => id !== u._id)
                            )
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded-md">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={uploading}
            className="bg-orange-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {uploading 
              ? (editMode ? 'Updating...' : 'Uploading...') 
              : (editMode ? 'Update File' : 'Upload File')}
          </button>
        </div>
      </div>
    </div>
  );
}