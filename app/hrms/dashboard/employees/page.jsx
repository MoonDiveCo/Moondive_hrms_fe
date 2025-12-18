'use client';

import SubModuleProtectedRoute from '@/lib/routeProtection/SubModuleProtectedRoute';
import React, { useRef, useState, useEffect,useCallback } from 'react';
import axios from 'axios';
import EmployeeModal from './EmployeeModal';
import AddEditEmployeeModal from './AddEditEmployeeModal';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import ImportEmployeeModal from './ImportEmployeeModal';




export default function Employees({ initialEmployees = [] }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const lastFocusedRef = useRef(null);
  const [organizationData,setOrganizationData]=useState(null)
  const [open, setOpen] = useState(false);

  const loadData = useCallback(async () => {
  setLoading(true);
  try {
    const [departmentRes, designationRes, shiftRes] = await Promise.all([
      axios.get("/hrms/organization/get-allDepartment"),
      axios.get("/hrms/organization/get-alldesignation"),
      axios.get("/hrms/organization/get-shifts")
    ]);

    setOrganizationData({
      departments: departmentRes?.data?.result || [],
      designations: designationRes?.data?.result || [],
      shifts: shiftRes?.data?.result || []
    });
  } catch (err) {
    console.error("Failed to load dropdown data:", err);
  } finally {
    setLoading(false);
  }
}, []);

  
    useEffect(() => {
      loadData();
      fetchEmployees();
    }, [loadData]);

    useEffect(()=>{
      console.log("----------------------",organizationData)
    },[organizationData])

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
      setEmployees(res.data.result || res.data || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
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
    lastFocusedRef.current = e?.currentTarget || null;
    setModalMode('edit');
    setSelected(emp);
    setShowAddEdit(true);
    setShowViewModal(false);
  }

  async function deleteFromView(){
    try{
      await fetchEmployees()
      setShowViewModal(false);
      setSelected(null)
    }catch(err){
      console.error('failed to fetch employee data after deleting',err)
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

  
  function getDisplayEmployee(emp) {
    
    let departmentName = 'Unknown Dept';
    if (emp.departmentId) {
      if (typeof emp.departmentId === 'object' && emp.departmentId.name) {
        departmentName = emp.departmentId.name;
      } else if (emp.department?.name) {
        departmentName = emp.department.name;
      }
    }

    
    let designationName = 'Unknown Role';
    if (emp.designationId) {
      if (typeof emp.designationId === 'object' && emp.designationId.name) {
        designationName = emp.designationId.name;
      } else if (emp.designation?.name) {
        designationName = emp.designation.name;
      }
    }

    return {
      ...emp,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unnamed',
      department: departmentName,
      designation: designationName,
      avatar: emp.imageUrl || emp.avatar || `https://i.pravatar.cc/160?u=${emp.email || emp._id || emp.id}`,
      id: emp._id || emp.id,
    };
  }

  if(loading){
    return(
      <div className='flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: 'center' }} 
        />
      </div>
    )
  }

  if (error) {
    return (
      <SubModuleProtectedRoute requiredPermissionPrefixes={['HRMS:HR']}>
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

  return (
    <SubModuleProtectedRoute requiredPermissionPrefixes={['HRMS:HR']}>
      <div className='container py-6'>
        
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 mt-3'>
          <div>
            <h3 className='text-[var(--font-size-h2)] font-extrabold text-[var(--color-blackText)] leading-tight'>
              Employees
            </h3>
          </div>
          <div className='flex items-center gap-3'>
            <div>
              <select
                className='px-4 py-2 bg-white border border-gray-200 rounded-md text-sm shadow-sm'
                aria-label='Select view'
                defaultValue='Employee View'
              >
                <option>Employee View</option>
              </select>
            </div>
            <button
              className='px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium shadow hover:brightness-95 transition'
              onClick={() => setOpen(true)}
              
            >
              Import
            </button>
            <button
              className='flex items-center gap-2 text-sm text-[var(--color-primaryText)] hover:text-[var(--color-blackText)]'
              title='Filters'
            >
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' className='opacity-80'>
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
            <button className='p-2 rounded-md text-gray-500 hover:bg-gray-50' title='Toggle layout'>
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

        
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {employees.map((emp, index) => {
            const displayEmp = getDisplayEmployee(emp);
            return (
              <article
                key={`${displayEmp.id}-${index}`}
                onClick={(e) => openView(displayEmp, e)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') openView(displayEmp, e);
                }}
               className='bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100 
                    hover:shadow-md transition cursor-pointer flex items-center gap-5 w-full'
              >
                <img
                  src={displayEmp.avatar}
                  alt={displayEmp.name}
                  className='w-20 h-20 rounded-full object-cover flex-shrink-0'
                />
                <div className='min-w-0'>
                  <h6 className='text-[var(--color-blackText)] text-md font-semibold'>
                    {displayEmp.name}
                  </h6>
                  <div className='mt-1 text-[var(--color-primaryText)] text-sm'>
                    {displayEmp.department}
                  </div>
                  <div className='text-[#6C727F] text-sm truncate'>
                    {displayEmp.designation}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(emp, e);
                  }}
                  className='ml-auto p-1 text-gray-400 hover:text-gray-600'
                  title='Edit'
                >

                </button>
              </article>
            );
          })}
        </div>

        
        {employees.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-500 mb-4'>No employees found</p>
            <button
              onClick={openAdd}
              className='px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium'
            >
              Add Your First Employee
            </button>
          </div>
        )}

        
        {showViewModal && selected && (
          <EmployeeModal 
            employee={selected} 
            onClose={closeView} 
            onEdit={handleEditFromView}
            onDelete={deleteFromView}
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
        <ImportEmployeeModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={fetchEmployees}
        />
      </div>
    </SubModuleProtectedRoute>
  );
}