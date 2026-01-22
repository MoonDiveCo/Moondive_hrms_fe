'use client';

import { useEffect, useState } from 'react';
import WorkingTimeline from './WorkingTimeline';
import CheckInBadge from './CheckInBadge';
import { AlertCircle, CalendarDays, Umbrella } from 'lucide-react';

export default function TodayRow({
  date,
  checkIn,
  checkOut,
  late,
  early,
  status,
  hours = '00:00',
}) {

  const isAbsent = status === 'absent';
  const isWeekend = status === 'weekend';
  const isFuture = status === 'future';
  const isPresent = status === 'present';
  const isHoliday = status === 'holiday';
  const isFullDayLeave = status === 'full-day-leave';
  const isFirstHalfLeave = status === 'leave-first-half';
  const isSecondHalfLeave = status === 'leave-second-half';

  const isHalfDayLeave = isFirstHalfLeave || isSecondHalfLeave;

  const isNonWorking =
    !isFuture && (isAbsent || isWeekend || isHoliday || isFullDayLeave);

  const leaveLabelMap = {
    "full-day-leave": "Full Day Leave",
    "leave-first-half": "First Half Leave",
    "leave-second-half": "Second Half Leave",
  };

  const leaveLabel = leaveLabelMap[status];

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

    if (isFullDayLeave || isHalfDayLeave)
      return {
        icon: <Umbrella className="w-5 h-5" />,
        label: leaveLabel,
        color: 'purple',
      };


    return null;
  };

  const statusInfo = getStatusInfo();
  const [workedHours, setWorkedHours] = useState('00:00');

  const effectiveCheckOut =
    checkOut && !isNaN(new Date(checkOut).getTime()) ? checkOut : new Date();
  function formatTime(value) {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const calculateWorked = () => {
    if (!checkIn) return '00:00';

    const start = new Date(checkIn);
    if (isNaN(start.getTime())) return '00:00';

    const end = effectiveCheckOut ? new Date(effectiveCheckOut) : new Date();

    const diffMs = Math.max(0, end - start);
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  useEffect(() => {
    setWorkedHours(calculateWorked());

    if (effectiveCheckOut) return;

    const interval = setInterval(() => {
      setWorkedHours(calculateWorked());
    }, 1000); // ← visible live updates

    return () => clearInterval(interval);
  }, [checkIn, effectiveCheckOut]);

  return (
    <div className='flex items-center gap-4'>
      <div className='w-16 text-right'>
        <div className='text-sm text-gray-500'>Today</div>

        <div className='w-9 h-9 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold ml-auto'>
          {date}
        </div>
      </div>

      <div
        className={`
          flex-1 h-20 rounded-xl relative overflow-hidden
          flex items-center px-6 transition-all
 
          ${isFuture ? 'border border-dashed border-gray-300 bg-gray-50' : 'bg-white'}
 
          ${isWeekend ? 'border border-yellow-200' : ''}
          ${isHoliday && !isFuture ? 'ring-1 ring-blue-300 border-l-4 border-blue-300' : ''}
          ${isPresent ? 'ring-1 ring-gray-200 border-l-4 border-green-300' : ''}
          ${(isAbsent || isFullDayLeave) && !isFuture ? 'ring-1 ring-red-400 border-l-4 border-red-400' : ''}
        `}
      >

        <div className='w-28'>
          <div className='font-semibold'>{formatTime(checkIn)}</div>
          {/* {late && <div className="text-xs text-orange-600 mt-1">Late by {late}</div>} */}
          {!isFullDayLeave && <CheckInBadge />}
        </div>


        {/* {isHalfDayLeave && (
        <div className="text-xs text-purple-600 mt-1">
          {isFirstHalfLeave ? "Working in Second Half" : "Working in First Half"}
        </div>
      )} */}

        {statusInfo && isFullDayLeave && (
          <><div className="absolute inset-0 bg-red-50 z-0" /><div className="absolute left-10 right-32 top-1/2 -translate-y-1/2 h-[1px] bg-red-200 z-0" /><div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div
              className={`
                flex items-center gap-3 px-5 py-2 rounded-full text-xs font-medium
                ${statusInfo.color === 'red' && 'bg-red-100 text-red-700'}
                ${statusInfo.color === 'blue' && 'bg-blue-100 text-blue-700'}
                ${statusInfo.color === 'purple' && 'bg-red-100 text-red-500'}
              `}
            >
              {statusInfo.icon}
              <div>{statusInfo.label}</div>
            </div>
          </div></>
        )}


        {!isNonWorking && (
          <div className="flex-1 relative z-99 overflow-hidden">

            {/* FIRST HALF LEAVE */}
            {isFirstHalfLeave && (
              <HalfDayLeaveBlock
                position="left"
                label="First Half Leave"
              />
            )}

            {/* SECOND HALF LEAVE */}
            {isSecondHalfLeave && (
              <HalfDayLeaveBlock
                position="right"
                label="Second Half Leave"
              />
            )}

            {/* WORKING TIMELINE */}
            <div className="relative z-1 h-full">
              <WorkingTimeline
                checkIn={checkIn}
                checkOut={checkOut || null}
              />
            </div>

          </div>
        )}


        {checkOut && (
          <div className='w-28 text-right'>
            <div className='font-semibold'>{formatTime(checkOut)}</div>
            {/* {early && (
              <div className='text-xs text-orange-600 mt-1'>
                Early by {early}
              </div>
            )} */}
          </div>
        )}

        {!isFullDayLeave && (
          <div className='w-24 text-right'>
            <div className='font-bold text-lg'>{workedHours}</div>
            <div className='text-xs text-gray-500'>Hrs worked</div>
          </div>
        )}
      </div>
    </div>
  );
}

const HalfDayLeaveBlock = ({ position, label }) => (
  <div
    className={`
      absolute top-0 bottom-0
      ${position === "left" ? "left-0" : "right-0"}
      w-1/2
      bg-purple-50 border-purple-300
      flex items-center justify-center
      text-purple-700 text-xs font-medium
      rounded-full
      z-10
    `}
  >
    <Umbrella className="w-5 h-5 mr-2" />
    {label}
  </div>
);

