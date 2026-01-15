"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { AuthContext } from "./authContext";
import { useNotifications } from "./notificationcontext";
import { getGeolocation } from "@/helper/tracking";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const { user, isSignedIn, loading,  } =
    useContext(AuthContext);
  const { storeNotification } = useNotifications();
  const queryClient = useQueryClient();

  const workTimerRef = useRef(null);
  const breakTimerRef = useRef(null);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [workedSeconds, setWorkedSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [currentBreakElapsed, setCurrentBreakElapsed] = useState(0);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [userData,setUserData]=useState(null)
 
  /* ---------------- TIMER CONTROL ---------------- */
    const fetchUserssData=async()=>{
    try{
      const res=await axios.get("/hrms/roles/get-employee")
      console.log("xxxxxxxxxxx",res)
      setUserData(res.data.result)
  }catch(err){
      console.log("Failed to fetch user data for attendance context:",err)
    }}
    useEffect(()=>{if(isSignedIn) fetchUserssData()},[ isSignedIn])


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
    if (!isCheckedIn) return;
    stopBreakTimer();
    if (workTimerRef.current) return;

    workTimerRef.current = setInterval(() => {
      setWorkedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const startCurrentBreakTimer = () => {
    stopWorkTimer();
    if (breakTimerRef.current) return;

    breakTimerRef.current = setInterval(() => {
      setBreakSeconds((prev) => prev + 1);
    }, 1000);
  };

  const clearState = () => {
    stopWorkTimer();
    stopBreakTimer();
  };

  /* ---------------- SYNC FROM BACKEND ---------------- */

  const updateTodayInCalendar = (status) => {
    const todayKey = new Date().toDateString();

    queryClient.setQueriesData({ queryKey: ["attendance"] }, (old) => {
      if (!old) return old;

      return {
        ...old,
        [todayKey]: {
          ...(old[todayKey] || {}),
          status,
          date: new Date(),
        },
      };
    });
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
        isCheckedOut,
      } = res.data;

      setIsCheckedIn(isCheckedIn);
      setIsOnBreak(isOnBreak);
      setWorkedSeconds(workedSeconds);
      setBreakSeconds(breakSeconds);
      setIsCheckedOut(isCheckedOut);

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
    if (!isCheckedIn) {
      stopWorkTimer();
      stopBreakTimer();
      return;
    }

    if (isOnBreak) {
      startCurrentBreakTimer();
    } else {
      startWorkTimer();
    }
  }, [isCheckedIn, isOnBreak]);

  /* ---------------- LATE CHECK-IN NOTIFICATION ---------------- */
const getCurrentEmployee = () => {
  if (!userData || !user?._id) return null;

  return userData.find(
    (u) => u._id === user._id || u.userId === user._id
  );
};

const sendLateNotifications = async (lateData) => {
  const { minutesLate, checkInTime, shiftStartTime } = lateData;

  try {
    const notified = new Set();
    const currentEmployee = getCurrentEmployee();

    const notify = async ({ receiverId, ...payload }) => {
      if (!receiverId || notified.has(receiverId)) return;
      notified.add(receiverId);
      await storeNotification({ receiverId, ...payload });
    };

    /* 1️⃣ EMPLOYEE */
    await notify({
      receiverId: user._id,
      notificationTitle: "⏰ Late Check-In Alert",
      notificationMessage: `You checked in ${minutesLate} minutes late. Shift started at ${shiftStartTime}.`,
      relatedDomainType: "Attendance",
      priority: "Medium",
    });

    /* 2️⃣ REPORTING MANAGER (ONLY ONE) */
    const reportingManagerId =
      currentEmployee?.reportingManagerId?._id ||
      currentEmployee?.reportingManagerId;

    if (reportingManagerId) {
      await notify({
        receiverId: reportingManagerId,
        notificationTitle: " Late Check-In",
        notificationMessage: `${user.name} checked in ${minutesLate} minutes late at ${checkInTime}.`,
        relatedDomainType: "Attendance",
        priority: "Medium",
        senderId: user._id,
      });
    }

    /* 3️⃣ HR / ADMIN / SUPERADMIN */
    for (const u of userData || []) {
      if (u._id === reportingManagerId) continue; // ⛔ avoid duplicate

      if (u.userRole?.includes("HR")) {
        await notify({
          receiverId: u._id,
          notificationTitle: "⏰ Late Check-In (HR)",
          notificationMessage: `${user.name} checked in ${minutesLate} minutes late at ${checkInTime}.`,
          relatedDomainType: "Attendance",
          priority: "Low",
          senderId: user._id,
        });
      }

      if (u.userRole?.includes("Admin")) {
        await notify({
          receiverId: u._id,
          notificationTitle: "🚨 Late Check-In (Admin)",
          notificationMessage: `${user.name} checked in ${minutesLate} minutes late at ${checkInTime}.`,
          relatedDomainType: "Attendance",
          priority: "High",
          senderId: user._id,
        });
      }

      if (u.userRole?.includes("SuperAdmin")) {
        await notify({
          receiverId: u._id,
          notificationTitle: "🚨 Late Check-In (CEO)",
          notificationMessage: `${user.name} checked in ${minutesLate} minutes late at ${checkInTime}.`,
          relatedDomainType: "Attendance",
          priority: "High",
          senderId: user._id,
        });
      }
    }

    console.log("✅ Late check-in notifications sent correctly");
  } catch (error) {
    console.error("❌ Failed to send late check-in notifications:", error);
  }
};



  /* ---------------- ACTIONS ---------------- */

  const checkIn = async () => {
    try {
      const geo = await getGeolocation();
      const res = await axios.post("/hrms/attendance/checkin", {
        latitude: geo.latitude,
        longitude: geo.longitude,
        accuracy: geo.accuracy,
      });

      updateTodayInCalendar("Present");
      console.log("✅ Check-in response:", res.data);

      // ✅ Extract data from actual response structure
      const { late, lateByMinutes, sessions, data: responseData } = res.data;

      // 🔔 Check if employee is late (>15 minutes)
      if (late && lateByMinutes > 15) {
        // Get the latest check-in time from sessions array
        const latestSession =
          sessions && sessions.length > 0
            ? sessions[sessions.length - 1]
            : null;

        const checkInTime = latestSession?.checkIn
          ? moment(latestSession.checkIn).format("hh:mm A")
          : moment().format("hh:mm A");

        // Get shift start time (if available in response, adjust as needed)
        const shiftStartTime = responseData?.shiftStartTime || "10:00 AM"; // Fallback

        await sendLateNotifications({
          minutesLate: lateByMinutes,
          checkInTime,
          shiftStartTime,
          reportingManagerId:
            user?.reportingManagerId?._id || user?.reportingManagerId,
        });
      }

      await syncFromBackend();
      queryClient.invalidateQueries({ queryKey: ["attendance"] });

      return { message: res.data.message || "Checked in successfully" };
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

      setIsOnBreak(false);
      setCurrentBreakElapsed(0);

      await syncFromBackend();
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
        isCheckedOut,
        checkIn,
        checkOut,
        breakIn,
        breakOut,
        isCheckedOut
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  return useContext(AttendanceContext);
}
