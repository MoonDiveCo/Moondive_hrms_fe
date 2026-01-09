"use client";

import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "@/context/authContext";
import EmployeeModal from "@/app/hrms/dashboard/employees/EmployeeModal";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function ReporteesSection() {
  const { user } = useContext(AuthContext);
console.log(user)
  const [activeView, setActiveView] = useState("team");
  const [reportingManager, setReportingManager] = useState(null);
  const [departmentMembers, setDepartmentMembers] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(true)

  const avatarUrl = "/avatar.png";
  const getProfileImage = (img) =>
    img && img.trim() !== "" ? img : avatarUrl;

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
        setReportingManager(res.data?.data || null);
        // setLoading(false)
      } catch (err) {
        console.error("Manager fetch failed:", err);
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

        setDepartmentName(res.data?.result?.name || "Department");
        setDepartmentMembers(res.data?.result?.employeeId || []);
        setLoading(false)
      } catch (err) {
        console.error("Department fetch failed:", err);
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

  if (!user) return null;

  return (
    <div className="p-6  rounded-lg">
      <div className="flex justify-between items-center mb-10">
        <div className="flex gap-4 justify-center items-center">
        <img
          src={getProfileImage(user.imageUrl || user.profileImage)}
          alt={user.firstName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
        <h4 className=" text-primaryText">
          {user.firstName} {user.lastName}
        </h4>
        <p>{user.designationName}</p></div> 
      </div>
      <div className="flex gap-4 ">
        <button
          onClick={() => setActiveView("team")}
          className={`px-3 py-1 rounded-lg font-medium ${
            activeView === "team"
              ? "bg-primary text-white"
              : "bg-white border border-gray-300 text-gray-600"
          }`}
        >
          Department Members
        </button>
        <button
          onClick={() => setActiveView("manager")}
          className={`px-3 py-1 rounded-lg font-medium ${
            activeView === "manager"
              ? "bg-primary text-white"
              : "bg-white border border-gray-300 text-gray-600"
          }`}
        >
          Reporting Manager
        </button>

      </div>
      </div>


      {activeView === "manager" && (
        reportingManager ? (
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
                <h6 className="text-md font-semibold text-blackText truncate">
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
            {/* No reporting manager assigned */}
          </p>
        )
      )}

      {activeView === "team" && (
        departmentMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {departmentMembers.map((member, index) => (
             <article
              key={`${member._id}-${index}`}
              onClick={() => setSelectedEmployee(member)}
              className="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100 flex items-center gap-5 cursor-pointer hover:border-primary transition">
                <img
                  src={getProfileImage(
                    member.imageUrl || member.profileImage
                  )}
                  alt={member.firstName}
                  className="w-16 h-16 rounded-full object-cover"
                />

                <div className="min-w-0">
                  <h6 className="text-md font-semibold text-blackText truncate">
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
        ) : (
          <p className="text-sm text-gray-400">
            {/* No team members found */}
          </p>
        )
      )}

      {selectedEmployee && (
      <EmployeeModal
        employee={{
          ...selectedEmployee,
          designation: selectedEmployee.designationId.name,
          name: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
          avatar:
            selectedEmployee.imageUrl ||
            selectedEmployee.profileImage ||
            "/avatar.png",
          department: departmentName,
        }}
        onClose={() => setSelectedEmployee(null)}
        editPermission={false}
        deletePermission={false}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    )}

    </div>
  );
}
