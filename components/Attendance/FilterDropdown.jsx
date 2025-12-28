"use client";

import { SlidersHorizontal } from "lucide-react";

export default function FilterDropdown({
  value,
  onChange,
}) {
  return (
    <div className="relative">
      <details className="group">
        <summary className="list-none cursor-pointer p-2 rounded-lg border bg-white text-gray-600">
          <SlidersHorizontal size={18} />
        </summary>

        <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow z-10">
          <button
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
              value === "week" ? "font-semibold" : ""
            }`}
            onClick={() => onChange("week")}
          >
            Weekly
          </button>
          <button
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
              value === "month" ? "font-semibold" : ""
            }`}
            onClick={() => onChange("month")}
          >
            Monthly
          </button>
        </div>
      </details>
    </div>
  );
}
