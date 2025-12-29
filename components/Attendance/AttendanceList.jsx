"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import AttendanceCard from "@/components/Attendance/AttendanceCard";
import CheckInButton from "@/components/Attendance/CheckInButton";
import TimelineRow from "@/components/Attendance/TimelineRow";
import TodayRow from "@/components/Attendance/TodayRow";

function getWeekDates(baseDate = new Date()) {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);


  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }).map((_, i) => {
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

export default function AttendanceList({ currentDate, rangeMode }) {
  const today = new Date();
  const [attendanceMap, setAttendanceMap] = useState({});

  const dates =
    rangeMode === "week"
      ? getWeekDates(currentDate)
      : getMonthDates(currentDate);

  /* ---------------- FETCH ATTENDANCE ---------------- */

  useEffect(() => {
    const fetchAttendance = async () => {
      const res = await axios.get("/hrms/attendance", {
        params: {
          type: rangeMode,
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
           day: currentDate.toISOString(),
        },
      });

      const map = {};
      res.data.data.forEach((a) => {
        const key = new Date(a.date).toDateString();
        map[key] = a;
      });

      setAttendanceMap(map);
    };

    fetchAttendance();
  }, [currentDate, rangeMode]);

  return (
    <div className="flex flex-col text-gray-800">
      {/* HEADER */}
      <div className="px-12 py-3">
        <AttendanceCard className="flex justify-between items-center">
          <h5 className="font-semibold text-primary">
            General [ 9:00 AM - 6:00 PM ]
          </h5>
          <CheckInButton />
        </AttendanceCard>
      </div>

      {/* CONTENT */}
      <div className="px-10 py-6 space-y-5">
{dates.map((dateObj) => {
  const key = dateObj.toDateString();
  const record = attendanceMap[key];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = dateObj.toDateString() === new Date().toDateString();
  const isPast = dateObj < today;
  const isFuture = dateObj > today;
  const isSunday = dateObj.getDay() === 0;

  const day = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  const date = dateObj.getDate();

  /* ---------------- TODAY ---------------- */
  if (isToday && record) {
    return (
      <TodayRow
        key={key}
        date={date}
        checkIn={record.checkIn && new Date(record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        checkOut={record.checkOut && new Date(record.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        late={record.anomalies?.includes("LATE_ENTRY") ? "00:16" : null}
        early={record.anomalies?.includes("EARLY_EXIT") ? "01:32" : null}
      />
    );
  }

  /* ---------------- FUTURE ---------------- */
  if (isFuture) {
    return (
      <TimelineRow
        key={key}
        day={day}
        date={date}
        status="future"
        hours="--:--"
      />
    );
  }

  /* ---------------- WEEKEND (SUNDAY) ---------------- */
  if (isSunday) {
    return (
      <TimelineRow
        key={key}
        day={day}
        date={date}
        status="weekend"
        hours="08:45"
      />
    );
  }

  /* ---------------- ABSENT ---------------- */
  if (!record && isPast) {
    return (
      <TimelineRow
        key={key}
        day={day}
        date={date}
        status="absent"
        hours="00:00"
      />
    );
  }

  /* ---------------- PAST PRESENT ---------------- */
const workedMinutes =
  record?.checkIn && record?.checkOut
    ? Math.floor(
        (new Date(record.checkOut) - new Date(record.checkIn)) / 60000
      )
    : 0;



  const hours = `${String(Math.floor(workedMinutes / 60)).padStart(2, "0")}:${String(
    workedMinutes % 60
  ).padStart(2, "0")}`;

  return (
    <TimelineRow
      key={key}
      day={day}
      date={date}
      status="present"
      hours={hours}
      checkIn={record?.checkIn || null}
      checkOut={record?.checkOut || null}
    />
  );
})}



      </div>
    </div>
  );
}
