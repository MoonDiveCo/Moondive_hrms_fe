"use client";

import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import HolidayEditModal from "./HolidayEditModal";
import { AuthContext } from "@/context/authContext";

const TYPE_COLOR_MAP = {
  PUBLIC: "#FF7B30",
  OPTIONAL: "#d05a15ff",
  INACTIVE: "#9ca3af",
};

export default function LeaveCalender() {
  const [events, setEvents] = useState([]);
const [selectedDay, setSelectedDay] = useState(null);
const [openModal, setOpenModal] = useState(false);
const [days, setDays] = useState([]);
const {user} = useContext(AuthContext)
const organizationId = user.organizationId;
const calendarRef = useRef(null);
const currentYear = new Date().getFullYear();

async function fetchMonthData(info) {
 const viewStart = info?.view?.currentStart || info?.start;

  const year = viewStart.getFullYear();
  const month = viewStart.getMonth() + 1;

  const res = await axios.get("/hrms/holiday", {
    params: { organizationId, year, month },
  });

  const fetchedDays = res.data?.result?.data || [];
  setDays(fetchedDays);

  const mappedEvents = fetchedDays.map((d) => {
    const dateStr = d.date.split("T")[0];

    const color = d.isActive
      ? TYPE_COLOR_MAP[d.type]
      : TYPE_COLOR_MAP.INACTIVE;

    return {
      title: d.name || d.type,
      start: dateStr,
      allDay: true,
      backgroundColor: color,
      borderColor: color,
      textColor: d.isActive ? "#ffffff" : "#374151",
    };
  });

  setEvents(mappedEvents);
}


function handleDayClick(dateStr) {
  const existingDay =
    days.find(
      (d) => d.date.split("T")[0] === dateStr
    ) || null;

  const jsDate = new Date(dateStr);
  const isWeekend = jsDate.getDay() === 0 || jsDate.getDay() === 6;

  setSelectedDay({
    date: dateStr,
    name: existingDay?.name || "",
    type: existingDay?.type || "PUBLIC",
    isActive: existingDay?.isActive ?? true,
    isWeekend,
    isNew: !existingDay,
  });

  setOpenModal(true);
}

function refreshCalendar() {
  const calendarApi = calendarRef.current?.getApi();
  if (!calendarApi) return;

  const view = calendarApi.view;
  fetchMonthData({
    start: view.currentStart,
  });
}



  return (<>
    <div className="bg-white border border-gray-300 rounded-2xl h-full flex-1 p-4">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="100%"
        expandRows
        fixedWeekCount={false}
        showNonCurrentDates={true}

        headerToolbar={{
          left: "prev title next",
          center: "",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}

          validRange={{
            start: `${currentYear}-01-01`,
            end: `${currentYear + 1}-01-01`,
          }}

        datesSet={fetchMonthData}
        events={events}
        dayMaxEventRows={3}
        eventDisplay="block"

        dateClick={(info) => handleDayClick(info.dateStr)}
        eventClick={(info) => handleDayClick(info.event.startStr)}
      />

    </div>
      {openModal && (
      <HolidayEditModal
        day={selectedDay}
        onClose={() => {
          setOpenModal(false);
           refreshCalendar();}
        }
        organizationId={organizationId}
      />
    )}
    </>
  );
}

