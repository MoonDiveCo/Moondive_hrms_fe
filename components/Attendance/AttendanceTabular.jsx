"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  format,
  isWeekend,
  isAfter,
  startOfDay,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInMinutes,
} from "date-fns";
import { useAttendanceCalendar } from "@/hooks/useAttendanceCalendar";
import { useHolidays } from "@/hooks/useHolidays";
import { useLeaves } from "@/hooks/useLeave";
import { useContext } from "react";
import { AuthContext } from "@/context/authContext";
import { useAttendance } from "@/context/attendanceContext";

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const styles = {
    Weekend: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Present: "bg-green-100 text-green-700 border-green-300",
    "On Leave": "bg-red-100 text-red-700 border-red-300",
    Absent: "bg-red-50 text-red-600 border-red-200",
    "First Half": "bg-orange-100 text-orange-700 border-orange-300",
    "Second Half": "bg-orange-100 text-orange-700 border-orange-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${styles[status] || "bg-gray-100 text-gray-600 border-gray-300"}`}
    >
      {status}
    </span>
  );
};
function calculatePayableMinutes(record) {
  if (!record?.checkIn) return 0;

  const start = new Date(record.checkIn);
  const end = record.checkOut ? new Date(record.checkOut) : new Date();

  let totalMinutes = differenceInMinutes(end, start);
  let breakMinutes = 0;

  if (Array.isArray(record.breaks)) {
    record.breaks.forEach((b) => {
      if (!b.start) return;

      const bs = new Date(b.start);
      const be = b.end ? new Date(b.end) : new Date();

      breakMinutes += differenceInMinutes(be, bs);
    });
  }

  return Math.max(totalMinutes - breakMinutes, 0);
}

export default function AttendanceTabular({ currentDate, rangeMode = "week" }) {
const today = startOfDay(new Date());
const { user } = useContext(AuthContext);
const { workedSeconds, isCheckedIn } = useAttendance();

const { data: attendanceMap = {}, isLoading } =
  useAttendanceCalendar({
    rangeMode,
    currentDate,
  });

const { data: holidayMap = {} } = useHolidays(
  currentDate.getFullYear()
);

const { data: leaveMap = {} } = useLeaves({
  rangeMode,
  currentDate,
  userId: user?._id,
});


const rangeStart =
  rangeMode === "month"
    ? startOfMonth(currentDate)
    : startOfWeek(currentDate, { weekStartsOn: 0 });

const rangeEnd =
  rangeMode === "month"
    ? endOfMonth(currentDate)
    : endOfWeek(currentDate, { weekStartsOn: 0 });

const rows = eachDayOfInterval({ start: rangeStart, end: rangeEnd }).map(
  (date) => {
    const key = startOfDay(date).toDateString();
const record = attendanceMap[key];
const isToday =
  startOfDay(date).getTime() === startOfDay(today).getTime();

 const future = isAfter(date, today);
const weekend = isWeekend(date);

let status = null;

// 🟨 WEEKEND — ALWAYS
if (weekend) {
  status = "Weekend";
}
// 🎉 HOLIDAY — PAST + FUTURE
else if (holidayMap[key]) {
  status = "Holiday";
}
// 🏖️ LEAVE — PAST + FUTURE
else if (leaveMap[key]) {
  status = leaveMap[key].isHalfDay
    ? leaveMap[key].session   // First Half / Second Half
    : "On Leave";
}
// ⏳ FUTURE NORMAL WORKING DAY
else if (future) {
  status = null;
}
// ✅ PRESENT
else if (attendanceMap[key]?.status) {
  status = attendanceMap[key].status;
}
// ❌ ABSENT
else {
  status = "Absent";
}

    

let totalHours = "-";
let payableHours = "-";

if (record?.checkIn || isToday) {
  // 🔹 TODAY → use context (LIVE, accurate)
  if (isToday && isCheckedIn) {
    const payableMinutes = Math.floor(workedSeconds / 60);

    const ph = Math.floor(payableMinutes / 60);
    const pm = payableMinutes % 60;

    payableHours = `${ph.toString().padStart(2, "0")}:${pm
      .toString()
      .padStart(2, "0")}`;

    // Optional: show total hours same as payable for today
    totalHours = payableHours;
  }

  // 🔹 PAST DAYS → calculate from attendanceMap
  else if (record?.checkIn) {
    const endTime = record.checkOut
      ? new Date(record.checkOut)
      : new Date();

    const totalMinutes = differenceInMinutes(
      endTime,
      new Date(record.checkIn)
    );

    const payableMinutes = calculatePayableMinutes(record);

    const th = Math.floor(totalMinutes / 60);
    const tm = totalMinutes % 60;

    const ph = Math.floor(payableMinutes / 60);
    const pm = payableMinutes % 60;

    totalHours = `${th.toString().padStart(2, "0")}:${tm
      .toString()
      .padStart(2, "0")}`;

    payableHours = `${ph.toString().padStart(2, "0")}:${pm
      .toString()
      .padStart(2, "0")}`;
  }
}

    

    return {
      date,
      status,
      future,
      checkIn: record?.checkIn,
      checkOut: record?.checkOut,
      totalHours,
      payableHours,
    };
  }
);






  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Date",
                "First In",
                "Last Out",
                "Total Hours",
                "Payable Hours",
                "Status",
                "Shift",
                "Regularization",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(row.date, "EEE, dd MMM yyyy")}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {row.future || !row.checkIn
                    ? "-"
                    : format(new Date(row.checkIn), "HH:mm")}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {row.future || !row.checkOut
                    ? "-"
                    : format(new Date(row.checkOut), "HH:mm")}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.totalHours || "-"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.payableHours || "-"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
{row.status && <StatusBadge status={row.status} />}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  General
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* Add regularization button/link here if needed */}
                  -
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}