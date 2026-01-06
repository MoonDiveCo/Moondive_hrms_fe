import StatusBadge from "@/components/Attendance/StatusBadge";

export default function CheckOutBadge({ time, late }) {
  if (!time) return null;

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-right">
      {/* <div className="text-sm font-semibold">{time}</div> */}

      {late && (
        <div className="mt-1">
          <StatusBadge
            label="LATE"
            variant="info"
          />
        </div>
      )}
    </div>
  );
}
