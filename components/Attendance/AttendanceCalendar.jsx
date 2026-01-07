"use client";

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

import { useAttendanceCalendar } from "@/hooks/useAttendanceCalendar";
import { useHolidays } from "@/hooks/useHolidays";
import { useLeaves } from "@/hooks/useLeave";
import { useContext } from "react";
import { AuthContext } from "@/context/authContext";

function CalendarCell({ day }) {
  const { date, status, name   } = day;

  const styles = {
    Present: "bg-gradient-to-br from-green-50 to-green-100 border-green-300 shadow-md ",
    Absent: "bg-gradient-to-br from-red-50 to-red-100 border-red-300 shadow-md",
    "On Leave": "bg-gradient-to-br from-rose-50 to-rose-100 shadow-md border-rose-300",
    Holiday: "bg-gradient-to-br from-blue-50 to-blue-100 shadow-md border-blue-300",
    Weekend: "bg-yellow-50 shadow-md border-yellow-200",
    future: "bg-white shadow-md border-white",
  };

  const text = {
    Present: "text-green-700",
    Absent: "text-red-600",
    "On Leave": "text-rose-600",
    Holiday: "text-blue-700",
    Weekend: "text-yellow-700",
  };

  return (
    <div className={`relative p-2 ${styles[status]} `}>
      <div className="text-xs text-primaryText font-semibold">
        {format(date, "d")}
      </div>

   {status !== "future" && (
  <span
    className={`absolute bottom-2 left-2 text-xs font-semibold ${text[status]}`}
  >
    {status}
  </span>
)}

{/* 🎉 Holiday Name */}
{status === "Holiday" && name && (
  <div className="absolute top-6 bottom-0 left-0 text-[10px] text-blue-700 font-semibold truncate">
    {name}
  </div>
)}

    </div>
  );
}

export default function AttendanceCalendar({ currentDate }) {
  const today = startOfDay(new Date());
  const { user } = useContext(AuthContext);

  /** DATA SOURCES */
  const { data: attendanceMap = {} } = useAttendanceCalendar({
    rangeMode: "month",
    currentDate,
  });

  const { data: holidayMap = {} } = useHolidays(
    currentDate.getFullYear()
  );
console.log("holiday map",holidayMap)
  const { data: leaveMap = {} } = useLeaves({
    rangeMode: "month",
    currentDate,
    userId: user?._id,
  });

  const start = startOfWeek(startOfMonth(currentDate));
  const end = endOfWeek(endOfMonth(currentDate));

 const days = eachDayOfInterval({ start, end }).map((date) => {
  const key = startOfDay(date).toDateString();

  const future = isAfter(date, today);
  const weekend = isWeekend(date);

  let status = "future";
  let name = null; // ✅ ADD

  if (weekend) {
    status = "Weekend";
  }
  else if (holidayMap[key]) {
    status = "Holiday";
    name = holidayMap[key].name; // ✅ ADD
  }
  else if (leaveMap[key]) {
    status = "On Leave";
  }
  else if (future) {
    status = "future";
  }
  else if (attendanceMap[key]?.status) {
    status = attendanceMap[key].status;
  }
  else {
    status = "Absent";
  }

  return { date, status, name }; // ✅ PASS name
});


  return (
    <div className="rounded-xl bg-white overflow-hidden ">
      {/* WEEK HEADER */}
      <div className="grid grid-cols-7 bg-gray-50  border-2  border-gray-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="px-3 py-2 text-sm font-semibold text-primaryText "
          >
            {d}
          </div>
        ))}
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 auto-rows-[90px]  border-1  border-gray-100 font-semibold text-primaryText">
        {days.map((day, i) => (
          <CalendarCell key={i} day={day} />
        ))}
      </div>
    </div>
  );
}
