'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// Configure your API Base URL here or in a separate config file
const API_BASE_URL = 'http://localhost:2000/api/v1/hrms/';

export default function CreateProjectDrawer({
  isOpen = true,
  onClose = () => {},
  onProjectAdded = () => {}, // Callback to refresh parent list after success
  editingProject = null, // ✅ already passed
}) {
  // UI State
  console.log('editingProject', editingProject);
  const [openSections, setOpenSections] = useState({
    basic: true,
    timeline: false,
    team: false,
    attachments: false,
  });
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);

  // Data State
  const [employees, setEmployees] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    description: '',
    priority: '', // Note: Not in your Schema, handled as UI only
    status: 'planning',
    startDate: '',
    endDate: '',
  });

  const [projectLead, setProjectLead] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (!isOpen || !editingProject || employees.length === 0) return;

    // ===== BASIC FORM DATA =====
    setFormData({
      name: editingProject.name || '',
      clientName: editingProject.clientName || '',
      description: editingProject.description || '',
      priority: '', // UI only
      status: editingProject.status || 'planning',
      startDate: editingProject.startDate
        ? editingProject.startDate.split('T')[0]
        : '',
      endDate: editingProject.endDate
        ? editingProject.endDate.split('T')[0]
        : '',
    });

    // ===== PROJECT LEAD =====
    const lead = employees.find(
      (e) => e.id === editingProject.projectManager?._id
    );
    setProjectLead(lead || null);

    // ===== TEAM MEMBERS (excluding lead handled automatically) =====
    const members =
      editingProject.projectMembers
        ?.map((m) => employees.find((e) => e.id === m._id))
        .filter(Boolean) || [];

    setTeamMembers(members);
  }, [isOpen, editingProject, employees]);

  // Fetch Employees on Mount/Open
  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      setIsFetchingEmployees(true);
      const response = await axios.get(
        `http://localhost:2000/api/v1/hrms/employee/list`
      );
      console.log('response', response);
      const employeeList = response.data?.result || [];
      const formattedEmployees = employeeList.map((emp) => ({
        id: emp._id,
        name: `${emp.firstName} ${emp.lastName}`,
        // Handle nested population safely
        role: emp.designationId?.name || emp.designation || 'Employee',
        avatar: emp.profilePic || '👤', // Use placeholder or actual image URL
        // Store original object if needed
        original: emp,
      }));
      console.log('formattedEmployees', formattedEmployees);
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Failed to fetch employees', error);
      // Optional: toast.error("Could not load team members");
    } finally {
      setIsFetchingEmployees(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const selectProjectLead = (member) => {
    setProjectLead(member);
    setShowLeadDropdown(false);
  };

  const toggleTeamMember = (member) => {
    setTeamMembers((prev) => {
      const exists = prev.find((m) => m.id === member.id);
      if (exists) {
        return prev.filter((m) => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const removeTeamMember = (memberId) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Project Name is required');
      return;
    }
    if (!projectLead) {
      alert('Project Manager is required');
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        name: formData.name,
        description: formData.description,
        clientName: formData.clientName,
        status: formData.status,
        projectManager: projectLead.id,
        projectMembers: teamMembers.map((m) => m.id),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      let response;

      // 🔥 CREATE vs EDIT (dynamic)
      if (editingProject?._id) {
        response = await axios.patch(
          `http://localhost:2000/api/v1/hrms/projects/update-project/${editingProject._id}`,
          payload
        );
      } else {
        response = await axios.post(
          `http://localhost:2000/api/v1/hrms/projects/create-project`,
          payload
        );
      }

      if (response.data?.success || response.data?.responseCode === 200) {
        onProjectAdded();
        onClose();

        // reset only after success
        setFormData({
          name: '',
          clientName: '',
          description: '',
          priority: '',
          status: 'planning',
          startDate: '',
          endDate: '',
        });
        setProjectLead(null);
        setTeamMembers([]);
      } else {
        alert(response.data?.responseMessage || 'Operation failed');
      }
    } catch (error) {
      alert(error.response?.data?.responseMessage || 'Server Error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/40 backdrop-blur-sm z-40'
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-[840px] h-full bg-gray-50 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <header className='flex items-center justify-between px-8 py-6 bg-white border-b border-gray-200 shrink-0'>
          <div>
            <h4>Create Project</h4>
            <p className='text-sm text-gray-500 mt-1'>
              Add details for a new project initiative.
            </p>
          </div>
          <button
            className='flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-600'
            onClick={onClose}
          >
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M18 6L6 18M6 6l12 12' />
            </svg>
          </button>
        </header>

        {/* Content */}
        <div className='flex-1 overflow-y-auto px-8 py-6 space-y-4'>
          {/* Basic Details */}
          <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
            <button
              className='w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors'
              onClick={() => toggleSection('basic')}
            >
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                    <polyline points='14 2 14 8 20 8' />
                    <line x1='16' y1='13' x2='8' y2='13' />
                    <line x1='16' y1='17' x2='8' y2='17' />
                    <polyline points='10 9 9 9 8 9' />
                  </svg>
                </div>
                <h5>Basic Project Details</h5>
              </div>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                className={`text-gray-400 transition-transform duration-300 ${
                  openSections.basic ? 'rotate-180' : ''
                }`}
              >
                <polyline points='6 9 12 15 18 9' />
              </svg>
            </button>

            {openSections.basic && (
              <div className='px-6 pb-6 space-y-6 border-t border-gray-100'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-6'>
                  <label className='block'>
                    <span className='text-sm font-semibold text-gray-900 mb-2 block'>
                      Project Name <span className='text-orange-500'>*</span>
                    </span>
                    <input
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      className='w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all'
                      placeholder='e.g. Q3 HRMS Redesign'
                    />
                  </label>
                  <label className='block'>
                    <span className='text-sm font-semibold text-gray-900 mb-2 block'>
                      Client Name
                    </span>
                    <input
                      name='clientName'
                      value={formData.clientName}
                      onChange={handleChange}
                      className='w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all'
                      placeholder='e.g. Acme Corp'
                    />
                  </label>
                </div>

                <label className='block'>
                  <span className='text-sm font-semibold text-gray-900 mb-2 block'>
                    Description
                  </span>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    className='w-full min-h-[100px] p-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none resize-vertical transition-all'
                    placeholder='Describe the project scope and primary objectives...'
                  />
                </label>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <label className='block'>
                    <span className='text-sm font-semibold text-gray-900 mb-2 block'>
                      Priority Level
                    </span>
                    <div className='relative'>
                      <select
                        name='priority'
                        value={formData.priority}
                        onChange={handleChange}
                        className='w-full h-11 pl-4 pr-10 rounded-lg border border-gray-300 bg-white text-gray-900 appearance-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all cursor-pointer'
                      >
                        <option value='' disabled>
                          Select Priority
                        </option>
                        <option value='high'>High Priority</option>
                        <option value='medium'>Medium Priority</option>
                        <option value='low'>Low Priority</option>
                      </select>
                      <svg
                        className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <polyline points='6 9 12 15 18 9' />
                      </svg>
                    </div>
                  </label>
                  <label className='block'>
                    <span className='text-sm font-semibold text-gray-900 mb-2 block'>
                      Current Status <span className='text-orange-500'>*</span>
                    </span>
                    <div className='relative'>
                      <select
                        name='status'
                        value={formData.status}
                        onChange={handleChange}
                        className='w-full h-11 pl-4 pr-10 rounded-lg border border-gray-300 bg-white text-gray-900 appearance-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all cursor-pointer'
                      >
                        <option value='planning'>Planning Phase</option>
                        <option value='in-progress'>In Progress</option>
                        <option value='completed'>Completed</option>
                        <option value='on-hold'>On Hold</option>
                      </select>
                      <svg
                        className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <polyline points='6 9 12 15 18 9' />
                      </svg>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Timeline & Schedule */}
          <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
            <button
              className='w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors'
              onClick={() => toggleSection('timeline')}
            >
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
                    <line x1='16' y1='2' x2='16' y2='6' />
                    <line x1='8' y1='2' x2='8' y2='6' />
                    <line x1='3' y1='10' x2='21' y2='10' />
                  </svg>
                </div>
                <h5>Timeline & Schedule</h5>
              </div>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                className={`text-gray-400 transition-transform duration-300 ${
                  openSections.timeline ? 'rotate-180' : ''
                }`}
              >
                <polyline points='6 9 12 15 18 9' />
              </svg>
            </button>

            {openSections.timeline && (
              <div className='px-6 pb-6 space-y-6 border-t border-gray-100'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-6'>
                  <label className='block'>
                    <span className='text-sm font-semibold text-gray-900 mb-2 block'>
                      Start Date
                    </span>
                    <input
                      type='date'
                      name='startDate'
                      value={formData.startDate}
                      onChange={handleChange}
                      className='w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all'
                    />
                  </label>
                  <label className='block'>
                    <span className='text-sm font-semibold text-gray-900 mb-2 block'>
                      Expected End Date
                    </span>
                    <input
                      type='date'
                      name='endDate'
                      value={formData.endDate}
                      onChange={handleChange}
                      className='w-full h-11 px-4 rounded-lg border border-gray-300 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all'
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Team Composition */}
          <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
            <button
              className='w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors'
              onClick={() => toggleSection('team')}
            >
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
                    <circle cx='9' cy='7' r='4' />
                    <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
                    <path d='M16 3.13a4 4 0 0 1 0 7.75' />
                  </svg>
                </div>
                <h5>Team Composition</h5>
              </div>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                className={`text-gray-400 transition-transform duration-300 ${
                  openSections.team ? 'rotate-180' : ''
                }`}
              >
                <polyline points='6 9 12 15 18 9' />
              </svg>
            </button>

            {openSections.team && (
              <div className='px-6 pb-6 space-y-6 border-t border-gray-100 pt-6'>
                {/* Project Lead */}
                <div className='relative'>
                  <label className='text-sm font-semibold text-gray-900 mb-3 block'>
                    Project Lead <span className='text-orange-500'>*</span>
                  </label>
                  <div className='relative'>
                    <button
                      type='button'
                      onClick={() => {
                        setShowLeadDropdown(!showLeadDropdown);
                        setShowMemberDropdown(false);
                      }}
                      className='w-full h-16 px-4 rounded-xl border border-gray-300 bg-white hover:border-orange-500 transition-all flex items-center justify-between'
                    >
                      {projectLead ? (
                        <div className='flex items-center gap-3'>
                          <div className='w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xl overflow-hidden'>
                            {/* Render Avatar Logic */}
                            {projectLead.avatar &&
                            projectLead.avatar.length > 5 ? (
                              <img
                                src={projectLead.avatar}
                                alt='avatar'
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              projectLead.avatar
                            )}
                          </div>
                          <div className='text-left'>
                            <div className='font-bold text-gray-900'>
                              {projectLead.name}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {projectLead.role}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className='text-gray-400'>
                          Select Project Lead
                        </span>
                      )}
                      <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        className={`text-teal-600 transition-transform ${
                          showLeadDropdown ? 'rotate-180' : ''
                        }`}
                      >
                        <polyline points='6 9 12 15 18 9' />
                      </svg>
                    </button>

                    {showLeadDropdown && (
                      <>
                        <div
                          className='fixed inset-0 z-50'
                          onClick={() => setShowLeadDropdown(false)}
                        />
                        <div className='absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto'>
                          {isFetchingEmployees ? (
                            <div className='p-4 text-center text-gray-500'>
                              Loading employees...
                            </div>
                          ) : (
                            employees.map((member) => (
                              <button
                                type='button'
                                key={member.id}
                                onClick={() => selectProjectLead(member)}
                                className='w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0'
                              >
                                <div className='w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-lg overflow-hidden'>
                                  {member.avatar && member.avatar.length > 5 ? (
                                    <img
                                      src={member.avatar}
                                      alt=''
                                      className='w-full h-full object-cover'
                                    />
                                  ) : (
                                    member.avatar
                                  )}
                                </div>
                                <div className='text-left flex-1'>
                                  <div className='font-semibold text-gray-900'>
                                    {member.name}
                                  </div>
                                  <div className='text-xs text-gray-500'>
                                    {member.role}
                                  </div>
                                </div>
                                {projectLead?.id === member.id && (
                                  <svg
                                    width='20'
                                    height='20'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    className='text-teal-600'
                                  >
                                    <polyline points='20 6 9 17 4 12' />
                                  </svg>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                <div className=''>
                  <label className='text-sm font-semibold text-gray-900 mb-3 block'>
                    Team Members
                  </label>
                  <div className='relative'>
                    <button
                      type='button'
                      onClick={() => {
                        setShowMemberDropdown(!showMemberDropdown);
                        setShowLeadDropdown(false);
                      }}
                      className='w-full h-16 px-4 rounded-xl border border-gray-300 bg-white hover:border-orange-500 transition-all flex items-center justify-between'
                    >
                      {teamMembers.length > 0 ? (
                        <div className='flex items-center gap-2'>
                          <div className='flex -space-x-2'>
                            {teamMembers.slice(0, 3).map((member) => (
                              <div
                                key={member.id}
                                className='w-10 h-10 rounded-full  z-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white border-2 border-white text-sm overflow-hidden'
                              >
                                {member.avatar && member.avatar.length > 5 ? (
                                  <img
                                    src={member.avatar}
                                    alt=''
                                    className='w-full h-full object-cover'
                                  />
                                ) : (
                                  member.avatar
                                )}
                              </div>
                            ))}
                          </div>
                          {teamMembers.length > 3 && (
                            <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm'>
                              +{teamMembers.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className='text-gray-400'>
                          Select Team Members
                        </span>
                      )}
                      <svg
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        className='text-gray-400'
                      >
                        <line x1='12' y1='5' x2='12' y2='19' />
                        <line x1='5' y1='12' x2='19' y2='12' />
                      </svg>
                    </button>

                    {showMemberDropdown && (
                      <>
                        <div
                          className='inset-0'
                          onClick={() => setShowMemberDropdown(false)}
                        />
                        <div className='w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto'>
                          {employees.map((member) => {
                            const isSelected = teamMembers.find(
                              (m) => m.id === member.id
                            );
                            const isLead = projectLead?.id === member.id;

                            return (
                              <button
                                type='button'
                                key={member.id}
                                onClick={() =>
                                  !isLead && toggleTeamMember(member)
                                }
                                disabled={isLead}
                                className={`w-full px-4 py-3 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0 ${
                                  isLead
                                    ? 'opacity-40 cursor-not-allowed'
                                    : 'hover:bg-gray-50 cursor-pointer'
                                }`}
                              >
                                <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg overflow-hidden'>
                                  {member.avatar && member.avatar.length > 5 ? (
                                    <img
                                      src={member.avatar}
                                      alt=''
                                      className='w-full h-full object-cover'
                                    />
                                  ) : (
                                    member.avatar
                                  )}
                                </div>
                                <div className='text-left flex-1'>
                                  <div className='font-semibold text-gray-900'>
                                    {member.name}
                                  </div>
                                  <div className='text-xs text-gray-500'>
                                    {member.role}
                                  </div>
                                </div>
                                {isLead && (
                                  <span className='text-xs text-gray-400'>
                                    Project Lead
                                  </span>
                                )}
                                {isSelected && !isLead && (
                                  <svg
                                    width='20'
                                    height='20'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    className='text-blue-600'
                                  >
                                    <polyline points='20 6 9 17 4 12' />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Selected Team Members Display */}
                  {teamMembers.length > 0 && (
                    <div className='mt-4 space-y-2'>
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className='flex items-center justify-between px-4 py-2 bg-blue-50 rounded-lg border border-blue-100'
                        >
                          <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm overflow-hidden'>
                              {member.avatar && member.avatar.length > 5 ? (
                                <img
                                  src={member.avatar}
                                  alt=''
                                  className='w-full h-full object-cover'
                                />
                              ) : (
                                member.avatar
                              )}
                            </div>
                            <div>
                              <div className='font-semibold text-gray-900 text-sm'>
                                {member.name}
                              </div>
                              <div className='text-xs text-gray-500'>
                                {member.role}
                              </div>
                            </div>
                          </div>
                          <button
                            type='button'
                            onClick={() => removeTeamMember(member.id)}
                            className='w-6 h-6 rounded-full hover:bg-blue-100 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors'
                          >
                            <svg
                              width='16'
                              height='16'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                            >
                              <line x1='18' y1='6' x2='6' y2='18' />
                              <line x1='6' y1='6' x2='18' y2='18' />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Attachments (Optional/Disabled for now) */}
          <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
            <button
              className='w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors'
              onClick={() => toggleSection('attachments')}
            >
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48' />
                  </svg>
                </div>
                <h5>
                  Attachments{' '}
                  <span className='text-xs text-gray-400 font-normal ml-2'>
                    (Coming Soon)
                  </span>
                </h5>
              </div>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                className={`text-gray-400 transition-transform duration-300 ${
                  openSections.attachments ? 'rotate-180' : ''
                }`}
              >
                <polyline points='6 9 12 15 18 9' />
              </svg>
            </button>

            {openSections.attachments && (
              <div className='px-6 pb-6 space-y-4 border-t border-gray-100 pt-6 opacity-60 pointer-events-none'>
                <label className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50'>
                  <p className='text-gray-500'>
                    File upload is currently disabled
                  </p>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className='bg-white border-t border-gray-200 px-8 py-5 flex items-center justify-between shadow-lg'>
          <button
            className='px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors'
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <div className='flex items-center gap-4'>
            {isLoading && (
              <div className='flex items-center gap-2 text-gray-400'>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  className='animate-spin'
                >
                  <path d='M21 12a9 9 0 1 1-6.219-8.56' />
                </svg>
                <span className='text-xs font-medium'>Creating Project...</span>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`px-8 py-2.5 rounded-lg text-white text-sm font-bold shadow-lg shadow-orange-500/25 transition-all ${
                isLoading
                  ? 'bg-orange-300 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 hover:shadow-orange-500/40 active:scale-95'
              }`}
            >
              {editingProject ? 'Update Project' : 'Create Project'}

            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
