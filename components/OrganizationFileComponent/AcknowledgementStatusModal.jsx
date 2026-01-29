'use client';

import React from 'react';
import { X, Mail } from 'lucide-react';

export default function AcknowledgementStatusModal({
  open,
  onClose,
  policy,
}) {
  if (!open || !policy) return null;

  // Sort users: Acknowledged first, then Pending
  const allowedUsers = (policy.allowedUsers || []).sort((a, b) => {
    const aAcknowledged = a.acknowledgementStatus === 'ACKNOWLEDGED';
    const bAcknowledged = b.acknowledgementStatus === 'ACKNOWLEDGED';
    
    // Acknowledged users come first
    if (aAcknowledged && !bAcknowledged) return -1;
    if (!aAcknowledged && bAcknowledged) return 1;
    return 0;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/40 overflow-y-auto py-10 backdrop-blur-sm">
      <div
        className="bg-white w-full max-w-3xl rounded-xl shadow-xl p-6 relative
                   max-h-[80vh] flex flex-col"
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        {/* HEADER */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Acknowledgement Status
          </h3>
          <p className="text-sm text-gray-500">
            {policy.fileName}
          </p>
        </div>

        {/* TABLE */}
        <div className="border rounded-lg overflow-hidden flex-1 overflow-y-auto hide-scrollbar">
          <div className="grid grid-cols-12 px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-600 sticky top-0 z-10">
            <div className="col-span-5">EMPLOYEE</div>
            <div className="col-span-4">ACKNOWLEDGEMENT</div>
            <div className="col-span-3 text-right">ACTION</div>
          </div>

          {allowedUsers.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No users assigned to this policy
            </div>
          ) : (
            allowedUsers.map((entry) => {
              const user = entry.user;
              const isAcknowledged =
                entry.acknowledgementStatus === 'ACKNOWLEDGED';

              return (
                <div
                  key={user?._id}
                  className="grid grid-cols-12 px-4 py-3 items-center border-t text-sm"
                >
                  {/* USER */}
                  <div className="col-span-5">
                    <p className="font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    {user?.employeeId && (
                      <p className="text-xs text-gray-500">
                        {user.employeeId}
                      </p>
                    )}
                  </div>

                  {/* STATUS */}
                  <div className="col-span-4">
                    {isAcknowledged ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Acknowledged
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* ACTION */}
                  <div className="col-span-3 flex justify-end">
                    {!isAcknowledged && (
                      <button
                        disabled={policy.status !== 'PUBLISHED'}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Send reminder email"
                        onClick={() => {
                          // TODO: Implement email reminder API call
                        }}
                      >
                        <Mail size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white rounded-md bg-orange-500 hover:bg-orange-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}