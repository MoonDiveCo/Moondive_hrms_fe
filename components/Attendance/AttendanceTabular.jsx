export default function AttendanceTabular() {
  const rows = [
    {
      date: "Sun, 28-Dec-2025",
      firstIn: "-",
      lastOut: "-",
      totalHours: "-",
      payableHours: "08:00",
      status: "Weekend",
      shift: "General",
    },
    {
      date: "Mon, 29-Dec-2025",
      firstIn: "-",
      lastOut: "-",
      totalHours: "-",
      payableHours: "-",
      status: "",
      shift: "General",
    },
    {
      date: "Tue, 30-Dec-2025",
      firstIn: "-",
      lastOut: "-",
      totalHours: "-",
      payableHours: "-",
      status: "",
      shift: "General",
    },
    {
      date: "Wed, 31-Dec-2025",
      firstIn: "-",
      lastOut: "-",
      totalHours: "-",
      payableHours: "-",
      status: "",
      shift: "General",
    },
    {
      date: "Thu, 01-Jan-2026",
      firstIn: "-",
      lastOut: "-",
      totalHours: "-",
      payableHours: "-",
      status: "",
      shift: "General",
    },
  ];

  return (
    <div className="p-6">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full border-collapse bg-white">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Date",
                "First In",
                "Last Out",
                "Total Hours",
                "Payable Hours",
                "Status",
                "Shift(s)",
                "Regularization",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >
                <td className="px-4 py-4 text-sm text-gray-800">
                  {row.date}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {row.firstIn}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {row.lastOut}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {row.totalHours}
                </td>
                <td className="px-4 py-4 text-sm text-gray-800">
                  {row.payableHours}
                </td>
                <td className="px-4 py-4 text-sm text-gray-800">
                  {row.status && (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 rounded bg-yellow-300" />
                      {row.status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-800">
                  {row.shift}
                </td>
                <td className="px-4 py-4 text-sm text-gray-400">
                  {/* Empty column */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
