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

const getDisabledClasses = (disabled) =>
  disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white";

export default function LeaveTypeModal({ mode, data, onClose, organizationId }) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const [leaveNameError, setLeaveNameError] = useState("");
  const [form, setForm] = useState({
    name: "",
    code: "",
    yearlyQuota: "",
    isPaid: false,
    allowHalfDay: false,
    carryForward: false,
    maxCarryForwardLimit: 0,
    usageRule: {
      type: "NONE",
      windows: [],
    },
  });

useEffect(() => {
  if (!data) return;

  setForm({
    ...data,

    usageRule: {
      type: data.usageRule?.type || "NONE",
      windows: Array.isArray(data.usageRule?.windows)
        ? data.usageRule.windows
        : [],
    },
  });
}, [data]);
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleWindowed = (enabled) => {
    handleChange("usageRule", {
      type: enabled ? "WINDOWED" : "NONE",
      windows: enabled
        ? [{ fromMonth: 1, toMonth: 12, maxUsage: 1 }]
        : [],
    });
  };

  const updateWindow = (index, key, value) => {
    const updated = [...form.usageRule.windows];
    updated[index][key] = Number(value);
    handleChange("usageRule", { ...form.usageRule, windows: updated });
  };

  const addWindow = () => {
    handleChange("usageRule", {
      ...form.usageRule,
      windows: [
        ...form.usageRule.windows,
        { fromMonth: 1, toMonth: 12, maxUsage: 1 },
      ],
    });
  };

  const removeWindow = (index) => {
    handleChange("usageRule", {
      ...form.usageRule,
      windows: form.usageRule.windows.filter((_, i) => i !== index),
    });
  };

  const save = async () => {
      if (!form.name) {
    setLeaveNameError("Please select a leave type");
    return;
  }
    const payload = {
      organizationId,
      leaveTypes: [form],
    };

    if (isEdit) {
      await axios.put(`/hrms/leave/update-leave-policy/`, payload);
    } else {
      await axios.post(`/hrms/leave/create-leave-policy/`, payload);
    }
    onClose();
  };

  const isValidNumberInput = (value) => /^\d*$/.test(value);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[900px] p-6 relative">
        <h3 className="text-lg font-semibold mb-4">
          {isView
            ? "View Leave Type"
            : isEdit
            ? "Edit Leave Type"
            : "Add Leave Type"}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Leave Name</label>
            <select
              disabled={isView}
              value={form.name}
              onChange={(e) => {
              const name = e.target.value;
              handleChange("name", name);
              handleChange("code", LEAVE_CODE_MAP[name] || "");

              if (name) setLeaveNameError("");
            }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select Leave Name</option>
              {LEAVE_NAMES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            {leaveNameError && (
              <span className="text-xs text-red-500 mt-1">{leaveNameError}</span>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Code</label>
            <input
              disabled
              value={form.code}
              className="w-full px-3 py-2 border rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Yearly Quota</label>
            <input
              type="text"
              disabled={isView}
              value={form.yearlyQuota}
              onChange={(e) => {
                const v = e.target.value;
                if (!isValidNumberInput(v)) return;
                handleChange("yearlyQuota", v === "" ? "" : Number(v));
              }}
              className={`w-full px-3 py-2 border rounded-md ${getDisabledClasses(
                isView
              )}`}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Max Carry Forward Limit
            </label>
            <input
              type="text"
              disabled={isView }
              value={form.maxCarryForwardLimit}
              onChange={(e) => {
                const v = e.target.value;
                if (!isValidNumberInput(v)) return;
                handleChange(
                  "maxCarryForwardLimit",
                  v === "" ? "" : Number(v)
                );
              }}
              className={`w-full px-3 py-2 border rounded-md ${getDisabledClasses(
                isView
              )}`}
            />
          </div>

          {["isPaid", "allowHalfDay", "carryForward"].map((key) => (
            <div key={key}>
              <label className="text-sm font-medium">{key}</label>
              <select
                disabled={isView}
                value={form[key] ? "true" : "false"}
                onChange={(e) =>
                  handleChange(key, e.target.value === "true")
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              disabled={isView}
              checked={form.usageRule.type === "WINDOWED"}
              onChange={(e) => toggleWindowed(e.target.checked)}
            />
            <span className="text-sm font-medium">
              Enable Window Based Usage (Optional)
            </span>
          </div>

          {form.usageRule.type === "WINDOWED" && (
            <div className="space-y-3">
              {form.usageRule.windows.map((w, i) => (
                <div key={i} className="grid grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="text-xs">From Month</label>
                    <input
                      type="number"
                      value={w.fromMonth}
                      disabled={isView}
                      onChange={(e) =>
                        updateWindow(i, "fromMonth", e.target.value)
                      }
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>

                  <div>
                    <label className="text-xs">To Month</label>
                    <input
                      type="number"
                      value={w.toMonth}
                      disabled={isView}
                      onChange={(e) =>
                        updateWindow(i, "toMonth", e.target.value)
                      }
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>

                  <div>
                    <label className="text-xs">Max Usage</label>
                    <input
                      type="number"
                      value={w.maxUsage}
                      disabled={isView}
                      onChange={(e) =>
                        updateWindow(i, "maxUsage", e.target.value)
                      }
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>

                  {!isView && (
                    <button
                      onClick={() => removeWindow(i)}
                      className="text-xs text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {!isView && (
                <button
                  onClick={addWindow}
                  className="text-xs text-primary underline"
                >
                  + Add Window
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {!isView && (
            <button
              onClick={save}
              className="px-4 py-2 text-xs bg-primary text-white rounded-full"
            >
              Save
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs border rounded-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
