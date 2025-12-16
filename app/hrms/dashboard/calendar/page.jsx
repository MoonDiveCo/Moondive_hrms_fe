"use client";

const weekDays = [
  { day: "Sun", date: 14 },
  { day: "Mon", date: 15 },
  { day: "Tue", date: 16 },
  { day: "Wed", date: 17 },
  { day: "Thu", date: 18 },
  { day: "Fri", date: 19 },
  { day: "Sat", date: 20 },
];


export default function Calender(){
    return (
   <div className="bg-white rounded-2xl shadow-sm p-6 w-full">
      <h2 className="text-3xl font-bold text-gray-900">
        Work Schedule
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        14-Dec-2025 - 20-Dec-2025
      </p>

      <div className="mt-6 bg-orange-50 rounded-xl p-4 border-l-4 border-primary">
        <p className="font-medium text-gray-900">
          General
        </p>
        <p className="text-sm text-gray-600">
          9:00 AM - 6:00 PM
        </p>
      </div>

      <div className="relative mt-10">
        <div className="absolute left-0 right-0 top-[6px] h-[2px] bg-gray-200" />

        <div className="flex justify-between">
          {weekDays.map((item) => (
            <div
              key={item.date}
              className="flex flex-col items-center min-w-[40px]"
            >
              {/* Dot */}
              <div
                className={`w-3 h-3 rounded-full z-10 ${
                  item.active
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
              />

              <span className="mt-3 text-xs text-gray-500">
                {item.day}
              </span>

              <span
                className={`text-sm font-medium ${
                  item.active
                    ? "text-blue-600"
                    : "text-gray-900"
                }`}
              >
                {item.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
    )
}