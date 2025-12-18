"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

const HOLIDAY_COLORS = {
  PUBLIC: "#FF7B30",
  OPTIONAL: "#d05a15ff",
};

const LEAVE_COLORS = {
  Approved: "#2563eb",
  Pending: "#f59e0b",
  Rejected: "#ef4444",
};

export default function HolidayCalender({
  organizationId,
  onApplyLeave,
  onViewLeave,
}) {
  const [events, setEvents] = useState([]);

  async function fetchCalendarData(info) {
    const year = info.start.getFullYear();
    const month = info.start.getMonth() + 1;

    const holidayRes = await axios.get("/hrms/holiday", {
      params: { organizationId, year, month },
    });

    const holidayEvents =
      holidayRes.data?.result?.data
        ?.filter((d) => d.isActive)
        .map((d) => ({
          title: d.name,
          start: d.date.split("T")[0],
          allDay: true,
          source: "HOLIDAY",
          backgroundColor: HOLIDAY_COLORS[d.type],
        })) || [];

    const leaveRes = await axios.get("/hrms/leave/get-leave", {
      params: { year, month },
    });
    console.log("Leave Res:", leaveRes.data.leaves);  

    const leaveEvents =
      leaveRes.data?.leaves?.map((l) => ({
        id: l.id,
        title: l.leaveType,
        start: l.startDate,
        end: l.endDate,
        allDay: true,
        source: "LEAVE",
        status: l.status,
        backgroundColor: LEAVE_COLORS[l.status],
      })) || [];

    setEvents([...holidayEvents, ...leaveEvents]);
  }

  console.log("Events:", events);

  function handleDateClick(info) {
    const date = new Date(info.dateStr);
    const day = date.getDay();

    if (day === 0 || day === 6) return;

    onApplyLeave(info.dateStr);
  }

  function handleEventClick(info) {
   const { extendedProps, startStr, title, endStr } = info.event;

    if (extendedProps?.source) {
      onViewLeave({extendedProps , startDate: startStr, endDate: endStr, title });
    }
  }

  return (
    <div className="bg-white rounded-2xl flex-1 h-full p-4">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        height="100%"
        showNonCurrentDates={false}
        fixedWeekCount={false}
        datesSet={fetchCalendarData}
        headerToolbar={{
          left: "prev title next",
          center: "",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventDisplay="block"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />
    </div>
  );
}
