import { timeToPercent } from "@/helper/time";
import { useState,useEffect } from "react";
import { motion } from "framer-motion";
import { nowToPercent } from "@/helper/time";
export default function WorkingTimeline({ checkIn, checkOut }) {
  const start = timeToPercent(checkIn);

  const [liveEnd, setLiveEnd] = useState(
    checkOut ? timeToPercent(checkOut) : nowToPercent()
  );
  useEffect(() => {
    if (checkOut) return;

    const id = setInterval(() => {
      setLiveEnd(nowToPercent());
    }, 1000);

    return () => clearInterval(id);
  }, [checkOut]);

  if (start === null || liveEnd === null) {
    return (
      <div className="relative h-12 flex items-center">
        <div className="absolute h-[2px] w-full bg-gray-200" />
      </div>
    );
  }

  const width = Math.max(0, liveEnd - start);

  return (
    <div className="relative h-10 flex items-center">
      <div className="absolute h-[2px] w-full bg-gray-200" />

      <motion.div
        animate={{ width: `${width}%` }}
        transition={{ ease: "linear", duration: 0.8 }}
        className="absolute h-[2px] bg-green-500"
        style={{ left: `${start}%` }}
      />

      <div
        className="absolute w-2.5 h-2.5 bg-green-500 rounded-full"
        style={{ left: `${start}%` }}
      />

      <motion.div
        animate={{ left: `${liveEnd}%` }}
        transition={{ ease: "linear", duration: 0.8 }}
        className={`absolute w-2.5 h-2.5 rounded-full ${
          checkOut ? "bg-red-500" : "bg-green-400"
        }`}
      />
    </div>
  );
}

