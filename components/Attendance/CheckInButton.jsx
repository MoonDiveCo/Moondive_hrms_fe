"use client";

import { motion } from "framer-motion";
import { Clock, Pause, Play, Coffee, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { ClockLoader } from "react-spinners";
import { toast } from "sonner"; // Sonner toaster
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
    loading, // assuming your context has a loading state
  } = useAttendance();

  const formatTime = (s) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(
      Math.floor((s % 3600) / 60)
    ).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleCheckIn = async () => {
    const promise = checkIn();
    toast.promise(promise, {
      loading: "Checking you in...",
      success: "Checked in successfully! Welcome to work 👋",
      error: "Failed to check in. Please try again.",
    });
  };

  const handleCheckOut = async () => {
    const promise = checkOut();
    toast.promise(promise, {
      loading: "Checking you out...",
      success: (data) => `Checked out! You worked ${formatTime(workedSeconds)} today 💼`,
      error: "Failed to check out. Try again.",
    });
  };

  const handleBreakIn = async () => {
    const promise = breakIn();
    toast.promise(promise, {
      loading: "Starting your break...",
      success: "Break started! Enjoy your coffee ☕",
      error: "Could not start break.",
    });
  };

  const handleBreakOut = async () => {
    const promise = breakOut();
    toast.promise(promise, {
      loading: "Ending break...",
      success: `Break ended. Back to work! You were on break for ${formatTime(breakSeconds)}`,
      error: "Could not end break.",
    });
  };

  return (
    <div className="flex items-center gap-5">
      {/* MAIN CHECK-IN / CHECK-OUT BUTTON */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        disabled={isOnBreak || loading}
        onClick={() => (isCheckedIn ? handleCheckOut() : handleCheckIn())}
        className={`
          relative overflow-hidden rounded-2xl px-8 py-5 text-white font-bold text-lg
          shadow-xl transition-all duration-300 flex items-center gap-5 min-w-[280px]
          ${isOnBreak || loading ? "opacity-70 cursor-not-allowed" : ""}
          ${isCheckedIn
            ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          }
        `}
      >
        {/* Pulsing Glow */}
        <motion.div
          className="absolute inset-0 bg-white opacity-20"
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Clock Icon with Live Animation */}
        <div className="relative w-12 h-12">
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" />
            <motion.line
              x1="24" y1="24" x2="24" y2="10"
              stroke="currentColor" strokeWidth="3" strokeLinecap="round"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
            <circle cx="24" cy="24" r="4" fill="currentColor" />
          </svg>
        </div>

        <div className="text-left">
          <div className="text-sm uppercase tracking-wider opacity-90">
            {isCheckedIn ? "Check Out Now" : "Check In"}
          </div>
          <motion.div
            key={workedSeconds}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-mono font-bold mt-1"
          >
            {formatTime(workedSeconds)}
          </motion.div>
          <div className="text-xs opacity-80">Worked Today</div>
        </div>

        <motion.div animate={{ x: isCheckedIn ? [0, 5, 0] : 0 }}>
          {isCheckedIn ? <Pause size={28} /> : <Play size={28} />}
        </motion.div>
      </motion.button>

      {/* BREAK BUTTON */}
      {isCheckedIn && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => (isOnBreak ? handleBreakOut() : handleBreakIn())}
          className={`
            rounded-2xl px-6 py-5 font-bold text-lg shadow-lg flex items-center gap-4
            ${isOnBreak
              ? "bg-gradient-to-r from-amber-500 to-orange-600"
              : "bg-gradient-to-r from-blue-500 to-indigo-600"
            } text-white
          `}
        >
          <motion.div
            animate={{ rotate: isOnBreak ? 360 : 0 }}
            transition={{ duration: 20, repeat: isOnBreak ? Infinity : 0, ease: "linear" }}
          >
            {isOnBreak ? <Coffee size={26} /> : <Play size={26} />}
          </motion.div>
          <div>
            <div className="text-sm uppercase">{isOnBreak ? "End Break" : "Start Break"}</div>
            {isOnBreak && (
              <motion.div
                key={breakSeconds}
                className="text-lg font-mono"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                {formatTime(breakSeconds)}
              </motion.div>
            )}
          </div>
        </motion.button>
      )}
    </div>
  );
}