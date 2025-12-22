"use client";

import { useState } from "react";
import axios from "axios";

export default function LeaveRequestsModal({
  requests,
  onClose,
  onResolved,
  myLeaves,
}) {
  const [processingId, setProcessingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [reasonMap, setReasonMap] = useState({});
  const [activeTab, setActiveTab] = useState("PENDING");

  async function handleAction(leaveId, action) {
    if (action === "REJECT" && !reasonMap[leaveId]?.trim()) {
      alert("Rejection reason is required");
      return;
    }

    try {
      setProcessingId(leaveId);

      await axios.put("/hrms/leave/update-leave-decision", {
        leaveEntryId: leaveId,
        action,
        reason: reasonMap[leaveId] || "",
      });


      onResolved(leaveId);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
      setRejectingId(null);
    }
  }

  const pendingRequests = requests.filter(
    (l) => l.decision == null
  );

  const approvedRequests = requests.filter(
    (l) => l.decision?.status === "Approved"
  );

  const rejectedRequests = requests.filter(
    (l) => l.decision?.status === "Rejected"
  );

  const visibleRequests =
    activeTab === "PENDING"
      ? pendingRequests
      : activeTab === "APPROVED"
        ? approvedRequests
        : rejectedRequests;

  const visibleMyLeaves = myLeaves || [];

  const visibleItems =
    activeTab === "MY_LEAVES" ? visibleMyLeaves : visibleRequests;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6">
        <div className="flex justify-between mb-4">
          <h4 className="text-primaryText">Leave Requests</h4>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="flex gap-2 mb-4">
          {[
            { key: "PENDING", label: `Pending (${pendingRequests.length})` },
            { key: "APPROVED", label: `Approved (${approvedRequests.length})` },
            { key: "REJECTED", label: `Rejected (${rejectedRequests.length})` },
            { key: "MY_LEAVES", label: `My Leaves (${myLeaves?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${activeTab === tab.key
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>


        {activeTab !== "MY_LEAVES" && visibleRequests.length === 0 && (
          <p className="text-sm text-gray-400 text-center">
            No {activeTab.toLowerCase()} leave requests
          </p>
        )}

        {activeTab === "MY_LEAVES" && visibleMyLeaves.length === 0 && (
          <p className="text-sm text-gray-400 text-center">
            You haven’t applied for any leaves yet
          </p>
        )}


        <div className="space-y-4 max-h-[60vh] overflow-auto">
          {activeTab === "MY_LEAVES" &&
            visibleItems.map((l) => (
              <div
                key={l.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{l.leaveType}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(l.startDate).toDateString()}{" "}
                    {l.endDate &&
                      `→ ${new Date(l.endDate).toDateString()}`}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${l.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : l.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {l.status}
                </span>
              </div>
            ))}

          {activeTab !== "MY_LEAVES" &&
            visibleRequests.map((l) => (
              <div
                key={l.leaveId}
                className="border rounded-lg p-4 relative transition-opacity"
              >

                {processingId === l.leaveId && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg">
                    <div className="text-sm text-gray-600">Processing…</div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {l.employee.firstName} {l.employee.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {l.leaveType} •{" "}
                      {new Date(l.startDate).toDateString()}
                    </p>
                    {l.reason && (
                      <p className="text-xs text-gray-400 mt-1">
                        Reason: {l.reason}
                      </p>
                    )}
                  </div>
                  
                {l.decision && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${l.decision.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    {l.decision.status}
                  </span>
                )}

                </div>
                {activeTab === "PENDING" && (
                  <div className="flex justify-end gap-2">
                    <button
                      disabled={processingId}
                      onClick={() => handleAction(l.leaveId, "Approved")}
                      className="px-3 py-1 bg-primary text-white rounded text-xs"
                    >
                      Approve
                    </button>

                    <button
                      disabled={processingId}
                      onClick={() => setRejectingId(l.leaveId)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {/* Reject reason */}
                {rejectingId === l.leaveId && (
                  <div className="mt-3">
                    <textarea
                      placeholder="Reason for rejection (required)"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      rows={2}
                      value={reasonMap[l.leaveId] || ""}
                      onChange={(e) =>
                        setReasonMap((p) => ({
                          ...p,
                          [l.leaveId]: e.target.value,
                        }))
                      }
                    />

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-3 py-1 border rounded text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleAction(l.leaveId, "Rejected")
                        }
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                      >
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

          {requests.length === 0 && (
            <p className="text-sm text-gray-400 text-center">
              No pending leave requests 🎉
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
