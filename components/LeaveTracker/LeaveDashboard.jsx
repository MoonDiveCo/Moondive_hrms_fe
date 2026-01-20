"use client";

import { AuthContext } from "@/context/authContext";
import axios, { all } from "axios";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import HolidayCalendar from "./HolidayCalender";
import ApplyLeaveModal from "./ApplyLeaveModal";
import EventDetailsModal from "./EventDetailsModal";
import LeaveRequestsModal from "./LeaveRequestModal";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import useSWR, { mutate } from "swr";

const fetcherWithAuth = async (url) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = res?.data?.data ?? res?.data;
  return data;
};

export default function LeaveTrackerDashboard({showCalender = true }) {
  const [viewModal, setViewModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [applyLeaveContext, setApplyLeaveContext] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [leaveDashboard, setLeaveDashboard] = useState([]);
  // const [pendingLeaves, setPendingLeaves] = useState([]);
  // const [userPendingLeaves, setUserPendingLeaves] = useState([]);
  // const [holidays, setHolidays] = useState([]);
  // const [allLeaves, setAllLeaves] = useState([]);
  const calendarRefreshRef = useRef(null);


  const { user } = useContext(AuthContext);
    const userRole = user?.userRole[0];
    const organizationId = user?.organizationId;

    const SUPERADMIN_DUMMY_DASHBOARD =[
  {
    "code": "CL",
    "name": "Casual Leave",
    "availableThisMonth": 2,
    "availableThisYear": 12,
    "taken": 4,
    "carryForwarded": 1,
    "unlimited": false,
    "isLWP": false,
    "canCarryForward": true,
    "isWindowed": false,
    "window": null
  },
  {
    "code": "EL",
    "name": "Earned Leave",
    "availableThisMonth": 1,
    "availableThisYear": 18,
    "taken": 7,
    "carryForwarded": 5,
    "unlimited": false,
    "isLWP": false,
    "canCarryForward": true,
    "isWindowed": false,
    "window": null
  },
  {
    "code": "OL",
    "name": "Optional Leave",
    "availableThisMonth": 1,
    "availableThisYear": 2,
    "taken": 0,
    "carryForwarded": 0,
    "unlimited": false,
    "isLWP": false,
    "canCarryForward": false,
    "isWindowed": true,
    "window": {
      "available": 1,
      "months": 6
    }
  },
  {
    "code": "LWP",
    "name": "Leave Without Pay",
    "availableThisMonth": 0,
    "availableThisYear": 0,
    "taken": 9,
    "carryForwarded": 0,
    "unlimited": true,
    "isLWP": true,
    "canCarryForward": false,
    "isWindowed": false,
    "window": null
  }
]


useEffect(() => {
  if (!user?._id) return;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const sseUrl = `${process.env.NEXT_PUBLIC_API}/hrms/leave/stream${token ? `?token=${encodeURIComponent(token)}` : ""}`;

  const eventSource = new EventSource(sseUrl, { withCredentials: true });

  eventSource.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (err) {
      console.error("Invalid SSE payload:", err, event.data);
      return;
    }

    if (data.type === "LEAVE_APPLIED") {
      const payload = data.payload || data.leave || data.leaveRequest || data.data;

      if (payload) {
        mutate("/hrms/leave/get-leave", (cached) => {
          if (!cached) return cached;

          const leaves = cached.leaves || [];
          const leaveRequests = cached.leaveRequests || [];

          const newLeaves = payload.leave ? [payload.leave, ...leaves] : leaves;
          const newLeaveRequests = payload.leaveRequest ? [payload.leaveRequest, ...leaveRequests] : leaveRequests;

          return {
            ...cached,
            leaves: newLeaves,
            leaveRequests: newLeaveRequests,
          };
        }, { revalidate: false,
         });
      }

      // mutate("/hrms/leave/get-leave");
    }

    if (data.type === "LEAVE_UPDATED") {
      mutate("/hrms/leave/get-leave-dashboard");
      mutate("/hrms/leave/get-leave");
      calendarRefreshRef.current?.();
    }
  };

  eventSource.onerror = (err) => {
    console.error("SSE error:", err);
    eventSource.close();
  };

  return () => eventSource.close();
}, [user?._id]);

const isSuperAdmin = userRole === "SuperAdmin";

const { data: dashboardRes, isLoading: dashboardLoading} = useSWR(
  !isSuperAdmin ? "/hrms/leave/get-leave-dashboard" : null,
  fetcherWithAuth,
   {
    revalidateOnFocus: true,
    refreshInterval: 10000,
  }
);

const { data: holidayRes } = useSWR(
  organizationId
    ? `/hrms/holiday?organizationId=${organizationId}&year=${new Date().getFullYear()}`
    : null,
  fetcherWithAuth,
  // { refreshInterval: 30000 }
);

const { data: leaveRes } = useSWR(
  user?._id ? "/hrms/leave/get-leave" : null,
  fetcherWithAuth,
   {
    revalidateOnFocus: true,
    refreshInterval: 10000,
  }
);

const leaveDashboard = dashboardRes?.dashboard || dashboardRes?.data?.dashboard || [];
const userPendingLeaves = dashboardRes?.pendingLeaves || dashboardRes?.data?.pendingLeaves || [];

const holidays = holidayRes?.result?.data || [];

const allLeaves = leaveRes?.leaves || [];
const pendingLeaves = leaveRes?.leaveRequests || [];

const loading =dashboardLoading && !isSuperAdmin;

  const leaveBalanceMap = useMemo(() => {
  return leaveDashboard.reduce((acc, l) => {
    acc[l.code] = l;
    return acc;
  }, {});
}, [leaveDashboard]);


// useEffect(() => {
//   if (userRole !== "SuperAdmin") {
//     fetchLeaveDashboard();
//     // fetchLeaveRequests();
//   } else {
//     setLoading(false);
//   }
// }, [userRole]);

  //   const fetchLeaveDashboard = async () => {
  //   try {
  //     const { data } = await axios.get("/hrms/leave/get-leave-dashboard");
  //     const holidays = await axios.get("/hrms/holiday", {
  //       params: { organizationId, year: new Date().getFullYear() },
  //     });
  //   const leaves = await axios.get("/hrms/leave/get-leave", {
  //     params: { year: new Date().getFullYear() },
  //   });
      
  //     setLeaveDashboard(data.dashboard || []);
  //     setUserPendingLeaves(data.pendingLeaves || []);
  //     setHolidays(holidays.data?.result?.data || []);
  //     setAllLeaves(leaves.data?.leaves || []);
  //     setPendingLeaves(leaves?.data?.leaveRequests || []);

  //   } catch (err) {
  //     console.error("Failed to load leave dashboard", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  //   const fetchLeaveRequests = async () => {
  //   try {
  //     const leaveRes = await axios.get("/hrms/leave/get-leave");
  //     console.log(leaveRes?.data?.leaveRequests )
  //     setPendingLeaves(leaveRes?.data?.leaveRequests || []);
  //   } catch (err) {
  //     console.error("Failed to load leaves", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

   if(loading){
    return(
      <div className='flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: 'center' }} 
        />
      </div>
    )
  }

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
                availableThisMonth={leave.availableThisMonth}
                availableThisYear={leave.availableThisYear}
                taken={leave.taken}
                carryForwarded={leave.carryForwarded}
                unlimited={leave.unlimited}
                isLWP={leave.isLWP}
                canCarryForward={leave.canCarryForward}
                isWindowed={leave.isWindowed}
                windowInfo={leave.window}
            />
          ))
        ) : (
        leaveDashboard.map((leave) => {
          return (
            <LeaveCard
              key={leave.code}
              code={leave.code} 
              title={leave.name}
              available={leave.available}
              taken={leave.taken}
              unlimited={leave.unlimited}
              carryForwarded={leave.carryForwarded}
              availableThisMonth={leave.availableThisMonth}
              availableThisYear={leave.availableThisYear}
              isLWP={leave.isLWP}
              canCarryForward={leave.canCarryForward}
              isWindowed={leave.isWindowed}
               windowInfo={leave.window}
            />
          );
        })
        )}
      </div>

  <div className="flex items-center gap-3 justify-between">
    <button
      onClick={() => setViewModal(true)}
      className="relative flex justify-center cursor-pointer items-center gap-2 px-3 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700"
    >
      View Leave Requests

      <span className="absolute -top-2 -right-2 w-5 h-5 text-xs flex items-center justify-center rounded-full bg-red-500 text-white">
        {pendingLeaves.filter((l) => l.decision == null).length}
      </span>
    </button>

    <button
      onClick={() => setApplyLeaveContext({})}
      className="flex items-center justify-center cursor-pointer gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-full "
    >
      <span className="text-lg leading-none">+</span>
      Apply for Leave
    </button>
  </div>


     {showCalender && <div className="h-[500px] rounded-lg bg-white flex items-center justify-center text-gray-400">
        <HolidayCalendar organizationId={user.organizationId}  
        leaves={allLeaves}
        onApplyLeave={(date) => setApplyLeaveContext({ startDate: date })}
        onViewLeave={(data) => setSelectedLeave(data)}
         onRefresh={(fn) => (calendarRefreshRef.current = fn)}
          />
        
      </div>}

      {viewModal && (
        <LeaveRequestsModal
          requests={pendingLeaves}
          myLeaves={allLeaves}
          onClose={() => setViewModal(false)}
        onResolved={async (leaveId) => {
        // Ensure the latest leaves & dashboard data are fetched, then refresh calendar
        await mutate("/hrms/leave/get-leave");
        await mutate("/hrms/leave/get-leave-dashboard");
        calendarRefreshRef.current?.();
      }}
        />
      )}

     {applyLeaveContext && (
      <ApplyLeaveModal
       context={{
          ...applyLeaveContext,
          refreshCalendar: () => calendarRefreshRef.current?.(),
          refreshDashboard: () => {
            mutate("/hrms/leave/get-leave-dashboard");
            mutate("/hrms/leave/get-leave");
          },
        }}
        pendingLeaves={userPendingLeaves}
        leaveBalances={leaveBalanceMap}
        holidays={holidays}
        allLeaves={allLeaves}
        onClose={() => {setApplyLeaveContext(null)}}
      />
    )}

    {selectedLeave && (
  <EventDetailsModal
    data={selectedLeave}
    onClose={() => setSelectedLeave(null)}
  />
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
  code,
  title,
  availableThisMonth,
  availableThisYear,
  taken,
  carryForwarded,
  unlimited,
  isLWP,
  canCarryForward,
  isWindowed,
  windowInfo,
  available,
}) {
  let primaryValue = 0;
  let subLabel = "";

  if (isLWP) {
    primaryValue = taken;
    subLabel = "Taken";
  } else if (isWindowed && windowInfo) {
    primaryValue = windowInfo.available;
    subLabel = `Available / ${windowInfo.months} months`;
  } else {
    primaryValue = available || 0;
    subLabel = "Available / Month";
  }

  const COLOR_MAP = {
    CL: "bg-blue-100 text-blue-600",
    EL: "bg-green-100 text-green-600",
    OL: "bg-purple-100 text-purple-600",
    LWP: "bg-gray-200 text-gray-700",
    WFH: "bg-cyan-200 text-cyan-700",
  };

  return (
<div className="relative group bg-white border border-gray-200 rounded-2xl h-[80px] overflow-hidden">
  
  <div className="grid grid-cols-[48px_1fr] h-full items-center px-4 py-3">
    
    <div className="flex items-center justify-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${COLOR_MAP[code]}`}
      >
        <span className="font-semibold text-lg">
          {primaryValue}
        </span>
      </div>
    </div>

    <div className="flex flex-col leading-tight ml-3">
      <span className="text-xs font-semibold uppercase text-gray-500">
        {title}
      </span>
      <span className="text-xs text-gray-400">
        {subLabel}
      </span>
    </div>
  </div>

  <div className="absolute inset-0 bg-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
    <div className="grid grid-cols-[48px_1fr] h-full items-center px-4 py-3">
      
      <div className="flex items-center justify-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${COLOR_MAP[code]}`}
        >
          <span className="font-semibold text-lg">
            {primaryValue}
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-600 space-y-0.5 ml-3">
        {!isLWP && (
          <>
            <div>
              <span className="font-medium">{availableThisYear}</span>{" "}
              Available / Year
            </div>

            {canCarryForward && (
              <div>
                <span className="font-medium">{carryForwarded}</span>{" "}
                Carry Forward
              </div>
            )}
          </>
        )}

        <div>
          <span className="font-medium">{taken}</span>{" "}
          Taken
        </div>
      </div>
    </div>
  </div>
</div>

  );
}



function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-lg p-5 relative">
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
