"use client";

import { AuthContext } from "@/context/authContext";
import axios, { all } from "axios";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import HolidayCalendar from "./HolidayCalender";
import ApplyLeaveModal from "./ApplyLeaveModal";
import EventDetailsModal from "./EventDetailsModal";
import LeaveRequestsModal from "./LeaveRequestModal";

export default function LeaveTrackerDashboard({showCalender = true }) {
  const [viewModal, setViewModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [applyLeaveContext, setApplyLeaveContext] = useState(null);
  const [leaveDashboard, setLeaveDashboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [userPendingLeaves, setUserPendingLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
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



  const leaveBalanceMap = useMemo(() => {
  return leaveDashboard.reduce((acc, l) => {
    acc[l.code] = l;
    return acc;
  }, {});
}, [leaveDashboard]);

useEffect(() => {
  if (!user?._id) return;

  const eventSource = new EventSource(
    `${process.env.NEXT_PUBLIC_API}/hrms/leave/stream`,
    {withCredentials: true}
  );

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received SSE event:", data);
    if (data.type === "LEAVE_APPLIED") {
      fetchLeaveRequests();
    }

    if (data.type === "LEAVE_UPDATED") {
      fetchLeaveDashboard();
      calendarRefreshRef.current?.();
    }
  };

  eventSource.onerror = () => {
    eventSource.close();
  };

  return () => eventSource.close();
}, [user?._id]);




useEffect(() => {
  if (userRole !== "SuperAdmin") {
    fetchLeaveDashboard();
    fetchLeaveRequests();
  } else {
    setLoading(false);
  }
}, [userRole]);

    const fetchLeaveDashboard = async () => {
    try {
      const { data } = await axios.get("/hrms/leave/get-leave-dashboard");
      const holidays = await axios.get("/hrms/holiday", {
        params: { organizationId, year: new Date().getFullYear() },
      });
    const leaves = await axios.get("/hrms/leave/get-leave", {
      params: { year: new Date().getFullYear() },
    });
      
      setLeaveDashboard(data.dashboard || []);
      setUserPendingLeaves(data.pendingLeaves || []);
      setHolidays(holidays.data?.result?.data || []);
      setAllLeaves(leaves.data?.leaves || []);
    } catch (err) {
      console.error("Failed to load leave dashboard", err);
    } finally {
      setLoading(false);
    }
  };

    const fetchLeaveRequests = async () => {
    try {
      const leaveRes = await axios.get("/hrms/leave/get-leave");
      console.log(leaveRes?.data?.leaveRequests )
      setPendingLeaves(leaveRes?.data?.leaveRequests || []);
    } catch (err) {
      console.error("Failed to load leaves", err);
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
              available={leave.availableThisYear}
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
          onResolved={(leaveId) =>
            setPendingLeaves((prev) =>
              prev.filter((l) => l.leaveId !== leaveId)
            )
          }
        />
      )}

     {applyLeaveContext && (
      <ApplyLeaveModal
         context={{
          ...applyLeaveContext,
          refreshCalendar: calendarRefreshRef.current,
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


// function LeaveCard({
//   title,
//   availableThisMonth,
//   availableThisYear,
//   taken,
//   carryForwarded,
//   unlimited,
//   isLWP,
//   canCarryForward,
//   isWindowed,
//   windowInfo,
// }) {
//   return (
//     <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">

//       <p className="text-sm font-medium text-gray-500">{title}</p>

//       {isLWP ? (
//         <p className="">
//           <span className="font-semibold text-3xl text-primaryText">{taken}</span> <span className="text-sm text-gray-500">Taken</span>
//         </p>
//       ) : (
//         <>
//           {isWindowed ? (<div>
//            <span className="text-3xl font-semibold text-primaryText">
//             {windowInfo.available}
//           </span>
//           <span className="text-sm text-gray-500"> available /{windowInfo.months} months</span>

//               <p className="text-sm  text-gray-500">
//                 <span className="font-semibold text-gray-500">
//                   {availableThisYear}
//                 </span>{" "}
//                 Available/ year
//               </p>
//               </div>
//           ) : (
//             <>
//               <span >
//                 <span className="font-semibold text-4xl text-primaryText">
//                   {availableThisMonth + carryForwarded}
//                 </span>{" "}
//                 <span className="text-sm text-gray-500">
//                 Available/ month</span>
//               </span>

//               <p className="text-sm text-gray-500">
//                 <span className="font-semibold ">
//                   {availableThisYear}
//                 </span>{" "}
//                 Available/ year
//               </p>
//             </>
//           )}

//           <div className="border-t border-dashed border-gray-200 my-2" />

//           {!unlimited && (
//             <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
//               <p>
//                 <span className="font-medium text-gray-800">{taken}</span>{" "}
//                 Taken
//               </p>

//               {canCarryForward && (
//                 <p>
//                   <span className="font-medium text-gray-800">
//                     {carryForwarded}
//                   </span>{" "}
//                   CF
//                 </p>
//               )}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

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
    primaryValue = availableThisMonth + (carryForwarded || 0);
    subLabel = "Available / Month";
  }

  const COLOR_MAP = {
    CL: "bg-blue-100 text-blue-600",
    EL: "bg-green-100 text-green-600",
    OL: "bg-purple-100 text-purple-600",
    LWP: "bg-gray-200 text-gray-700",
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
