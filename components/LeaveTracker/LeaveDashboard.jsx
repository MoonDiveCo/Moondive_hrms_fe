"use client";

import { AuthContext } from "@/context/authContext";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import HolidayCalendar from "./HolidayCalender";

export default function LeaveTrackerDashboard() {
  const [applyModal, setApplyModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [leaveDashboard, setLeaveDashboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);
    const userRole = user?.userRole[0];
    console.log("User Role in Leave Dashboard:", userRole);

    const SUPERADMIN_DUMMY_DASHBOARD = [
  {
    code: "CL",
    name: "Casual Leave",
    available: 10,
    taken: 2,
    total: 12,
  },
  {
    code: "EL",
    name: "Earned Leave",
    available: 12,
    taken: 8,
    total: 20,
  },
  {
    code: "OL",
    name: "Optional Leave",
    available: 2,
    taken: 1,
    total: 3,
  },
  {
    code: "LWP",
    name: "Leave Without Pay",
    taken: 5,
  },
];


  const pendingLeaves = [
    {
      id: 1,
      type: "Casual Leave",
      dates: "10 Oct 2025 - 11 Oct 2025",
      reason: "Family function",
    },
    {
      id: 2,
      type: "Sick Leave",
      dates: "15 Oct 2025",
      reason: "Fever",
    },
  ];


useEffect(() => {
  if (userRole !== "superadmin") {
    fetchLeaveDashboard();
  } else {
    setLoading(false);
  }
}, [userRole]);

    const fetchLeaveDashboard = async () => {
    try {
      const { data } = await axios.get("/hrms/leave/get-leave-dashboard");
      setLeaveDashboard(data.dashboard || []);
    } catch (err) {
      console.error("Failed to load leave dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          <p className="text-sm text-gray-400">Loading leave balances...</p>
        ) : userRole === "SuperAdmin" ? (
          SUPERADMIN_DUMMY_DASHBOARD.map((leave) => (
            <LeaveCard
              key={leave.code}
              title={leave.name}
              available={leave.available}
              taken={leave.taken}
              total={leave.total}
              isLWP={leave.code === "LWP"}
              isSuperadmin
            />
          ))
        ) : (
          leaveDashboard.map((leave) => {
            const total = leave.unlimited ? null : leave.availableThisYear;
            const available = leave.unlimited ? null : leave.availableThisYear;

            return (
              <LeaveCard
                key={leave.code}
                title={leave.name}
                available={available}
                taken={
                  leave.unlimited ? null : Math.max(0, total - available)
                }
                total={total}
                unlimited={leave.unlimited}
              />
            );
          })
        )}
      </div>

<div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm flex items-center justify-between">
  
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
      <span className="text-orange-500 text-lg">⚡</span>
    </div>

    <div>
      <h4 className="text-primaryText">
        Quick Actions
      </h4>
      <p className="text-xs text-gray-500">
        Manage requests efficiently
      </p>
    </div>
  </div>

  <div className="flex items-center gap-3">
    <button
      onClick={() => setViewModal(true)}
      className="relative flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      View Leave Requests

      <span className="absolute -top-2 -right-2 w-5 h-5 text-xs flex items-center justify-center rounded-full bg-red-500 text-white">
        2
      </span>
    </button>

    <button
      onClick={() => setApplyModal(true)}
      className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg shadow-sm"
    >
      <span className="text-lg leading-none">+</span>
      Apply for Leave
    </button>
  </div>
</div>


      <div className="h-[400px] border rounded-lg bg-white flex items-center justify-center text-gray-400">
        <HolidayCalendar />
      </div>

      {applyModal && (
        <Modal title="Apply for Leave" onClose={() => setApplyModal(false)}>
          <div className="space-y-4">
            <select className="w-full border rounded-md px-3 py-2">
              <option>Select Leave Type</option>
              <option>Casual Leave</option>
              <option>Sick Leave</option>
              <option>Earned Leave</option>
            </select>

            <input type="date" className="w-full border rounded-md px-3 py-2" />
            <input type="date" className="w-full border rounded-md px-3 py-2" />

            <textarea
              placeholder="Reason"
              className="w-full border rounded-md px-3 py-2"
              rows={3}
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setApplyModal(false)} className="px-4 py-2 border rounded-md">
                Cancel
              </button>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-md">
                Submit
              </button>
            </div>
          </div>
        </Modal>
      )}

      {viewModal && (
        <Modal title="Pending Leave Requests" onClose={() => setViewModal(false)}>
          <div className="space-y-4">
            {pendingLeaves.map((leave) => (
              <div
                key={leave.id}
                className="border rounded-lg p-4 flex justify-between items-start"
              >
                <div>
                  <p className="font-medium">{leave.type}</p>
                  <p className="text-sm text-gray-500">{leave.dates}</p>
                  <p className="text-sm text-gray-500">{leave.reason}</p>
                </div>

                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-500 text-white rounded-md text-sm">
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLeave(leave);
                      setRejectModal(true);
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {rejectModal && (
        <Modal title="Reject Leave Request" onClose={() => setRejectModal(false)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Rejecting <b>{selectedLeave?.type}</b>
            </p>

            <textarea
              placeholder="Reason for rejection"
              className="w-full border rounded-md px-3 py-2"
              rows={4}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-md">
                Submit
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


function LeaveCard({
  title,
  available,
  taken,
  total,
  icon,
  unlimited,
  isLWP,
  isSuperadmin,
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden">

      <p className="text-sm font-medium text-gray-500">{title}</p>

     <div className="flex items-baseline gap-2 mt-2">
      <span className="text-3xl font-semibold text-[#0D1B2A]">
        {isLWP ? taken : available}
      </span>

      {!isLWP && (
        <span className="text-sm text-gray-400">
          {unlimited ? "Taken" : "Available"}
        </span>
      )}
    </div>

      <div className="border-t border-dashed border-gray-200 my-4" />

      {!isLWP && !unlimited && (
        <div className="flex items-center gap-5 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>{taken} Taken</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            <span>{total} Total</span>
          </div>
        </div>
      )}
    </div>
  );
}



function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-5 relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
