'use client';

import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'sonner';
import { AuthContext } from '@/context/authContext';
import SubModuleProtectedRoute from '@/lib/routeProtection/SubModuleProtectedRoute';
import { getSOPs, createSOP, updateSOP, deleteSOP, assignSOP, getOnboardingRecords, getOnboardingRecord, updateChecklistItem } from '@/services/hrDocsService';
import { Plus, ClipboardList, Users, Clock, ChevronDown, ChevronUp, Trash2, Edit2, UserPlus, X } from 'lucide-react';
import axios from 'axios';

const TABS = ['SOP Manager', 'Active Onboardings'];

const ITEM_CATEGORIES = ['DOCUMENTATION', 'IT_SETUP', 'HR_FORMALITIES', 'ORIENTATION', 'TRAINING', 'COMPLIANCE', 'OTHER'];
const ITEM_STATUS_COLORS = {
  PENDING: 'bg-gray-100 text-gray-600',
  COMPLETED: 'bg-green-100 text-green-700',
  SKIPPED: 'bg-yellow-100 text-yellow-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

export default function OnboardingPage() {
  const { allUserPermissions = [] } = useContext(AuthContext);
  const canWrite = allUserPermissions.includes('HRMS:ONBOARDING_SOP:WRITE');
  const canEdit = allUserPermissions.includes('HRMS:ONBOARDING_SOP:EDIT');
  const canDelete = allUserPermissions.includes('HRMS:ONBOARDING_SOP:DELETE');

  const [activeTab, setActiveTab] = useState(0);
  const [sops, setSOPs] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [recordDetail, setRecordDetail] = useState(null);
  const [employees, setEmployees] = useState([]);

  // SOP Create/Edit state
  const [sopModalOpen, setSOPModalOpen] = useState(false);
  const [editingSOP, setEditingSOP] = useState(null);
  const [sopForm, setSOPForm] = useState({ name: '', description: '', items: [] });

  // Assign SOP state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningSOP, setAssigningSOP] = useState(null);
  const [assignEmployeeId, setAssignEmployeeId] = useState('');

  const fetchSOPs = async () => {
    setLoading(true);
    try {
      const res = await getSOPs();
      setSOPs(res.data?.result?.docs || res.data?.data?.docs || res.data?.data || []);
    } finally { setLoading(false); }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getOnboardingRecords({ status: 'IN_PROGRESS' });
      setRecords(res.data?.result?.docs || res.data?.data?.docs || res.data?.data || []);
    } finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    axios.get('/hrms/employee/list')
      .then((res) => setEmployees(res.data?.result || res.data?.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchSOPs();
    fetchRecords();
    fetchEmployees();
  }, []);

  const openRecordDetail = async (record) => {
    if (expandedRecord === record._id) { setExpandedRecord(null); setRecordDetail(null); return; }
    try {
      const res = await getOnboardingRecord(record._id);
      setRecordDetail(res.data?.result || res.data?.data);
      setExpandedRecord(record._id);
    } catch { toast.error('Failed to load details'); }
  };

  const handleItemUpdate = async (recordId, itemId, status, remarks = '') => {
    try {
      await updateChecklistItem(recordId, itemId, { status, remarks: remarks || undefined });
      toast.success('Updated');
      const res = await getOnboardingRecord(recordId);
      setRecordDetail(res.data?.result || res.data?.data);
      fetchRecords();
    } catch { toast.error('Failed to update'); }
  };

  const openSOPModal = (sop = null) => {
    setEditingSOP(sop);
    setSOPForm(sop ? { name: sop.name, description: sop.description || '', items: sop.items || [] } : { name: '', description: '', items: [] });
    setSOPModalOpen(true);
  };

  const addSOPItem = () => {
    setSOPForm((prev) => ({
      ...prev,
      items: [...prev.items, { title: '', description: '', category: 'OTHER', isRequired: true, daysFromJoining: null, order: prev.items.length, assignedRole: '' }],
    }));
  };

  const updateSOPItem = (idx, field, value) => {
    setSOPForm((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
  };

  const removeSOPItem = (idx) => setSOPForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const handleSaveSOPP = async () => {
    if (!sopForm.name.trim()) return toast.error('SOP name required');
    try {
      if (editingSOP) {
        await updateSOP(editingSOP._id, sopForm);
        toast.success('SOP updated');
      } else {
        await createSOP(sopForm);
        toast.success('SOP created');
      }
      setSOPModalOpen(false);
      fetchSOPs();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to save SOP'); }
  };

  const handleDeleteSOP = async (id) => {
    if (!window.confirm('Delete this SOP?')) return;
    try { await deleteSOP(id); toast.success('SOP deleted'); fetchSOPs(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleAssign = async () => {
    if (!assignEmployeeId) return toast.error('Select an employee');
    try {
      await assignSOP(assigningSOP._id, { employeeId: assignEmployeeId });
      toast.success('SOP assigned to employee');
      setAssignModalOpen(false);
      fetchRecords();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to assign'); }
  };

  return (
    <SubModuleProtectedRoute>
      <div className="p-4 bg-gray-50 min-h-screen hide-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-bold text-gray-900">Onboarding</h4>
              <p className="text-sm text-gray-500 mt-1">Manage onboarding SOPs and track employee onboarding progress</p>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-2">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === i ? 'bg-[#FF7B30] text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {i === 0 ? <ClipboardList className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 0: SOP MANAGER */}
          {activeTab === 0 && (
            <div className="space-y-4">
              {canWrite && (
                <div className="flex justify-end">
                  <button onClick={() => openSOPModal()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF7B30] text-white text-sm font-medium hover:bg-[#ff6a1a]">
                    <Plus className="w-4 h-4" /> New SOP
                  </button>
                </div>
              )}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />)}
                </div>
              ) : sops.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No SOPs created yet. {canWrite && 'Create your first onboarding SOP.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sops.map((sop) => (
                    <div key={sop._id} className="bg-white rounded-xl border border-gray-200 p-5 primaryShadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-semibold text-gray-900">{sop.name}</h5>
                          {sop.description && <p className="text-xs text-gray-500 mt-1">{sop.description}</p>}
                          <p className="text-xs text-gray-400 mt-2">{sop.items?.length || 0} checklist items</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {canWrite && (
                            <button onClick={() => { setAssigningSOP(sop); setAssignEmployeeId(''); setAssignModalOpen(true); }}
                              className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-[#FF7B30]" title="Assign to employee">
                              <UserPlus className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canEdit && (
                            <button onClick={() => openSOPModal(sop)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDeleteSOP(sop._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: ACTIVE ONBOARDINGS */}
          {activeTab === 1 && (
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white rounded-xl border border-gray-200 animate-pulse" />)}</div>
              ) : records.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No active onboardings. Assign an SOP from the SOP Manager tab.</p>
                </div>
              ) : (
                records.map((record) => (
                  <div key={record._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden primaryShadow">
                    {/* RECORD HEADER */}
                    <button onClick={() => openRecordDetail(record)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7B30] font-bold text-sm">
                          {(record.employeeId?.firstName?.[0] || '?').toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-gray-900">
                            {record.employeeId?.firstName} {record.employeeId?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{record.sopId?.name || 'SOP'} • Started {new Date(record.startDate).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* PROGRESS BAR */}
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#FF7B30] rounded-full transition-all"
                              style={{ width: `${record.completionPercentage || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600">{record.completionPercentage || 0}%</span>
                        </div>
                        {expandedRecord === record._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {/* CHECKLIST DETAIL */}
                    {expandedRecord === record._id && recordDetail && (
                      <div className="border-t border-gray-100 px-5 py-4 space-y-2">
                        {recordDetail.items?.map((item) => (
                          <div key={item._id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                            <button
                              onClick={() => handleItemUpdate(record._id, item._id, item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')}
                              className={`w-5 h-5 mt-0.5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                                item.status === 'COMPLETED' ? 'bg-orange-500 border-orange-500' : 'border-gray-400 hover:border-orange-400'
                              }`}
                            >
                              {item.status === 'COMPLETED' && (
                                <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`text-sm font-medium ${item.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.title}</p>
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${ITEM_STATUS_COLORS[item.status] || ITEM_STATUS_COLORS.PENDING}`}>{item.status}</span>
                                {item.isRequired && <span className="text-xs text-red-400">Required</span>}
                              </div>
                              {item.dueDate && (
                                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Due: {new Date(item.dueDate).toLocaleDateString('en-IN')}
                                </p>
                              )}
                              {item.remarks && <p className="text-xs text-gray-500 mt-1 italic">"{item.remarks}"</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* SOP CREATE/EDIT MODAL */}
      {sopModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h5 className="font-semibold text-gray-800">{editingSOP ? 'Edit SOP' : 'Create SOP'}</h5>
              <button onClick={() => setSOPModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <input value={sopForm.name} onChange={(e) => setSOPForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="SOP Name *" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <textarea rows={2} value={sopForm.description} onChange={(e) => setSOPForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Checklist Items</p>
                  <button onClick={addSOPItem} className="flex items-center gap-1 px-2 py-1 rounded bg-orange-50 text-[#FF7B30] text-xs font-medium hover:bg-orange-100">
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {sopForm.items.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <input value={item.title} onChange={(e) => updateSOPItem(idx, 'title', e.target.value)}
                          placeholder="Item title *" className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400" />
                        <button onClick={() => removeSOPItem(idx)} className="text-gray-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select value={item.category} onChange={(e) => updateSOPItem(idx, 'category', e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400">
                          {ITEM_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                        </select>
                        <input type="number" value={item.daysFromJoining || ''} onChange={(e) => updateSOPItem(idx, 'daysFromJoining', e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="Days from joining" className="border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400" />
                      </div>
                      <input value={item.assignedRole || ''} onChange={(e) => updateSOPItem(idx, 'assignedRole', e.target.value)}
                        placeholder="Assigned role (e.g. HR, IT)" className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400" />
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={item.isRequired} onChange={(e) => updateSOPItem(idx, 'isRequired', e.target.checked)} className="rounded" />
                        Required
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setSOPModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700">Cancel</button>
              <button onClick={handleSaveSOPP} className="px-5 py-2 rounded-lg bg-[#FF7B30] text-white text-sm font-medium hover:bg-[#ff6a1a]">
                {editingSOP ? 'Update SOP' : 'Create SOP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN SOP MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-gray-900">Assign SOP to Employee</h5>
              <button onClick={() => setAssignModalOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500">SOP: <span className="font-medium text-gray-800">{assigningSOP?.name}</span></p>
            <select value={assignEmployeeId} onChange={(e) => setAssignEmployeeId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>{e.firstName} {e.lastName} — {e.designationId?.name || ''}</option>
              ))}
            </select>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setAssignModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700">Cancel</button>
              <button onClick={handleAssign} className="flex-1 py-2.5 rounded-lg bg-[#FF7B30] text-white text-sm font-medium hover:bg-[#ff6a1a]">Assign</button>
            </div>
          </div>
        </div>
      )}
    </SubModuleProtectedRoute>
  );
}
