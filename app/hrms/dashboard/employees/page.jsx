'use client';

import SubModuleProtectedRoute from '@/lib/routeProtection/SubModuleProtectedRoute';
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeModal from './EmployeeModal';
import AddEditEmployeeModal from './AddEditEmployeeModal'; // new component
/**
 * Employees page — Figma-aligned header + card grid
 * - Uses your global CSS variables (colors + fonts)
 * - Replace sample `employees` array with real API data
 * <-- Changes: Integrated API fetch for employees list. Updated onSave to call add/update API and refetch list. Assumed API endpoints: GET /hrms/employee, POST /hrms/employee/add-employee, PUT /hrms/employee/update-employee/:id. For display, compute name from firstName/lastName, use department/designation as strings (assume API populates names). Added loading/error states. Used initialEmployees prop if provided, else fetch. For edit, pass full employee object to modal.
 */
const API_BASE = '/api'; // <-- Adjust to your API base path, e.g., '/api/hrms/employee'
export default function Employees({ initialEmployees = [] }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // view/edit/add
  const [showAddEdit, setShowAddEdit] = useState(false);
  const lastFocusedRef = useRef(null);
  // <-- Added: Fetch employees on mount if no initial data
  useEffect(() => {
    if (initialEmployees.length === 0) {
      fetchEmployees();
    }
  }, [initialEmployees.length]);
  async function fetchEmployees() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/hrms/employee/list`);
      setEmployees(res.data.result || res.data || []); // <-- Adjust based on your API response structure
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  function openModal(emp, e) {
    lastFocusedRef.current = e?.currentTarget || null;
    setSelected(emp);
  }
  function closeModal() {
    setSelected(null);
    if (lastFocusedRef.current) lastFocusedRef.current.focus();
  }
  function openView(emp, e) {
    lastFocusedRef.current = e?.currentTarget || null;
    setSelected(emp);
    setModalMode('view');
  }
  function closeView() {
    setSelected(null);
    if (lastFocusedRef.current) lastFocusedRef.current.focus();
  }
  function openAdd(e) {
    lastFocusedRef.current = e?.currentTarget || null;
    setModalMode('add');
    setShowAddEdit(true);
  }
  function openEdit(emp, e) {
    lastFocusedRef.current = e?.currentTarget || null;
    setModalMode('edit');
    setSelected(emp);
    setShowAddEdit(true);
  }
  async function handleSave(newEmp) {
    try {
      let updatedEmployees;
      if (modalMode === 'add') {
        // <-- Added: API call for add
        const res = await axios.post(`/hrms/employee/add-employee`, newEmp);
        const addedEmp = res.data.data; // <-- Assume backend returns the full saved employee
        updatedEmployees = [addedEmp, ...employees];
      } else if (modalMode === 'edit') {
        // <-- Added: API call for edit (assume PUT endpoint; adjust if different)
        const res = await axios.put(`${API_BASE}/employee/update-employee/${newEmp.id || newEmp._id}`, newEmp);
        const updatedEmp = res.data.data;
        updatedEmployees = employees.map((it) => (it.id === updatedEmp.id || it._id === updatedEmp._id ? updatedEmp : it));
      }
      setEmployees(updatedEmployees || employees);
      // <-- Optional: refetch to ensure consistency
      // await fetchEmployees();
    } catch (err) {
      console.error('Failed to save employee:', err);
      setError('Failed to save employee. Please try again.');
      // <-- Optional: show toast/notification here
    }
  }
  function handleAddEditClose() {
    setShowAddEdit(false);
    setSelected(null);
    if (lastFocusedRef.current) lastFocusedRef.current.focus();
  }
  // <-- Added: Compute display props for rendering (map full schema to card fields)
  function getDisplayEmployee(emp) {
    return {
      ...emp,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unnamed',
      department: emp.department?.name || emp.departmentId || 'Unknown Dept', // <-- Assume populated or use ID as fallback
      designation: emp.designation?.name || emp.designationId || 'Unknown Role',
      avatar: emp.imageUrl || emp.avatar || `https://i.pravatar.cc/160?u=${emp.email || emp.id}`,
      id: emp.id || emp._id, // <-- Handle Mongo _id
    };
  }
  if (loading) {
    return (
      <SubModuleProtectedRoute requiredPermissionPrefixes={['HRMS:HR']}>
        <div className='container py-6'>
          <div className='text-center py-8'>Loading employees...</div>
        </div>
      </SubModuleProtectedRoute>
    );
  }
  if (error) {
    return (
      <SubModuleProtectedRoute requiredPermissionPrefixes={['HRMS:HR']}>
        <div className='container py-6'>
          <div className='text-center py-8 text-red-500'>{error}</div>
          <button onClick={fetchEmployees} className='px-4 py-2 rounded bg-blue-500 text-white mx-auto block'>
            Retry
          </button>
        </div>
      </SubModuleProtectedRoute>
    );
  }
  return (
    <SubModuleProtectedRoute requiredPermissionPrefixes={['HRMS:HR']}>
      <div className='container py-6'>
        {/* Header */}
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 mt-3'>
          <div>
            <h3 className='text-[var(--font-size-h2)] font-extrabold text-[var(--color-blackText)] leading-tight'>
              Employees
            </h3>
          </div>
          <div className='flex items-center gap-3'>
            {/* View dropdown */}
            <div>
              <select
                className='px-4 py-2 bg-white border border-gray-200 rounded-md text-sm shadow-sm'
                aria-label='Select view'
                defaultValue='Employee View'
              >
                <option>Employee View</option>
              </select>
            </div>
            {/* small actions */}
            <button
              className='flex items-center gap-2 text-sm text-[var(--color-primaryText)] hover:text-[var(--color-blackText)]'
              title='Edit view'
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                className='opacity-80'
              >
                <path
                  d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z'
                  stroke='currentColor'
                  strokeWidth='1.2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'
                  stroke='currentColor'
                  strokeWidth='1.2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              <span>Edit View</span>
            </button>
            <button
              className='flex items-center gap-2 text-sm text-[var(--color-primaryText)] hover:text-[var(--color-blackText)]'
              title='Filters'
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                className='opacity-80'
              >
                <path
                  d='M4 6h16M7 12h10M10 18h4'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              <span>All Data</span>
            </button>
            <button
              className='px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium shadow hover:brightness-95 transition'
              aria-label='Add Employee(s)'
              onClick={openAdd}
            >
              Add Employee(s)
            </button>
            {/* view toggles / extras */}
            <button
              className='p-2 rounded-md text-gray-500 hover:bg-gray-50'
              title='Toggle layout'
            >
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M4 6h16M4 12h16M4 18h16'
                  stroke='currentColor'
                  strokeWidth='1.4'
                  strokeLinecap='round'
                />
              </svg>
            </button>
          </div>
        </div>
        {/* Grid of cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {employees.map((emp, index) => {
            const displayEmp = getDisplayEmployee(emp); // <-- Added: compute display fields
            return (
              <article
                key={`${displayEmp.id}-${index}`}
                onClick={(e) => openView(displayEmp, e)} // <-- Pass displayEmp for view
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') openView(displayEmp, e);
                }}
                className='bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer flex items-center gap-5 w-[40vh]'
              >
                <img
                  src={displayEmp.avatar}
                  alt={displayEmp.name}
                  className='w-20 h-20 rounded-full object-cover flex-shrink-0'
                />
                <div className='min-w-0'>
                  <h6 className='text-[var(--color-blackText)] text-md font-semibold '>
                    {displayEmp.name}
                  </h6>
                  <div className='mt-1 text-[var(--color-primaryText)] text-sm'>
                    {displayEmp.department}
                  </div>
                  <div className=' text-[#6C727F] text-sm truncate'>
                    {displayEmp.designation}
                  </div>
                </div>
                {/* <-- Added: Edit button on card for quick edit */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(emp, e); // <-- Pass full emp for edit
                  }}
                  className='ml-auto p-1 text-gray-400 hover:text-gray-600'
                  title='Edit'
                >
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
                    <path
                      d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z'
                      stroke='currentColor'
                      strokeWidth='1.2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              </article>
            );
          })}
        </div>
        {/* view modal */}
        {selected && modalMode === 'view' && (
          <EmployeeModal employee={selected} onClose={closeView} />
        )}
        {/* add/edit modal */}
        {showAddEdit && (
          <AddEditEmployeeModal
            mode={modalMode === 'add' ? 'add' : 'edit'}
            employee={modalMode === 'edit' ? selected : null} // <-- Pass full employee for edit
            onClose={handleAddEditClose}
            onSave={handleSave}
          />
        )}{' '}
      </div>
    </SubModuleProtectedRoute>
  );
}