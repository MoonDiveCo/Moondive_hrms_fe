'use client';

import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AuthContext } from '@/context/authContext';
import {
  ShieldCheck, Plus, Trash2, X, ChevronDown, ChevronRight,
  Check, Lock, Search, Save, Shield,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// ALL AVAILABLE PERMISSIONS — grouped by module
// ─────────────────────────────────────────────────────────────────────────────
const PERMISSION_GROUPS = [
  {
    module: 'HRMS Core',
    color: 'orange',
    permissions: [
      { key: 'HRMS:MANAGE_ACCOUNT:VIEW', label: 'Manage Accounts' },
      { key: 'HRMS:EMPLOYEES:VIEW',      label: 'Employees — View' },
      { key: 'HRMS:EMPLOYEES:WRITE',     label: 'Employees — Create' },
      { key: 'HRMS:EMPLOYEES:EDIT',      label: 'Employees — Edit' },
      { key: 'HRMS:EMPLOYEES:DELETE',    label: 'Employees — Delete' },
      { key: 'HRMS:HRMS_OVERVIEW:VIEW',  label: 'Overview' },
      { key: 'HRMS:LEAVE_TRACKER:VIEW',  label: 'Leave Tracker' },
      { key: 'HRMS:ATTENDANCE:VIEW',     label: 'Attendance' },
      { key: 'HRMS:TIME_TRACKER:VIEW',   label: 'Time Tracker' },
      { key: 'HRMS:PERFORMANCE:VIEW',    label: 'Performance' },
      { key: 'HRMS:DOCUMENTS:VIEW',      label: 'Documents' },
      { key: 'HRMS:OPERATIONS:VIEW',     label: 'Operations' },
      { key: 'HRMS:ANALYTICS:VIEW',      label: 'Analytics' },
      { key: 'HRMS:SETTINGS:VIEW',       label: 'Settings' },
    ],
  },
  {
    module: 'Leave Management',
    color: 'blue',
    permissions: [
      { key: 'HRMS:LEAVE:VIEW',   label: 'View' },
      { key: 'HRMS:LEAVE:WRITE',  label: 'Create' },
      { key: 'HRMS:LEAVE:EDIT',   label: 'Edit' },
      { key: 'HRMS:LEAVE:DELETE', label: 'Delete' },
    ],
  },
  {
    module: 'Projects',
    color: 'purple',
    permissions: [
      { key: 'HRMS:PROJECTS:VIEW',   label: 'View' },
      { key: 'HRMS:PROJECTS:WRITE',  label: 'Create' },
      { key: 'HRMS:PROJECTS:EDIT',   label: 'Edit' },
      { key: 'HRMS:PROJECTS:DELETE', label: 'Delete' },
    ],
  },
  {
    module: 'Company Policy',
    color: 'teal',
    permissions: [
      { key: 'HRMS:COMPANY_POLICY:VIEW',   label: 'View' },
      { key: 'HRMS:COMPANY_POLICY:WRITE',  label: 'Create' },
      { key: 'HRMS:COMPANY_POLICY:EDIT',   label: 'Edit' },
      { key: 'HRMS:COMPANY_POLICY:DELETE', label: 'Delete' },
    ],
  },
  {
    module: 'Shifts',
    color: 'yellow',
    permissions: [
      { key: 'HRMS:SHIFT:VIEW',   label: 'View' },
      { key: 'HRMS:SHIFT:WRITE',  label: 'Create' },
      { key: 'HRMS:SHIFT:EDIT',   label: 'Edit' },
      { key: 'HRMS:SHIFT:DELETE', label: 'Delete' },
    ],
  },
  {
    module: 'HR Helpdesk',
    color: 'pink',
    permissions: [
      { key: 'HRMS:HR HELPDESK:VIEW', label: 'View' },
    ],
  },
  {
    module: 'HR Docs & Templates',
    color: 'orange',
    isNew: true,
    permissions: [
      { key: 'HRMS:HR_DOCS:VIEW',          label: 'HR Docs — View' },
      { key: 'HRMS:HR_DOCS:WRITE',         label: 'HR Docs — Generate' },
      { key: 'HRMS:HR_DOCS:EDIT',          label: 'HR Docs — Edit' },
      { key: 'HRMS:HR_DOCS:DELETE',        label: 'HR Docs — Delete' },
      { key: 'HRMS:TEMPLATES:VIEW',        label: 'Templates — View' },
      { key: 'HRMS:TEMPLATES:WRITE',       label: 'Templates — Create' },
      { key: 'HRMS:TEMPLATES:EDIT',        label: 'Templates — Edit' },
      { key: 'HRMS:TEMPLATES:DELETE',      label: 'Templates — Delete' },
      { key: 'HRMS:ONBOARDING_SOP:VIEW',   label: 'Onboarding SOP — View' },
      { key: 'HRMS:ONBOARDING_SOP:WRITE',  label: 'Onboarding SOP — Create/Assign' },
      { key: 'HRMS:ONBOARDING_SOP:EDIT',   label: 'Onboarding SOP — Edit' },
      { key: 'HRMS:ONBOARDING_SOP:DELETE', label: 'Onboarding SOP — Delete' },
    ],
  },
  {
    module: 'CMS',
    color: 'indigo',
    permissions: [
      { key: 'CMS:CMS_OVERVIEW:VIEW',        label: 'Overview' },
      { key: 'CMS:BLOGS:VIEW',               label: 'Blogs — View' },
      { key: 'CMS:BLOGS:WRITE',              label: 'Blogs — Create' },
      { key: 'CMS:BLOGS:EDIT',               label: 'Blogs — Edit' },
      { key: 'CMS:BLOGS:DELETE',             label: 'Blogs — Delete' },
      { key: 'CMS:TESTIMONIALS:VIEW',        label: 'Testimonials — View' },
      { key: 'CMS:TESTIMONIALS:WRITE',       label: 'Testimonials — Create' },
      { key: 'CMS:TESTIMONIALS:EDIT',        label: 'Testimonials — Edit' },
      { key: 'CMS:TESTIMONIALS:DELETE',      label: 'Testimonials — Delete' },
      { key: 'CMS:CASE_STUDIES:VIEW',        label: 'Case Studies — View' },
      { key: 'CMS:CASE_STUDIES:WRITE',       label: 'Case Studies — Create' },
      { key: 'CMS:CASE_STUDIES:EDIT',        label: 'Case Studies — Edit' },
      { key: 'CMS:CASE_STUDIES:DELETE',      label: 'Case Studies — Delete' },
      { key: 'CMS:INVENTORY:VIEW',           label: 'Inventory — View' },
      { key: 'CMS:INVENTORY:WRITE',          label: 'Inventory — Create' },
      { key: 'CMS:INVENTORY:EDIT',           label: 'Inventory — Edit' },
      { key: 'CMS:INVENTORY:DELETE',         label: 'Inventory — Delete' },
      { key: 'CMS:WEBSITE_SEO:VIEW',         label: 'Website SEO — View' },
      { key: 'CMS:WEBSITE_SEO:WRITE',        label: 'Website SEO — Create' },
      { key: 'CMS:WEBSITE_SEO:EDIT',         label: 'Website SEO — Edit' },
      { key: 'CMS:WEBSITE_SEO:DELETE',       label: 'Website SEO — Delete' },
      { key: 'CMS:CONTENT_PERFORMANCE:VIEW', label: 'Content Performance — View' },
      { key: 'CMS:GENAI_VISIBILITY:VIEW',    label: 'GenAI Visibility — View' },
    ],
  },
  {
    module: 'CRM',
    color: 'green',
    permissions: [
      { key: 'CRM:CRM_OVERVIEW:VIEW',     label: 'Overview' },
      { key: 'CRM:ACCOUNTS:VIEW',         label: 'Accounts — View' },
      { key: 'CRM:ACCOUNTS:WRITE',        label: 'Accounts — Create' },
      { key: 'CRM:ACCOUNTS:EDIT',         label: 'Accounts — Edit' },
      { key: 'CRM:ACCOUNTS:DELETE',       label: 'Accounts — Delete' },
      { key: 'CRM:SALES:VIEW',            label: 'Sales — View' },
      { key: 'CRM:SALES:WRITE',           label: 'Sales — Create' },
      { key: 'CRM:SALES:EDIT',            label: 'Sales — Edit' },
      { key: 'CRM:SALES:DELETE',          label: 'Sales — Delete' },
      { key: 'CRM:LEADS:VIEW',            label: 'Leads' },
      { key: 'CRM:IN_PROCESS:VIEW',       label: 'In Process' },
      { key: 'CRM:MEETING_SCHEDULE:VIEW', label: 'Meeting Schedule' },
      { key: 'CRM:FINALISED:VIEW',        label: 'Finalised' },
    ],
  },
];

const MODULE_COLOR_CLASSES = {
  orange: { badge: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400' },
  blue:   { badge: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-400' },
  purple: { badge: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-400' },
  teal:   { badge: 'bg-teal-100 text-teal-700 border-teal-200',       dot: 'bg-teal-400' },
  yellow: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  pink:   { badge: 'bg-pink-100 text-pink-700 border-pink-200',       dot: 'bg-pink-400' },
  indigo: { badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400' },
  green:  { badge: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-400' },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AccountsPage() {
  const { user, allUserPermissions = [] } = useContext(AuthContext);

  const isSuperAdmin = user?.userRole?.includes('SuperAdmin');
  const canManage =
    isSuperAdmin || allUserPermissions.includes('HRMS:MANAGE_ACCOUNT:VIEW');

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Selected role for editing
  const [selectedRole, setSelectedRole] = useState(null);
  const [editedPermissions, setEditedPermissions] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Create role modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Expanded module groups in permission editor
  const [expandedModules, setExpandedModules] = useState(
    () => new Set(PERMISSION_GROUPS.map((g) => g.module))
  );

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/v1/hrms/roles/get-all-roles');
      const list = res.data?.result || res.data?.data || [];
      setRoles(list);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openRole = (role) => {
    setSelectedRole(role);
    setEditedPermissions(new Set(role.permissions || []));
    setIsDirty(false);
  };

  const togglePermission = (key) => {
    if (!canManage) return;
    setEditedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setIsDirty(true);
  };

  const toggleAllInModule = (group) => {
    if (!canManage) return;
    const keys = group.permissions.map((p) => p.key);
    const allOn = keys.every((k) => editedPermissions.has(k));
    setEditedPermissions((prev) => {
      const next = new Set(prev);
      if (allOn) keys.forEach((k) => next.delete(k));
      else keys.forEach((k) => next.add(k));
      return next;
    });
    setIsDirty(true);
  };

  const savePermissions = async () => {
    if (!selectedRole || !canManage) return;
    setSaving(true);
    try {
      await axios.patch(`/api/v1/hrms/roles/update-role/${selectedRole._id}`, {
        permissionsObj: [...editedPermissions],
      });
      toast.success(`Permissions saved for ${selectedRole.name}`);
      const updated = { ...selectedRole, permissions: [...editedPermissions] };
      setRoles((prev) =>
        prev.map((r) => (r._id === selectedRole._id ? updated : r))
      );
      setSelectedRole(updated);
      setIsDirty(false);
    } catch {
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    setCreating(true);
    try {
      await axios.post('/api/v1/hrms/roles/add-role', { name: newRoleName.trim() });
      toast.success('Role created');
      setCreateOpen(false);
      setNewRoleName('');
      fetchRoles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create role');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/v1/hrms/roles/delete-role/${deleteTarget._id}`);
      toast.success('Role deleted');
      if (selectedRole?._id === deleteTarget._id) setSelectedRole(null);
      setDeleteTarget(null);
      fetchRoles();
    } catch {
      toast.error('Failed to delete role');
    } finally {
      setDeleting(false);
    }
  };

  const filteredRoles = roles.filter((r) =>
    (r.name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (!canManage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">You don&apos;t have permission to manage accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen hide-scrollbar">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-bold text-gray-900">Roles &amp; Permissions</h4>
            <p className="text-sm text-gray-500 mt-1">
              Control what each role can access across HRMS, CMS, and CRM
            </p>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF7B30] text-white text-sm font-medium rounded-lg hover:bg-[#ff6a1a] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Role
            </button>
          )}
        </div>

        <div className="flex gap-5" style={{ height: 'calc(100vh - 200px)' }}>

          {/* LEFT PANEL — ROLE LIST */}
          <div className="w-72 flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search roles..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-3 space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="p-8 text-center">
                  <Shield className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No roles found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredRoles.map((role) => {
                    const isSelected = selectedRole?._id === role._id;
                    const permCount = (role.permissions || []).length;
                    return (
                      <button
                        key={role._id}
                        onClick={() => openRole(role)}
                        className={`w-full text-left px-4 py-3.5 transition-colors group ${
                          isSelected
                            ? 'bg-orange-50 border-l-[3px] border-[#FF7B30]'
                            : 'hover:bg-gray-50 border-l-[3px] border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                isSelected
                                  ? 'bg-[#FF7B30] text-white'
                                  : 'bg-orange-100 text-[#FF7B30]'
                              }`}
                            >
                              {(role.name?.[0] || '?').toUpperCase()}
                            </div>
                            <div>
                              <p className={`text-sm font-semibold leading-tight ${
                                isSelected ? 'text-[#FF7B30]' : 'text-gray-800'
                              }`}>
                                {role.name}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {permCount} permission{permCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${
                            isSelected ? 'text-[#FF7B30]' : 'text-gray-300'
                          }`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer: total roles */}
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">{roles.length} role{roles.length !== 1 ? 's' : ''} total</p>
            </div>
          </div>

          {/* RIGHT PANEL — PERMISSION EDITOR */}
          {selectedRole ? (
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">

              {/* Editor Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF7B30] font-bold text-lg">
                    {(selectedRole.name?.[0] || '?').toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 text-base">{selectedRole.name}</h5>
                    <p className="text-xs text-gray-400">
                      {editedPermissions.size} permission{editedPermissions.size !== 1 ? 's' : ''} selected
                      {isDirty && <span className="ml-2 text-orange-500 font-medium">• Unsaved changes</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isSuperAdmin && (
                    <button
                      onClick={() => setDeleteTarget(selectedRole)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={savePermissions}
                    disabled={saving || !canManage || !isDirty}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF7B30] text-white text-sm font-medium rounded-lg hover:bg-[#ff6a1a] disabled:opacity-40 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Permission Groups */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {PERMISSION_GROUPS.map((group) => {
                  const isExpanded = expandedModules.has(group.module);
                  const groupKeys = group.permissions.map((p) => p.key);
                  const selectedCount = groupKeys.filter((k) => editedPermissions.has(k)).length;
                  const allOn = selectedCount === groupKeys.length;
                  const someOn = selectedCount > 0 && !allOn;
                  const colorCls = MODULE_COLOR_CLASSES[group.color] || MODULE_COLOR_CLASSES.orange;

                  return (
                    <div key={group.module} className="border border-gray-100 rounded-xl overflow-hidden">

                      {/* Group header */}
                      <div
                        className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                        onClick={() =>
                          setExpandedModules((prev) => {
                            const next = new Set(prev);
                            if (next.has(group.module)) next.delete(group.module);
                            else next.add(group.module);
                            return next;
                          })
                        }
                      >
                        <div className="flex items-center gap-3">
                          {/* Select-all toggle */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleAllInModule(group); }}
                            className={`w-5 h-5 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                              allOn
                                ? 'bg-[#FF7B30] border-[#FF7B30] text-white'
                                : someOn
                                ? 'bg-orange-100 border-orange-300'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {allOn && <Check className="w-3 h-3" />}
                            {someOn && <div className="w-2 h-0.5 bg-[#FF7B30] rounded" />}
                          </button>

                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorCls.badge}`}>
                            {group.module}
                          </span>

                          {group.isNew && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FF7B30] text-white">
                              NEW
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-medium">
                            {selectedCount}/{groupKeys.length}
                          </span>
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4 text-gray-400" />
                            : <ChevronRight className="w-4 h-4 text-gray-400" />
                          }
                        </div>
                      </div>

                      {/* Permission list */}
                      {isExpanded && (
                        <div className="grid grid-cols-2 gap-1 p-3 bg-white">
                          {group.permissions.map((perm) => {
                            const on = editedPermissions.has(perm.key);
                            return (
                              <button
                                key={perm.key}
                                onClick={() => togglePermission(perm.key)}
                                disabled={!canManage}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors disabled:cursor-not-allowed ${
                                  on ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-gray-50'
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-colors ${
                                    on
                                      ? 'bg-[#FF7B30] border-[#FF7B30]'
                                      : 'border-gray-300 bg-white'
                                  }`}
                                >
                                  {on && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                                <span className={`text-xs ${on ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                  {perm.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center">
              <div className="text-center">
                <ShieldCheck className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-600 text-sm font-medium">Select a role to manage its permissions</p>
                <p className="text-gray-400 text-xs mt-1">Click any role from the list on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE ROLE MODAL ── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h5 className="text-lg font-semibold text-gray-900">Create New Role</h5>
              <button
                onClick={() => { setCreateOpen(false); setNewRoleName(''); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role Name</label>
            <input
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateRole()}
              placeholder="e.g. Finance, IT Support, Legal..."
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Permissions can be assigned after creating the role by clicking on it.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setCreateOpen(false); setNewRoleName(''); }}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                disabled={!newRoleName.trim() || creating}
                className="flex-1 py-2.5 rounded-lg bg-[#FF7B30] text-white text-sm font-medium hover:bg-[#ff6a1a] disabled:opacity-50 transition-colors"
              >
                {creating ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold text-gray-900">Delete Role</h5>
              <button onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-1">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            </p>
            <p className="text-xs text-red-500 mt-1">
              All permissions in this role will be removed. Employees assigned this role will lose access immediately.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRole}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
