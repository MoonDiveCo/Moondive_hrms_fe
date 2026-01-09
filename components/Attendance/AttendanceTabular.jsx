'use client';

import {
  format,
  parseISO,
  isWeekend,
  isAfter,
  startOfDay,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInMinutes,
} from 'date-fns';
import { useContext } from 'react';

import { useAttendanceCalendar } from '@/hooks/useAttendanceCalendar';
import { useHolidays } from '@/hooks/useHolidays';
import { useLeaves } from '@/hooks/useLeave';
import { AuthContext } from '@/context/authContext';
import { useAttendance } from '@/context/attendanceContext';

/* ---------------- STATUS BADGE ---------------- */

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const styles = {
    Weekend: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Present: 'bg-green-100 text-green-700 border-green-300',
    'On Leave': 'bg-red-100 text-red-700 border-red-300',
    Absent: 'bg-red-50 text-red-600 border-red-200',
    'First Half': 'bg-orange-100 text-orange-700 border-orange-300',
    'Second Half': 'bg-orange-100 text-orange-700 border-orange-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
        styles[status] || 'bg-gray-100 text-gray-600 border-gray-300'
      }`}
    >
      {status}
    </span>
  );
};

/* ---------------- SESSION HELPERS ---------------- */

function getFirstIn(record) {
  if (!record?.sessions?.length) return null;
  return record.sessions[0].checkIn;
}

function getLastOut(record) {
  if (!record?.sessions?.length) return null;
  const last = record.sessions[record.sessions.length - 1];
  return last.checkOut || null;
}

function calculateTotalMinutesFromSessions(record) {
  if (!record?.sessions?.length) return 0;

  return record.sessions.reduce((sum, s) => {
    if (!s.checkIn) return sum;
    const start = new Date(s.checkIn);
    const end = s.checkOut ? new Date(s.checkOut) : new Date();
    return sum + differenceInMinutes(end, start);
  }, 0);
}

function calculateBreakMinutes(record) {
  if (!Array.isArray(record?.breaks)) return 0;

  return record.breaks.reduce((sum, b) => {
    if (!b.start) return sum;
    const bs = new Date(b.start);
    const be = b.end ? new Date(b.end) : new Date();
    return sum + differenceInMinutes(be, bs);
  }, 0);
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function AttendanceTabular({ currentDate, rangeMode = 'week' }) {
  const today = startOfDay(new Date());
  const { user } = useContext(AuthContext);
  const { workedSeconds, isCheckedIn } = useAttendance();

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

  const rangeStart =
    rangeMode === 'month'
      ? startOfMonth(currentDate)
      : startOfWeek(currentDate, { weekStartsOn: 0 });

  const rangeEnd =
    rangeMode === 'month'
      ? endOfMonth(currentDate)
      : endOfWeek(currentDate, { weekStartsOn: 0 });

  const rows = eachDayOfInterval({
    start: rangeStart,
    end: rangeEnd,
  }).map((date) => {
    const key = startOfDay(date).toDateString();
    const record = attendanceMap[key];
    const isToday = startOfDay(date).getTime() === startOfDay(today).getTime();

    const future = isAfter(date, today);
    const weekend = isWeekend(date);

    /* ---------- STATUS ---------- */

    let status = null;

    if (weekend) status = 'Weekend';
    else if (holidayMap[key]) status = 'Holiday';
    else if (leaveMap[key]) {
      status = leaveMap[key].isHalfDay ? leaveMap[key].session : 'On Leave';
    } else if (future) status = null;
    else if (record?.status) status = record.status;
    else status = 'Absent';

    /* ---------- TIME CALC ---------- */

    let firstIn = null;
    let lastOut = null;
    let totalHours = '-';
    let payableHours = '-';

    // 🔹 TODAY (LIVE)
    if (record?.sessions?.length) {
      firstIn = getFirstIn(record);
      lastOut = getLastOut(record);
    }

    // 🔹 TODAY (LIVE HOURS)
    if (isToday && isCheckedIn) {
      const payableMinutes = Math.floor(workedSeconds / 60);
      const h = Math.floor(payableMinutes / 60);
      const m = payableMinutes % 60;

      totalHours = `${h.toString().padStart(2, '0')}:${m
        .toString()
        .padStart(2, '0')}`;

      payableHours = totalHours;
    }

    // 🔹 PAST DAYS (FINALIZED)
    else if (record?.sessions?.length) {
      const totalMinutes = calculateTotalMinutesFromSessions(record);
      const breakMinutes = calculateBreakMinutes(record);
      const payableMinutes = Math.max(totalMinutes - breakMinutes, 0);

      const th = Math.floor(totalMinutes / 60);
      const tm = totalMinutes % 60;

      const ph = Math.floor(payableMinutes / 60);
      const pm = payableMinutes % 60;

      totalHours = `${th.toString().padStart(2, '0')}:${tm
        .toString()
        .padStart(2, '0')}`;

      payableHours = `${ph.toString().padStart(2, '0')}:${pm
        .toString()
        .padStart(2, '0')}`;
    }
    return {
      date,
      status,
      future,
      firstIn,
      lastOut,
      totalHours,
      payableHours,
    };
  });

  /* ---------------- UI ---------------- */

  return (
    <div className='bg-white rounded-2xl border border-gray-200 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              {[
                'Date',
                'First In',
                'Last Out',
                'Total Hours',
                'Payable Hours',
                'Status',
                'Shift',
                'Regularization',
              ].map((header) => (
                <th
                  key={header}
                  className='px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider'
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className='bg-white divide-y divide-gray-200'>
            {rows.map((row, i) => (
              <tr key={i} className='hover:bg-gray-50'>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {format(row.date, 'EEE, dd MMM yyyy')}
                </td>

                <td className='px-6 py-4 text-sm text-gray-700'>
                  {row.future || !row.firstIn
                    ? '-'
                    : format(parseISO(row.firstIn), 'HH:mm')}
                </td>

                <td className='px-6 py-4 text-sm text-gray-700'>
                  {row.future || !row.lastOut
                    ? '-'
                    : format(parseISO(row.lastOut), 'HH:mm')}
                </td>

                <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                  {row.totalHours}
                </td>

                <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                  {row.payableHours}
                </td>

                <td className='px-6 py-4'>
                  {row.status && <StatusBadge status={row.status} />}
                </td>

                <td className='px-6 py-4 text-sm text-gray-500'>General</td>

                <td className='px-6 py-4 text-sm text-gray-500'>-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
