"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AddEditEmployeeModal from "../AddEditEmployeeModal";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/* ================= MAIN ================= */

export default function EmployeeProfilePage() {
  const { slugAndId } = useParams();
  const employeeId = slugAndId?.split("-").pop();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bio");
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [organizationData, setOrganizationData] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const pdfRef = useRef(null);

  /* ---------- section refs ---------- */
  const bioRef = useRef(null);
  const employmentRef = useRef(null);
  const statsRef = useRef(null);
  const compensationRef = useRef(null);
  const documentsRef = useRef(null);
  const isAutoScrollingRef = useRef(false);

  const sectionMap = {
    bio: bioRef,
    employment: employmentRef,
    stats: statsRef,
    compensation: compensationRef,
    documents: documentsRef,
  };

  const tabs = [
    { key: "bio", label: "Bio" },
    { key: "employment", label: "Employment" },
    { key: "stats", label: "Stats" },
    { key: "compensation", label: "Compensation" },
    { key: "documents", label: "Documents" },
  ];

  /* ================= DATA ================= */

  useEffect(() => {
    if (!employeeId) return;

    (async () => {
      try {
        const res = await axios.get(`/hrms/employee/info/${employeeId}`);
        setEmployee(res.data.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [employeeId]);

  useEffect(() => {
    async function loadOrganizationData() {
      try {
        const [departmentRes, designationRes, shiftRes, rolesRes, employeesRes] = await Promise.all([
          axios.get("/hrms/organization/get-allDepartment"),
          axios.get("/hrms/organization/get-alldesignation"),
          axios.get("/hrms/organization/get-shifts"),
          axios.get("/hrms/organization/get-roles"),
          axios.get("/hrms/employee/list")
        ]);

        setOrganizationData({
          departments: departmentRes?.data?.result || [],
          designations: designationRes?.data?.result || [],
          shifts: shiftRes?.data?.result || [],
          roles: rolesRes?.data?.result || []
        });

        setEmployeeList(employeesRes?.data?.result || employeesRes?.data || []);
      } catch (err) {
        console.error("Failed to load organization data:", err);
      }
    }

    loadOrganizationData();
  }, []);

  /* ================= TAB SYNC ================= */

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isAutoScrollingRef.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top)
          );

        if (visible[0]) {
          setActiveTab(visible[0].target.dataset.section);
        }
      },
      { threshold: 0.35 }
    );

    Object.entries(sectionMap).forEach(([key, ref]) => {
      if (ref.current) {
        ref.current.dataset.section = key;
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (key) => {
    isAutoScrollingRef.current = true;
    sectionMap[key]?.current?.scrollIntoView({ behavior: "smooth" });
    setActiveTab(key);
    setTimeout(() => (isAutoScrollingRef.current = false), 600);
  };

  /* ================= STATES ================= */

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm">
        <DotLottieReact
          src="https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie"
          loop
          autoplay
          style={{ width: 100, height: 100 }}
        />
      </div>
    );

  if (!employee)
    return <div className="p-10 text-center">Employee not found</div>;

  const { basic, attendanceData, leaves, leaveBalance } = employee;

  /* ================= STATS LOGIC ================= */

  const presentDays = attendanceData.filter(
    (a) => a.status === "Present"
  ).length;

  const leaveDays = attendanceData.filter(
    (a) => a.status === "On Leave"
  ).length;

  const absentDays =
    attendanceData.length - presentDays - leaveDays;

  const leaveTypeCount = leaves.reduce((acc, l) => {
    acc[l.leaveType] = (acc[l.leaveType] || 0) + 1;
    return acc;
  }, {});

  // -------- LEAVE STATUS COUNT --------
  const leaveStatusCount = leaves.reduce(
    (acc, l) => {
      acc[l.leaveStatus] = (acc[l.leaveStatus] || 0) + 1;
      return acc;
    },
    { Approved: 0, Pending: 0, Rejected: 0 }
  );

  // -------- MONTH-WISE ATTENDANCE --------
  const monthlyAttendance = attendanceData
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .reduce((acc, a) => {
      const monthKey = new Date(a.date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (!acc[monthKey]) {
        acc[monthKey] = {
          Present: 0,
          "On Leave": 0,
          Absent: 0,
        };
      }

      acc[monthKey][a.status] =
        (acc[monthKey][a.status] || 0) + 1;

      return acc;
    }, {});

  const handleExportPDF = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
      onclone: (doc) => {
        doc.querySelectorAll("img").forEach((img) => {
          img.src = "https://i.pravatar.cc/150";
        });
      },
      allowTaint: false,
      imageTimeout: 15000,
      backgroundColor: "#ffffff",

      onclone: (clonedDoc) => {
        const allElements = clonedDoc.querySelectorAll("*");

        allElements.forEach((el) => {
          const style = clonedDoc.defaultView.getComputedStyle(el);

          // sanitize ALL unsupported color functions
          if (style.color.includes("lab(")) {
            el.style.color = "#000000";
          }

          if (style.backgroundColor.includes("lab(")) {
            el.style.backgroundColor = "#ffffff";
          }

          if (style.borderColor.includes("lab(")) {
            el.style.borderColor = "#cccccc";
          }

          if (style.outlineColor.includes("lab(")) {
            el.style.outlineColor = "transparent";
          }

          if (style.boxShadow && style.boxShadow.includes("lab(")) {
            el.style.boxShadow = "none";
          }
        });
      },
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft > 0) {
      position -= pdf.internal.pageSize.getHeight();
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save(`${basic.firstName}_${basic.lastName}_Profile.pdf`);
  };
  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-background-light">
      <div ref={pdfRef} className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        <div className="bg-white shadow-md rounded-xl p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={basic.imageUrl || "https://i.pravatar.cc/100"} alt="Employee" className="h-16 w-16 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-primaryText"> {basic.firstName} {basic.lastName} </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded uppercase"> {basic.employmentStatus} </span>
              </div>
              <p className="text-primaryText"> Employee ID: {basic.employeeId} · {basic.designationId?.name} </p>
            </div>
          </div> {/* { editPermission && */}
          <div className="flex gap-3">
            <button onClick={handleExportPDF} className="shadow-md px-4 py-2 rounded-lg text-sm font-semibold"> Export PDF </button>
            <button onClick={() => setShowAddEdit(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold"> Edit Profile </button>
          </div> {/* } */}
        </div>

        {/* ================= TABS ================= */}
        <div className="sticky top-0 z-10 flex justify-center">
          <div className="bg-primary/10 backdrop-blur-md px-2 py-1 rounded-full">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => scrollToSection(t.key)}
                className={`px-4 py-1.5 rounded-full text-sm transition ${activeTab === t.key
                  ? "bg-primary text-white"
                  : "hover:bg-white/40"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= BIO ================= */}
        <section ref={bioRef}>
          <Card title="Personal Information">
            <Grid>
              <Info label="Full Name" value={`${basic.firstName} ${basic.lastName}`} />
              <Info label="Email" value={basic.email} />
              <Info label="Gender" value={basic.gender} />
              <Info label="DOB"
                value={
                  basic.dateOfBirth
                    ? new Date(basic.dateOfBirth).toDateString()
                    : "—"
                }
              />
                <Info
                label="About"
                value={
                  basic.about
                }
              />

            </Grid>
          </Card>
        </section>

        {/* ================= EMPLOYMENT ================= */}
        <section ref={employmentRef}>
          <Card title="Employment Details">
            <Grid>
              <Info label="Department" value={basic.departmentId?.name} />
              <Info label="Employment Type" value={basic.employmentType} />
              <Info label="Joining Date" value={new Date(basic.dateOfJoining).toDateString()} />
              <Info label="Manager" value={`${basic.reportingManagerId?.firstName} ${basic.reportingManagerId?.lastName}`} />
              <Info label="Shift" value={`${basic.workingShiftId?.startTime} - ${basic.workingShiftId?.endTime}`} />
            </Grid>
          </Card>
        </section>

        {/* ================= STATS ================= */}
        <section ref={statsRef}>
          <div className="space-y-6">

            <Card title="Monthly Attendance Breakdown">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300 text-left text-gray-500">
                      <th className="py-2">Month</th>
                      <th>Present</th>
                      <th>On Leave</th>
                      <th>Absent</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.entries(monthlyAttendance).map(
                      ([month, stats]) => (
                        <tr key={month} className="">
                          <td className="py-2 font-medium">{month}</td>
                          <td className="text-green-600">{stats.Present || 0}</td>
                          <td className="text-yellow-600">{stats["On Leave"] || 0}</td>
                          <td className="text-red-600">{stats.Absent || 0}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </Card>


            <Card title="Leave Summary">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Stat title="Total Leaves" value={leaves.length} color="blue" />
                <Stat title="Approved" value={leaveStatusCount.Approved} color="green" />
                <Stat title="Pending" value={leaveStatusCount.Pending} color="yellow" />
                <Stat title="Rejected" value={leaveStatusCount.Rejected} color="red" />
              </div>

              <Grid>
                {Object.entries(leaveTypeCount).map(([type, count]) => (
                  <Info key={type} label={`${type} Leaves`} value={`${count} day(s)`} />
                ))}

                <Info
                  label="Leave Balance"
                  value={leaveBalance?.leaveBalances
                    ?.map(lb => `${lb.leaveTypeCode}: ${lb.available}`)
                    .join(" | ")}
                  full
                />
              </Grid>
            </Card>



          </div>
        </section>

        {/* ================= COMPENSATION ================= */}
        <section ref={compensationRef}>
          <Card title="Compensation">
            <p className="text-gray-500">Confidential</p>
          </Card>
        </section>

        {/* ================= DOCUMENTS ================= */}
        <section ref={documentsRef}>
          <Card title="Documents">
            <p className="text-gray-500">Uploaded documents appear here</p>
          </Card>
        </section>

        {/* ================= MODAL ================= */}
        {showAddEdit && (
          <AddEditEmployeeModal
            mode="edit"
            employee={basic}
            onClose={() => setShowAddEdit(false)}
            onSave={async () => {
              // Refresh employee data after save
              try {
                const res = await axios.get(`/hrms/employee/info/${employeeId}`);
                setEmployee(res.data.data);
              } catch (err) {
                console.error("Failed to refresh employee data:", err);
              }
              setShowAddEdit(false);
            }}
            organizationData={organizationData}
            employeeList={employeeList}
          />
        )}
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow">
      <div className="px-6 py-4 border-b border-gray-300 font-semibold">{title}</div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid md:grid-cols-2 gap-6">{children}</div>;
}

function Info({ label, value, full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <span className="text-[10px] uppercase text-gray-500">{label}</span>
      <span className="text-[16px] block text-primaryText">{value || "—"}</span>
    </div>
  );
}

function Stat({ title, value, color }) {
  const map = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <div className={`p-4 rounded-xl ${map[color]}`}>
      <p className="text-xs uppercase">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
