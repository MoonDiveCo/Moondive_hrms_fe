'use client'

export default function EventDetailsModal({ data, onClose }) {
  const { extendedProps , startDate, title, endDate} = data || {};
  const { source, status } = extendedProps || {};
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[420px] rounded-xl p-5 space-y-4">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold">
            {source === "LEAVE" && "Leave Details"}
            {source === "HOLIDAY" && "Holiday Details"}
          </h4>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        {/* LEAVE DETAILS */}
        {source === "LEAVE" && (
          <div className="space-y-2 text-sm">
            <Detail label="Leave Type" value={title} />
            <Detail label="Status" value={status} />
            <Detail
              label="Duration"
              value={`${startDate.slice(0,10)} → ${endDate?.slice(0,10)}`}
            />
            {/* {leave.HalfDay && (
              <Detail label="Half Day" value={leave.HalfDay} />
            )}
            {leave.reason && (
              <Detail label="Reason" value={leave.reason} />
            )} */}
          </div>
        )}

        {/* HOLIDAY DETAILS */}
        {source === "HOLIDAY" && (
          <div className="space-y-2 text-sm">
            <Detail label="Holiday Name" value={title || "—"} />
            {/* <Detail label="Type" value={holiday.type} /> */}
            {/* <Detail
              label="Status"
              value={holiday.isActive ? "Active" : "Inactive"}
            /> */}
            <Detail
              label="Date"
              value={startDate.split("T")[0]}
            />
          </div>
        )}

        {/* FOOTER */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg"
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
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 text-right">{value}</span>
    </div>
  );
}
