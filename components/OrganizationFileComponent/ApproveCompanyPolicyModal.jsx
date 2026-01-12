'use client';
import React, { useEffect, useState } from 'react';

export default function ApproveCompanyPolicyModal({
  open,
  onClose,
  policy,
  isSuperAdmin,
  onApprove,
  onReject,
  onSuggestChanges,
}) {
  const [rejectMode, setRejectMode] = useState(false);
  const [suggestMode, setSuggestMode] = useState(false);

  const [reason, setReason] = useState('');
  const [suggestions, setSuggestions] = useState('');

  /* ---------------- RESET STATE ---------------- */
  useEffect(() => {
    if (!open) {
      setRejectMode(false);
      setSuggestMode(false);
      setReason('');
      setSuggestions('');
    }
  }, [open, policy]);

  if (!open || !policy) return null;

  /* ---------------- STATUS FLAGS ---------------- */
  const isRejected = policy.status === 'REJECTED';
  const isPending = policy.status === 'PENDING_APPROVAL';
  const isPublished = policy.status === 'PUBLISHED';
  const isChangesRequested = policy.status === 'CHANGES_REQUESTED';

  /* ---------------- HANDLERS ---------------- */
  const handleReject = () => {
    if (!reason.trim()) return;
    onReject(policy._id, reason);
  };

  const handleSuggestChanges = () => {
    if (!suggestions.trim()) return;
    onSuggestChanges(policy._id, suggestions);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* TITLE */}
        <h3 className="text-lg font-semibold mb-4">
          Policy Review
        </h3>

        {/* ======================================================
            SUPER ADMIN VIEW
        ====================================================== */}
        {isSuperAdmin && !isPublished && (
          <>
            {/* PREVIOUS REJECTION */}
            {isRejected && policy.rejectionReason && (
              <div className="mb-4 text-sm bg-red-50 text-red-700 p-3 rounded">
                <strong>Previous Rejection Reason:</strong>
                <p className="mt-1">{policy.rejectionReason}</p>
              </div>
            )}

            {/* PREVIOUS SUGGESTIONS */}
            {isChangesRequested && policy.suggestedChanges && (
              <div className="mb-4 text-sm bg-blue-50 text-blue-700 p-3 rounded">
                <strong>Previously Suggested Changes:</strong>
                <p className="mt-1">{policy.suggestedChanges}</p>
              </div>
            )}

            {/* ACTION SELECTION */}
            {!rejectMode && !suggestMode ? (
              <>
                <p className="text-sm text-gray-600 mb-6">
                  Choose an action for this policy.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setRejectMode(true)}
                    className="px-4 py-2 text-sm rounded-md bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => setSuggestMode(true)}
                    className="px-4 py-2 text-sm rounded-md bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Suggest Changes
                  </button>

                  <button
                    onClick={() => onApprove(policy._id)}
                    className="px-4 py-2 text-sm rounded-md bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Approve
                  </button>
                </div>
              </>
            ) : null}

            {/* REJECT MODE */}
            {rejectMode && (
              <>
                <label className="text-sm font-medium">
                  Rejection Reason
                </label>

                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-2 w-full border rounded-md p-2 text-sm"
                  placeholder="Enter reason for rejection"
                />

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setRejectMode(false);
                      setReason('');
                    }}
                    className="px-4 py-2 text-sm border rounded-md"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={!reason.trim()}
                    className="px-4 py-2 text-sm rounded-md bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                  >
                    Reject Policy
                  </button>
                </div>
              </>
            )}

            {/* SUGGEST CHANGES MODE */}
            {suggestMode && (
              <>
                <label className="text-sm font-medium">
                  Suggested Changes
                </label>

                <textarea
                  rows={4}
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  className="mt-2 w-full border rounded-md p-2 text-sm"
                  placeholder="Explain what needs to be updated"
                />

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSuggestMode(false);
                      setSuggestions('');
                    }}
                    className="px-4 py-2 text-sm border rounded-md"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSuggestChanges}
                    disabled={!suggestions.trim()}
                    className="px-4 py-2 text-sm rounded-md  text-white disabled:opacity-50 bg-orange-500 hover:bg-orange-600"
                  >
                    Send Suggestions
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ======================================================
            HR VIEW
        ====================================================== */}
        {!isSuperAdmin && (
          <div className="space-y-3">

            {isPending && (
              <p className="text-sm bg-yellow-100 text-yellow-700 p-3 rounded">
                Waiting for Super Admin approval
              </p>
            )}

            {isPublished && (
              <p className="text-sm bg-green-100 text-green-700 p-3 rounded">
                Policy has been approved
              </p>
            )}

            {isRejected && policy.rejectionReason && (
              <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
                <strong>Rejection Reason:</strong>
                <p className="mt-1">{policy.rejectionReason}</p>
              </div>
            )}

            {isChangesRequested && policy.suggestedChanges && (
              <div className="bg-blue-50 text-blue-700 p-3 rounded text-sm">
                <strong>Requested Changes:</strong>
                <p className="mt-1">{policy.suggestedChanges}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}