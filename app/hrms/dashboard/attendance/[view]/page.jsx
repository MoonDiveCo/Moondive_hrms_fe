"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { List, Table, Calendar, FileText } from "lucide-react";

import AttendanceList from "@/components/Attendance/AttendanceList";
import AttendanceCalendar from "@/components/Attendance/AttendanceCalendar";
import AttendanceTabular from "@/components/Attendance/AttendanceTabular";
import DateNavigator from "@/components/Attendance/DateNavigator";
import FilterDropdown from "@/components/Attendance/FilterDropdown";
import Modal from "@/components/common/Modal";
import RequestRegularization from "@/components/Attendance/RequestRegularization";

export default function AttendanceViewPage() {
  const { view } = useParams();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [rangeMode, setRangeMode] = useState("week");
  const [showRegModal, setShowRegModal] = useState(false);

  const isCalendar = view === "calendar";
  const effectiveRange = isCalendar ? "month" : rangeMode;

  return (
    <div className="flex flex-col w-full bg-white">

      <div className="sticky top-0 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          {/* DATE NAVIGATOR */}
          <div className="flex-1 flex justify-center">
            <DateNavigator
              view={view}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              rangeMode={rangeMode}
            />
          </div>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-2">
            <ViewButton
              active={view === "list"}
              onClick={() =>
                router.push("/hrms/dashboard/attendance/list")
              }
            >
              <List size={18} />
            </ViewButton>

            <ViewButton
              active={view === "tabular"}
              onClick={() =>
                router.push("/hrms/dashboard/attendance/tabular")
              }
            >
              <Table size={18} />
            </ViewButton>

            <ViewButton
              active={view === "calendar"}
              onClick={() =>
                router.push("/hrms/dashboard/attendance/calendar")
              }
            >
              <Calendar size={18} />
            </ViewButton>

            {!isCalendar && (
              <FilterDropdown
                value={rangeMode}
                onChange={setRangeMode}
              />
            )}

            {/* 📝 Regularization Button */}
            <button
              onClick={() => setShowRegModal(true)}
              className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90"
            >
              <FileText size={16} />
              Regularize
            </button>
          </div>
        </div>
      </div>


      <div className="flex-1 overflow-y-hidden px-6 py-4">
        {view === "list" && (
          <AttendanceList
            currentDate={currentDate}
            rangeMode={effectiveRange}
          />
        )}

        {view === "tabular" && (
          <AttendanceTabular
            currentDate={currentDate}
            rangeMode={effectiveRange}
          />
        )}

        {view === "calendar" && (
          <AttendanceCalendar currentDate={currentDate} />
        )}
      </div>
    
        {showRegModal && <RequestRegularization onClose={()=>setShowRegModal(false)} />}
     
    </div>
  );
}

function ViewButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg border transition
        ${
          active
            ? "bg-primary text-white border-primary"
            : "bg-white text-gray-500 border-gray-300"
        }`}
    >
      {children}
    </button>
  );
}
