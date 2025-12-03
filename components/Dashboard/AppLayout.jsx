"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MainNavbar from "./MainNavbar";
import { usePathname } from "next/navigation";
import OverviewIcon from "../../public/Dashboard/Overview.png";
import CandidateIcon from "../../public/Dashboard/Candidate.png";
import LeaveTrackerIcon from "../../public/Dashboard/LeaveTracker.png";
import AttendanceIcon from "../../public/Dashboard/Attendance.png";
import TimeTrackerIcon from "../../public/Dashboard/TimeTracker.png";
import PerformanceIcon from "../../public/Dashboard/Performance.png";
import DocumentsIcon from "../../public/Dashboard/Documents.png";
import OperationsIcon from "../../public/Dashboard/Operations.png";
import AnalyticsIcon from "../../public/Dashboard/Analytics.png";
import SettingIcon from "../../public/Dashboard/Setting.png";

export default function AppLayout({ isHrms,isCms,isCrm,children }) {
const TOP_ITEMS = [
     { label: "Overview", icon: OverviewIcon, href: "/dashboard" },
    { label: "Candidate", icon: CandidateIcon, href: "/dashboard/candidate" },
    { label: "Leave Tracker", icon: LeaveTrackerIcon, href: "/dashboard/leave-tracker" },
    { label: "Attendance", icon: AttendanceIcon, href: "/dashboard/attendance" },
    { label: "Time Tracker", icon: TimeTrackerIcon, href: "/dashboard/time-tracker" },
    { label: "Performance", icon: PerformanceIcon, href: "/dashboard/performance" },
    { label: "Documents", icon: DocumentsIcon, href: "/dashboard/documents" },
  ];
  
  const BOTTOM_ITEMS = [
    { label: "Operations", icon: OperationsIcon },
    { label: "Analytics", icon: AnalyticsIcon },
    { label: "Setting", icon: SettingIcon },
  ];
  const [topItems,setTopItems] = useState([])
    const [bottomItems, setBottomItems] = useState([]);

    useEffect(()=>{
      if(isHrms){
        setTopItems(TOP_ITEMS)
        setBottomItems(BOTTOM_ITEMS)
      }
    })
  return (

    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <Sidebar topItems={topItems} bottomItems={bottomItems} />
      </aside>
      <div className="flex-1 flex flex-col w-full">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center">
          <MainNavbar />
        </header>
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
