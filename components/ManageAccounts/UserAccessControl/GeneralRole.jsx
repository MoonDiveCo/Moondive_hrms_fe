'use client';

import { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Minus,
  Trash2,
} from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import AddEditRoleModal from './AddEditRoleModal';
import AssignGeneralRoleModal from './AssignGenerelRoleModal';
import ConfirmRemoveRoleModal from './ConfirmRemoveRoleModal';

export default function GeneralRole() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addRoleVisible, setAddRoleVisible] = useState(false);
  const [mode, setMode] = useState('add');
  const [editRole, setEditRole] = useState(null);

  const [expandedRoles, setExpandedRoles] = useState({});
  const [openActionRoleId, setOpenActionRoleId] = useState(null);

  const [assignRoleVisible, setAssignRoleVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [confirmMode, setConfirmMode] = useState('remove-role');

  const deleteRole = async () => {
    try {
      setRemoving(true);

      await axios.delete(`/hrms/roles/${selectedRole._id}`);

      setRoles((prev) =>
        prev.filter((r) => r._id !== selectedRole._id)
      );

      setConfirmVisible(false);
      setSelectedRole(null);
    } catch (err) {
      console.error('Error deleting role:', err);
    } finally {
      setRemoving(false);
    }
  };



  const fetchRoles = async () => {
    try {
      const res = await axios.get('/hrms/roles/fetch-user-role');
      setRoles(res.data.result.roles);
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  /* ---------------------------------------
     Toggle user list
  ---------------------------------------- */
  const toggleRoleUsers = (roleId) => {
    setExpandedRoles((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  /* ---------------------------------------
     Toggle action icons
  ---------------------------------------- */
  const toggleRoleActions = (roleId) => {
    setOpenActionRoleId((prev) =>
      prev === roleId ? null : roleId
    );
  };

  /* ---------------------------------------
     Remove user from role
  ---------------------------------------- */
  const removeUserFromRole = async () => {
    try {
      setRemoving(true);

      await axios.patch('/hrms/roles/update-user-role', {
        mode: 'remove',
        role: selectedRole.name,
        userId: selectedUser._id,
      });

      setRoles((prev) =>
        prev.map((r) =>
          r._id === selectedRole._id
            ? {
                ...r,
                users: r.users.filter(
                  (u) => u._id !== selectedUser._id
                ),
              }
            : r
        )
      );

      setConfirmVisible(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error removing user from role:', err);
    } finally {
      setRemoving(false);
    }
  };

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
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm">
        {/* Header */}
        <div className="p-6  flex justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            General Role
          </h4>
          <button
            onClick={() => {
              setMode('add');
              setEditRole(null);
              setAddRoleVisible(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded hover:bg-orange-600"
          >
            Add Role
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="columns-1 md:columns-2 gap-6">
            {roles.map((role) => {
              const usersExpanded = expandedRoles[role._id];
              const actionsOpen = openActionRoleId === role._id;

              return (
                <div
                  key={role._id}
                  className="rounded-xl bg-white p-4 border border-[#D0D5DD] break-inside-avoid mb-6"
                >
                  {/* Role header */}
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-semibold text-gray-900">
                      {role.name}
                    </h5>

                    <div className="flex items-center gap-1">
                      {/* Dropdown (actions toggle) */}
                      {/* <button
                        className="p-1 rounded hover:bg-gray-100"
                        onClick={() =>
                          
                        }
                      >
                        {actionsOpen ? (
                          <ChevronUp
                            size={16}
                            className="text-gray-500"
                          />
                        ) : (
                          <ChevronDown
                            size={16}
                            className="text-gray-500"
                          />
                        )}
                      </button> */}

                      {/* Action icons */}
                      {actionsOpen && (
                        <>
                          <button
                            className="p-1 rounded hover:bg-gray-100"
                            title="Assign user"
                            onClick={() => {
                              setSelectedRole(role);
                              setAssignRoleVisible(true);
                            }}
                          >
                            <Plus
                              size={16}
                              className="text-gray-500"
                            />
                          </button>

                          <button
                            className="p-1 rounded hover:bg-gray-100"
                            title="Edit role"
                            onClick={() => {
                              setMode('edit');
                              setEditRole(role);
                              setAddRoleVisible(true);
                            }}
                          >
                            <Pencil
                              size={15}
                              className="text-gray-500"
                            />
                          </button>

                          <button
                            className="p-1 rounded hover:bg-gray-100"
                            title="Delete role"
                            onClick={() => {
                              setConfirmMode('delete-role');
                              setSelectedRole(role);
                              setConfirmVisible(true);
                            }}
                          >
                            <Trash2 size={15} className="text-gray-500" />
                          </button>
                        </>
                      )}

                      {/* Expand users */}
                      <button
                        className="p-1 rounded hover:bg-gray-100"
                        onClick={() =>{
                          toggleRoleUsers(role._id)
                          toggleRoleActions(role._id)}
                        }
                      >
                        {usersExpanded ? (
                          <ChevronUp
                            size={16}
                            className="text-gray-500"
                          />
                        ) : (
                          <ChevronDown
                            size={16}
                            className="text-gray-500"
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Users */}
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      usersExpanded
                        ? 'max-h-[1000px] opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    {role.users.length > 0 ? (
                      <div className="space-y-2 mt-2 max-h-[260px] overflow-y-auto pr-1">
                        {role.users.map((user) => (
                          <div
                            key={user._id}
                            className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.designation.name}
                              </p>
                            </div>

                            <button
                              className="p-1 rounded hover:bg-orange-100"
                              onClick={() => {
                                setSelectedUser(user);
                                setSelectedRole(role);
                                setConfirmVisible(true);
                              }}
                            >
                              <Minus
                                size={14}
                                className="text-primary"
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-500 mt-2">
                        No Users assigned to this Role
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {addRoleVisible && (
        <AddEditRoleModal
          onClose={() => setAddRoleVisible(false)}
          onSuccess={fetchRoles}
          mode={mode}
          role={editRole}
        />
      )}

      {assignRoleVisible && selectedRole && (
        <AssignGeneralRoleModal
          role={selectedRole}
          onClose={() => setAssignRoleVisible(false)}
          onSuccess={() => {
            setAssignRoleVisible(false);
            fetchRoles();
          }}
        />
      )}

      {confirmVisible && selectedRole && (
        <ConfirmRemoveRoleModal
          mode={confirmMode}
          user={confirmMode === 'remove-role' ? selectedUser : null}
          role={selectedRole}
          loading={removing}
          onClose={() => setConfirmVisible(false)}
          onConfirm={
            confirmMode === 'delete-role'
              ? deleteRole
              : removeUserFromRole
          }
        />
      )}
    </div>
  );
}
