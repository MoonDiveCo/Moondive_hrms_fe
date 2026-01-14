'use client';
import React, { useMemo, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { AuthContext } from '@/context/authContext';
import SubModuleProtectedRoute from '@/lib/routeProtection/SubModuleProtectedRoute';

/* ================= ICON MAP (Material Symbols) ================= */
const iconMap = {
  onboarding: 'account_balance_wallet',
  employee: 'badge',
  leave: 'event_busy',
  attendance: 'how_to_reg',
  time: 'avg_time',
  shift: 'pending_actions',
  performance: 'monitoring',
  files: 'payments',
  helpdesk: 'contact_support',
  settings: 'settings_account_box',
};

/* ================= SERVICE ITEM ================= */
function ServiceItem({ title, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        group flex flex-col items-center justify-center
        p-6 rounded-2xl cursor-pointer
        transition-all duration-300
        text-gray-600 hover:text-orange-600
        hover:-translate-y-1
      "
      type="button"
    >
      {/* ICON WRAPPER */}
      <div
        className="
          w-14 h-14 flex items-center justify-center
          rounded-2xl mb-3
          bg-orange-50
          group-hover:bg-orange-00
          transition-all duration-300
          shadow-sm group-hover:shadow-md
        "
      >
        <span
          className="
            material-symbols-outlined
            text-3xl
            text-primary
            group-hover:scale-110
            transition-transform duration-300
          "
        >
          {iconMap[icon] || 'apps'}
        </span>
      </div>

      {/* TITLE */}
      <span className="text-sm font-medium text-center">
        {title}
      </span>
    </button>
  );
}


/* ================= MAIN PAGE ================= */
export default function Operations() {
  const router = useRouter();
  const { allUserPermissions, user } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const userPermissions = [...allUserPermissions];

  const userRole = user?.userRole; 

  /* ================= SERVICES WITH ROLE-BASED ROUTES ================= */
  const allServices = useMemo(
    () => [
      {
        id: '/operations/manage-accounts/organization/organization-details',
        title: 'Manage Accounts',
        icon: 'onboarding',
        requiredPermissions: 'HRMS:MANAGE_ACCOUNT:VIEW',
      },
      {
        id: 'employees',
        title: 'Employee Info',
        icon: 'employee',
        requiredPermissions: 'HRMS:EMPLOYEE:VIEW',
      },
      {
        id: '/operations/leave-tracker/leave-policy',
        title: 'Leave Tracker',
        icon: 'leave',
        requiredPermissions: 'HRMS:LEAVE:VIEW',
      },
      {
        id: '/accounts',
        title: 'Accounts',
        icon: 'files',
        requiredPermissions: 'CRM:ACCOUNTS:VIEW',
      },
      {
        // For role-based routing, use an object with routes for each role
        id: {
          SuperAdmin: 'analytics?tab=absent',
          Employee: 'attendance/list',
          default: 'analytics?tab=absent',
        },
        title: 'Attendance',
        icon: 'attendance',
        requiredPermissions: 'HRMS:ATTENDANCE:VIEW',
      },
      {
        id: 'operations/shift',
        title: 'Shift',
        icon: 'shift',
        requiredPermissions: 'HRMS:SHIFT:VIEW',
      },
      {
        id: 'projects',
        title: 'Projects Tracker',
        icon: 'time',
        requiredPermissions: 'HRMS:TIME_TRACKER:VIEW',
      },
      {
        id: 'performance',
        title: 'Performance',
        icon: 'performance',
        requiredPermissions: 'HRMS:PERFORMANCE:VIEW',
      },
      {
        id: 'operations/hr-helpdesk',
        title: 'HR Helpdesk',
        icon: 'helpdesk',
        requiredPermissions: 'HRMS:HR HELPDESK:VIEW',
      },
    ],
    []
  );

  const meetRequiredPermission = (service) =>
    userPermissions.includes(service.requiredPermissions);

  const filteredAll = allServices.filter((s) =>
    s.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  /* ================= HANDLE CARD CLICK WITH ROLE-BASED ROUTING ================= */
  function handleCardClick(serviceId) {
    setLoading(true);

    let route;

    // Check if serviceId is an object (role-based routing)
    if (typeof serviceId === 'object' && serviceId !== null) {
      // Get route based on user role
      route =
        serviceId[userRole] || serviceId.default || Object.values(serviceId)[0];
    } else {
      // Regular string route
      route = serviceId;
    }

    router.push(`/hrms/dashboard/${route}`);
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className='fixed inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100 }}
        />
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <SubModuleProtectedRoute>
      <div className='px-6 pt-10 pb-12'>
        {/* HEADER */}
        <div className='text-center mb-12'>
          <h2 className='font-bold text-gray-900 mb-8 tracking-tight'>
            How can we help?
          </h2>
          <div className='relative max-w-2xl mx-auto group'>
            <span className='material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors'>
              search
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search for services, tools, or documents...'
              className='w-full pl-16 py-3 bg-gray-50 border border-transparent rounded-full text-lg placeholder-gray-400 transition-all shadow-sm group-hover:shadow-md focus:outline-none focus:border-primary'
            />
          </div>
        </div>

        {/* SERVICES GRID */}
        <div className='flex flex-wrap justify-center gap-x-12 gap-y-10'>
          {filteredAll.length ? (
            filteredAll.map(
              (service) =>
                meetRequiredPermission(service) && (
                  <ServiceItem
                    key={
                      typeof service.id === 'object'
                        ? service.title
                        : service.id
                    }
                    title={service.title}
                    icon={service.icon}
                    onClick={() => handleCardClick(service.id)}
                  />
                )
            )
          ) : (
            <div className='text-sm text-gray-400'>No services found</div>
          )}
        </div>

        {/* QUICK SHORTCUTS */}
        <div className='mt-12 text-center'>
          <p className='text-xs font-medium uppercase tracking-widest text-gray-400 mb-4'>
            Quick Shortcuts
          </p>
          <div className='flex justify-center gap-4'>
            <button className='px-4 py-2 text-sm text-gray-500 hover:text-primary bg-gray-50 rounded-full'>
              Recent Documents
            </button>
            <button className='px-4 py-2 text-sm text-gray-500 hover:text-primary bg-gray-50 rounded-full'>
              My Team
            </button>
            <button className='px-4 py-2 text-sm text-gray-500 hover:text-primary bg-gray-50 rounded-full'>
              Holiday Calendar
            </button>
          </div>
        </div>
      </div>
    </SubModuleProtectedRoute>
  );
}
