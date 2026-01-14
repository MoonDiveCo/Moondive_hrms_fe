"use client";

import { useState } from "react";
import axios from "axios";
import { useNotifications } from "../../context/notificationcontext"; // Import notification context

export default function LeaveRequestsModal({
  requests,
  onClose,
  onResolved,
  myLeaves,
  currentUser, // Add current user (manager)
}) {
  const [processingId, setProcessingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [reasonMap, setReasonMap] = useState({});
  const [activeTab, setActiveTab] = useState("PENDING");

  // Get notification context
  const { storeNotification } = useNotifications();
  
  // Send notification to employee
  const sendLeaveDecisionNotification = async (leave, action, reason = "") => {
    try {
      const employeeName = `${leave.employee.firstName} ${leave.employee.lastName}`;
      const leaveTypeName = leave.leaveType;
      const startDate = new Date(leave.startDate).toLocaleDateString();
      const endDate = leave.endDate 
        ? new Date(leave.endDate).toLocaleDateString()
        : startDate;

      let notificationTitle = "";
      let notificationMessage = "";
      let priority = "Medium";

      if (action === "Approved") {
        notificationTitle = "Leave Request Approved ";
        notificationMessage = ` Your ${leaveTypeName} leave request from ${startDate} to ${endDate} has been approved by your manager.`;
        priority = "Medium";
      } else if (action === "Rejected") {
        notificationTitle = "Leave Request Rejected ";
        notificationMessage = `Your ${leaveTypeName} leave request from ${startDate} to ${endDate} has been rejected.${reason ? ` Reason: ${reason}` : ""}`;
        priority = "High";
      }

      await storeNotification({
        receiverId: leave.employee._id || leave.employee.id,
        notificationTitle,
        notificationMessage,
        relatedDomainType: "Leave Management",
        priority,
        senderId: currentUser?._id || currentUser?.id,
        reportingManagerId: currentUser?._id || currentUser?.id,
      });
    } catch (error) {
      console.error("Failed to send leave decision notification:", error);
      // Don't block the leave approval/rejection if notification fails
    }
  };

  async function handleAction(leaveId, action) {
    if (action === "Rejected" && !reasonMap[leaveId]?.trim()) {
      alert("Rejection reason is required");
      return;
    }

    try {
      setProcessingId(leaveId);

      // Find the leave request before updating
      const leaveRequest = requests.find((l) => l.leaveId === leaveId);

      // Update leave decision on backend
      await axios.put("/hrms/leave/update-leave-decision", {
        leaveEntryId: leaveId,
        action,
        reason: reasonMap[leaveId] || "",
      });

      // 🔔 Send notification to employee
      if (leaveRequest) {
        await sendLeaveDecisionNotification(
          leaveRequest,
          action,
          reasonMap[leaveId] || ""
        );
      }

      // Show success message
      const actionText = action === "Approved" ? "approved" : "rejected";
      alert(`Leave request ${actionText} successfully!`);

      onResolved(leaveId);
    } catch (err) {
      console.error("Error updating leave:", err);
      alert("Failed to update leave request. Please try again.");
    } finally {
      setProcessingId(null);
      setRejectingId(null);
    }
  }

  const pendingRequests = requests.filter((l) => l.decision == null);
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {[
            { key: "PENDING", label: `Pending (${pendingRequests.length})` },
            {
              key: "APPROVED",
              label: `Approved (${approvedRequests.length})`,
            },
            {
              key: "REJECTED",
              label: `Rejected (${rejectedRequests.length})`,
            },
            {
              key: "MY_LEAVES",
              label: `My Leaves (${myLeaves?.length || 0})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab !== "MY_LEAVES" && visibleRequests.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            No {activeTab.toLowerCase()} leave requests
          </p>
        )}

        {activeTab === "MY_LEAVES" && visibleMyLeaves.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            You haven't applied for any leaves yet
          </p>
        )}

        <div className="space-y-4 max-h-[60vh] overflow-auto hide-scrollbar">
          {activeTab === "MY_LEAVES" &&
            visibleItems.map((l) => (
              <div
                key={l.id}
                className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium">{l.leaveType}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(l.startDate).toDateString()}{" "}
                    {l.endDate && `→ ${new Date(l.endDate).toDateString()}`}
                  </p>
                  {l.reason && (
                    <p className="text-xs text-gray-400 mt-1">
                      Reason: {l.reason}
                    </p>
                  )}
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    l.status === "Approved"
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
            visibleRequests.map((l) => {
              return <div
                key={l.leaveId}
                className="border rounded-lg p-4 relative transition-all hover:shadow-md"
              >
                {processingId === l.leaveId && (
                
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      <span className="text-sm text-gray-600">Processing…</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="font-medium text-base">
                      {l.employee.firstName} {l.employee.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-medium">{l.leaveType}</span> •{" "}
                      {new Date(l.startDate).toLocaleDateString()}
                      {l.endDate && ` → ${new Date(l.endDate).toLocaleDateString()}`}
                    </p>
                    {l.reason && (
                      <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Reason:</span> {l.reason}
                      </p>
                    )}
                    {l.decision?.reason && (
                      <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">
                        <span className="font-medium">Rejection Reason:</span>{" "}
                        {l.decision.reason}
                      </p>
                    )}
                  </div>

                  {l.decision && (
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ml-3 ${
                        l.decision.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {l.decision.status}
                    </span>
                  )}
                </div>

                {activeTab === "PENDING" && (
                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                    <button
                      disabled={processingId}
                      onClick={() => handleAction(l.leaveId, "Approved")}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Approve
                    </button>

                    <button
                      disabled={processingId}
                      onClick={() => setRejectingId(l.leaveId)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {/* Reject reason */}
                {rejectingId === l.leaveId && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Reason for rejection (required)
                    </label>
                    <textarea
                      placeholder="Please provide a reason for rejecting this leave request..."
                      className="w-full border border-red-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={3}
                      value={reasonMap[l.leaveId] || ""}
                      onChange={(e) =>
                        setReasonMap((p) => ({
                          ...p,
                          [l.leaveId]: e.target.value,
                        }))
                      }
                    />

                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-xs font-medium hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAction(l.leaveId, "Rejected")}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            })}
        </div>
      </div>
    </div>
  );
}