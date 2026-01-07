'use client';

import React, { createContext, useContext, useMemo } from 'react';

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
import SeoIcon from "@/public/CMS/CMSSeo.svg"
import InventoryManagement from "@/public/CMS/CMSInventoryManagement.svg"
import Industry from "@/public/CMS/CMSIndustry.svg"
import GenAI from "@/public/CMS/CMSGenAI.svg"
import CaseStudies from "@/public/CMS/CMSCaseStudies.svg"
import Testimonial from "@/public/CMS/CMSTestimonial.svg"
import Blog from "@/public/CMS/CMSBlog.svg"
import Comparisons from "@/public/CMS/CMSComparisons.svg"
import Summaries from "@/public/CMS/CMSSummaries.svg"
import ContentPerformance from "@/public/CMS/CMSContentPerformace.svg"
import { Menu } from 'lucide-react';
import { AuthContext } from '@/context/authContext';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const menus = useMemo(() => {


    const sidebarObject = {
      "HRMS:HRMS_OVERVIEW:VIEW": { label: "Overview", icon: CandidateIcon, href: "/hrms/dashboard/overview", position: "top" },
      "HRMS:EMPLOYES:VIEW": { label: "Employees", icon: CandidateIcon, href: "/hrms/dashboard/employees", position: "top" },
      // "HRMS:LEAVE_TRACKER:VIEW": { label: "Leave Tracker", icon: LeaveTrackerIcon, href: "/hrms/dashboard/leave-tracker", position: "top" },
      "HRMS:PROJECTS:VIEW":{label:"Projects",icon:OverviewIcon,href:"/hrms/dashboard/projects",position:"top"},
      "HRMS:ATTENDANCE:VIEW": { label: "Attendance", icon: AttendanceIcon, href: "/hrms/dashboard/attendance/list", position: "top" },
      "HRMS:TIME_TRACKER:VIEW": { label: "Time Tracker", icon: TimeTrackerIcon, href: "/hrms/dashboard/time-tracker", position: "top" },
      "HRMS:COMPANY_POLICY:VIEW": { label: "Organization Policy", icon: TimeTrackerIcon, href: "/hrms/dashboard/organizationpolicy", position: "top" },
      "HRMS:PERFORMANCE:VIEW": { label: "Performance", icon: PerformanceIcon, href: "/hrms/dashboard/performance", position: "top" },
      "HRMS:DOCUMENTS:VIEW": { label: "Documents", icon: DocumentsIcon, href: "/hrms/dashboard/documents", position: "top" },
      "CMS:CMS_OVERVIEW:VIEW": { label: "Overview", icon: OverviewIcon, href: "/cms/dashboard", position: "top" },
      "CMS:BLOGS:VIEW": { label: "Blogs", icon: Blog, href: "/cms/dashboard/blogs", position: "top" },
      "CMS:TESTIMONIALS:VIEW": {
        label: "Testimonials",
        icon: Testimonial,
        href: "/cms/dashboard/testimonials",
        position: "top"
      },
      "CMS:CASE_STUDIES:VIEW":{
              label: "Case Studies",
              icon: CaseStudies,
              href: "/cms/dashboard/case-studies",
              position: "top"
      },
      "CMS:COMPARISIONS:VIEW":{
              label: "Comparisions",
              icon: Comparisons,
              href: "/cms/dashboard/comparisons",
              position: "top"
      },
      "CMS:SUMMARIES:VIEW":{
              label: "Summaries",
              icon: Summaries,
              href: "/cms/dashboard/summaries",
              position: "top"
            },
      "CMS:INDUSTARIES:VIEW":{
              label: "Industries",
              icon: Industry,
              href: "/cms/dashboard/industries",
              position: "top"
      },
      "CMS:WEBSITE_SEO_VIEW":{
              label: "Website Meta SEO",
              icon: SeoIcon,
              href: "/cms/dashboard/website-meta-seo",
              position: "top"
            },
      "CMS:CONTENT_PERFORMANCE:VIEW":{
        label: "Content Performance",
        icon: ContentPerformance,
        href: "/cms/dashboard/ai-content-performance", 
        position: "top"
      },
      "CMS:GENAI_VISIBILITY:VIEW":{
              label: "Gen AI Visibility",
              icon: GenAI,
              href: "/cms/dashboard/gen-ai-visibility",
              position: "top"
      },
      "CMS:INVENTORY:VIEW":{
              label: "Inventory Management",
              icon: InventoryManagement,
              href: "/cms/dashboard/inventory-management",
              position: "top"
      },
      "CRM:CRM_OVERVIEW:VIEW":{ label: "Overview", icon: OverviewIcon, href: "/crm/dashboard",position: "top" },
      "CRM:SALES:VIEW":{
              label: "Sales Dashboard",
              icon: OverviewIcon,
              href: "/crm/dashboard/sales",
              position: "top"
            },
      "CRM:LEADS:VIEW":{
              label: "Leads",
              icon: CandidateIcon,
              href: "/crm/dashboard/leads",
              position: "top"
            },
      "CRM:IN_PROCESS:VIEW":{
              label: "In Process",
              icon: LeaveTrackerIcon,
              href: "/crm/dashboard/InProcess",
              position: "top"
        },
      "CRM:MEETING_SCHEDULE:VIEW":{
              label: "Meeting Scheduled",
              icon: AttendanceIcon,
              href: "/crm/dashboard/MeetingSchedule",
              position: "top"
        },
      "CRM:FINALISED:":{
              label: "Finalised",
              icon: TimeTrackerIcon,
              href: "/crm/dashboard/Finalised",
              position: "top"
            },


    "HRMS:OPERATIONS:VIEW": { label: "Operations", icon: OperationsIcon, href: "/hrms/dashboard/operations", position: "bottom" },
      "HRMS:ANALYTICS:VIEW": { label: "Analytics", icon: AnalyticsIcon, href: "/hrms/dashboard/analytics", position: "bottom" },
      "HRMS:SETTINGS:VIEW": { label: "Settings", icon: SettingIcon, href: "/hrms/dashboard/settings", position: "bottom" },

    }

    const AdditionalPermittedMenu = {
      "/hrms/dashboard":"HRMS:HRMS_OVERVIEW:VIEW",
      "/hrms/dashboard/overview/myspace":"HRMS:HRMS_OVERVIEW:VIEW",
      "/hrms/dashboard/overview/department":"HRMS:HRMS_OVERVIEW:VIEW",
      "/hrms/dashboard/operations/manage-accounts/":"HRMS:MANAGE_ACCOUNT:VIEW",
      "/hrms/dashboard/operations/shift":"HRMS:SHIFT:VIEW",
      "/hrms/dashboard/attendance/tabular":"HRMS:ATTENDANCE:VIEW",
      "/hrms/dashboard/attendance/calendar":"HRMS:ATTENDANCE:VIEW",
      "/hrms/dashboard/operations/accounts":"CRM:ACCOUNTS:VIEW",
      "/hrms/dashboard/operations/timeTracker":"HRMS:TIME_TRACKER:VIEW",
      "/hrms/dashboard/operations/leave-tracker/leave-policy":"HRMS:LEAVE:VIEW",
      "/hrms/dashboard/operations/leave-tracker/employment-group":"HRMS:LEAVE:VIEW",
      "/hrms/dashboard/operations/leave-tracker/leave-calender":"HRMS:LEAVE:VIEW",
      "/hrms/dashboard/operations/employeeInfo":"HRMS:EMPLOYEE:VIEW",
    }


    // const rules = [];
    // Object.entries(MENU).forEach(([moduleName, roles]) => {
    //   Object.entries(roles).forEach(([roleName, menuObj]) => {
    //     const requiredPermissionPrefixes =
    //       roleName === "SUPER_ADMIN"
    //         ? ["*"]
    //         : [`${moduleName}:${roleName}`];

    //     rules.push({
    //       requiredPermissionPrefixes,
    //       menu: menuObj,
    //       module: moduleName,
    //     });
    //   });
    // });

    const routePermissionMap = buildRoutePermissionMap(sidebarObject, AdditionalPermittedMenu);

    return {
      // rules,
      sidebarObject,
      routePermissionMap
    };
  }, []);

  return <MenuContext.Provider value={menus}>{children}</MenuContext.Provider>;
}

const buildRoutePermissionMap = (
  sidebarObject,
  AdditionalPermittedMenu = {}
) => {
  const map = {};

  Object.entries(sidebarObject).forEach(([permissionKey, item]) => {
    const { href } = item;

    if (!map[href]) {
      map[href] = new Set();
    }

    const parts = permissionKey.split(":");
    const normalizedPermission = `${parts[0]}:${parts[1]}`;

    map[href].add(normalizedPermission);
  });

  Object.entries(AdditionalPermittedMenu).forEach(([route,permKey]) => {
    const [module, role] = permKey.split(":");
    const permission = `${module}:${role}`;

    if (!map[route]) {
      map[route] = new Set();
    }

    if (route.includes("manage-accounts")) {
      map[route].add("HRMS:MANAGE_ACCOUNT");
    }

    map[route].add(permission);
  });

  Object.keys(map).forEach((k) => {
    map[k] = Array.from(map[k]);
  });

  return map;
};

export function useMenus() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenus must be used within MenuProvider');
  return ctx;
}

