
"use client";

import { useState } from "react";
import axios from "axios";
import { useNotifications } from "../../context/notificationcontext";
import { toast } from "sonner";

export default function LeaveRequestsModal({
  requests,
  onClose,
  onResolved,
  myLeaves,
  currentUser,
}) {
  const [processingId, setProcessingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [reasonMap, setReasonMap] = useState({});
  const [activeTab, setActiveTab] = useState("PENDING");
  const [filterDate, setFilterDate] = useState("");

  const { storeNotification } = useNotifications();

  const normalizeDate = (date) =>
    new Date(date).setHours(0, 0, 0, 0);

  const matchDateFilter = (leave) => {
    if (!filterDate) return true;

    const selected = normalizeDate(filterDate);
    const start = normalizeDate(leave.startDate);
    const end = normalizeDate(leave.endDate || leave.startDate);

    return selected >= start && selected <= end;
  };

  async function handleAction(leaveId, action) {
    if (action === "Rejected" && !reasonMap[leaveId]?.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    try {
      setProcessingId(leaveId);

      const leaveRequest = requests.find((l) => l.leaveId === leaveId);

      await axios.put("/hrms/leave/update-leave-decision", {
        leaveEntryId: leaveId,
        action,
        reason: reasonMap[leaveId] || "",
      });

      toast.success(`Leave request ${action.toLowerCase()} successfully`);
      onResolved(leaveId);
    } catch (err) {
      toast.error("Failed to update leave");
    } finally {
      setProcessingId(null);
      setRejectingId(null);
    }
  }

  const pendingRequests = requests
    .filter((l) => l.decision == null)
    .filter(matchDateFilter);

  const approvedRequests = requests
    .filter((l) => l.decision?.status === "Approved")
    .filter(matchDateFilter);

  const rejectedRequests = requests
    .filter((l) => l.decision?.status === "Rejected")
    .filter(matchDateFilter);

  const visibleRequests =
    activeTab === "PENDING"
      ? pendingRequests
      : activeTab === "APPROVED"
      ? approvedRequests
      : rejectedRequests;

  const visibleMyLeaves = (myLeaves || []).filter(matchDateFilter);
  const visibleItems =
    activeTab === "MY_LEAVES" ? visibleMyLeaves : visibleRequests;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-xl p-6 relative">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-primaryText text-lg font-semibold">
            Leave Requests
          </h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>
        </div>

        {/* TABS + DATE FILTER */}
       {/* Tabs + Date Filter (TOP BAR) */}
<div className="flex items-center justify-between mb-4 gap-4">

  {/* Tabs - LEFT */}
  <div className="flex gap-2 flex-wrap">
    {[
      { key: "PENDING", label: `Pending (${pendingRequests.length})` },
      { key: "APPROVED", label: `Approved (${approvedRequests.length})` },
      { key: "REJECTED", label: `Rejected (${rejectedRequests.length})` },
      { key: "MY_LEAVES", label: `My Leaves (${myLeaves?.length || 0})` },
    ].map((tab) => (
      <button
        key={tab.key}
        onClick={() => setActiveTab(tab.key)}
        className={`px-4 py-1 rounded-full text-sm font-medium transition ${
          activeTab === tab.key
            ? "bg-orange-500 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>

  {/* Date Filter - RIGHT */}
  {/* Date Filter - RIGHT (Label on TOP) */}
<div className="flex flex-col items-start  gap-2 min-w-[160px]">
  <div className="flex items-center gap-2">
    <input
      type="date"
      value={filterDate}
      onChange={(e) => setFilterDate(e.target.value)}
      className="border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
    />

    {filterDate && (
      <button
        onClick={() => setFilterDate("")}
        className="text-xs text-gray-500 hover:underline"
      >
        Clear
      </button>
    )}
  </div>
</div>

</div>


        {/* CONTENT */}
        <div className="space-y-4 max-h-[60vh] overflow-auto hide-scrollbar">
          {visibleItems.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-10">
              No leave requests found
            </p>
          )}

          {activeTab !== "MY_LEAVES" &&
            visibleRequests.map((l) => (
              <div
                key={l.leaveId}
                className="border rounded-lg p-4 hover:shadow-md relative bg-gray-100 "
              >
                <p className="font-medium">
                  {l.employee.firstName} {l.employee.lastName}
                </p>
                <p className="text-md text-gray-500">
                  {l.leaveType} •{" "}
                  {new Date(l.startDate).toLocaleDateString()}
                  {l.endDate &&
                    ` → ${new Date(l.endDate).toLocaleDateString()}`}
                </p>

                     {(activeTab === "PENDING" || activeTab === "APPROVED") && (
                     <div className="absolute top-4 right-3 flex gap-2">
                      {activeTab === "PENDING" && (
                       <button
                      disabled={processingId}
                      onClick={() => handleAction(l.leaveId, "Approved")}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                      Approve
                     </button>
                    )}
                    <button
                      onClick={() => setRejectingId(l.leaveId)}
                      className="px-4 py-2 bg-red-500 text-white rounded text-xs"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {rejectingId === l.leaveId && (
                  <div className="mt-3 bg-red-50 p-3 rounded">
                    <textarea
                      placeholder="Rejection reason"
                      rows={3}
                      className="w-full border rounded p-2 text-sm"
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
                        className="text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleAction(l.leaveId, "Rejected")
                        }
                        className="text-xs bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

          {activeTab === "MY_LEAVES" &&
            visibleMyLeaves.map((l) => (
              <div key={l.id} className="border rounded p-4 bg-gray-100">
                <p className="font-medium">{l.leaveType}</p>
                <p className="text-xs text-gray-500">
                  {new Date(l.startDate).toDateString()}
                  {l.endDate && ` → ${new Date(l.endDate).toDateString()}`}
                </p>
                <span className="text-xs text-gray-600">{l.status}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}



