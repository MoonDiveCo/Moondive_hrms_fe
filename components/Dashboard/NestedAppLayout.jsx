"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MANAGE_ACCOUNTS_HEADER } from "@/constants/NestedDashboard";



export default function NestedAppLayout({ children }) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const headerKey = parts[3] || "users";

  const activeHeader =
    MANAGE_ACCOUNTS_HEADER.find((h) => h.key === headerKey) || MANAGE_ACCOUNTS_HEADER[0];

  return (
    <div className="px-6 md:px-8 py-6">
      <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 ">
        <div className="bg-white rounded-2xl border-[0.5px] border-[#D0D5DD] p-4 sticky top-0">
          <div className="flex items-center justify-between ">
            <div >
              <h3 className="text-lg font-medium text-gray-900">
                {activeHeader.label}
              </h3>

              <ul className="mt-2 flex items-center gap-5 text-sm font-normal text-[#464F60]">
                {MANAGE_ACCOUNTS_HEADER.map((header) => {
                  const isActive = header.key === activeHeader.key;
                  const defaultSection = header.sections[0];
                  const href = `${header.basePath}/${defaultSection.slug}`;

                  return (
                    <li
                      key={header.key}
                      className="pr-3 border-r last:border-r-0 border-gray-300"
                    >
                      <Link
                        href={href}
                        className={
                          isActive
                            ? "text-primary font-semibold"
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
        <div className="flex-1 flex gap-6 ">
          <aside className="w-64 sticky top-30 h-120">
            <div className="bg-white h-full rounded-2xl border-[0.3px] border-[#D0D5DD] p-4 overflow-auto">
              <ul className="space-y-3 text-sm">
                {activeHeader.sections.map((section) => {
                  const href = `${activeHeader.basePath}/${section.slug}`;
                  const isActive = pathname.startsWith(href);

                  return (
                    <li key={section.slug}>
                      <Link
                        href={href}
                        className={`block px-3 py-2 rounded text-primaryText ${
                          isActive
                            ? "bg-gray-100 font-semibold"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {section.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <section className="flex-1 overflow-auto sticky top-30 h-120">{children}</section>
        </div>
      </div>
    </div>
  );
}
