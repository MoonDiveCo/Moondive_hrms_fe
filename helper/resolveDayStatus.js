export function resolveDayStatus({ dateObj, attendance, holiday, leave }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateObj);
  date.setHours(0, 0, 0, 0);

  const isTodayOrPast = date <= today;
  const isFuture = date > today;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  // 1. Leave - highest priority
  if (leave) {
    if (leave.isHalfDay) {
      return {
        status:
          leave.session === "First Half" ? "leave-first-half" : "leave-second-half",
        label: leave.session === "First Half" ? "Leave (1st Half)" : "Leave (2nd Half)",
      };
    }
    return {
      status: "leave",
      label: leave.leaveType || "Full Day Leave",
    };
  }

  // 2. Holiday
  if (holiday?.isActive && (holiday.type === "PUBLIC" || holiday.type === "OPTIONAL")) {
    return {
      status: "holiday",
      label: holiday.name,
    };
  }

  // 3. Present (has checkIn)
  if (attendance?.checkIn) {
    return { status: "present", label: "Present" };
  }

  // 4. Weekend
  if (isWeekend) {
    return { status: "weekend", label: "Weekend" };
  }

  // 5. Future
  if (isFuture) {
    return { status: "future", label: "--" };
  }

  // 6. Absent
  return { status: "absent", label: "Absent" };
}