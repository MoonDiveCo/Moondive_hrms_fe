"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mail,
  Phone,
  ExternalLink,
  MessageSquare,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import LeadDetail from "./LeadDetail";
import { toast } from "react-toastify";

export default function LeadList({
  leads,
  loading,
  onSelectLead,
  sendEmail,
  onRefresh,
  currentPage = 1,
  leadsPerPage = 10,
  onPageChange,
}) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const menuRef = useRef(null);
  const totalLeads = leads.length;
  const totalPages = Math.ceil(totalLeads / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = startIndex + leadsPerPage;
  const paginatedLeads = leads.slice(startIndex, endIndex);
  const [gradePopupLead, setGradePopupLead] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
    onSelectLead && onSelectLead(lead);
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/${leadId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast.success("Status updated successfully");
        onRefresh && onRefresh();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTabUpdate = async (leadId, newTab) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/${leadId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tab: newTab }),
        }
      );

      if (response.ok) {
        toast.success("Tab updated successfully");
        onRefresh && onRefresh();
      }
    } catch (error) {
      console.error("Failed to update tab:", error);
      toast.error("Failed to update tab");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedLead(null);
  };

  const handlePageChange = (page) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      Hot: "bg-red-100 text-red-700 border-red-200",
      Warm: "bg-orange-100 text-orange-700 border-orange-200",
      Cold: "bg-blue-100 text-blue-700 border-blue-200",
      Frozen: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[grade] || colors["Frozen"];
  };

  const getStatusColor = (status) => {
    const colors = {
      New: "bg-green-100 text-green-700",
      Contacted: "bg-blue-100 text-blue-700",
      Qualified: "bg-purple-100 text-purple-700",
      Converted: "bg-emerald-100 text-emerald-700",
      Lost: "bg-gray-100 text-gray-700",
    };
    return colors[status] || colors["New"];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center w-[60vw]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="p-12 text-center w-[60vw]">
        <div className="text-gray-400 mb-4">
          <Mail className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No leads found
        </h3>
        <p className="text-gray-600">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <>
<div className="overflow-x-auto">
  <table className="w-full">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Lead
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Company
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          LeadScore
        </th>
        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th> */}
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Source
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Last Activity
        </th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>

    <tbody className="bg-white divide-y divide-gray-200">
      {paginatedLeads.map((lead, index) => (
        <tr
          key={lead._id ? `${lead._id}-${index}` : `lead-${index}`}
          className="hover:bg-gray-50 transition-colors"
        >
          {/* Lead */}
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                  {lead.firstName?.[0]}
                  {lead.lastName?.[0]}
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  {lead.firstName} {lead.lastName}
                  {lead.lastEmailSent && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
                      title={`Last email: ${new Date(
                        lead.lastEmailSent
                      ).toLocaleDateString()}`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Contacted
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {lead.email}
                </div>

                {lead.phone && (
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {lead.phone}
                  </div>
                )}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">
              {lead.companyName || "—"}
            </div>
            {lead.companySize && (
              <div className="text-xs text-gray-500">
                {lead.companySize} employees
              </div>
            )}
          </td>

          {/* Score (grade + numeric) with popup trigger */}
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGradePopupLead(lead)}
                className={`px-3 py-1 rounded-full border text-xs font-semibold cursor-pointer ${getGradeColor(
                  lead.leadGrade || "Frozen"
                )}`}
                title="View grade criteria"
              >
                {lead.leadGrade || lead.leadType || "Frozen"}
              </button>
              {/* <div className="text-sm font-medium text-gray-900">
                {lead.leadScore || 0}/100
              </div> */}
            </div>
          </td>

          {/* Status */}
          {/* <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                lead.status
              )}`}
            >
              {lead.status}
            </span>
          </td> */}

          {/* Source */}
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-700">
              {lead._sourceLabel || lead.source || "Unknown"}
            </span>
          </td>

          {/* Last Activity */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <div>
              {formatDate(
                lead.lastActivityAt ||
                  lead.createdAt ||
                  lead.lastEmailSent
              )}
            </div>
            <div className="text-xs text-gray-400">
              {lead.pagesVisited?.length || 0} pages viewed
            </div>
          </td>

          {/* Actions */}
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center justify-end gap-2 relative">
              <button
                onClick={() => handleViewLead(lead)}
                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={() => sendEmail(lead)}
                className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded transition-colors"
                title="Send Email"
              >
                <Mail className="w-4 h-4" />
              </button>

              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded transition-colors"
                  title="Call"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}

              {lead.companyWebsite && (
                <a
                  href={lead.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded transition-colors"
                  title="Visit Website"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <button
                onClick={() =>
                  setActiveMenu(activeMenu === lead._id ? null : lead._id)
                }
                className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded transition-colors"
                title="More Actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {activeMenu === lead._id && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-8 w-44 bg-white shadow-lg border rounded-md z-50 py-1 text-sm"
                >
                  <button
                    onClick={() => {
                      handleTabUpdate(lead._id, "In Process");
                      setActiveMenu(null);
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-900"
                  >
                    Move to In Process
                  </button>
                  <button
                    onClick={() => {
                      handleStatusUpdate(lead._id, "Archived");
                      setActiveMenu(null);
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-red-50 text-red-600"
                  >
                    Archive Lead
                  </button>
                </div>
              )}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, totalLeads)}
                </span>{" "}
                of <span className="font-medium">{totalLeads}</span> leads
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Page numbers */}
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNum}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {isDetailOpen && selectedLead && (
        <LeadDetail
          leadId={selectedLead._id}
          leadData={selectedLead}
          onClose={handleCloseDetail}
          onUpdate={onRefresh}
        />
      )}
       {gradePopupLead && (
        <LeadGradePopup
          lead={gradePopupLead}
          onClose={() => setGradePopupLead(null)}
        />
      )}
    </>
  );
}function LeadGradePopup({ lead, onClose }) {
  const score = lead.leadScore || 0;

  // Prefer backend grade; fall back to computed from score
  let grade = "Frozen";

  if (lead.leadGrade) {
    const g = String(lead.leadGrade).toLowerCase();

    if (g === "hot") grade = "Hot";
    else if (g === "warm") grade = "Warm";
    else if (g === "cold") grade = "Cold";
    else grade = "Frozen";
  } else {
    // Fallback: compute from score using your criteria
    if (score >= 80) {
      grade = "Hot";
    } else if (score >= 60) {
      grade = "Warm";
    } else if (score >= 40) {
      grade = "Cold";
    } else {
      grade = "Frozen";
    }
  }

  const isCurrent = (g) => g === grade;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Lead Score Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Lead info */}
        <div className="mb-4">
          <div className="text-sm text-gray-500">Lead</div>
          <div className="text-base font-medium text-gray-900">
            {lead.firstName} {lead.lastName}
          </div>
          {lead.email && (
            <div className="text-xs text-gray-500">{lead.email}</div>
          )}
        </div>

        {/* Score + Grade */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Score</div>
            <div className="text-2xl font-bold text-gray-900">
              {score}/100
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Grade</div>
            <span
              className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold
                ${
                  grade === "Hot"
                    ? "bg-red-100 text-red-700"
                    : grade === "Warm"
                    ? "bg-orange-100 text-orange-700"
                    : grade === "Cold"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }
              `}
            >
              {grade}
            </span>
          </div>
        </div>

        {/* Criteria */}
        <div className="border-t border-gray-200 pt-3">
          <div className="text-xs font-semibold text-gray-500 mb-2">
            Grade criteria
          </div>
          <ul className="space-y-1 text-sm">
            <li
              className={`flex justify-between ${
                isCurrent("Hot") ? "font-semibold text-red-600" : "text-gray-700"
              }`}
            >
              <span>Hot</span>
              <span>Score ≥ 80</span>
            </li>
            <li
              className={`flex justify-between ${
                isCurrent("Warm")
                  ? "font-semibold text-orange-600"
                  : "text-gray-700"
              }`}
            >
              <span>Warm</span>
              <span>60 – 79</span>
            </li>
            <li
              className={`flex justify-between ${
                isCurrent("Cold")
                  ? "font-semibold text-blue-600"
                  : "text-gray-700"
              }`}
            >
              <span>Cold</span>
              <span>40 – 59</span>
            </li>
            <li
              className={`flex justify-between ${
                isCurrent("Frozen")
                  ? "font-semibold text-gray-700"
                  : "text-gray-700"
              }`}
            >
              <span>Frozen</span>
              <span>&lt; 40</span>
            </li>
          </ul>
        </div>

        {/* Close button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
