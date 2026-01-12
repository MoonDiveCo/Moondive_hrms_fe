'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Folder, Download, Printer, Mail, Trash2, Edit } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up the worker using jsdelivr CDN
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export default function ViewFileModal({
  open,
  onClose,
  file,
  user,
  isSuperAdmin,
  canManagePolicies,
  onApprove,
  onReject,
  onSuggestChanges,
  onEdit,
  onDelete,
  onAcknowledge,
}) {
  const [rejectMode, setRejectMode] = useState(false);
  const [suggestMode, setSuggestMode] = useState(false);
  const [reason, setReason] = useState('');
  const [suggestions, setSuggestions] = useState('');

  // Determine user role
  const isHR = canManagePolicies && !isSuperAdmin;
  const isEmployee = !isSuperAdmin && !canManagePolicies;

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setRejectMode(false);
      setSuggestMode(false);
      setReason('');
      setSuggestions('');
    }
  }, [open]);

  if (!open || !file) return null;

  // Filter out Super Admin and HR from acknowledgement table
  const allowedUsers = (file.allowedUsers || [])
    .filter((entry) => {
      const user = entry.user;
      const isSuperAdminOrHR = 
        user?.userRole?.includes('SUPER_ADMIN') || 
        user?.userRole?.includes('HR') ||
        user?.userRole?.includes('SuperAdmin');
      return !isSuperAdminOrHR;
    })
    .sort((a, b) => {
      const aAcknowledged = a.acknowledgementStatus === 'ACKNOWLEDGED';
      const bAcknowledged = b.acknowledgementStatus === 'ACKNOWLEDGED';
      if (aAcknowledged && !bAcknowledged) return -1;
      if (!aAcknowledged && bAcknowledged) return 1;
      return 0;
    });

  const acknowledgedCount = allowedUsers.filter(
    (u) => u.acknowledgementStatus === 'ACKNOWLEDGED'
  ).length;
  const totalCount = allowedUsers.length;

  const isImage = file.fileType?.startsWith('image/');
  const isPdf = file.fileType === 'application/pdf';
  const isPublished = file.status === 'PUBLISHED' || !file.status;
  const isPending = file.status === 'PENDING_APPROVAL';
  const isRejected = file.status === 'REJECTED';
  const isChangesRequested = file.status === 'CHANGES_REQUESTED';

  // Check if current employee has acknowledged
  const currentUserAcknowledgement = file.allowedUsers?.find(
    (u) => u.user?._id?.toString() === user?._id?.toString()
  );
  const hasAcknowledged = currentUserAcknowledgement?.acknowledgementStatus === 'ACKNOWLEDGED';

  // Handlers
  const handleReject = () => {
    if (!reason.trim()) return;
    onReject(file._id, reason);
    onClose();
  };

  const handleSuggestChanges = () => {
    if (!suggestions.trim()) return;
    onSuggestChanges(file._id, suggestions);
    onClose();
  };

  const handleApprove = () => {
    onApprove(file._id);
    onClose();
  };

  const handleDownload = () => {
    window.open(file.fileUrl, '_blank');
  };

  const handlePrint = () => {
    const printWindow = window.open(file.fileUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleSendReminder = (userId) => {
    console.log('Send reminder to user:', userId);
  };

  // EMPLOYEE VIEW - Compact and Simple
  if (isEmployee) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
        <div className="bg-white w-full max-w-[40%] rounded-xl shadow-2xl">
          {/* Header */}
          <div className="px-5 py-4 border-b">
            <h3 className="text-lg font-bold text-gray-900">Policy Document</h3>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* File Preview */}
            <a
              href={file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="relative h-48 rounded-lg border-2 border-gray-200 bg-gray-50 flex flex-col items-center justify-center group hover:border-orange-300 transition-colors overflow-hidden">
                {isImage ? (
                  <img
                    src={file.fileUrl}
                    alt={file.fileName}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : isPdf ? (
<div className="w-full h-full bg-white overflow-hidden relative">
    <Document
      file={file.fileUrl}
      onLoadSuccess={(pdf) => console.log('PDF loaded:', pdf.numPages, 'pages')}
      onLoadError={(error) => console.error('PDF load error:', error)}
      loading={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Loading PDF...</p>
          </div>
        </div>
      }
      error={
        <div className="text-center flex items-center justify-center h-full">
          <div>
            <div className="w-16 h-16 bg-red-100 rounded-lg shadow flex items-center justify-center mb-3 mx-auto">
              <FileText size={32} className="text-red-500" />
            </div>
            <p className="text-sm font-medium text-gray-900 text-center px-4">
              {file.fileName}
            </p>
            <p className="text-xs text-red-500 mt-1">Failed to load preview</p>
          </div>
        </div>
      }
    >
      <div className="absolute top-0 left-0 w-full h-full flex items-start justify-center">
        <div style={{
          transform: 'scale(3)',
          transformOrigin: 'top center',
          marginTop: '-10px'
        }}>
          <Page 
            pageNumber={1} 
            width={200}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </div>
      </div>
    </Document>
  </div>
                ) : (
                  <div className="text-center">
                    <FileText size={48} className="text-gray-400 mb-2 mx-auto" />
                    <p className="text-sm text-gray-500">Click to view</p>
                  </div>
                )}
                
                {/* Action Icons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDownload();
                    }}
                    className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-gray-700 hover:text-orange-600"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </a>

            {/* File Info */}
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  File Name
                </p>
                <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Folder
                </p>
                <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                  {file.folder}
                </span>
              </div>

              {file.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-700">{file.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t bg-gray-50 rounded-b-xl flex justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            
            {!hasAcknowledged && isPublished && (
              <button
                onClick={() => {
                  onAcknowledge(file._id);
                  onClose();
                }}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#FF7B30] hover:bg-[#ff6a1a] text-white transition-colors"
              >
                Acknowledge Policy
              </button>
            )}
            
            {hasAcknowledged && (
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Acknowledged
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // SUPER ADMIN & HR VIEW - Full Featured
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 ">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col hide-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">File Details</h3>
            <p className="text-sm text-gray-500 mt-1">Review and manage document</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body - Single Column */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 hide-scrollbar">
          
          {/* File Preview */}
          <a
            href={file.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative h-48 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center group overflow-hidden">
              {isImage ? (
                <img
                  src={file.fileUrl}
                  alt={file.fileName}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : isPdf ? (
<div className="w-full h-full bg-white overflow-hidden relative">
    <Document
      file={file.fileUrl}
      onLoadSuccess={(pdf) => console.log('PDF loaded:', pdf.numPages, 'pages')}
      onLoadError={(error) => console.error('PDF load error:', error)}
      loading={
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-xs text-gray-500">Loading PDF...</p>
        </div>
      }
      error={
        <div className="flex flex-col items-center text-center justify-center h-full">
          <div className="w-16 h-16 bg-red-100 rounded-lg shadow flex items-center justify-center mb-3">
            <FileText size={32} className="text-red-500" />
          </div>
          <p className="text-sm font-medium text-gray-900 px-4">
            {file.fileName}
          </p>
          <p className="text-xs text-red-500 mt-1">Failed to load preview</p>
        </div>
      }
    >
      <div className="absolute top-0 left-0 w-full h-full flex items-start justify-center">
        <div style={{
          transform: 'scale(3)',
          transformOrigin: 'top center',
          marginTop: '-10px'
        }}>
          <Page 
            pageNumber={1} 
            width={200}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </div>
      </div>
    </Document>
  </div>
              ) : (
                <div className="text-center">
                  <FileText size={48} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Preview not available</p>
                </div>
              )}

              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload();
                  }}
                  className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-gray-700 hover:text-orange-600"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          </a>

          {/* File Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <FileText size={12} />
                File Name
              </div>
              <p className="text-sm font-medium text-gray-900 break-all">{file.fileName}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <Folder size={12} />
                Folder
              </div>
              <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                {file.folder}
              </span>
            </div>

            {file.description && (
              <div className="col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-700">{file.description}</p>
              </div>
            )}
          </div>

          {/* Acknowledgement Table */}
          {allowedUsers.length > 0 && (
            <div className="border rounded-xl overflow-hidden">
              {/* Header */}
              <div className="bg-white px-4 py-3 border-b">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-gray-900">TRACKING & COMPLIANCE</h4>

                </div>
                <p className="text-xs text-gray-500">Monitor employee acknowledgements</p>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                <div className="col-span-6">Employee</div>
                <div className="col-span-4">Status</div>
                <div className="col-span-2 text-center">Action</div>
              </div>

              {/* Table Body */}
              <div className="max-h-60 overflow-y-auto hide-scrollbar">
                {allowedUsers.map((entry) => {
                  const empUser = entry.user;
                  const acknowledged = entry.acknowledgementStatus === 'ACKNOWLEDGED';

                  return (
                    <div
                      key={empUser?._id}
                      className="grid grid-cols-12 px-4 py-2.5 items-center border-b last:border-b-0 hover:bg-gray-50 transition-colors "
                    >
                      {/* Employee Name */}
                      <div className="col-span-6">
                        <p className="font-medium text-gray-900 text-sm">
                          {empUser?.firstName} {empUser?.lastName}
                        </p>
                        {empUser?.employeeId && (
                          <p className="text-xs text-gray-500">ID: {empUser.employeeId}</p>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="col-span-4">
                        {acknowledged ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Acknowledged
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Action */}
                      <div className="col-span-2 flex justify-center">
                        {acknowledged ? (
                          <div className="w-5 h-5 rounded-full bg-[#FF7B30] flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSendReminder(empUser?._id)}
                            className="p-1 text-gray-400 hover:text-[#FF7B30] hover:bg-orange-50 rounded transition-colors"
                            title="Send reminder"
                          >
                            <Mail size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status Messages for HR */}
          {isHR && !isPublished && (
            <div className="space-y-3">
              {isPending && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-yellow-800">Pending Approval</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Waiting for Super Admin to review and approve
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isRejected && file.rejectionReason && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">Rejected</p>
                      <p className="text-xs text-red-700 mt-1">
                        <strong>Reason:</strong> {file.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isChangesRequested && file.suggestedChanges && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Changes Requested</p>
                      <p className="text-xs text-blue-700 mt-1">
                        <strong>Suggested Changes:</strong> {file.suggestedChanges}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SuperAdmin Review Section */}
          {isSuperAdmin && !isPublished && (
            <div className="space-y-4">
              {/* Show previous feedback if exists */}
              {((isRejected && file.rejectionReason) || (isChangesRequested && file.suggestedChanges)) && (
                <div className="space-y-3">
                  {isRejected && file.rejectionReason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-semibold text-red-800 mb-1">Previous Rejection:</p>
                      <p className="text-xs text-red-700">{file.rejectionReason}</p>
                    </div>
                  )}
                  {isChangesRequested && file.suggestedChanges && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-semibold text-blue-800 mb-1">Previously Suggested:</p>
                      <p className="text-xs text-blue-700">{file.suggestedChanges}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Reject Input Mode */}
              {rejectMode && (
                <div className="border-2 border-gray-200 rounded-lg p-4 space-y-3">
                  <label className="block text-sm font-bold text-gray-900">Rejection Reason</label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500"
                    placeholder="Enter reason for rejection..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setRejectMode(false);
                        setReason('');
                      }}
                      className="px-4 py-2 text-sm font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={!reason.trim()}
                      className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#FF7B30] hover:bg-[#ff6a1a] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Suggest Changes Input Mode */}
              {suggestMode && (
                <div className="border-2 border-gray-200 rounded-lg p-4 space-y-3">
                  <label className="block text-sm font-bold text-gray-900">Suggested Changes</label>
                  <textarea
                    rows={3}
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500"
                    placeholder="Explain what needs to be updated..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setSuggestMode(false);
                        setSuggestions('');
                      }}
                      className="px-4 py-2 text-sm font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSuggestChanges}
                      disabled={!suggestions.trim()}
                      className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#FF7B30] hover:bg-[#ff6a1a] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Suggestions
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div className="px-6 py-4 border-t bg-gray-50 flex-shrink-0 rounded-b-2xl">
          {/* SuperAdmin - Unpublished File */}
          {isSuperAdmin && !isPublished && (
            <div className="flex justify-between items-center gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSuggestMode(!suggestMode);
                    if (!suggestMode) {
                      setRejectMode(false);
                      setReason('');
                    }
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    suggestMode 
                      ? 'bg-[#FF7B30] text-white' 
                      : 'bg-orange-100 text-[#FF7B30] hover:bg-orange-200'
                  }`}
                >
                  Suggest Changes
                </button>
                <button
                  onClick={() => {
                    setRejectMode(!rejectMode);
                    if (!rejectMode) {
                      setSuggestMode(false);
                      setSuggestions('');
                    }
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    rejectMode 
                      ? 'bg-[#FF7B30] text-white' 
                      : 'bg-orange-100 text-[#FF7B30] hover:bg-orange-200'
                  }`}
                >
                  Reject
                </button>
              </div>
              <button
                onClick={handleApprove}
                className="px-6 py-2 text-sm font-semibold rounded-lg bg-[#FF7B30] hover:bg-[#ff6a1a] text-white transition-colors"
              >
                Approve & Publish
              </button>
            </div>
          )}

          {/* SuperAdmin & HR - Published File */}
          {isPublished && !isEmployee && (
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onDelete(file);
                    onClose();
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  onClick={() => {
                    onEdit(file);
                    onClose();
                  }}
                  className="px-4 py-2.5 text-sm font-medium bg-orange-100 text-[#FF7B30] hover:bg-orange-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#FF7B30] hover:bg-[#ff6a1a] text-white transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* HR - Unpublished File */}
          {isHR && !isPublished && (
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onDelete(file);
                    onClose();
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  onClick={() => {
                    onEdit(file);
                    onClose();
                  }}
                  className="px-4 py-2.5 text-sm font-medium bg-orange-100 text-[#FF7B30] hover:bg-orange-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#FF7B30] hover:bg-[#ff6a1a] text-white transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}