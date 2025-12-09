'use client'

import { useEffect, useState } from 'react';
import { EnhancedTableShimmer } from '@/components/UI/ShimmerComponents';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import AdvancedGenAI from '@/components/GenAIVisibility/AdvancedGenAI';
import axios from 'axios';

const GenAIVisibility = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [topQueries, setTopQueries] = useState([]);
  const [queriesMeta, setQueriesMeta] = useState(null);
  const [platformPerformance, setPlatformPerformance] = useState([]);
  const [geoDistribution, setGeoDistribution] = useState([]);
  const [selectedDays, setSelectedDays] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, [selectedDays]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [dashboard, daily, queries, performance, geo] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/ai-analytics/dashboard?days=${selectedDays}`),
        axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/ai-analytics/daily-trend?days=${selectedDays}`),
        axios.get( `${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/ai-analytics/top-queries?days=${selectedDays}&limit=20`),
        axios.get( `${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/ai-analytics/platform-performance?days=${selectedDays}`),
        axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/ai-analytics/geographic-distribution?days=${selectedDays}`),
      ]);

      setDashboardData(dashboard?.data?.result);
      setDailyTrend(daily?.data?.result || []);
      
      // Handle queries response - backend returns { data: [...], dataType, hasActualQueries, message }
      const queriesResult = queries?.data?.result || null;
      let finalQueries = [];
      let finalMeta = null;
      
      if (!queriesResult) {
        // No data at all
        finalQueries = [];
        finalMeta = null;
      } else if (Array.isArray(queriesResult)) {
        // Old format - just array
        finalQueries = queriesResult;
        finalMeta = null;
      } else if (queriesResult.data !== undefined) {
        // New format - object with metadata { data: [...], dataType, hasActualQueries, message }
        finalQueries = Array.isArray(queriesResult.data) ? queriesResult.data : [];
        finalMeta = {
          dataType: queriesResult.dataType || 'pages',
          hasActualQueries: queriesResult.hasActualQueries || false,
          message: queriesResult.message || 'Query data'
        };
      } else {
        // Fallback: treat as array
        finalQueries = Array.isArray(queriesResult) ? queriesResult : [];
        finalMeta = null;
      }
      
      setTopQueries(finalQueries);
      setQueriesMeta(finalMeta);
      
      // Debug logging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('Queries API response:', queriesResult);
        console.log('Final queries:', finalQueries);
        console.log('Final meta:', finalMeta);
      }
      
      setPlatformPerformance(performance?.data?.result || []);
      setGeoDistribution(geo?.data?.result || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPlatformColor = (platform) => {
    const colors = {
      ChatGPT: '#10a37f',
      Gemini: '#4285f4',
      Claude: '#cc785c',
      Perplexity: '#1fb8cd',
      'Meta AI': '#0668E1',
      'Bing AI': '#008373',
      'Brave AI': '#FB542B',
      'You.com': '#6B4FFF',
    };
    return colors[platform] || '#6b7280';
  };

  const CHART_COLORS = ['#10a37f', '#4285f4', '#cc785c', '#1fb8cd', '#0668E1', '#008373', '#FB542B', '#6B4FFF'];

  const exportToCSV = () => {
    const csvRows = [];
    csvRows.push(['Gen AI Visibility Report - Enhanced']);
    csvRows.push([`Period: Last ${selectedDays} days`]);
    csvRows.push([`Generated: ${new Date().toLocaleDateString()}`]);
    csvRows.push([]);

    csvRows.push(['Total AI Queries', dashboardData?.totalQueries?.total || 0, `${dashboardData?.totalQueries?.percentageChange || 0}%`]);
    csvRows.push([]);

    csvRows.push(['Top Search Queries']);
    csvRows.push(['Query', 'Count', 'Trend', 'Change %', 'Platforms']);
    topQueries?.forEach(q => {
      csvRows.push([q.query, q.count, q.trend, `${q.percentageChange}%`, q.platforms?.join(', ')]);
    });
    csvRows.push([]);

    csvRows.push(['Platform Performance']);
    csvRows.push(['Platform', 'Requests', 'Avg Response Time (ms)', 'Unique Pages', 'Success Rate %']);
    platformPerformance?.forEach(p => {
      csvRows.push([p.platform, p.totalRequests, p.avgResponseTime, p.uniquePages, p.successRate]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gen-ai-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <EnhancedTableShimmer />;
  }

  if (!dashboardData) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const { lastCrawled, totalQueries, topPages, trafficByPlatform } = dashboardData;

  // Prepare data for platform pie chart
  const platformPieData = trafficByPlatform?.map((item, index) => ({
    name: item.platform,
    value: item.count,
    color: getPlatformColor(item.platform),
  })) || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className=" text-primaryText">Gen AI Visibility Analytics</h4>
          <p className="text-sm text-primaryText mt-1">Track how AI platforms discover and interact with your content</p>
        </div>
        {activeTab !== 'advanced-gen-ai' &&
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-primary text-white rounded-full font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
          >
            Export CSV
          </button>
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="px-4 py-2 border border-primary rounded-full bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {['overview', 'queries', 'platforms', 'geography', 'advanced-gen-ai'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-primaryText hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Queries Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total AI Queries</p>
                  <h2 className="text-4xl font-bold text-gray-900">{totalQueries?.total || 0}</h2>
                </div>
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    totalQueries?.trend === 'up'
                      ? 'bg-green-100 text-green-700'
                      : totalQueries?.trend === 'down'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {totalQueries?.trend === 'up' && '↑'}
                  {totalQueries?.trend === 'down' && '↓'}
                  {totalQueries?.trend === 'stable' && '−'}
                  {Math.abs(totalQueries?.percentageChange || 0)}%
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                vs previous {selectedDays} days
              </p>
            </div>

            {/* Active Platforms */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Active AI Platforms</p>
              <h2 className="text-4xl font-bold text-gray-900">
                {trafficByPlatform?.filter(p => p.isActive).length || 0}
              </h2>
              <p className="text-xs text-gray-500 mt-2">
                Platforms crawled in last 48h
              </p>
            </div>

            {/* Unique Pages */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Unique Pages Visited</p>
              <h2 className="text-4xl font-bold text-gray-900">{topPages?.length || 0}</h2>
              <p className="text-xs text-gray-500 mt-2">
                Pages discovered by AI
              </p>
            </div>
          </div>

          {/* Daily Trend Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
            <h4 className=" text-primaryText mb-4">Daily Traffic Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyTrend}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4285f4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4285f4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="total" stroke="#4285f4" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h4 className="text-primaryText mb-4">Traffic by Platform</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Platform List */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h4 className="text-primaryText mb-4">Platform Breakdown</h4>
              <div className="space-y-3">
                {trafficByPlatform && trafficByPlatform.length > 0 ? (
                  trafficByPlatform.map((item) => (
                    <div key={item.platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getPlatformColor(item.platform) }}
                        />
                        <span className="text-sm font-medium text-gray-900">{item.platform}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Last Crawled */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
            <h4 className="text-primaryText mb-4">Last Crawled by Platform</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {lastCrawled?.map((item) => (
                <div
                  key={item.platform}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getPlatformColor(item.platform) }}
                    />
                    <p className="text-sm font-medium text-gray-900">{item.platform}</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    {formatDate(item.lastCrawled)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h4 className=" text-primaryText mb-4">Top Pages by AI Traffic</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Page</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Views</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trend</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Platforms</th>
                  </tr>
                </thead>
                <tbody>
                  {topPages?.length > 0 ? (
                    topPages.map((page, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900">{page.path}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{page.count}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              page.trend === 'up'
                                ? 'bg-green-100 text-green-700'
                                : page.trend === 'down'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {page.trend === 'up' && '↑'}
                            {page.trend === 'down' && '↓'}
                            {page.trend === 'stable' && '−'}
                            {Math.abs(page.percentageChange || 0)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {page.platforms?.map((platform) => (
                              <div
                                key={platform}
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getPlatformColor(platform) }}
                                title={platform}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-sm text-gray-500">
                        No data available for the selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Queries Tab */}
      {activeTab === 'queries' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-primaryText">Search Queries & Keywords</h4>
              <p className="text-sm text-gray-600 mt-1">
                Keywords and search queries that AI platforms used to discover your content
              </p>
            </div>
          </div>
          
          {queriesMeta && !queriesMeta.hasActualQueries && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-amber-600 text-xl flex-shrink-0">ℹ️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900 mb-1">
                    Showing Most Visited Pages (Fallback Mode)
                  </p>
                  <p className="text-sm text-amber-700">
                    {queriesMeta.message || 'No query data is available yet. As AI platforms start using search terms to discover your content, actual queries will appear here. Currently showing the most frequently visited pages.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Search Query</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Count</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trend</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">AI Platforms</th>
                </tr>
              </thead>
              <tbody>
                {topQueries?.length > 0 ? (
                  topQueries.map((query, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-500">#{index + 1}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{query.query}</td>
                      <td className="py-3 px-4 text-sm font-bold text-gray-900">{query.count}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            query.trend === 'up'
                              ? 'bg-green-100 text-green-700'
                              : query.trend === 'down'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {query.trend === 'up' && '🔥 ↑'}
                          {query.trend === 'down' && '↓'}
                          {query.trend === 'stable' && '−'}
                          {Math.abs(query.percentageChange || 0)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          {query.platforms?.map((platform) => (
                            <span
                              key={platform}
                              className="px-2 py-1 text-xs rounded-full font-medium"
                              style={{
                                backgroundColor: getPlatformColor(platform) + '20',
                                color: getPlatformColor(platform),
                              }}
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-sm text-gray-500">
                      No search queries tracked yet. Queries will appear as AI platforms discover your content.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Platforms Tab */}
      {activeTab === 'platforms' && (
        <div className="space-y-6">
          {/* Performance Metrics Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h4 className=" text-primaryText mb-4">Platform Performance Comparison</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={platformPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="platform" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="totalRequests" fill="#4285f4" name="Total Requests" />
                <Bar dataKey="uniquePages" fill="#10a37f" name="Unique Pages" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Platform Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Platform Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Platform</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Requests</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Unique Pages</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg Response Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {platformPerformance?.length > 0 ? (
                    platformPerformance.map((platform, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getPlatformColor(platform.platform) }}
                            />
                            <span className="text-sm font-medium text-gray-900">{platform.platform}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-900">{platform.totalRequests}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{platform.uniquePages}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{platform.avgResponseTime}ms</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              platform.successRate >= 95
                                ? 'bg-green-100 text-green-700'
                                : platform.successRate >= 80
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {platform.successRate}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-sm text-gray-500">
                        No platform performance data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Geography Tab */}
      {activeTab === 'geography' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h4 className="text-primaryText mb-4">Geographic Distribution</h4>
          <p className="text-sm text-gray-600 mb-6">
            Countries where AI platforms are accessing your content from
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={geoDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#666" fontSize={12} />
                  <YAxis dataKey="country" type="category" stroke="#666" fontSize={12} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#4285f4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="space-y-3">
                {geoDistribution?.length > 0 ? (
                  geoDistribution.map((geo, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{geo.country || 'Unknown'}</p>
                        <div className="flex gap-1 mt-1">
                          {geo.platforms?.map((platform) => (
                            <div
                              key={platform}
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getPlatformColor(platform) }}
                              title={platform}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{geo.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No geographic data available yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

       {activeTab === 'advanced-gen-ai' && (
        <AdvancedGenAI />
      )}
    </div>
  );
};

export default GenAIVisibility;
