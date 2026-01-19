'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { X, Check, Users, ChevronLeft, ChevronRight, Info } from 'lucide-react';

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
            <span className='h-2.5 w-2.5 rounded-full bg-red-500' />
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
        key: 'workType',
        label: 'Work Type',
        render: (row) => (
          <span className='px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600'>
            {row.workType || '—'}
          </span>
        ),
      },
      {
        key: "isOnBreak",
        label: "Break",
        render: r => (
          <span className={`text-xs px-2 py-1 rounded-full ${r.isOnBreak ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
            }`}>
            {r.isOnBreak ? "On Break" : "Working"}
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

  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
  period: "month",
  date: new Date().toISOString().slice(0, 10),
  department: "",
  designation: "",
});
const [allAttendanceData, setAllAttendanceData] = useState([]);
const [departments, setDepartments] = useState([]);
const [designations, setDesignations] = useState([]);



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


  useEffect(() => {
  let alive = true;
  setLoading(true);

  axios.get("/hrms/organization/analytics", {
    params: {
      type: activeTab,
      ...(activeTab === "attendance" ? filters : {}),
    },
  })
    .then((res) => {
      if (!alive) return;
      setData(res.data.employees || []);
      setStats(res.data.stats || null);
    })
    .catch(console.error)
    .finally(() => alive && setLoading(false));

  return () => (alive = false);
}, [activeTab, filters]);

useEffect(() => {
  if (activeTab !== "attendance") return;

  axios.get("/hrms/organization/analytics", {
    params: { type: "attendance" }, 
  })
    .then((res) => {
      setAllAttendanceData(res.data.employees || []);
    })
    .catch(console.error);
}, [activeTab]);

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
        <div className="flex flex-wrap gap-3 mb-4">
          {/* Period */}
          <select
            value={filters.period}
            onChange={(e) =>
              setFilters({ ...filters, period: e.target.value })
            }
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>

          {/* Date */}
          <input
            type="date"
            value={filters.date}
            onChange={(e) =>
              setFilters({ ...filters, date: e.target.value })
            }
            className="border rounded-md px-3 py-1 text-sm"
          />

          {/* Department Dropdown */}
          <select
            value={filters.department}
            onChange={(e) =>
              setFilters({ ...filters, department: e.target.value })
            }
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="">All Departments</option>
            {departments.map(dep => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>

          {/* Designation Dropdown */}
          <select
            value={filters.designation}
            onChange={(e) =>
              setFilters({ ...filters, designation: e.target.value })
            }
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="">All Designations</option>
            {designations.map(des => (
              <option key={des} value={des}>
                {des}
              </option>
            ))}
          </select>

          <input
        placeholder="Search employee"
        value={filters.search || ""}
        onChange={(e) =>
          setFilters({ ...filters, search: e.target.value })
        }
        className="border rounded-md px-3 py-1 text-sm"
      />
        </div>
      )}

        <AnalyticsTab
          type={activeTab}
          data={data}
          stats={stats}
          loading={loading}
        />
      </div>
    </div>
  );
}

function AnalyticsTab({ type, data, stats, loading }) {
  const [leaveTab, setLeaveTab] = useState('approved');
  const [approvedLeaves, setApprovedLeaves] = useState(data);

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
        <div className='flex gap-2 mb-4'>
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
        </div>

        {leaveTab === 'approved' && (
          <AnalyticsEmployeeTable
            title='Employees on Leave'
            columns={TAB_META.leave.columns}
            data={approvedLeaves}
            stats={{ count: approvedLeaves.length }}
          />
        )}

        {leaveTab === 'pending' && (
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
  return (
    <AnalyticsEmployeeTable
      title={meta.title}
      columns={meta.columns}
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
        <table className='w-full text-sm'>
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

  useEffect(() => {
    axios
      .get('/hrms/leave/get-leave', {
        params: { year: new Date().getFullYear() },
      })
      .then(res => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filtered = (res.data?.leaveRequests || []).filter(l => {
          if (l.decision) return false;

          return true;
        });

        setRows(filtered);
      })

      .catch(console.error);
  }, []);

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
