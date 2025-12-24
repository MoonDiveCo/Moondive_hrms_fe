"use client";
import Timeline from "react-visjs-timeline";

export default function AttendanceTimeline() {
  const options = {
    start: new Date("2025-12-21 09:00"),
    end: new Date("2025-12-27 18:00"),
    min: new Date("2025-12-21 09:00"),
    max: new Date("2025-12-27 18:00"),

    showCurrentTime: true,
    stack: false,
    zoomable: false,
    moveable: false,
    orientation: "top",

    timeAxis: {
      scale: "hour",
      step: 1,
    },
  };

  const groups = [
    { id: 1, content: "Sun 21" },
    { id: 2, content: "Mon 22" },
    { id: 3, content: "Tue 23" },
    { id: 4, content: "Wed 24" },
    { id: 5, content: "Thu 25" },
    { id: 6, content: "Fri 26" },
    { id: 7, content: "Sat 27" },
  ];

  const items = [
    // Weekend
    {
      id: 1,
      group: 1,
      content: "Weekend",
      start: "2025-12-21 09:00",
      end: "2025-12-21 18:00",
      className: "weekend",
    },

    // Absent
    {
      id: 2,
      group: 2,
      content: "Absent",
      start: "2025-12-22 09:00",
      end: "2025-12-22 18:00",
      className: "absent",
    },

    // Worked (checked out)
    {
      id: 3,
      group: 3,
      content: "",
      start: "2025-12-23 16:16",
      end: "2025-12-23 16:28",
      className: "worked",
    },

    // Worked (live)
    {
      id: 4,
      group: 4,
      content: "",
      start: "2025-12-24 10:16",
      end: new Date(),
      className: "worked",
    },

    // Weekend
    {
      id: 5,
      group: 7,
      content: "Weekend",
      start: "2025-12-27 09:00",
      end: "2025-12-27 18:00",
      className: "weekend",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <Timeline options={options} items={items} groups={groups} />
    </div>
  );
}
