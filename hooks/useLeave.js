"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchLeaves({ type, value, userId }) {
  if (!userId) return {}; // safety

  const res = await axios.get("/hrms/leave/get-leave-range", {
    params: { type, value },
  });

  const leaves = res.data?.leaves || [];
  leaves.forEach((l) => {
  });
  const map = {};

  leaves.forEach((leave) => {
    if (String(leave.employeeId) !== String(userId)) return;

    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const startNorm = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    const endNorm = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

    let cursor = new Date(startNorm);


    while (cursor.getTime() <= endNorm.getTime()) {     
      const localDateForKey = new Date(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate());
      const key = localDateForKey.toDateString();

      if (!leave.isHalfDay && leave.leaveStatus === "Approved") {
        map[key] = {
          leaveType: leave.leaveType,
          isHalfDay: false,
          session: null,
          leaveStatus: leave.leaveStatus
        };
      }

      if (leave.isHalfDay && leave.leaveStatus === "Approved") {
        const startLocal = new Date(startNorm.getUTCFullYear(), startNorm.getUTCMonth(), startNorm.getUTCDate());
        const endLocal = new Date(endNorm.getUTCFullYear(), endNorm.getUTCMonth(), endNorm.getUTCDate());
        const startKey = startLocal.toDateString();
        const endKey = endLocal.toDateString();

        if (leave.session === "First Half" && key === startKey) {
          map[key] = {
            leaveType: leave.leaveType,
            isHalfDay: true,
            session: "First Half",
            leaveStatus: leave.leaveStatus
          };
        } else if (leave.session === "Second Half" && key === endKey) {
          map[key] = {
            leaveType: leave.leaveType,
            isHalfDay: true,
            session: "Second Half",
            leaveStatus: leave.leaveStatus
          };
        }
      }
      
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }
  });

  return map;
}

export function useLeaves({ rangeMode, currentDate, userId }) {
  const value =
    rangeMode === "month"
      ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`
      : currentDate.toISOString().slice(0, 10);

  return useQuery({
    queryKey: ["leaves", userId, rangeMode, value],
    queryFn: () => fetchLeaves({ type: rangeMode, value, userId }),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
