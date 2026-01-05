// helper/time.js

// Parse ANY time format → minutes since midnight (0-1440)


// Current time as percentage (9 AM - 6 PM shift)
// helper/time.js

// Handles "09:42 AM", "09:42 PM", "09:42", or invalid
// helper/time.ts
// workStart / workEnd can later come from shift config
// const WORK_START = { h: 9, m: 0 };   // 09:00
// const WORK_END   = { h: 18, m: 0 };  // 18:00

// const WORK_START_MIN = WORK_START.h * 60 + WORK_START.m;
// const WORK_END_MIN   = WORK_END.h * 60 + WORK_END.m;
// const TOTAL_MIN     = WORK_END_MIN - WORK_START_MIN;
const WORK_START_MIN = 6 * 60; // 10:00 AM
const WORK_END_MIN   = 19 * 60; // 7:00 PM
const TOTAL_MIN = WORK_END_MIN - WORK_START_MIN;
// 
function parseDisplayTime(str) {
  const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;

  let [_, h, m, meridian] = match;
  h = Number(h);
  m = Number(m);
  if (meridian.toUpperCase() === "PM" && h !== 12) h += 12;
  if (meridian.toUpperCase() === "AM" && h === 12) h = 0;

  return h * 60 + m;
}
export function timeToPercent(time) {
  let minutes = null;

  if (time instanceof Date) {
    minutes = time.getHours() * 60 + time.getMinutes();
  } 
  else if (typeof time === "string") {

    if (!isNaN(Date.parse(time))) {

      const d = new Date(time);
      minutes = d.getHours() * 60 + d.getMinutes();
    } else {

      minutes = parseDisplayTime(time);

    }
  }

  if (minutes == null) return null;
  const clamped = Math.min(
    WORK_END_MIN,
    Math.max(WORK_START_MIN, minutes)
  );

  console.log("minutes",clamped)

console.log((clamped - WORK_START_MIN) / TOTAL_MIN * 100)

  return ((clamped - WORK_START_MIN) / TOTAL_MIN) * 100;
}






export function nowToPercent()  {
  return timeToPercent(new Date()) ;
}

export function diffTime(start) {
  if (!start) return null; // 👈 critical fix

  const [h, m] = start.split(":").map(Number);
  const startMin = h * 60 + m;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const diff = nowMin - startMin;

  if (diff < 0) return null;

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  return `${hours}h ${minutes}m`;
}

export function getNextDate(rangeMode, date) {
  const d = new Date(date);

  if (rangeMode === "month") {
    d.setMonth(d.getMonth() + 1);
  } else {
    d.setDate(d.getDate() + 7); // next week
  }

  return d;
}

export function getPrevDate(rangeMode, date) {
  const d = new Date(date);

  if (rangeMode === "month") {
    d.setMonth(d.getMonth() - 1);
  } else {
    d.setDate(d.getDate() - 7); // prev week
  }

  return d;
}

export function calculateWorkedHours(checkIn, checkOut = null) {
  if (!checkIn) return "00:00";

  const inDate = new Date(checkIn);
  if (isNaN(inDate.getTime())) return "00:00";

  const now = new Date();
  const rawOutDate = checkOut ? new Date(checkOut) : now;
  const outDate = isNaN(rawOutDate.getTime()) ? now : rawOutDate;

  const diffMs = Math.max(0, outDate - inDate);
  const minutes = Math.floor(diffMs / 60000);

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}