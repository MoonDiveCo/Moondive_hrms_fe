// components/Sidebar.jsx
"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";

// Brand
import MoondiveAdmin from "../../public/Dashboard/MoondiveAdmin.png";

// TOP ICONS
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

const TOP_ITEMS = [
  { label: "Overview", icon: OverviewIcon, href: "/crm/dashboard" },
  { label: "Leads", icon: CandidateIcon, href: "/crm/dashboard/leads" },
  { label: "In Process", icon: LeaveTrackerIcon, href: "/crm/dashboard/leave-tracker" },
  { label: "Metting Scheduling", icon: AttendanceIcon, href: "/crm/dashboard/attendance" },
  { label: "Final Scheduling", icon: TimeTrackerIcon, href: "/dashboard/time-tracker" },
  { label: "Win/Lose Status", icon: PerformanceIcon, href: "/dashboard/performance" },
  // { label: "Documents", icon: DocumentsIcon, href: "/dashboard/documents" },
];

const BOTTOM_ITEMS = [
  { label: "Operations", icon: OperationsIcon },
  { label: "Analytics", icon: AnalyticsIcon },
  { label: "Setting", icon: SettingIcon },
];

export default function Sidebar() {
  return (
    <div className="h-screen flex flex-col justify-between">
      <div>
        <div className="px-4 py-5 flex items-center gap-3">
          <Image src={MoondiveAdmin} alt="Moondive Admin" />
        </div>
        <nav className="px-2 py-4">
          <ul className="space-y-0">
            {TOP_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Image src={item.icon} alt={item.label} width={18} height={18} />
                  <span className="text-primaryText font-medium text-sm">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="px-2 py-6">
        <ul className="space-y-1">
          {BOTTOM_ITEMS.map((item) => (
            <li key={item.label}>
              <Link
              href={`/dashboard/${item.label.toLowerCase()}`}
                className={`flex items-center gap-3 px-4 py-2 text-sm rounded-md "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Image src={item.icon} alt={item.label} width={18} height={18} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
