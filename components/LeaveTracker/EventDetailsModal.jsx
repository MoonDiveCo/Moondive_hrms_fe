'use client'

export default function EventDetailsModal({ data, onClose }) {
  if (!data) return null;

  const { extendedProps, startDate, title, endDate } = data;
  const { source, status, session = "FULL" } = extendedProps || {};

  const sessionLabelMap = {
    FULL: "Full Day",
    FIRST_HALF: "First Half",
    SECOND_HALF: "Second Half",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white/90 w-[420px] rounded-2xl p-5 space-y-5 shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              {source === "LEAVE" ? "Leave Details" : "Holiday Details"}
            </h4>

            {source === "LEAVE" && (
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium
                  ${status === "Approved" && "bg-blue-100 text-blue-700"}
                  ${status === "Pending" && "bg-amber-100 text-amber-700"}
                  ${status === "Rejected" && "bg-red-100 text-red-700"}
                `}
              >
                {status}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        {source === "LEAVE" && (
          <div className="space-y-3 text-sm">
            <Detail label="Leave Type" value={title} />

            <Detail
              label="Duration"
              value={session}
            />

            <Detail
              label="Date"
              value={
                startDate === endDate || !endDate
                  ? startDate.slice(0, 10)
                  : `${startDate.slice(0, 10)}`
              }
            />
          </div>
        )}

        {source === "HOLIDAY" && (
          <div className="space-y-3 text-sm">
            <Detail label="Holiday Name" value={title || "—"} />
            <Detail
              label="Date"
              value={startDate.split("T")[0]}
            />
          </div>
        )}

        {/* FOOTER */}
        <div className="pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">
        {value}
      </span>
    </div>
  );
}
