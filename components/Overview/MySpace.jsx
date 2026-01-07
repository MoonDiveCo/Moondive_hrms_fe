"use client";

import React, { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "@/context/authContext";
import { Building, Building2, Calendar, Contact2, Dot, MailIcon, MapPin, MapPinCheck, PencilIcon, PhoneCallIcon } from "lucide-react";
import LeaveTrackerDashboard from "../LeaveTracker/LeaveDashboard";
import ProfileSlideOver from "../Dashboard/ProfileSlideOver";
import { useRouter } from "next/navigation";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


export default function HRMSOverviewPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("leave");

  const [reportingManager, setReportingManager] = useState(null);
  const [departmentMembers, setDepartmentMembers] = useState([]);
  const [openProfile, setOpenProfile] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [startTs, setStartTs] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  // ---------------- FALLBACK IMAGE ----------------
  const avatarUrl =
    "https://img.freepik.com/free-photo/young-entrepreneur_1098-18139.jpg?semt=ais_se_enriched&w=740&q=80";

  const tabs = [
    { id: "leave", label: "Leave", badge: 2 },
    { id: "feeds", label: "Feeds" },
    { id: "profile", label: "Profile" },
    { id: "approvals", label: "Approvals", badge: 1 },
    { id: "files", label: "Files" },
  ];
  useEffect(() => {
    if (isCheckedIn && startTs) {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTs);
      }, 1000);

      return () => clearInterval(timerRef.current);
    } else {
      clearInterval(timerRef.current);
      setElapsed(0);
    }
  }, [isCheckedIn, startTs]);

  function formatDuration(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((totalSec % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSec % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  useEffect(() => {
    if (!user?.reportingManagerId) return;

    const fetchReportingManager = async () => {
      try {
        setLoading(true)
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/hrms/employee/view-employee/${user.reportingManagerId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setReportingManager(res.data?.data);
        setLoading(false)
      } catch (err) {
        setReportingManager(null);
        setLoading(false)
      }
    };

    fetchReportingManager();
  }, [user?.reportingManagerId]);

  useEffect(() => {
    if (!user?.departmentId) return;

    const fetchDepartment = async () => {
      try {
        setLoading(true)
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/hrms/organization/view-department/${user.departmentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const dept = res.data?.result;
        setDepartmentMembers(dept?.employeeId || []);
        setLoading(false)
      } catch (err) {
        setDepartmentMembers([]);
        setLoading(false)
      }
    };

    fetchDepartment();
  }, [user?.departmentId]);

 if(loading){
          return(
            <div className='absolute inset-0 z-20 flex items-center justify-center bg-black/5 backdrop-blur-sm rounded-2xl'>
              <DotLottieReact
                src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
                loop
                autoplay
                style={{ width: 100, height: 100, alignItems: 'center' }} 
              />
            </div>
          )
        }

  const currentAddress = user?.address?.find(
  (addr) => addr.addresstype === "Current"
);

const formattedAddress = currentAddress
  ? [
      currentAddress.city,
      currentAddress.state,
      currentAddress.country,
    ]
      .filter(Boolean)
      .join(", ")
  : "—";


  return (
    <div className="max-w-full mx-auto px-6 md:px-8 p-6">
      {/* HERO */}
        <div className="bg-white rounded-2xl primaryShadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div className="flex items-center gap-6 min-w-0">

            <div className="relative shrink-0">
              <img
                src={user?.imageUrl || avatarUrl}
                alt={`${user?.firstName} ${user?.lastName}`}
                className="w-24 h-24 rounded-full object-cover"
              />
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            </div>

            <div className="min-w-0">
              <h4 className=" text-primaryText truncate">
                {user?.firstName} {user?.lastName}
              </h4>

              <p className="text-orange-500 font-medium">
                {user?.designationName}
              </p>

              <p className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-xl">
               { user?.about} </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500"><MailIcon size={16}/></span>
                  <span>{user?.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-orange-500"><PhoneCallIcon size={16}/></span>
                  <span>{user?.mobileNumber}</span>
                </div>

               <div className="flex items-center gap-2">
                <span className="text-orange-500">
                  <MapPin size={16} />
                </span>
                <span className="truncate max-w-xs">
                  {formattedAddress}
                </span>
              </div>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <button
            onClick={() => setOpenProfile(true)}
              className="px-5 flex items-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <PencilIcon size={16}/> Edit Profile
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl primaryShadow p-6 mt-3">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
          <Calendar size={16} className="text-orange-500" />
        </div>
        <div>
          <h4 className="text-primaryText">
            Attendance Summary
          </h4>
          <p className=" text-gray-400">Current Week Overview</p>
        </div>
      </div>

      <div>

    <div className="space-y-2">
      {[
        {
          day: "Monday, Dec 18",
          time: "09:00 AM - 05:30 PM",
          hours: "8.5h",
          status: "Present",
          color: "green",
        },
        {
          day: "Tuesday, Dec 19",
          time: "09:15 AM - 05:45 PM",
          hours: "8.5h",
          status: "Late",
          color: "yellow",
        },
        {
          day: "Wednesday, Dec 20",
          time: "08:55 AM - 05:25 PM",
          hours: "8.5h",
          status: "Present",
          color: "green",
        },
        {
          day: "Thursday, Dec 21",
          time: "09:00 AM - 05:30 PM",
          hours: "8.5h",
          status: "Present",
          color: "green",
        },
        {
          day: "Friday, Dec 22",
          time: "09:05 AM - 01:30 PM",
          hours: "4.5h",
          status: "Half Day",
          color: "orange",
        },
      ].map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Calendar size={16} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0D1B2A]">
                {item.day}
              </p>
              <p className="text-xs text-gray-400">{item.time}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 min-w-[150px]">
            <span className="text-sm font-medium text-gray-600 ">
              {item.hours}
            </span>

            <span
              className={`text-xs font-semibold  justify-start px-3 py-1 flex items-center rounded-full
                ${
                  item.color === "green"
                    ? "bg-green-100 text-green-700"
                    : item.color === "yellow"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-orange-100 text-orange-700"
                }
              `}
            >
              <Dot size={20} className="" />
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>



      {/* REPORTING + DEPARTMENT */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl primaryShadow p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
              <Building2 size={18} className="text-primary"/>
            </div>
            <div>
              <h4 className="text-primaryText">
                Reporting Hierarchy
              </h4>
              <p className="text-sm text-gray-400">Organizational Structure</p>
            </div>
          </div>

          {/* REPORTS TO */}
          <div className="mb-5">
            <p className="text-xs text-gray-400 uppercase mb-2">Reports To</p>

            <div className="flex items-center gap-4 border border-gray-300 rounded-xl p-4">
              <img
                src={reportingManager?.imageUrl || avatarUrl}
                className="w-12 h-12 rounded-full object-cover"
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0D1B2A] truncate">
                  {reportingManager
                    ? `${reportingManager.firstName} ${reportingManager.lastName}`
                    : "—"}
                </p>
                <p className="text-xs text-gray-500">
                  {reportingManager?.designationId?.name}
                </p>
                <p className="text-xs text-gray-400">
                  {reportingManager?.departmentId?.name}
                </p>
              </div>

              <span className="text-gray-300 text-lg">›</span>
            </div>
          </div>

          {/* YOU */}
          <div className="mb-5">
            <p className="text-xs text-gray-400 uppercase mb-2">You</p>

            <div className="flex items-center gap-4 border border-orange-200 bg-orange-50 rounded-xl p-4">
              <img
                src={user?.imageUrl || avatarUrl}
                className="w-12 h-12 rounded-full object-cover"
              />

              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0D1B2A] truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.designationId?.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl primaryShadow p-6">
          {/* Header + Search */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                <Contact2 size={18} className="text-primary"/>
              </div>
              <div>
                <h4 className="text-primaryText">
                  {user?.departmentName}
                </h4>
                <p className="text-sm text-gray-400">Department Members ( <strong>{departmentMembers.length}</strong> )</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          {/* <div className="flex items-center gap-4 text-sm text-primaryText mb-5">
            <span>
              TOTAL <strong>{departmentMembers.length}</strong>
            </span>
          </div> */}

          {/* Members List */}
          <div className="space-y-4  max-h-[200px] overflow-y-auto">
            {departmentMembers.map((member) => (
              <div
                key={member._id}
                className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                  member._id === user?._id
                    ? "bg-orange-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={member.imageUrl || avatarUrl}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {member.firstName} {member.lastName}
                      {member._id === user?._id && (
                        <span className="text-xs text-orange-500 ml-1">
                          (You)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {member.designationId?.name}
                    </p>
                  </div>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                  Online
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button onClick={()=>router.push("department")} className="text-sm text-orange-500 font-semibold hover:underline">
              View All Members →
            </button>
          </div>
        </div>
      </div>


      {/* ACTIVITIES */}
      <section className="mt-8">
        <h4 className="text-primaryText mb-4">
          Activities
        </h4>

        <div className="bg-white rounded-lg primaryShadow overflow-hidden">
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
              <div className="bg-white rounded-lg border border-gray-50 ">
                <LeaveTrackerDashboard showCalender={false} />
              </div>
            )}

            {activeTab === "feeds" && <p>No feeds yet.</p>}
            {activeTab === "profile" && <p>Profile section here.</p>}
            {activeTab === "approvals" && <p>Pending approvals.</p>}
            {activeTab === "files" && <p>Files list.</p>}
          </div>
        </div>
      </section>

         <ProfileSlideOver
              isOpen={openProfile}
              onClose={() => setOpenProfile(false)}
              startInEdit={true}
            />
    </div>
  );
}
