"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function fetchAttendance({ rangeMode, currentDate }) {
  let params = { type: rangeMode };

  if (rangeMode === "month") {
    params.year = currentDate.getFullYear();
    params.month = currentDate.getMonth() + 1;
  } else {
    // week → send any date in the week
    params.day = currentDate.toISOString();
  }

  const res = await axios.get("/hrms/attendance", { params });
  const map = {};

  res.data.data.forEach((record) => {
    const key = new Date(record.date).toDateString();
    map[key] = record;
  });

  return map;
}

function buildKey({ rangeMode, date }) {
  if (rangeMode === "month") {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }
  return date.toISOString().slice(0, 10);
}

export function useAttendanceCalendar({ rangeMode, currentDate }) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["attendance", rangeMode, buildKey({ rangeMode, date: currentDate })],
    queryFn: () => fetchAttendance({ rangeMode, currentDate }),
    enabled: !!currentDate,
    staleTime: 5 * 60 * 1000,
  });
}