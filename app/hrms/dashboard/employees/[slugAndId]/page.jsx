"use client";

import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import AddEditEmployeeModal from "../AddEditEmployeeModal";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AuthContext } from "@/context/authContext";
import { RBACContext } from "@/context/rbacContext";
import { toast } from "sonner";
import { Trash2, FileText, Send, CheckCircle2, Clock, ExternalLink } from "lucide-react";

/* ================= MAIN ================= */

export default function EmployeeProfilePage() {
  const { slugAndId } = useParams();
  const employeeId = slugAndId?.split("-").pop();
  const router = useRouter();

  // ✅ Add auth context
  const { user, allUserPermissions } = useContext(AuthContext);
  const deletePermission = allUserPermissions.includes("HRMS:EMPLOYEES:DELETE");
  const { canPerform, submodules } = useContext(RBACContext);

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bio");
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [organizationData, setOrganizationData] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const pdfRef = useRef(null);

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ PDF Export State
  const [isExporting, setIsExporting] = useState(false);

  const deleteEmployee = async () => {
    try {
      const res = await axios.delete(`/hrms/employee/delete-employee/${employeeId}`);
      if (res.data.responseCode === 200) {
        toast.success("Delete Successful");
        router.push("/hrms/dashboard/employees");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error while deleting employee:", err);
      toast.error("Failed To Delete Employee");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await deleteEmployee();
    setOpenConfirmModal(false);
  };

  const hasAnyDocuments = (documents) => {
  if (!documents) return false;

  const { idProofs, academicDocuments, employmentHistory } = documents;

  if (employmentHistory?.length > 0) return true;

  if (idProofs && Object.values(idProofs).some(value => value)) {
    return true;
  }

  if (academicDocuments) {
    const academicValues = Object.values(academicDocuments);

    for (let item of academicValues) {
      if (!item) continue;

      if (Array.isArray(item)) {
        if (item.length > 0) return true;
      } else if (typeof item === "object") {
        if (Object.values(item).some(val =>
          Array.isArray(val) ? val.length > 0 : val
        )) {
          return true;
        }
      } else if (item) {
        return true;
      }
    }
  }

  return false;
};

const hasIdProofs = (docs) =>
  docs?.idProofs &&
  Object.values(docs.idProofs).some(v => v);

const hasAcademicDocs = (docs) =>
  docs?.academicDocuments &&
  Object.values(docs.academicDocuments).some(item => {
    if (!item) return false;
    if (Array.isArray(item)) return item.length > 0;
    if (typeof item === "object")
      return Object.values(item).some(val =>
        Array.isArray(val) ? val.length > 0 : val
      );
    return false;
  });

const hasEmployment = (docs) =>
  docs?.employmentHistory?.length > 0;


  /* ---------- section refs ---------- */
  const bioRef = useRef(null);
  const employmentRef = useRef(null);
  const statsRef = useRef(null);
  const compensationRef = useRef(null);
  const documentsRef = useRef(null);
  const hrDocsRef = useRef(null);
  const isAutoScrollingRef = useRef(false);

  // HR Docs state
  const [employeeHRDocs, setEmployeeHRDocs] = useState([]);
  const [hrDocsLoading, setHrDocsLoading] = useState(false);

  // ✅ Check if viewing own profile
  const isOwnProfile = employee?.basic?.employeeId && user?.employeeId 
    ? String(employee.basic.employeeId).trim() === String(user.employeeId).trim()
    : false;

  // ✅ Permission checks
  const isSuperAdmin = user?.userRole?.includes("SuperAdmin");
  const isHR = user?.userRole?.includes("HR") || user?.userRole?.includes("HumanResources");
  
  // ✅ NEW RULES:
  // - Bio: Everyone can see
  // - Employment, Stats, Documents: Own profile OR SuperAdmin OR HR
  // - Compensation: ONLY own profile OR SuperAdmin (HR CANNOT see other's compensation)
  const canViewEmployment = isOwnProfile || isSuperAdmin || isHR;
  const canViewStats = isOwnProfile || isSuperAdmin || isHR;
  const canViewCompensation = isOwnProfile || isSuperAdmin; // HR excluded for others
  const canViewDocuments = isOwnProfile || isSuperAdmin || isHR;
  
  // ✅ Can edit: Own profile OR SuperAdmin OR HR
  const canEditProfile = isOwnProfile || isSuperAdmin || isHR;

  // HR Docs visibility:
  //   - Employee on their OWN profile → sees their own documents
  //   - SuperAdmin, HR, or HRMS:HR_DOCS:VIEW → sees all docs for any employee
  const canViewHRDocs =
    isOwnProfile ||
    isSuperAdmin ||
    isHR ||
    allUserPermissions.includes('HRMS:HR_DOCS:VIEW');

  // Whether the viewer has management-level access (can see all docs, navigate to full list)
  const isHRDocsManager =
    isSuperAdmin ||
    isHR ||
    allUserPermissions.includes('HRMS:HR_DOCS:VIEW');

  // ✅ Filter tabs based on permissions
  const tabs = [
    { key: "bio", label: "Bio", visible: true },
    { key: "employment", label: "Employment", visible: canViewEmployment },
    { key: "stats", label: "Stats", visible: canViewStats },
    { key: "documents", label: "Documents", visible: canViewDocuments },
    { key: "compensation", label: "Compensation", visible: canViewCompensation },
    { key: "hr-docs", label: "HR Docs", visible: canViewHRDocs },
  ].filter(tab => tab.visible);

  // Create section map based on visible tabs
  const sectionMap = {
    bio: bioRef,
    employment: employmentRef,
    stats: statsRef,
    compensation: compensationRef,
    documents: documentsRef,
    "hr-docs": hrDocsRef,
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

  /* ================= LOAD EMPLOYEE HR DOCS ================= */

  useEffect(() => {
    if (!employeeId || !canViewHRDocs) return;
    setHrDocsLoading(true);
    axios
      .get(`/api/v1/hrms/hr-docs/documents/employee/${employeeId}?limit=5`)
      .then((res) => {
        const data = res.data?.result || res.data?.data || {};
        setEmployeeHRDocs(data.docs || data || []);
      })
      .catch(() => {})
      .finally(() => setHrDocsLoading(false));
  }, [employeeId, canViewHRDocs]);

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
    
    const toastId = toast.loading("Generating PDF... Please wait");
    setIsExporting(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const images = Array.from(pdfRef.current.querySelectorAll("img"));
      await Promise.all(images.map(async (img) => {
        if (img.src && typeof img.src === 'string' && img.src.includes('amazonaws.com')) {
           try {
             const response = await fetch(`${img.src}?t=${new Date().getTime()}`, { mode: 'cors' });
             const blob = await response.blob();
             return new Promise((resolve) => {
               const reader = new FileReader();
               reader.onloadend = () => {
                 img.dataset.originalSrc = img.src;
                 img.src = reader.result;
                 resolve();
               };
               reader.readAsDataURL(blob);
             });
           } catch(e) {
             console.warn("Could not pre-fetch image for PDF", img.src, e);
             img.dataset.originalSrc = img.src; 
             img.src = "https://i.pravatar.cc/150"; 
           }
        }
      }));

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
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
            if (style.overflow === "hidden" || style.overflowY === "auto") {
              el.style.overflow = "visible";
              el.style.overflowY = "visible";
            }
          });
        },
      });

      images.forEach(img => {
        if (img.dataset.originalSrc) {
           img.src = img.dataset.originalSrc;
           delete img.dataset.originalSrc;
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const padding = 10;
      const contentWidth = pdfWidth - (padding * 2);
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      let heightLeft = contentHeight;
      let position = padding;
      let pageNumber = 1;

      pdf.addImage(imgData, "JPEG", padding, position, contentWidth, contentHeight);
      
      const links = Array.from(pdfRef.current.querySelectorAll("a[href]"));
      const scaleRatio = contentWidth / canvas.width;
      const originalContainerRect = pdfRef.current.getBoundingClientRect();

      const addLinksForPage = (currentPageYStart, currentPageYEnd, currentPagePositionOffset) => {
          links.forEach(link => {
              const rect = link.getBoundingClientRect();
              
              const relativeY = (rect.top - originalContainerRect.top) * 2; 
              
              if (relativeY >= currentPageYStart && relativeY < currentPageYEnd) {
                 const relativeX = (rect.left - originalContainerRect.left) * 2;
                 
                 const pdfX = padding + (relativeX * scaleRatio);
                 const offsetInsidePage = relativeY - currentPageYStart;
                 const pdfY = padding + currentPagePositionOffset + (offsetInsidePage * scaleRatio);
                 
                 const pdfW = (rect.width * 2) * scaleRatio;
                 const pdfH = (rect.height * 2) * scaleRatio;
                 
                 pdf.link(pdfX, pdfY, pdfW, pdfH, { url: link.href });
              }
          });
      };
      const pageHeightInPixels = (pdf.internal.pageSize.getHeight() - (padding * 2)) / scaleRatio;
      addLinksForPage(0, pageHeightInPixels, 0);

      heightLeft -= (pdf.internal.pageSize.getHeight() - (padding * 2));

      while (heightLeft > 0) {
        position = heightLeft - contentHeight + padding;
        pdf.addPage();
        pageNumber++;
        pdf.addImage(imgData, "JPEG", padding, position, contentWidth, contentHeight);
        
        const pageYStart = (pageNumber - 1) * pageHeightInPixels;
        const pageYEnd = pageNumber * pageHeightInPixels;
        const pageOffset = position - padding; 
        
        addLinksForPage(pageYStart, pageYEnd, pageOffset);

        heightLeft -= (pdf.internal.pageSize.getHeight() - (padding * 2));
      }

      pdf.save(`${basic.firstName}_${basic.lastName}_Profile.pdf`);
      toast.success("PDF exported successfully!", { id: toastId });
    } catch (error) {
      console.error("PDF Export Error: ", error);
      toast.error("Failed to export PDF due to image CORS restrictions. Try again.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
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
              <p className="text-primaryText"> <span className="font-semibold text-sm">Employee ID:</span> {basic.employeeId} · {basic.designationId?.name} </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {deletePermission && (
              <button
                onClick={() => setOpenConfirmModal(true)}
                disabled={isDeleting}
                title="Delete Employee"
                className="flex items-center cursor-pointer justify-center p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <Trash2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            )}
            {canEditProfile && (
              <>
                {(isOwnProfile || isSuperAdmin || isHR) && (
                  <button 
                    onClick={handleExportPDF} 
                    className="shadow-md px-4 cursor-pointer py-2 rounded-lg text-sm font-semibold bg-white"
                  > 
                    Export PDF 
                  </button>
                )}
                <button 
                  onClick={() => setShowAddEdit(true)} 
                  className="bg-primary cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-semibold"
                > 
                  Edit Profile 
                </button>
              </>
            )}
          </div>
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
                <Info label="Joining Date" value={basic.dateOfJoining ? new Date(basic.dateOfJoining).toDateString() : "—"} />
                {basic.employmentType === "Probation" && basic.probationEndDate && (
                  <Info label="Probation End Date" value={new Date(basic.probationEndDate).toDateString()} />
                )}
                {basic.employmentType === "Internship" && basic.internshipEndDate && (
                  <Info label="Internship End Date" value={new Date(basic.internshipEndDate).toDateString()} />
                )}
                <Info label="Manager" value={`${basic.reportingManagerId?.firstName || "Unknown"} ${basic.reportingManagerId?.lastName || ""}`.trim()} />
                <Info label="Shift" value={`${basic.workingShiftId?.startTime || ""} - ${basic.workingShiftId?.endTime || ""}`.replace(" - ", "") || "—"} />
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
                      ?.map(lb => `${lb.leaveTypeCode}: ${lb.leaveTypeCode==="LWP" ? lb.monthlyUsed : lb.available}`)
                      .join(" | ")}
                    full
                  />
                </Grid>
              </Card>
            </div>
          </section>
        )}

        {/* ================= DOCUMENTS ================= */}
        {canViewDocuments && (
          <section ref={documentsRef} className="min-h-[400px]">
           <Card title="Documents">
            {   !hasAnyDocuments(organizationData?.documents) ? (
              <p className="text-gray-400 text-sm">No documents uploaded</p>
            ) : (
        <div className="space-y-10">
        {hasIdProofs(organizationData?.documents) && (
          <IDProofsSection idProofs={organizationData.documents.idProofs} isExporting={isExporting} />
        )}

        {hasAcademicDocs(organizationData?.documents) && (
          <AcademicSection academic={organizationData.documents.academicDocuments} isExporting={isExporting} />
        )}

        {hasEmployment(organizationData?.documents) && (
          <EmploymentSection history={organizationData.documents.employmentHistory} isExporting={isExporting} />
        )}
      </div>
            )}
          </Card>

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

        {/* ================= HR DOCS ================= */}
        {canViewHRDocs && (
          <section ref={hrDocsRef} className="">
            <Card title={isOwnProfile && !isHRDocsManager ? "My Documents" : "HR Documents"}>
              <div className="space-y-3">
                {/* Employee-only info banner */}
                {isOwnProfile && !isHRDocsManager && (
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    Documents generated for you by HR. Only you can see these.
                  </p>
                )}
                {hrDocsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                  ))
                ) : employeeHRDocs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">No documents generated yet</p>
                  </div>
                ) : (
                  <>
                    {employeeHRDocs.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF7B30]">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{doc.templateName}</p>
                            <p className="text-xs text-gray-400">
                              {(doc.templateCategory || '').replace(/_/g, ' ')} •{' '}
                              {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                            doc.status === 'SENT'
                              ? 'bg-green-100 text-green-700'
                              : doc.status === 'ACKNOWLEDGED'
                              ? 'bg-purple-100 text-purple-700'
                              : doc.status === 'GENERATED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {doc.status === 'SENT' ? (
                            <Send className="w-3 h-3" />
                          ) : doc.status === 'ACKNOWLEDGED' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {doc.status}
                        </span>
                      </div>
                    ))}
                    {/* "View all" — managers go to the management page, employees stay on their profile */}
                    <div className="pt-2 border-t border-gray-100">
                      {isHRDocsManager ? (
                        <Link
                          href={`/hrms/dashboard/hr-docs/employee-documents?employee=${employeeId}`}
                          className="flex items-center gap-1.5 text-sm text-[#FF7B30] font-medium hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View all documents
                        </Link>
                      ) : (
                        <p className="text-xs text-gray-400">
                          Showing last {employeeHRDocs.length} document{employeeHRDocs.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
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
            isOwnProfile={isOwnProfile}
            isSuperAdmin={isSuperAdmin}
            isHR={isHR}
          />
        )}
        
        {openConfirmModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpenConfirmModal(false)} />
            <div className="relative w-[min(500px,90%)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-primaryText">
                  Confirm Delete
                </h3>
                <button
                  onClick={() => setOpenConfirmModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="text-center">
                  <p className="text-sm text-[var(--color-primaryText)] mt-1">
                    Are you sure you want to delete {basic.firstName} {basic.lastName}?
                  </p>
                  <p className="text-xs text-red-500 mt-2">This action cannot be undone</p>
                </div>

                <div className="mt-6 flex justify-center gap-3 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => setOpenConfirmModal(false)}
                    className="px-4 py-2 rounded-md bg-white border border-gray-200 text-sm text-[var(--color-primaryText)] hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-md bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
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

const DocumentTile = ({ url, fileName, uploadedAt, label, isExporting }) => {
  if (!url) return null;

  const isImage = /\.(jpg|jpeg|png)$/i.test(fileName || url);
  const isPDF = /\.pdf$/i.test(fileName || url);

  return (
    <div className={`border ${isExporting ? 'border-gray-200 shadow-none' : 'border-gray-300 shadow-sm'} rounded-xl overflow-hidden hide-scrollbar bg-white transition`}>
      {/* Preview */}
      {!isExporting && (
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
      )}

      {/* Meta */}
      <div className={`p-3 ${isExporting ? 'bg-gray-50' : ''}`}>
        {label && (
          <p className="text-[11px] text-gray-500 mb-0.5">{label}</p>
        )}
        {/* <p className="text-sm font-medium text-gray-800 truncate">
          {fileName || "Document"}
        </p> */}
        {!isExporting && uploadedAt && (
          <p className="text-xs text-gray-400 mt-0.5">
            Uploaded {new Date(uploadedAt).toLocaleDateString()}
          </p>
        )}
      <a href={url} className="inline-block mt-2 text-xs text-primary font-medium hover:underline break-all" target="_blank" rel="noopener noreferrer">
        {isExporting ? fileName : "View full document →"}
      </a>
      </div>
    </div>
  );
};

const safeDocProps = (doc, isExporting) => {
  if (!doc) return { isExporting };
  const { key, ...rest } = doc;
  return { ...rest, isExporting };
};

const IDProofsSection = ({ idProofs, isExporting }) => (
  <div>
    <h4 className="font-semibold text-sm mb-3">ID Proofs</h4>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {(() => {
        const { key, ...aadhaar } = idProofs?.aadhaar || {};
        return <DocumentTile {...aadhaar} label="Aadhaar Card" isExporting={isExporting} />;
      })()}

      {(() => {
        const { key, ...pan } = idProofs?.pan || {};
        return <DocumentTile {...pan} label="PAN Card" isExporting={isExporting} />;
      })()}

      {(() => {
        const { key, ...passport } = idProofs?.passportOrDL || {};
        return <DocumentTile {...passport} label="Passport / DL" isExporting={isExporting} />;
      })()}

      {(() => {
        const { key, ...present } = idProofs?.presentAddressProof || {};
        return <DocumentTile {...present} label="Present Address Proof" isExporting={isExporting} />;
      })()}

      {(() => {
        const { key, ...permanent } = idProofs?.permanentAddressProof || {};
        return <DocumentTile {...permanent} label="Permanent Address Proof" isExporting={isExporting} />;
      })()}
    </div>
  </div>
);



const AcademicSection = ({ academic, isExporting }) => {
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
              {...safeDocProps(academic?.tenth?.certificate, isExporting)}
              label="Certificate"
            />
            <DocumentTile
              {...safeDocProps(academic?.tenth?.marksheet, isExporting)}
              label="Marksheet"
            />
          </div>
        </div>

        {/* 12th */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">12th Standard</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DocumentTile
              {...safeDocProps(academic?.twelth?.certificate, isExporting)}
              label="Certificate"
            />
            <DocumentTile
              {...safeDocProps(academic?.twelth?.marksheet, isExporting)}
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
                {...safeDocProps(academic.graduation.certificate, isExporting)}
                label="Degree Certificate"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {academic.graduation.marksheets?.map((m, i) => (
                <DocumentTile
                  key={i}
                  {...safeDocProps(m, isExporting)}
                  label={`Semester ${i + 1} Marksheet`}
                />
              ))}
            </div>
          </div>
        )}

        {/* NOC */}
        <DocumentTile
          {...safeDocProps(academic?.nocFromCollege, isExporting)}
          label="NOC from College"
        />
      </div>
    </div>
  );
};


const EmploymentSection = ({ history, isExporting }) => {
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
                  {...safeDocProps(d, isExporting)}
                  label="Offer Letter"
                />
              ))}

              {job.experienceLetter?.map((d, i) => (
                <DocumentTile
                  key={i}
                  {...safeDocProps(d, isExporting)}
                  label="Experience Letter"
                />
              ))}

              <DocumentTile
                {...safeDocProps(job.relievingLetter, isExporting)}
                label="Relieving Letter"
              />

              {job.salarySlips?.map((s, i) => (
                <DocumentTile
                  key={i}
                  url={s.documentUrl}
                  fileName={s.fileName}
                  label={`Salary Slip (${s.month})`}
                  isExporting={isExporting}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};