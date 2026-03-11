"use client";

import React, { useEffect, useState } from "react";

export default function MobileBlocker() {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      const hasTouch = "maxTouchPoints" in navigator && navigator.maxTouchPoints > 0;
      const isSmallPhysicalScreen = window.screen.width <= 1024; 

      if (isMobileUserAgent || (hasTouch && isSmallPhysicalScreen)) {
        setIsBlocked(true);
        document.body.style.overflow = "hidden";
      } else {
        setIsBlocked(false);
        document.body.style.overflow = "unset";
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isBlocked) return null;

  return (
    <div className="fixed inset-0 bg-white z-[99999] flex flex-col items-center justify-center p-6 text-center">
      <svg
        className="w-16 h-16 text-primary mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Desktop Only</h2>
      <p className="text-gray-600">
        This application is customized for desktop experience. Please use a desktop browser to access it.
      </p>
      <p className="text-red-500 mt-4 text-sm font-semibold">
        Mobile devices are not supported.
      </p>
    </div>
  );
}
