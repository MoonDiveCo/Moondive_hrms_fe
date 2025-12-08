"use client";
import React, { createContext, useContext, useMemo } from "react";
import OverviewIcon from "../public/Dashboard/Overview.png";
import CandidateIcon from "../public/Dashboard/Candidate.png";
import LeaveTrackerIcon from "../public/Dashboard/LeaveTracker.png";
import AttendanceIcon from "../public/Dashboard/Attendance.png";
import TimeTrackerIcon from "../public/Dashboard/TimeTracker.png";
import PerformanceIcon from "../public/Dashboard/Performance.png";
import DocumentsIcon from "../public/Dashboard/Documents.png";
import OperationsIcon from "../public/Dashboard/Operations.png";
import AnalyticsIcon from "../public/Dashboard/Analytics.png";
import SettingIcon from "../public/Dashboard/Setting.png";
const MenuContext = createContext(null);
export function MenuProvider({ children }) {
  const menus = useMemo(() => {
    const HRMS = {
      top: [
        { label: "HR Overview", icon: OverviewIcon, href: "/hrms/dashboard" },
        { label: "Employees", icon: CandidateIcon, href: "/hrms/employees" },
        { label: "Leave Tracker", icon: LeaveTrackerIcon, href: "/hrms/leave-tracker" },
        { label: "Attendance", icon: AttendanceIcon, href: "/hrms/attendance" },
        { label: "Time Tracker", icon: TimeTrackerIcon, href: "/hrms/time-tracker" },
        { label: "Performance", icon: PerformanceIcon, href: "/hrms/performance" },
        { label: "Documents", icon: DocumentsIcon, href: "/hrms/documents" },
      ],
      bottom: [
        { label: "Operations", icon: OperationsIcon, href: "/hrms/operations" },
        { label: "Analytics", icon: AnalyticsIcon, href: "/hrms/analytics" },
        { label: "Settings", icon: SettingIcon, href: "/hrms/settings" },
      ]
    };

    const CRM = {
      top: [
        { label: "Overview", icon: OverviewIcon, href: "/crm/dashboard" },
        { label: "Leads", icon: CandidateIcon, href: "/crm/dashboard/leads" },
        { label: "In Process", icon: LeaveTrackerIcon, href: "/crm/dashboard/InProcess" },
        { label: "Meeting Scheduling", icon: AttendanceIcon, href: "/crm/dashboard/meetings" },
        { label: "Final Scheduling", icon: TimeTrackerIcon, href: "/crm/dashboard/final-schedule" },
        { label: "Win/Lose Status", icon: PerformanceIcon, href: "/crm/dashboard/status" },
    
      ],
      bottom: [
        { label: "Operations", icon: OperationsIcon, href: "/crm/dashboard/operations" },
        { label: "Analytics", icon: AnalyticsIcon, href: "/crm/dashboard/analytics" },
        { label: "Settings", icon: SettingIcon, href: "/crm/dashboard/settings" },
      ]
    };

    const CMS = {
      top: [
        { label: "Overview", icon: OverviewIcon, href: "/cms/dashboard" },
        { label: "Manage Blog", icon: DocumentsIcon, href: "/cms/dashboard/manage-blog" },
        { label: "Manage Testimonials", icon: DocumentsIcon, href: "/cms/dashboard/manage-testimonials" },
        { label: "Manage Case Studies", icon: DocumentsIcon, href: "/cms/dashboard/manage-case-studies" },
        { label: "Manage Comparisions", icon: DocumentsIcon, href: "/cms/dashboard/manage-comparisons" },
        { label: "Manage Summaries", icon: DocumentsIcon, href: "/cms/dashboard/manage-summaries" },
        { label: "Manage Industries", icon: DocumentsIcon, href: "/cms/dashboard/manage-industries" },
        { label: "Website Meta SEO", icon: DocumentsIcon, href: "/cms/dashboard/website-meta-seo" },
        { label: "AI Content Performance", icon: DocumentsIcon, href: "/cms/dashboard/ai-content-performance" },
        { label: "Inventory Management", icon: DocumentsIcon, href: "/cms/dashboard/inventory-management" },
      ],
      bottom: [{ label: "Settings", icon: SettingIcon, href: "/cms/settings" }]
    };

    return { hrms: HRMS, crm: CRM, cms: CMS, default: CRM };
  }, []);

  return <MenuContext.Provider value={menus}>{children}</MenuContext.Provider>;
}
export function useMenus() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenus must be used within MenuProvider");
  return ctx;
}
