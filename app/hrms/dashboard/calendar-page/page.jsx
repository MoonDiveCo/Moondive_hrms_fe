"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const dates = [
  null, 1, 2, 3, 4, 5, 6,
  7, 8, 9, 10, 11, 12, 13,
  14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27,
  28, 29, 30, 31, null, null, null,
];

export default function CalPage() {
  return (
    <main className="min-h-screen p-4 sm:p-8">
      {/* Header */}
      <header className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Attendance Calendar</h1>
          <p className="text-sm text-gray-500">
            Manage employee attendance records
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-light p-2 rounded-lg border border-border-light">
          <button className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeft />
          </button>

          <div className="flex items-center gap-2 px-2">
            <CalendarDays className="text-gray-500" />
            <span className="font-medium text-lg">Oct 2024</span>
          </div>

          <button className="p-2 hover:bg-gray-100 rounded">
            <ChevronRight />
          </button>

          <div className="h-6 w-px bg-gray-300 mx-2" />

          <button className="px-3 py-1 text-sm border rounded bg-white">
            Month
          </button>
          <button className="px-3 py-1 text-sm rounded hover:bg-gray-100">
            Week
          </button>
        </div>
      </header>

      {/* Calendar */}
      <section className="bg-surface-light rounded-xl border border-border-light overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {days.map((day) => (
            <div
              key={day}
              className="p-4 text-sm font-semibold text-gray-500 border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7 grid-rows-5">
          {dates.map((date, index) => {
            const isWeekend = index % 7 === 0 || index % 7 === 6;

            return (
              <div
                key={index}
                className={`min-h-[140px] p-3 border-r border-b last:border-r-0
                ${
                  isWeekend
                    ? "bg-weekend-light"
                    : "bg-surface-light hover:bg-gray-50"
                }`}
              >
                {date && (
                  <>
                    <span className="text-gray-500 font-medium">{date}</span>

                    {!isWeekend && (
                      <div className="mt-2 bg-absent-bg border-l-4 border-absent-border rounded-r px-2 py-1.5">
                        <p className="text-xs font-semibold text-absent-text">
                          Absent
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Legend */}
      <footer className="mt-4 flex justify-end gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full" />
          Absent
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-weekend-light border rounded-full" />
          Weekend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-white border rounded-full" />
          Working Day
        </div>
      </footer>
    </main>
  );
}
