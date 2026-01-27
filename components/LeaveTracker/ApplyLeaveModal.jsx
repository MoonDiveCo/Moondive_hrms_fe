// ApplyLeaveModal.jsx
"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNotifications } from "../../context/notificationcontext"; // Import notification context
import { toast } from "sonner";

function getDatesBetween(start, end) {
  const dates = [];
  let current = new Date(start);
  let last = new Date(end);

  current.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);

  while (current <= last) {
    const local = new Date(current);

    dates.push({
      date: local.toLocaleDateString("en-CA"), // YYYY-MM-DD (local safe)
      isHalfDay: false,
      session: "FULL",
      enabled: true,
      reason: null,
    });

    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export default function ApplyLeaveModal({
  context,
  leaveBalances,
  pendingLeaves,
  onClose,
  holidays,
  allLeaves,
  currentUser, // Add current user prop (contains user info)
  reportingManager, // Add reporting manager prop
}) {
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState(context.startDate || "");
  const [toDate, setToDate] = useState(context.startDate || "");
  const [days, setDays] = useState([]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Get notification context
  const { storeNotification } = useNotifications();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  // today.setHours(0, 0, 0, 0);
  // const todayStr = today.toLocaleDateString("en-CA");

  const todayStr = today.toISOString().split("T")[0];
  const isOptionalLeave = leaveType === "OL";

  const isPastOptionalHoliday = useMemo(() => {
    if (!isOptionalLeave || !fromDate) return false;
    return fromDate < todayStr;
  }, [isOptionalLeave, fromDate, todayStr]);
  const optionalHolidays = useMemo(() => {
    return holidays
      .filter((h) => {
        if (!h.isActive || h.type !== "OPTIONAL") return false;

        const holidayDate = h.date.split("T")[0];

        return holidayDate >= todayStr;
      })
      .map((h) => ({
        date: h.date.split("T")[0],
        name: h.name || "Optional Holiday",
      }));
  }, [holidays, todayStr]);

  const handleOptionalHolidaySelect = (date) => {
    if (!date) return;

    setFromDate(date);
    setToDate(date);
    setDays([
      {
        date,
        isHalfDay: false,
        session: "FULL",
        enabled: true,
        reason: null,
      },
    ]);
  };

  const holidayDateSet = useMemo(() => {
    return new Set(
      holidays
        .filter((h) => h.isActive && h.type === "PUBLIC")
        .map((h) => new Date(h.date).toISOString().split("T")[0])
    );
  }, [holidays]);

  const appliedDateSet = useMemo(() => {
    const set = new Set();

    allLeaves.forEach((leave) => {
      if (leave.leaveStatus === "Rejected") return;

      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      // start.setHours(0, 0, 0, 0);
      // end.setHours(0, 0, 0, 0);

      while (start <= end) {
        set.add(start.toLocaleDateString("en-CA"));
        start.setDate(start.getDate() + 1);
      }
    });

    return set;
  }, [allLeaves]);

  useEffect(() => {
    if (!fromDate || !toDate || isOptionalLeave) return;

    const generated = getDatesBetween(fromDate, toDate).map((d) => {
      const dateObj = new Date(d.date);
      dateObj.setHours(0, 0, 0, 0);

      const day = dateObj.getDay();

      if (dateObj < today) return { ...d, enabled: false, reason: "PAST" };

      if (day === 0 || day === 6)
        return { ...d, enabled: false, reason: "WEEKEND" };

      if (holidayDateSet.has(d.date))
        return { ...d, enabled: false, reason: "HOLIDAY" };

      if (appliedDateSet.has(d.date))
        return { ...d, enabled: false, reason: "APPLIED" };

      return d;
    });

    const res = generated.slice();

    for (let i = 0; i < res.length; i++) {
      const curDay = new Date(res[i].date).getDay();
      if (curDay !== 0 && curDay !== 6) continue;

      let start = i;
      let end = i;
      while (
        end + 1 < res.length &&
        [0, 6].includes(new Date(res[end + 1].date).getDay())
      ) {
        end++;
      }

      const prevIdx = start - 1;
      const nextIdx = end + 1;

      if (
        prevIdx >= 0 &&
        nextIdx < res.length &&
        res[prevIdx].enabled &&
        res[nextIdx].enabled
      ) {
        const prevDay = new Date(res[prevIdx].date).getDay();
        const nextDay = new Date(res[nextIdx].date).getDay();

        if (prevDay === 5 && nextDay === 1) {
          for (let k = start; k <= end; k++) {
            if (res[k].reason === "WEEKEND") {
              res[k] = { ...res[k], enabled: true, reason: "SANDWICH" };
            }
          }
        }
      }

      i = end;
    }

    setDays(res);
  }, [
    fromDate,
    toDate,
    holidayDateSet,
    appliedDateSet,
    isOptionalLeave,
    today,
  ]);

  const totalRequested = useMemo(() => {
    return days.reduce((sum, d) => {
      if (!d.enabled) return sum;
      return sum + (d.isHalfDay ? 0.5 : 1);
    }, 0);
  }, [days]);

  const balance = leaveBalances[leaveType];
  const pendingForType = pendingLeaves?.[leaveType] ?? 0;

  const isUnlimited = balance?.unlimited;
  const isWindowed = balance?.isWindowed;

  const monthlyAvailable =
    typeof balance?.availableThisMonth === "number"
      ? balance.availableThisMonth
      : 0;

  const carryForwarded = balance?.canCarryForward
    ? balance?.carryForwarded ?? 0
    : 0;

  const rawAvailable = isUnlimited
    ? Infinity
    : isWindowed
    ? monthlyAvailable
    : monthlyAvailable + carryForwarded;

  const effectiveAvailable =
    rawAvailable === Infinity
      ? Infinity
      : Math.max(0, rawAvailable - pendingForType);

  const name = balance?.name ?? "";

  const canSubmit =
    totalRequested > 0 &&
    !isPastOptionalHoliday &&
    (effectiveAvailable === Infinity || totalRequested <= effectiveAvailable);

  const availabilityMessage = useMemo(() => {
    if (isPastOptionalHoliday) {
      return "Past optional holiday cannot be applied.";
    }

    if (!leaveType || !balance) return null;

    if (effectiveAvailable === Infinity) return null;

    if (effectiveAvailable === 0) {
      if (pendingForType > 0) {
        return `You already have ${pendingForType} pending ${name} leave(s).`;
      }
      return `You don't have any ${name} leaves available.`;
    }

    if (totalRequested > effectiveAvailable) {
      return `You only have ${effectiveAvailable} ${name} leave(s) available.`;
    }

    return null;
  }, [
    leaveType,
    balance,
    effectiveAvailable,
    pendingForType,
    totalRequested,
    name,
  ]);

  const getSenderName = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) return "An employee";

      return (
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || "An employee"
      );
    } catch (error) {
      return "An employee";
    }
  };

  const sendLeaveNotification = async (reportingManagerId) => {
    try {
      if (!reportingManagerId) {
        return;
      }

      const senderName = getSenderName(); 
      const leaveTypeName = balance?.name || leaveType;
      const daysText = totalRequested === 1 ? "day" : "days";

      const payload = {
        receiverId: reportingManagerId,
        senderId: currentUser?._id || currentUser?.id,
        senderName,
        notificationTitle: "New Leave Request",
        notificationMessage: `${senderName} has applied for ${totalRequested} ${daysText} of ${leaveTypeName} leave from ${fromDate} to ${toDate}.`,
        relatedDomainType: "Leave Management",
        priority: totalRequested >= 5 ? "High" : "Medium",
      };

      await storeNotification(payload);
    } catch (error) {
      console.error("Failed to store notification:", error);
    }
  };

  async function handleSubmit() {
    if (!canSubmit || !leaveType) return;

    try {
      setSubmitting(true);

      const payload = {
        leaveType,
        reason,
        dates: days
          .filter((d) => d.enabled)
          .map((d) => ({
            date: d.date,
            isHalfDay: d.isHalfDay,
            session: d.isHalfDay ? d.session : null,
            reasonType: d.reason,
          })),
      };

      const response = await axios.post("/hrms/leave/add-leave", payload);
      if (response.data?.data?.length) {
       const reportingManagerId = response.data.data[0].reportingIds[0];
       console.log("---------------",reportingManagerId)
        await sendLeaveNotification(reportingManagerId);
      }
      toast.success("Leave Added Successfully")
      try {
        await context?.refreshDashboard?.();
      } catch (err) {
        console.error("Failed to refresh dashboard", err);
      }
    
      context?.refreshCalendar?.();
      onClose();
    } catch (err) {
      console.error("Failed to apply leave", err);
      toast.error("Failed To Submit Leave Application.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="bg-white w-[900px] rounded-xl p-6 flex gap-6">
        {/* LEFT */}
        <div className="flex-1 space-y-4">
          <h4 className="text-primaryText">Apply Leave</h4>

          <select
            className="w-full border px-3 py-2 rounded-md"
            onChange={(e) => setLeaveType(e.target.value)}
          >
            <option value="">Select Leave Type</option>
            {Object.entries(leaveBalances).map(([code, data]) => (
              <option key={code} value={code}>
                {data.name}
              </option>
            ))}
          </select>

          {/* DATE / OPTIONAL HOLIDAY */}
          {!isOptionalLeave ? (
            <div className="flex gap-3">
              <input
                type="date"
                min={todayStr}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border px-3 py-2 rounded-md w-full"
              />
              <input
                type="date"
                min={fromDate || todayStr}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border px-3 py-2 rounded-md w-full"
              />
            </div>
          ) : (
            <select
              className="w-full border px-3 py-2 rounded-md"
              onChange={(e) => handleOptionalHolidaySelect(e.target.value)}
            >
              <option value="">Select Optional Holiday</option>
              {optionalHolidays.map((h, index) => (
                <option key={index} value={h.date}>
                  {h.name} ({h.date})
                </option>
              ))}
            </select>
          )}

          {/* DAYS */}
          {days.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-auto border rounded-lg p-3 bg-gray-50">
              {days.map((d) => {
                const isDisabled =
                  d.reason === "SANDWICH" ? d.enabled : !d.enabled;
                const reasonLabel = {
                  PAST: "Past date",
                  WEEKEND: "Weekend",
                  HOLIDAY: "Holiday",
                  APPLIED: "Already applied",
                  SANDWICH: "Sandwich",
                }[d.reason];

                const reasonColor = {
                  PAST: "bg-gray-200 text-gray-600",
                  WEEKEND: "bg-blue-100 text-blue-600",
                  HOLIDAY: "bg-purple-100 text-purple-600",
                  APPLIED: "bg-red-100 text-red-600",
                  SANDWICH: "bg-yellow-100 text-yellow-700",
                }[d.reason];

                return (
                  <div
                    key={d.date}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                      d.enabled
                        ? "bg-white hover:bg-gray-100"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <span>{d.date}</span>
                    {isDisabled && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${reasonColor}`}
                      >
                        {reasonLabel}
                      </span>
                    )}

                    {d.enabled && d.reason !== "SANDWICH" && (
                      <select
                        value={d.session}
                        onChange={(e) =>
                          setDays((prev) =>
                            prev.map((x) =>
                              x.date === d.date
                                ? {
                                    ...x,
                                    isHalfDay: e.target.value !== "FULL",
                                    session: e.target.value,
                                  }
                                : x
                            )
                          )
                        }
                        className="border px-2 py-1 rounded text-xs"
                      >
                        <option value="FULL">Full Day</option>
                        <option value="First Half">1st Half</option>
                        <option value="Second Half">2nd Half</option>
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <textarea
            placeholder="Reason"
            className="w-full border rounded-md px-3 py-2"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
              className={`px-3 py-1 rounded-full text-xs ${
                canSubmit && !submitting
                  ? "bg-primary text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>

            <button
              onClick={onClose}
              className="border px-3 py-1 text-xs rounded-full"
            >
              Cancel
            </button>
          </div>

          {availabilityMessage && (
            <p className="text-xs text-red-500">{availabilityMessage}</p>
          )}
        </div>

        {/* RIGHT SUMMARY */}
        <div className="w-[260px] bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="text-sm text-gray-500 mb-2">Leave Summary</p>

          <p className="text-sm">
            Available
            <span className="float-right">
              {rawAvailable === Infinity ? 0 : rawAvailable}
            </span>
          </p>

          <p className="text-sm">
            Pending
            <span className="float-right">
              {rawAvailable === Infinity ? 0 : pendingForType}
            </span>
          </p>

          <p className="text-sm font-medium">
            Effective Available
            <span className="float-right">
              {effectiveAvailable === Infinity ? 0 : effectiveAvailable}
            </span>
          </p>

          <div className="border-t my-2" />

          <p className="text-sm">
            Requested
            <span className="float-right">{totalRequested}</span>
          </p>

          <p className="text-sm font-medium">
            Balance After
            <span className="float-right">
              {effectiveAvailable === Infinity
                ? 0
                : Math.max(effectiveAvailable - totalRequested, 0)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
