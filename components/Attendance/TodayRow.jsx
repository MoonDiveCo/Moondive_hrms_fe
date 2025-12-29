"use client"
import { useEffect, useState } from "react";
import WorkingTimeline from "./WorkingTimeline";
import { diffTime } from "@/helper/time";

export default function TodayRow({
  date,
  checkIn,
  checkOut,
  late,
  early,
}) {
  const [worked, setWorked] = useState(
    checkOut ? "00:12" : diffTime(checkIn)
  );

  // ⏱ live counter
  useEffect(() => {
    if (checkOut) return;

    const timer = setInterval(() => {
      setWorked(diffTime(checkIn));
    }, 60000); // update every minute

    return () => clearInterval(timer);
  }, [checkOut, checkIn]);

  return (
    <div className="flex items-center gap-4">
      {/* date */}
      <div className="w-16 text-right">
        <div className="text-sm text-gray-500">Today</div>
        <div className="w-9 h-9 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold ml-auto">
          {date}
        </div>
      </div>

      {/* card */}
      <div className="flex-1 h-24 bg-white rounded-xl flex items-center px-6 gap-6 shadow-sm">
        {/* in */}
        <div className="w-28">
          <div className="font-semibold">{checkIn} PM</div>
          <div className="text-xs text-orange-500">
            Late by {late}
          </div>
        </div>

        {/* timeline */}
        <div className="flex-1">
          <WorkingTimeline
            inTime={checkIn}
            outTime={checkOut}
          />
        </div>

        {/* out */}
        {checkOut && (
          <div className="w-28 text-right">
            <div className="font-semibold">
              {checkOut} PM
            </div>
            <div className="text-xs text-orange-500">
              Early by {early}
            </div>
          </div>
        )}

        {/* hours */}
        <div className="w-20 text-right">
          <div className="font-bold">{worked}</div>
          <div className="text-xs text-gray-400">
            HRS WORKED
          </div>
        </div>
      </div>
    </div>
  );
}
