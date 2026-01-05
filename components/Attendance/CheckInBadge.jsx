import StatusBadge from "@/components/Attendance/StatusBadge";

export default function CheckInBadge({ time, status }) {
  if (!time) return <div className="w-28" />;

  return (
    <div className="w-14 flex flex-col items-start">
      {/* <div className="text-sm font-semibold">{time}</div> */}

      {status === "onTime" && (
        <StatusBadge
          label="ON TIME"
          variant="success"
        />
      )}

      {status === "late" && (
        <StatusBadge
          label="LATE"
          variant="warning"
        />
      )}
    </div>
  );
}
