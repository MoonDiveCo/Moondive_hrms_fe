export function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export function getMonthDays(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthStartDay(year, month) {
  return new Date(year, month, 1).getDay(); // 0 = Sun
}

export function isSameDate(d1, d2) {
  return formatDate(d1) === formatDate(d2);
}
// utils/date.ts
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  isSameMonth,
  format,
  eachDayOfInterval
} from "date-fns";

export function getWeekRange(date) {
  return {
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 })
  };
}

export function formatRange(start, end) {
  return `${format(start, "dd-MMM-yyyy")} - ${format(end, "dd-MMM-yyyy")}`;
}

export function getWeekDays(start, end, month) {
  return eachDayOfInterval({ start, end }).filter(d =>
    isSameMonth(d, month)
  );
}

export function canGoPrev(weekStart, month) {
  return addWeeks(weekStart, -1) >= startOfMonth(month);
}

export function canGoNext(weekStart, month) {
  return addWeeks(weekStart, 1) <= endOfMonth(month);
}

