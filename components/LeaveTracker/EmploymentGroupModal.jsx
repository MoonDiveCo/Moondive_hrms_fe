"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EmploymentGroupModal({ mode, data, policy, onClose, organizationId }) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [groupName, setGroupName] = useState("");
  const [allocations, setAllocations] = useState([]);
  const [groupError, setGroupError] = useState("");

  const leaveTypes = Array.isArray(policy?.leaveTypes)
  ? policy.leaveTypes
  : [];

  // Load data or initialize default allocations
useEffect(() => {
  if (data) {
    setGroupName(data.groupName);
    setAllocations(data.leaveAllocations || []);
  } else {
    const defaultAllocations = leaveTypes.map((lt) => ({
      leaveTypeCode: lt.code,
      monthlyQuota: 0,
      yearlyQuota: 0,
      unlimited: lt.code === "LWP",
    }));

    setAllocations(defaultAllocations);
  }
}, [data, leaveTypes]);


  // Save
  // const save = async () => {
  //     if (!groupName) {
  //   setGroupError("Please select an employment group");
  //   return;
  // }
  //   const body = {
  //     groupName,
  //     leaveAllocations: allocations,
  //   };

  //   if (isEdit) {
  //     await axios.put(`/hrms/leave/update-group-policy/`, {
  //       organizationId,
  //       employmentType: [body],
  //     });

  //   } else {
  //     await axios.post(`/hrms/leave/create-group-policy/`, {
  //       organizationId,
  //       employmentType: [body],
  //     });
  //   }

  //   onClose();
  // };
  const save = async () => {
  if (!groupName) {
    setGroupError("please select an employment group");
    return;
  }

  const body = {
    groupName,
    leaveAllocations: allocations,
  };

  try {
    if (isEdit) {
      await axios.put(`/hrms/leave/update-group-policy/`, {
        organizationId,
        employmentType: [body],
      });

      toast.success("Group Policy Updated Successfully");
    } else {
      await axios.post(`/hrms/leave/create-group-policy/`, {
        organizationId,
        employmentType: [body],
      });

      toast.success("Group Policy Created Successfully");
    }

    onClose();
  } catch (error) {
    console.error("save group policy failed:", error);

    toast.error(
      error?.response?.data?.message ||
        "Failed To Save Group Policy."
    );
  }
};


  // Update monthly/yearly quota
  const updateQuota = (code, field, value) => {
    setAllocations((prev) =>
      prev.map((a) =>
        a.leaveTypeCode === code ? { ...a, [field]: value } : a
      )
    );
  };

  const toggleUnlimited = (code, value) => {
  setAllocations(prev =>
    prev.map(a =>
      a.leaveTypeCode === code
        ? {
            ...a,
            unlimited: value,
            monthlyQuota: value ? 0 : a.monthlyQuota,
            yearlyQuota: value ? 0 : a.yearlyQuota,
          }
        : a
    )
  );
};

const getDisabledClasses = (disabled) =>
  disabled
    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
    : "bg-white";

const isValidNumberInput = (value) => /^\d*$/.test(value);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[850px] p-6 relative">
        <h3 className="text-lg font-semibold mb-2">
          {isView ? "View Employment Group" : isEdit ? "Edit Group" : "Add Group"}
        </h3>

        {/* Group Name */}
        <label className="text-sm font-medium">Group Name</label>
        <select
          disabled={isView || isEdit}
          value={groupName}
          onChange={(e) => {
              setGroupName(e.target.value);
              if (e.target.value) setGroupError("");
            }
          }
          className="w-full px-3 py-2 border rounded-md mb-4 bg-white"
        >
          <option value="">Select Group</option>
          <option value="Permanent">Permanent</option>
          <option value="Internship">Internship</option>
          <option value="Probation">Probation</option>
        </select>
        {groupError && (
          <span className="text-xs text-red-500 mb-4 mt-1">{groupError}</span>
        )}

        {/* Leave Allocations */}
        <h4 className="font-medium mb-2">Leave Allocations</h4>

        <div className="grid grid-cols-2 gap-4">
          {leaveTypes.map((lt) => {
            const alloc = allocations.find(a => a.leaveTypeCode === lt.code);
            
            const isOptionalLeave =
            lt.code === "OL" && lt.usageRule?.type === "WINDOWED";

          const isUnlimited = alloc?.unlimited;

            return (
              <div key={lt.code} className="bg-gray-50 p-3 rounded-md">
                <label className="font-medium">{lt.code}</label>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={alloc?.unlimited ?? false}
                disabled={isView } 
                onChange={(e) =>
                  toggleUnlimited(lt.code, e.target.checked)
                }
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700">
                Unlimited ({alloc?.unlimited ? "true" : "false"})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="text-sm text-gray-600">Monthly Quota</label>
                <input
                  type="text"
                  inputMode="numeric"
                  disabled={isView ||isUnlimited || isOptionalLeave}
                  value={alloc?.monthlyQuota ?? 0}
                  onChange={(e) => {
                  const value = e.target.value;
                  if (!isValidNumberInput(value)) return;
                  updateQuota(lt.code, "monthlyQuota", value === "" ? "" : Number(value));
                }}
                  className={`w-full px-3 py-2 border rounded-md mt-1  ${getDisabledClasses(isView || isUnlimited || isOptionalLeave)}`}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Yearly Quota</label>
                <input
                  type="text"
                  inputMode="numeric"
                  disabled={isView || alloc?.unlimited}
                  value={alloc?.yearlyQuota ?? 0}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!isValidNumberInput(value)) return;
                    updateQuota(lt.code, "yearlyQuota", value === "" ? "" : Number(value));
                  }}
                  className={`w-full px-3 py-2 border rounded-md mt-1 ${getDisabledClasses(isView || isUnlimited)}`}
                />
              </div>
            </div>
                {isOptionalLeave && (
            <span className="text-xs text-red-500 mt-1">
              Optional Leave is yearly-based (1 per half-year)
            </span>
          )}
          {isUnlimited && (
        <span className="text-xs text-red-500 mt-1">
          Unlimited leave - quota not required
        </span>
      )}
          </div>
            );
          })}
        </div>

        {/* Buttons */}
        {!isView && (
          <button onClick={save} className="px-3 text-xs py-2 bg-primary text-white rounded-full mt-5">
            Save
          </button>
        )}

        <button onClick={onClose} className="px-3 py-2 text-xs text-primaryText bg-white border border-primary rounded-full ml-2">
          Close
        </button>
      </div>
    </div>
  );
}
