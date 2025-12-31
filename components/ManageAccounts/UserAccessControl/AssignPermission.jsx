'use client';

import { useEffect, useState,useContext } from 'react';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import AssignAdditionalPermissionModal from './AssignAdditionalPermissionModal';
import ConfirmRemoveRoleModal from './ConfirmRemoveRoleModal';
import { Pencil, Minus } from 'lucide-react';
import { AuthContext } from '@/context/authContext';

export default function AssignPermission() {
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

 
  
  const fetchAssignedUser = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/hrms/roles/get-employee', {
        params: { mode: 'assigned' },
      });
      setAssignedUsers(res.data.result || []);
    } catch (err) {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedUser();
  }, []);

  if (loading) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white rounded-2xl">
        <DotLottieReact
          src="https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie"
          loop
          autoplay
          style={{ width: 90, height: 90 }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm">
        <div className="p-6  flex justify-between items-center">
          <h4 className="text-lg font-semibold text-gray-900">
            Assign Additional Permission
          </h4>

          <button
            onClick={() => {
              setEditEmployee(null);
              setShowAssignModal(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded hover:bg-orange-600"
          >
            Provide permission
          </button>
        </div>

        {error && (
          <div className="px-6 py-3 text-sm text-red-600 border-b">
            {error}
          </div>
        )}

        {assignedUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {assignedUsers.map((emp) => (
              <div
                key={emp._id}
                className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-600">
                    {emp.imageUrl ? (
                      <img
                        src={emp.imageUrl}
                        alt={emp.firstName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      emp.firstName?.[0]
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 leading-tight">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {emp.department || 'IT'}
                    </p>
                    <p className="text-sm text-blue-600 truncate max-w-[160px]">
                      {emp.designation || 'Software Eng...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="p-1 rounded hover:bg-gray-100"
                    onClick={() => {
                      setEditEmployee(emp);
                      setShowAssignModal(true);
                    }}
                    title="Edit permission"
                  >
                    <Pencil size={15} className="text-gray-500" />
                  </button>

                  <button
                    className="p-1 rounded hover:bg-gray-100"
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setShowConfirm(true);
                    }}
                    title="Revoke permission"
                  >
                    <Minus size={15} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No employee has been granted additional permission
          </div>
        )}
      </div>

      {showAssignModal && (
        <AssignAdditionalPermissionModal
          employee={editEmployee}
          onClose={() => {
            setShowAssignModal(false);
            setEditEmployee(null);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            setEditEmployee(null);
            fetchAssignedUser();
          }}
        />
      )}

      {showConfirm && selectedEmployee && (
        <ConfirmRemoveRoleModal
          mode="revoke-permission"
          user={selectedEmployee}
          loading={confirmLoading}
          onClose={() => {
            setShowConfirm(false);
            setSelectedEmployee(null);
          }}
          onConfirm={async () => {
            try {
              setConfirmLoading(true);
              await axios.patch(
                `/hrms/roles/update-additional-permission/${selectedEmployee._id}`,{
                  mode:'remove'
                }
              );
              fetchAssignedUser();
            } finally {
              setConfirmLoading(false);
              setShowConfirm(false);
              setSelectedEmployee(null);
            }
          }}
        />
      )}
    </div>
  );
}
