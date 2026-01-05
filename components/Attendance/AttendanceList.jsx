"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/authContext";
import AttendanceCard from "@/components/Attendance/AttendanceCard";
import CheckInButton from "@/components/Attendance/CheckInButton";
import TimelineRow from "@/components/Attendance/TimelineRow";
import TodayRow from "@/components/Attendance/TodayRow";
import { useHolidays } from "@/hooks/useHolidays";
import { useLeaves } from "@/hooks/useLeave";
import { useAttendanceCalendar } from "@/hooks/useAttendanceCalendar";
import { resolveDayStatus } from "@/helper/resolveDayStatus";
import { calculateWorkedHours } from "@/helper/time"; // or inline
function getWeekDates(baseDate = new Date()) {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay()); // Sunday start

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function getMonthDates(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const days = [];
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

export default function AttendanceList({ currentDate, rangeMode = "week" }) {
  const { user } = useContext(AuthContext);

  const { data: attendanceMap = {} } = useAttendanceCalendar({
    rangeMode,
    currentDate,
  });

  const { data: holidayMap = {} } = useHolidays(currentDate.getFullYear());
  const { data: leaveMap = {} } = useLeaves({ rangeMode, currentDate, userId: user?._id });

  const dates = rangeMode === "week" ? getWeekDates(currentDate) : getMonthDates(currentDate);

  const todayStr = new Date().toDateString();

  return (
    <div className="flex flex-col text-gray-800">
      <div className="px-12 py-3">
        {/* <AttendanceCard className="flex justify-between items-center">
         
          <CheckInButton />
        </AttendanceCard> */}
      </div>

      <div className="px-10 py-6 space-y-5">
        {dates.map((dateObj) => {
          const key = dateObj.toDateString();
          const attendance = attendanceMap[key];
          const holiday = holidayMap[key];
          const leave = leaveMap[key];
console.log("attendance",attendance?.checkOut)

          const holidayName =
            holiday &&
            (holiday.type === "PUBLIC"
              ? holiday.name
              : holiday.type === "OPTIONAL" && holiday.isActive
              ? `Optional Leave (${holiday.name})`
              : null);

          const { status, label } = resolveDayStatus({
            dateObj,
            attendance,
            holiday,
            leave,
          });

          const day = dateObj.toLocaleDateString("en-US", { weekday: "short" });
          const dateNum = dateObj.getDate();
          // Special Today Row
          if (status === "present" && key === todayStr) {
            return (
              <TodayRow
                key={key}
                date={dateNum}
                checkIn={attendance?.checkIn
                  ? new Date(attendance.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : null}
                checkOut={attendance?.checkOut
                  ? new Date(attendance.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : null}
                late={attendance?.anomalies?.includes("LATE_ENTRY") ? "Late" : null}
                early={attendance?.anomalies?.includes("EARLY_EXIT") ? "Early" : null}
              />
            );
          }

          // Calculate hours (fallback if backend doesn't send workedHours)
          let hours = "00:00";
        // Inside the map loop, for TodayRow:
if (status === "present" && key === todayStr) {
  return (
    <TodayRow
      key={key}
      date={dateNum}
      checkIn={attendance?.checkIn || null}       // ← RAW ISO string
      checkOut={attendance?.checkOut || null}     // ← RAW ISO string
      late={attendance?.anomalies?.includes("LATE_ENTRY") ? "Late" : null}
      early={attendance?.anomalies?.includes("EARLY_EXIT") ? "Early" : null}
    />
  );
}
const hasCheckIn = Boolean(attendance?.checkIn);
const isLeaveStatus =
  status === "leave" ||
  status === "leave-first-half" ||
  status === "leave-second-half";

// 1) If no check-in and leave → force pure leave row (no timeline)
const effectiveStatus =
  !hasCheckIn && isLeaveStatus ? "leave" : status;

// For regular TimelineRow (already correct in previous version)
return (
  <TimelineRow
    key={key}
    day={day}
    date={dateNum}
    status={status}
    hours={hours}
    checkIn={attendance?.checkIn || null}       // ← Keep RAW for WorkingTimeline
    checkOut={attendance?.checkOut || null}
    holidayName={holidayName}
    leaveLabel={label}
  />
);
        })}
      </div>
      
    </div>
  );
}