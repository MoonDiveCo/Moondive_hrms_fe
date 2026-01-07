"use client";

import { usePathname, useRouter } from "next/navigation";

const OVERVIEW_TABS = [
  { label: "My Space", path: "/hrms/dashboard/overview/myspace" },
  { label: "Department", path: "/hrms/dashboard/overview/department" },
];

export default function OverviewLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div>
      {/* OVERVIEW SUB TABS */}
      <div className="bg-white px-6">
        <div className="flex gap-10">
          {OVERVIEW_TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.path);

            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={`relative py-3 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "text-[var(--color-primary)]"
                      : "text-gray-500 hover:text-[var(--color-primary)]"
                  }
                `}
              >
                {tab.label}

                {/* ACTIVE UNDERLINE */}
                {isActive && (
                  <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[var(--color-primary)] rounded-full"></span>
                )}
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
