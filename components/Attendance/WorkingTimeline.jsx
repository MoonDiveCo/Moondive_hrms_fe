import { timeToPercent, nowToPercent } from "@/helper/time";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

const SHIFT_START = "09:00";
const SHIFT_END = "18:00";

/* ---------- SHIFT META ---------- */
function getShiftMeta() {
  const start = timeToPercent(SHIFT_START);
  const end = timeToPercent(SHIFT_END);

  if (start == null || end == null) return null;

  return {
    start,
    mid: start + (end - start) / 2,
    end,
  };
}

export default function WorkingTimeline({
  checkIn,
  checkOut,
  leaveSession = null, // "FIRST_HALF" | "SECOND_HALF" | null
}) {
  const shift = useMemo(getShiftMeta, []);

  /* ---------- RAW TIMES ---------- */
  const rawStart = timeToPercent(checkIn);
  const rawNow = nowToPercent(checkIn);
  const rawEnd = checkOut ? timeToPercent(checkOut) : rawNow;

  /* ---------- IGNORE BACKEND CHECKIN FOR SECOND HALF ---------- */
  const safeRawStart = rawStart;

  /* ---------- START POSITION ---------- */
  const start = useMemo(() => {
    if (!shift) return safeRawStart;

    if (leaveSession === "FIRST_HALF") {
      return Math.max(safeRawStart ?? shift.mid, shift.mid);
    }

    if (leaveSession === "SECOND_HALF") {
      // Show actual check-in time if available, otherwise shift start
      return safeRawStart ?? shift.start;
    }

    return safeRawStart;
  }, [safeRawStart, leaveSession, shift]);

  /* ---------- END POSITION ---------- */
  const end = useMemo(() => {
    if (!shift) return rawEnd;

    if (leaveSession === "SECOND_HALF") {
      return shift.mid;
    }

    return rawEnd;
  }, [rawEnd, leaveSession, shift]);

  /* ---------- LIVE END ---------- */
  const [liveEnd, setLiveEnd] = useState(() => {
    if (leaveSession === "SECOND_HALF" && shift) {
      return shift.mid;
    }
    return end;
  });

  /* ---------- LIVE UPDATE ---------- */
  useEffect(() => {
    if (!shift) return;
    if (checkOut) return;
    if (leaveSession === "SECOND_HALF") return; // freeze at mid

    const id = setInterval(() => {
      const now = nowToPercent(checkIn);

      setLiveEnd(
        leaveSession === "FIRST_HALF"
          ? Math.max(now, shift.mid)
          : now
      );
    }, 1000);

    return () => clearInterval(id);
  }, [checkOut, checkIn, leaveSession, shift]);

  /* ---------- SAFETY ---------- */
  if (start == null || liveEnd == null) {
    return (
      <div className="relative h-10 flex items-center">
        <div className="absolute h-[2px] w-full bg-gray-200" />
      </div>
    );
  }

  const width = Math.max(0, liveEnd - start);

  return (
    <div className="relative h-10 flex items-center">
      {/* Base line */}
      <div className="absolute h-[2px] w-full bg-gray-200" />

      {/* Worked range */}
      <motion.div
        animate={{ width: `${width}%` }}
        transition={{ ease: "linear", duration: 0.5 }}
        className="absolute h-[2px] bg-green-500"
        style={{ left: `${start}%` }}
      />

      {/* Start dot */}
      <div
        className="absolute w-2.5 h-2.5 bg-green-500 rounded-full"
        style={{ left: `${start}%` }}
      />

      {/* End dot */}
      <motion.div
        animate={{ left: `${liveEnd}%` }}
        transition={{ ease: "linear", duration: 0.5 }}
        className={`absolute w-2.5 h-2.5 rounded-full ${
          checkOut || leaveSession === "SECOND_HALF"
            ? "bg-red-500"
            : "bg-green-400"
        }`}
      />
    </div>
  );
}
