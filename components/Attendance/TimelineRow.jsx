import WorkingTimeline from "./WorkingTimeline";

export default function TimelineRow({
  day,
  date,
  status,
  hours,
  checkIn = null,
  checkOut = null,
}) {
  const isAbsent = status === "absent";
  const isWeekend = status === "weekend";
  const isFuture = status === "future";
  const isPresent = status === "present";

  return (
    <div className="flex items-center gap-4">
      <DateCol day={day} date={date} />

      <div
        className={`
          flex-1 h-24 rounded-xl relative bg-white shadow-sm
          flex items-center px-6 pr-24
          ${isAbsent ? "ring-1 ring-red-200" : ""}
          ${isWeekend ? "ring-1 ring-yellow-200" : ""}
        `}
      >
        {/* BASE LINE */}
        {!isFuture && (
          <div
            className={`
              absolute left-6 right-24 top-1/2 h-[2px] -translate-y-1/2 rounded-full
              ${isAbsent ? "bg-red-300" : ""}
              ${isWeekend ? "bg-yellow-300" : ""}
              ${isPresent ? "bg-gray-200" : ""}
            `}
          />
        )}

        {/* CENTER LABEL */}
        {(isAbsent || isWeekend) && (
          <div className="absolute left-6 right-24 top-1/2 -translate-y-1/2 flex justify-center">
            <span
              className={`px-3 py-1 text-xs rounded-md
                ${isAbsent
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-700"}
              `}
            >
              {isAbsent ? "Absent" : "Weekend"}
            </span>
          </div>
        )}

        {/* WORKING TIMELINE (PAST / PRESENT) */}
        {isPresent && checkIn && (
          <div className="absolute left-6 right-24 top-1/2 -translate-y-1/2">
            <WorkingTimeline
              inTime={new Date(checkIn).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              outTime={
                checkOut
                  ? new Date(checkOut).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null
              }
            />
          </div>
        )}

        {/* HOURS */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-right">
          <div className="font-semibold">{hours}</div>
          <div className="text-xs text-gray-400">Hrs worked</div>
        </div>
      </div>
    </div>
  );
}

function DateCol({ day, date }) {
  return (
    <div className="w-16 text-right">
      <div className="text-sm text-gray-500">{day}</div>
      <div className="text-xl font-bold">{date}</div>
    </div>
  );
}
