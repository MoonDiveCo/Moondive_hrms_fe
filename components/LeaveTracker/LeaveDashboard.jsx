'use client';

import React, { useState } from 'react';

export default function LeaveTrackerDashboard() {

  return (
    <div className="">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
            <div className="space-y-6">
              {/* Leave Balance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LeaveCard
                  title="Annual Leave"
                  value="8 Days"
                  subtitle="Out of 12"
                />
                <LeaveCard
                  title="Sick Leave"
                  value="4 Days"
                  subtitle="Out of 6"
                />
                <LeaveCard
                  title="Casual Leave"
                  value="2 Days"
                  subtitle="Out of 4"
                />
              </div>

              {/* Upcoming Leave */}
              <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-[#0D1B2A] mb-2">
                  Upcoming Leave
                </h4>
                <p className="text-sm text-gray-600">
                  You have planned leave from{' '}
                  <b>24 Dec 2024</b> to <b>2 Jan 2025</b>.
                </p>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-[#0D1B2A] mb-3">
                  Recent Activity
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Sick leave approved (12 Dec 2024)</li>
                  <li>• Annual leave requested (24 Dec 2024)</li>
                  <li>• Casual leave rejected (5 Dec 2024)</li>
                </ul>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}


function LeaveCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold text-[#0D1B2A] mt-1">
        {value}
      </div>
      <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
    </div>
  );
}
