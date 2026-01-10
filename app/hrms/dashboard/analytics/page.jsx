'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { X, Check } from 'lucide-react';


function formatTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
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
  { key: 'online', label: 'Online Now' },
  { key: 'late', label: 'Late Check-in' },
  { key: 'new', label: 'New Joiners' },
  { key: 'absent', label: 'Absent Today' },
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
        key: 'dayType',
        label: 'Day',
        render: row => (
          <span className="text-xs text-gray-600">
            {row.isHalfDay
              ? `Half Day (${row.session})`
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
        render: row => (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span>{row.name}</span>
          </div>
        ),
      },
      { key: 'employeeId', label: 'Emp ID' },
      { key: 'department', label: 'Department' },
      {
        key: 'checkInTime',
        label: 'Check-in Time',
        render: row => formatTime(row.checkInTime),
      },
      {
        key: 'workType',
        label: 'Work Type',
        render: row => (
          <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
            {row.workType || '—'}
          </span>
        ),
      },
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
        render: row => formatTime(row.checkInTime),
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
        render: row => formatDate(row.dateOfJoining),
      },
    ],
  },

  absent: {
    title: 'Absent Today',
    columns: [
      { key: 'name', label: 'Employee' },
      { key: 'employeeId', label: 'Emp ID' },
      { key: 'department', label: 'Department' },
    ],
  },
};


export default function Analytics() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabFromUrl = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(
    tabFromUrl && TABS.some(t => t.key === tabFromUrl)
      ? tabFromUrl
      : 'leave'
  );

  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    axios
      .get(`/hrms/organization/analytics?type=${activeTab}`)
      .then(res => {
        if (!alive) return;
        setData(res.data.employees || []);
        setStats(res.data.stats || null);
      })
      .catch(console.error)
      .finally(() => alive && setLoading(false));

    return () => (alive = false);
  }, [activeTab]);

  return (
    <div className="p-6 bg-[#F7F8FA] min-h-screen space-y-6">
      <div>
        <h4 className="text-primaryText">Analytics</h4>
        <p className="text-sm text-gray-500">Real-time workforce insights</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 flex-wrap">
        {TABS.map(tab => (
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

      <div className="bg-white rounded-xl shadow-sm p-6 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <DotLottieReact
              src="https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie"
              loop
              autoplay
              style={{ width: 90, height: 90 }}
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
        <div className="flex gap-2 mb-4">
          {LEAVE_SUB_TABS.map(t => (
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
            title="Employees on Leave"
            columns={TAB_META.leave.columns}
            data={approvedLeaves}
            stats={{ count: approvedLeaves.length }}
          />
        )}

        {leaveTab === 'pending' && (
          <PendingLeaveTable
            onApprovedToday={leave =>
              setApprovedLeaves(prev => [leave, ...prev])
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


function AnalyticsEmployeeTable({ title, columns, data, stats }) {
  if (!data.length) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h5 className="text-primaryText">{title}</h5>
        {/* {stats && <span>Total: {stats.count}</span>} */}
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(c => (
                <th key={c.key} className="px-4 py-3 text-left">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row._id || row.leaveId} className="">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render ? col.render(row) : row[col.key] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      <div className="py-10 text-center text-sm text-gray-400">
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
              ? `Half Day (${r.session || '—'})`
              : 'Full Day'}
          </span>
        </div>
      ),
    },

    {
      key: 'actions',
      label: 'Actions',
      render: r => (
        <div className="flex gap-2">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-sm p-6">
        <h4 className="text-lg font-semibold mb-2">
          Confirm {isApprove ? 'Approval' : 'Rejection'}
        </h4>

        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to{' '}
          <span className="font-medium">
            {isApprove ? 'approve' : 'reject'}
          </span>{' '}
          this leave request?
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm border rounded-lg"
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

