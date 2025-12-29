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
} from "date-fns";
const StatusBadge = ({ status }) => {
  if (!status) return null;

  const base =
    "inline-flex gap-2 rounded-full px-3 py-1 text-xs font-medium border";

  const styles = {
    Weekend: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Present: "bg-green-100 text-green-700 border-green-300",
    "On Leave": "bg-red-100 text-red-700 border-red-300",
    Absent: "bg-red-50 text-red-600 border-red-200",
    "First Half": "bg-orange-100 text-orange-700 border-orange-300",
    "Second Half": "bg-orange-100 text-orange-700 border-orange-300",
  };

  return (
    <span className={`${base} ${styles[status] || ""}`}>
      {status}
    </span>
  );
};

export default function AttendanceTabular({ currentDate, rangeMode }) {
  const [rows, setRows] = useState([]);
  const today = startOfDay(new Date());

  useEffect(() => {
    fetchAttendance();
  }, [currentDate, rangeMode]);

  const fetchAttendance = async () => {
    let params = {};
    let rangeStart, rangeEnd;

    if (rangeMode === "month") {
      params = {
        type: "month",
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
      };
      rangeStart = startOfMonth(currentDate);
      rangeEnd = endOfMonth(currentDate);
    } else {
      params = {
        type: "week",
        day: currentDate.toISOString(),
      };
      rangeStart = startOfWeek(currentDate);
      rangeEnd = endOfWeek(currentDate);
    }

    const res = await axios.get("hrms/attendance", { params });
    const apiData = res.data.data || [];

    // Map attendance by date
    const map = {};
    apiData.forEach((a) => {
      map[startOfDay(new Date(a.date)).getTime()] = a;
    });

    // Generate full date range
    const fullDays = eachDayOfInterval({
      start: rangeStart,
      end: rangeEnd,
    });

   const finalRows = fullDays.map((date) => {
  const key = startOfDay(date).getTime();
  const record = map[key];
  const future = isAfter(date, today);

  if (future) {
    return { date, future: true };
  }

  if (!record && isWeekend(date)) {
    return { date, status: "Weekend" };
  }

  if (!record) {
    return { date, status: "Absent" };
  }

  return { date, ...record };
});


    setRows(finalRows);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="overflow-x-auto   bg-white">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-primaryText">
            <tr>
              {[
                "Date",
                "First In",
                "Last Out",
                "Total Hours",
                "Payable Hours",
                "Status",
                "Shift(s)",
                "Regularization",
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-primaryText text-sm font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b-gray-50">
                <td className="px-6 py-4 text-sm text-primaryText">
                  {format(row.date, "EEE, dd-MMM-yyyy")}
                </td>

                <td className="px-6 py-4 text-sm text-primaryText">
                  {row.future || !row.checkIn
                    ? "-"
                    : format(new Date(row.checkIn), "HH:mm")}
                </td>

                <td className="px-8 py-4 text-sm text-primaryText">
                  {row.future || !row.checkOut
                    ? "-"
                    : format(new Date(row.checkOut), "HH:mm")}
                </td>

                <td className="px-4 py-4 text-sm text-primaryText">-</td>
                <td className="px-4 py-4 text-sm text-primaryText">-</td>

             <td className="px-5 py-4 text-sm ">
  {!row.future && <StatusBadge status={row.status} />}
</td>


                <td className="px-4 py-4 text-sm text-primaryText">General</td>
                <td className="px-4 py-4 text-sm text-primaryText"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
