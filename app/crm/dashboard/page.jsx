"use client";

import { useEffect, useState } from "react";

export default function CRMDashboardPage() {
  const [topLeads, setTopLeads] = useState([]);

  useEffect(() => {
    const fetchTopLeads = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads?page=1&limit=100`
        );
        const data = await res.json();

        const results = Array.isArray(data?.result?.leads)
          ? data.result.leads
          : Array.isArray(data?.result)
          ? data.result
          : [];

        const combined = results.map((lead) => ({
          ...lead,
          leadScore: lead.leadScore || 0,
          firstName: lead.fullName?.split(" ")[0] || lead.firstName || "",
          lastName:
            lead.fullName?.split(" ").slice(1).join(" ") || lead.lastName || "",
        }));

        const sortedTop = [...combined]
          .sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0))
          .slice(0, 10);

        setTopLeads(sortedTop);
      } catch (err) {
        console.error("Error fetching top leads for overview:", err);
      }
    };

    fetchTopLeads();
  }, []);

  const handleSendBulkEmail = (leadsList) => {
    console.log("Send bulk email to:", leadsList);
  };

  return (
    <div className="max-w-full mx-auto px-6 md:px-8 py-6">
      <h2 className="font-semibold text-gray-900 mb-4">Overview</h2>
      {topLeads.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={() => handleSendBulkEmail(topLeads)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Send Bulk Email to Top 10
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TopLeadMetric
              label="Highest Score"
              value={`${topLeads[0]?.leadScore || 0}/100`}
              sublabel={
                topLeads[0]
                  ? `${topLeads[0].firstName} ${topLeads[0].lastName}`
                  : "N/A"
              }
              icon=""
              color="from-blue-400 to-blue-600"
            />
            <TopLeadMetric
              label="Average Score"
              value={`${
                topLeads.length > 0
                  ? Math.round(
                      topLeads.reduce(
                        (sum, l) => sum + (l.leadScore || 0),
                        0
                      ) / topLeads.length
                    )
                  : 0
              }/100`}
              sublabel="Top 10 average"
              color="from-blue-400 to-blue-600"
            />
            <TopLeadMetric
              label="Contacted"
              value={`${topLeads.filter((l) => l.lastEmailSent).length}/${
                topLeads.length
              }`}
              sublabel="Already reached out"
              icon=""
              color="from-blue-400 to-blue-600"
            />
            <TopLeadMetric
              label="Need Action"
              value={topLeads.filter((l) => !l.lastEmailSent).length}
              sublabel="Not contacted yet"
              icon=""
              color="from-red-400 to-red-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TopLeadMetric({ label, value, sublabel, icon, color }) {
  return (
    <div className={`bg-linear-to-br ${color} rounded-lg shadow-sm p-6 text-white`}>
      <div className="flex items-start justify-between mb-2">
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="text-xs opacity-90">{sublabel}</div>
    </div>
  );
}
