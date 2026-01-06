"use client";

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  format,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth
} from "date-fns";

export default function DateNavigator({
  view,
  currentDate,
  setCurrentDate,
  rangeMode
}) {
  const isCalendar = view === "calendar";

  const goPrev = () => {
    setCurrentDate(
      isCalendar ? subMonths(currentDate, 1) : subWeeks(currentDate, 1)
    );
  };

  const goNext = () => {
    setCurrentDate(
      isCalendar ? addMonths(currentDate, 1) : addWeeks(currentDate, 1)
    );
  };

  const label =
  view === "calendar"
    ? format(currentDate, "MMM yyyy")
    : rangeMode === "month"
    ? `${format(startOfMonth(currentDate), "dd-MMM-yyyy")} - ${format(
        endOfMonth(currentDate),
        "dd-MMM-yyyy"
      )}`
    : `${format(startOfWeek(currentDate), "dd-MMM-yyyy")} - ${format(
        endOfWeek(currentDate),
        "dd-MMM-yyyy"
      )}`;


  return (
   <div className="flex items-center gap-2 sticky top-0 z-30">
      {/* LEFT ARROW */}
      <button
        onClick={goPrev}
        className="p-2 bg-primary rounded-md  hover:bg-orange-300 "
      >
        <ChevronLeft size={16} className="text-white" />
      </button>

      {/* DATE PILL */}
      <div className="flex items-center gap-2 px-3 py-2 text-primary rounded-md  text-sm font-medium">
        <Calendar size={18} className="text-primary"/>
        <h5>{label}</h5>
      </div>

      {/* RIGHT ARROW */}
      <button
        onClick={goNext}
        className="p-2 bg-primary rounded-md  hover:bg-orange-300"
      >
        <ChevronRight size={16} className="text-white"/>
      </button>
    </div>
  );
}
