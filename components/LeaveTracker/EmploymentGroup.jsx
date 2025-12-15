"use client";
import React from 'react'
import EmploymentGroupModal from './EmploymentGroupModal'

import { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { Eye, Edit2, Trash2, Plus } from "lucide-react";
import { AuthContext } from "@/context/authContext";

function EmploymentGroup() {

      const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const {user} = useContext(AuthContext)

  const [groupModal, setGroupModal] = useState({ open: false, mode: "add", data: null });

  const lastFocus = useRef(null);

  async function fetchPolicy() {
    setLoading(true);
    const res = await axios.get(`/hrms/leave/list-leave-policies/${user.organizationId}`); 
    setPolicy(res.data);
    setLoading(false);
  }

  useEffect(() => {
    fetchPolicy();
  }, []);

    const openGroupModal = (mode, data, e) => {
    lastFocus.current = e?.currentTarget ?? null;
    setGroupModal({ open: true, mode, data });
  };

    const closeModal = () => {
    setGroupModal({ open: false, mode: "add", data: null });
    lastFocus.current?.focus();
    fetchPolicy();
  };

async function deleteGroup(groupName) {
  if (!window.confirm("Delete this employment group?")) return;

  await axios.delete(`/hrms/leave/delete-group-policy/${user.organizationId}/${groupName}`);

  fetchPolicy();
}



    if (loading) return <div className="p-6">Loading...</div>;
  return (
     <section className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="p-6 border-b flex justify-between items-center">
          <h4 className="text-lg font-semibold text-gray-900"></h4>

          <button
            className="px-4 py-2 text-sm text-white bg-orange-500 rounded hover:bg-orange-600 flex items-center gap-2"
            onClick={(e) => openGroupModal("add", null, e)}
          >
            <Plus size={16} /> Add Employment Group
          </button>
        </div>

        <div className="relative overflow-auto">

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Group Name
                </th>

                {/* Dynamic Leave Type Headers */}
                {policy.leaveTypes.map((lt) => (
                <React.Fragment key={lt.code}>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {lt.code} (Monthly)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {lt.code} (Yearly)
                    </th>
                </React.Fragment>
                ))}

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
                </th>
            </tr>
            </thead>


         <tbody className="divide-y divide-gray-200">
            {policy?.employmentType?.length ? (
                policy.employmentType.map((grp) => (
                <tr key={grp.groupName}>
                    
                    {/* Group Name */}
                    <td className="px-6 py-4 text-gray-900 font-medium">
                    {grp.groupName}
                    </td>

                    {/* Dynamic Leave Allocations */}
                    {policy.leaveTypes.map((lt) => {
                    const allocation = grp.leaveAllocations.find(
                        (a) => a.leaveTypeCode === lt.code
                    );
const isUnlimited = allocation?.unlimited === true;

return (
  <React.Fragment key={lt.code}>
    <td className="px-6 py-4 text-gray-700">
      {isUnlimited ? (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
          Unlimited
        </span>
      ) : (
        allocation?.monthlyQuota ?? 0
      )}
    </td>

    <td className="px-6 py-4 text-gray-700">
      {isUnlimited ? (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
          Unlimited
        </span>
      ) : (
        allocation?.yearlyQuota ?? 0
      )}
    </td>
  </React.Fragment>
);

                    })}

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2">
                        <button
                        onClick={(e) => openGroupModal("view", grp, e)}
                        className="p-2 hover:bg-gray-100 rounded-md"
                        >
                        <Eye size={16} className="text-blue-600" />
                        </button>

                        <button
                        onClick={(e) => openGroupModal("edit", grp, e)}
                        className="p-2 hover:bg-gray-100 rounded-md"
                        >
                        <Edit2 size={16} />
                        </button>

                        <button
                        onClick={() => deleteGroup(grp.groupName)}
                        className="p-2 hover:bg-gray-100 rounded-md"
                        >
                        <Trash2 size={16} className="text-red-600" />
                        </button>
                    </div>
                    </td>

                </tr>
                ))
            ) : (
                <tr>
            <td    
            colSpan={policy.leaveTypes.length * 2 + 2}
            className="px-6 py-4 text-center text-sm text-gray-500"
        >
            No groups found.
        </td>
        </tr>
    )}
    </tbody>

        </table>
        </div>
         {groupModal.open && (
        <EmploymentGroupModal {...groupModal} policy={policy} onClose={closeModal} organizationId={user.organizationId} />
      )}
      </section>
  )
}

export default EmploymentGroup