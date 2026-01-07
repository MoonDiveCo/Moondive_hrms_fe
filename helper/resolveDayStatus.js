// @/helper/resolveDayStatus.js
import { isAfter, startOfDay } from "date-fns";

// @/helper/resolveDayStatus.js
export function resolveDayStatus({ dateObj, attendance, holiday, leave }) {
  const isToday = dateObj.toDateString() === new Date().toDateString();
  const isFuture = dateObj > new Date();
  const hasAttendance = attendance?.firstCheckIn || attendance?.checkIn;

  const day = dateObj.getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = day === 0 || day === 6;

  // ✅ 1. WEEKEND — ALWAYS
  if (isWeekend) {
    return { status: 'weekend', label: 'Weekend' };
  }

  // ✅ 2. HOLIDAY
  if (holiday?.type === 'PUBLIC') {
    return { status: 'holiday', label: holiday.name };
  }

  // ✅ 3. LEAVE
  if (leave) {
    if (leave.status === 'First Half') {
      return { status: 'leave-first-half', label: 'LH' };
    }
    if (leave.status === 'Second Half') {
      return { status: 'leave-second-half', label: 'SH' };
    }
    return { status: 'leave', label: 'Leave' };
  }

  // ✅ 4. PRESENT
  if (hasAttendance) {
    return { status: 'present', label: 'Present' };
  }

  // ✅ 5. FUTURE WORKING DAY (NO STATUS)
  if (isFuture) {
    return { status: 'future', label: '' };
  }

  // ✅ 6. TODAY BUT NO CHECK-IN YET
  if (isToday) {
    return { status: 'pending', label: '' };
  }

  // ✅ 7. PAST WORKING DAY WITHOUT ATTENDANCE
  return { status: 'absent', label: 'Absent' };
}

