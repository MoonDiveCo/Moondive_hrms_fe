'use client';
 
import { Sun, AlertCircle, CalendarDays, Umbrella } from 'lucide-react';
import CheckInBadge from './CheckInBadge';
import CheckOutBadge from './CheckOutBadge';
import WorkingTimeline from './WorkingTimeline';
 
export default function TimelineRow({
  day,
  date,
  status,
  hours,
  checkIn = null,
  checkOut = null,
  holidayName,
  leaveLabel = null,
  breaks = [],
}) {
  /* ---------- STATUS FLAGS ---------- */
  const isAbsent = status === 'absent';
  const isWeekend = status === 'weekend';
  const isFuture = status === 'future';
  const isPresent = status === 'present';
  const isHoliday = status === 'holiday';
  const isLeave = status === 'leave';
  const isFirstHalfLeave = status === 'leave-first-half';
  const isSecondHalfLeave = status === 'leave-second-half';
 
  const isAnyLeave = isLeave || isFirstHalfLeave || isSecondHalfLeave;
  const isNonWorking =
    !isFuture && (isAbsent || isWeekend || isHoliday || isAnyLeave);
 
  /* ---------- STATUS BADGE INFO ---------- */
  const getStatusInfo = () => {
    if (isAbsent)
      return { icon: <AlertCircle className="w-5 h-5" />, label: 'Absent', color: 'red' };
 
    if (isHoliday)
      return {
        icon: <CalendarDays className="w-5 h-5" />,
        label: holidayName,
        color: 'blue',
      };
 
    if (isAnyLeave)
      return {
        icon: <Umbrella className="w-5 h-5" />,
        label: leaveLabel || 'Leave',
        color: 'purple',
      };
 
    return null;
  };
 
  const statusInfo = getStatusInfo();
 
  return (
    <div className="flex items-center gap-4">
      <DateCol day={day} date={date} />
 
      {/* ================= ROW CARD ================= */}
      <div
        className={`
          flex-1 h-20 rounded-xl relative overflow-hidden
          flex items-center px-6 transition-all
 
          ${isFuture ? 'border border-dashed border-gray-300 bg-gray-50' : 'bg-white'}
 
          ${isWeekend ? 'border border-yellow-200' : ''}
          ${isHoliday && !isFuture ? 'ring-1 ring-blue-300 border-l-4 border-blue-300' : ''}
          ${isPresent ? 'ring-1 ring-gray-200 border-l-4 border-green-300' : ''}
          ${(isAbsent || isAnyLeave) && !isFuture ? 'ring-1 ring-red-400 border-l-4 border-red-400' : ''}
        `}
      >
        {/* ================= WEEKEND CLASSIC TRAY ================= */}
        {isWeekend && !isFuture && (
          <>
            <div className="absolute inset-0 bg-yellow-50 z-0" />
            <div className="absolute left-10 right-32 top-1/2 -translate-y-1/2 h-[1px] bg-yellow-200 z-0" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-700 text-sm font-medium shadow-sm">
                <Sun className="w-4 h-4" />
                Weekend
              </div>
            </div>
          </>
        )}
 
        {/* ================= PRESENT DAY ================= */}
        {isPresent && (
          <>
            {/* Check-in */}
            {checkIn && (
                <div className="font-semibold text-sm">
                  {new Date(checkIn).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              // <div className="absolute left-8 top-3 z-10 text-left">
              //   <CheckInBadge time={checkIn} status={status} />
              // </div>
            )}
 
            {/* Timeline */}
            <div className="absolute inset-x-40 top-1/2 -translate-y-1/2 z-0">
              <WorkingTimeline
                checkIn={checkIn}
                checkOut={checkOut || null}
                breaks={breaks}
              />
            </div>
 
            {/* Check-out */}
            {checkOut && (
              <div className="absolute right-40 top-3 z-10 text-right">
                <div className="font-semibold text-sm">
                  {new Date(checkOut).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <CheckOutBadge time={checkOut} status="normal" />
              </div>
            )}
          </>
        )}
 
        {/* ================= NON-WORKING BADGE (NOT WEEKEND) ================= */}
        {isNonWorking && statusInfo && !isWeekend && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div
              className={`
                flex items-center gap-3 px-5 py-2 rounded-full text-xs font-medium
                ${statusInfo.color === 'red' && 'bg-red-100 text-red-700'}
                ${statusInfo.color === 'blue' && 'bg-blue-100 text-blue-700'}
                ${statusInfo.color === 'purple' && 'bg-red-100 text-red-500'}
              `}
            >
              {statusInfo.icon}
              {statusInfo.label}
            </div>
          </div>
        )}
 
        {/* ================= UPCOMING ================= */}
        {isFuture && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 tracking-wide">
            Upcoming
          </div>
        )}
 
        {/* ================= HOURS ================= */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-right z-20">
          <div className="font-semibold text-lg">{hours || '00:00'}</div>
          <div className="text-xs text-gray-500">Hrs worked</div>
        </div>
      </div>
    </div>
  );
}
 
/* ---------- DATE COLUMN ---------- */
function DateCol({ day, date }) {
  return (
    <div className="w-16 text-right">
      <div className="text-sm text-gray-500">{day}</div>
      <div className="text-2xl font-bold">{date}</div>
    </div>
  );
}
 
 