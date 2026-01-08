"use client";

import { useEffect, useRef, useState } from "react";
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
  onRefresh,
}) {
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  // const currentYear = new Date().getFullYear();
  async function fetchCalendarData(info) {
      const viewStart = info?.view?.currentStart || info.start;

      const year = viewStart.getFullYear();
      const month = viewStart.getMonth() + 1;

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

    const leaveEvents =
      leaveRes.data?.leaves
      ?.filter((l) => l.status !== "Pending")
      .map((l) => ({
        id: l.id,
        title: l.leaveType,
        start: l.startDate,
        end: l.endDate,
        allDay: l.isHalfDay,
        session: l.isHalfDay ? l.session : "Full Day",
        source: "LEAVE",
        status: l.status,
        backgroundColor: LEAVE_COLORS[l.status],
      })) || [];
    setEvents([...holidayEvents, ...leaveEvents]);
  }

function handleDateClick(info) {
  const clickedDate = new Date(info.dateStr);
  clickedDate.setHours(0, 0, 0, 0);
  const today = new Date();
today.setHours(0, 0, 0, 0);


  const day = clickedDate.getDay();

  if (day === 0 || day === 6) return;

  if (clickedDate < today) return;

  onApplyLeave(info.dateStr, refreshCalendar);
}


  function handleEventClick(info) {
   const { extendedProps, startStr, title, endStr } = info.event;
    if (extendedProps?.source) {
      onViewLeave({extendedProps , startDate: startStr, endDate: endStr, title });
    }
  }

    function refreshCalendar() {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    api.removeAllEvents();

    fetchCalendarData({
      view: api.view,
      start: api.view.currentStart,
    });
  }

    useEffect(() => {
    onRefresh?.(refreshCalendar);
  }, []);

  return (
    <div className="bg-white border border-gray-300 rounded-2xl flex-1 h-full p-4">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        height="100%"
        showNonCurrentDates={false}
        fixedWeekCount={false}
        
        // validRange={{
        //     start: `${currentYear}-01-01`,
        //     end: `${currentYear + 1}-01-01`,
        //   }}
        datesSet={fetchCalendarData}
        displayEventTime={false}
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

      <div className="pt-6 pb-3 flex flex-wrap items-center gap-6 text-xs text-gray-600">
        
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-500">Holidays:</span>

          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: HOLIDAY_COLORS.PUBLIC }}
            />
            <span>Public</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: HOLIDAY_COLORS.OPTIONAL }}
            />
            <span>Optional</span>
          </div>
        </div>

        <span className="h-4 w-px bg-gray-300" />

        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-500">Leaves:</span>

          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: LEAVE_COLORS.Approved }}
            />
            <span>Approved</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: LEAVE_COLORS.Pending }}
            />
            <span>Pending</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: LEAVE_COLORS.Rejected }}
            />
            <span>Rejected</span>
          </div>
        </div>
      </div>

    </div>
  );
}
