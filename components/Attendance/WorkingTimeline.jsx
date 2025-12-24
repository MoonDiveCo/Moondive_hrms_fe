"use client"
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { timeToPercent, nowToPercent } from "@/helper/time";

export default function WorkingTimeline({ inTime, outTime }) {
  const start = timeToPercent(inTime);
  const [liveEnd, setLiveEnd] = useState(
    outTime ? timeToPercent(outTime) : nowToPercent()
  );

  // 🔁 Live ticking
  useEffect(() => {
    if (outTime) return;

    const interval = setInterval(() => {
      setLiveEnd(nowToPercent());
    }, 1000);

    return () => clearInterval(interval);
  }, [outTime]);

  if (start === null) {
    return (
      <div className="relative h-12 flex items-center">
        <div className="absolute h-[2px] w-full bg-gray-200" />
      </div>
    );
  }

  const width = Math.max(0, liveEnd - start);

  return (
    <div className="relative h-12 flex items-center">
      {/* base */}
      <div className="absolute h-[2px] w-full bg-gray-200" />

      {/* animated fill */}
      <motion.div
        animate={{ width: `${width}%` }}
        transition={{ ease: "linear", duration: 0.8 }}
        className="absolute h-[2px] bg-blue-500"
        style={{ left: `${start}%` }}
      />

      {/* check-in dot */}
      <div
        className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full"
        style={{ left: `${start}%` }}
      />

      {/* live / checkout dot */}
      <motion.div
        animate={{ left: `${liveEnd}%` }}
        transition={{ ease: "linear", duration: 0.8 }}
        className={`absolute w-2.5 h-2.5 rounded-full ${
          outTime ? "bg-green-500" : "bg-blue-400"
        }`}
      />
    </div>
  );
}
