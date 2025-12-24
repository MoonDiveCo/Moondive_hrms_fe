"use client";

import { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { Eye, Edit2, Trash2, Plus } from "lucide-react";
import { AuthContext } from "@/context/authContext";
import LeaveTypeModal from "./LeaveTypeModal";

export default function LeavePoliciesPage() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const {user} = useContext(AuthContext)

  const [leaveModal, setLeaveModal] = useState({ open: false, mode: "add", data: null });

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

  const openLeaveModal = (mode, data, e) => {
    lastFocus.current = e?.currentTarget ?? null;
    setLeaveModal({ open: true, mode, data });
  };

  const closeModal = () => {
    setLeaveModal({ open: false, mode: "add", data: null });
    lastFocus.current?.focus();
    fetchPolicy();
  };

async function deleteLeaveType(code) {
  if (!window.confirm("Delete this leave type?")) return;

  await axios.delete(`/hrms/leave/delete-leave-policy/${user.organizationId}/${code}`);

  fetchPolicy();
}

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="w-full -z-10 space-y-10">

      <section className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="p-6 flex justify-between items-center">
          <h4 className="text-primaryText">Leave Policy</h4>

          <button
            className="px-4 py-2 text-sm text-white bg-orange-500 rounded flex items-center gap-2"
            onClick={(e) => openLeaveModal("add", null, e)}
          >
            <Plus size={16} /> Add Leave Type
          </button>
        </div>

            <div className="relative overflow-auto">

        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {["Name", "Code", "Quota", "Paid", "Half Day", "Carry Forward", "Max CF",  "Actions"].map((h) => (
                <th key={h} className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200 ">
            {policy?.leaveTypes?.length ? (
              policy.leaveTypes.map((lt, i) => (
                <tr key={lt.code} >
                  <td className="px-8 py-4">{lt.name}</td>
                  <td className="px-10 py-4">{lt.code}</td>
                  <td className="px-12 py-4">{lt.yearlyQuota}</td>
                  <td className="px-10 py-4">{lt.isPaid ? "Yes" : "No"}</td>
                  <td className="px-14 py-4">{lt.allowHalfDay ? "Yes" : "No"}</td>
                  <td className="px-14 py-4">{lt.carryForward ? "Yes" : "No"}</td>
                  <td className="px-14 py-4">{lt.maxCarryForwardLimit}</td>

                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex gap-2">
                        <button
                      onClick={(e) => openLeaveModal("view", lt, e)}
                      className="p-2 hover:bg-gray-100 rounded-md"
                    >
                      <Eye size={16} className="text-primary" />
                    </button>
                      <button
                        onClick={(e) => openLeaveModal("edit", lt, e)}
                        className="p-2 hover:bg-gray-100 rounded-md"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        onClick={() => deleteLeaveType(lt.code)}
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
                <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                  No leave types found.
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </section>

      {leaveModal.open && (
        <LeaveTypeModal {...leaveModal} onClose={closeModal} organizationId={user.organizationId} existingLeaveTypes={policy.leaveTypes} />
      )}
    </div>
  );
}
