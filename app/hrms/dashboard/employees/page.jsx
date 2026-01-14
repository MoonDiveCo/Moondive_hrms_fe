'use client';

import SubModuleProtectedRoute from '@/lib/routeProtection/SubModuleProtectedRoute';
import React, { useRef, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import EmployeeModal from './EmployeeModal';
import AddEditEmployeeModal from './AddEditEmployeeModal';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { AuthContext } from '@/context/authContext';

export default function Employees({ initialEmployees = [] }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const lastFocusedRef = useRef(null);
  const [organizationData, setOrganizationData] = useState(null);

  // New design states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' or 'role'
  const [collapsedDepartments, setCollapsedDepartments] = useState({});
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  const departmentDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const { allUserPermissions } = useContext(AuthContext);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [departmentRes, designationRes, shiftRes, rolesRes] = await Promise.all([
        axios.get("/hrms/organization/get-allDepartment"),
        axios.get("/hrms/organization/get-alldesignation"),
        axios.get("/hrms/organization/get-shifts"),
        axios.get("/hrms/organization/get-roles")
      ]);

      setOrganizationData({
        departments: departmentRes?.data?.result || [],
        designations: designationRes?.data?.result || [],
        shifts: shiftRes?.data?.result || [],
        roles: rolesRes?.data?.result || []
      });
    } catch (err) {
      console.error("Failed to load dropdown data:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
    fetchEmployees();
  }, [loadData]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (initialEmployees.length === 0) {
      fetchEmployees();
    }
  }, [initialEmployees.length]);

  async function fetchEmployees() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/hrms/employee/list');
      setEmployees(res.data.result || res.data || []);

    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getDisplayEmployee(emp) {
    let departmentName = 'Unknown Dept';
    let departmentId = null;
    
    if (emp.departmentId) {
      if (typeof emp.departmentId === 'object' && emp.departmentId.name) {
        departmentName = emp.departmentId.name;
        departmentId = emp.departmentId._id || emp.departmentId.id;
      } else if (emp.department?.name) {
        departmentName = emp.department.name;
        departmentId = emp.department._id || emp.department.id;
      } else {
        departmentId = emp.departmentId;
        const dept = organizationData?.departments?.find(d => d._id === emp.departmentId);
        if (dept) departmentName = dept.name;
      }
    }

    let designationName = 'Unknown Role';
    if (emp.designationId) {
      if (typeof emp.designationId === 'object' && emp.designationId.name) {
        designationName = emp.designationId.name;
      } else if (emp.designation?.name) {
        designationName = emp.designation.name;
      } else {
        const desig = organizationData?.designations?.find(d => d._id === emp.designationId);
        if (desig) designationName = desig.name;
      }
    }

    return {
      ...emp,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unnamed',
      department: departmentName,
      departmentId: departmentId,
      designation: designationName,
      avatar: emp.imageUrl || emp.avatar || `https://i.pravatar.cc/160?u=${emp.email || emp._id || emp.id}`,
      id: emp._id || emp.id,
    };
  }

  // Group employees by department
  function getGroupedEmployees() {
    const displayEmployees = employees.map(emp => getDisplayEmployee(emp));
    
    // Filter by search query
    let filteredEmployees = displayEmployees.filter(emp => {
      const searchLower = searchQuery.toLowerCase();
      return (
        emp.name.toLowerCase().includes(searchLower) ||
        emp.designation.toLowerCase().includes(searchLower) ||
        emp.email?.toLowerCase().includes(searchLower) ||
        emp.id?.toLowerCase().includes(searchLower)
      );
    });

    // Filter by selected department
    if (selectedDepartment && selectedDepartment !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.departmentId === selectedDepartment);
    }

    // Sort employees
    filteredEmployees.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return a.designation.localeCompare(b.designation);
      }
    });

    // Group by department
    const grouped = {};
    filteredEmployees.forEach(emp => {
      const deptKey = emp.departmentId || 'unknown';
      if (!grouped[deptKey]) {
        grouped[deptKey] = {
          name: emp.department,
          description: '', // You can add department descriptions if available
          employees: []
        };
      }
      grouped[deptKey].employees.push(emp);
    });

    return grouped;
  }

  function toggleDepartment(deptId) {
    setCollapsedDepartments(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  }

  function getDepartmentIcon(deptName) {
    const lowerName = deptName.toLowerCase();
    
    if (lowerName.includes('management') || lowerName.includes('executive')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
              stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    } else if (lowerName.includes('engineering') || lowerName.includes('development')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
              stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    } else if (lowerName.includes('design') || lowerName.includes('product')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-5a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" 
              stroke="#DB2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
              stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    }
  }

  function openView(emp, e) {
    lastFocusedRef.current = e?.currentTarget || null;
    setSelected(emp);
    setModalMode('view');
    setShowViewModal(true);
    setShowAddEdit(false);
  }

  function closeView() {
    setShowViewModal(false);
    setSelected(null);
    if (lastFocusedRef.current) lastFocusedRef.current.focus();
  }

  function openAdd(e) {
    lastFocusedRef.current = e?.currentTarget || null;
    setModalMode('add');
    setSelected(null);
    setShowAddEdit(true);
    setShowViewModal(false);
  }

  function openEdit(emp, e) {
    e.stopPropagation();
    lastFocusedRef.current = e?.currentTarget || null;
    setModalMode('edit');
    setSelected(emp);
    setShowAddEdit(true);
    setShowViewModal(false);
  }

  async function deleteFromView() {
    try {
      await fetchEmployees();
      setShowViewModal(false);
      setSelected(null);
    } catch (err) {
      console.error('failed to fetch employee data after deleting', err);
    }
  }

  function handleEditFromView(emp) {
    setShowViewModal(false);
    setModalMode('edit');
    setSelected(emp);
    setShowAddEdit(true);
  }

  async function handleSave(newEmp) {
    try {
      await fetchEmployees();
      setShowAddEdit(false);
      setSelected(null);
    } catch (err) {
      console.error('Failed to save employee:', err);
      const errorMsg = err.response?.data?.message || 'Failed to save employee. Please try again.';
      setError(errorMsg);
    }
  }

  function handleAddEditClose() {
    setShowAddEdit(false);
    setSelected(null);
    if (lastFocusedRef.current) lastFocusedRef.current.focus();
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: 'center' }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <SubModuleProtectedRoute>
        <div className='container py-6'>
          <div className='text-center py-8 text-red-500'>{error}</div>
          <button
            onClick={() => {
              setError(null);
              fetchEmployees();
            }}
            className='px-4 py-2 rounded bg-blue-500 text-white mx-auto block mt-4'
          >
            Retry
          </button>
        </div>
      </SubModuleProtectedRoute>
    );
  }

  const groupedEmployees = getGroupedEmployees();
  const totalEmployees = Object.values(groupedEmployees).reduce((sum, dept) => sum + dept.employees.length, 0);

  return (
    <SubModuleProtectedRoute>
      <div className='container py-6 max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex items-start justify-between mb-6'>
          <div>
            <h3 className='text-3xl font-bold text-gray-900'>Employees</h3>
            <p className='text-gray-500 mt-1'>Directory View</p>
          </div>
          <div className='flex items-center gap-3'>
            {/* Department Filter Dropdown */}
            <div className='relative' ref={departmentDropdownRef}>
              <button
                onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                className='px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 min-w-[180px] justify-between'
              >
                <span className='text-gray-700'>
                  {selectedDepartment === '' || selectedDepartment === 'all' 
                    ? 'All Departments' 
                    : organizationData?.departments?.find(d => d._id === selectedDepartment)?.name || 'All Departments'}
                </span>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform ${showDepartmentDropdown ? 'rotate-180' : ''}`} 
                  fill='none' 
                  viewBox='0 0 24 24' 
                  stroke='currentColor'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </button>

              {showDepartmentDropdown && (
                <div className='absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2'>
                  <button
                    onClick={() => {
                      setSelectedDepartment('all');
                      setShowDepartmentDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${
                      selectedDepartment === '' || selectedDepartment === 'all' ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    All Departments
                  </button>
                  {organizationData?.departments?.map((dept) => (
                    <button
                      key={dept._id}
                      onClick={() => {
                        setSelectedDepartment(dept._id);
                        setShowDepartmentDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${
                        selectedDepartment === dept._id ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {dept.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {allUserPermissions.includes("HRMSEMPLOYEESWRITE") && (
              <button
                className='px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition flex items-center gap-2'
                onClick={openAdd}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Add Employee
              </button>
            )}
          </div>
        </div>

        {/* Search and Sort Bar */}
        <div className='bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-4'>
          <div className='flex-1 relative'>
            <svg 
              className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400'
              fill='none' 
              viewBox='0 0 24 24' 
              stroke='currentColor'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
            <input
              type='text'
              placeholder='Search employees, roles, or ID...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          <div className='flex items-center gap-3'>
            <span className='text-sm text-gray-600'>Sort by:</span>
            
            {/* Sort Dropdown */}
            <div className='relative' ref={sortDropdownRef}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className='px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2'
                style={{ color: sortBy === 'name' ? '#F97316' : '#6B7280' }}
              >
                {sortBy === 'name' ? 'Name (A-Z)' : 'Role'}
                <svg 
                  className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} 
                  fill='none' 
                  viewBox='0 0 24 24' 
                  stroke='currentColor'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </button>

              {showSortDropdown && (
                <div className='absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2'>
                  <button
                    onClick={() => {
                      setSortBy('name');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${
                      sortBy === 'name' ? 'bg-orange-50 text-orange-600 font-medium' : ''
                    }`}
                  >
                    Name (A-Z)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('role');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${
                      sortBy === 'role' ? 'bg-orange-50 text-orange-600 font-medium' : ''
                    }`}
                  >
                    Role
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Departments List */}
        <div className='space-y-6'>
          {Object.entries(groupedEmployees).map(([deptId, dept]) => {
            const isCollapsed = collapsedDepartments[deptId];
            
            return (
              <div key={deptId} className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                {/* Department Header */}
                <button
                  onClick={() => toggleDepartment(deptId)}
                  className='w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition'
                >
                  <div className='flex items-center gap-4'>
                    {getDepartmentIcon(dept.name)}
                    <div className='text-left'>
                      <h6 className='text-lg font-semibold text-gray-900'>{dept.name}</h6>
                      {dept.description && (
                        <p className='text-sm text-gray-500'>{dept.description}</p>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm font-medium text-gray-600'>
                      {dept.employees.length} {dept.employees.length === 1 ? 'Person' : 'People'}
                    </span>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                      fill='none' 
                      viewBox='0 0 24 24' 
                      stroke='currentColor'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                  </div>
                </button>

                {/* Employee Cards */}
                {!isCollapsed && (
                  <div className='px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {dept.employees.map((emp) => (
                      <div
                        key={emp.id}
                        onClick={(e) => openView(emp, e)}
                        className='flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition cursor-pointer'
                      >
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className='w-12 h-12 rounded-full object-cover flex-shrink-0'
                        />
                        <div className='min-w-0 flex-1'>
                          <h5 className='font-semibold text-gray-900 text-sm truncate'>{emp.name}</h5>
                          <span className=' text-gray-500 truncate'>{emp.designation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {totalEmployees === 0 && (
          <div className='text-center py-16 bg-white rounded-xl border border-gray-200'>
            <svg className='w-16 h-16 text-gray-300 mx-auto mb-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
            </svg>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>No employees found</h3>
            <p className='text-gray-500 mb-6'>
              {searchQuery || (selectedDepartment && selectedDepartment !== 'all')
                ? 'Try adjusting your filters or search query'
                : 'Get started by adding your first employee'}
            </p>
            {allUserPermissions.includes("HRMSEMPLOYEESWRITE") && !searchQuery && (!selectedDepartment || selectedDepartment === 'all') && (
              <button
                onClick={openAdd}
                className='px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition inline-flex items-center gap-2'
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Add Your First Employee
              </button>
            )}
          </div>
        )}

        {/* Modals */}
        {showViewModal && selected && (
          <EmployeeModal
            employee={selected}
            onClose={closeView}
            onEdit={handleEditFromView}
            onDelete={deleteFromView}
            deletePermission={allUserPermissions.includes("HRMSEMPLOYEESDELETE")}
            editPermission={allUserPermissions.includes("HRMSEMPLOYEESEDIT")}
          />
        )}

        {showAddEdit && (
          <AddEditEmployeeModal
            mode={modalMode}
            employee={modalMode === 'edit' ? selected : null}
            onClose={handleAddEditClose}
            onSave={handleSave}
            organizationData={organizationData}
            employeeList={employees}
          />
        )}
      </div>
    </SubModuleProtectedRoute>
  );
}