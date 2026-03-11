'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, History, ChevronLeft, ChevronRight, Users, DollarSign, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { AuthContext } from '@/context/authContext';
import {
  listSalaryStructures,
  deleteSalaryStructure,
  getEmployeeSalaryStructure,
} from '@/services/payrollService';
import SalaryStructureModal from '@/components/Payroll/SalaryStructureModal';
import Modal from '@/components/Common/Modal';
import apiClient from '@/lib/axiosClient';

// ─────────────────────────────────────────────────────────────────────────────
// Salary Structures Page
// ─────────────────────────────────────────────────────────────────────────────

const PERM_VIEW   = 'HRMS:PAYROLL_SALARY:VIEW';
const PERM_WRITE  = 'HRMS:PAYROLL_SALARY:WRITE';
const PERM_DELETE = 'HRMS:PAYROLL_SALARY:DELETE';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const fmtShort = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0);

export default function SalaryStructuresPage() {
  const { allUserPermissions = [] } = useContext(AuthContext);

  const canView   = allUserPermissions.includes('*') || allUserPermissions.includes(PERM_VIEW);
  const canWrite  = allUserPermissions.includes('*') || allUserPermissions.includes(PERM_WRITE);
  const canDelete = allUserPermissions.includes('*') || allUserPermissions.includes(PERM_DELETE);

  const [structures, setStructures] = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [employees, setEmployees] = useState([]);

  // Modal states
  const [modalOpen, setModalOpen]   = useState(false);
  const [modalMode, setModalMode]   = useState('create');
  const [editId, setEditId]         = useState(null);
  const [editData, setEditData]     = useState(null);

  // History modal
  const [historyOpen, setHistoryOpen]       = useState(false);
  const [historyData, setHistoryData]       = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting]           = useState(false);

  const LIMIT = 20;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    apiClient.get('hrms/employee/list')
      .then((res) => setEmployees(res.data?.result || res.data?.data || []))
      .catch(() => {});
  }, []);

  const fetchStructures = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const res = await listSalaryStructures({ page, limit: LIMIT, search: debouncedSearch || undefined });
      const data = res.data?.result || res.data?.data || {};
      setStructures(data.docs || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load salary structures');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, canView]);

  useEffect(() => { fetchStructures(); }, [fetchStructures]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleCreate = () => {
    setEditId(null);
    setEditData(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleRevise = (structure) => {
    setEditId(structure._id);
    setEditData({ ...structure, employee: structure.employee });
    setModalMode('revise');
    setModalOpen(true);
  };

  const handleViewHistory = async (employeeId) => {
    setHistoryLoading(true);
    setHistoryOpen(true);
    try {
      const res = await getEmployeeSalaryStructure(employeeId);
      const data = res.data?.result || res.data?.data || {};
      setHistoryData(data.history || []);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteSalaryStructure(deleteConfirm._id);
      toast.success('Salary structure deleted');
      setDeleteConfirm(null);
      fetchStructures();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#FF7B30]" />
          </div>
          <p className="text-gray-500 text-sm">You don&apos;t have permission to view salary structures.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4 bg-background">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold text-blackText">Salary Structures</h4>
            <p className="text-sm text-primaryText mt-0.5">
              {total > 0 ? `${total} active structure${total !== 1 ? 's' : ''}` : 'Define CTC components for each employee'}
            </p>
          </div>
          {canWrite && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Setup Structure
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden primaryShadow">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Employee', 'Annual CTC', 'Monthly', 'Effective From', 'Version', 'Components', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 0 ? '70%' : '60%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : structures.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                    <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-7 h-7 text-[#FF7B30]" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">No salary structures yet</p>
                    <p className="text-xs text-gray-400 mt-1">Set up salary structures to start generating payslips</p>
                    {canWrite && (
                      <button
                        onClick={handleCreate}
                        className="mt-4 text-sm text-[#FF7B30] hover:underline font-medium"
                      >
                        Set up the first structure →
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                structures.map((s, idx) => {
                  const emp = s.employee || {};
                  const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();
                  return (
                    <motion.tr
                      key={s._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7B30] text-xs font-bold flex-shrink-0">
                            {initials || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-gray-400">{emp.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">{fmt(s.ctc)}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">₹{fmtShort(s.ctc / 12)}/mo</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">
                        {s.effectiveFrom ? new Date(s.effectiveFrom).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="bg-orange-50 text-[#FF7B30] text-xs px-2 py-0.5 rounded-full font-semibold">
                          v{s.version || 1}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">{s.componentsCount || 0} components</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewHistory(emp._id)}
                            title="View Revision History"
                            className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-[#FF7B30] transition-colors"
                          >
                            <History size={15} />
                          </button>
                          {canWrite && (
                            <button
                              onClick={() => handleRevise(s)}
                              title="Revise Structure"
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteConfirm(s)}
                              title="Delete"
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="text-primaryText">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 text-xs font-medium">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Salary Structure Modal */}
      <SalaryStructureModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchStructures()}
        employees={employees}
        existingId={modalMode === 'revise' ? editId : null}
        existingData={modalMode === 'revise' ? editData : null}
      />

      {/* History Modal */}
      <Modal
        isVisible={historyOpen}
        title="Salary Revision History"
        subtitle="All previous and current salary structures for this employee"
        onClose={() => setHistoryOpen(false)}
        maxWidth="520px"
      >
        {historyLoading && (
          <div className="space-y-3 py-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
        {!historyLoading && historyData.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">No history found</div>
        )}
        {!historyLoading && historyData.map((h) => (
          <div key={h._id} className="flex items-start gap-3 py-3.5 border-b border-gray-100 last:border-0">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-xs font-bold text-[#FF7B30] flex-shrink-0 mt-0.5">
              v{h.version}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{fmt(h.ctc)} / year</p>
              <p className="text-xs text-gray-400 mt-0.5">
                From: {h.effectiveFrom ? new Date(h.effectiveFrom).toLocaleDateString('en-IN') : '—'}
                {h.effectiveTo && ` → ${new Date(h.effectiveTo).toLocaleDateString('en-IN')}`}
                {!h.effectiveTo && ' → Present'}
              </p>
              {h.notes && <p className="text-xs text-gray-500 mt-1 italic">{h.notes}</p>}
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              h.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {h.isActive ? 'Active' : 'Archived'}
            </span>
          </div>
        ))}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isVisible={!!deleteConfirm}
        title="Delete Salary Structure?"
        onClose={() => setDeleteConfirm(null)}
        maxWidth="420px"
      >
        <p className="text-sm text-primaryText mb-6">
          This will permanently remove the salary structure for{' '}
          <strong className="text-blackText">
            {deleteConfirm?.employee?.firstName} {deleteConfirm?.employee?.lastName}
          </strong>.
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
