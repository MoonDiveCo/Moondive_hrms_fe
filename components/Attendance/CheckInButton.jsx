"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { ClockLoader } from "react-spinners";

const STORAGE_KEY = "hrms_checkin";

export default function CheckInButton() {
  const intervalRef = useRef(null);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const formatTime = (totalSeconds) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const startTimer = (startTime) => {
    intervalRef.current = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  };

  const handleCheckIn = () => {
    const startTime = Date.now();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ isCheckedIn: true, startTime })
    );
    setIsCheckedIn(true);
    startTimer(startTime);
  };

  const handleCheckOut = () => {
    clearInterval(intervalRef.current);
    localStorage.removeItem(STORAGE_KEY);
    setIsCheckedIn(false);
    setSeconds(0);
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const { isCheckedIn, startTime } = JSON.parse(saved);
    if (isCheckedIn) {
      setIsCheckedIn(true);
      startTimer(startTime);
    }

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
      className={`flex items-center justify-between px-5 py-2 rounded-lg shadow-md text-white min-w-[230px]
        ${isCheckedIn ? "bg-red-500" : "bg-green-500"}`}
    >
      {/* LEFT */}
      <div className="flex flex-col text-left">
        <span className="text-xs uppercase leading-none">
          {isCheckedIn ? "Check-out" : "Check-in"}
        </span>
        <span className="text-lg font-semibold leading-tight">
          {formatTime(seconds)} Hrs
        </span>
      </div>

      {/* RIGHT ICON — PACKAGE BASED (NO SVG BUGS) */}
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
        {isCheckedIn ? (
          <ClockLoader color="#EF4444" size={22} />
        ) : (
          <Clock size={18} className="text-green-500" />
        )}
      </div>
    </motion.button>
  );
}
