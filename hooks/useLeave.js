"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchLeaves({ type, value, userId }) {
  if (!userId) return {}; // safety

  const res = await axios.get("/hrms/leave/get-leave-range", {
    params: { type, value },
  });

  const leaves = res.data?.leaves || [];
  const map = {};

  leaves.forEach((leave) => {
    // Filter by the passed userId only
    if (leave.employeeId !== userId) return;

    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);

    let cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    while (cursor <= end) {
      const key = new Date(cursor).toDateString();

      // Default: full day
      map[key] = {
        leaveType: leave.leaveType,
        isHalfDay: false,
        session: null,
      };

      if (leave.isHalfDay) {
        const startKey = new Date(start).toDateString();
        const endKey = new Date(end).toDateString();

        if (leave.session === "First Half" && key === startKey) {
          map[key] = {
            leaveType: leave.leaveType,
            isHalfDay: true,
            session: "First Half",
          };
        } else if (leave.session === "Second Half" && key === endKey) {
          map[key] = {
            leaveType: leave.leaveType,
            isHalfDay: true,
            session: "Second Half",
          };
        }
      }

      cursor.setDate(cursor.getDate() + 1);
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
    enabled: !!userId, // don't fetch if no user
    staleTime: 5 * 60 * 1000,
  });
}