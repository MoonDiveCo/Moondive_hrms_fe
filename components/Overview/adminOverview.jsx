'use client';

import React from 'react';
import {
  Bell,
  Users,
  UserPlus,
  TrendingUp,
  X,
  Check,
  Clock,
} from 'lucide-react';

export default function OverviewPage() {
  return (
    <div className='min-h-screen text-slate-900'>
      <main className='mx-auto px-6 py-8'>
        {/* ================= POLICY BANNER ================= */}
        <div className='border border-orange-400 bg-orange-50 rounded-xl p-4 flex items-center justify-between mb-8'>
          <p className='text-sm'>
            <span className='font-bold text-orange-500'>Policy Update:</span>{' '}
            New Remote Work Guidelines are now available.
          </p>
          <button className='text-sm font-semibold text-orange-500 hover:underline'>
            View Details
          </button>
        </div>

        {/* ================= DASHBOARD GRID ================= */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* ================= LEFT SIDE ================= */}
          <div className='lg:col-span-8 space-y-10'>
            {/* ORGANIZATION PULSE */}
            <section>
              <h3 className='text-2xl font-bold mb-3'>Organization Pulse</h3>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl'>
                <StatRow
                  label='Total Employees'
                  value='124'
                  icon={<Users size={18} />}
                />

                <StatRow
                  label='On Leave'
                  value='8'
                  icon={<UserPlus size={18} />}
                  valueClass='text-red-500'
                />

                <StatRow
                  label='Online Now'
                  value='92'
                  icon={<Clock size={18} />}
                  valueClass='text-green-600'
                />

                <StatRow
                  label='Late Check-in'
                  value='6'
                  icon={<Clock size={18} />}
                  valueClass='text-amber-600'
                />

                <StatCard
                  title='New Joiners'
                  value='3'
                  icon={<UserPlus size={18} />}
                />

                <StatCard
                  title='Attendance Rate'
                  value='96%'
                  icon={<TrendingUp size={18} />}
                  highlight
                />
              </div>
            </section>

            {/* WEEKLY ATTENDANCE */}
            <WeeklyAttendance />

            {/* PENDING LEAVES */}
            <section>
              <div className='flex justify-between mb-4'>
                <h3 className='text-lg font-bold'>Pending Leave Requests</h3>
                <button className='text-sm text-orange-500 font-semibold'>
                  View All
                </button>
              </div>

              <div className='bg-white border rounded-2xl divide-y'>
                <LeaveRow name='Sarah Jenkins' info='Sick Leave • Today' />
                <LeaveRow
                  name='Michael Chen'
                  info='Personal Leave • Dec 12 - 14'
                />
                <LeaveRow name='Anita Lopez' info='Vacation • Jan 02 - 10' />
              </div>
            </section>
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <aside className='lg:col-span-4'>
            <div className='bg-white border rounded-2xl p-6 sticky top-40'>
              <h3 className='text-xs uppercase font-semibold text-slate-400 mb-6'>
                Recent Activity
              </h3>

              <ul className='border-l pl-6 space-y-6'>
                <Activity
                  text='Sarah Jenkins joined the Marketing team.'
                  time='2h ago'
                  active
                />
                <Activity
                  text='Monthly Payroll generated successfully.'
                  time='5h ago'
                />
                <Activity
                  text='Updated Q4 Goals for the Design department.'
                  time='Yesterday at 4:30 PM'
                />
              </ul>

              <div className='text-center mt-6'>
                <button className='text-sm text-slate-400 hover:text-orange-500'>
                  Load More Activity
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ================= COMPONENTS ================= */

const StatRow = ({ label, value, icon, valueClass = '' }) => (
  <div className='bg-white border rounded-xl p-4 flex justify-between items-center '>
    <div className='flex items-center gap-3'>
      {icon}
      <span className='font-semibold text-sm'>{label}</span>
    </div>
    <span className={`font-bold text-lg ${valueClass}`}>{value}</span>
  </div>
);

const StatCard = ({ title, value, icon, highlight }) => (
  <div className='bg-white border rounded-xl p-4'>
    <div className='flex justify-between text-sm font-semibold mb-2'>
      {title}
      {icon}
    </div>
    <div className={`text-2xl font-bold ${highlight ? 'text-orange-500' : ''}`}>
      {value}
    </div>
  </div>
);

const WeeklyAttendance = () => {
  const data = [
    { day: 'M', value: 80 },
    { day: 'T', value: 85 },
    { day: 'W', value: 100, active: true },
    { day: 'T', value: 70 },
    { day: 'F', value: 88 },
  ];

  return (
    <section className='bg-white border rounded-2xl  max-w-4xl p-6'>
      <div className='flex items-start justify-between mb-8'>
        <div>
          <h3 className='text-2xl font-bold'>Weekly Attendance</h3>
          <p className='text-slate-400 text-sm'>
            Snapshot of the last 5 working days
          </p>
        </div>

        <button className='flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium'>
          This Week
          <span className='text-slate-400'>▾</span>
        </button>
      </div>

      <div className='flex items-end justify-between px-8 h-48'>
        {data.map((item, idx) => (
          <div
            key={idx}
            className='flex flex-col items-center justify-end gap-3'
          >
            <div className='relative w-16 h-40 rounded-xl bg-slate-100 flex items-end overflow-hidden'>
              <div
                className={`w-full rounded-xl ${
                  item.active ? 'bg-[#162a2d]' : 'bg-[#5e888d]'
                }`}
                style={{ height: `${item.value}%` }}
              />
            </div>

            <span
              className={`text-sm font-medium ${
                item.active ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

const LeaveRow = ({ name, info }) => (
  <div className='p-4 flex justify-between  max-w-4xl items-center'>
    <div>
      <p className='font-semibold text-sm'>{name}</p>
      <p className='text-xs text-slate-400'>{info}</p>
    </div>
    <div className='flex gap-2'>
      <button className='h-8 w-8 border rounded-full flex items-center justify-center'>
        <X size={14} />
      </button>
      <button className='h-8 w-8 bg-orange-500 text-white rounded-full flex items-center justify-center'>
        <Check size={14} />
      </button>
    </div>
  </div>
);

const Activity = ({ text, time, active }) => (
  <li className='relative'>
    <span
      className={`absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full ${
        active ? 'bg-orange-500' : 'bg-slate-300'
      }`}
    />
    <p className='text-sm'>{text}</p>
    <span className='text-xs text-slate-400'>{time}</span>
  </li>
);

