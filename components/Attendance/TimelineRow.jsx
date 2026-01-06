  "use client";
  import { Sun, AlertCircle, CalendarDays, Umbrella } from "lucide-react";
  import CheckInBadge from "./CheckInBadge";
  import CheckOutBadge from "./CheckOutBadge";
  import WorkingTimeline from "./WorkingTimeline";

  export default function TimelineRow({
    day,
    date,
    status,
    hours,
    checkIn = null,
    checkOut = null,
    holidayName,
    leaveLabel = null,
    breaks = [],
  }) {
    const isAbsent = status === "absent";
    const isWeekend = status === "weekend";
    const isFuture = status === "future";
    const isPresent = status === "present";
    const isHoliday = status === "holiday";
    const isLeave = status === "leave";
    const isFirstHalfLeave = status === "leave-first-half";
    const isSecondHalfLeave = status === "leave-second-half";

    const isAnyLeave = isLeave || isFirstHalfLeave || isSecondHalfLeave;
    const isNonWorking = isAbsent || isWeekend || isHoliday || isAnyLeave;
function formatTime(value) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
    const getStatusInfo = () => {
      if (isWeekend) return { icon: <Sun className="w-5 h-5" />, label: "Weekend", color: "yellow" };
      if (isAbsent) return { icon: <AlertCircle className="w-5 h-5" />, label: "Absent", color: "red" };
      if (isHoliday) return { icon: <CalendarDays className="w-5 h-5" />, label: holidayName, color: "blue" };
      if (isAnyLeave)
        return {
          icon: <Umbrella className="w-5 h-5" />,
          label: leaveLabel || (isLeave ? "Full Day Leave" : "LWP"), // Default to LWP for half days
          color: "purple",
        };
      return null;
    };

    const statusInfo = getStatusInfo();

    return (
      <div className="flex items-center gap-4">
        <DateCol day={day} date={date} />

        <div
          className={`
            flex-1 h-20 rounded-xl relative bg-white shadow-sm overflow-hidden
            flex items-center px-6 
            ${isWeekend ? "ring-1 ring-yellow-300 border-l-4 border-yellow-300" : ""}
            ${isHoliday ? "ring-1 ring-blue-300 border-l-4 border-blue-300" : ""}
            ${isPresent ? "ring-1 ring-gray-200 border-l-4 border-green-300" : ""}
            ${isAbsent || isAnyLeave ? "ring-1 ring-red-400 border-l-4 border-red-400" : ""}
          `}
        >
          {/* Background gray line (always visible for present days) */}
          {isPresent && (
            <div className="absolute left-36 right-36 top-1/2 -translate-y-1/2 h-0.5 rounded-full bg-gray-300 z-0" />
          )}

          {/* HALF-DAY LEAVE: Partial red overlay */}
          {(isFirstHalfLeave || isSecondHalfLeave || isLeave) && !isFuture && (
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-0.5 rounded-full z-0">
              {/* Full day leave → full red line */}
              {isLeave && <div className="absolute h-full w-full bg-red-500 rounded-full" />}

              {/* First half leave → red line from 0% to 50% */}
              {isFirstHalfLeave && (
                <div
                  className="absolute h-full w-1/2 bg-red-500 rounded-full"
                  style={{ left: 0 }}
                />
              )}

              {/* Second half leave → red line from 50% to 100% */}
              {isSecondHalfLeave && (
                <div
                  className="absolute h-full w-1/2 bg-red-500 rounded-full"
                  style={{ right: 0 }}
                />
              )}
            </div>
          )}

          {/* Other non-working full lines */}
          {isNonWorking && !isAnyLeave && !isFuture && (
            <div
              className={`
                absolute inset-x-6 top-1/2 -translate-y-1/2 h-0.5 rounded-full w-[88%]
                ${isAbsent ? "bg-red-500" : ""}
                ${isWeekend ? "bg-yellow-400" : ""}
                ${isHoliday ? "bg-blue-400" : ""}
              `}
            />
          )}

          {/* CENTERED BADGE for non-working days */}
          {isNonWorking && statusInfo && !isFuture && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none z-10">
              <div
                className={`
                  px-5 py-2 flex gap-3 text-xs font-medium rounded-2xl whitespace-nowrap
                  ${statusInfo.color === "yellow" && "bg-yellow-100 text-yellow-700"}
                  ${statusInfo.color === "red" && "bg-red-100 text-red-700"}
                  ${statusInfo.color === "blue" && "bg-blue-100 text-blue-700"}
                  ${statusInfo.color === "purple" && "bg-red-100 text-red-500"}
                `}
              >
                <div
                  className={`
                    w-5 h-5 rounded-full flex items-center justify-center
                    ${statusInfo.color === "yellow" && "text-yellow-700"}
                    ${statusInfo.color === "red" && "text-red-700"}
                    ${statusInfo.color === "blue" && "text-blue-700"}
                    ${statusInfo.color === "purple" && "text-red-500"}
                  `}
                >
                  {statusInfo.icon}
                </div>
                <div>{statusInfo.label}</div>
              </div>
            </div>
          )}

          {/* PRESENT DAY: Working timeline */}
          {isPresent && (
            <>
              {checkIn && (
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-left z-10">
                  <div className="font-semibold text-lg">
                    {new Date(checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="mt-1">
                    <CheckInBadge time={checkIn} status="onTime" />
                  </div>
                </div>
              )}

              <div className="absolute inset-x-36 top-1/2 -translate-y-1/2 z-10">
                <WorkingTimeline checkIn={checkIn} checkOut={checkOut || null} breaks={breaks} />
              </div>

              {checkOut && (
                <div className="absolute right-36 top-1/2 -translate-y-1/2 text-right z-10">
                  <div className="font-semibold text-lg">
                    {new Date(checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="mt-1">
                    <CheckOutBadge time={checkOut} status="normal" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* HOURS WORKED */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-right z-20">
            <div className="font-semibold text-lg">{hours || "00:00"}</div>
            <div className="text-xs text-gray-500">Hrs worked</div>
          </div>
        </div>
      </div>
    );
  }

  function DateCol({ day, date }) {
    return (
      <div className="w-16 text-right">
        <div className="text-sm text-gray-500">{day}</div>
        <div className="text-2xl font-bold">{date}</div>
      </div>
    );
  }