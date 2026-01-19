"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* ================= MAIN COMPONENT ================= */

export default function EmployeeProfilePage() {
  const { slugAndId } = useParams();
  const employeeId = slugAndId?.split("-").pop();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bio");

  /* 🔗 Section refs */
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

  /* ================= DATA FETCH ================= */

  useEffect(() => {
    if (!employeeId) return;

    async function fetchEmployee() {
      try {
        const res = await axios.get(`/hrms/employee/info/${employeeId}`);
        setEmployee(res.data.data);
      } catch (err) {
        console.error("Failed to fetch employee", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployee();
  }, [employeeId]);

  /* ================= ACTIVE TAB SYNC ON SCROLL ================= */
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (isAutoScrollingRef.current) return;

      const visibleSections = entries
        .filter((e) => e.isIntersecting)
        .sort(
          (a, b) =>
            Math.abs(a.boundingClientRect.top) -
            Math.abs(b.boundingClientRect.top)
        );

      if (visibleSections.length > 0) {
        const sectionKey = visibleSections[0].target.dataset.section;
        setActiveTab(sectionKey);
      }
    },
    {
      threshold: 0.3, // 30% visible = active
    }
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

  sectionMap[key]?.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  setActiveTab(key);

  // Release lock after scroll settles
  setTimeout(() => {
    isAutoScrollingRef.current = false;
  }, 600);
};

  if (loading) return <div className="p-10 text-center">Loading profile…</div>;
  if (!employee) return <div className="p-10 text-center">Employee not found</div>;

  const { basic, attendanceData, leaves, leaveBalance } = employee;

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ================= PROFILE HEADER ================= */}
        <div className="bg-white shadow-md rounded-xl p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src={basic.imageUrl || "https://i.pravatar.cc/100"}
              className="h-16 w-16 rounded-full object-cover"
              alt="Employee"
            />
            <div>
              <h4 className="text-primaryText">
                {basic.firstName} {basic.lastName}
              </h4>
              <p className="text-primaryText">
                Employee ID: {basic.employeeId} · {basic.designationId?.name}
              </p>
            </div>
          </div>
        </div>

        {/* ================= SCROLL TABS ================= */}
      <div className="sticky top-0 z-10 flex justify-center py-2">
        <div className="bg-primary/20 rounded-full backdrop-blur-md px-2 py-1">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => scrollToSection(tab.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "bg-primary text-white"
                    : "text-primaryText hover:bg-white/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>


        {/* ================= BIO ================= */}
        <section ref={bioRef}>
          <Card title="Bio & Personal Information">
            <Grid>
              <Info label="Full Name" value={`${basic.firstName} ${basic.lastName}`} />
              <Info label="Gender" value={basic.gender} />
              <Info label="Email" value={basic.email} />
              <Info
                label="Date of Birth"
                value={basic.dateOfBirth ? new Date(basic.dateOfBirth).toDateString() : "—"}
              />
            </Grid>
          </Card>
        </section>

        {/* ================= EMPLOYMENT ================= */}
        <section ref={employmentRef}>
          <Card title="Employment Details">
            <Grid>
              <Info label="Department" value={basic.departmentId?.name} />
              <Info label="Designation" value={basic.designationId?.name} />
              <Info label="Employment Type" value={basic.employmentType} />
              <Info label="Joining Date" value={new Date(basic.dateOfJoining).toDateString()} />
              <Info
                label="Reporting Manager"
                value={`${basic.reportingManagerId?.firstName} ${basic.reportingManagerId?.lastName}`}
              />
              <Info
                label="Shift"
                value={`${basic.workingShiftId?.startTime} - ${basic.workingShiftId?.endTime}`}
              />
            </Grid>
          </Card>
        </section>

        {/* ================= STATS ================= */}
        <section ref={statsRef}>
          <div className="space-y-6">
            <Card title="Attendance Summary">
              <Grid>
                <Info label="Total Attendance Records" value={attendanceData.length} />
              </Grid>
            </Card>

            <Card title="Leave Summary">
              <Grid>
                <Info label="Total Leaves" value={leaves.length} />
                <Info label="Approved Leaves" value={leaves.filter(l => l.leaveStatus === "Approved").length} />
                <Info label="Pending Leaves" value={leaves.filter(l => l.leaveStatus === "Pending").length} />
                <Info
                  label="Leave Balance"
                  value={leaveBalance?.leaveBalances?.map(lb => `${lb.leaveTypeCode}: ${lb.available}`).join(", ")}
                  full
                />
              </Grid>
            </Card>
          </div>
        </section>

        {/* ================= COMPENSATION ================= */}
        <section ref={compensationRef}>
          <Card title="Compensation & Benefits">
            <p className="text-sm text-gray-500">Confidential compensation details</p>
          </Card>
        </section>

        {/* ================= DOCUMENTS ================= */}
        <section ref={documentsRef}>
          <Card title="Documents">
            <p className="text-sm text-gray-500">Uploaded documents will appear here</p>
          </Card>
        </section>

      </div>
    </div>
  );
}

/* ================= REUSABLE ================= */

function Card({ title, children }) {
  return (
    <div className="bg-white shadow-md rounded-xl">
      <div className="px-6 py-4 border-b border-gray-300">
        <h4 className="text-primaryText">{title}</h4>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>;
}

function Info({ label, value, full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-xs text-text-light-secondary uppercase mb-1">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
