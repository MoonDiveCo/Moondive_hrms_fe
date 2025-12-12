'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function LeadStats({ stats, hideSections = [] }) {
  if (!stats) return null;

  const gradeDistribution = [
    { name: 'Hot', value: stats.hotLeads || 0, color: '#EF4444' },
    { name: 'Warm', value: stats.warmLeads || 0, color: '#F97316' },
    { name: 'Cold', value: stats.coldLeads || 0, color: '#3B82F6' },
    { name: 'Frozen', value: stats.frozenLeads || 0, color: '#9CA3AF' },
  ];

  const sourceDistribution = stats.leadsBySource || [
    { name: 'Popup', value: 0 },
    { name: 'Download', value: 0 },
    { name: 'Chatbot', value: 0 },
    { name: 'Direct', value: 0 },
  ];

  const statusDistribution = stats.leadsByStatus || [
    { name: 'New', value: 0 },
    { name: 'Contacted', value: 0 },
    { name: 'Qualified', value: 0 },
    { name: 'Converted', value: 0 },
    { name: 'Lost', value: 0 },
  ];

  const weeklyTrend = stats.weeklyTrend || [
    { week: 'Week 1', leads: 0 },
    { week: 'Week 2', leads: 0 },
    { week: 'Week 3', leads: 0 },
    { week: 'Week 4', leads: 0 },
  ];

  const totalLeads = stats.totalLeads || 0;
  const conversionFunnel = [
    { stage: 'Total Leads', count: totalLeads, percentage: 100 },
    {
      stage: 'Contacted',
      count: stats.contactedLeads || 0,
      percentage:
        totalLeads > 0
          ? Math.round(((stats.contactedLeads || 0) / totalLeads) * 100)
          : 0,
    },
    {
      stage: 'Qualified',
      count: stats.qualifiedLeads || 0,
      percentage:
        totalLeads > 0
          ? Math.round(((stats.qualifiedLeads || 0) / totalLeads) * 100)
          : 0,
    },
    {
      stage: 'Converted',
      count: stats.convertedLeads || 0,
      percentage:
        totalLeads > 0
          ? Math.round(((stats.convertedLeads || 0) / totalLeads) * 100)
          : 0,
    },
  ];

  // small helper for checking hideSections
  const isHidden = (key) => hideSections.includes(key);

  return (
    <div className="space-y-6">
      <h4 className="font-bold text-primary-100/80">Analytics & Insights</h4>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Lead Grade Distribution (always shown) */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Lead Grade Distribution
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {gradeDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Source Distribution (always shown) */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Lead Sources
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourceDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        {!isHidden('trend') && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Lead Trend
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Lead Status Distribution */}
        {!isHidden('status') && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Lead Status
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Conversion Funnel */}
      {!isHidden('funnel') && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">
            Conversion Funnel
          </h4>
          <div className="space-y-4">
            {conversionFunnel.map((stage, index) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {stage.stage}
                  </span>
                  <span className="text-sm text-gray-600">
                    {stage.count} leads ({stage.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 relative">
                  <div
                    className="h-8 rounded-full transition-all duration-500 flex items-center justify-center text-white font-medium text-sm"
                    style={{
                      width: `${stage.percentage}%`,
                      backgroundColor:
                        index === 0
                          ? '#3B82F6'
                          : index === 1
                          ? '#8B5CF6'
                          : index === 2
                          ? '#10B981'
                          : '#059669',
                      minWidth: stage.percentage > 0 ? '60px' : '0',
                    }}
                  >
                    {stage.percentage > 0 && `${stage.percentage}%`}
                  </div>
                  {stage.percentage === 0 && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      0%
                    </span>
                  )}
                </div>
                {index < conversionFunnel.length - 1 && (
                  <div className="flex justify-center my-2">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights */}
      {!isHidden('insights') && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Key Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InsightCard
              title="Conversion Rate"
              value={
                totalLeads > 0
                  ? `${((stats.convertedLeads || 0) / totalLeads * 100).toFixed(
                      1
                    )}%`
                  : '0%'
              }
              description="Leads converted to customers"
            />
            <InsightCard
              title="Hot Lead Rate"
              value={`${stats.hotLeadsPercentage || 0}%`}
              description="High-quality leads"
            />
            <InsightCard
              title="Avg Response Time"
              value={stats.averageResponseTime || 'N/A'}
              description="Time to first contact"
            />
            <InsightCard
              title="Most Popular Source"
              value={
                sourceDistribution.length > 0
                  ? sourceDistribution.reduce((max, item) =>
                      item.value > max.value ? item : max
                    , sourceDistribution[0]).name
                  : 'N/A'
              }
              description="Best performing channel"
            />
            <InsightCard
              title="Week-over-Week"
              value={`${
                (stats.weekOverWeekGrowth || 0) > 0 ? '+' : ''
              }${stats.weekOverWeekGrowth || 0}%`}
              description="Lead growth rate"
            />
            <InsightCard
              title="Contact Rate"
              value={
                totalLeads > 0
                  ? `${((stats.contactedLeads || 0) / totalLeads * 100).toFixed(
                      1
                    )}%`
                  : '0%'
              }
              description="Leads contacted"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({ title, value, description }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}
