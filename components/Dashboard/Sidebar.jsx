"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MoondiveAdmin from "../../public/Dashboard/MoondiveAdmin.png";
import MoondiveAdminMobileLogo from  "../../public/Dashboard/MoondiveMobileLogo.svg";

export default function Sidebar({
  topItems = [],
  bottomItems = [],
  collapsed = false,
}) {
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

  const linkLayoutClass = (isActive) => {
    const layout = collapsed ? "justify-center gap-0" : "justify-start gap-3";
    const activeStyles = isActive && !collapsed
      ? "bg-gray-100 text-primaryText font-semibold border-l-4 border-primary"
      : isActive && collapsed
      ? "bg-gray-100 text-primaryText font-semibold border-l-4 border-primary"
      : "text-primaryText hover:bg-gray-100";

    return `flex items-center ${layout} px-3 py-3 text-sm rounded-md transition ${activeStyles}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col relative">
        <div className={`px-2 py-3 ${collapsed?"mx-auto":"mx-0"} flex items-center gap-3`}>
          <div className="flex items-center gap-3 ">
            <div className="flex items-center">
             { collapsed ? (
               <Image
                 src={MoondiveAdminMobileLogo}
                 alt="Moondive Admin"
                 width={36}
                 height={36}
                 className="object-contain"
               />
             ) : (
               <Image
                 src={MoondiveAdmin}
                 alt="Moondive Admin"
                 width={160}
                 height={36}
                 className="object-contain"
               />
             )}
            </div>
          </div>
        </div>

        <nav className="px-1 pb-4 flex-1 min-h-0 overflow-y-auto hide-scrollbar">
          <ul className="space-y-0">
            {topItems.map((item) => {
              const isActive = isLinkActive(item.href);
              return (
                <li key={item.label}>
                  <Link href={item.href} title={item.label} className={linkLayoutClass(isActive)}>
                    <div className="flex-shrink-0">
                      <Image src={item.icon} alt={item.label} width={18} height={18} />
                    </div>

                    {/* DO NOT render label when collapsed so it takes no width */}
                    {!collapsed && (
                      <span className="text-primaryText text-sm transition-all duration-150">
                        {item.label}
                      </span>
                    )}
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
                <Link href={href} title={item.label} className={linkLayoutClass(isActive)}>
                  <div className="flex-shrink-0">
                    <Image src={item.icon} alt={item.label} width={18} height={18} />
                  </div>

                  {!collapsed && (
                    <span className="transition-all duration-150">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
