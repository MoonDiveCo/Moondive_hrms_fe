import { useEffect, useState } from "react";

export default function AddHistoryModal({
  open,
  users = [],
  onClose,
  onSave,
  initialData = null,
}) {
  const [mode, setMode] = useState("user");

  const [form, setForm] = useState({
    userId: "",
    name: "",
    email: "",
    assignedDate: "",
    returnedDate: "",
    remarks: "",
  });

  useEffect(() => {
  if (open && initialData) {
    setMode(initialData.user ? "user" : "other");

    setForm({
      userId: initialData.user
        ? String(initialData.user._id || initialData.user)
        : "",
      name: initialData.userName || "",
      email: initialData.userEmail || "",
      assignedDate: initialData.assignedDate
        ? new Date(initialData.assignedDate).toISOString().split("T")[0]
        : "",
      returnedDate: initialData.returnedDate
        ? new Date(initialData.returnedDate).toISOString().split("T")[0]
        : "",
      remarks: initialData.remarks || "",
    });
  }
}, [open, initialData]);


  if (!open) return null;

  const handleSubmit = () => {
    if (!form.assignedDate) {
      alert("Issued date is required");
      return;
    }

    onSave({
      ...form,
      _id: initialData?._id, 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg w-[420px]">
        <h4 className="font-semibold mb-4">
          {initialData ? "Edit User History" : "Add User History"}
        </h4>

        <select
          className="w-full border p-2 rounded mb-3"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          disabled={!!initialData} 
        >
          <option value="user">Select Existing User</option>
          <option value="other">Other</option>
        </select>

        {mode === "user" ? (
          <select
            className="w-full border p-2 rounded mb-3"
            value={form.userId}
            onChange={(e) =>
              setForm((p) => ({ ...p, userId: e.target.value }))
            }
            disabled={!!initialData} 
          >
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </select>
        ) : (
          <>
            <input
              className="w-full border p-2 rounded mb-2"
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />

            <input
              className="w-full border p-2 rounded mb-3"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
          </>
        )}

        <label className="text-xs">Issued Date</label>
        <input
          type="date"
          className="w-full border p-2 rounded mb-3"
          value={form.assignedDate}
          onChange={(e) =>
            setForm((p) => ({ ...p, assignedDate: e.target.value }))
          }
        />

        <label className="text-xs">Returned Date</label>
        <input
          type="date"
          className="w-full border p-2 rounded mb-3"
          value={form.returnedDate}
          onChange={(e) =>
            setForm((p) => ({ ...p, returnedDate: e.target.value }))
          }
        />

        <textarea
          className="w-full border p-2 rounded mb-4"
          rows={3}
          placeholder="Remarks"
          value={form.remarks}
          onChange={(e) =>
            setForm((p) => ({ ...p, remarks: e.target.value }))
          }
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-primary text-white rounded-full text-xs"
          >
            {initialData ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
