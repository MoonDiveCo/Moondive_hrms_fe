'use client';

import { useEffect, useState, useRef,useContext } from 'react';
import axios from 'axios';
import AddDepartmentModal from './addDepartmentModal'; // updated reusable modal
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { AuthContext } from '@/context/authContext';
import { toast } from 'sonner';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add | edit | view
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const lastFocusedRef = useRef(null);
  const {allUserPermissions}=useContext(AuthContext)

  // fetch departments
  async function fetchDepartments() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/hrms/organization/get-allDepartment');
      const data = res?.data?.result || res?.data;
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error while fetching departments', err);
      setError('Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  function openAdd(e) {
    lastFocusedRef.current = e?.currentTarget || null;
    setModalMode('add');
    setSelectedDepartment(null);
    setModalVisible(true);
  }

  function openEdit(dept, e) {
    e.stopPropagation();
    lastFocusedRef.current = e?.currentTarget || null;
    setSelectedDepartment(dept);
    setModalMode('edit');
    setModalVisible(true);
  }

  function openView(dept, e) {
    // clicking row itself will open view
    lastFocusedRef.current = e?.currentTarget || null;
    setSelectedDepartment(dept);
    setModalMode('view');
    setModalVisible(true);
  }

  async function handleDelete(deptId) {
    const ok = window.confirm('Delete this department?');
    if (!ok) return;
    try {
      await axios.delete(`/hrms/organization/delete-department/${deptId}`);
      setDepartments((prev) => prev.filter((d) => d._id !== deptId));
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Failed to delete department');
    }
  }

  function handleSaved(dept) {
    // server returns created/updated dept object
    // update local state: replace if exists else add front
    if (!dept) return;
    setDepartments((prev) => {
      const exists = prev.find((p) => p._id === dept._id);
      if (exists) {
        return prev.map((p) => (p._id === dept._id ? dept : p));
      } else {
        return [dept, ...prev];
      }
    });
  }

  function handleModalClose() {
    setModalVisible(false);
    setSelectedDepartment(null);
    if (lastFocusedRef.current) lastFocusedRef.current.focus();
  }


    if(loading){
        return(
          <div className='absolute inset-0 z-20 flex items-center justify-center bg-black/5 backdrop-blur-sm rounded-2xl'>
            <DotLottieReact
              src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
              loop
              autoplay
              style={{ width: 100, height: 100, alignItems: 'center' }} 
            />
          </div>
        )
      }
  if (error) return <div className='p-4 text-red-500'>{error}</div>;

  return (
    <div className='w-full -z-10'>
      <div className='bg-white h-full rounded-2xl border-[0.3px] border-[#D0D5DD] p-4'>
        <div className='p-6 border-b border-gray-200 flex flex-row justify-between items-center'>
          <h4 className='text-lg font-semibold text-gray-900'>Departments</h4>
          {allUserPermissions.includes("HRMS:MANAGE_ACCOUNT:VIEW")&&<button
            onClick={openAdd}
            className='px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded hover:bg-orange-600'
          >
            Add Department
          </button>}
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Department
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Parent Department
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Department Head
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Mail Alias
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Employee Count
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className='bg-white divide-y divide-gray-200'>
              {departments && departments.length > 0 ? (
                departments.map((dept, index) => (
                  <tr
                    key={dept._id || index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    onClick={(e) => openView(dept, e)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {dept.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {dept?.parentDepartment?.name || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {(dept.departmentLead?.firstName
                        ? dept.departmentLead.firstName +
                          ' ' +
                          (dept.departmentLead?.lastName || '')
                        : dept.departmentLead?.name) || 'N/A'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {dept.mailAlias || 'N/A'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {dept.employeeId?.length || 0}
                    </td>

                    <td className='px-4 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='inline-flex items-center gap-2'>
                        {/* VIEW */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openView(dept, e);
                          }}
                          aria-label={`View ${dept.name}`}
                          title='View'
                          className='p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'
                        >
                          <Eye
                            size={16}
                            className='text-[var(--color-primary)]'
                          />
                        </button>

                        {/* EDIT */}
                        {allUserPermissions.includes("HRMS:MANAGE_ACCOUNT:VIEW")&&<button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(dept, e);
                          }}
                          aria-label={`Edit ${dept.name}`}
                          title='Edit'
                          className='p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'
                          disabled={!allUserPermissions.includes("HRMS:MANAGE_ACCOUNT:VIEW")}
                        >
                          <Edit2
                            size={16}
                            className='text-[var(--color-primaryText)]'
                          />
                        </button>}

                        {/* DELETE */}
                        {allUserPermissions.includes("HRMS:MANAGE_ACCOUNT:VIEW")&&<button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(dept._id);
                          }}
                          aria-label={`Delete ${dept.name}`}
                          title='Delete'
                          className='p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-300'
                          disabled={!allUserPermissions.includes("HRMS:MANAGE_ACCOUNT:VIEW")}
                        >
                          <Trash2 size={16} className='text-red-600' />
                        </button>}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan='6'
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable modal (add / edit / view) */}
      <AddDepartmentModal
        mode={modalMode}
        department={selectedDepartment}
        departments={departments}
        isVisible={modalVisible}
        onClose={handleModalClose}
        onSaved={handleSaved}
        deletePermission={allUserPermissions.includes("HRMS:MANAGE_ACCOUNT:VIEW")}
        onDeleted={(id) => {
          setDepartments((prev) => prev.filter((d) => d._id !== id));
          handleModalClose();
        }}
      />
    </div>
  );
}
