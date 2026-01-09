'use client';

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { toast } from 'sonner';
import { AuthContext } from '@/context/authContext';
import SubModuleProtectedRoute from '@/lib/routeProtection/SubModuleProtectedRoute';
import AddOrganizationFileModal from '@/components/OrganizationFileComponent/AddOrganizationFileModal';
import ApproveCompanyPolicyModal from '@/components/OrganizationFileComponent/ApproveCompanyPolicyModal';
import AcknowledgementStatusModal from '@/components/OrganizationFileComponent/AcknowledgementStatusModal';
import ConfirmDeleteModal from '@/components/OrganizationFileComponent/ConfirmDeleteModal';

import {
  FileText,
  ShieldCheck,
  ScrollText,
  Search,
  Trash2,
  User,
  Eye,
  ThumbsUp,
} from 'lucide-react';

const CATEGORY_META = {
  'Company Docs': {
    icon: FileText,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    pill: 'bg-blue-100 text-blue-700',
  },
  'HR Policies': {
    icon: ShieldCheck,
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    pill: 'bg-orange-100 text-orange-700',
  },
  Internal: {
    icon: ScrollText,
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    pill: 'bg-slate-200 text-slate-700',
  },
};

const ITEMS_PER_PAGE = 10;

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
  
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [ackPolicy, setAckPolicy] = useState(null);

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
      toast.success('Policy approved');
      setApprovalModalOpen(false);
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
      toast.success('Policy rejected');
      setApprovalModalOpen(false);
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
          suggestedChanges: suggestions, // ✅ Matches backend expectation
        }
      );
      toast.success('Changes requested successfully');
      setApprovalModalOpen(false);
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
      toast.success('Policy acknowledged');
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
      
      // Optimistically remove from UI
      const deletedFileId = fileToDelete._id;
      setFiles(prevFiles => prevFiles.filter(f => f._id !== deletedFileId));
      
      await axios.delete(
        `/hrms/organization/deleteOrganizationFile/${deletedFileId}`
      );
      
      toast.success('File deleted');
      closeDeleteModal();
      
      // Refresh to ensure consistency
      fetchFiles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete file');
      // Revert optimistic update on error
      fetchFiles();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileUpload = async () => {
    try {
      // Validation
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

      // Create FormData
      const formData = new FormData();
      
      // IMPORTANT: Append file with name "file" to match multer.any("file")
      if (file) {
        formData.append('file', file);
      }
      
      formData.append('fileName', form.fileName);
      formData.append('description', form.description);
      formData.append('folder', form.folder);
      formData.append('allowedUsers', JSON.stringify(selectedUsers));

      let response;
      
      if (editMode && fileBeingEdited) {
        // Update existing file
        response = await axios.patch(
          `/hrms/organization/organization-files/${fileBeingEdited._id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        // Show appropriate message based on whether approval is required
        if (response.data.requiresApproval) {
          toast.success('File updated and sent for approval');
        } else if (isSuperAdmin) {
          toast.success('File updated successfully');
        } else {
          toast.success('New users added successfully');
        }
        
        // Optimistically update the UI
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f._id === fileBeingEdited._id 
              ? { ...f, ...response.data.data }
              : f
          )
        );
      } else {
        // Upload new file
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
        
        // Optimistically add the new file to the UI
        setFiles(prevFiles => [response.data.data, ...prevFiles]);
      }

      // Reset form
      setForm({ fileName: '', description: '', folder: '' });
      setFile(null);
      setSelectedUsers([]);
      setEditMode(false);
      setFileBeingEdited(null);
      setOpenModal(false);

      // Refresh files to ensure consistency
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

  /* ---------------- FILTER + PAGINATION ---------------- */

  const filteredFiles = files.filter((f) => {
    const matchSearch = f.fileName
      ?.toLowerCase()
      .includes(search.toLowerCase());

    if (activeFilter === 'Pending Policies') {
      return (
        canManagePolicies &&
        (f.status === 'PENDING_APPROVAL' || f.status === 'REJECTED' || f.status === 'CHANGES_REQUESTED') &&
        matchSearch
      );
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

      <div className="p-6 bg-[#F7F8FA] min-h-screen space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Organization Files</h3>
            <p className="text-sm text-gray-500">
              Manage and access organizational documents
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border bg-white"
              />
            </div>

            {canManagePolicies && (
              <button
                onClick={openAddModal}
                className="px-4 py-2 rounded-lg bg-[#FF7B30] text-white text-sm font-medium"
              >
                Add File
              </button>
            )}
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2 rounded-full text-sm ${
                  activeFilter === f
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border text-gray-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2 py-1 rounded bg-orange-500 text-white disabled:bg-gray-300"
              >
                ←
              </button>
              <span className="text-sm text-gray-500">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2 py-1 rounded bg-orange-500 text-white disabled:bg-gray-300"
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className={`grid ${
            activeFilter === 'Pending Policies' 
              ? 'grid-cols-[2fr_1fr_1fr_0.8fr_0.8fr]' 
              : isEmployeeOnly 
                ? 'grid-cols-[2fr_1fr_1fr_0.8fr_0.8fr]'  // Employee: Document, Category, Date, Acknowledgement, Action
                : 'grid-cols-12'  // Admin: Standard 12-column
          } px-6 py-3 text-xs font-semibold text-gray-500 border-b`}>
            <div className={activeFilter === 'Pending Policies' || isEmployeeOnly ? '' : 'col-span-5'}>DOCUMENT</div>
            <div className={activeFilter === 'Pending Policies' || isEmployeeOnly ? '' : 'col-span-3'}>CATEGORY</div>
            <div className={activeFilter === 'Pending Policies' || isEmployeeOnly ? '' : 'col-span-2'}>DATE</div>
            {activeFilter === 'Pending Policies' && (
              <div className="text-center">STATUS</div>
            )}
            {isEmployeeOnly && activeFilter !== 'Pending Policies' && (
              <div className="text-center">ACKNOWLEDGEMENT</div>
            )}
            <div className="text-right">ACTION</div>
          </div>

          {paginatedFiles.map((file) => {
            const meta = CATEGORY_META[file.folder] || CATEGORY_META.Internal;
            const Icon = meta.icon;

            // Check if current user has acknowledged
            const userAcknowledgement = file.allowedUsers?.find(
              (u) => u.user?._id?.toString() === user?._id?.toString()
            );
            const hasAcknowledged = userAcknowledgement?.acknowledgementStatus === 'ACKNOWLEDGED';

            return (
              <div
                key={file._id}
                onClick={() => {
                  if (activeFilter === 'Pending Policies') {
                    setSelectedPolicy(file);
                    setApprovalModalOpen(true);
                  }
                }}
                className={`grid ${
                  activeFilter === 'Pending Policies' 
                    ? 'grid-cols-[2fr_1fr_1fr_0.8fr_0.8fr]' 
                    : isEmployeeOnly 
                      ? 'grid-cols-[2fr_1fr_1fr_0.8fr_0.8fr]'
                      : 'grid-cols-12'
                } px-6 py-4 items-center border-b ${
                  activeFilter === 'Pending Policies'
                    ? 'cursor-pointer hover:bg-gray-50'
                    : ''
                }`}
              >
                <div className={`flex items-center gap-4 ${activeFilter === 'Pending Policies' || isEmployeeOnly ? '' : 'col-span-5'}`}>
                  <div className={`min-w-10 h-10 rounded-lg flex items-center justify-center ${meta.bg}`}>
                    <Icon className={`w-5 h-5 ${meta.text}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file.fileName}</p>
                    {file.description && (
                      <p className="text-xs text-gray-500">
                        {file.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className={activeFilter === 'Pending Policies' || isEmployeeOnly ? '' : 'col-span-3'}>
                  <span className={`px-3 py-1 rounded-full text-xs ${meta.pill}`}>
                    {file.folder}
                  </span>
                </div>

                <div className={`text-sm text-gray-500 ${activeFilter === 'Pending Policies' || isEmployeeOnly ? '' : 'col-span-2'}`}>
                  {new Date(file.createdAt).toLocaleDateString('en-IN')}
                </div>

                {activeFilter === 'Pending Policies' && (
                  <div className="text-center">
                    {file.status === 'REJECTED' ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                        Rejected
                      </span>
                    ) : file.status === 'CHANGES_REQUESTED' ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        Changes Requested
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    )}
                  </div>
                )}

                {/* ACKNOWLEDGEMENT COLUMN FOR EMPLOYEES */}
                {isEmployeeOnly && activeFilter !== 'Pending Policies' && (
                  <div className="flex justify-center">
                    {file.status === 'PUBLISHED' && userAcknowledgement ? (
                      hasAcknowledged ? (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="w-5 h-5 text-green-600" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledge(file._id);
                          }}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors"
                          title="Click to acknowledge"
                        >
                          <ThumbsUp className="w-4 h-4 text-orange-600" />
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                )}

                <div className={`flex justify-end gap-3 ${activeFilter === 'Pending Policies' || isEmployeeOnly ? '' : 'col-span-1'}`}>
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-orange-500 hover:text-orange-600"
                    title="View file"
                  >
                    <Eye size={16} />
                  </a>

                  {canManagePolicies && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAckPolicy(file);
                        setAckModalOpen(true);
                      }}
                      className="text-gray-600 hover:text-gray-800"
                      title="View acknowledgements"
                    >
                      <User size={16} />
                    </button>
                  )}

                  {canManagePolicies && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(file);
                      }}
                      className="text-blue-500 hover:text-blue-600"
                      title="Edit file"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                    </button>
                  )}

                  {canManagePolicies && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(file);
                      }}
                      className="text-red-500 hover:text-red-600"
                      title="Delete file"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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

        <ApproveCompanyPolicyModal
          open={approvalModalOpen}
          onClose={() => setApprovalModalOpen(false)}
          policy={selectedPolicy}
          isSuperAdmin={isSuperAdmin}
          onApprove={handleApprovePolicy}
          onReject={handleRejectPolicy}
          onSuggestChanges={handleSuggestChanges}
        />

        <AcknowledgementStatusModal
          open={ackModalOpen}
          onClose={() => setAckModalOpen(false)}
          policy={ackPolicy}
        />

        <ConfirmDeleteModal
          open={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          fileName={fileToDelete?.fileName}
          isDeleting={isDeleting}
        />
      </div>
    </SubModuleProtectedRoute>
  );
}