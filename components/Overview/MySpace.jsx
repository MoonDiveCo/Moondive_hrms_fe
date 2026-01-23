'use client';

import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import { AuthContext } from '@/context/authContext';
import { useAttendance } from '@/context/attendanceContext';
import {
  Building,
  Building2,
  Calendar,
  Contact2,
  Dot,
  Info,
  MailIcon,
  MapPin,
  PencilIcon,
  PhoneCallIcon,
} from 'lucide-react';
import LeaveTrackerDashboard from '../LeaveTracker/LeaveDashboard';
import ProfileSlideOver from '../Dashboard/ProfileSlideOver';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

dayjs.extend(relativeTime);

const avatarUrl =
  'https://img.freepik.com/free-photo/young-entrepreneur_1098-18139.jpg?semt=ais_se_enriched&w=740&q=80';

function getCurrentWorkWeekDays(base = new Date()) {
  const today = new Date(base);
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

const fetcherWithAuth = async (url) => {
  const token = localStorage.getItem('token');
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

export default function HRMSOverviewPage() {
  const { workedSeconds } = useAttendance();
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('leave');
  const [weekAttendance, setWeekAttendance] = useState({});
  const [reportingManager, setReportingManager] = useState(null);
  const [departmentMembers, setDepartmentMembers] = useState([]);
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [startTs, setStartTs] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  // New states for confirmation
  const [confirmAction, setConfirmAction] = useState(null); // "approve" | "reject" | null
  const [pendingLeaveId, setPendingLeaveId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: membersData, isLoading: membersLoading } = useSWR(
    user?.organizationId ? `/hrms/attendance/today/all` : null,
    fetcherWithAuth,
    { refreshInterval: 30000 }
  );
  const { data: leaveData = { leaves: [] } } = useSWR(
    user?._id ? `/hrms/leave/get-leave` : null,
    fetcherWithAuth,
    { refreshInterval: 30000 }
  );
  const myTotalLeavesCount = Array.isArray(leaveData?.leaves)
    ? leaveData.leaves.length
    : 0;
  const { data: pendingApprovals = [], isLoading: approvalsLoading } = useSWR(
    user?._id ? `/hrms/leave/pending-approvals` : null,
    fetcherWithAuth,
    { refreshInterval: 30000 }
  );

  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1;

  const { data: holidayData = [] } = useSWR(
    user?.organizationId
      ? `/hrms/holiday?organizationId=${user.organizationId}&year=${currentYear}&month=${currentMonth}`
      : null,
    fetcherWithAuth,
    { refreshInterval: 300000 }
  );

  const holidayMap = React.useMemo(() => {
  const map = {};

  holidayData?.result?.data
    ?.filter(h => h.isActive)
    ?.filter(h => h.tyoe === 'PUBLIC')
    ?.forEach(h => {
      const dateKey = dayjs(h.date).format("YYYY-MM-DD");
      map[dateKey] = {
        name: h.name,
        type: h.type,
      };
    });

  return map;
}, [holidayData]);

  useEffect(() => {
    const fetchWeek = async () => {
      const days = getPast7Days();
      const results = {};
      await Promise.all(
        days.map(async (d) => {
          const dayStr = dayjs(d).format('YYYY-MM-DD');
          try {
            const res = await axios.get(
              `${process.env.NEXT_PUBLIC_API}/hrms/attendance?type=day&day=${dayStr}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );
            results[dayStr] = res.data;
          } catch {
            results[dayStr] = { data: [] };
          }
        })
      );
      setWeekAttendance(results);
    };
    fetchWeek();
  }, []);

  useEffect(() => {
    if (membersData) {
      setDepartmentMembers(
        membersData.map((member) => ({
          _id: member.employeeId,
          firstName: member.name?.split(' ')[0] || 'Unknown',
          lastName: member.name?.split(' ').slice(1).join(' ') || '',
          imageUrl: member.avatar || avatarUrl,
          designationId: { name: member.designation || 'Employee' },
          department: member.department || 'General',
          isOnline: member.isOnline,
        }))
      );
    } else {
      setDepartmentMembers([]);
    }
  }, [membersData]);

  console.log(departmentMembers);

  useEffect(() => {
    if (!user?.reportingManagerId) return;
    const fetchReportingManager = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/hrms/employee/view-employee/${user.reportingManagerId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setReportingManager(res.data?.data);
        setLoading(false);
      } catch (err) {
        setReportingManager(null);
        setLoading(false);
      }
    };
    fetchReportingManager();
  }, [user?.reportingManagerId]);

  // useEffect(() => {
  //   if (!user?.departmentId) return;

  //   const fetchDepartment = async () => {
  //     try {
  //       setLoading(true)
  //       const res = await axios.get(
  //         `${process.env.NEXT_PUBLIC_API}/hrms/organization/view-department/${user.departmentId}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           },
  //         }
  //       );
  //       const dept = res.data?.result;
  //       // setDepartmentMembers(dept?.employeeId || []);
  //       setLoading(false)
  //     } catch (err) {
  //       setDepartmentMembers([]);
  //       setLoading(false)
  //     }
  //   };

  //   fetchDepartment();
  // }, [user?.departmentId]);

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
    );
  }

  const currentAddress = user?.address?.find(
    (addr) => addr.addresstype === 'Current'
  );

  const formattedAddress = currentAddress
    ? [currentAddress.city, currentAddress.state, currentAddress.country]
      .filter(Boolean)
      .join(', ')
    : '—';

  function getPast7Days(base = new Date()) {
    const days = [];
    const today = new Date(base);

    // Go backwards from today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d);
    }

    return days;
  }
const attendanceItems = getPast7Days().map((d) => {
  const key = dayjs(d).format("YYYY-MM-DD");
  const record = weekAttendance[key]?.data?.[0];

  const day = dayjs(d);
  const dayLabel = day.format("dddd, MMM DD");
  const isWeekend = day.day() === 0 || day.day() === 6;
  const holiday = holidayMap[key];

  if (record?.status === "On Leave") {
    return {
      day: dayLabel,
      time: record.leaveType || "On Leave",
      hours: "—",
      status: "Leave",
      color: "blue",
    };
  }

  if (record?.sessions?.length) {
    const sessions = record.sessions;

    const firstIn = sessions[0]?.checkIn
      ? dayjs(sessions[0].checkIn)
      : null;

    const lastSession = sessions[sessions.length - 1];
    const lastOut = lastSession?.checkOut
      ? dayjs(lastSession.checkOut)
      : null;

    const isToday = day.isSame(dayjs(), "day");

    let totalMs = sessions.reduce((sum, s) => {
      if (!s.checkIn) return sum;
      const start = dayjs(s.checkIn);
      const end = s.checkOut ? dayjs(s.checkOut) : isToday ? dayjs() : null;
      if (!end) return sum;
      return sum + end.diff(start);
    }, 0);

    return {
      day: dayLabel,
      time: firstIn
        ? `${firstIn.format("hh:mm A")} — ${lastOut?.format("hh:mm A") || "—"}`
        : "—",
      hours: (totalMs / 3600000).toFixed(1) + "h",
      status: "Present",
      color: "green",
    };
  }

  if (holiday) {
    return {
      day: dayLabel,
      time: holiday.name,
      hours: "—",
      status: "Holiday",
      color: "purple",
    };
  }

  if (isWeekend) {
    return {
      day: dayLabel,
      time: "Weekend",
      hours: "—",
      status: "Weekend",
      color: "gray",
    };
  }

  return {
    day: dayLabel,
    time: "—",
    hours: "0h",
    status: "Absent",
    color: "orange",
  };
});



  const tabs = [
    { id: 'leave', label: 'Leave', badge: myTotalLeavesCount },
    { id: 'feeds', label: 'Feeds' },
    { id: 'profile', label: 'Profile' },
    { id: 'approvals', label: 'Approvals', badge: pendingApprovals.length },
    { id: 'files', label: 'Files' },
  ];

  const handleLeaveDecision = async (leaveEntryId, action, reason = null) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API}/hrms/leave/update-leave-decision`,
        { leaveEntryId, action, reason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      mutate(`/hrms/leave/pending-approvals`);
      mutate(`/hrms/leave/my-pending-leaves`);
      mutate(`/hrms/leave/get-leave`);

      toast.success(
        action === 'Approved' ? 'Leave approved!' : 'Leave rejected.'
      );
      setConfirmAction(null);
      setPendingLeaveId(null);
      setRejectReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  return (
    <div className='max-w-full mx-auto px-6 md:px-8 p-6'>
      <div className='bg-white rounded-2xl primaryShadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
        <div className='flex items-center gap-6 min-w-0'>
          <div className='relative shrink-0'>
            <img
              src={user?.imageUrl || avatarUrl}
              alt={`${user?.firstName} ${user?.lastName}`}
              className='w-24 h-24 rounded-full object-cover'
            />
            <span className='absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full' />
          </div>
          <div className='min-w-0'>
            <div className='flex gap-4'>
              <h4 className='text-primaryText truncate'>
                {user?.firstName} {user?.lastName}
              </h4>
              {user?.onboardingStatus && (
                <div className="flex items-center gap-1">
                  <span
                    className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${user.onboardingStatus === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                      }`}
                  >
                    {user.onboardingStatus === "Completed"
                      ? "Onboarding Completed"
                      : "Onboarding Pending"}
                  </span>

                  {user.onboardingStatus !== "Completed" && (
                    <div className="relative group">
                      <button
                        type="button"
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                      >
                        <Info size={14} />
                      </button>

                      {/* Tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 hidden group-hover:block z-50">
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
                          <p className="font-medium mb-1">Complete Onboarding</p>
                          <span className="text-xs">
                            Upload all required documents such as ID proofs, academic
                            certificates, and employment records to complete onboarding.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}</div>
            <p className='text-orange-500 font-medium'>
              {user?.designationName}
            </p>
            <p className='text-sm text-gray-500 mt-1 line-clamp-2 max-w-xl'>
              {user?.about}
            </p>
            <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3'>
              <div className='flex items-center gap-2'>
                <span className='text-orange-500'>
                  <MailIcon size={16} />
                </span>
                <span>{user?.email}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-orange-500'>
                  <PhoneCallIcon size={16} />
                </span>
                <span>{user?.mobileNumber}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-orange-500'>
                  <MapPin size={16} />
                </span>
                <span className='truncate max-w-xs'>{formattedAddress}</span>
              </div>
            </div>
          </div>
        </div>
        <div className='shrink-0'>
          <button
            onClick={() => setOpenProfile(true)}
            className='px-5 flex items-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition'
          >
            <PencilIcon size={16} /> Edit Profile
          </button>
        </div>
      </div>
      <div className='bg-white rounded-2xl primaryShadow p-6 mt-3'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center'>
            <Calendar size={16} className='text-orange-500' />
          </div>
          <div>
            <h4 className='text-primaryText'>Attendance Summary</h4>
            <p className='text-sm text-gray-400'>Current Week Overview</p>
          </div>
        </div>
        <div className='space-y-2'>
          {attendanceItems.map((item, index) => (
            <div
              key={index}
              className='flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2'
            >
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center'>
                  <Calendar size={16} className='text-orange-500' />
                </div>
                <div>
                  <p className='text-sm font-medium text-[#0D1B2A]'>
                    {item.day}
                  </p>
                  <p className='text-sm text-gray-400'>{item.time}</p>
                </div>
              </div>
              <div className='flex items-center justify-between gap-4 min-w-[150px]'>
                <span className='text-sm font-medium text-gray-600 '>
                  {item.hours}
                </span>
                <span
                  className={`text-xs font-semibold justify-start px-3 py-1 flex items-center rounded-full
                    ${item.color === 'green'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                    }
                  `}
                >
                  <Dot size={20} className='' />
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-2xl primaryShadow p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center'>
              <Building2 size={18} className='text-primary' />
            </div>
            <div>
              <h4 className='text-primaryText'>Reporting Hierarchy</h4>
              <p className='text-sm text-gray-400'>Organizational Structure</p>
            </div>
          </div>
          <div className='mb-5'>
            <p className='text-xs text-gray-400 uppercase mb-2'>Reports To</p>

            <div className='flex items-center gap-4 border border-gray-300 rounded-xl p-4'>
              <img
                src={reportingManager?.imageUrl || avatarUrl}
                className='w-12 h-12 rounded-full object-cover'
              />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-[#0D1B2A] truncate'>
                  {reportingManager
                    ? `${reportingManager.firstName} ${reportingManager.lastName}`
                    : '—'}
                </p>
                <p className='text-xs text-gray-500'>
                  {reportingManager?.designationId?.name}
                </p>
                <p className='text-xs text-gray-400'>
                  {reportingManager?.departmentId?.name}
                </p>
              </div>
              <span className='text-gray-300 text-lg'>›</span>
            </div>
          </div>

          <div>
            <p className='text-xs text-gray-400 uppercase mb-2'>You</p>

            <div className='flex items-center gap-4 border border-orange-200 bg-orange-50 rounded-xl p-4'>
              <img
                src={user?.imageUrl || avatarUrl}
                className='w-12 h-12 rounded-full object-cover'
              />
              <div className='min-w-0'>
                <p className='text-sm font-semibold text-[#0D1B2A] truncate'>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className='text-xs text-gray-500'>
                  {user?.designationId?.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl primaryShadow p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center'>
                <Contact2 size={18} className='text-primary' />
              </div>
              <div>
                <h4 className='text-primaryText'>
                  {user?.departmentName || 'My Department'}
                </h4>
                <p className='text-sm text-gray-400'>
                  Department Members ({' '}
                  <strong>{departmentMembers.length}</strong> )
                </p>
              </div>
            </div>
          </div>

          {/* <div className="flex items-center gap-4 text-sm mb-5"> */}
          {/* <span> */}
          {/* TOTAL <strong>{departmentMembers.length}</strong> */}
          {/* </span> */}
          {/* </div> */}
          <div className='space-y-3 max-h-[300px] overflow-y-auto'>
            {[...departmentMembers]
              .sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0))
              .map((member) => (
                <div
                  key={member._id}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all ${member._id === user?._id
                    ? 'bg-orange-50 border border-orange-200'
                    : member.isOnline
                      ? 'bg-green-50 hover:bg-green-100'
                      : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                >
                  <div className='flex items-center gap-3'>
                    <div className='relative shrink-0'>
                      <img
                        src={member.imageUrl || avatarUrl}
                        alt={member.firstName}
                        className='w-10 h-10 rounded-full object-cover ring-2 ring-white shadow'
                      />
                      {member.isOnline && (
                        <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full ring-1 ring-white' />
                      )}
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-primaryText'>
                        {member.firstName} {member.lastName}
                        {member._id === user?._id && (
                          <span className='text-xs text-orange-600 font-medium ml-2'>
                            (You)
                          </span>
                        )}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {member.designationId?.name || 'Employee'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 ${member.isOnline
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    <Dot size={16} className='fill-current' />
                    {member.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))}
          </div>

          <div className='mt-6 text-center'>
            <button
              onClick={() => router.push('department')}
              className='text-sm text-orange-500 font-semibold hover:underline'
            >
              View All Members →
            </button>
          </div>
        </div>
      </div>

      <section className='mt-8'>
        <h4 className='text-primaryText mb-4'>Activities</h4>
        <div className='bg-white rounded-lg primaryShadow overflow-hidden'>
          <div className='px-6 pt-4'>
            <nav className='flex items-center gap-6 border-b border-gray-100 pb-3 '>
              {tabs.map((t) => {
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`relative pb-3 px-3 transition-colors ${isActive
                      ? 'font-semibold text-primaryText'
                      : 'text-gray-500'
                      } hover:text-primaryText`}
                    style={{
                      borderBottom: isActive
                        ? '3px solid var(--color-primary)'
                        : '3px solid transparent',
                    }}
                  >
                    <span className='flex items-center gap-2 cursor-pointer'>
                      {t.label}
                      {t.badge > 0 && (
                        <span className='bg-pink-100 text-pink-700 px-2.5 py-0.5 rounded-full text-xs font-medium min-w-[20px] text-center'>
                          {t.badge}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className='p-6'>
            {activeTab === 'leave' && (
              <LeaveTrackerDashboard showCalender={false} />
            )}
            {activeTab === 'feeds' && (
              <p className='text-gray-500'>No feeds yet.</p>
            )}
            {activeTab === 'profile' && (
              <p className='text-gray-500'>Profile section here.</p>
            )}

            {activeTab === 'approvals' && (
              <div className='space-y-4'>
                {approvalsLoading ? (
                  <p className='text-center py-12 text-primaryText'>
                    Loading approvals...
                  </p>
                ) : pendingApprovals.length === 0 ? (
                  <p className='text-center py-16 text-primaryText'>
                    No pending leave requests
                  </p>
                ) : (
                  <div className='space-y-3'>
                    {pendingApprovals.map((req) => (
                      <div
                        key={req.leaveEntryId}
                        className='bg-gray-50 hover:bg-gray-100 rounded-xl p-5 flex items-start justify-between transition'
                      >
                        <div className='flex items-start gap-4 flex-1 '>
                          <img
                            src={req.avatar || avatarUrl}
                            alt={req.employeeName}
                            className='w-14 h-14 rounded-full object-cover ring-2 ring-white shadow'
                          />
                          <div className='flex-1'>
                            <p className='font-semibold text-primaryText'>
                              {req.employeeName}
                            </p>
                            <p className='text-sm text-primaryText mt-1'>
                              {req.leaveType} •{' '}
                              {dayjs(req.startDate).format('MMM DD, YYYY')}
                            </p>
                            <p className='text-xs text-primaryText mt-1'>
                              Applied {dayjs(req.appliedAt).fromNow()}
                            </p>
                            {req.reason && (
                              <p className='text-xs italic text-primaryText mt-2 bg-white px-3 py-2 rounded border-l-4 border-orange-400'>
                                "{req.reason}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className='flex items-center gap-3 ml-4'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingLeaveId(req.leaveEntryId);
                              setConfirmAction('reject');
                            }}
                            className='px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg text-sm transition'
                          >
                            Reject
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingLeaveId(req.leaveEntryId);
                              setConfirmAction('approve');
                            }}
                            className='px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-lg text-sm transition'
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'files' && (
              <p className='text-gray-500'>Files list.</p>
            )}
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {isModalOpen && selectedLeave && (
        <div className='fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative'>
            <button
              onClick={() => setIsModalOpen(false)}
              className='absolute top-4 right-4 cursor-pointer  text-gray-400 hover:text-gray-600 text-2xl'
            >
              ×
            </button>
            <h4 className='text-xl font-bold text-primaryText mb-6'>
              Leave Request Details
            </h4>

            <div className='flex items-center gap-4 mb-6'>
              <img
                src={selectedLeave.avatar || avatarUrl}
                alt={selectedLeave.employeeName}
                className='w-16 h-16 rounded-full object-cover'
              />
              <div>
                <p className='font-semibold text-lg'>
                  {selectedLeave.employeeName}
                </p>
                <p className='text-sm text-gray-600'>
                  {selectedLeave.leaveType} •{' '}
                  {dayjs(selectedLeave.startDate).format('MMM DD, YYYY')}
                </p>
              </div>
            </div>

            {selectedLeave.reason && (
              <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                <p className='text-sm italic text-gray-700'>
                  "{selectedLeave.reason}"
                </p>
              </div>
            )}

            <div className='flex gap-4 justify-end'>
              <button
                onClick={() => {
                  setPendingLeaveId(selectedLeave.leaveEntryId);
                  setConfirmAction('reject');
                  setIsModalOpen(false);
                }}
                className='px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl transition'
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setPendingLeaveId(selectedLeave.leaveEntryId);
                  setConfirmAction('approve');
                  setIsModalOpen(false);
                }}
                className='px-6 py-3  bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-xl transition'
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6'>
            <h4 className='text-md font-bold text-primaryText mb-4'>
              Are you sure you want to{' '}
              {confirmAction === 'approve' ? 'approve' : 'reject'} this leave
              request?
            </h4>

            {confirmAction === 'reject' && (
              <div className='mb-5'>
                <label className='block text-sm font-medium text-primaryText mb-2'>
                  Reason for rejection <span className='text-red-500'>*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                  rows='3'
                  placeholder='Enter reason...'
                />
              </div>
            )}

            <div className='flex gap-4 justify-end mt-6'>
              <button
                onClick={() => {
                  setConfirmAction(null);
                  setPendingLeaveId(null);
                  setRejectReason('');
                }}
                className='px-5 py-2.5 cursor-pointer text-gray-700  bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition'
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction === 'reject' && !rejectReason.trim()) {
                    toast.error('Please provide a reason for rejection.');
                    return;
                  }
                  handleLeaveDecision(
                    pendingLeaveId,
                    confirmAction === 'approve' ? 'Approved' : 'Rejected',
                    confirmAction === 'reject' ? rejectReason.trim() : null
                  );
                }}
                className={`px-5 py-2.5 font-medium cursor-pointer rounded-lg transition ${confirmAction === 'approve'
                  ? 'bg-green-100 hover:bg-green-200 text-green-700'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
                  }`}
              >
                Yes, {confirmAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProfileSlideOver
        isOpen={openProfile}
        onClose={() => setOpenProfile(false)}
        startInEdit={true}
      />
    </div>
  );
}
