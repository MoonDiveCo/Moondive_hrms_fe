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
