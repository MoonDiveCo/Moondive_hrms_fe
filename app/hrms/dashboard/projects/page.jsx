'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import CreateProjectDrawer from './CreateProjectDrawer';
import { AuthContext } from '@/context/authContext';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

function useMembersPerRow(ref) {
  const [count, setCount] = useState(4);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;

      if (width < 500) setCount(1);
      else if (width < 700) setCount(2);
      else if (width < 1000) setCount(3);
      else setCount(4);
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return count;
}

function TeamMembers({ members }) {
  const containerRef = useRef(null);
  const membersPerRow = useMembersPerRow(containerRef);

  if (!members || members.length === 0) return null;

  const rows = [];
  for (let i = 0; i < members.length; i += membersPerRow) {
    rows.push(members.slice(i, i + membersPerRow));
  }

  return (
    <div ref={containerRef} className='relative w-full'>
      {rows.map((rowMembers, rowIndex) => (
        <div key={rowIndex} className='relative w-full mb-4'>
          <div className="flex justify-between items-center absolute top-0 left-0 right-0 px-16">
            <div className="h-0.5 bg-[#5e888d] flex-1" />
          </div>

          <div
            className='grid gap-6 w-full px-8'
            style={{
              gridTemplateColumns: `repeat(${rowMembers.length}, 1fr)`,
            }}
          >
            {rowMembers.map((member) => (
              <div
                key={member._id}
                className='flex flex-col items-center relative justify-self-center'
              >
                <div className='w-0.5 h-10 bg-[#5e888d]' />

                <img
                  className='w-16 h-16 rounded-full border-4 border-white shadow-md object-cover'
                  src={
                    member.imageUrl ||
                    'https://img.freepik.com/free-photo/waist-up-portrait-handsome-serious-unshaven-male-keeps-hands-together-dressed-dark-blue-shirt-has-talk-with-interlocutor-stands-against-white-wall-self-confident-man-freelancer_273609-16320.jpg'
                  }
                  alt={member.firstName}
                />

                <div className='bg-white border border-[#5e888d] rounded-xl px-4 py-2 text-center mt-2 shadow-sm w-48'>
                  <p className='font-semibold text-sm text-gray-900'>
                    {member.firstName}{' '}
                    {member.lastName}
                  </p>
                  <p className='text-xs text-gray-500 mt-0.5'>
                    Team Member
                  </p>
                </div>

                {rowIndex < rows.length - 1 && (
                  <div className='w-0.5 h-10 bg-[#5e888d] mt-2' />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProjectPage() {
  const [openProject, setOpenProject] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [statusModal, setStatusModal] = useState(null); // { projectId, currentStatus }
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const { user, allUserPermissions } = useContext(AuthContext);

  const toggleProject = (id) => {
    setOpenProject((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/hrms/projects/get-all-project');
      if (res.data?.responseCode === 200) {
        setProjects(res?.data?.result || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsDrawerOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const res = await axios.delete(
        `/hrms/projects/delete-project/${projectId}`
      );

      if (res.data?.responseCode === 200) {
        toast.success('Project Deleted Successfully');
        fetchProjects();
      } else {
        toast.error(res.data?.responseMessage || 'Failed To Delete Project');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error(err || 'Failed To Delete Project');
    }
    setOpenMenuId(null);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProject(null);
  };

  const STATUS_OPTIONS = [
    { value: 'planning', label: 'Planning Phase', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'on-hold', label: 'On Hold', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  ];

  const handleStatusChange = async (projectId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await axios.patch(`/hrms/projects/update-project/${projectId}`, { status: newStatus });
      if (res.data?.success || res.data?.responseCode === 200) {
        toast.success('Status updated successfully');
        setProjects((prev) =>
          prev.map((p) => (p._id === projectId ? { ...p, status: newStatus } : p))
        );
        setStatusModal(null);
      } else {
        toast.error(res.data?.responseMessage || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const calculateProjectHours = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffMs = end - start;
    if (diffMs <= 0) return 0;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const hoursPerDay = 8;
    return Math.round(diffDays * hoursPerDay);
  };

  const getTimelineProgress = (startDate, endDate, status) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    const total = end - start;
    if (total <= 0) return null;
    const isCompleted = status === 'completed';
    const elapsed = today - start;
    const rawPct = Math.round((elapsed / total) * 100);
    const pct = isCompleted ? 100 : Math.min(100, Math.max(0, rawPct));
    const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    const totalDays = Math.round(total / (1000 * 60 * 60 * 24));
    const fmt = (d) =>
      new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const completedEarly = isCompleted && daysLeft > 0;
    return { pct, daysLeft, totalDays, startFmt: fmt(start), endFmt: fmt(end), isCompleted, completedEarly };
  };

  // Permission checks — keep both for flexibility
  const isAdmin =
    user?.userRole?.includes('SuperAdmin') ||
    user?.userRole?.includes('Admin') ||
    user?.permissions?.includes('*');

  const canWriteProject = allUserPermissions.includes('HRMS:PROJECTS:WRITE') || allUserPermissions.includes('*');
  const canEditProject = allUserPermissions.includes('HRMS:PROJECTS:EDIT') || allUserPermissions.includes('*');
  const canDeleteProject = allUserPermissions.includes('HRMS:PROJECTS:DELETE') || allUserPermissions.includes('*');

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm z-50'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: 'center' }}
        />
      </div>
    );
  }

  return (
    <div className='bg-background-light font-body text-gray-800'>
      {/* ================= GLOBAL CSS ================= */}
      <style>{`
        .tree-line-vertical {
          width: 2px;
          height: 32px;
          margin: 0 auto;
          background-color: #5e888d;
        }
        .tree-line-short {
          width: 2px;
          height: 32px;
          margin: 0 auto;
          background-color: #5e888d;
        }
        .tree-horizontal {
          position: absolute;
          top: 0;
          height: 2px;
          background-color: #5e888d;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          scrollbar-width: none;
        }

        /* Smooth animations */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slideDown 0.4s ease-out forwards;
        }
      `}</style>

      <main className='p-6 max-w-[1600px] mx-auto'>
        {/* HEADER */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h3 className='mb-2'>Projects Overview</h3>
            <p className='text-text-secondary'>
              Monitor active projects, resources, and timeline estimations.
            </p>
          </div>
          {canWriteProject && (
            <div className='flex gap-3'>
              <button
                className='flex items-center gap-2 px-4 py-2.5 bg-primary cursor-pointer text-white rounded-lg transition-all shadow-lg shadow-orange-500/20'
                onClick={() => setIsDrawerOpen(true)}
              >
                Add Project
              </button>
            </div>
          )}
        </div>

        {/* ================= PROJECT CARDS ================= */}
        {projects.length === 0 ? (
          <div className='text-center py-20 text-text-secondary'>
            No projects found
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project._id}
              className='bg-white rounded-xl border border-primary/30 ring-1 ring-primary/10 mb-6'
              style={{
                overflow: openMenuId === project._id ? 'visible' : 'hidden',
              }}
            >
              {/* SUMMARY */}
              <div className='bg-primary/5 relative'>
                <div className='p-5 flex items-center gap-4 relative'>

                  {/* Clickable row — expands/collapses card */}
                  <div
                    onClick={() => toggleProject(project._id)}
                    className='flex-1 flex items-center gap-4 cursor-pointer hover:bg-primary/8 transition-colors duration-200 -mx-5 px-5 py-5 -my-5'
                  >
                    <div className='flex-1'>
                      <h5 className='font-semibold'>{project.name}</h5>
                    </div>

                    <div className='w-full md:w-32'>
                      <span className='inline-flex items-center px-4 py-2 text-xs font-medium text-[#5e888d] border border-[#5e888d] rounded-full'>
                        {project.status}
                      </span>
                    </div>

                    <div className='w-full md:w-48 flex items-center gap-3'>
                      <img
                        className='w-11 h-11 rounded-full border border-white object-cover'
                        src={
                          project.projectManager?.imageUrl ||
                          'https://img.freepik.com/free-photo/waist-up-portrait-handsome-serious-unshaven-male-keeps-hands-together-dressed-dark-blue-shirt-has-talk-with-interlocutor-stands-against-white-wall-self-confident-man-freelancer_273609-16320.jpg?semt=ais_hybrid&w=740&q=80'
                        }
                        alt={`${project.projectManager?.firstName}`}
                        width={32}
                        height={32}
                      />
                      <div className='text-sm flex-row'>
                        <p className='text-black font-medium'>
                          {project.projectManager?.firstName}{' '}
                          {project.projectManager?.lastName}
                        </p>
                        <span className='text-xs text-text-secondary'>
                          Project Lead
                        </span>
                      </div>
                    </div>

                    <div className='w-full md:w-32 flex items-center gap-2 text-sm text-text-secondary'>
                      <Users className='w-4 h-4 text-[#5e888d]' />
                      <p>{project.projectMembers?.length || 0} members</p>
                    </div>

                    <div className='w-full md:w-32 flex items-center gap-2 text-sm text-text-secondary'>
                      <Clock className='w-4 h-4 text-[#5e888d]' />
                      <p>
                        {calculateProjectHours(project.startDate, project.endDate)}{' '}hrs
                      </p>
                    </div>

                    <button className='p-2 rounded-full bg-primary/10 text-primary cursor-pointer transition-all duration-300'>
                      <svg
                        className={`w-5 h-5 transition-transform duration-300 ${openProject === project._id ? 'rotate-180' : ''}`}
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2.5'
                      >
                        <path d='M6 9l6 6 6-6' />
                      </svg>
                    </button>
                  </div>

                  {/* Three-dot menu — Admin only (Edit, Change Status, Delete) */}
                  {canEditProject && (
                    <div className='relative ml-2'>
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === project._id ? null : project._id
                          )
                        }
                        className='p-2 rounded-full hover:bg-gray-100 transition-colors'
                      >
                        <svg
                          width='20'
                          height='20'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <circle cx='12' cy='12' r='1' />
                          <circle cx='12' cy='5' r='1' />
                          <circle cx='12' cy='19' r='1' />
                        </svg>
                      </button>

                      {openMenuId === project._id && (
                        <>
                          <div
                            className='fixed inset-0 z-10'
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className='absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-20'>
                            {canEditProject && (
                              <button
                                onClick={() => handleEditProject(project)}
                                className='w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100'
                              >
                                <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                  <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
                                  <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
                                </svg>
                                <span className='text-sm font-medium text-gray-700'>Edit Project</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setStatusModal({ projectId: project._id, currentStatus: project.status });
                                setOpenMenuId(null);
                              }}
                              className='w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100'
                            >
                              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                <path d='M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z' />
                                <line x1='7' y1='7' x2='7.01' y2='7' />
                              </svg>
                              <span className='text-sm font-medium text-gray-700'>Change Status</span>
                            </button>
                            {canDeleteProject && (
                              <button
                                onClick={() => handleDeleteProject(project._id)}
                                className='w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600'
                              >
                                <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                  <polyline points='3 6 5 6 21 6' />
                                  <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
                                </svg>
                                <span className='text-sm font-medium'>Delete Project</span>
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                </div>

                {/* ── TIMELINE PROGRESS BAR ── */}
                {(() => {
                  const tl = getTimelineProgress(project.startDate, project.endDate, project.status);
                  if (!tl) return null;
                  const isOverdue = !tl.isCompleted && tl.daysLeft < 0;
                  const isNearEnd = !tl.isCompleted && !isOverdue && tl.daysLeft <= 7;
                  const barColor = tl.isCompleted
                    ? 'bg-green-500'
                    : isOverdue
                      ? 'bg-red-500'
                      : isNearEnd
                        ? 'bg-amber-500'
                        : 'bg-[#5e888d]';
                  const textColor = tl.isCompleted
                    ? 'text-green-600'
                    : isOverdue
                      ? 'text-red-600'
                      : isNearEnd
                        ? 'text-amber-600'
                        : 'text-[#5e888d]';
                  const label = tl.isCompleted
                    ? tl.completedEarly
                      ? `✓ Completed ${tl.daysLeft} day${tl.daysLeft !== 1 ? 's' : ''} before deadline`
                      : '✓ Completed'
                    : isOverdue
                      ? `Overdue by ${Math.abs(tl.daysLeft)} day${Math.abs(tl.daysLeft) !== 1 ? 's' : ''}`
                      : tl.daysLeft === 0
                        ? 'Due today'
                        : `${tl.daysLeft} day${tl.daysLeft !== 1 ? 's' : ''} left · ${tl.pct}%`;
                  return (
                    <div>
                      <div className='flex items-center justify-between text-xs text-gray-500 px-5 pb-1.5'>
                        <span className='font-medium'>{tl.startFmt}</span>
                        <span className={`font-semibold ${textColor}`}>{label}</span>
                        <span className='font-medium'>{tl.endFmt}</span>
                      </div>
                      <div className='w-full h-1.5 bg-gray-200 overflow-hidden'>
                        <div
                          className={`h-full transition-all duration-700 ${barColor}`}
                          style={{ width: `${tl.pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* ================= EXPANDED - SMOOTH ANIMATION ================= */}
              <div
                className={`bg-gray-50 border-t border-primary/30 ring-1 ring-primary/10 overflow-hidden transition-all duration-500 ease-in-out ${openProject === project._id
                    ? 'max-h-[2000px] opacity-100'
                    : 'max-h-0 opacity-0'
                  }`}
              >
                {openProject === project._id && (
                  <div className='p-6 md:p-8 animate-slide-down'>

                    {/* ================= TEAM HIERARCHY ================= */}
                    <div className='relative'>
                      <div className='absolute top-0 left-0 text-xs font-bold text-text-secondary uppercase tracking-wide'>
                        Team Hierarchy
                      </div>

                      <div className='overflow-x-auto hide-scrollbar pt-12 max-w-full'>
                        <div className='w-full flex flex-col items-center'>
                          {/* PROJECT LEAD */}
                          <div className='flex flex-col items-center group relative'>
                            <div className='relative mb-3'>
                              <div className='absolute inset-0 bg-primary opacity-40 rounded-full blur-md group-hover:opacity-40 transition-opacity z-0' />
                              <img
                                className='w-20 h-20 rounded-full border-4 border-white shadow-lg relative z-10 object-cover'
                                src={
                                  project.projectManager?.imageUrl ||
                                  'https://img.freepik.com/free-photo/waist-up-portrait-handsome-serious-unshaven-male-keeps-hands-together-dressed-dark-blue-shirt-has-talk-with-interlocutor-stands-against-white-wall-self-confident-man-freelancer_273609-16320.jpg'
                                }
                                alt={project.projectManager?.firstName}
                              />
                            </div>

                            <div className='bg-white border border-[#5e888d] rounded-xl px-3 py-1 text-center shadow-sm min-w-[180px]'>
                              <p className='font-semibold text-gray-900'>
                                {project.projectManager?.firstName}{' '}
                                {project.projectManager?.lastName}
                              </p>
                              <p className='text-xs text-primary font-medium mt-1'>
                                Project Lead
                              </p>
                            </div>
                          </div>

                          {/* VERTICAL LINE */}
                          {project.projectMembers?.filter(
                            (m) => m._id !== project.projectManager?._id
                          ).length > 0 && (
                              <div className='tree-line-vertical' />
                            )}

                          {/* TEAM MEMBERS */}
                          <TeamMembers
                            members={project.projectMembers?.filter(
                              (m) => m._id !== project.projectManager?._id
                            ) || []}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <CreateProjectDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          onProjectAdded={fetchProjects}
          editingProject={editingProject}
        />

        {/* ── STATUS QUICK-CHANGE MODAL ── */}
        {statusModal && (
          <>
            {/* Backdrop */}
            <div
              className='fixed inset-0 bg-black/30 backdrop-blur-sm z-50'
              onClick={() => setStatusModal(null)}
            />
            {/* Modal */}
            <div className='fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'>
              <div className='bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto overflow-hidden'>
                {/* Header */}
                <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
                  <div>
                    <h5 className='font-semibold text-gray-900'>Change Status</h5>
                    <p className='text-xs text-gray-400 mt-0.5'>Select a new status for this project</p>
                  </div>
                  <button
                    onClick={() => setStatusModal(null)}
                    className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors'
                  >
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                      <path d='M18 6L6 18M6 6l12 12' />
                    </svg>
                  </button>
                </div>
                {/* Status Options */}
                <div className='p-4 space-y-2'>
                  {STATUS_OPTIONS.map((opt) => {
                    const isCurrent = statusModal.currentStatus === opt.value;
                    return (
                      <button
                        key={opt.value}
                        disabled={isCurrent || isUpdatingStatus}
                        onClick={() => handleStatusChange(statusModal.projectId, opt.value)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all
                          ${isCurrent
                            ? `${opt.color} border cursor-default opacity-80`
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                          }`}
                      >
                        <div className='flex items-center gap-3'>
                          <span className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-current' : 'bg-gray-300'}`} />
                          <span className={`text-sm font-medium ${isCurrent ? '' : 'text-gray-700'}`}>
                            {opt.label}
                          </span>
                        </div>
                        {isCurrent && (
                          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                            <polyline points='20 6 9 17 4 12' />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Footer */}
                {isUpdatingStatus && (
                  <div className='px-5 pb-4 text-center text-xs text-gray-400'>Updating status…</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
