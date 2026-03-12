'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FileText, Users, ClipboardList } from 'lucide-react';

const TABS = [
  { href: '/hrms/dashboard/hr-docs/templates', label: 'Templates', icon: FileText },
  { href: '/hrms/dashboard/hr-docs/employee-documents', label: 'Employee Documents', icon: Users },
  { href: '/hrms/dashboard/hr-docs/onboarding', label: 'Onboarding', icon: ClipboardList },
];

export default function HRDocsLayout({ children }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-6 pt-4">
        <div className="max-w-7xl mx-auto flex gap-1">
          {TABS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                  isActive
                    ? 'bg-gray-50 text-[#FF7B30] border border-gray-200 border-b-white -mb-px'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}
