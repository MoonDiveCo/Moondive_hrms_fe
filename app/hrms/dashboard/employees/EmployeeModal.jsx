'use client';
import React, { useEffect, useRef } from 'react';

export default function EmployeeModal({ employee, onClose, onEdit }) {
  const modalRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    function handleClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  if (!employee) return null;

  function handleEditClick() {
    onEdit(employee);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="employee-modal-title"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={modalRef}
        className="relative w-[min(900px,95%)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 id="employee-modal-title" className="text-xl font-semibold text-[var(--color-blackText)]">
            Employee Details
          </h2>

          <button
            onClick={onClose}
            aria-label="Close employee details"
            className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: avatar + name */}
          <div className="flex flex-col items-center md:items-start md:col-span-1">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-32 h-32 rounded-full object-cover mb-4"
            />
            <h3 className="text-lg font-semibold text-[var(--color-blackText)]">{employee.name}</h3>
            <p className="text-sm text-[var(--color-primaryText)] mt-1">{employee.designation}</p>
            {employee.employmentStatus && (
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  employee.employmentStatus === 'Active' 
                    ? 'bg-green-100 text-green-700' 
                    : employee.employmentStatus === 'On Probation'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {employee.employmentStatus}
                </span>
              </div>
            )}
          </div>

          {/* Right: contact & employment details */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-blackText)] mb-3">Contact Information</h4>
                <div className="text-sm text-[var(--color-primaryText)] space-y-3">
                  {employee.email && (
                    <div className="flex items-center gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 8.5v7A2.5 2.5 0 0 0 5.5 18h13A2.5 2.5 0 0 0 21 15.5v-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div>{employee.email}</div>
                    </div>
                  )}

                  {employee.mobileNumber && (
                    <div className="flex items-center gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92V21a1 1 0 0 1-1.11 1 19.8 19.8 0 0 1-8.63-3.07 19.8 19.8 0 0 1-6-6A19.8 19.8 0 0 1 2 3.11 1 1 0 0 1 3 2h4.09a1 1 0 0 1 1 .75l.78 3.1a1 1 0 0 1-.27.9L7.6 9.88a12.02 12.02 0 0 0 6 6l2.12-2.12a1 1 0 0 1 .9-.27l3.1.78a1 1 0 0 1 .75 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div>{employee.mobileNumber}</div>
                    </div>
                  )}

                  {employee.address && employee.address[0] && (
                    <div className="flex items-start gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5">
                        <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1 1 18 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div>
                        {employee.address[0].city && employee.address[0].state 
                          ? `${employee.address[0].city}, ${employee.address[0].state}` 
                          : employee.address[0].city || employee.address[0].state || '-'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-blackText)] mb-3">Employment Details</h4>

                <div className="grid grid-cols-2 gap-4 text-sm text-[var(--color-primaryText)]">
                  <div>
                    <div className="text-xs text-[#8b8f94]">Employee ID</div>
                    <div className="mt-1 font-medium text-[var(--color-blackText)]">{employee.employeeId || "-"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-[#8b8f94]">Department</div>
                    <div className="mt-1 font-medium text-[var(--color-blackText)]">{employee.department || "-"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-[#8b8f94]">Reporting Manager</div>
                    <div className="mt-1 font-medium text-[var(--color-blackText)]">
                      {employee.reportingManagerId 
                        ? (typeof employee.reportingManagerId === 'object' 
                            ? `${employee.reportingManagerId.firstName} ${employee.reportingManagerId.lastName}` 
                            : '-')
                        : "-"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#8b8f94]">Start Date</div>
                    <div className="mt-1 font-medium text-[var(--color-blackText)]">
                      {employee.dateOfJoining 
                        ? new Date(employee.dateOfJoining).toLocaleDateString() 
                        : "-"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#8b8f94]">Employment Type</div>
                    <div className="mt-1 font-medium text-[var(--color-blackText)]">{employee.employmentType || "-"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-[#8b8f94]">Available Leave</div>
                    <div className="mt-1 font-medium text-[var(--color-blackText)]">
                      {employee.availableLeave !== undefined ? `${employee.availableLeave} days` : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* footer actions */}
            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-white border border-gray-200 text-sm text-[var(--color-primaryText)] hover:bg-gray-50"
              >
                Close
              </button>

              <button
                className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-white text-sm font-semibold hover:brightness-95"
                onClick={handleEditClick}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}