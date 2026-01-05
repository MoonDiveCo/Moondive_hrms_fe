"use client";

import { useEffect, useState } from "react";
import WorkingTimeline from "./WorkingTimeline";
import CheckInBadge from "./CheckInBadge";

export default function TodayRow({
  date,
  checkIn,    // ← Now receives full ISO string like "2026-01-02T09:42:00.000Z"
  checkOut,
  late,
  early,
}) {
const [workedHours, setWorkedHours] = useState("00:00");

  const effectiveCheckOut =
    checkOut && !isNaN(new Date(checkOut).getTime())
      ? checkOut
      : new Date();

  const calculateWorked = () => {
    if (!checkIn) return "00:00";

    const start = new Date(checkIn);
    if (isNaN(start.getTime())) return "00:00";

    const end = effectiveCheckOut
      ? new Date(effectiveCheckOut)
      : new Date();

    const diffMs = Math.max(0, end - start);
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
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
    <div className="flex items-center gap-4">
      <div className="w-16 text-right">
        <div className="text-sm text-gray-500">Today</div>
        
        <div className="w-9 h-9 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold ml-auto">
          {date}
        </div>
      </div>

      <div className="flex-1 h-24 bg-white rounded-xl flex items-center px-6 gap-6 shadow-sm ring-1 ring-green-300">
        <div className="w-28">
          <div className="font-semibold">{checkIn}</div>
          {/* {late && <div className="text-xs text-orange-600 mt-1">Late by {late}</div>} */}
          <CheckInBadge/>
        </div>

        <div className="flex-1 relative">
          <WorkingTimeline
            checkIn={checkIn}
            checkOut={checkOut || null}
          />
        </div>

        {checkOut && (
          <div className="w-28 text-right">
            <div className="font-semibold">Check Out At {checkOut}</div>
            {early && <div className="text-xs text-orange-600 mt-1">Early by {early}</div>}
          </div>
        )}

        <div className="w-24 text-right">
          <div className="font-bold text-lg">{workedHours}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Hrs worked
          </div>
        </div>
      </div>
      
    </div>
  );
}