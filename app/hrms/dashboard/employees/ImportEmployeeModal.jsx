"use client";

import { X } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export default function ImportEmployeeModal({ open, onClose ,onSuccess}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  if (!open) return null;

  const uploadExcel = async () => {
  if (!file) {
    setError("Please select an Excel file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    setLoading(true);
    setError("");
    setResult(null);

    const res = await axios.post(
      "hrms/employee/import-employees",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // 🔹 Refresh employee list in background
    if (typeof onSuccess === "function") {
      onSuccess(); // ❗ don't await
    }

    // 🔹 Close modal immediately (smooth UX)
    handleClose();

  } catch (err) {
    setError(
      err?.response?.data?.responseMessage ||
      err?.response?.data?.message ||
      "Upload failed"
    );
  } finally {
    setLoading(false);
  }
};



  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay with blur */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl w-full max-w-lg p-6 shadow-xl">
        
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          Import Employees
        </h2>

        {/* File Input */}
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setError("");
            setResult(null);
          }}
          className="mb-4 w-full"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={uploadExcel}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 mt-3 text-sm">
            {error}
          </p>
        )}

        {/* Success Message */}
        {result && !error && (
          <p className="text-green-600 mt-3 text-sm">
            Employees imported successfully
          </p>
        )}
      </div>
    </div>
  );
}
