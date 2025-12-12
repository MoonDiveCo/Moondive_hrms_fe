'use client';

import SubModuleProtectedRoute from '@/lib/routeProtection/SubModuleProtectedRoute';
import React, { useRef, useState } from 'react';
import EmployeeModal from './EmployeeModal';
import AddEditEmployeeModal from './AddEditEmployeeModal'; // new component

/**
 * Employees page — Figma-aligned header + card grid
 * - Uses your global CSS variables (colors + fonts)
 * - Replace sample `employees` array with real API data
 */

const employee = [
  {
    id: 1,
    name: 'Aman Singh',
    department: 'Engineering',
    designation: 'Full Stack Developer',
    avatar: 'https://i.pravatar.cc/160?img=1',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    department: 'Design',
    designation: 'UI/UX Designer',
    avatar: 'https://i.pravatar.cc/160?img=2',
  },
  {
    id: 3,
    name: 'Rahul Verma',
    department: 'Product',
    designation: 'Product Manager',
    avatar: 'https://i.pravatar.cc/160?img=3',
  },
  {
    id: 4,
    name: 'Sneha Kapoor',
    department: 'HR',
    designation: 'HR Specialist',
    avatar: 'https://i.pravatar.cc/160?img=4',
  },
  {
    id: 5,
    name: 'Arjun Mehta',
    department: 'Engineering',
    designation: 'Backend Engineer',
    avatar: 'https://i.pravatar.cc/160?img=5',
  },
  {
    id: 6,
    name: 'Isha Malhotra',
    department: 'Sales',
    designation: 'Sales Executive',
    avatar: 'https://i.pravatar.cc/160?img=6',
  },
  {
    id: 7,
    name: 'Kabir Ahuja',
    department: 'Marketing',
    designation: 'Marketing Strategist',
    avatar: 'https://i.pravatar.cc/160?img=7',
  },
  {
    id: 8,
    name: 'Tanya Oberoi',
    department: 'People Ops',
    designation: 'HR Coordinator',
    avatar: 'https://i.pravatar.cc/160?img=8',
  },
  {
    id: 9,
    name: 'Rohan Bhatia',
    department: 'Engineering',
    designation: 'Frontend Developer',
    avatar: 'https://i.pravatar.cc/160?img=9',
  },
  {
    id: 10,
    name: 'Nisha Chauhan',
    department: 'Finance',
    designation: 'Financial Analyst',
    avatar: 'https://i.pravatar.cc/160?img=10',
  },
  {
    id: 11,
    name: 'Sameer Joshi',
    department: 'IT Support',
    designation: 'IT Technician',
    avatar: 'https://i.pravatar.cc/160?img=11',
  },
  {
    id: 12,
    name: 'Meera Chawla',
    department: 'Customer Success',
    designation: 'Client Success Manager',
    avatar: 'https://i.pravatar.cc/160?img=12',
  },
  {
    id: 13,
    name: 'Devansh Khatri',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    avatar: 'https://i.pravatar.cc/160?img=13',
  },
  {
    id: 14,
    name: 'Simran Kaur',
    department: 'Design',
    designation: 'Graphic Designer',
    avatar: 'https://i.pravatar.cc/160?img=14',
  },
  {
    id: 15,
    name: 'Karan Patel',
    department: 'Engineering',
    designation: 'Mobile App Developer',
    avatar: 'https://i.pravatar.cc/160?img=15',
  },
  {
    id: 16,
    name: 'Riya Grover',
    department: 'Legal',
    designation: 'Legal Associate',
    avatar: 'https://i.pravatar.cc/160?img=16',
  },
  {
    id: 17,
    name: 'Vivek Soni',
    department: 'Operations',
    designation: 'Operations Manager',
    avatar: 'https://i.pravatar.cc/160?img=17',
  },
  {
    id: 18,
    name: 'Ananya Arora',
    department: 'HR',
    designation: 'Recruitment Specialist',
    avatar: 'https://i.pravatar.cc/160?img=18',
  },
  {
    id: 19,
    name: 'Yash Thakur',
    department: 'Engineering',
    designation: 'QA Engineer',
    avatar: 'https://i.pravatar.cc/160?img=19',
  },
  {
    id: 20,
    name: 'Pooja Nair',
    department: 'Administration',
    designation: 'Office Administrator',
    avatar: 'https://i.pravatar.cc/160?img=20',
  },
  {
    id: 21,
    name: 'Manish Khanna',
    department: 'Engineering',
    designation: 'Tech Lead',
    avatar: 'https://i.pravatar.cc/160?img=21',
  },
  {
    id: 22,
    name: 'Shruti Vyas',
    department: 'Content',
    designation: 'Content Writer',
    avatar: 'https://i.pravatar.cc/160?img=22',
  },
  {
    id: 23,
    name: 'Arnav Saxena',
    department: 'Business',
    designation: 'Business Analyst',
    avatar: 'https://i.pravatar.cc/160?img=23',
  },
  {
    id: 24,
    name: 'Mahima Sood',
    department: 'Customer Support',
    designation: 'Support Executive',
    avatar: 'https://i.pravatar.cc/160?img=24',
  },
];

export default function Employees({ initialEmployees }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [selected, setSelected] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // view/edit/add
  const [showAddEdit, setShowAddEdit] = useState(false);
  const lastFocusedRef = useRef(null);

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

  function handleSave(newEmp) {
    if (modalMode === 'add') {
      setEmployees((s) => [newEmp, ...s]);
    } else if (modalMode === 'edit') {
      setEmployees((s) =>
        s.map((it) => (it.id === newEmp.id ? { ...it, ...newEmp } : it))
      );
    }
  }

  function handleAddEditClose() {
    setShowAddEdit(false);
    setSelected(null);
    if (lastFocusedRef.current) lastFocusedRef.current.focus();
  }
  return (
    <SubModuleProtectedRoute requiredPermissionPrefixes={['HRMS:HR']}>
      <div className='container py-6 h-auto '>
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
          {employee.map((emp, index) => (
            <article
              key={`${emp.id}-${index}`}
              onClick={(e) => openView(emp, e)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openView(emp, e);
              }}
              className='bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer flex items-center gap-5'
            >
              <img
                src={emp.avatar}
                alt={emp.name}
                className='w-20 h-20 rounded-full object-cover flex-shrink-0'
              />
              <div className='min-w-0'>
                <h5 className='text-[var(--color-blackText)] text-lg font-semibold truncate'>
                  {emp.name}
                </h5>
                <div className='mt-1 text-[var(--color-primaryText)] text-sm'>
                  {emp.department}
                </div>
                <div className=' text-[#6C727F] text-sm truncate'>
                  {emp.designation}
                </div>
              </div>
            </article>
          ))}
        </div>
        {/* view modal */}
        {selected && modalMode === 'view' && (
          <EmployeeModal employee={selected} onClose={closeView} />
        )}
        {/* add/edit modal */}
        {showAddEdit && (
          <AddEditEmployeeModal
            mode={modalMode === 'add' ? 'add' : 'edit'}
            employee={modalMode === 'edit' ? selected : null}
            onClose={handleAddEditClose}
            onSave={handleSave}
          />
        )}{' '}
      </div>
    </SubModuleProtectedRoute>
  );
}
