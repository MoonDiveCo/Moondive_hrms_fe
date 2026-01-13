'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Eye, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import EntityTable from '@/components/Common/EntityTable';
import HRHelpdeskSlideOver from '@/components/Operations/HrHelpdesk/HrHelpdeskSlideOver';
import HRHelpdeskViewModal from '@/components/Operations/HrHelpdesk/HRHelpdeskViewModal';
import DeleteButton from '@/components/OrganizationFileComponent/ConfirmDeleteModal';
import axios from 'axios';

export default function HRHelpdeskPage() {
  const [tab, setTab] = useState('sent');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const lastFocusedRef = useRef(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);
  const [profile, setProfile] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);


  useEffect(() => {
  async function fetchProfile() {
    try {
      const res = await axios.get('/user/get-profile');
      setProfile(res.data?.result || null);
    } catch (err) {
      console.error('Failed to fetch profile');
      setProfile(null);
    }
  }

  fetchProfile();
}, []);


  useEffect(() => {
    fetchData();
  }, [tab]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when tab changes
  }, [tab]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await axios.get(
        tab === 'sent'
          ? '/hrms/hrhelpdesk/sent'
          : '/hrms/hrhelpdesk/received'
      );

      setRows(Array.isArray(res.data?.result) ? res.data.result : []);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }

  /* ---------- PAGINATION ---------- */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = rows.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(rows.length / itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  /* ---------- MODAL HANDLERS ---------- */
  function openAdd(e) {
    lastFocusedRef.current = e?.currentTarget;
    setSelected(null);
    setOpen(true);
  }

  // Helper to check if request is approved
  const isApproved = (row) => {
    return row.status === 'Approved';
  };


  
  // Updated openView function with conditional logic
  async function openView(row, e) {
  lastFocusedRef.current = e?.currentTarget;
  setSelected(row);

  // 🔥 MARK AS VIEWED (received tab only)
  if (tab === 'received') {
    try {
      await axios.post(`/hrms/hrhelpdesk/hrhelpdesk/${row._id}/view`);
    } catch (e) {
      console.error("Failed to mark viewed");
    }
  }

  if (tab === 'received') {
    if (isApproved(row)) {
      setViewOpen(true);
    } else {
      setOpen(true);
    }
  } else {
    setViewOpen(true);
  }
}

  function close() {
    setOpen(false);
    setSelected(null);
    lastFocusedRef.current?.focus();
  }

  /* ---------- PERMISSION HELPERS ---------- */
  function canEdit(row) {
    return row.status === 'Open' || row.status === 'Rejected';
  }

  // Check if request can be acted upon (for received tab)
  function canActOnRequest(row) {
    return tab === 'received' && !isApproved(row);
  }

// Count unviewed received requests
const unviewedCount = (() => {
  if (tab !== 'received') return 0; // Only show badge on received tab

  // if (!me) return 0; // wait for user info

  
  if (Array.isArray(profile.user.userRole) && profile.user.userRole.includes('HR')){
    // HR sees only assignedTo
    return rows.filter(r => r.assignedTo?.isViewed === false).length;
  } else {
    // Regular users see recipients
    return rows.filter(r => r.recipients?.some(rec => rec.isViewed === false)).length;
  }
})();


  /* ---------- BADGE STYLES ---------- */
  const getPriorityStyle = (priority) => {
    const styles = {
      High: 'bg-red-100 text-red-700 border border-red-200',
      Medium: 'bg-orange-100 text-orange-700 border border-orange-200',
      Low: 'bg-blue-100 text-blue-700 border border-blue-200',
    };
    return styles[priority] || 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  const getStatusStyle = (status) => {
    const styles = {
      Open: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'In Progress': 'bg-blue-100 text-blue-800 border border-blue-200',
      Approved: 'bg-green-100 text-green-800 border border-green-200',
      Rejected: 'bg-red-100 text-red-800 border border-red-200',
      Closed: 'bg-gray-100 text-gray-800 border border-gray-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  /* ---------- TABLE COLUMNS ---------- */
  const columns = [
    {
      key: 'subject',
      header: 'Subject',
      render: (r) => {
        const text = r.subject || '';
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900" title={text}>
              {text.length > 30 ? `${text.slice(0, 30)}...` : text}
            </span>
            {r.description && (
              <span className="text-xs text-gray-500 mt-0.5">
                {r.description.length > 40 
                  ? `${r.description.slice(0, 40)}...` 
                  : r.description}
              </span>
            )}
          </div>
        );
      },
    },
    { 
      key: 'category', 
      header: 'Category',
      render: (r) => (
        <span className="text-gray-700">{r.category || '-'}</span>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (r) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityStyle(r.priority)}`}>
          {r.priority}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(r.status)}`}>
          {r.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {/* VIEW BUTTON - Updated with tooltip */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openView(r, e);
              }}
              className="p-2 rounded-md hover:bg-orange-50 text-grey-600 transition-colors group relative"
              title={
                tab === 'received' 
                  ? (isApproved(r) ? 'View (Approved)' : 'Review & Respond')
                  : 'View'
              }
            >
              <Eye size={16} />
              {/* Tooltip for received tab */}
              {tab === 'received' && !isApproved(r) && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Review & Respond
                </div>
              )}
            </button>

            {/* EDIT - Only for sent tab */}
            {tab === 'sent' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!canEdit(r)) return;
                  setSelected(r);
                  setOpen(true);
                }}
                disabled={!canEdit(r)}
                className={`p-2 rounded-md transition-colors ${
                  canEdit(r)
                    ? 'hover:bg-green-50 text-grey-600'
                    : 'cursor-not-allowed opacity-40 text-gray-400'
                }`}
                title={
                  canEdit(r)
                    ? 'Edit'
                    : 'Approved requests cannot be edited'
                }
              >
                <Pencil size={16} />
              </button>
            )}

            {/* DELETE - Only for sent tab */}
            {tab === 'sent' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteRow(r);
                }}
                className="p-2 rounded-md hover:bg-red-50 text-grey-600 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* HEADER */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">HR Help Desk</h3>
              <p className="text-sm text-gray-500 mt-1">Manage and track help desk requests</p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium shadow-sm transition-colors"
            >
              <Plus size={18} /> New Request
            </button>
          </div>
        </div>

        {/* TABS */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
  <div className="flex gap-1 p-2">
    {['sent', 'received'].map((t) => (
      <button
        key={t}
        onClick={() => setTab(t)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
          tab === t 
            ? 'bg-orange-500 text-white shadow-sm' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span>
          {t === 'sent' ? 'Sent Requests' : 'Received Requests'}
        </span>

        {/* 🔴 UNVIEWED COUNT BADGE */}
        {t === 'received' && unviewedCount > 0 && (
          <span
            className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
              tab === 'received'
                ? 'bg-white text-orange-600'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {unviewedCount}
          </span>
        )}
      </button>
    ))}
  </div>
</div>


        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <EntityTable
            data={currentItems}
            columns={columns}
            loading={loading}
            emptyText="No requests found"
          />

          {/* PAGINATION */}
          {rows.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, rows.length)}</span> of{' '}
                <span className="font-medium">{rows.length}</span> results
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md border ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`min-w-[36px] px-3 py-1.5 rounded-md text-sm font-medium ${
                            currentPage === page
                              ? 'bg-orange-500 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md border ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SLIDE OVER - For editing sent requests and reviewing received non-approved requests */}
      <HRHelpdeskSlideOver
        isOpen={open}
        onClose={close}
        request={selected}
        onSaved={() => {
          fetchData();
          close();
        }}
        isReceivedTab={tab === 'received'}
      />

      {/* VIEW MODAL - For viewing sent requests and approved received requests */}
      <HRHelpdeskViewModal
        isOpen={viewOpen}
        request={selected}
        onClose={() => {
          setViewOpen(false);
          setSelected(null);
        }}
        isApprovedRequest={selected && isApproved(selected)}
      />

      {/* DELETE MODAL */}
      {deleteRow && (
        <DeleteButton
          open
          title="Delete Request"
          description="Are you sure you want to delete this request?"
          onClose={() => setDeleteRow(null)}
          onConfirm={async () => {
            await axios.delete(`/hrms/hrhelpdesk/${deleteRow._id}`);
            toast.success('Request deleted');
            setDeleteRow(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}