"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AuthContext } from "@/context/authContext";
import { useContext } from "react";

/**
 * Fetch holidays for an organization & year
 */
async function fetchHolidays({ organizationId, year }) {
  const res = await axios.get("/hrms/holiday", {
    params: {
      organizationId,
      year,
    },
  });

  // API returns: response.success({ data: holidays.days })
  const days = res.data?.result?.data || [];

  // Normalize into map for O(1) lookup
  const map = {};
  days.forEach((day) => {
    const key = new Date(day.date).toDateString();
    map[key] = day;
  });

  return map;
}

/**
 * Read holidays from React Query cache
 */
export function useHolidays(year) {
  const { user } = useContext(AuthContext);
  const organizationId = user?.organizationId;

  return useQuery({
    queryKey: ["holidays", organizationId, year],

    queryFn: () =>
      fetchHolidays({
        organizationId,
        year,
      }),

    enabled: !!organizationId && !!year,

    // Holidays are stable → aggressive caching
    staleTime: 24 * 60 * 60 * 1000,      // 1 day
    cacheTime: 7 * 24 * 60 * 60 * 1000,  // 7 days

    refetchOnWindowFocus: false,
  });
}
