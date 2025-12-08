// app/dashboard/page.jsx
"use client"
import React from "react";


export default function HRMSDashboardPage() {
    
  return (
    <div className="max-w-full mx-auto px-6 md:px-8 py-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Total Employees</h3>
          <p className="text-2xl font-bold mt-3">1,254</p>
          <p className="text-xs text-gray-400 mt-1">Updated 2 hours ago</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Attendance Today</h3>
          <p className="text-2xl font-bold mt-3">1,050</p>
          <p className="text-xs text-gray-400 mt-1">Present / On time</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Pending Requests</h3>
          <p className="text-2xl font-bold mt-3">12</p>
          <p className="text-xs text-gray-400 mt-1">Approvals needed</p>
        </div>
      </div>

      <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-100 p-6">Recent activity / charts</div>
        <div className="bg-white rounded-lg border border-gray-100 p-6">Quick actions</div>
      </section>
    </div>
  );
}
