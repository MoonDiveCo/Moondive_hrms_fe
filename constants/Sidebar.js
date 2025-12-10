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

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const menus = useMemo(() => {
    const MENU = {
      HRMS: {
        SUPER_ADMIN: {
          top: [
            { label: "Manage Accounts", icon: OverviewIcon, href: "/hrms/dashboard/manage-accounts/organization/organization-details" },
            { label: "Employees", icon: CandidateIcon, href: "/hrms/dashboard/employees" },
            { label: "Leave Tracker", icon: LeaveTrackerIcon, href: "/hrms/dashboard/leave-tracker" },
            { label: "Attendance", icon: AttendanceIcon, href: "/hrms/dashboard/attendance" },
            { label: "Time Tracker", icon: TimeTrackerIcon, href: "/hrms/dashboard/time-tracker" },
            { label: "Performance", icon: PerformanceIcon, href: "/hrms/dashboard/performance" },
            { label: "Documents", icon: DocumentsIcon, href: "/hrms/dashboard/documents" },
          
          ],
          bottom: [
  { label: "Operations", icon: OperationsIcon, href: "/hrms/dashboard/operations" },
            { label: "Analytics", icon: AnalyticsIcon, href: "/hrms/dashboard/analytics" },
            { label: "Settings", icon: SettingIcon, href: "/hrms/dashboard/settings" },
          ],
        },
        EMPLOYEE: {
          top: [],

          bottom: [],
        },
        HR: {
          top: [],
          bottom: [],
        },
      },

      CMS: {
        SUPER_ADMIN: {
          top: [
            { label: "Overview", icon: OverviewIcon, href: "/cms/dashboard" },
            {
              label: "Blogs",
              icon: Blog,
              href: "/cms/dashboard/blogs",
            },
            {
              label: "Testimonials",
              icon: Testimonial,
              href: "/cms/dashboard/testimonials",
            },
            {
              label: "Case Studies",
              icon: CaseStudies,
              href: "/cms/dashboard/case-studies",
            },
            {
              label: "Comparisions",
              icon: Comparisons,
              href: "/cms/dashboard/comparisons",
            },
            {
              label: "Summaries",
              icon: Summaries,
              href: "/cms/dashboard/summaries",
            },
            {
              label: "Industries",
              icon: Industry,
              href: "/cms/dashboard/industries",
            },
            {
              label: "Website Meta SEO",
              icon: SeoIcon,
              href: "/cms/dashboard/website-meta-seo",
            },
            {
              label: "Content Performance",
              icon: ContentPerformance,
              href: "/cms/dashboard/ai-content-performance",
            },
            {
              label: "Gen AI Visibility",
              icon: GenAI,
              href: "/cms/dashboard/gen-ai-visibility",
            },
            {
              label: "Inventory Management",
              icon: InventoryManagement,
              href: "/cms/dashboard/inventory-management",
            },
          ],
          bottom: [],
        },

        ADMIN: {
          top: [
             {
              label: "Inventory Management",
              icon: InventoryManagement,
              href: "/cms/dashboard/inventory-management",
            },
          ],
          bottom: [],
        },

        CONTENT_WRITER: {
          top: [],
          bottom: [],
        },
      },

      CRM: {
        SALES: {
          top: [
           
          ],
          bottom: [],
        },
        ACCOUNTS: {
          top: [{ label: "Manage Leads", icon: CandidateIcon, href: "/crm/dashboard/leads" }],
          bottom: [],
        },
             SUPER_ADMIN:{
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
    { label: "Gen AI Visibility", icon: DocumentsIcon, href: "/cms/dashboard/gen-ai-visibility" },
    { label: "Inventory Management", icon: DocumentsIcon, href: "/cms/dashboard/inventory-management" },
  ],
          bottom: [] },
      },
    };

    const rules = [];
Object.entries(MENU).forEach(([moduleName, roles]) => {
  Object.entries(roles).forEach(([roleName, menuObj]) => {
    const requiredPermissionPrefixes =
      roleName === "SUPER_ADMIN"
        ? ["*"] 
        : [`${moduleName}:${roleName}`];

        rules.push({
          requiredPermissionPrefixes,
          menu: menuObj,
          module: moduleName,
        });
      });
    });

    return {
      rules,
      menus: MENU,
    };
  }, []);

  return <MenuContext.Provider value={menus}>{children}</MenuContext.Provider>;
}

export function useMenus() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenus must be used within MenuProvider');
  return ctx;
}
