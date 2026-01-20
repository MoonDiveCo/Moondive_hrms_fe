'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Users,
  UserPlus,
  TrendingUp,
  X,
  Check,
  Clock,
} from 'lucide-react';
import { format, formatDistanceToNow, isSameDay, subDays } from 'date-fns';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import { useRouter } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import useSWR, { mutate } from "swr";

const fetcherWithAuth = async (url) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const UPCOMING_ACTIVITY_TYPES = [
  "UPCOMING_BIRTHDAY",
  "UPCOMING_HOLIDAY",
];

const ACTIVITY_CONFIG = {
  NEW_JOINER: {
    dot: "bg-primary",
  },
  BIRTHDAY: {
    dot: "bg-pink-500",
  },
  UPCOMING_BIRTHDAY: {
    dot: "bg-pink-300",
  },
  NEW_PROJECT: {
    dot: "bg-indigo-500",
  },
  HOLIDAY: {
    dot: "bg-green-500",
  },
  UPCOMING_HOLIDAY: {
    dot: "bg-green-300",
  },
  NEW_POLICY: {
    dot: "bg-amber-500",
  },
  LEAVE_APPROVED: {
    dot: "bg-blue-500",
  },
  DEFAULT: {
    dot: "bg-slate-300",
  },
};



const PULSE_CARDS = [
  {
    type: 'row',
    label: 'Total Employees',
    valueKey: 'totalEmployees',
    icon: <Users size={18} />,
    redirectTo: '/hrms/dashboard/employees',
  },
  {
    type: 'row',
    label: 'On Leave',
    valueKey: 'onLeave',
    icon: <UserPlus size={18} />,
    valueClass: 'text-red-500',
    redirectTo: '/hrms/dashboard/analytics?tab=leave',
  },
  {
    type: 'row',
    label: 'Online Now',
    valueKey: 'onlineNow',
    icon: <Clock size={18} />,
    valueClass: 'text-green-600',
    redirectTo: '/hrms/dashboard/analytics?tab=online',
  },
  {
    type: 'row',
    label: 'Late Check-in',
    valueKey: 'lateCheckIn',
    icon: <Clock size={18} />,
    valueClass: 'text-amber-600',
    redirectTo: '/hrms/dashboard/analytics?tab=late',
  },
  {
    type: 'card',
    title: 'New Joiners',
    valueKey: 'newJoiners',
    icon: <UserPlus size={18} />,
    redirectTo: '/hrms/dashboard/analytics?tab=new',
  },
  {
    type: 'card',
    title: 'Attendance Rate',
    valueKey: 'attendanceRate',
    valueFormatter: value => `${value}%`,
    icon: <TrendingUp size={18} />,
    highlight: true,
    redirectTo: '/hrms/dashboard/analytics?tab=absent',
  },
];



export default function OverviewPage() {
  // const [pulse, setPulse] = useState(null);
  // const [attendance, setAttendance] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [pendingLeaves, setPendingLeaves] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const router = useRouter()


  // useEffect(() => {
  //   async function fetchDashboard() {
  //     try {
  //       const [pulseRes, attendanceRes, leaveRes] = await Promise.all([
  //         axios.get('/hrms/organization/organization-pulse'),
  //         axios.get('/hrms/organization/attendance-insights'),
  //         axios.get("/hrms/leave/get-leave", {
  //           params: { year: new Date().getFullYear() },
  //         }),
  //       ]);

  //       setPulse(pulseRes.data);
  //       setAttendance(attendanceRes.data);
  //       setPendingLeaves(leaveRes.data?.leaveRequests)

  //     } catch (err) {
  //       console.error('Dashboard fetch failed', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchDashboard();
  // }, []);

  const { data: pulseRes, isLoading: pulseLoading } = useSWR(
    "/hrms/organization/organization-pulse",
    fetcherWithAuth,
    { refreshInterval: 10000 }
  );

  const { data: attendanceRes, isLoading: attendanceLoading } = useSWR(
    "/hrms/organization/attendance-insights",
    fetcherWithAuth,
    { refreshInterval: 10000 }
  );

  const { data: leaveRes } = useSWR(
    `/hrms/leave/get-leave?year=${new Date().getFullYear()}`,
    fetcherWithAuth,
    { refreshInterval: 10000 }
  );

  const pulse = pulseRes || {};
  const attendance = attendanceRes || {};
  const pendingLeaves = (leaveRes?.leaveRequests || []).filter(l => !l.decision);

  const loading = pulseLoading || attendanceLoading;


  if (loading) {
    return (
      <div className='absolute inset-0 z-20 flex items-center justify-center bg-black/5 backdrop-blur-sm rounded-2xl'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: 'center' }}
        />
      </div>
    )
  }

  // async function handleLeaveDecision(leaveId, action) {
  //   try {
  //     setProcessingId(leaveId);

  //     await axios.put("/hrms/leave/update-leave-decision", {
  //       leaveEntryId: leaveId,
  //       action,
  //       reason: `CEO ${action}`,
  //     });

  //     setPendingLeaves((prev) =>
  //       prev.filter((l) => l.leaveId !== leaveId)
  //     );
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setProcessingId(null);
  //     setConfirmAction(null);
  //   }
  // }

  async function handleLeaveDecision(leaveId, action) {
    try {
      setProcessingId(leaveId);

      await axios.put("/hrms/leave/update-leave-decision", {
        leaveEntryId: leaveId,
        action,
        reason: `CEO ${action}`,
      });

      await mutate("/hrms/leave/get-leave");
      await mutate("/hrms/organization/organization-pulse");
      await mutate("/hrms/organization/attendance-insights");
      await mutate((key) => key?.startsWith("/hrms/organization/analytics"));

    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
      setConfirmAction(null);
    }
  }


  return (
    <div className='min-h-screen text-slate-900'>
      <main className='mx-auto px-6 py-8'>

        {/* <div className='border border-orange-400 bg-orange-50 rounded-xl p-4 flex items-center justify-between mb-8'>
          <p className='text-sm'>
            <span className='font-bold text-orange-500'>Policy Update:</span>{' '}
            New Remote Work Guidelines are now available.
          </p>
          <button className='text-sm font-semibold text-orange-500 hover:underline'>
            View Details
          </button>
        </div> */}

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          <div className='lg:col-span-8 space-y-10'>

            <section>
              <h4 className='text-primaryText mb-3'>Organization Pulse</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl">
                {PULSE_CARDS.map((item, index) => {

                  const rawValue =
                    item.valueKey === 'attendanceRate'
                      ? attendance.today.attendanceRate
                      : pulse[item.valueKey];

                  const value = item.valueFormatter
                    ? item.valueFormatter(rawValue)
                    : rawValue;

                  if (item.type === 'row') {
                    return (
                      <StatRow
                        key={index}
                        label={item.label}
                        value={value}
                        icon={item.icon}
                        valueClass={item.valueClass}
                        redirectTo={item.redirectTo}
                      />
                    );
                  }

                  return (
                    <StatCard
                      key={index}
                      title={item.title}
                      value={value}
                      icon={item.icon}
                      highlight={item.highlight}
                      redirectTo={item.redirectTo}
                    />
                  );
                })}
              </div>

            </section>

            <WeeklyAttendance data={attendance.weeklyAttendance} totalEmployees={pulse.totalEmployees} />

            <section>
              <div className='flex justify-between mb-4'>
                <h4 className='text-primaryText'>Pending Leave Requests</h4>
                <button onClick={() => router.push("/hrms/dashboard/analytics?tab=leave")} className='text-sm cursor-pointer text-orange-500 font-semibold'>
                  View All
                </button>
              </div>

              <div className='bg-white border border-gray-300 rounded-2xl divide-y'>
                {pendingLeaves.length === 0 ? (
                  <div className='p-4 text-sm text-slate-400'>
                    No pending leave requests
                  </div>
                ) : (
                  pendingLeaves.slice(0, 3).map((leave) => (
                    <LeaveRow
                      key={leave.leaveId}
                      name={`${leave.employee.firstName} ${leave.employee.lastName}`}
                      info={`${leave.leaveType} • ${format(
                        new Date(leave.startDate),
                        "dd MMM"
                      )} • ${leave.isHalfDay
                        ? `Half Day (${leave.session})`
                        : 'Full Day'
                        }`}
                      loading={processingId === leave.leaveId}
                      onApprove={() =>
                        setConfirmAction({ leaveId: leave.leaveId, action: "Approved" })
                      }
                      onReject={() =>
                        setConfirmAction({ leaveId: leave.leaveId, action: "Rejected" })
                      }
                    />

                  ))
                )}
              </div>

            </section>
          </div>

          <aside className='lg:col-span-4'>
            <div className='bg-white border border-gray-300 rounded-2xl p-6 sticky top-30 max-h-[50vh] overflow-y-auto hide-scrollbar'>
              <h4 className='text-xs uppercase font-semibold text-slate-400 mb-6'>
                Activities
              </h4>

              {/* <ul className='border-l pl-6 space-y-6'>
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
              </ul> */}

              <ul className="border-l pl-6 space-y-6">
                {pulseRes?.activities?.map((a, i) => {
                  const isUpcoming = UPCOMING_ACTIVITY_TYPES.includes(a.type);

                  const timeLabel = isUpcoming
                    ? formatDistanceToNow(new Date(a.timestamp), { addSuffix: false })
                    : formatDistanceToNow(new Date(a.timestamp), { addSuffix: true });

                  return (
                    <Activity
                      key={i}
                      text={a.text}
                      time={isUpcoming ? `in ${timeLabel}` : timeLabel}
                      type={a.type}
                      active={i === 0}
                    />
                  );
                })}

              </ul>
            </div>
          </aside>
        </div>
      </main>

      {confirmAction && (
        <ConfirmLeaveActionModal
          action={confirmAction.action}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() =>
            handleLeaveDecision(
              confirmAction.leaveId,
              confirmAction.action,
            )
          }
        />
      )}

    </div>
  );
}


const StatRow = ({ label, value, icon, valueClass = '', redirectTo }) => {
  const router = useRouter()

  return (
    <div onClick={() => router.push(redirectTo)} className='bg-white border cursor-pointer border-gray-300 rounded-xl p-4 flex justify-between items-center'>
      <div className='flex text-primaryText items-center gap-3'>
        {icon}
        <span className='font-semibold text-sm text-primaryText'>{label}</span>
      </div>
      <span className={`font-bold text-lg ${valueClass}`}>{value}</span>
    </div>
  )
};

const StatCard = ({ title, value, icon, highlight, redirectTo }) => {
  const router = useRouter()
  return (
    <div onClick={() => router.push(redirectTo)} className='bg-white border cursor-pointer border-gray-300 rounded-xl p-4'>
      <div className='flex text-primaryText justify-between text-sm font-semibold mb-2'>
        {title}
        {icon}
      </div>
      <div className={`text-2xl font-bold ${highlight ? 'text-orange-500' : ''}`}>
        {value}
      </div>
    </div>
  )
};

const WeeklyAttendance = ({ data, totalEmployees }) => {
  const days = Array.from({ length: 7 })
    .map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const day = date.getDay();

      return {
        date,
        key: format(date, 'yyyy-MM-dd'),
        label: format(date, 'EEE'),
        present: 0,
        isToday: isSameDay(date, new Date()),
        isWeekend: day === 0 || day === 6,
      };
    })
    .filter(d => !d.isWeekend);

  const dataMap = {};
  data.forEach(d => {
    dataMap[d.date] = d.present;
  });

  const finalData = days.map(d => ({
    ...d,
    present: dataMap[d.key] ?? 0,
  }));

  const maxPresent = Math.max(...finalData.map(d => d.present), 1);

  return (
    <section className='bg-white border border-gray-300 rounded-2xl max-w-4xl p-6'>
      <div className='flex items-start justify-between mb-8'>
        <div>
          <h4 className='text-primaryText'>Weekly Attendance</h4>
          <p className='text-slate-400 text-sm'>
            Working days only
          </p>
        </div>

        <button className='bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium'>
          This Week
        </button>
      </div>

      <div className='flex items-end justify-between px-6 h-48'>
        {finalData.map(item => {
          const height = Math.round((item.present / totalEmployees) * 100);

          return (
            <div key={item.key} className='flex flex-col items-center gap-3'>
              <div className='relative w-14 h-40 bg-slate-100 rounded-xl flex items-end overflow-hidden'>
                <div
                  className={`w-full rounded-xl transition-all duration-300 ${item.isToday ? 'bg-[#162a2d]' : 'bg-[#5e888d]'
                    }`}
                  style={{ height: `${height}%` }}
                />
              </div>

              <span
                className={`text-sm font-medium ${item.isToday ? 'text-slate-900' : 'text-slate-400'
                  }`}
              >
                {item.label}
              </span>

              <span className='text-xs text-slate-400'>
                {item.present}
              </span>
            </div>
          );
        })}
      </div>

    </section>
  );
};


const LeaveRow = ({ name, info, onApprove, onReject, loading }) => (
  <div className="p-4 flex justify-between items-center relative">
    {loading && (
      <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl">
        <span className="text-sm text-gray-500">Processing…</span>
      </div>
    )}

    <div>
      <p className="font-semibold text-sm">{name}</p>
      <span className="text-xs text-slate-400">{info}</span>
    </div>

    <div className="flex gap-2">
      <button
        onClick={onReject}
        className="h-8 w-8 cursor-pointer border border-primary text-primary rounded-full flex items-center justify-center"
      >
        <X size={14} />
      </button>
      <button
        onClick={onApprove}
        className="h-8 w-8 cursor-pointer bg-primary text-white rounded-full flex items-center justify-center"
      >
        <Check size={14} />
      </button>
    </div>
  </div>
);


const Activity = ({ text, time, type, active }) => {
  const config = ACTIVITY_CONFIG[type] || ACTIVITY_CONFIG.DEFAULT;

  return (
    <li className="relative">
      <span
        className={`absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full
          ${config.dot}`}
      />
      <span className="text-sm block">{text}</span>
      <span className="text-xs text-slate-400">{time}</span>
    </li>
  );
};



const ConfirmLeaveActionModal = ({ action, onCancel, onConfirm }) => {
  const isApprove = action === "Approved";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-sm p-6">
        <h4 className="text-lg font-semibold mb-2">
          Confirm {isApprove ? "Approval" : "Rejection"}
        </h4>

        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to{" "}
          <span className="font-medium">
            {isApprove ? "approve" : "reject"}
          </span>{" "}
          this leave request?
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-lg text-white ${isApprove ? "bg-primary" : "bg-red-600"
              }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
