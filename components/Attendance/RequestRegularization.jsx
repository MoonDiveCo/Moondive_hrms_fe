"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const ANOMALY_REASON_MAP = {
  LATE_ENTRY: "Late Coming",
  EARLY_EXIT: "Early Exit",
  BREAK_TOO_LONG: "Break Exceeded",
};

export default function RequestRegularization({ onClose }) {
  const [loading, setLoading] = useState(true);

  const [records, setRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState("");
const [reportingManagers, setReportingManagers] = useState([]);
  const [displayDate, setDisplayDate] = useState("");
  const [lockedReason, setLockedReason] = useState("");

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
   async function fetchAnomalies() {
  try {
    const res = await axios.get("/hrms/attendance/regularization");

    const { records = [], reportingManagers = [] } = res.data.data || {};

    setRecords(records);
    setReportingManagers(reportingManagers);

    if (records.length) {
      setSelectedRecordId(records[0]._id);
      applyRecord(records[0]);
    }
  } catch (error) {
    console.error("Failed to fetch anomalies:", error);
  } finally {
    setLoading(false);
  }
}


    fetchAnomalies();
  }, []);

  const applyRecord = (record) => {
    const formattedDate = new Date(record.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const resolvedReason =
      ANOMALY_REASON_MAP[record.anomalies?.[0]] || "Other";

    setDisplayDate(formattedDate);
    setLockedReason(resolvedReason);

    setSubject(
      `Request to Regularize Half Day – ${resolvedReason} on ${formattedDate}`
    );

    setMessage(`Dear HR Team,

I would like to request regularization for the half-day marked on ${formattedDate} due to ${resolvedReason.toLowerCase()}.

Kindly consider my request.

Regards,
Adarsh`);
  };

  const handleSend = async () => {
  try {
    const selectedRecord = records.find(
      (r) => r._id === selectedRecordId
    );

    await axios.post("/hrms/attendance/submit-regularization", {
      attendanceId: selectedRecord._id,
      date: selectedRecord.date,
      reason: lockedReason,
      subject,
      message,
      imageUrl,
    });

    onClose(); 
  } catch (err) {
    console.error("Failed to send regularization:", err);
  }
};


  const handleDateChange = (e) => {
    const record = records.find((r) => r._id === e.target.value);
    if (!record) return;

    setSelectedRecordId(record._id);
    applyRecord(record);
  };

  const handleImageChange = async (e) => {
    const imageFile = e.target.files[0];
    if (!imageFile) return;

    const formData = new FormData();
    formData.append("imageFile", imageFile);

    try {
      const { data } = await axios.post(
        "/hrms/attendance/add-regularization-image",
        formData
      );

      const uploadedUrl = data?.result?.imageUrls?.[0];
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
        setImagePreview(uploadedUrl);
      }
    } catch (err) {
      console.error("Image upload failed", err);
    }
  };

  const handleRemoveImage = async () => {
    try {
      await axios.post("/hrms/attendance/remove-regularization-image", { imageUrl });
      setImageUrl("");
      setImagePreview("");
    } catch (err) {
      console.error("Image remove failed", err);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-background-light font-display h-screen p-4">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-0"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="flex flex-col w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh]">

          {/* HEADER */}
          <div className="px-6 py-5 border-b border-gray-200 bg-white">
            <h4 className="text-primaryText">
              Compose Regularization Request
            </h4>
            <p className="text-gray-500 text-sm mt-1">
              This request will be sent to HR / Manager for approval
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            <div>
              <label className="text-gray-700 font-medium pb-2 block">
                Date
              </label>
              <select
                value={selectedRecordId}
                onChange={handleDateChange}
                className="w-full h-14 rounded-lg bg-gray-100 border border-gray-300 px-4 cursor-pointer"
              >
                {records.map((r) => (
                  <option key={r._id} value={r._id}>
                    {new Date(r.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-700 font-medium pb-2 block">
                To
              </label>
             <input
              disabled
              value={
                reportingManagers.length
                  ? reportingManagers.map((m) => m.name).join(", ")
                  : "HR Department"
              }
              className="w-full h-14 rounded-lg bg-gray-100 border border-gray-300 px-4 text-gray-600 cursor-not-allowed"
            />

            </div>

            <div>
              <label className="text-gray-700 font-medium pb-2 block">
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-14 rounded-lg bg-gray-50 border border-gray-300 px-4 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-gray-700 font-medium pb-2 block">
                Reason Category
              </label>
              <input
                disabled
                value={lockedReason}
                className="w-full h-14 rounded-lg bg-gray-100 border border-gray-300 px-4 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-gray-700 font-medium pb-2 block">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full min-h-[160px] rounded-lg bg-gray-50 border border-gray-300 p-4 focus:ring-primary/50 leading-relaxed"
              />
            </div>

            <div>
              <p className="text-gray-700 font-medium pb-2">
                Attach Supporting Document (Optional)
              </p>

              {!imagePreview ? (
                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                    id="upload"
                  />
                  <label htmlFor="upload" className="cursor-pointer">
                    <p className="text-sm text-gray-500">
                      <span className="text-primary font-semibold">
                        Click to upload
                      </span>{" "}
                      or drag & drop
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, JPG, PNG (Max 5MB)
                    </p>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <img
                    src={imagePreview}
                    alt="attachment"
                    className="h-20 rounded border"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="text-red-500 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-lg text-gray-700 font-bold text-sm hover:bg-gray-200"
            >
              Discard
            </button>
            <button 
              onClick={handleSend}
              className="px-6 py-3 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-blue-500/30 active:scale-95">
              Send
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
