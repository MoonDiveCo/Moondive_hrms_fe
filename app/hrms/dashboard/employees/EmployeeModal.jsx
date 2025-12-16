'use client';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

export default function EmployeeModal({ employee, onClose, onEdit, onDelete }) {
  const modalRef = useRef(null);
  const confirmRef = useRef(null); 
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [modalMode, setModalMode] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    function handleClick(e) {
      const isInMain = modalRef.current && modalRef.current.contains(e.target);
      const isInConfirm = openConfirmModal && confirmRef.current && confirmRef.current.contains(e.target);
      if (!isInMain && !isInConfirm) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, openConfirmModal]); 

  useEffect(() => {
    console.log("Confirmation visible:", openConfirmModal, "Mode:", modalMode); 
  }, [openConfirmModal, modalMode]);

  const deleteEmployee = async () => {
    console.log("deleteEmployee started"); 
    try {
      
      const res = await axios.put(`/hrms/employee/delete-employee/${employee._id}`);
      console.log("API response:", res.data); 
      if (res.data.responseCode === 200) {
        console.log("Delete successful");
        return true; 
      }
      return false;
    } catch (err) {
      console.error("Error while deleting employee:", err);
      alert("Failed to delete employee. Please try again.");
      return false;
    } finally {
      setIsDeleting(false);
      console.log("deleteEmployee finished"); 
    }
  };

  const handleConfirm = async () => {
    

    if (modalMode === 'delete') {
      setIsDeleting(true);
      const success = await deleteEmployee();
      console.log("0000000000",success)
      setOpenConfirmModal(false);
      setModalMode('');
      if (success) {
        onDelete(); 
      }
      onClose()
    }
  };

  const handleDeleteClick = () => {
    console.log("Delete clicked", { employeeId: employee._id }); 
    setOpenConfirmModal(true);
    setModalMode('delete');
  };

  const handleConfirmClose = () => {
    setOpenConfirmModal(false);
    setModalMode('');
  };

  const handleConfirmCancel = (e) => {
    e.stopPropagation();
    console.log('Cancel clicked');
    handleConfirmClose();
  };

  const handleConfirmBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      console.log('Backdrop clicked');
      handleConfirmClose();
    }
  };

  const buttonRef = useRef(null);
  const [buttonPressed, setButtonPressed] = useState(false);

  useEffect(() => {
    const handleGlobalMouseUp = (e) => {
      if (buttonPressed) {
        e.preventDefault();
        e.stopPropagation();
        console.log('GLOBAL MOUSE UP - TRIGGERING CONFIRM');
        handleConfirm();
        setButtonPressed(false);
      }
    };

    if (openConfirmModal) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [buttonPressed, openConfirmModal]);

  const handleConfirmButtonDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setButtonPressed(true);
    if (buttonRef.current) {
      buttonRef.current.focus(); 
    }
  };

  if (!employee) return null;

  function handleEditClick() {
    onEdit(employee);
  }

  const confirmName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();

  return (
    <>
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

         
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="flex flex-col items-center md:items-start md:col-span-1">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
              <h3 className="text-lg font-semibold text-[var(--color-blackText)]">{employee.name}</h3>
              <p className="text-sm text-[var(--color-primaryText)] mt-1">{employee.designation}</p>
            </div>

            
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <h4 className="text-sm font-semibold text-[var(--color-blackText)] mb-3">Contact Information</h4>
                  <div className="text-sm text-[var(--color-primaryText)] space-y-3">
                    {employee.email && (
                      <div className="flex items-center gap-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>{employee.email}</div>
                      </div>
                    )}

                    {employee.mobileNumber && (
                      <div className="flex items-center gap-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M22 16.92V21a1 1 0 0 1-1.11 1 19.8 19.8 0 0 1-8.63-3.07 19.8 19.8 0 0 1-6-6A19.8 19.8 0 0 1 2 3.11 1 1 0 0 1 3 2h4.09a1 1 0 0 1 1 .75l.78 3.1a1 1 0 0 1-.27 .9L7.6 9.88a12.02 12.02 0 0 0 6 6l2.12-2.12a1 1 0 0 1 .9-.27l3.1.78a1 1 0 0 1 .75 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
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

                    {employee.reportingManagerId && (
                      <div className="flex items-start gap-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          {`${employee.reportingManagerId.firstName} ${employee.reportingManagerId.lastName}`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                
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

              
              <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md bg-white border border-gray-200 text-sm text-[var(--color-primaryText)] hover:bg-gray-50"
                >
                  Close
                </button>

                <button
                  onClick={handleDeleteClick}
                  className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-white text-sm font-semibold hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>

                <button
                  onClick={handleEditClick}
                  className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-white text-sm font-semibold hover:brightness-95"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      {openConfirmModal && (
        <div 
          ref={confirmRef} 
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          onClick={handleConfirmBackdrop}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />
          <div 
            className="relative w-[min(500px,90%)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}  
          >
            
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-[var(--color-blackText)]">
                Confirm Delete
              </h3>
              <button
                onClick={handleConfirmCancel}
                aria-label="Close confirmation"
                className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            
            <div className="p-6">
              <div className="text-center">
                <p className="text-sm text-[var(--color-primaryText)] mt-1">
                  Are you sure you want to delete {confirmName}?
                </p>
                <p className="text-xs text-red-500 mt-2">This action cannot be undone</p>
              </div>

              
              <div className="mt-6 flex justify-center gap-3 border-t border-gray-100 pt-4">
                <button
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 rounded-md bg-white border border-gray-200 text-sm text-[var(--color-primaryText)] hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  ref={buttonRef}
                  onMouseDown={handleConfirmButtonDown}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-white text-sm font-semibold hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}