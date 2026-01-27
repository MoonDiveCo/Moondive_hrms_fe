'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/authContext';
import TimelineRow from '@/components/Attendance/TimelineRow';
import TodayRow from '@/components/Attendance/TodayRow';
import { useHolidays } from '@/hooks/useHolidays';
import { useLeaves } from '@/hooks/useLeave';
import { useAttendanceCalendar } from '@/hooks/useAttendanceCalendar';
import { resolveDayStatus } from '@/helper/resolveDayStatus';
import { useAttendance } from '@/context/attendanceContext';

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

// ✅ COMPLETE breakSeconds function
function getBreakSeconds(attendance, isToday, liveBreakSeconds = 0) {
  if (isToday) {
    // LIVE break time from context
    return liveBreakSeconds;
  }

  // Historical: calculate from breaks array
  if (attendance?.breaks && attendance.breaks.length > 0) {
    let total = 0;
    attendance.breaks.forEach((b) => {
      if (!b.start || !b.end) return;
      const end = new Date(b.end);
      const start = new Date(b.start);
      total += (end - start) / 1000;
    });
    return Math.floor(total);
  }

  return 0;
}

export default function AttendanceList({ currentDate, rangeMode = 'week' }) {
  const { user } = useContext(AuthContext);
  const { workedSeconds, breakSeconds: liveBreakSeconds } = useAttendance(); // live timers

  const { data: attendanceMap = {} } = useAttendanceCalendar({
    rangeMode,
    currentDate,
  });

  const { data: holidayMap = {} } = useHolidays(currentDate.getFullYear());
  const { data: leaveMap = {} } = useLeaves({
    rangeMode,
    currentDate,
    userId: user?._id,
  });

  const dates =
    rangeMode === 'week'
      ? getWeekDates(currentDate)
      : getMonthDates(currentDate);

  const todayStr = new Date().toDateString();

  return (
    <div className='flex flex-col text-gray-800'>
      <div className='py-4 space-y-4 '>
        {dates.map((dateObj) => {
          const key = dateObj.toDateString();
          const attendance = attendanceMap[key];
          const holiday = holidayMap[key];
          const leave = leaveMap[key];

          console.log(holiday)

          const holidayName =
            holiday &&
            (holiday.type === 'PUBLIC'
              ? holiday.name
              : holiday.type === 'OPTIONAL' && holiday.isActive
              ? `Optional Leave (${holiday.name})`
              : null);

              console.log(holidayName)

          const { status, label } = resolveDayStatus({
            dateObj,
            attendance,
            holiday,
            leave,
          });


          const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dateNum = dateObj.getDate();
          const isToday = key === todayStr;

          // ----- session-based times -----
          const firstCheckIn =
            attendance?.firstCheckIn || attendance?.checkIn || null;
          const lastCheckOut =
            attendance?.lastCheckOut || attendance?.checkOut || null;

          const checkInTime = firstCheckIn || null;
          const checkOutTime = lastCheckOut || null;
 
          // ----- worked hours -----
          let hours = '00:00';
          if (isToday) {
            const total = workedSeconds;
            const h = String(Math.floor(total / 3600)).padStart(2, '0');
            const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
            hours = `${h}:${m}`;
          } else if (attendance?.workedSeconds != null) {
            const total = attendance.workedSeconds;
            const h = String(Math.floor(total / 3600)).padStart(2, '0');
            const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
            hours = `${h}:${m}`;
          }

          // ----- ✅ breakSeconds (live + historical) -----
          const breakSeconds = getBreakSeconds(
            attendance,
            isToday,
            liveBreakSeconds
          );

          // ----- Today row -----
          if ( isToday) {
            return (
              <TodayRow
                key={key}
                date={dateNum}
                checkIn={checkInTime}
                checkOut={checkOutTime}
                status={status}
                late={
                  attendance?.anomalies?.includes('LATE_ENTRY') ? 'Late' : null
                }
                early={
                  attendance?.anomalies?.includes('EARLY_EXIT') ? 'Early' : null
                }
                hours={hours}
                breakSeconds={breakSeconds} // ✅ passes to TodayRow
              />
            );
          }

          // leave + no checkin → pure leave row
          const hasCheckIn = Boolean(firstCheckIn);
          const isLeaveStatus =
            status === 'full-day-leave' ||
            status === 'leave-first-half' ||
            status === 'leave-second-half';

          const effectiveStatus =
            !hasCheckIn && isLeaveStatus ? 'leave' : status;

          return (
            <TimelineRow
              key={key}
              day={day}
              date={dateNum}
              status={effectiveStatus}
              hours={hours}
              breakSeconds={breakSeconds} // ✅ pass to TimelineRow too
              checkIn={checkInTime}
              checkOut={checkOutTime}
              holidayName={holidayName}
              leaveLabel={label}
            />
          );
        })}
      </div>
    </div>
  );
}
