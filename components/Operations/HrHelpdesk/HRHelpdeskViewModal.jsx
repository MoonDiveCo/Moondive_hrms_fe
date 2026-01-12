'use client';

import { X, FileText } from 'lucide-react';

export default function HRHelpdeskViewModal({ isOpen, onClose, request }) {
  if (!isOpen || !request) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          
          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Priority</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                {request.priority}
              </span>
            </div>
          </div>

          {/* Raised By */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Raised By</p>
            <p className="text-sm font-medium text-gray-900">
              {request.raisedBy
                ? `${request.raisedBy.firstName} ${request.raisedBy.lastName}`
                : '—'}
            </p>
          </div>

          {/* Recipients */}
          {request.recipients?.length > 0 && (
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Recipients</p>
              <p className="text-sm font-medium text-gray-900">
                {request.recipients
                  .map((u) => `${u.firstName} ${u.lastName}`)
                  .join(', ')}
              </p>
            </div>
          )}

          {/* Category */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Category</p>
            <p className="text-sm font-medium text-gray-900">{request.category || '—'}</p>
          </div>

          {/* Subject */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Subject</p>
            <p className="text-sm font-medium text-gray-900">{request.subject || '—'}</p>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Description</p>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{request.description || '—'}</p>
          </div>

          {/* Rejection Note */}
          {request.status === 'Rejected' && request.hrNote && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-xs font-medium text-red-900 uppercase mb-1">Rejection Reason</p>
              <p className="text-sm text-red-800 mt-1">{request.hrNote}</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t px-6 py-4 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}