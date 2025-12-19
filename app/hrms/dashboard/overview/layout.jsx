"use client";

import { usePathname, useRouter } from "next/navigation";

const OVERVIEW_TABS = [
  { label: "MySpace", path: "/hrms/dashboard/overview/myspace" },
  { label: "Department", path: "/hrms/dashboard/overview/department" },
  { label: "Approval", path: "/hrms/dashboard/overview/approval" },
];

export default function OverviewLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div>
      {/* OVERVIEW SUB TABS */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-8">
          {OVERVIEW_TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.path);

            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={`py-3 text-sm font-medium ${
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-gray-500 hover:text-[var(--color-primary)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB PAGE CONTENT */}
      <div className="p-6">{children}</div>
    </div>
  );
}
