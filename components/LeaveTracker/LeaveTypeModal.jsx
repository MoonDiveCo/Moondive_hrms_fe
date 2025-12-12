"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

const LEAVE_NAMES = [
  "Casual Leave",
  "Earned Leave",
  "Optional Leave",
  "Leave Without Pay",
];

const LEAVE_CODE_MAP = {
  "Casual Leave": "CL",
  "Earned Leave": "EL",
  "Optional Leave": "OL",
  "Leave Without Pay": "LWP",
};

export default function LeaveTypeModal({ mode, data, onClose, organizationId }) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: "",
    code: "",
    yearlyQuota: "",
    isPaid: false,
    allowHalfDay: false,
    carryForward: false,
    maxCarryForwardLimit: 0,
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (isEdit) {
      await axios.put(`/hrms/leave/update-leave-policy/`, 
         {organizationId,  
            leaveTypes: [form],});
    } else {
      await axios.post(`/hrms/leave/create-leave-policy/`, {organizationId,
        leaveTypes: [form]
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[850px] p-6 relative">
        <h3 className="text-lg font-semibold mb-2">
          {isView ? "View Leave Type" : isEdit ? "Edit Leave Type" : "Add Leave Type"}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* NAME FIELD WITH DROPDOWN */}
          <div>
            <label className="text-sm font-medium">Leave Name</label>
            <select
              disabled={isView}
              value={form.name}
              onChange={(e) => {
                    const selectedName = e.target.value;
                    handleChange("name", selectedName);
                    handleChange("code", LEAVE_CODE_MAP[selectedName] || "");
                    }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select Leave Name</option>

              {LEAVE_NAMES.map((leave) => (
                <option key={leave} value={leave}>
                  {leave}
                </option>
              ))}
            </select>
          </div>

          {/* CODE FIELD */}
          <div>
            <label className="text-sm font-medium">Code</label>
           <input
                disabled
                value={form.code}
                className="w-full px-3 py-2 border rounded-md"
                />
          </div>

          {/* YEARLY QUOTA */}
          <div>
            <label className="text-sm font-medium">Yearly Quota</label>
            <input
              type="number"
              disabled={isView}
              value={form.yearlyQuota}
              onChange={(e) => handleChange("yearlyQuota", Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* MAX CARRY FORWARD LIMIT */}
          <div>
            <label className="text-sm font-medium">Max Carry Forward Limit</label>
            <input
              type="number"
              disabled={isView}
              value={form.maxCarryForwardLimit}
              onChange={(e) =>
                handleChange("maxCarryForwardLimit", Number(e.target.value))
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* TRUE/FALSE DROPDOWNS */}
          {["isPaid", "allowHalfDay", "carryForward"].map((key) => (
            <div key={key}>
              <label className="text-sm font-medium">{key}</label>
              <select
                disabled={isView}
                value={form[key] ? "true" : "false"}
                onChange={(e) => handleChange(key, e.target.value === "true")}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 flex gap-3">
          {!isView && (
            <button
              onClick={save}
              className="px-3 py-2 text-xs bg-primary text-white rounded-full"
            >
              Save
            </button>
          )}

          <button onClick={onClose} className="px-3 py-2 text-primaryText border border-primary text-xs rounded-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
