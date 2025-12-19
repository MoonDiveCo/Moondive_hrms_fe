"use client";

import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "@/context/authContext";

export default function ReporteesSection() {
  const { user } = useContext(AuthContext);

  const [activeView, setActiveView] = useState("manager");
  const [reportingManager, setReportingManager] = useState(null);
  const [departmentMembers, setDepartmentMembers] = useState([]);
  const [departmentName, setDepartmentName] = useState("");

  const [loadingManager, setLoadingManager] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // ---------- FALLBACK IMAGE ----------
  const avatarUrl = "/avatar.png";
  const getProfileImage = (img) =>
    img && img.trim() !== "" ? img : avatarUrl;

  /* ===================== FETCH REPORTING MANAGER ===================== */
  useEffect(() => {
    if (!user?.reportingManagerId) return;

    const fetchReportingManager = async () => {
      setLoadingManager(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/hrms/employee/view-employee/${user.reportingManagerId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setReportingManager(res.data?.data || null);
      } catch (err) {
        console.error("Manager fetch failed:", err);
        setReportingManager(null);
      } finally {
        setLoadingManager(false);
      }
    };

    fetchReportingManager();
  }, [user?.reportingManagerId]);

  /* ===================== FETCH DEPARTMENT + TEAM ===================== */
  useEffect(() => {
    if (!user?.departmentId) return;

    const fetchDepartment = async () => {
      setLoadingTeam(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/hrms/organization/view-department/${user.departmentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDepartmentName(res.data?.result?.name || "Department");
        setDepartmentMembers(res.data?.result?.employeeId || []);
      } catch (err) {
        console.error("Department fetch failed:", err);
        setDepartmentMembers([]);
      } finally {
        setLoadingTeam(false);
      }
    };

    fetchDepartment();
  }, [user?.departmentId]);

  if (!user) return null;

  /* ===================== UI ===================== */
  return (
    <div className="p-6 bg-[#F5F7FA] rounded-lg">
      {/* ================= USER HEADER ================= */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={getProfileImage(user.imageUrl || user.profileImage)}
          alt={user.firstName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <h4 className="text-xl font-semibold text-[#0D1B2A]">
          {user.firstName} {user.lastName}
        </h4>
      </div>

      {/* ================= TOGGLE BUTTONS ================= */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveView("manager")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeView === "manager"
              ? "bg-[var(--color-primary)] text-white"
              : "bg-white border text-gray-600"
          }`}
        >
          Reporting Manager
        </button>

        <button
          onClick={() => setActiveView("team")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeView === "team"
              ? "bg-[var(--color-primary)] text-white"
              : "bg-white border text-gray-600"
          }`}
        >
          My Team
        </button>
      </div>

      {/* ================= REPORTING MANAGER ================= */}
      {activeView === "manager" && (
        <>
          {loadingManager ? (
            <p className="text-sm text-gray-400">Loading manager...</p>
          ) : reportingManager ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <article className="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100 flex items-center gap-5">
                <img
                  src={getProfileImage(
                    reportingManager.imageUrl ||
                      reportingManager.profileImage
                  )}
                  alt={reportingManager.firstName}
                  className="w-16 h-16 rounded-full object-cover"
                />

                <div className="min-w-0">
                  <h6 className="text-md font-semibold text-[#0D1B2A] truncate">
                    {reportingManager.firstName}{" "}
                    {reportingManager.lastName}
                  </h6>

                  

                  <div className="text-sm text-gray-400 truncate">
                    {reportingManager.email}
                  </div>
                </div>
              </article>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No reporting manager assigned
            </p>
          )}
        </>
      )}

      {/* ================= TEAM MEMBERS ================= */}
      {activeView === "team" && (
        <>
          {loadingTeam ? (
            <p className="text-sm text-gray-400">Loading team...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {departmentMembers.map((member, index) => (
                <article
                  key={`${member._id}-${index}`}
                  className="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100 flex items-center gap-5"
                >
                  <img
                    src={getProfileImage(
                      member.imageUrl || member.profileImage
                    )}
                    alt={member.firstName}
                    className="w-16 h-16 rounded-full object-cover"
                  />

                  <div className="min-w-0">
                    <h6 className="text-md font-semibold text-[#0D1B2A] truncate">
                      {member.firstName} {member.lastName}
                    </h6>

                    <div className="mt-1 text-sm text-gray-500">
                      {departmentName}
                    </div>

                    <div className="text-sm text-gray-400 truncate">
                      {member.email}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
