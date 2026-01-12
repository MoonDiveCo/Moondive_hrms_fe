import React from 'react';
import {
  FileText,
  ShieldCheck,
  ScrollText,
  Trash2,
  Eye,
  CheckCircle,
} from 'lucide-react';

const CATEGORY_META = {
  'Company Docs': {
    icon: FileText,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    pill: 'bg-blue-100 text-blue-700',
  },
  'HR Policies': {
    icon: ShieldCheck,
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    pill: 'bg-orange-100 text-orange-700',
  },
  Internal: {
    icon: ScrollText,
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    pill: 'bg-slate-200 text-slate-700',
  },
};

export default function OrganizationFilesTable({
  files,
  user,
  activeFilter,
  isEmployeeOnly,
  canManagePolicies,
  onViewFile,
  onViewAcknowledgements,
  onEditFile,
  onDeleteFile,
  onAcknowledge,
  onPolicyClick,
}) {
  const isPendingTab = activeFilter === 'Pending Policies';

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className={`grid ${isPendingTab ? 'grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr]' : isEmployeeOnly ? 'grid-cols-[2fr_1.2fr_1fr_0.6fr_0.8fr]' : 'grid-cols-[2fr_1.2fr_1fr_0.8fr]'} gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200`}>
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          DOCUMENT
        </div>
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          CATEGORY
        </div>
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          UPLOAD DATE
        </div>
        {isPendingTab && (
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            STATUS
          </div>
        )}
        {isEmployeeOnly && !isPendingTab && (
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
            STATUS
          </div>
        )}
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
          ACTIONS
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {files.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No files found
          </div>
        ) : (
          files.map((file) => {
            const meta = CATEGORY_META[file.folder] || CATEGORY_META.Internal;
            const Icon = meta.icon;

            // Check if current user has acknowledged
            const userAcknowledgement = file.allowedUsers?.find(
              (u) => u.user?._id?.toString() === user?._id?.toString()
            );
            const hasAcknowledged = userAcknowledgement?.acknowledgementStatus === 'ACKNOWLEDGED';

            // Get status badge info for pending tab
            const getStatusBadge = () => {
              if (file.status === 'REJECTED') {
                return {
                  text: 'Rejected',
                  className: 'bg-red-100 text-red-700 border border-red-200'
                };
              } else if (file.status === 'CHANGES_REQUESTED') {
                return {
                  text: 'Changes Requested',
                  className: 'bg-blue-100 text-blue-700 border border-blue-200'
                };
              } else if (file.status === 'PENDING_APPROVAL') {
                return {
                  text: 'Pending Approval',
                  className: 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                };
              }
              return null;
            };

            const statusBadge = getStatusBadge();

            return (
              <div
                key={file._id}
                onClick={() => onPolicyClick(file)}
                className={`grid ${isPendingTab ? 'grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr]' : isEmployeeOnly ? 'grid-cols-[2fr_1.2fr_1fr_0.6fr_0.8fr]' : 'grid-cols-[2fr_1.2fr_1fr_0.8fr]'} gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer`}
              >
                {/* Document Column */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg} relative`}>
                    <Icon className={`w-5 h-5 ${meta.text}`} />
                    {/* Unacknowledged Badge for Employees */}
                    {isEmployeeOnly && !hasAcknowledged && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">!</span>
                      </div>
                    )}
                    {/* Pending Badge for SuperAdmin in Pending Tab */}
                    {isPendingTab && canManagePolicies && !isEmployeeOnly && (
                      <>
                        {/* SuperAdmin sees ! for PENDING_APPROVAL */}
                        {file.status === 'PENDING_APPROVAL' && user?.userRole?.includes('SuperAdmin') && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">!</span>
                          </div>
                        )}
                        {/* HR sees ! for REJECTED or CHANGES_REQUESTED */}
                        {(file.status === 'REJECTED' || file.status === 'CHANGES_REQUESTED') && 
                         canManagePolicies && !user?.userRole?.includes('SuperAdmin') && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">!</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.fileName}
                    </p>
                    {file.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {file.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category Column */}
                <div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${meta.pill}`}>
                    {file.folder}
                  </span>
                </div>

                {/* Upload Date Column */}
                <div className="text-sm text-gray-600">
                  {new Date(file.createdAt).toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>

                {/* Status Column (only for pending tab) */}
                {isPendingTab && statusBadge && (
                  <div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
                      {statusBadge.text}
                    </span>
                  </div>
                )}

                {/* Employee Status Column */}
                {isEmployeeOnly && !isPendingTab && (
                  <div className="flex justify-center">
                    {hasAcknowledged ? (
                      <div className="w-7 h-7 rounded-full bg-[#FF7B30] flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcknowledge(file._id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-[#FF7B30] hover:bg-orange-50 rounded-lg transition-colors"
                        title="Acknowledge policy"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M7 10v12"/>
                          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                )}

                {/* Actions Column */}
                <div className="flex items-center justify-end gap-2">
                  {/* View Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewFile(file);
                    }}
                    className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                    title="View file details"
                  >
                    <Eye size={18} />
                  </button>

                  {/* Edit Button (for managers) */}
                  {canManagePolicies && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditFile(file);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit file"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                    </button>
                  )}

                  {/* Delete Button (for managers) */}
                  {canManagePolicies && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete file"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}