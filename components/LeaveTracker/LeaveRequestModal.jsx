"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNotifications } from "../../context/notificationcontext";
import { toast } from "sonner";

/* -------------------- LEAVE CARD COMPONENT (OUTSIDE PARENT) -------------------- */
const LeaveCard = ({ 
  l, 
  activeTab, 
  processingId, 
  rejectingId, 
  reasonMap, 
  setRejectingId, 
  setReasonMap, 
  handleAction 
}) => {
  const isMyLeave = activeTab === "MY_LEAVES";
  const leaveStatus = isMyLeave ? l.status : l.decision?.status;
  const textareaRef = useRef(null);
  
  const statusColor =
    leaveStatus === "Approved"
      ? "bg-green-100 text-green-700"
      : leaveStatus === "Rejected"
      ? "bg-red-100 text-red-700"
      : leaveStatus === "Pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-700";

  const itemId = l.leaveId || l.id;

  // Focus textarea when rejection input appears
  useEffect(() => {
    if (rejectingId === itemId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [rejectingId, itemId]);

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm relative space-y-2">
      {/* TOP ROW */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {/* Show employee name only if not My Leaves tab */}
          {!isMyLeave && l.employee && (
            <p className="font-medium text-gray-800">
              {l.employee.firstName} {l.employee.lastName}
            </p>
          )}

          {/* Leave Type + Half Day + Status */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              {l.leaveType}
            </span>

            {l.isHalfDay && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                Half Day ({l.session})
              </span>
            )}

            {leaveStatus && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${statusColor}`}>
                {leaveStatus}
              </span>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        {!isMyLeave && (activeTab === "PENDING" || activeTab === "APPROVED") && (
          <div className="flex gap-2">
            {activeTab === "PENDING" && (
              <button
                disabled={processingId}
                onClick={() => handleAction(itemId, "Approved", l)}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs disabled:opacity-50"
              >
                Approve
              </button>
            )}
            <button
              onClick={() => setRejectingId(itemId)}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* APPLICANT'S REASON (show in all tabs except when showing rejection reason) */}
      {l.reason && !(isMyLeave && leaveStatus === "Rejected") && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-md p-2">
          <span className="font-medium text-gray-700">Reason:</span> {l.reason}
        </div>
      )}

      {/* REJECTION REASON (only for My Leaves tab when status is Rejected) */}
      {isMyLeave && leaveStatus === "Rejected" && l.decision?.reason && (
        <div className="text-sm text-red-600 bg-red-50 rounded-md p-2">
          <span className="font-medium text-red-700">Rejection Reason:</span> {l.decision.reason}
        </div>
      )}

      {/* REJECTION INPUT */}
      {rejectingId === itemId && (
        <div className="mt-2 bg-red-50 p-3 rounded-md">
          <textarea
            ref={textareaRef}
            placeholder="Rejection reason"
            rows={3}
            value={reasonMap[itemId] || ""}
            className="w-full border rounded p-2 text-sm"
            onChange={(e) =>
              setReasonMap((prev) => ({
                ...prev,
                [itemId]: e.target.value,
              }))
            }
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setRejectingId(null);
                setReasonMap((prev) => {
                  const updated = { ...prev };
                  delete updated[itemId];
                  return updated;
                });
              }}
              className="text-xs text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={() => handleAction(itemId, "Rejected", l)}
              className="text-xs bg-red-600 text-white px-3 py-1 rounded"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------- SECTION HEADER COMPONENT -------------------- */
const SectionHeader = ({ title, open, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 text-sm font-semibold text-gray-700"
  >
    <span className="text-2xl flex items-center justify-center w-5 transition-transform">
      {open ? "▾" : "▸"}
    </span>
    {title}
  </button>
);

/* -------------------- MAIN MODAL COMPONENT -------------------- */
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

  /* -------------------- DATE HELPERS -------------------- */
  const startOfDay = (d) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const today = startOfDay(new Date());
  const normalizeDate = (date) => startOfDay(date).getTime();

  const matchDateFilter = (leave) => {
    if (!filterDate) return true;
    const selected = normalizeDate(filterDate);
    const start = normalizeDate(leave.startDate);
    const end = normalizeDate(leave.endDate || leave.startDate);
    return selected >= start && selected <= end;
  };

  const getBucket = (leave) => {
    const start = startOfDay(leave.startDate);
    if (start < today) return "PREVIOUS";
    if (start.getTime() === today.getTime()) return "TODAY";
    return "UPCOMING";
  };

  const groupByDate = (items) =>
    items.reduce((acc, l) => {
      const key = startOfDay(l.startDate).toDateString();
      acc[key] = acc[key] || [];
      acc[key].push(l);
      return acc;
    }, {});

  /* -------------------- ACTION HANDLER WITH NOTIFICATIONS -------------------- */
  async function handleAction(leaveId, action, leaveData) {
    if (action === "Rejected" && !reasonMap[leaveId]?.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    try {
      setProcessingId(leaveId);

      // Update leave decision
      const res=await axios.put("/hrms/leave/update-leave-decision", {
        leaveEntryId: leaveId,
        action,
        reason: reasonMap[leaveId] || "",
      });
     console.log("--xx-xxx-xxx",res)
      // Send notification to employee
      const employeeId = leaveData?.employee?._id || leaveData?.employeeId || leaveData?.employee?.id;
      
      if (employeeId) {
        const notificationTitle = action === "Approved" 
          ? "Leave Request Approved" 
          : "Leave Request Rejected";
        
        const notificationMessage = action === "Approved"
          ? `Your leave request for ${leaveData.leaveType} from ${new Date(leaveData.startDate).toLocaleDateString()} has been approved.`
          : `Your leave request for ${leaveData.leaveType} from ${new Date(leaveData.startDate).toLocaleDateString()} has been rejected. Reason: ${reasonMap[leaveId] || "No reason provided"}`;

        try {
          await storeNotification({
            receiverId: employeeId,
            notificationTitle,
            notificationMessage,
            relatedDomainType: "Leave Management",
            priority: action === "Rejected" ? "High" : "Medium",
            senderId: currentUser?._id || currentUser?.id,
          });
        } catch (notifError) {
          console.error("Failed to send notification:", notifError);
          // Don't throw - notification failure shouldn't fail the leave action
        }
      }

      toast.success(`Leave request ${action.toLowerCase()} successfully`);
      onResolved(leaveId);
    } catch (error) {
      console.error("Error updating leave:", error);
      toast.error("Failed to update leave");
    } finally {
      setProcessingId(null);
      setRejectingId(null);
      setReasonMap((prev) => {
        const updated = { ...prev };
        delete updated[leaveId];
        return updated;
      });
    }
  }

  /* -------------------- TAB FILTERING -------------------- */
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

  const visibleItems =
    activeTab === "MY_LEAVES"
      ? (myLeaves || []).filter(matchDateFilter)
      : visibleRequests;

  /* -------------------- BUCKETING -------------------- */
  const bucketed = visibleItems.reduce(
    (acc, l) => {
      acc[getBucket(l)].push(l);
      return acc;
    },
    { PREVIOUS: [], TODAY: [], UPCOMING: [] }
  );

  const previousByDate = groupByDate(bucketed.PREVIOUS);
  const upcomingByDate = groupByDate(bucketed.UPCOMING);

  /* -------------------- DROPDOWN STATE -------------------- */
  const [open, setOpen] = useState({
    PREVIOUS: false,
    TODAY: true,
    UPCOMING: true,
  });

  const toggle = (key) => setOpen((p) => ({ ...p, [key]: !p[key] }));

  /* -------------------- RENDER -------------------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-xl p-6 relative">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold">Leave Requests</h4>
          <button onClick={onClose}>✕</button>
        </div>

        {/* TABS + DATE FILTER */}
        <div className="flex justify-between items-center mb-4 gap-4">
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
                className={`px-4 py-1 rounded-full text-sm ${
                  activeTab === tab.key ? "bg-orange-500 text-white" : "bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm"
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

        {/* CONTENT */}
        <div className="space-y-6 max-h-[60vh] overflow-auto">
          {/* PREVIOUS */}
          <div>
            <SectionHeader
              title="Previous"
              open={open.PREVIOUS}
              onClick={() => toggle("PREVIOUS")}
            />
            {open.PREVIOUS &&
              Object.entries(previousByDate).map(([date, leaves]) => (
                <div key={date} className="ml-6 mt-3">
                  <p className="text-xs text-gray-500 mb-2">{date}</p>
                  <div className="space-y-2">
                    {leaves.map((l) => (
                      <LeaveCard
                        key={l.leaveId || l.id}
                        l={l}
                        activeTab={activeTab}
                        processingId={processingId}
                        rejectingId={rejectingId}
                        reasonMap={reasonMap}
                        setRejectingId={setRejectingId}
                        setReasonMap={setReasonMap}
                        handleAction={handleAction}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* TODAY */}
          <div>
            <SectionHeader title="Today" open={open.TODAY} onClick={() => toggle("TODAY")} />
            {open.TODAY && (
              <div className="ml-6 mt-3 space-y-2">
                {bucketed.TODAY.map((l) => (
                  <LeaveCard
                    key={l.leaveId || l.id}
                    l={l}
                    activeTab={activeTab}
                    processingId={processingId}
                    rejectingId={rejectingId}
                    reasonMap={reasonMap}
                    setRejectingId={setRejectingId}
                    setReasonMap={setReasonMap}
                    handleAction={handleAction}
                  />
                ))}
              </div>
            )}
          </div>

          {/* UPCOMING */}
          <div>
            <SectionHeader
              title="Upcoming"
              open={open.UPCOMING}
              onClick={() => toggle("UPCOMING")}
            />
            {open.UPCOMING &&
              Object.entries(upcomingByDate).map(([date, leaves]) => (
                <div key={date} className="ml-6 mt-3">
                  <p className="text-xs text-gray-500 mb-2">{date}</p>
                  <div className="space-y-2">
                    {leaves.map((l) => (
                      <LeaveCard
                        key={l.leaveId || l.id}
                        l={l}
                        activeTab={activeTab}
                        processingId={processingId}
                        rejectingId={rejectingId}
                        reasonMap={reasonMap}
                        setRejectingId={setRejectingId}
                        setReasonMap={setReasonMap}
                        handleAction={handleAction}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}