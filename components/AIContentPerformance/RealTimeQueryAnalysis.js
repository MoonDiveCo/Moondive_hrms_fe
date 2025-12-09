'use client';

import { useEffect, useState } from 'react';
import { EnhancedTableShimmer } from '@/components/UI/ShimmerComponents';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

const RealTimeQueryAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [queryClusters, setQueryClusters] = useState([]);
  const [selectedHours, setSelectedHours] = useState(24);

  useEffect(() => {
    fetchAnalysis();
  }, [selectedHours]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const [analysis, clusters] = await Promise.all([
        axios.get( `${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/ai-analytics/real-time-analysis?hours=${selectedHours}`),
        axios.get( `${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/ai-analytics/query-clusters?hours=${selectedHours}`),
      ]);

      setAnalysisData(analysis?.data?.result);
      setQueryClusters(clusters?.data?.result || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching real-time analysis:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#10a37f', '#4285f4', '#cc785c', '#1fb8cd', '#0668E1', '#008373'];

  if (loading) {
    return <EnhancedTableShimmer />;
  }

  if (!analysisData) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const { intentBreakdown, trendingQueries, contentGaps, platformBreakdown, recentActivity, recommendations } = analysisData;

  // Prepare intent data for pie chart
  const intentChartData = Object.entries(intentBreakdown || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: value.count || 0,
    percentage: value.percentage || 0
  }));

  // Prepare trending queries for bar chart
  const trendingChartData = trendingQueries.slice(0, 10).map((q, index) => ({
    name: q.query.length > 30 ? q.query.substring(0, 30) + '...' : q.query,
    count: q.count,
    trendScore: Math.round(q.trendScore * 100)
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Query Analysis</h2>
          <p className="text-gray-600 mt-1">Live insights into AI query patterns</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedHours}
            onChange={(e) => setSelectedHours(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>Last Hour</option>
            <option value={6}>Last 6 Hours</option>
            <option value={24}>Last 24 Hours</option>
            <option value={48}>Last 48 Hours</option>
            <option value={168}>Last 7 Days</option>
          </select>
          <button
            onClick={fetchAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Queries</p>
          <h3 className="text-3xl font-bold text-gray-900">{analysisData.totalQueries || 0}</h3>
          <p className="text-xs text-gray-500 mt-2">In last {selectedHours}h</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Unique Queries</p>
          <h3 className="text-3xl font-bold text-gray-900">{recentActivity?.last24Hours?.uniqueQueries || 0}</h3>
          <p className="text-xs text-gray-500 mt-2">Different questions</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Active Platforms</p>
          <h3 className="text-3xl font-bold text-gray-900">{recentActivity?.last24Hours?.platforms || 0}</h3>
          <p className="text-xs text-gray-500 mt-2">AI platforms querying</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Content Gaps</p>
          <h3 className="text-3xl font-bold text-gray-900">{contentGaps?.length || 0}</h3>
          <p className="text-xs text-gray-500 mt-2">Opportunities identified</p>
        </div>
      </div>

      {/* Intent Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Query Intent Breakdown</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={intentChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {intentChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {Object.entries(intentBreakdown || {}).map(([key, value], index) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-900">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{value.count || 0}</div>
                  <div className="text-sm text-gray-500">{value.percentage || 0}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Queries */}
      {trendingQueries && trendingQueries.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Queries</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={trendingChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4285f4" name="Query Count" />
              <Bar dataKey="trendScore" fill="#10a37f" name="Trend Score" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {trendingQueries.slice(0, 5).map((q, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{q.query}</p>
                  <p className="text-sm text-gray-500">
                    {q.count} times • {q.platforms.join(', ')}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  🔥 Trending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Gaps */}
      {contentGaps && contentGaps.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Gaps (High Opportunity)</h3>
          <div className="space-y-3">
            {contentGaps.map((gap, index) => (
              <div
                key={index}
                className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{gap.query}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Searched {gap.frequency} times • {gap.platforms.join(', ')}
                    </p>
                    <p className="text-sm text-orange-700 mt-2 font-medium">
                      Opportunity: {gap.opportunity === 'high' ? 'HIGH' : 'MEDIUM'} — No relevant content found
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'critical'
                    ? 'border-red-500 bg-red-50'
                    : rec.priority === 'high'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          rec.priority === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : rec.priority === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{rec.type}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                    <p className="text-sm font-medium text-gray-900 mt-2">💡 {rec.action}</p>
                    <p className="text-xs text-gray-600 mt-1">Impact: {rec.impact}</p>
                    {rec.gaps && rec.gaps.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Top Gap Queries:</p>
                        <ul className="list-disc list-inside text-xs text-gray-600">
                          {rec.gaps.map((gap, i) => (
                            <li key={i}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Query Clusters */}
      {queryClusters && queryClusters.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Query Themes & Clusters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {queryClusters.map((cluster, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{cluster.theme}</h4>
                  <span className="text-sm text-gray-500">{cluster.percentage}%</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {cluster.queryCount} queries • {cluster.uniqueQueries.length} unique
                </p>
                <div className="space-y-1">
                  {cluster.uniqueQueries.slice(0, 3).map((query, i) => (
                    <p key={i} className="text-xs text-gray-500">• {query}</p>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Platforms: {cluster.platforms.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeQueryAnalysis;

