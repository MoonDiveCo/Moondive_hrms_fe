"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { AuthContext } from "./authContext";
import { getGeolocation } from "@/helper/tracking";
import { useQueryClient } from "@tanstack/react-query";

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const { user, isSignedIn, loading } = useContext(AuthContext);
const queryClient = useQueryClient();

  const workTimerRef = useRef(null);
  const breakTimerRef = useRef(null);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [workedSeconds, setWorkedSeconds] = useState(0);     // Total worked (excluding breaks) - from backend
  const [breakSeconds, setBreakSeconds] = useState(0);       // Total break time today - from backend
  const [currentBreakElapsed, setCurrentBreakElapsed] = useState(0); // Only for live current break
  const [isCheckedOut,setIsCheckedOut] = useState(false)
  /* ---------------- TIMER CONTROL ---------------- */

  const stopWorkTimer = () => {
    if (workTimerRef.current) clearInterval(workTimerRef.current);
    workTimerRef.current = null;
  };

  const stopBreakTimer = () => {
    if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    breakTimerRef.current = null;
  };

  const startWorkTimer = () => {
     if (!isCheckedIn ) return;
    stopBreakTimer();
    if (workTimerRef.current) return;

    workTimerRef.current = setInterval(() => {
      setWorkedSeconds(prev => prev + 1 );
    }, 1000);
  };

  const startCurrentBreakTimer = () => {
    stopWorkTimer();
    if (breakTimerRef.current) return;

    
    breakTimerRef.current = setInterval(() => {
      setBreakSeconds(prev => prev + 1);
    }, 1000);
  };

  const clearState = () => {
    stopWorkTimer();
    stopBreakTimer();
    // setIsCheckedIn(false);
    // setIsOnBreak(false);
    // setWorkedSeconds(0);
    // setBreakSeconds(0);
    // setCurrentBreakElapsed(0);
  };

  /* ---------------- SYNC FROM BACKEND ---------------- */
const updateTodayInCalendar = (status) => {
  const todayKey = new Date().toDateString();

  queryClient.setQueriesData(
    { queryKey: ["attendance"] },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        [todayKey]: {
          ...(old[todayKey] || {}),
          status,
          date: new Date(),
        },
      };
    }
  );
};

  const syncFromBackend = async () => {
    try {
      const res = await axios.get("/hrms/attendance/today");
      const {
        isCheckedIn,
        isOnBreak,
        workedSeconds = 0,
        breakSeconds = 0,
        currentBreakStart,
        isCheckedOut
      } = res.data;

      setIsCheckedIn(isCheckedIn);
      setIsOnBreak(isOnBreak);
      setWorkedSeconds(workedSeconds);
      setBreakSeconds(breakSeconds);
      setIsCheckedOut(isCheckedOut)
      if (isOnBreak && currentBreakStart) {
        const start = new Date(currentBreakStart);
        const elapsed = Math.floor((Date.now() - start.getTime()) / 1000);
        setCurrentBreakElapsed(elapsed >= 0 ? elapsed : 0);
      } else {
        setCurrentBreakElapsed(0);
      }
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  useEffect(() => {
    if (loading || !isSignedIn) return;
    syncFromBackend();
  }, [loading, isSignedIn]);

  /* ---------------- TIMER LOGIC ---------------- */

  useEffect(() => {
    if (!isCheckedIn || isCheckedOut) {
      stopWorkTimer();
      stopBreakTimer();
      return;
    }

    if (isOnBreak) {
      startCurrentBreakTimer();
    } else {
      startWorkTimer();
    }
  }, [isCheckedIn,isCheckedOut, isOnBreak]);

  /* ---------------- ACTIONS ---------------- */

  const checkIn = async () => {
    try {
      const geo = await getGeolocation();
      await axios.post("/hrms/attendance/checkin", {
        latitude: geo.latitude,
        longitude: geo.longitude,
        accuracy: geo.accuracy,
      });
        updateTodayInCalendar("Present");

      await syncFromBackend();
          queryClient.invalidateQueries({ queryKey: ["attendance"] });

      return { message: "Checked in successfully" };
    } catch (err) {
      throw err.response?.data || { message: "Check-in failed" };
    }
  };

  const checkOut = async () => {
    try {
      if (isOnBreak) throw { message: "Please end your break first" };
    stopWorkTimer();
    stopBreakTimer();  
      await axios.put("/hrms/attendance/checkout");
         updateTodayInCalendar("Present");


//  setIsCheckedIn(false);
    setIsOnBreak(false);
    setCurrentBreakElapsed(0);
 
    await syncFromBackend()
        queryClient.invalidateQueries({ queryKey: ["attendance"] });

      return { message: "Checked out successfully" };
    } catch (err) {
      throw err.response?.data || { message: "Check-out failed" };
    }
  };

  const breakIn = async () => {
    try {
      await axios.put("/hrms/attendance/breakin");
      await syncFromBackend();
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      return { message: "Break started" };
    } catch (err) {
      throw err.response?.data || { message: "Could not start break" };
    }
  };

  const breakOut = async () => {
    try {
      await axios.put("/hrms/attendance/breakout");
      stopBreakTimer();
      setCurrentBreakElapsed(0);
      await syncFromBackend();
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      return { message: "Break ended" };
    } catch (err) {
      throw err.response?.data || { message: "Could not end break" };
    }
  };

  /* ---------------- CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      stopWorkTimer();
      stopBreakTimer();
    };
  }, []);

  useEffect(() => {
    if (!loading && !isSignedIn) clearState();
  }, [loading, isSignedIn]);

  return (
    <AttendanceContext.Provider
      value={{
        isCheckedIn,
        isOnBreak,
        workedSeconds,
        breakSeconds,
        currentBreakElapsed,
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