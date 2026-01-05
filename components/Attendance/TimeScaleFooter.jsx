export const WORK_START_HOUR = 10; // 10 AM
export const WORK_END_HOUR = 19;   // 7 PM
export const TOTAL_MINUTES =
  (WORK_END_HOUR - WORK_START_HOUR) * 60;
export default function TimeScaleFooter({ inTime, outTime }) {
  const hours = [
    "10AM",
    "11AM",
    "12PM",
    "01PM",
    "02PM",
    "03PM",
    "04PM",
    "05PM",
    "06PM",
    "07PM"
  ];

  return (
    <footer className="sticky bottom-0 left-0 right-0 z-50 bg-white  ">
      <div className="w-full max-w-6xl mx-auto overflow-x-auto">
        <div className="relative flex text-xs justify-between  text-gray-500 px-6 py-2 gap-10">
          {hours.map((h) => (
            <div key={h} className="flex flex-col items-center">
              <span className="font-medium">{h}</span>
              <span className="w-px h-5 bg-gray-300 mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom legend like your image */}
      <div className=" px-6 py-4 text-xs text-gray-700 overflow-x-auto">
        <div className="flex items-center gap-6">
          <LegendItem color="border-yellow-500" label="Payable Days" value="2 Days" />
          <LegendItem color="border-green-400" label="Present" value="0 Days" />
          <LegendItem color="border-purple-400" label="On Duty" value="0 Days" />
          <LegendItem color="border-yellow-400" label="Paid leave" value="0 Days" />
          <LegendItem color="border-sky-400" label="Holidays" value="0 Days" />
          <LegendItem color="border-amber-500" label="Weekend" value="2 Days" />
        </div>
      </div>
    </footer>
  );
}

function LegendItem({
  color,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className={`h-6 border-l-4 ${color}`} />
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-medium text-gray-800">{label}</span>
        <span className="text-[11px] text-gray-500">{value}</span>
      </div>
    </div>
  );
}
