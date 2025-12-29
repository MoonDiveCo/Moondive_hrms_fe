"use client";

import { motion } from "framer-motion";
import { Clock, Pause, Play } from "lucide-react";
import { ClockLoader } from "react-spinners";
import { useAttendance } from "@/context/attendanceContext";

export default function CheckInButton() {
  const {
    isCheckedIn,
    isOnBreak,
    workedSeconds,
    breakSeconds,
    checkIn,
    checkOut,
    breakIn,
    breakOut,
  } = useAttendance();

  const formatTime = (s) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(
      Math.floor((s % 3600) / 60)
    ).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex gap-4 items-center">
      <motion.button
        whileTap={{ scale: 0.95 }}
        disabled={isOnBreak}
        onClick={() => (isCheckedIn ? checkOut() : checkIn())}
        className={`px-5 py-2 rounded-lg text-white min-w-[120px]
        ${
          isOnBreak
            ? "bg-gray-400 cursor-not-allowed"
            : isCheckedIn
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs uppercase">
              {isCheckedIn ? "Check-out" : "Check-in"}
            </div>
            <div className="text-xs font-semibold">
              {formatTime(workedSeconds)} Hrs
            </div>
          </div>
          <div className="bg-white rounded-full p-1">
            {isCheckedIn ? <ClockLoader size={18} color="#ffffff"/> : <Clock size={18} />}
          </div>
        </div>
      </motion.button>

      {isCheckedIn && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => (isOnBreak ? breakOut() : breakIn())}
          className={`px-2 py-2 rounded-xl text-white min-w-[100px]
          ${
            isOnBreak
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isOnBreak ? "End Break" : "Start Break"}
        </motion.button>
      )}

      {isOnBreak && (
        <div className="px-2 py-2 rounded-xl bg-yellow-100 text-yellow-800 font-semibold">
          Break Time: {formatTime(breakSeconds)}
        </div>
      )}
    </div>
  );
}
