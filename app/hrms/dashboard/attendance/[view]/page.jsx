"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { List, Table, Calendar, FileText } from "lucide-react";

import AttendanceList from "@/components/Attendance/AttendanceList";
import AttendanceCalendar from "@/components/Attendance/AttendanceCalendar";
import AttendanceTabular from "@/components/Attendance/AttendanceTabular";
import DateNavigator from "@/components/Attendance/DateNavigator";
import FilterDropdown from "@/components/Attendance/FilterDropdown";
import RequestRegularization from "@/components/Attendance/RequestRegularization";
import TimeScaleFooter from "@/components/Attendance/TimeScaleFooter";

export default function AttendanceViewPage() {
  const { view } = useParams();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [rangeMode, setRangeMode] = useState("week");
  const [showRegModal, setShowRegModal] = useState(false);

  const isCalendar = view === "calendar";
  const effectiveRange = isCalendar ? "month" : rangeMode;

  return (
    <div>
      {/* STICKY HEADER */}
      <div className="  sticky top-0 z-30  bg-white  p-4 mb-2 ">
        {/* Top Orange Bar - Optional Decor */}

        <div className="px-10 py-4 ">
          <div className="flex items-center justify-between">
            {/* LEFT: General Shift Info */}
            <div className="flex items-center gap-8">
              <h5 className="text-xl font-semibold text-orange-600">
                General [ 9:00 AM - 6:00 PM ]
              </h5>
            </div>

            {/* CENTER: Date Navigator */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <DateNavigator
                view={view}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                rangeMode={rangeMode}
              />
            </div>

            {/* RIGHT: View Buttons + Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
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
              </div>

              {!isCalendar && (
                <FilterDropdown value={rangeMode} onChange={setRangeMode} />
              )}

              <button
                onClick={() => setShowRegModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition shadow-sm"
              >
                <FileText size={16} />
                Regularize
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className=" pb-10">
        <div className="max-w-8xl mx-auto px-6 py-8">
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
      </div>
        <TimeScaleFooter/>
    
        {showRegModal && <RequestRegularization onClose={()=>setShowRegModal(false)} />}
     
    </div>
  );
}

function ViewButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-md transition-all ${
        active
          ? "bg-orange-500 text-white shadow-sm"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}