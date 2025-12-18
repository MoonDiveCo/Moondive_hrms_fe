"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";

function getDatesBetween(start, end) {
  const dates = [];
  let current = new Date(start);

  while (current <= new Date(end)) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      dates.push({
        date: current.toISOString().split("T")[0],
        isHalfDay: false,
        session: "FULL",
        enabled: true,
      });
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function ApplyLeaveModal({
  context,
  leaveBalances,
  onClose,
}) {
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState(context.startDate || "");
  const [toDate, setToDate] = useState(context.startDate || "");
  const [days, setDays] = useState([]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        })),
    };

    await axios.post("/hrms/leave/add-leave", payload);

    onClose();
  } catch (err) {
    console.error("Failed to apply leave", err);
  } finally {
    setSubmitting(false);
  }
}


  useEffect(() => {
    if (fromDate && toDate) {
      setDays(getDatesBetween(fromDate, toDate));
    }
  }, [fromDate, toDate]);

  const totalRequested = useMemo(() => {
    return days.reduce((sum, d) => {
      if (!d.enabled) return sum;
      return sum + (d.isHalfDay ? 0.5 : 1);
    }, 0);
  }, [days]);
const balance = leaveBalances[leaveType];

    const available = balance?.available ?? 0;
    const name = balance?.name ?? "";

  const canSubmit = totalRequested > 0 && totalRequested <= available;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white w-[900px] rounded-xl p-6 flex gap-6">

        {/* LEFT */}
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-semibold">Apply Leave</h3>

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

          <div className="flex gap-3">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border px-3 py-2 rounded-md w-full"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border px-3 py-2 rounded-md w-full"
            />
          </div>

          {/* INDIVIDUAL DAYS */}
          <div className="space-y-2 max-h-40 overflow-auto border rounded-md p-2">
            {days.map((d, idx) => (
              <div key={d.date} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={d.enabled}
                  onChange={() =>
                    setDays((prev) =>
                      prev.map((x, i) =>
                        i === idx ? { ...x, enabled: !x.enabled } : x
                      )
                    )
                  }
                />
                <span className="text-sm">{d.date}</span>

                <select
                  disabled={!d.enabled}
                  onChange={(e) =>
                    setDays((prev) =>
                      prev.map((x, i) =>
                        i === idx
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
                  <option value="FIRST_HALF">1st Half</option>
                  <option value="SECOND_HALF">2nd Half</option>
                </select>
              </div>
            ))}
          </div>

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
                className={`px-4 py-2 rounded-md ${
                    canSubmit && !submitting
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                >
                {submitting ? "Submitting..." : "Submit"}
                </button>
            <button onClick={onClose} className="border px-4 py-2 rounded-md">
              Cancel
            </button>
          </div>
        </div>

        {/* RIGHT SUMMARY */}
        <div className="w-[260px] bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-3">Leave Summary</p>

          <p className="text-sm">
            Available
            <span className="float-right text-green-600">
              {available}
            </span>
          </p>

          <p className="text-sm">
            Requested
            <span className="float-right">
              {totalRequested}
            </span>
          </p>

          <p className="text-sm text-blue-600 font-medium">
            Balance After
            <span className="float-right">
              {Math.max(available - totalRequested, 0)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
