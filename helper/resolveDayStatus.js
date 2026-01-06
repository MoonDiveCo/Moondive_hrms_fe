// in @/helper/resolveDayStatus.js
export function resolveDayStatus({ dateObj, attendance, holiday, leave }) {
  // ✅ session-aware: check firstCheckIn OR checkIn
  const hasAttendance = attendance?.firstCheckIn || attendance?.checkIn;
  const isToday = dateObj.toDateString() === new Date().toDateString();

  // weekend
  if ([0, 6].includes(dateObj.getDay())) {
    return { status: "weekend", label: "Weekend" };
  }

  // holiday
  if (holiday?.type === "PUBLIC") {
    return { status: "holiday", label: holiday.name };
  }

  // leave
  if (leave) {
    if (leave.status === "First Half") {
      return { status: "leave-first-half", label: "LH" };
    }
    if (leave.status === "Second Half") {
      return { status: "leave-second-half", label: "SH" };
    }
    return { status: "leave", label: "Leave" };
  }

  // ✅ attendance exists → Present (even if legacy checkIn is null)
  if (hasAttendance) {
    return { status: "present", label: "Present" };
  }

  // no attendance record → Absent (only for past days)
  if (!isToday) {
    return { status: "absent", label: "Absent" };
  }

  // today with no record yet → neutral
  return { status: "pending", label: "" };
}
