"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { AuthContext } from "./authContext";
import { getGeolocation } from "@/helper/tracking";

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const { user, isSignedIn, loading } = useContext(AuthContext);

  // namespace storage per user (VERY IMPORTANT)
  const STORAGE_KEY = user ? `attendance_${user._id}` : null;

  const workTimerRef = useRef(null);
  const breakTimerRef = useRef(null);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [workedSeconds, setWorkedSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);

  /* ---------------- TIMER HELPERS ---------------- */

  const startWorkTimer = () => {
    if (workTimerRef.current) return;
    workTimerRef.current = setInterval(() => {
      setWorkedSeconds((s) => s + 1);
    }, 1000);
  };

  const stopWorkTimer = () => {
    clearInterval(workTimerRef.current);
    workTimerRef.current = null;
  };

  const startBreakTimer = () => {
    if (breakTimerRef.current) return;
    breakTimerRef.current = setInterval(() => {
      setBreakSeconds((s) => s + 1);
    }, 1000);
  };

  const stopBreakTimer = () => {
    clearInterval(breakTimerRef.current);
    breakTimerRef.current = null;
  };

  /* ---------------- CLEAR STATE ---------------- */

  const clearState = () => {
    stopWorkTimer();
    stopBreakTimer();

    setIsCheckedIn(false);
    setIsOnBreak(false);
    setWorkedSeconds(0);
    setBreakSeconds(0);

    if (STORAGE_KEY) {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  /* ---------------- API CALLS ---------------- */

  const checkIn = async () => {
    try {
        const geo = await getGeolocation();

    await axios.post("/hrms/attendance/checkin",{
          latitude: geo.latitude,
      longitude: geo.longitude,
      accuracy: geo.accuracy,
    });
    setIsCheckedIn(true);
    setIsOnBreak(false);
    startWorkTimer();
    } catch (err) {
         console.error("Check-in failed:", err?.message || err);
}
    
        
  };

  const checkOut = async () => {
    if (isOnBreak) return;
    await axios.put("/hrms/attendance/checkout");
    clearState();
  };

  const breakIn = async () => {
    await axios.put("/hrms/attendance/breakin");
    stopWorkTimer();
    setIsOnBreak(true);
    startBreakTimer();
  };

  const breakOut = async () => {
    await axios.put("/hrms/attendance/breakout");
    stopBreakTimer();
    setIsOnBreak(false);
    startWorkTimer();
  };

  /* ---------------- RESTORE FROM STORAGE ---------------- */
  useEffect(() => {
    if (loading) return;
    if (!isSignedIn) return;
    if (!STORAGE_KEY) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const data = JSON.parse(saved);

    setIsCheckedIn(data.isCheckedIn);
    setIsOnBreak(data.isOnBreak);
    setWorkedSeconds(data.workedSeconds);
    setBreakSeconds(data.breakSeconds);

    if (data.isCheckedIn && !data.isOnBreak) startWorkTimer();
    if (data.isOnBreak) startBreakTimer();
  }, [loading, isSignedIn, STORAGE_KEY]);

  /* ---------------- SAVE TO STORAGE ---------------- */
  useEffect(() => {
    if (!isSignedIn || !isCheckedIn) return;
    if (!STORAGE_KEY) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        isCheckedIn,
        isOnBreak,
        workedSeconds,
        breakSeconds,
      })
    );
  }, [isSignedIn, isCheckedIn, isOnBreak, workedSeconds, breakSeconds, STORAGE_KEY]);

  /* ---------------- CLEAR ON LOGOUT ---------------- */
  useEffect(() => {
    if (!loading && !isSignedIn) {
      clearState();
    }
  }, [loading, isSignedIn]);

  /* ---------------- CLEANUP ON UNMOUNT ---------------- */
  useEffect(() => {
    return () => {
      stopWorkTimer();
      stopBreakTimer();
    };
  }, []);

  return (
    <AttendanceContext.Provider
      value={{
        isCheckedIn,
        isOnBreak,
        workedSeconds,
        breakSeconds,
        checkIn,
        checkOut,
        breakIn,
        breakOut,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  return useContext(AttendanceContext);
}
