'use client';

import React, { useEffect, useRef, useState, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { AuthContext } from '@/context/authContext';
import SubModuleProtectedRoute from '@/lib/routeProtection/SubModuleProtectedRoute';
import { getAllDocuments, getEmployeeDocuments, getDocument, deleteDocument, updateDocumentStatus } from '@/services/hrDocsService';
import { Search, FileText, Send, Download, Eye, X, CheckCircle2, Clock, Trash2, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/axiosClient';

const CATEGORIES = [
  'OFFER_LETTER', 'CONTRACT_OF_EMPLOYMENT', 'APPRAISAL_LETTER', 'EXPERIENCE_LETTER',
  'RELIEVING_LETTER', 'NDA', 'WARNING_LETTER', 'PROMOTION_LETTER', 'POLICY', 'OTHER',
];

const STATUS_OPTIONS = ['DRAFT', 'GENERATED', 'SENT', 'ACKNOWLEDGED'];

const STATUS_BADGES = {
  DRAFT: 'bg-gray-100 text-gray-600',
  GENERATED: 'bg-blue-100 text-blue-700',
  SENT: 'bg-green-100 text-green-700',
  ACKNOWLEDGED: 'bg-purple-100 text-purple-700',
};

const STATUS_ICONS = {
  DRAFT: <Clock className="w-3.5 h-3.5" />,
  GENERATED: <FileText className="w-3.5 h-3.5" />,
  SENT: <Send className="w-3.5 h-3.5" />,
  ACKNOWLEDGED: <CheckCircle2 className="w-3.5 h-3.5" />,
};

export default function EmployeeDocumentsPage() {
  const { allUserPermissions = [] } = useContext(AuthContext);
  const searchParams = useSearchParams();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState(searchParams.get('employee') || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [employees, setEmployees] = useState([]);
  const [viewDoc, setViewDoc] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const docxPreviewRef = useRef(null);
  const [docxPreviewReady, setDocxPreviewReady] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // doc object pending deletion
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 15 };
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      let res;
      if (employeeFilter) {
        res = await getEmployeeDocuments(employeeFilter, params);
      } else {
        res = await getAllDocuments(params);
      }
      const data = res.data?.result || res.data?.data || {};
      setDocuments(data.docs || data || []);
      setTotalPages(data.pages || data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, employeeFilter, categoryFilter, statusFilter]);

  useEffect(() => {
    apiClient.get('hrms/employee/list')
      .then((res) => setEmployees(res.data?.result || res.data?.data || []))
      .catch(() => {});
  }, []);

  // Render docx-preview when viewDoc is a DOCX type
  useEffect(() => {
    if (!viewDoc?.docxBase64 || !docxPreviewRef.current) return;
    setDocxPreviewReady(false);
    (async () => {
      try {
        const { renderAsync } = await import('docx-preview');
        const binary = atob(viewDoc.docxBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        docxPreviewRef.current.innerHTML = '';
        await renderAsync(bytes.buffer, docxPreviewRef.current, null, {
          className: 'docx-preview', inWrapper: false, ignoreWidth: true,
          renderHeaders: true, renderFooters: true, breakPages: true, useBase64URL: true,
        });
        setDocxPreviewReady(true);
      } catch (err) {
        console.error('docx-preview error:', err);
      }
    })();
  }, [viewDoc?.docxBase64]);

  const openDocument = async (doc) => {
    setLoadingDoc(true);
    setViewDoc(null);
    setDocxPreviewReady(false);
    try {
      const res = await getDocument(doc._id);
      setViewDoc(res.data?.result || res.data?.data);
    } catch {
      toast.error('Failed to load document');
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteDocument(deleteConfirm._id);
      toast.success('Document deleted');
      setDeleteConfirm(null);
      fetchDocuments();
    } catch {
      toast.error('Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkAcknowledged = async (doc) => {
    setUpdatingStatus(true);
    try {
      await updateDocumentStatus(doc._id, 'ACKNOWLEDGED');
      toast.success('Document marked as acknowledged');
      fetchDocuments();
      if (viewDoc?._id === doc._id) setViewDoc((prev) => ({ ...prev, status: 'ACKNOWLEDGED' }));
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDownloadDocx = (doc) => {
    if (!doc?.docxBase64) return;
    const binary = atob(doc.docxBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.templateCategory}_${doc.employeeName || 'document'}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDocs = documents.filter((d) => {
    const q = search.toLowerCase();
    return (
      (d.employeeName || '').toLowerCase().includes(q) ||
      (d.templateName || '').toLowerCase().includes(q) ||
      (d.templateCategory || '').toLowerCase().includes(q)
    );
  });

  const isDocx = (doc) => !!doc?.docxBase64;

  return (
    <SubModuleProtectedRoute>
      <div className="p-4 bg-gray-50 min-h-screen hide-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-bold text-gray-900">Employee Documents</h4>
              <p className="text-sm text-gray-500 mt-1">
                {total > 0 ? `${total} documents` : 'All generated and sent documents'}
              </p>
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by employee or template..."
                className="w-64 pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <select
              value={employeeFilter}
              onChange={(e) => { setEmployeeFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Employees</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {(employeeFilter || categoryFilter || statusFilter || search) && (
              <button
                onClick={() => {
                  setSearch(''); setEmployeeFilter(''); setCategoryFilter('');
                  setStatusFilter(''); setCurrentPage(1);
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors"
              >
                <X className="w-4 h-4" /> Clear filters
              </button>
            )}
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden primaryShadow">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Employee', 'Template', 'Category', 'Status', 'Generated By', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                      <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No documents found</p>
                      {(employeeFilter || categoryFilter || statusFilter) && (
                        <p className="text-xs mt-1 text-gray-400">Try clearing the filters</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7B30] text-xs font-bold">
                            {(doc.employeeName?.[0] || '?').toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{doc.employeeName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{doc.templateName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {(doc.templateCategory || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${STATUS_BADGES[doc.status] || STATUS_BADGES.DRAFT}`}>
                          {STATUS_ICONS[doc.status]}
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {doc.generatedBy?.firstName ? `${doc.generatedBy.firstName} ${doc.generatedBy.lastName || ''}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openDocument(doc)}
                            disabled={loadingDoc}
                            className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-[#FF7B30] transition-colors"
                            title="View document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {doc.status === 'SENT' && (
                            <button
                              onClick={() => handleMarkAcknowledged(doc)}
                              disabled={updatingStatus}
                              className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
                              title="Mark as Acknowledged"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(doc)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white disabled:opacity-40 hover:bg-gray-50">Previous</button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-[#FF7B30] text-white disabled:opacity-40 hover:bg-[#ff6a1a]">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DOCUMENT VIEW MODAL */}
      {(viewDoc || loadingDoc) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h5 className="font-semibold text-gray-900">{viewDoc?.templateName || 'Loading...'}</h5>
                {viewDoc && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    For: {viewDoc.employeeName} •{' '}
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_BADGES[viewDoc.status]}`}>{viewDoc.status}</span>
                    {isDocx(viewDoc) && <span className="ml-2 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">Word (.docx)</span>}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {viewDoc && isDocx(viewDoc) && (
                  <button
                    onClick={() => handleDownloadDocx(viewDoc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Download .docx
                  </button>
                )}
                <button onClick={() => { setViewDoc(null); setDocxPreviewReady(false); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-100">
              {loadingDoc ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-6 h-6 border-2 border-[#FF7B30] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : viewDoc && isDocx(viewDoc) ? (
                /* DOCX preview */
                <div className="p-4">
                  {!docxPreviewReady && (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-5 h-5 border-2 border-[#FF7B30] border-t-transparent rounded-full animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Rendering document...</span>
                    </div>
                  )}
                  <style>{`.doc-mgmt-preview section.docx { box-shadow: 0 4px 24px rgba(0,0,0,0.15); margin: 0 auto 12px; }`}</style>
                  <div ref={docxPreviewRef} className="doc-mgmt-preview" />
                </div>
              ) : viewDoc ? (
                /* QUILL HTML preview */
                <div className="p-8">
                  <style>{`
                    .mgmt-doc-content * { background-color: transparent !important; background: transparent !important; }
                    .mgmt-doc-content p, .mgmt-doc-content span { overflow-wrap: break-word !important; word-break: break-word !important; }
                    .mgmt-doc-content img { max-width: 100% !important; height: auto !important; }
                    .mgmt-doc-content table { max-width: 100% !important; table-layout: fixed !important; }
                  `}</style>
                  <div
                    className="mgmt-doc-content prose prose-sm max-w-none bg-white rounded-xl p-8 shadow"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                    dangerouslySetInnerHTML={{ __html: viewDoc.generatedContent || '<p style="color:#9ca3af">Content not available</p>' }}
                  />
                </div>
              ) : null}
            </div>

            <div className="border-t px-6 py-3 flex justify-end">
              <button
                onClick={() => { setViewDoc(null); setDocxPreviewReady(false); }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">Delete Document</h5>
                <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-medium">"{deleteConfirm.templateName}"</span> for{' '}
              <span className="font-medium">{deleteConfirm.employeeName}</span>?
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </SubModuleProtectedRoute>
  );
}
