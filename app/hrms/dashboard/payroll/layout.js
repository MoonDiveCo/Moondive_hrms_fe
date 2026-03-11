'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Salary Structures', href: '/hrms/dashboard/payroll/salary-structures' },
  { label: 'Payslips',          href: '/hrms/dashboard/payroll/payslips' },
  { label: 'Custom Templates',  href: '/hrms/dashboard/payroll/custom-templates' },
];

export default function PayrollLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sub-navigation tabs */}
      <div className="border-b border-gray-200 bg-white px-6 flex-shrink-0">
        <nav className="flex gap-1 -mb-px">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#FF7B30] text-[#FF7B30]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
