"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { toast } from "sonner";

export default function OrganizationPolicy() {
  const [openModal, setOpenModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    fileName: "",
    description: "",
    folder: "",
    entryDate: "",
  });

  const [file, setFile] = useState(null);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async () => {
    if (!file || !form.fileName || !form.folder) {
      toast.error("File name, folder and file are required");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", form.fileName);
      formData.append("description", form.description);
      formData.append("folder", form.folder);

      await axios.post(
        "http://localhost:2000/api/v1/hrms/organization/organization-files",
        formData
      );

      toast.success("File uploaded successfully");

      setOpenModal(false);
      setForm({
        fileName: "",
        description: "",
        folder: "",
      });
      setFile(null);

      // ✅ THIS IS THE KEY FIX
      fetchFiles();
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:2000/api/v1/hrms/organization/deleteOrganizationFile/${id}`
      );

      toast.error("File Delete Successfully");
      fetchFiles();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const fetchFiles = async () => {
    try {
      setPageLoading(true);
      const res = await axios.get("/hrms/organization/getOrganizationFile");
      setFiles(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch files", error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm">
        <DotLottieReact
          src="https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie"
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: "center" }} // add this
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold text-gray-800">
          Organization Files
        </h3>

        <button
          onClick={() => setOpenModal(true)}
          className="px-4 py-2 text-sm font-medium bg-[#FF7B30] text-white rounded-md"
        >
          Manage
        </button>
      </div>

      {/* Empty State */}
      <div className="mt-6">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-600 font-medium">
              No shared files to display
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file._id}
                className="grid grid-cols-12 items-center bg-white rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition"
              >
                {/* File Name */}
                <div className="col-span-5">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {file.fileName}
                  </p>
                </div>

                {/* Folder (Middle) */}
                <div className="col-span-3">
                  <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full inline-block">
                    {file.folder}
                  </span>
                </div>

                {/* Date */}
                <div className="col-span-2 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(file.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>

                {/* Action */}
                <div className="col-span-2 text-right flex items-center justify-end gap-4">
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    className="text-blue-600 hover:text-blue-800"
                    title="View file"
                  >
                    view
                  </a>

                  <button
                    onClick={() => handleDelete(file._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete file"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-xl p-6 relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-4 right-4 text-gray-400"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-4">
              Add organization file
            </h3>

            <div className="overflow-y-auto flex-1 pr-2">
              {/* Upload */}
              <div className="border-2 border-dashed rounded-lg p-6 text-center mb-4">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="fileUpload"
                />
                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer text-blue-600 text-sm font-medium"
                >
                  Choose file from Desktop / Others
                </label>

                {file && (
                  <p className="mt-2 text-sm text-gray-600">{file.name}</p>
                )}
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    File name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.fileName}
                    onChange={(e) => update("fileName", e.target.value)}
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Folder <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.folder}
                    onChange={(e) => update("folder", e.target.value)}
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="HR Policies">HR Policies</option>
                    <option value="Company Docs">Company Docs</option>
                  </select>
                </div>

                {/* <div>
                  <label className="text-sm font-medium">
                    File Entry date
                  </label>
                  <input
                    type="date"
                    value={form.entryDate}
                    onChange={(e) => update("entryDate", e.target.value)}
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div> */}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 text-sm border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={uploading}
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
