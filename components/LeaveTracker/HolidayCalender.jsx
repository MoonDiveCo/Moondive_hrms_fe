"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function HolidayCalender() {
  return (
    <div className="bg-white rounded-2xl h-full flex-1  p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="100%"
        expandRows={true}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}

        buttonText={{
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
        }}

        dayMaxEventRows={3}
        fixedWeekCount={false}
        showNonCurrentDates={false}

        events={[
          {
            title: "Team Meeting",
            start: "2025-12-10T10:00:00",
          },
          {
            title: "Christmas",
            start: "2025-12-25",
            display: "background",
            backgroundColor: "rgba(239,68,68,0.12)",
          },
        ]}

        dateClick={(info) => {
          alert(`Apply Leave: ${info.dateStr}`);
        }}

        eventClick={(info) => {
          alert(info.event.title);
        }}
      />
    </div>
  );
}
