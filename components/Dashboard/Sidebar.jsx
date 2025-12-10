"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MoondiveAdmin from "../../public/Dashboard/MoondiveAdmin.png";

export default function Sidebar({ topItems = [], bottomItems = [] }) {
  const pathname = usePathname();
const isLinkActive = (href) => {
  if (!href) return false;

  const path = pathname.replace(/\/$/, "");
  const cleanHref = href.replace(/\/$/, "");

  const exactDashboardRoutes = [
    "/crm/dashboard",
    "/hrms/dashboard",
    "/cms/dashboard",
  ];

  if (exactDashboardRoutes.includes(cleanHref)) {
    return path === cleanHref;
  }

  return path === cleanHref || path.startsWith(`${cleanHref}/`);
};

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col ">
        <div className="px-4 py-5 flex items-center gap-3">
          <Image src={MoondiveAdmin} alt="Moondive Admin" />
        </div>

        <nav className="px-2 pb-4 flex-1 min-h-0 overflow-y-auto hide-scrollbar">
          <ul className="space-y-0">
            {topItems.map((item) => {
              const isActive = isLinkActive(item.href);

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm rounded-md transition
                      ${
                        isActive
                          ? "bg-gray-100 text-primaryText font-semibold border-l-4 border-primary"
                          : "text-primaryText hover:bg-gray-100 "
                      }
                    `}
                  >
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={18}
                      height={18}
                    />
                    <span className="text-primaryText text-sm">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="px-2 py-4 border-t border-gray-100">
        <ul className="space-y-1">
          {bottomItems.map((item) => {
            const href = item.href || `/dashboard/${item.label.toLowerCase()}`;
            const isActive = isLinkActive(href);

            return (
              <li key={item.label}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-4 py-2 text-sm rounded-md transition
                    ${
                      isActive
                        ? "bg-gray-100 text-primaryText font-semibold border-l-4 border-primary"
                        : "text-primaryText hover:bg-gray-100 "
                    }
                  `}
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={18}
                    height={18}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
