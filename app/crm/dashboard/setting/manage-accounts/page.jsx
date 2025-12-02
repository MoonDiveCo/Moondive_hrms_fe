import React from "react";

export default function ManageAccountsPage() {
  return (
    <div className="px-6 md:px-8 py-6">
      <div className="min-h-[calc(100vh-4rem)] flex flex-col gap-4">
        <div className="bg-white rounded-2xl border-[0.5px]  border-[#D0D5DD] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Manage Account</h3>
              <ul className="mt-2 flex items-center gap-5 text-sm font-normal text-[#464F60]">
               <li className="pr-3 border-r border-gray-300">Users</li>
  <li className="pr-3 border-r border-gray-300 text-amber-600 font-semibold">Organization Setup</li>
  <li className="pr-3 border-r border-[#D5DBE5] text-primaryText font-normal">User Access Control</li>
  <li className="pr-3 border-r border-[#D5DBE5] text-primaryText font-normal">Manage Service</li>
  <li className="pr-3 border-r border-[#D5DBE5] text-primaryText font-normal">Automation</li>
  <li className="pr-3 border-r border-[#D5DBE5] text-primaryText font-normal">Approvals</li>
  <li className="pr-3  text-primaryText font-normal">Subscription</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-6">
          <aside className="w-64">
            <div className="bg-white h-full rounded-2xl border-[0.3px] border-[#D0D5DD] p-4 overflow-auto">
              <ul className="space-y-3 text-sm">
                <li className="px-3 py-2 text-primaryText rounded hover:bg-gray-50">Overview</li>
                <li className="px-3 py-2 text-primaryText  rounded hover:bg-gray-50">Leads</li>
                <li className="px-3 text-primaryText  py-2 rounded hover:bg-gray-50">Leave Tracker</li>
                <li className="px-3 text-primaryText  py-2 rounded hover:bg-gray-50">Attendance</li>
                <li className="px-3 text-primaryText  py-2 rounded hover:bg-gray-50">Time Tracker</li>
                <li className="px-3 text-primaryText  py-2 rounded hover:bg-gray-50">Performance</li>
                <li className="px-3 text-primaryText  py-2 rounded hover:bg-gray-50">Documents</li>
              </ul>
            </div>
          </aside>


        </div>
      </div>
    </div>
  );
}
