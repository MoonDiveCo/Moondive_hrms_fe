"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isAfter,
  isWeekend,
  startOfDay,
} from "date-fns";
function CalendarCell({ day }) {
  const { date, status } = day;

  const styles = {
    Present:
      "bg-gradient-to-br from-green-50 to-green-100 border-green-300",
    Absent:
      "bg-gradient-to-br from-red-50 to-red-100 border-red-300",
    "On Leave":
      "bg-gradient-to-br from-rose-50 to-rose-100 border-rose-300",
    Weekend: "bg-yellow-50 border-yellow-200",
    future: "bg-white",
  };

  const text = {
    Present: "text-green-700",
    Absent: "text-red-600",
    "On Leave": "text-rose-600",
    Weekend: "text-yellow-700",
  };

  return (
    <div
      className={`relative  p-2 ${styles[status]}`}
    >
      {/* DATE */}
      <div className="text-xs text-primaryText">
        {format(date, "d")}
      </div>

      {/* STATUS (minimal) */}
      {status !== "future" && (
        <span
          className={`absolute bottom-2 left-2 text-xs font-medium ${text[status]}`}
        >
          {status}
        </span>
      )}
    </div>
  );
}

export default function AttendanceCalendar({ currentDate }) {
  const [days, setDays] = useState([]);
  const today = startOfDay(new Date());

  useEffect(() => {
    loadCalendar();
  }, [currentDate]);

  const loadCalendar = async () => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));

    const res = await axios.get("hrms/attendance", {
      params: {
        type: "month",
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
      },
    });

    const attendanceMap = {};
    (res.data.data || []).forEach((a) => {
      attendanceMap[startOfDay(new Date(a.date)).getTime()] = a;
    });

    const calendarDays = eachDayOfInterval({ start, end }).map((date) => {
      const key = startOfDay(date).getTime();
      const record = attendanceMap[key];
      const future = isAfter(date, today);

      let status = "future";

      if (!future) {
        if (record?.status) status = record.status;
        else if (isWeekend(date)) status = "Weekend";
        else status = "Absent";
      }

      return { date, status };
    });

    setDays(calendarDays);
  };

  return (
    <div className="rounded-xl  bg-white overflow-hidden">
      {/* WEEK HEADER */}
      <div className="grid grid-cols-7  bg-gray-50">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="px-3 py-2 text-sm font-medium text-primaryText"
          >
            {d}
          </div>
        ))}
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 auto-rows-[90px]">
        {days.map((day, i) => (
          <CalendarCell key={i} day={day} />
        ))}
      </div>
    </div>
  );
}
