"use client";

import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import AttendanceCard from "@/components/Attendance/AttendanceCard";
import CheckInButton from "@/components/Attendance/CheckInButton";
import TimelineRow from "@/components/Attendance/TimelineRow";
import WorkingTimeline from "@/components/Attendance/WorkingTimeline";
import TodayRow from "@/components/Attendance/TodayRow";

export default function AttendancePage() {
  return (
    <div className="h-screen flex flex-col text-gray-800 font-sans ">
      
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-gray-50 px-8  ">
        <div className="flex items-center justify-center gap-4 text-sm font-medium">
          <ChevronLeft className="cursor-pointer" />
          <div>21-Dec-2025 - 27-Dec-2025</div>
          <ChevronRight className="cursor-pointer" />
        </div>

        <div className="flex items-center justify-between mt-2">

          <AttendanceCard className="flex justify-between items-center gap-3 flex-1 ml-6">
            <h5 className="text-sm font-semibold whitespace-nowrap">
              General [ 9:00 AM - 6:00 PM ]
            </h5>

          

            <CheckInButton />
          </AttendanceCard>
        </div>
      </header>

      {/* MAIN — SCROLLABLE */}
      <main className="flex-1 overflow-y-auto px-10 py-6 space-y-6 bg-gray-50">
        <div className="space-y-5">

          <TimelineRow day="Mon" date="22" status="absent" hours="00:00" />

          <TodayRow
            date="23"
            checkIn="16:16"
            checkOut="16:28"
            late="07:16"
            early="01:32"
            hours="00:12"
          />

          <TodayRow
            date="24"
            checkIn="10:16"
            late="07:16"
            early="01:32"
            hours="00:12"
          />

          {/* FUTURE */}
          <div className="flex items-center gap-4 opacity-50">
            <DateCol day="Wed" date="25" />
            <div className="flex-1 h-24 bg-white rounded-xl flex items-center justify-center text-gray-400">
              --
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="sticky -bottom-2 z-20 bg-white  px-6 py-4 flex items-center gap-8 text-sm">
        <FooterStat label="Payable Days" value="2 Days" color="bg-yellow-400" />
        <FooterStat label="Present" value="0 Days" color="bg-green-400" />
        <FooterStat label="On Duty" value="0 Days" color="bg-purple-400" />
        <FooterStat label="Paid Leave" value="0 Days" color="bg-indigo-400" />
        <FooterStat label="Holidays" value="0 Days" color="bg-cyan-400" />
        <FooterStat label="Weekend" value="2 Days" color="bg-orange-400" />

        <div className="ml-auto font-medium text-sm">
          General [ 9:00 AM - 6:00 PM ]
        </div>
      </footer>
    </div>
  );
}

/* ---------- helpers ---------- */

function DateCol({ day, date }) {
  return (
    <div className="w-16 text-right">
      <div className="text-sm text-gray-500">{day}</div>
      <div className="text-xl font-bold">{date}</div>
    </div>
  );
}

function FooterStat({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1 h-6 rounded ${color}`} />
      <div>
        <div className="text-xs text-gray-400">{label}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}
