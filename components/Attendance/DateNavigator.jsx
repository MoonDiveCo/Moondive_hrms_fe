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
} from "date-fns";

export default function DateNavigator({
  view,
  currentDate,
  setCurrentDate,
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

  const label = isCalendar
    ? format(currentDate, "MMM yyyy")
    : `${format(startOfWeek(currentDate), "dd-MMM-yyyy")} - ${format(
        endOfWeek(currentDate),
        "dd-MMM-yyyy"
      )}`;

  return (
   <div className="flex items-center gap-2">
      {/* LEFT ARROW */}
      <button
        onClick={goPrev}
        className="p-2 bg-white rounded-md border hover:bg-gray-50"
      >
        <ChevronLeft size={16} />
      </button>

      {/* DATE PILL */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-md border text-sm font-medium">
        <Calendar size={16} />
        {label}
      </div>

      {/* RIGHT ARROW */}
      <button
        onClick={goNext}
        className="p-2 bg-white rounded-md border hover:bg-gray-50"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
