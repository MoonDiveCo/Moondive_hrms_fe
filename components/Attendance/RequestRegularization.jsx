"use client";

export default function RequestRegularization() {
  return (
    <div className="bg-background-light font-display h-screen p-4">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-0"
      />

      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[100vh]">
        <div className="w-full lg:w-5/12 bg-gray-50 p-6 lg:p-8 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200">
          <h3 className="text-gray-900 text-lg font-bold mb-2">Select Date</h3>
          <p className="text-gray-500 text-sm mb-6">
            Choose the date you want to regularize.
          </p>

          <div className="flex flex-col gap-0.5 w-full max-w-[360px] mx-auto">
            <div className="flex items-center justify-between py-2 mb-2">
              <button className="hover:bg-gray-200 rounded-full p-1 transition-colors">
                <span className="material-symbols-outlined text-gray-900 text-[20px]">
                  chevron_left
                </span>
              </button>

              <p className="text-gray-900 text-base font-bold flex-1 text-center">
                October 2023
              </p>

              <button className="hover:bg-gray-200 rounded-full p-1 transition-colors">
                <span className="material-symbols-outlined text-gray-900 text-[20px]">
                  chevron_right
                </span>
              </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-y-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                <p
                  key={d}
                  className="text-gray-500 text-[13px] font-bold flex h-8 items-center justify-center"
                >
                  {d}
                </p>
              ))}

              <span className="h-10 col-start-1" />
              <span className="h-10 col-start-2" />

              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                const isSelected = day === 5;

                return (
                  <button
                    key={day}
                    className={`h-10 w-full text-sm font-medium rounded-full ${
                      isSelected
                        ? "text-white"
                        : "text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    <div
                      className={`flex size-full items-center justify-center ${
                        isSelected
                          ? "bg-primary rounded-full shadow-lg shadow-primary/30"
                          : ""
                      }`}
                    >
                      {day}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">
                info
              </span>
              <div>
                <h4 className="text-gray-900 font-bold text-sm">
                  Policy Reminder
                </h4>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  Regularization requests must be submitted within 3 working
                  days of the discrepancy. Late requests require manager
                  approval.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-7/12 flex flex-col h-full bg-white">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-gray-900 text-xl font-bold">
                Request Regularization
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Submit corrections for 5 Oct, 2023
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <p className="text-gray-700 font-medium pb-2">
                  Revised Clock In
                </p>
                <input
                  type="time"
                  defaultValue="09:00"
                  className="form-input h-14 rounded-lg bg-gray-50 border border-gray-300 focus:ring-primary/50"
                />
              </label>

              <label className="flex flex-col">
                <p className="text-gray-700 font-medium pb-2">
                  Revised Clock Out
                </p>
                <input
                  type="time"
                  defaultValue="18:00"
                  className="form-input h-14 rounded-lg bg-gray-50 border border-gray-300 focus:ring-primary/50"
                />
              </label>
            </div>

            <label className="flex flex-col">
              <p className="text-gray-700 font-medium pb-2">
                Reason for Regularization
              </p>
              <select className="form-select h-14 rounded-lg bg-gray-50 border border-gray-300 focus:ring-primary/50">
                <option disabled defaultValue="">
                  Select a reason
                </option>
                <option>Forgot to Check-in/out</option>
                <option>Technical Issue</option>
                <option>Client Visit / On Duty</option>
                <option>Work from Home</option>
                <option>Other</option>
              </select>
            </label>

            <label className="flex flex-col">
              <p className="text-gray-700 font-medium pb-2">
                Additional Remarks
              </p>
              <textarea
                className="form-textarea min-h-[100px] rounded-lg bg-gray-50 border border-gray-300 focus:ring-primary/50"
                placeholder="Please describe why the regular check-in was missed..."
              />
            </label>

            <div>
              <p className="text-gray-700 font-medium pb-2">
                Supporting Documents{" "}
                <span className="text-gray-400 text-sm">(Optional)</span>
              </p>
              <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer">
                <span className="material-symbols-outlined text-gray-400 text-[32px] mb-2">
                  cloud_upload
                </span>
                <p className="text-sm text-gray-500">
                  <span className="text-primary font-semibold">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-400">
                  SVG, PNG, JPG or PDF (MAX. 5MB)
                </p>
                <input type="file" className="hidden" />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
            <button className="px-6 py-3 rounded-lg text-gray-700 font-bold text-sm hover:bg-gray-200">
              Cancel
            </button>
            <button className="px-6 py-3 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-blue-500/30 active:scale-95">
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
