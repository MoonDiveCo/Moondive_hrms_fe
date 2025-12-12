'use client';

import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';



const Icon = ({ name }) => {
  const stroke = 'currentColor';
  switch (name) {
    case 'onboarding':
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="6" width="18" height="12" rx="2" stroke={stroke} strokeWidth="1.6" />
          <path d="M8 9h8M8 13h8" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'leave':
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 2v4M18 2v4M3 10h18M7 14l3 3 7-7" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'performance':
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 17v2h18v-2" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 12l3-4 4 6 5-8" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'files':
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2v6h6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'time':
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.6" />
          <path d="M12 7v6l4 2" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'tasks':
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M9 11l2 2 4-4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'approvals':
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 7h18M7 21V7" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 14l2 2 4-4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'employee':
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="8" r="3" stroke={stroke} strokeWidth="1.6" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
  }
};

function ServiceCard({ title, subtitle, icon, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={
        'group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white  shadow-md hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ' +
        className
      }
      aria-label={title}
      title={title}
      type="button"
    >
      <div className="text-primary">
        <Icon name={icon} />
      </div>

      <div className="text-sm font-medium text-black">{title}</div>
      {subtitle && <div className="text-xs text-primaryText mt-0.5">{subtitle}</div>}
    </button>
  );
}

export default function Operations() {
  const [query, setQuery] = useState('');
    const router = useRouter()

  const popular = useMemo(
    () => [
      { id: 'onboarding', title: 'Onboarding', subtitle: '', icon: 'onboarding' },
      { id: 'leave-tracker/leave-policy', title: 'Leave Tracker', subtitle: '', icon: 'leave' },
      { id: 'performance', title: 'Performance', subtitle: '', icon: 'performance' },
      { id: 'hrletters', title: 'HR Letters', subtitle: '', icon: 'files' },
      { id: 'timetracker', title: 'Time Tracker', subtitle: '', icon: 'time' },
    ],
    []
  );

  const recentlyUsed = useMemo(
    () => [
      { id: 'tasks', title: 'Tasks', icon: 'tasks' },
      { id: 'files', title: 'Files', icon: 'files' },
      { id: 'approvals', title: 'Approvals', icon: 'approvals' },
    ],
    []
  );

  const allServices = useMemo(
    () => [
      { id: 'manage-accounts/organization/organization-details', title: 'Manage Accounts', icon: 'onboarding' },
      { id: 'employeeInfo', title: 'Employee Info', icon: 'employee' },
      { id: 'leave-tracker/leave-policy', title: 'Leave Tracker', icon: 'leave' },
      { id: 'attendance', title: 'Attendance', icon: 'time' },
      { id: 'shift', title: 'Shift', icon: 'employee' },
      { id: 'timeTracker', title: 'Time Tracker', icon: 'time' },
      { id: 'performance', title: 'Performance', icon: 'performance' },
      { id: 'filesAll', title: 'Files', icon: 'files' },
    ],
    []
  );

  function handleCardClick(id) {
    router.push(`/hrms/dashboard/operations/${id}`);
  }

  const filteredAll = allServices.filter((s) =>
    (s.title + (s.subtitle || '')).toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="container py-6 px-8 mx-auto bg-white">
      <section className="mb-8 px-8">
        <h5 className="text-base font-semibold text-blackText mb-4">Popular Services</h5>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {popular.map((s) => (
            <ServiceCard
              key={s.id}
              title={s.title}
              subtitle={s.subtitle}
              icon={s.icon}
              onClick={() => handleCardClick(s.id)}
            />
          ))}
        </div>
      </section>
      <section className="mb-8 px-8">
        <h5 className="text-base font-semibold text-blackText mb-4">Recently Used</h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {recentlyUsed.map((s) => (
            <ServiceCard key={s.id} title={s.title} icon={s.icon} onClick={() => handleCardClick(s.id)} />
          ))}
        </div>
      </section>
      <section className='px-8'>
        <h5 className="text-base font-semibold text-blackText mb-4">All Services</h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAll.length ? (
            filteredAll.map((s) => (
              <ServiceCard key={s.id} title={s.title} icon={s.icon} onClick={() => handleCardClick(s.id)} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-sm text-primaryText">No services found</div>
          )}
        </div>
      </section>
    </div>
  );
}
