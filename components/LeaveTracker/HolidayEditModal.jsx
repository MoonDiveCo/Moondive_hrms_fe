"use client";

import { useState } from "react";
import axios from "axios";

export default function HolidayEditModal({ day, onClose, organizationId }) {
  const [name, setName] = useState(day?.name || "");
  const [type, setType] = useState(day?.type || "PUBLIC");
  const [isActive, setIsActive] = useState(
    typeof day?.isActive === "boolean" ? day.isActive : true
  );

//   async function handleSave() {
//     await axios.put("/hrms/holiday/update-type", {
//       organizationId: organizationId,
//       date: day.date,
//       name: name || null,
//       type,
//       isActive,
//     });

//     onClose();
//   }

//   async function handleDelete() {
//   const confirmDelete = confirm(
//     "Are you sure you want to permanently delete this holiday?"
//   );

//   if (!confirmDelete) return;

//   await axios.delete("/hrms/holiday/delete", {
//     data: {
//       organizationId,
//       date: day.date,
//     },
//   });

//   onClose();
// }
async function handleSave() {
  try {
    await axios.put("/hrms/holiday/update-type", {
      organizationId,
      date: day.date,
      name: name || null,
      type,
      isActive,
    });

    toast.success("Holiday Updated Successfully");
    onClose();
  } catch (error) {
    console.error("update holiday failed:", error);

    toast.error(
      error?.response?.data?.message ||
        "Failed to Update Holiday Please Try Again"
    );
  }
}
async function handleDelete() {
  const confirmDelete = confirm(
    "Are you sure you want to permanently delete this holiday?"
  );

  if (!confirmDelete) return;

  try {
    await axios.delete("/hrms/holiday/delete", {
      data: {
        organizationId,
        date: day.date,
      },
    });

    toast.success("Holiday Deleted Successfully");
    onClose();
  } catch (error) {
    console.error("delete holiday failed:", error);

    toast.error(
      error?.response?.data?.message ||
        "failed to delete holiday please try again"
    );
  }
}



  return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
          
          {/* HEADER */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold">
              {day?.isNew ? "Add Holiday" : "Edit Holiday"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* DATE */}
          <div className="mb-4">
            <label className="text-xs text-gray-500">Date</label>
            <input
              value={day.date}
              disabled
              className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100 text-sm"
            />
            {day.isWeekend && (
              <p className="text-xs text-gray-400 mt-1">
                Weekend (read-only)
              </p>
            )}
          </div>

          {/* ACTIVE TOGGLE */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Holiday Active</p>
              <p className="text-xs text-gray-500">
                Inactive holidays are shown but disabled
              </p>
            </div>

            <button
              onClick={() => setIsActive((p) => !p)}
              className={`w-12 h-6 rounded-full relative transition ${
                isActive ? "bg-orange-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition ${
                  isActive ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* TYPE */}
          <div className="mb-4">
            <label className="text-xs text-gray-500">Holiday Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={!isActive}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100"
            >
              <option value="PUBLIC">Public Holiday</option>
              <option value="OPTIONAL">Optional Holiday</option>
            </select>
          </div>

          {/* NAME */}
          <div className="mb-6">
            <label className="text-xs text-gray-500">Holiday Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Eg. Diwali"
              disabled={!isActive}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100"
            />
          </div>

          {/* ACTIONS */}
            {/* ACTIONS */}
            <div className="flex items-center justify-between mt-6">
            {/* DELETE (only for existing holidays) */}
            {!day.isNew && (
                <button
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-700"
                >
                Delete Holiday
                </button>
            )}

            <div className="flex gap-3">
                <button
                onClick={onClose}
                className="px-4 py-2 text-sm border rounded-lg"
                >
                Cancel
                </button>

                <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg"
                >
                Save
                </button>
            </div>
            </div>

        </div>
      </div>
    </>
  );
}
