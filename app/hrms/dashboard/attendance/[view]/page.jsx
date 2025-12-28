"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  List,
  Table,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";

import AttendanceList from "@/components/Attendance/AttendanceList";
import AttendanceCalendar from "@/components/Attendance/AttendanceCalendar";
import AttendanceTabular from "@/components/Attendance/AttendanceTabular";
import DateNavigator from "@/components/Attendance/DateNavigator";
import FilterDropdown from "@/components/Attendance/FilterDropdown";

export default function AttendanceViewPage() {
  const { view } = useParams();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());

  const isCalendar = view === "calendar";
 const [rangeMode, setRangeMode] = useState("week");
   const effectiveRange = isCalendar ? "month" : rangeMode;
  return (
    <div className="h-screen flex flex-col bg-gray-50">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-100 border-b">

        {/* DATE NAVIGATOR (CENTERED visually like image) */}
        <div className="flex-1 flex justify-center">
          <DateNavigator
            view={view}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-2">
          <ViewButton
            active={view === "list"}
            onClick={() => router.push("/hrms/dashboard/attendance/list")}
          >
            <List size={18} />
          </ViewButton>

          <ViewButton
            active={view === "tabular"}
            onClick={() => router.push("/hrms/dashboard/attendance/tabular")}
          >
            <Table size={18} />
          </ViewButton>

          <ViewButton
            active={view === "calendar"}
            onClick={() => router.push("/hrms/dashboard/attendance/calendar")}
          >
            <Calendar size={18} />
          </ViewButton>

           {!isCalendar && (
            <FilterDropdown
              value={rangeMode}
              onChange={setRangeMode}
            />
          )}
        </div>
      </div>

      {/* VIEW CONTENT */}
      <div className="flex-1 overflow-hidden">
        {view === "list" && <AttendanceList />}
        {view === "tabular" && <AttendanceTabular />}
        {view === "calendar" && <AttendanceCalendar />}
      </div>
    </div>
  );
}

function ViewButton({
  active,
  children,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg border transition
        ${
          active
            ? "border-primary text-primary bg-white"
            : "border-gray-300 text-gray-500 bg-white"
        }`}
    >
      {children}
    </button>
  );
}
