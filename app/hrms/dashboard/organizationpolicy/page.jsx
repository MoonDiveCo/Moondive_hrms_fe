'use client';

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { toast } from 'sonner';
import { AuthContext } from '@/context/authContext';
import SubModuleProtectedRoute from '@/lib/routeProtection/SubModuleProtectedRoute';
import AddOrganizationFileModal from '@/components/OrganizationFileComponent/AddOrganizationFileModal';
import ConfirmDeleteModal from '@/components/OrganizationFileComponent/ConfirmDeleteModal';
import ViewFileModal from '@/components/OrganizationFileComponent/ViewFileModal';
import OrganizationFilesTable from '@/components/OrganizationFileComponent/OrganizationFilesTable';

import { Search } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

export default function OrganizationPolicy() {
  const { allUserPermissions = [], user } = useContext(AuthContext);

  const canManagePolicies = allUserPermissions.includes(
    'HRMS:COMPANY_POLICY:WRITE'
  );

  const isSuperAdmin = user?.userRole?.includes('SuperAdmin');
  const isEmployeeOnly = !isSuperAdmin && !canManagePolicies;

  const FILTERS = [
    'All Files',
    'Company Docs',
    'HR Policies',
    ...(canManagePolicies ? ['Pending Policies'] : []),
  ];

  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [fileBeingEdited, setFileBeingEdited] = useState(null);
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewFile, setViewFile] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pageLoading, setPageLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [activeFilter, setActiveFilter] = useState('All Files');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    fileName: '',
    description: '',
    folder: '',
  });

  const [file, setFile] = useState(null);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* ---------------- FETCH USERS ---------------- */
  const fetchUsers = async () => {
    const res = await axios.get('/hrms/employee/list');
    setUsers(res.data?.result || []);
  };

  /* ---------------- FETCH FILES ---------------- */
  const fetchFiles = async () => {
    try {
      setPageLoading(true);
      const res = await axios.get('/hrms/organization/getOrganizationFile');
      setFiles(res.data?.data || []);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, search]);

  /* ---------------- ACTIONS ---------------- */
  const handleApprovePolicy = async (id) => {
    try {
      await axios.patch(
        `/hrms/organization/organization-policy/status/${id}`,
        { status: 'PUBLISHED' }
      );
      toast.success('Policy approved successfully');
      setViewModalOpen(false);
      setViewFile(null);
      fetchFiles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve policy');
    }
  };

  const handleRejectPolicy = async (id, reason) => {
    try {
      await axios.patch(
        `/hrms/organization/organization-policy/status/${id}`,
        {
          status: 'REJECTED',
          rejectionReason: reason,
        }
      );
      toast.success('Policy rejected successfully');
      setViewModalOpen(false);
      setViewFile(null);
      fetchFiles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject policy');
    }
  };

  const handleSuggestChanges = async (id, suggestions) => {
    try {
      await axios.patch(
        `/hrms/organization/organization-policy/status/${id}`,
        {
          status: 'CHANGES_REQUESTED',
          suggestedChanges: suggestions,
        }
      );
      toast.success('Changes requested successfully');
      setViewModalOpen(false);
      setViewFile(null);
      fetchFiles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to suggest changes');
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await axios.patch(
        `/hrms/organization/organization-policy/${id}/acknowledge`
      );
      toast.success('Policy acknowledged successfully');
      fetchFiles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to acknowledge');
    }
  };

  const openDeleteModal = (file) => {
    setFileToDelete(file);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setFileToDelete(null);
    }
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      const deletedFileId = fileToDelete._id;
      setFiles(prevFiles => prevFiles.filter(f => f._id !== deletedFileId));
      
      await axios.delete(
        `/hrms/organization/deleteOrganizationFile/${deletedFileId}`
      );
      
      toast.success('File deleted');
      closeDeleteModal();
      
      fetchFiles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete file');
      fetchFiles();
    } finally {
      setIsDeleting(false);
    }
  };

 const handleFileUpload = async () => {
  try {
    if (!editMode && !file) {
      toast.error('Please select a file');
      return;
    }

    if (!form.fileName.trim()) {
      toast.error('Please enter a file name');
      return;
    }

    if (!form.folder) {
      toast.error('Please select a folder');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    
    if (file) {
      formData.append('file', file);
    }
    
    formData.append('fileName', form.fileName);
    formData.append('description', form.description);
    formData.append('folder', form.folder);
    formData.append('allowedUsers', JSON.stringify(selectedUsers));

    let response;
    
    if (editMode && fileBeingEdited) {
      response = await axios.patch(
        `/hrms/organization/organization-files/${fileBeingEdited._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Show appropriate message based on backend response
      if (response.data.requiresApproval) {
        toast.success('File updated and sent for re-approval');
      } else if (isSuperAdmin) {
        toast.success('File updated successfully');
      } else {
        toast.success(response.data.message || 'File updated successfully');
      }
      
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f._id === fileBeingEdited._id 
            ? { ...f, ...response.data.data }
            : f
        )
      );
    } else {
      response = await axios.post(
        '/hrms/organization/organization-files', 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success(
        isSuperAdmin
          ? 'File published successfully'
          : 'File sent for approval'
      );
      
      setFiles(prevFiles => [response.data.data, ...prevFiles]);
    }

    setForm({ fileName: '', description: '', folder: '' });
    setFile(null);
    setSelectedUsers([]);
    setEditMode(false);
    setFileBeingEdited(null);
    setOpenModal(false);

    fetchFiles();
  } catch (error) {
    toast.error(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'upload'} file`);
  } finally {
    setUploading(false);
  }
};

  const openAddModal = () => {
    setEditMode(false);
    setFileBeingEdited(null);
    setForm({ fileName: '', description: '', folder: '' });
    setFile(null);
    setSelectedUsers([]);
    setOpenModal(true);
  };

  const openEditModal = (file) => {
    setEditMode(true);
    setFileBeingEdited(file);
    setOpenModal(true);
  };


  const filteredFiles = files.filter((f) => {
    const matchSearch = f.fileName
      ?.toLowerCase()
      .includes(search.toLowerCase());

    if (activeFilter === 'Pending Policies') {
      // Show only pending/rejected/changes_requested in Pending Policies tab
      return (
        canManagePolicies &&
        (f.status === 'PENDING_APPROVAL' || f.status === 'REJECTED' || f.status === 'CHANGES_REQUESTED') &&
        matchSearch
      );
    }


    const isPendingOrRejected = 
      f.status === 'PENDING_APPROVAL' || 
      f.status === 'REJECTED' || 
      f.status === 'CHANGES_REQUESTED';
    
    // Skip pending/rejected files in non-pending tabs
    if (isPendingOrRejected) {
      return false;
    }
    
    const matchFilter =
      activeFilter === 'All Files' || f.folder === activeFilter;

    return matchFilter && matchSearch;
  });

  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);

  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalFiles = filteredFiles.length;

  /* ---------------- COUNTERS ---------------- */
  // For Super Admin: Count pending approvals (HR submitted files)
  const pendingApprovalsCount = isSuperAdmin
    ? files.filter((f) => f.status === 'PENDING_APPROVAL').length
    : 0;

  // For HR: Count rejected or changes requested files
  const hrActionRequiredCount = canManagePolicies && !isSuperAdmin
    ? files.filter(
        (f) => f.status === 'REJECTED' || f.status === 'CHANGES_REQUESTED'
      ).length
    : 0;

  // For Employees: Count unacknowledged published files
  const getUnacknowledgedCount = (filterType) => {
    if (!isEmployeeOnly) return 0;

    return files.filter((f) => {
      // Only count published files
      if (f.status !== 'PUBLISHED' && f.status) return false;

      // Check if file matches the filter
      let matchesFilter = false;
      if (filterType === 'All Files') {
        matchesFilter = true;
      } else {
        matchesFilter = f.folder === filterType;
      }

      if (!matchesFilter) return false;

      // Check if user is in allowed users and hasn't acknowledged
      const userAcknowledgement = f.allowedUsers?.find(
        (u) => u.user?._id?.toString() === user?._id?.toString()
      );

      // Make sure the current user is not a Super Admin or HR
      const isSuperAdminOrHR = 
        user?.userRole?.includes('SUPER_ADMIN') || 
        user?.userRole?.includes('HR') ||
        user?.userRole?.includes('SuperAdmin');

      return (
        userAcknowledgement &&
        userAcknowledgement.acknowledgementStatus !== 'ACKNOWLEDGED' &&
        !isSuperAdminOrHR
      );
    }).length;
  };

  const allFilesUnacknowledgedCount = getUnacknowledgedCount('All Files');
  const companyDocsUnacknowledgedCount = getUnacknowledgedCount('Company Docs');
  const hrPoliciesUnacknowledgedCount = getUnacknowledgedCount('HR Policies');

  return (
    <SubModuleProtectedRoute>
      {pageLoading && (
        <div className='flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm z-50'>
          <DotLottieReact
            src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
            loop
            autoplay
            style={{ width: 100, height: 100, alignItems: 'center' }}
          />
        </div>
      )}

      <div className="p-3 bg-gray-50 min-h-screen hide">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-bold text-gray-900">Organization Files</h4>
              <p className="text-sm text-gray-500 mt-1">
                Manage and access organizational documents
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search files..."
                  className="w-80 pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {canManagePolicies && (
                <button
                  onClick={openAddModal}
                  className="px-5 py-2.5 rounded-lg bg-[#FF7B30] text-white text-sm font-medium hover:bg-[#ff6a1a] transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">+</span>
                  Add File
                </button>
              )}
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {FILTERS.map((f) => {
                // Determine counter for this filter
                let counter = 0;

                if (f === 'Pending Policies') {
                  // Super Admin sees pending approvals
                  if (isSuperAdmin) {
                    counter = pendingApprovalsCount;
                  }
                  // HR sees rejected or changes requested
                  else if (canManagePolicies) {
                    counter = hrActionRequiredCount;
                  }
                } else if (isEmployeeOnly) {
                  // Employees see unacknowledged counts
                  if (f === 'All Files') {
                    counter = allFilesUnacknowledgedCount;
                  } else if (f === 'Company Docs') {
                    counter = companyDocsUnacknowledgedCount;
                  } else if (f === 'HR Policies') {
                    counter = hrPoliciesUnacknowledgedCount;
                  }
                }

                return (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all relative ${
                      activeFilter === f
                        ? 'bg-[#FF7B30] text-white shadow-sm'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {f}
                      {counter > 0 && (
                        <span
                          className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
                            activeFilter === f
                              ? 'bg-white text-[#FF7B30]'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {counter}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="text-sm text-gray-600 font-medium min-w-[60px] text-center">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-2 rounded-lg bg-[#FF7B30] text-white hover:bg-[#ff6a1a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* TABLE */}
          <OrganizationFilesTable
            files={paginatedFiles}
            user={user}
            activeFilter={activeFilter}
            isEmployeeOnly={isEmployeeOnly}
            canManagePolicies={canManagePolicies}
            onViewFile={(file) => {
              setViewFile(file);
              setViewModalOpen(true);
            }}
            onViewAcknowledgements={(file) => {
              setViewFile(file);
              setViewModalOpen(true);
            }}
            onEditFile={openEditModal}
            onDeleteFile={openDeleteModal}
            onAcknowledge={handleAcknowledge}
            onPolicyClick={(file) => {
              setViewFile(file);
              setViewModalOpen(true);
            }}
          />

          {/* Pagination Footer */}
          {totalFiles > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalFiles)}
                </span>{' '}
                of <span className="font-medium">{totalFiles}</span> documents
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev=>prev-1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-[#FF7B30] text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
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
                          <span key={pageNum} className="w-9 h-9 flex items-center justify-center text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev)=>prev+1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm rounded-lg bg-[#FF7B30] text-white hover:bg-[#ff6a1a] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}
      <AddOrganizationFileModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditMode(false);
          setFileBeingEdited(null);
        }}
        form={form}
        update={update}
        file={file}
        setFile={setFile}
        users={users}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        uploading={uploading}
        onSubmit={handleFileUpload}
        editMode={editMode}
        existingFile={fileBeingEdited}
      />

      <ViewFileModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewFile(null);
        }}
        file={viewFile}
        user={user}
        isSuperAdmin={isSuperAdmin}
        canManagePolicies={canManagePolicies}
        onApprove={handleApprovePolicy}
        onReject={handleRejectPolicy}
        onSuggestChanges={handleSuggestChanges}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onAcknowledge={handleAcknowledge}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        fileName={fileToDelete?.fileName}
        isDeleting={isDeleting}
      />
    </SubModuleProtectedRoute>
  );
}