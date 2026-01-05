"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const ANOMALY_REASON_MAP = {
  LATE_ENTRY: "Late Coming",
  EARLY_EXIT: "Early Exit",
  BREAK_TOO_LONG: "Break Exceeded",
};

const baseInput =
  "mt-1 w-full px-4 py-3 rounded-md border border-gray-300 bg-gray-50 text-sm text-[var(--color-primaryText)] transition focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

export default function RequestRegularization({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [reportingManagers, setReportingManagers] = useState([]);

  const [selectedRecordId, setSelectedRecordId] = useState("");
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
      } catch (err) {
        console.error("Failed to fetch anomalies:", err);
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

  const handleDateChange = (e) => {
    const record = records.find((r) => r._id === e.target.value);
    if (!record) return;

    setSelectedRecordId(record._id);
    applyRecord(record);
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("imageFile", file);

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
      await axios.post("/hrms/attendance/remove-regularization-image", {
        imageUrl,
      });
      setImageUrl("");
      setImagePreview("");
    } catch (err) {
      console.error("Image remove failed", err);
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="flex flex-col w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh]">

        {/* HEADER */}
        <div className="px-6 py-5 border-b">
          <h4 className="text-primaryText">
            Compose Regularization Request
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            This request will be sent to HR / Manager for approval
          </p>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Date */}
          <div>
            <label className="text-sm font-medium text-[var(--color-primaryText)]">
              Date
            </label>
            <select
              value={selectedRecordId}
              onChange={handleDateChange}
              className={baseInput}
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

          {/* To */}
          <div>
            <label className="text-sm font-medium text-[var(--color-primaryText)]">
              To
            </label>
            <input
              disabled
              value={
                reportingManagers.length
                  ? reportingManagers.map((m) => m.name).join(", ")
                  : "HR Department"
              }
              className={baseInput}
            />
          </div>

          {/* Subject */}
          <div>
            <label className="text-sm font-medium text-[var(--color-primaryText)]">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={baseInput}
            />
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-medium text-[var(--color-primaryText)]">
              Reason Category
            </label>
            <input disabled value={lockedReason} className={baseInput} />
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-[var(--color-primaryText)]">
              Message
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`${baseInput} resize-none leading-relaxed`}
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="text-sm font-medium text-[var(--color-primaryText)]">
              Attach Supporting Document (Optional)
            </label>

            {!imagePreview ? (
              <label
                htmlFor="upload"
                className="mt-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 hover:border-[var(--color-primary)] hover:bg-gray-100 cursor-pointer transition"
              >
                <input
                  type="file"
                  id="upload"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-500">
                  <span className="text-[var(--color-primary)] font-semibold">
                    Click to upload
                  </span>{" "}
                  or drag & drop
                </p>
                <p className="text-xs text-gray-400">
                  PDF, JPG, PNG (Max 5MB)
                </p>
              </label>
            ) : (
              <div className="flex items-center gap-4 mt-2">
                <img
                  src={imagePreview}
                  alt="attachment"
                  className="h-20 rounded-md border"
                />
                <button
                  onClick={handleRemoveImage}
                  className="text-sm font-medium text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-full text-sm font-semibold text-primary border border-primary"
          >
            Discard
          </button>

          <button
            disabled={records.length === 0}
            onClick={handleSend}
            className={`px-3 py-1 rounded-full text-sm font-semibold text-white transition active:scale-95 ${
              records.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-primary shadow-lg shadow-blue-500/30"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
