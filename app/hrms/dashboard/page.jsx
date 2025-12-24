"use client";

import { getGeolocation } from '@/helper/tracking';
import React, { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "@/context/authContext";
import { toast } from 'sonner';

export default function HRMSOverviewPage() {
  const { user, loading } = useContext(AuthContext);
  const [isOnBreak, setIsOnBreak] = useState(false);

const STORAGE_KEY = "hrms_attendance";

  const [activeTab, setActiveTab] = useState("leave");

  const [reportingManager, setReportingManager] = useState(null);
  const [departmentMembers, setDepartmentMembers] = useState([]);
const avatarUrl =
  "https://img.freepik.com/free-photo/young-entrepreneur_1098-18139.jpg?semt=ais_se_enriched&w=740&q=80";
 const [isCheckedIn, setIsCheckedIn] = useState(false);
const tabs = [ { id: "leave", label: "Leave", badge: 2 }, { id: "feeds", label: "Feeds" }, { id: "profile", label: "Profile" }, { id: "approvals", label: "Approvals", badge: 1 }, { id: "files", label: "Files" }, ];
 const [checkInAt, setCheckInAt] = useState(null);
const [breakStartedAt, setBreakStartedAt] = useState(null);
const [totalBreakMs, setTotalBreakMs] = useState(0);
const [nowTs, setNowTs] = useState(Date.now());

  const workStartRef = useRef(null);
  const breakStartRef = useRef(null);
  const timerRef = useRef(null);
const breakMs =
  totalBreakMs +
  (isOnBreak && breakStartedAt ? nowTs - breakStartedAt : 0);

const workMs =
  checkInAt
    ? nowTs - checkInAt - breakMs
    : 0;

  /* ---------------- RESTORE STATE ---------------- */
 useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const d = JSON.parse(saved);
  setIsCheckedIn(d.isCheckedIn);
  setIsOnBreak(d.isOnBreak);
  setCheckInAt(d.checkInAt);
  setBreakStartedAt(d.breakStartedAt);
  setTotalBreakMs(d.totalBreakMs || 0);
}, []);


  /* ---------------- PERSIST STATE ---------------- */
  useEffect(() => {
  if (!isCheckedIn) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      isCheckedIn,
      isOnBreak,
      checkInAt,
      breakStartedAt,
      totalBreakMs,
    })
  );
}, [isCheckedIn, isOnBreak, checkInAt, breakStartedAt, totalBreakMs]);


  /* ---------------- TIMER ENGINE ---------------- */
 useEffect(() => {
  if (!isCheckedIn) return;

  timerRef.current = setInterval(() => {
    setNowTs(Date.now());
  }, 1000);

  return () => clearInterval(timerRef.current);
}, [isCheckedIn]);

 

 
 
 
 
 
 
 

 
 
 
 
 
 
 

 
 

  /* ---------------- FORMAT ---------------- */
  const format = (ms) => {
    const s = Math.floor(ms / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  /* ---------------- HANDLERS ---------------- */
 const handleCheckIn = async () => {
    try {
      const { latitude, longitude } = await getGeolocation();
      if (!latitude || !longitude) {
        toast.error("Location permission denied");
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/hrms/attendance/checkin`,
        { userId: user._id, latitude, longitude },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const now = Date.now();
      setIsCheckedIn(true);
      setIsOnBreak(false);
      setCheckInAt(now);
      setBreakStartedAt(null);
      setTotalBreakMs(0);

      toast.success("Checked in successfully");
    } catch (err) {
      toast.error("Check-in failed");
    }
  };

  const handleBreakIn = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API}/hrms/attendance/breakin`,
        { userId: user._id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setIsOnBreak(true);
      setBreakStartedAt(Date.now());
      toast.success("Break started");
    } catch {
      toast.error("Unable to start break");
    }
  };

  const handleBreakOut = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API}/hrms/attendance/breakout`,
        { userId: user._id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const now = Date.now();
      setIsOnBreak(false);
      setTotalBreakMs((prev) => prev + (now - (breakStartedAt || now)));
      setBreakStartedAt(null);

      toast.success("Break ended");
    } catch {
      toast.error("Unable to end break");
    }
  };

  const handleCheckOut = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API}/hrms/attendance/checkout`,
        { userId: user._id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setIsCheckedIn(false);
      setIsOnBreak(false);
      setCheckInAt(null);
      setBreakStartedAt(null);
      setTotalBreakMs(0);

      toast.success("Checked out successfully");
    } catch {
      toast.error("Checkout failed");
    }
  };



  return (
    <div className="max-w-full mx-auto px-6 md:px-8 py-6">
      {/* HERO */}
      <div className="flex flex-col md:flex-row gap-6 md:items-stretch">
        <div className="md:w-[70%] w-full">
          <div className="bg-white rounded-xl p-6 shadow-md h-full flex items-center">
            <img
              src={user?.imageUrl || avatarUrl}
              alt={`${user?.firstName} ${user?.lastName}`}
              className="w-28 h-28 rounded-full object-cover shrink-0"
            />

            <div className="ml-6 min-w-0">
              <h3 className="text-xl font-semibold text-[#0D1B2A] leading-tight">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-lg text-gray-500 mt-1">
                {user?.userRole?.[0]}
              </p>
              <p className="text-sm text-gray-400">{user?.about}</p>
            </div>
          </div>
        </div>

        {/* STATUS BOX — UI UNCHANGED */}
        <div className="md:w-[30%] w-full">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 h-full flex flex-col justify-center">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide text-center">
              Status
            </div>

       
        {!isCheckedIn ? (
          <button
            onClick={handleCheckIn}
            className="mt-5 w-full py-2 rounded-md bg-[var(--color-primary)] text-white font-semibold"
          >
            Check In
          </button>
        ) : (
          <>
            {/* TIMER CARDS */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Working Time</p>
                <p className="text-lg font-semibold text-[#0D1B2A]">
                  {format(workMs)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Break Time</p>
                <p className="text-lg font-semibold text-[#0D1B2A]">
                  {format(breakMs)}
                </p>
              </div>
            </div>

            {/* STATUS BADGE */}
            <div className="mt-3 text-center">
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${
                  isOnBreak
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {isOnBreak ? "On Break" : "Working"}
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-4 space-y-2">
              {!isOnBreak ? (
                <button
                  onClick={handleBreakIn}
                  className="w-full py-2 rounded-md bg-[#FFE6DB] text-[var(--color-primary)] font-semibold"
                >
                  Start Break
                </button>
              ) : (
                <button
                  onClick={handleBreakOut}
                  className="w-full py-2 rounded-md bg-[#FFF4CC] text-yellow-700 font-semibold"
                >
                  End Break
                </button>
              )}

              <button
                onClick={handleCheckOut}
                className="w-full py-2 rounded-md bg-red-50 text-red-600 font-semibold"
              >
                Check Out
              </button>
            </div>
          </>
        )}
      </div>
    
        </div>
      </div>

      {/* REPORTING + DEPARTMENT */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reporting */}
        <div className="bg-white rounded-lg p-5 shadow-md flex items-center gap-4">
          <img
            src={reportingManager?.imageUrl || avatarUrl}
            className="w-12 h-12 rounded-full "
          />
          <div>
            <div className="text-sm text-gray-500">Reporting To</div>

            <div className="text-base font-semibold text-[#0D1B2A]">
              {reportingManager
                ? `${reportingManager.firstName} ${reportingManager.lastName}`
                : "—"}
            </div>

            <div className="text-sm text-gray-400">{reportingManager?.userRole?.[0]}</div>
          </div>
        </div>

        {/* Department Members */}
        <div className="bg-white rounded-lg p-5 shadow-md">
          <div className="text-sm text-gray-500">Department Members</div>

          <div className="flex items-center gap-3 mt-2">
            {/* Avatar Stack */}
            <div className="flex -space-x-2">
              {departmentMembers.slice(0, 3).map((member) => (
                <div key={member._id} className="relative group">
                  <img
                    src={member.imageUrl || avatarUrl}
                    alt={member.firstName}
                    className="w-8 h-8 rounded-full border-2 border-white object-cover cursor-pointer"
                  />

                  {/* Hover Card */}
                  <div className="absolute z-20 hidden group-hover:block top-10 left-1/2 -translate-x-1/2 border-primary">
                    <div className="bg-white shadow-lg rounded-lg p-3 w-56 border-primary">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.imageUrl || avatarUrl}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-semibold text-sm">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* +N Badge */}
              {departmentMembers.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-[#FFEDEC] border-2 border-white flex items-center justify-center text-xs text-[#FF7B30] font-semibold">
                  +{departmentMembers.length - 3}
                </div>
              )}
            </div>

            {/* Members Count */}
            <div className="text-base font-semibold text-[#0D1B2A]">
              {departmentMembers.length} Members
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITIES */}
      <section className="mt-8">
        <h3 className="text-xl font-semibold text-[#0D1B2A] mb-4">
          Activities
        </h3>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 pt-4">
            <nav
              className="flex items-center gap-6 border-b border-gray-100 pb-3"
              role="tablist"
            >
              {tabs.map((t) => {
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`relative pb-3 px-3 transition-colors duration-150 ${
                      isActive ? "font-semibold" : "text-gray-500"
                    } hover:text-[var(--color-primary)]`}
                    style={{
                      borderBottom: isActive
                        ? "3px solid var(--color-primary)"
                        : "3px solid transparent",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {t.label}
                      {t.badge && (
                        <span className="bg-[#FFECEC] text-[var(--color-primary)] px-2 py-0.5 rounded-full text-xs font-medium">
                          {t.badge}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "leave" && (
              <div className="bg-white rounded-lg border border-gray-50 p-6">
                <p className="text-xs">
                  Your upcoming annual leave is from <b>Dec 24, 2024</b> to{" "}
                  <b>Jan 2, 2025</b>. You have <b>2 pending leave requests</b>{" "}
                  and a remaining balance of <b>8 days</b>.
                </p>

                <button className="mt-4 px-4 py-2 bg-[#FFE6DB] text-[var(--color-primary)] font-semibold rounded-md">
                  View Details
                </button>
              </div>
            )}

            {activeTab === "feeds" && <p>No feeds yet.</p>}
            {activeTab === "profile" && <p>Profile section here.</p>}
            {activeTab === "approvals" && <p>Pending approvals.</p>}
            {activeTab === "files" && <p>Files list.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
