"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MANAGE_ACCOUNTS_HEADER, LEAVE_TRACKER_HEADER } from "@/constants/NestedDashboard";
import { DASHBOARD_HEADERS } from "@/constants/NestedDashboard";


export default function NestedAppLayout({ children }) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
 const serviceKey = parts[3];
  const headerKey = parts[4];
  const headerList = DASHBOARD_HEADERS[serviceKey] || [];

  const activeHeader =
    headerList.find((h) => h.key === headerKey) || headerList[0];
const showSidebar = activeHeader?.layoutType === "SIDEBAR";

  return (
    <div className="px-6 md:px-8 py-6 hide-scrollbar  w-full h-full ">
      <div className=" flex flex-col gap-4">
        <div className="bg-white rounded-2xl border-[0.5px] border-[#D0D5DD] p-4 overflow-auto sticky top-0">
          <div className="flex items-center justify-between ">
            <div >
              <h3 className="text-lg font-medium text-gray-900">
                {activeHeader.label}
              </h3>

              <ul className="mt-2 flex items-center gap-5 text-sm font-normal text-[#464F60]">
                {headerList.map((header) => {
                  const isActive = header.key === activeHeader.key;
                  const defaultSection = header.sections[0];
                  
                  const href = activeHeader?.layoutType === "SIDEBAR"?`${header.basePath}/${defaultSection.slug}`:`${header.basePath}`;

                  return (
                    <li
                      key={header.key}
                      className="pr-2 border-gray-300"
                    >
                      <Link
                        href={href}
                        className={
                          isActive
                            ? "text-primary font-semibold border-b-2 border-primary pb-2"
                            : "text-primaryText hover:text-primary"
                        }
                      >
                        {header.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex-1 flex gap-6">
          {showSidebar &&(<aside className="w-64 sticky top-30 overflow-auto">
            <div className="bg-white h-full rounded-2xl border-[0.3px] border-[#D0D5DD] p-4">
              <ul className="space-y-0 text-sm sticky">
                {activeHeader.sections.map((section) => {
                  const href = `${activeHeader.basePath}/${section.slug}`;
                  const isActive = pathname.startsWith(href);

                  return (
                    <li key={section.slug}>
                      <Link
                        href={href}
                        className={`block px-3 py-2 rounded text-primaryText  ${
                          isActive
                            ? "bg-gray-100 font-semibold"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-sm">
                          {section.label}
                        </span>
                        
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>)}

          <section className="flex-1 hide-scrollbar overflow-auto sticky top-30 h-[calc(100vh-15rem)]">{children}</section>
        </div>
      </div>
    </div>
  );
}
