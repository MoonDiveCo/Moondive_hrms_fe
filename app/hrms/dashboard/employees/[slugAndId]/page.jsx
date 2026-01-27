"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import AddEditEmployeeModal from "../AddEditEmployeeModal";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AuthContext } from "@/context/authContext";
import { RBACContext } from "@/context/rbacContext";

/* ================= MAIN ================= */

export default function EmployeeProfilePage() {
  const { slugAndId } = useParams();
  const employeeId = slugAndId?.split("-").pop();

  // ✅ Add auth context
  const { user } = useContext(AuthContext);
  const { canPerform, submodules } = useContext(RBACContext);

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

  // ✅ Check if viewing own profile
  const isOwnProfile = employee?.basic?.employeeId && user?.employeeId 
    ? String(employee.basic.employeeId).trim() === String(user.employeeId).trim()
    : false;

  // ✅ Permission checks
  const isSuperAdmin = user?.userRole?.includes("SuperAdmin");
  const isHR = user?.userRole?.includes("HR") || user?.userRole?.includes("HumanResources");
  const hasWildcard = submodules?.includes("*");
  
  // ✅ STRICT RULE: ONLY SuperAdmin OR viewing own profile can see other tabs
  // Regular users and HR can ONLY see Bio for other employees
  const canViewEmployment = isOwnProfile || isSuperAdmin;
  const canViewStats = isOwnProfile || isSuperAdmin;
  const canViewCompensation = isOwnProfile || isSuperAdmin;
  const canViewDocuments = isOwnProfile || isSuperAdmin;
  
  // ✅ Can edit: ONLY own profile OR SuperAdmin
  const canEditProfile = isOwnProfile || isSuperAdmin;

  // ✅ Filter tabs based on permissions
  const tabs = [
    { key: "bio", label: "Bio", visible: true },
    { key: "employment", label: "Employment", visible: canViewEmployment },
    { key: "stats", label: "Stats", visible: canViewStats },
    { key: "compensation", label: "Compensation", visible: canViewCompensation },
    { key: "documents", label: "Documents", visible: canViewDocuments },
  ].filter(tab => tab.visible);

  // Create section map based on visible tabs
  const sectionMap = {
    bio: bioRef,
    employment: employmentRef,
    stats: statsRef,
    compensation: compensationRef,
    documents: documentsRef,
  };

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
        const [departmentRes, designationRes, shiftRes, rolesRes, employeesRes, docsRes] = await Promise.all([
          axios.get("/hrms/organization/get-allDepartment"),
          axios.get("/hrms/organization/get-alldesignation"),
          axios.get("/hrms/organization/get-shifts"),
          axios.get("/hrms/organization/get-roles"),
          axios.get("/hrms/employee/list"),
          axios.get(`/user/get-personal-details/${employeeId}`),
        ]);

        setOrganizationData({
          departments: departmentRes?.data?.result || [],
          designations: designationRes?.data?.result || [],
          shifts: shiftRes?.data?.result || [],
          roles: rolesRes?.data?.result || [],
          documents: docsRes?.data?.result || [],
        });

        setEmployeeList(employeesRes?.data?.result || employeesRes?.data || []);
      } catch (err) {
        console.error("Failed to load organization data:", err);
      }
    }

    loadOrganizationData();
  }, [employeeId]);

  /* ================= TAB SYNC - IMPROVED ================= */

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isAutoScrollingRef.current) return;

        // Find the section with maximum visibility
        let maxVisibleSection = null;
        let maxVisibility = 0;

        entries.forEach((entry) => {
          const visibleRatio = entry.intersectionRatio;
          if (visibleRatio > maxVisibility) {
            maxVisibility = visibleRatio;
            maxVisibleSection = entry.target;
          }
        });

        // Update tab if a section is at least 30% visible
        if (maxVisibleSection && maxVisibility >= 0.3) {
          setActiveTab(maxVisibleSection.dataset.section);
        }
      },
      { 
        threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '-100px 0px -100px 0px'
      }
    );

    // Observe all visible sections
    Object.entries(sectionMap).forEach(([key, ref]) => {
      if (ref.current) {
        ref.current.dataset.section = key;
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, [employee]);

  useEffect(() => {
    // Add scroll listener as fallback
    const handleScroll = () => {
      if (isAutoScrollingRef.current) return;
      
      const scrollPosition = window.scrollY + 150; // Offset for sticky header
      
      // Find which section is currently in view
      for (const [key, ref] of Object.entries(sectionMap)) {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;
          
          // If scroll position is within this section
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            setActiveTab(key);
            break;
          }
        }
      }
    };
    
    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [employee]);

  const scrollToSection = (key) => {
    isAutoScrollingRef.current = true;
    sectionMap[key]?.current?.scrollIntoView({ 
      behavior: "smooth",
      block: "start" 
    });
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

  const leaveStatusCount = leaves.reduce(
    (acc, l) => {
      acc[l.leaveStatus] = (acc[l.leaveStatus] || 0) + 1;
      return acc;
    },
    { Approved: 0, Pending: 0, Rejected: 0 }
  );

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
      <div ref={pdfRef} className="max-w-6xl mx-auto px-4 py-6 space-y-10">

        <div className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-4 ">
            <img src={basic.imageUrl || "https://i.pravatar.cc/100"} alt="Employee" className="h-16 w-16 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-primaryText"> {basic.firstName} {basic.lastName} </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 ${basic.onboardingStatus === "Pending" ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} rounded uppercase`}>Onboarding {basic.onboardingStatus} </span>
              </div>
              <p className="text-primaryText"> Employee ID: {basic.employeeId} · {basic.designationId?.name} </p>
            </div>
          </div>
          
          {/* ✅ Show buttons if can edit */}
          {canEditProfile && (
            <div className="flex gap-3">
              {/* ✅ Export PDF only for own profile or SuperAdmin */}
              {(isOwnProfile || isSuperAdmin) && (
                <button 
                  onClick={handleExportPDF} 
                  className="shadow-md px-4 py-2 rounded-lg text-sm font-semibold"
                > 
                  Export PDF 
                </button>
              )}
              <button 
                onClick={() => setShowAddEdit(true)} 
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold"
              > 
                Edit Profile 
              </button>
            </div>
          )}
        </div>

        {/* ================= IMPROVED TABS ================= */}
        <div className="sticky top-4 z-50 flex justify-center mb-6">
          <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg px-4 py-2 rounded-full">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => scrollToSection(t.key)}
                className={`px-5 py-2 mx-1 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === t.key
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-600 hover:text-primary hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= BIO (Always visible) ================= */}
        <section ref={bioRef} className="">
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
                value={basic.about}
              />
            </Grid>
          </Card>
        </section>

        {/* ================= EMPLOYMENT ================= */}
        {canViewEmployment && (
          <section ref={employmentRef} className="">
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
        )}

        {/* ================= STATS ================= */}
        {canViewStats && (
          <section ref={statsRef} className="">
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
        )}

        {/* ================= COMPENSATION ================= */}
        {canViewCompensation && (
          <section ref={compensationRef} className="">
            <Card title="Compensation">
              <p className="text-gray-500">Confidential compensation information</p>
            </Card>
          </section>
        )}

        {/* ================= DOCUMENTS ================= */}
        {canViewDocuments && (
          <section ref={documentsRef} className="min-h-[400px]">
           <Card title="Documents">
            { !organizationData?.documents ? (
              <p className="text-gray-400 text-sm">No documents uploaded</p>
            ) : (
              <div className="space-y-10">
                <IDProofsSection idProofs={organizationData.documents.idProofs} />
                <AcademicSection academic={organizationData.documents.academicDocuments} />
                <EmploymentSection history={organizationData.documents.employmentHistory} />
              </div>
            )}
          </Card>

          </section>
        )}

        {/* ================= MODAL ================= */}
        {showAddEdit && canEditProfile && (
          <AddEditEmployeeModal
            mode="edit"
            employee={basic}
            onClose={() => setShowAddEdit(false)}
            onSave={async () => {
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

const DocumentTile = ({ url, fileName, uploadedAt, label }) => {
  if (!url) return null;

  const isImage = /\.(jpg|jpeg|png)$/i.test(fileName || url);
  const isPDF = /\.pdf$/i.test(fileName || url);

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden hide-scrollbar bg-white shadow-sm transition">
      {/* Preview */}
      <div className="h-40 bg-gray-50 flex items-center hide-scrollbar overflow-hidden justify-center">
        {isImage ? (
          <img
            src={url}
            alt={fileName}
            className="h-full w-full object-cover"
          />
        ) : isPDF ? (
          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full border-none hide-scrollbar overflow-hidden"
            scrolling="no"
          />
        ) : (
          <span className="text-xs text-gray-400">No Preview</span>
        )}
      </div>

      {/* Meta */}
      <div className="p-3">
        {label && (
          <p className="text-[11px] text-gray-500 mb-0.5">{label}</p>
        )}
        <p className="text-sm font-medium text-gray-800 truncate">
          {fileName || "Document"}
        </p>
        {uploadedAt && (
          <p className="text-xs text-gray-400 mt-0.5">
            Uploaded {new Date(uploadedAt).toLocaleDateString()}
          </p>
        )}

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs text-primary font-medium hover:underline"
        >
          View full document →
        </a>
      </div>
    </div>
  );
};

const safeDocProps = (doc) => {
  if (!doc) return {};
  const { key, ...rest } = doc;
  return rest;
};


const IDProofsSection = ({ idProofs }) => (
  <div>
    <h4 className="font-semibold text-sm mb-3">ID Proofs</h4>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {(() => {
        const { key, ...aadhaar } = idProofs?.aadhaar || {};
        return <DocumentTile {...aadhaar} label="Aadhaar Card" />;
      })()}

      {(() => {
        const { key, ...pan } = idProofs?.pan || {};
        return <DocumentTile {...pan} label="PAN Card" />;
      })()}

      {(() => {
        const { key, ...passport } = idProofs?.passportOrDL || {};
        return <DocumentTile {...passport} label="Passport / DL" />;
      })()}

      {(() => {
        const { key, ...present } = idProofs?.presentAddressProof || {};
        return <DocumentTile {...present} label="Present Address Proof" />;
      })()}

      {(() => {
        const { key, ...permanent } = idProofs?.permanentAddressProof || {};
        return <DocumentTile {...permanent} label="Permanent Address Proof" />;
      })()}
    </div>
  </div>
);



const AcademicSection = ({ academic }) => {
  if (!academic) return null;

  return (
    <div>
      <h4 className="font-semibold text-sm mb-3">Academic Documents</h4>

      <div className="space-y-6">
        {/* 10th */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">10th Standard</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DocumentTile
              {...safeDocProps(academic?.tenth?.certificate)}
              label="Certificate"
            />
            <DocumentTile
              {...safeDocProps(academic?.tenth?.marksheet)}
              label="Marksheet"
            />
          </div>
        </div>

        {/* 12th */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">12th Standard</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DocumentTile
              {...safeDocProps(academic?.twelth?.certificate)}
              label="Certificate"
            />
            <DocumentTile
              {...safeDocProps(academic?.twelth?.marksheet)}
              label="Marksheet"
            />
          </div>
        </div>

        {/* Graduation */}
        {academic?.graduation?.certificate && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">
              Graduation — {academic.graduation.name}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <DocumentTile
                {...safeDocProps(academic.graduation.certificate)}
                label="Degree Certificate"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {academic.graduation.marksheets?.map((m, i) => (
                <DocumentTile
                  key={i}
                  {...safeDocProps(m)}
                  label={`Semester ${i + 1} Marksheet`}
                />
              ))}
            </div>
          </div>
        )}

        {/* NOC */}
        <DocumentTile
          {...safeDocProps(academic?.nocFromCollege)}
          label="NOC from College"
        />
      </div>
    </div>
  );
};


const EmploymentSection = ({ history }) => {
  if (!history?.length) return null;

  return (
    <div>
      <h4 className="font-semibold text-sm mb-3">Employment History</h4>

      <div className="space-y-6">
        {history.map((job, idx) => (
          <div key={idx} className="border rounded-xl p-4 bg-gray-50">
            <div className="mb-3">
              <h5 className="font-medium text-gray-900">
                {job.companyName}
              </h5>
              <p className="text-xs text-gray-500">{job.designation}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {job.offerLetter?.map((d, i) => (
                <DocumentTile
                  key={i}
                  {...safeDocProps(d)}
                  label="Offer Letter"
                />
              ))}

              {job.experienceLetter?.map((d, i) => (
                <DocumentTile
                  key={i}
                  {...safeDocProps(d)}
                  label="Experience Letter"
                />
              ))}

              <DocumentTile
                {...safeDocProps(job.relievingLetter)}
                label="Relieving Letter"
              />

              {job.salarySlips?.map((s, i) => (
                <DocumentTile
                  key={i}
                  url={s.documentUrl}
                  fileName={s.fileName}
                  label={`Salary Slip (${s.month})`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};