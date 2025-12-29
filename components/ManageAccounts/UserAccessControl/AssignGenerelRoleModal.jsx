'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

export default function AssignGeneralRoleModal({ role, onClose, onSuccess }) {
  const modalRef = useRef(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/hrms/roles/get-employee'); 
      setEmployees(res.data.result || []);
    } catch (err) {
      console.error('Error fetching employees', err);
    }
  };

  const assignRole = async () => {
    if (!selectedEmployee) return;

    try {
      setLoading(true);

      await axios.patch('/hrms/roles/update-user-role', {
        mode:'add',
        role: role.name,
        userId: selectedEmployee,
      });

      onSuccess();
    } catch (err) {
      console.error('Error assigning role', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-[720px] mx-4 p-6"
      >
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Assign Role
            </h3>
            <p className="text-sm text-gray-500">
              Assign users to <span className="font-medium">{role.name}</span>
            </p>
          </div>

          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee <span className="text-red-500">*</span>
            </label>

            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full border border-[#D0D5DD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>

         
          <div className="flex justify-end">
            <button
              onClick={assignRole}
              disabled={loading || !selectedEmployee}
              className="px-5 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Assign Role'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
