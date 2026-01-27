'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useMemo, useContext } from 'react';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { X, Check, Users, ChevronLeft, ChevronRight, Info, Download, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import useSWR, { mutate } from "swr";
import { toast } from 'sonner';
import { AuthContext } from '@/context/authContext';

const fetcherWithAuth = async (url) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

function formatTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function msToHrs(ms = 0) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}


function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const TABS = [
  { key: 'leave', label: 'Leave' },
  { key: 'online', label: 'Present Today' },
  { key: 'late', label: 'Late Check-in' },
  { key: 'new', label: 'New Joiners' },
  { key: 'absent', label: 'Absent Today' },
  { key: 'attendance', label: 'Attendance Summary' },
];

const LEAVE_SUB_TABS = [
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
];

const TAB_META = {
  leave: {
    title: 'Employees on Leave',
    columns: [
      { key: 'name', label: 'Employee' },
      { key: 'employeeId', label: 'Emp ID' },
      { key: 'department', label: 'Department' },
      {
        key: 'status',
        label: 'Status',
        render: row => (
          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-600">
            {row.status}
          </span>
        ),
      },
      {
        key: 'leaveType',
        label: 'Type',
        render: row => (
          <span className="text-xs text-gray-600">
            {row.leaveType}
          </span>
        ),
      },
      {
        key: 'dayType',
        label: 'Day',
        render: row => (
          <span className="text-xs text-gray-600">
            {row.ishalfDay
              ? `${row.session}`
              : 'Full Day'}
          </span>
        ),
      },
    ],
  },

  online: {
    title: 'Online Employees',
    columns: [
      {
        key: 'name',
        label: 'Employee',
        render: (row) => (
          <div className='flex items-center gap-2'>
            <span className={`h-2.5 w-2.5 rounded-full ${row.checkOutTime && row.checkInTime < row.checkOutTime ? "bg-red-500" : "bg-green-500"}`} />
            <span className='font-medium text-gray-800'>{row.name}</span>
          </div>
        ),
      },
      { key: 'employeeId', label: 'Emp ID' },
      { key: 'department', label: 'Department' },
      {
        key: 'checkInTime',
        label: 'Check-in Time',
        render: (row) => formatTime(row.checkInTime),
      },
      {
        key: 'checkOutTime',
        label: 'Check-out Time',
        render: (row) => formatTime(row.checkOutTime),
      },
      {
        key: 'workType',
        label: 'Work Type',
        render: (row) => (
          <span className='px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600'>
            {row.workType === "WFH" ? "Remote In" : row.workType === "WFO" ? "In Office" : "Out Of Office"}
          </span>
        ),
      },
      {
        key: "isOnBreak",
        label: "Status",
        render: r => (
          <span className={`text-xs px-2 py-1 rounded-full ${r.checkOutTime && r.checkInTime < r.checkOutTime
            ? "bg-red-100 text-red-700"
            : r.isOnBreak
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
            }`}>
            {r.checkOutTime && r.checkInTime < r.checkOutTime
              ? "Checked Out"
              : r.isOnBreak
                ? "On Break"
                : "Working"}
          </span>
        )
      },
      {
        key: "totalWorkMs",
        label: "Work Today",
        render: r => msToHrs(r.totalWorkMs),
      },
      {
        key: "totalBreakMs",
        label: "Break Today",
        render: r => msToHrs(r.totalBreakMs),
      },

      // {
      //   key: 'workType',
      //   label: 'Work Type',
      //   render: row => (
      //     <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
      //       {row.workType || '—'}
      //     </span>
      //   ),
      // },
    ],
  },

  late: {
    title: 'Late Check-ins',
    columns: [
      { key: 'name', label: 'Employee' },
      { key: 'employeeId', label: 'Emp ID' },
      { key: 'department', label: 'Department' },
      {
        key: 'checkInTime',
        label: 'Check-in Time',
        render: (row) => formatTime(row.checkInTime),
      },
    ],
  },

  new: {
    title: 'New Joiners',
    columns: [
      { key: 'name', label: 'Employee' },
      { key: 'employeeId', label: 'Emp ID' },
      { key: 'department', label: 'Department' },
      {
        key: 'dateOfJoining',
        label: 'Date of Joining',
        render: (row) => formatDate(row.dateOfJoining),
      },
    ],
  },

  absent: {
    title: 'Absent Today',
    columns: [
      {
        key: 'name',
        label: 'Employee',
        render: (row) => (
          <div className='flex items-center gap-3'>
            <span className='h-2.5 w-2.5 rounded-full bg-red-500' />
            <span className='font-medium text-gray-800'>{row.name}</span>
          </div>
        ),
      },
      { key: 'employeeId', label: 'Emp ID' },
      { key: 'department', label: 'Department' },
    ],
  },

  attendance: {
    title: "Attendance Summary",
    columns: [
      { key: "name", label: "Employee" },

      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },

      { key: "presentDays", label: "Present" },

      {
        key: "totalWorkMs",
        label: "Work",
        render: r => msToHrs(r.totalWorkMs),
      },
      {
        key: "totalBreakMs",
        label: "Break",
        render: r => msToHrs(r.totalBreakMs),
      },
    ],
  }


};

export default function Analytics() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabFromUrl = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(
    tabFromUrl && TABS.some((t) => t.key === tabFromUrl) ? tabFromUrl : 'leave'
  );
  const [filtersExpanded, setFiltersExpanded] = useState(false);


  // const [data, setData] = useState([]);
  // const [stats, setStats] = useState(null);
  // const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentWeek = Math.ceil(new Date().getDate() / 7);

  const [filters, setFilters] = useState({
    month: currentMonth,
    week: null,      // Optional - null means all weeks in month
    day: null,       // Optional - null means all days
    department: "",
    designation: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  // Calculate date range based on month, week, day selection
  const calculateDateRange = (month, week, day) => {
    const year = currentYear;
    const monthIndex = month - 1;

    // If week is not selected, return full month
    if (week === null) {
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0);
      return {
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10)
      };
    }

    // If week is selected but day is not, return full week
    if (day === null) {
      const weekStart = Math.max(1, (week - 1) * 7 + 1);
      const weekEnd = Math.min(new Date(year, monthIndex + 1, 0).getDate(), week * 7);
      const startDate = new Date(year, monthIndex, weekStart);
      const endDate = new Date(year, monthIndex, weekEnd);
      return {
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10)
      };
    }

    // If both week and day are selected, return just that day
    const startDate = new Date(year, monthIndex, day);
    const endDate = new Date(year, monthIndex, day);
    return {
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10)
    };
  };

  // Get available weeks for a month with date range info
  const getAvailableWeeks = (month) => {
    const daysInMonth = new Date(currentYear, month, 0).getDate();
    const weeks = Math.ceil(daysInMonth / 7);
    return Array.from({ length: weeks }, (_, i) => {
      const weekNum = i + 1;
      const monthIndex = month - 1;
      const weekStart = Math.max(1, (weekNum - 1) * 7 + 1);
      const weekEnd = Math.min(daysInMonth, weekNum * 7);
      return {
        num: weekNum,
        start: weekStart,
        end: weekEnd
      };
    });
  };

  // Get available days for a week in a month
  const getAvailableDays = (month, week) => {
    const daysInMonth = new Date(currentYear, month, 0).getDate();
    const weekStart = (week - 1) * 7 + 1;
    const weekEnd = Math.min(week * 7, daysInMonth);
    return Array.from({ length: weekEnd - weekStart + 1 }, (_, i) => weekStart + i);
  };

  // Get filter label describing what's being shown
  const getFilterLabel = () => {
    const monthName = new Date(currentYear, filters.month - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

    if (filters.week === null) {
      return `Monthly Attendance - ${monthName}`;
    }

    if (filters.day === null) {
      const week = getAvailableWeeks(filters.month).find(w => w.num === filters.week);
      if (week) {
        return `Weekly Attendance - ${monthName} (${week.start}-${week.end})`;
      }
    }

    return `Daily Attendance - ${new Date(currentYear, filters.month - 1, filters.day).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}`;
  };

  // Update date range whenever month/week/day changes
  useEffect(() => {
    const dateRange = calculateDateRange(filters.month, filters.week, filters.day);
    setFilters(prev => ({
      ...prev,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    }));
  }, [filters.month, filters.week, filters.day]);

  // const [allAttendanceData, setAllAttendanceData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const analyticsKey = useMemo(() => {
    if (!activeTab) return null;

    const params = new URLSearchParams({
      type: activeTab,
    });

    const now = new Date();
const currentMonth = now.getMonth() + 1; // 1–12
const currentYear = now.getFullYear();

    if (activeTab === "attendance") {
      // Pass custom date range to backend
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.department) params.append('department', filters.department);
      if (filters.designation) params.append('designation', filters.designation);
      if (filters.search) params.append('search', filters.search);
      params.append('period', 'custom'); // Always use custom period for new UI
    }

    return `/hrms/organization/analytics?${params.toString()}`;
  }, [activeTab, filters]);


  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // useEffect(() => {
  //   let alive = true;
  //   setLoading(true);

  //   axios
  //     .get(`/hrms/organization/analytics?type=${activeTab}`)
  //     .then((res) => {
  //       if (!alive) return;
  //       setData(res.data.employees || []);
  //       setStats(res.data.stats || null);
  //     })
  //     .catch(console.error)
  //     .finally(() => alive && setLoading(false));

  //   return () => (alive = false);
  // }, [activeTab]);


  //   useEffect(() => {
  //   let alive = true;
  //   setLoading(true);

  //   axios.get("/hrms/organization/analytics", {
  //     params: {
  //       type: activeTab,
  //       ...(activeTab === "attendance" ? filters : {}),
  //     },
  //   })
  //     .then((res) => {
  //       if (!alive) return;
  //       setData(res.data.employees || []);
  //       setStats(res.data.stats || null);
  //     })
  //     .catch(console.error)
  //     .finally(() => alive && setLoading(false));

  //   return () => (alive = false);
  // }, [activeTab, filters]);

  const {
    data: analyticsRes,
    isLoading,
  } = useSWR(analyticsKey, fetcherWithAuth, {
    revalidateOnFocus: true,
    refreshInterval: 10000, // same pattern as dashboard
  });

  const data = analyticsRes?.employees || [];
  const stats = analyticsRes?.stats || null;
  const loading = isLoading;


  // useEffect(() => {
  //   if (activeTab !== "attendance") return;

  //   axios.get("/hrms/organization/analytics", {
  //     params: { type: "attendance" }, 
  //   })
  //     .then((res) => {
  //       setAllAttendanceData(res.data.employees || []);
  //     })
  //     .catch(console.error);
  // }, [activeTab]);
  const { data: allAttendanceRes } = useSWR(
    activeTab === "attendance"
      ? "/hrms/organization/analytics?type=attendance"
      : null,
    fetcherWithAuth
  );

  const allAttendanceData = allAttendanceRes?.employees || [];


  useEffect(() => {
    if (!allAttendanceData.length) return;

    const deptSet = new Set();
    const desigSet = new Set();

    allAttendanceData.forEach(emp => {
      if (emp.department && emp.department !== "—") {
        deptSet.add(emp.department);
      }
      if (emp.designation && emp.designation !== "—") {
        desigSet.add(emp.designation);
      }
    });

    setDepartments([...deptSet]);
    setDesignations([...desigSet]);
  }, [allAttendanceData]);

  const attendanceStatConfig = stats?.metrics
    ? [
      {
        key: "totalEmployees",
        title: "Total Employees",
        value: stats.metrics.totalEmployees,
        bgClass: "bg-blue-50",
        borderClass: "border border-blue-200",
        textClass: "text-blue-700",
        footer: stats.metrics.dateRange
          ? `${formatDate(stats.metrics.dateRange.start)}-${formatDate(
            stats.metrics.dateRange.end
          )}`
          : null,
      },
      {
        key: "totalPresentDays",
        title: "Total Present Days",
        value: stats.metrics.totalPresentDays,
        bgClass: "bg-green-50",
        borderClass: "border border-green-200",
        textClass: "text-green-700",
        description: "Across all employees",
      },
      {
        key: "totalWorkMs",
        title: "Total Work Hours",
        value: msToHrs(stats.metrics.totalWorkMs),
        bgClass: "bg-purple-50",
        borderClass: "border border-purple-200",
        textClass: "text-purple-700",
        description: "Combined work time",
      },
      {
        key: "averageWorkMs",
        title: "Avg Work Hours",
        value: msToHrs(stats.metrics.averageWorkMs),
        bgClass: "bg-orange-50",
        borderClass: "border border-orange-200",
        textClass: "text-orange-700",
        description: "Per employee",
      },
      {
        key: "totalBreakMs",
        title: "Total Break Time",
        value: msToHrs(stats.metrics.totalBreakMs),
        bgClass: "bg-red-50",
        borderClass: "border border-red-200",
        textClass: "text-red-700",
        description: "Break duration",
      },
    ]
    : [];


  const handleExportSummary = async (filterObj) => {
    try {
      const params = {
        type: 'attendance',
        period: 'custom',
      };

      // Add filter parameters
      if (filterObj.startDate) params.startDate = filterObj.startDate;
      if (filterObj.endDate) params.endDate = filterObj.endDate;
      if (filterObj.department) params.department = filterObj.department;
      if (filterObj.designation) params.designation = filterObj.designation;
      if (filterObj.search) params.search = filterObj.search;

      const token = localStorage.getItem('token');

      const response = await axios.get('/hrms/organization/export-attendance-summary', {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-summary-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Attendance summary exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      const errorMsg = error.response?.data?.responseMessage || error.message;
      toast.error(`Failed to export attendance summary: ${errorMsg}`);
    }
  };

  const handleExportEmployeeDetails = async (employeeId) => {
    try {
      // Use current filter date range or today's date
      let start, end;
      if (filters.period === 'custom') {
        start = filters.startDate;
        end = filters.endDate;
      } else {
        start = filters.date || new Date().toISOString().slice(0, 10);
        end = filters.date || new Date().toISOString().slice(0, 10);
      }

      if (!start || !end) {
        toast.info('Please select a date range');
        return;
      }

      const token = localStorage.getItem('token');

      const response = await axios.get('/hrms/organization/export-employee-attendance', {
        params: {
          employeeId,
          startDate: start,
          endDate: end,
        },
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `employee-attendance-${employeeId}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      const errorMsg = error.response?.data?.responseMessage || error.message;
      toast.error(`Failed to export employee attendance: ${errorMsg}`);
    }
  };

  return (
    <div className='p-6  space-y-6'>
      <div>
        <h4 className='text-primaryText'>Analytics</h4>
        <p className='text-sm text-gray-500'>Real-time workforce insights</p>
      </div>

      {/* Tabs */}
      <div className='flex gap-3 flex-wrap'>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              router.push(`/hrms/dashboard/analytics?tab=${tab.key}`);
            }}
            className={`px-3 py-1 rounded-full cursor-pointer text-xs font-medium ${activeTab === tab.key
              ? 'bg-primary text-white'
              : 'bg-white border text-gray-600'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className='bg-white rounded-xl shadow-sm p-6 relative'>
        {loading && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/60 z-10'>
            <DotLottieReact
              src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
              loop
              autoplay
              style={{ width: 90, height: 90 }}
            />
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="bg-white rounded-lg mb-4 overflow-hidden">

            {/* Header / Summary Bar */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
              onClick={() => setFiltersExpanded(prev => !prev)}
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium text-primary">
                  {getFilterLabel()}
                </span>
                <span className="text-xs text-gray-600">
                  Date Range:&nbsp;
                  <span className="font-medium">
                    {filters.startDate || "—"} to {filters.endDate || "—"}
                  </span>
                </span>
              </div>

            <div className='flex gap-4 items-center justify-center'>
                          {/* Action Buttons */}
            <div className="flex gap-2 ">
              <button
                onClick={(e) => {
                  // Export summary with current date range
                  e.stopPropagation();
                  handleExportSummary(filters);
                }}
                disabled={loading}
                className=" px-3 py-1 bg-primary text-white text-xs font-medium rounded-full disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Download size={14} /> Export Summary
              </button>
              <button
                onClick={(e) => {
                   e.stopPropagation();
                  const defaultFilters = {
                    month: currentMonth,
                    week: null,
                    day: null,
                    department: "",
                    designation: "",
                    search: "",
                    startDate: "",
                    endDate: ""
                  };
                  setFilters(defaultFilters);
                }}
                className="px-3 py-1 rounded-full border border-primary  text-primary text-xs font-medium rounded "
              >
                Reset
              </button>
            </div>

              <button
                type="button"
                className="text-xs text-primary font-medium"
              >
                {filtersExpanded ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4'/>}
              </button>
               </div>
            </div>


            {filtersExpanded && (<div className=" p-4 space-y-4">
                            {/* Active Filters Summary */}
              <div className="bg-yellow-50 rounded p-2 mt-1 border border-gray-200">
                <span className="text-xs text-gray-600">
                  <span className="font-xs">Active Filters:</span> Month: <span className="font-medium">{new Date(currentYear, filters.month - 1, 1).toLocaleString('en-IN', { month: 'long' })}</span>
                  {filters.week && <>, Week: <span className="font-medium">{filters.week}</span></>}
                  {filters.day && <>, Day: <span className="font-medium">{filters.day}</span></>}
                  {filters.department && <>, Department: <span className="font-medium">{filters.department}</span></>}
                  {filters.designation && <>, Designation: <span className="font-medium">{filters.designation}</span></>}
                  {filters.search && <>, Search: <span className="font-medium">{filters.search}</span></>}
                </span>
              </div>

              {/* Cascading Date Selector */}
              <div className="grid grid-cols-3 gap-3">
                {/* Month Selector */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    <span className='text-xs'>Select Month</span>
                  </label>
                  <select
                    value={filters.month}
                    onChange={(e) => {
                      const month = parseInt(e.target.value);
                      setFilters(prev => ({ ...prev, month, week: null, day: null }));
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary "
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(currentYear, i, 1).toLocaleString('en-IN', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Week Selector - Optional */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    <span className='text-xs'>Select Week</span>
                  </label>
                  <select
                    value={filters.week || ''}
                    onChange={(e) => {
                      const week = e.target.value === '' ? null : parseInt(e.target.value);
                      setFilters(prev => ({ ...prev, week, day: null }));
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">All Weeks (Monthly)</option>
                    {getAvailableWeeks(filters.month).map(week => (
                      <option key={week.num} value={week.num}>
                        Week {week.num} ({week.start}-{week.end})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day Selector - Only if Week is selected */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    <span className="text-xs">Select Day</span>
                  </label>
                  <select
                    value={filters.day || ''}
                    onChange={(e) => {
                      const day = e.target.value === '' ? null : parseInt(e.target.value);
                      setFilters(prev => ({ ...prev, day }));
                    }}
                    disabled={filters.week === null}
                    className={`w-full px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 ${filters.week === null
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 focus:ring-primary'
                      }`}
                  >
                    <option value="">All Days (Weekly)</option>
                    {filters.week !== null && getAvailableDays(filters.month - 1, filters.week).map(day => (
                      <option key={day} value={day}>
                        Day {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Date Range Override */}
              <div>
                <label className="text-xs font-medium text-gray-600 block"><span className='text-xs'>Or Set Custom Date Range</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1"><span className='text-xs'>Start Date</span></label>
                    <input
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1"><span className='text-xs'>End Date</span></label>
                    <input
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

                    <div className="grid grid-cols-3 gap-3">
              {/* Search */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1"><span className='text-xs'>Search Employee</span></label>
                <input
                  type="text"
                  placeholder="Name or Employee ID"
                  value={filters.search || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

                {/* Department */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1"><span className='text-xs'>Department</span></label>
                  <select
                    value={filters.department || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>

                {/* Designation */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1"><span className='text-xs'>Designation</span></label>
                  <select
                    value={filters.designation || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">All Designations</option>
                    {designations.map(des => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                </div>

                
              </div>
            </div>
            )}

          </div>
        )}

        {/* Stat Cards for Attendance */}
        {activeTab === "attendance" && stats?.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            {attendanceStatConfig.map((stat) => (
              <AttendanceStatCard
                key={stat.key}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                footer={stat.footer}
                bgClass={stat.bgClass}
                borderClass={stat.borderClass}
                textClass={stat.textClass}
              />
            ))}
          </div>
        )}


        <AnalyticsTab
          type={activeTab}
          data={data}
          stats={stats}
          loading={loading}
          onExportEmployeeDetails={handleExportEmployeeDetails}
        />
      </div>
    </div>
  );
}

function AnalyticsTab({ type, data, stats, loading, onExportEmployeeDetails }) {
  const [leaveTab, setLeaveTab] = useState('approved');
  const [approvedLeaves, setApprovedLeaves] = useState(data);
  const {user} = useContext(AuthContext)

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = data.filter(l => {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      return (
        l.status === "Approved" &&
        today >= start &&
        today <= end
      );
    });

    setApprovedLeaves(filtered);
  }, [data]);


  if (type === 'leave') {
    return (
      <>
       {user.userRole.includes("SuperAdmin") && <div className='flex gap-2 mb-4'>
          {LEAVE_SUB_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setLeaveTab(t.key)}
              className={`px-3 py-1 rounded-full text-xs cursor-pointer ${leaveTab === t.key
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>}

        {leaveTab === 'approved' && (
          <AnalyticsEmployeeTable
            title='Employees on Leave'
            columns={TAB_META.leave.columns}
            data={approvedLeaves}
            stats={{ count: approvedLeaves.length }}
          />
        )}

        {leaveTab === 'pending' && user.userRole.includes("SuperAdmin") && (
          <PendingLeaveTable
            onApprovedToday={(leave) =>
              setApprovedLeaves((prev) => [leave, ...prev])
            }
          />
        )}
      </>
    );
  }

  const meta = TAB_META[type];

  // For attendance tab, add export handler
  let finalColumns = meta.columns;
  if (type === 'attendance') {
    finalColumns = [
      ...meta.columns,
      {
        key: 'export',
        label: 'Export',
        render: (row) => (
          <button
            onClick={() => onExportEmployeeDetails(row._id || row.employeeId)}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
            title="Export detailed attendance"
          >
            <Download size={14} />
          </button>
        ),
      }
    ];
  }

  return (
    <AnalyticsEmployeeTable
      title={meta.title}
      columns={finalColumns}
      data={data}
      stats={stats}
    />
  );
}

function AnalyticsEmployeeTable({ title, columns, data }) {
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [data]);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);

  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  if (!data.length) {
    return (
      <div className='py-14 flex flex-col items-center text-gray-400'>
        <Info size={22} />
        <p className='mt-2 text-sm'>No data available</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center'>
            <Users size={18} className='text-primary' />
          </div>
          <h5 className='text-[15px] font-medium text-gray-900'>{title}</h5>
        </div>

        <span className='text-xs text-gray-500'>{data.length} records</span>
      </div>

      {/* Table */}
      <div className='relative overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm'>
        <table className='w-full text-xs'>
          <thead className='sticky top-0 bg-gray-50/80 backdrop-blur border-b border-gray-200'>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide'
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className='divide-y divide-gray-100'>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className='hover:bg-gray-50 transition-colors'
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className='px-4 py-3 text-gray-700 whitespace-nowrap'
                  >
                    {col.render ? col.render(row) : row[col.key] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Height stabilizer */}
        {paginatedData.length < PAGE_SIZE && (
          <div
            style={{
              height: (PAGE_SIZE - paginatedData.length) * 48,
            }}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between pt-2'>
          <span className='text-xs text-gray-500'>
            Page {page} of {totalPages}
          </span>

          <div className='flex items-center gap-1'>
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className='flex items-center gap-1 px-3 py-1 text-xs rounded-md border text-gray-600 hover:bg-gray-50 disabled:opacity-40'
            >
              <ChevronLeft size={14} />
              Prev
            </button>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className='flex items-center gap-1 px-3 py-1 text-xs rounded-md border text-gray-600 hover:bg-gray-50 disabled:opacity-40'
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PendingLeaveTable({ onApprovedToday }) {
  const [rows, setRows] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // useEffect(() => {
  //   axios
  //     .get('/hrms/leave/get-leave', {
  //       params: { year: new Date().getFullYear() },
  //     })
  //     .then(res => {
  //       const today = new Date();
  //       today.setHours(0, 0, 0, 0);

  //       const filtered = (res.data?.leaveRequests || []).filter(l => {
  //         if (l.decision) return false;

  //         return true;
  //       });

  //       setRows(filtered);
  //     })

  //     .catch(console.error);
  // }, []);

  const { data: leaveRes } = useSWR(
    "/hrms/leave/get-leave",
    fetcherWithAuth,
    { refreshInterval: 10000 }
  );

useEffect(() => {
  const filtered = (leaveRes?.leaveRequests || [])
    .filter(l => !l.decision)
    .sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

  setRows(filtered);
}, [leaveRes]);



  async function handleAction(row, action) {
    setProcessingId(row.leaveId);

    try {
      await axios.put('/hrms/leave/update-leave-decision', {
        leaveEntryId: row.leaveId,
        action,
        reason: `CEO ${action}`
      });

      setRows(prev => prev.filter(r => r.leaveId !== row.leaveId));

      if (
        action === 'Approved' &&
        new Date(row.startDate) <= new Date() &&
        new Date(row.endDate) >= new Date()
      ) {
        onApprovedToday({
          _id: row.employee._id,
          name: `${row.employee.firstName} ${row.employee.lastName}`,
          employeeId: row.employee.employeeId,
          department: row.employee.department,
          status: 'Approved',
          isHalfDay: row.isHalfDay,
          session: row.session,
        });
      }
    } finally {
      setProcessingId(null);
      setConfirmAction(null);
    }
    await mutate("/hrms/leave/get-leave");
    await mutate((key) => key?.startsWith("/hrms/organization/analytics"));

  }

  if (!rows.length) {
    return (
      <div className='py-10 text-center text-sm text-gray-400'>
        No pending leave requests
      </div>
    );
  }

  const columns = [
    { key: 'name', label: 'Employee' },
    { key: 'leaveType', label: 'Type' },
    {
      key: 'duration',
      label: 'Date',
      render: r => (
        <div className="flex flex-col">
          <span>{formatDate(r.startDate)}</span>
          <span className="text-xs text-gray-400">
            {r.isHalfDay
              ? `${r.session || '—'}`
              : 'Full Day'}
          </span>
        </div>
      ),
    },

    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className='flex gap-2'>
          <button
            disabled={processingId === r.leaveId}
            onClick={() =>
              setConfirmAction({ row: r, action: 'Rejected' })
            }

            className="h-8 w-8 border cursor-pointer border-primary text-primary rounded-full flex items-center justify-center"
          >
            <X size={14} />
          </button>
          <button
            disabled={processingId === r.leaveId}
            onClick={() => setConfirmAction({ row: r, action: 'Approved' })}
            className="h-8 w-8 bg-primary cursor-pointer text-white rounded-full flex items-center justify-center"
          >
            <Check size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (<>
    <AnalyticsEmployeeTable
      title="Pending Leave Requests"
      columns={columns}
      data={rows.map(r => ({
        ...r,
        name: `${r.employee.firstName} ${r.employee.lastName}`,
      }))}
      stats={{ count: rows.length }}
    />
    {confirmAction && (
      <ConfirmLeaveActionModal
        action={confirmAction.action}
        loading={processingId === confirmAction.row.leaveId}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() =>
          handleAction(confirmAction.row, confirmAction.action)
        }
      />
    )}
  </>

  );
}

function ConfirmLeaveActionModal({ action, onCancel, onConfirm, loading }) {
  const isApprove = action === 'Approved';

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='bg-white rounded-xl w-full max-w-sm p-6'>
        <h4 className='text-lg font-semibold mb-2'>
          Confirm {isApprove ? 'Approval' : 'Rejection'}
        </h4>

        <p className='text-sm text-gray-500 mb-6'>
          Are you sure you want to{' '}
          <span className='font-medium'>
            {isApprove ? 'approve' : 'reject'}
          </span>{' '}
          this leave request?
        </p>

        <div className='flex justify-end gap-2'>
          <button
            onClick={onCancel}
            disabled={loading}
            className='px-4 py-2 text-sm border rounded-lg'
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded-lg text-white ${isApprove ? 'bg-primary' : 'bg-red-600'
              }`}
          >
            {loading ? 'Processing…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AttendanceStatCard({
  title,
  value,
  description,
  bgClass,
  borderClass,
  textClass,
  footer,
}) {
  return (
    <div className={`${bgClass} ${borderClass} rounded-lg p-3`}>
      <span className="text-xs text-gray-600 font-medium block">{title}</span>
      <span className={`text-xs block font-bold mt-1 ${textClass}`}>{value}</span>
      {description && (
        <span className="text-xs text-gray-500 mt-1">{description}</span>
      )}
      {footer && (
        <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">{footer}</span>
      )}
    </div>
  );
}

