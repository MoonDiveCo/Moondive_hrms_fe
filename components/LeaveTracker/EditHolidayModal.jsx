"use client";

import { useState } from "react";
import axios from "axios";

export default function EditHolidayModal({ day, onClose, onSuccess }) {
  const [type, setType] = useState(day.type);
  const [name, setName] = useState(day.name || "");

  async function handleSave() {
    await axios.post("/api/hrms/holidays/update", {
      organizationId: day.organizationId,
      date: day.date,
      type,
      name,
    });
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-5 rounded-xl w-96">
        <h3 className="font-semibold mb-3">Update Holiday</h3>

        <select
          className="w-full border p-2 rounded mb-3"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="NATIONAL">National</option>
          <option value="OPTIONAL">Optional</option>
          <option value="WEEKDAY">Weekday</option>
        </select>

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Holiday name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1">Cancel</button>
          <button
            onClick={handleSave}
            className="bg-orange-500 text-white px-3 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
