import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import axios from 'axios';
import FilterDropdown from '../UI/FilterDropdown';

const Modal = ({ isOpen, onClose, onConfirm, message, title, isConfirming }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-500 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <h2 className="text-lg font-semibold mb-4 text-primary-50">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className={`px-4 py-2 rounded-lg ${isConfirming ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            {isConfirming ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};


export default function OverviewTab({ dashboardData, filters, setFilters }) {
  const [healthData, setHealthData] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [tokensUsed, setTokensUsed] = useState(0);
  const [canRefresh, setCanRefresh] = useState(true);
  const [nextAllowedTime, setNextAllowedTime] = useState(null);
  
    useEffect(() => {
      const lastRefresh = localStorage.getItem('lastMetricsUpdate');
      if (lastRefresh) {
        const nextTime = new Date(Number(lastRefresh) + 24 * 60 * 60 * 1000); 
        setNextAllowedTime(nextTime);
        if (Date.now() < nextTime) {
          setCanRefresh(false);
        }
      }
    }, []);
  
    const handleRefresh = () => {
      if (!canRefresh) return;
  
      handleStartAnalysis();
  
      localStorage.setItem('lastMetricsUpdate', Date.now().toString());
      const nextTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      setNextAllowedTime(nextTime);
      setCanRefresh(false);
    };
  
  const remainingHours = nextAllowedTime ? Math.ceil((nextAllowedTime - Date.now()) / (1000 * 60 * 60)) : 0;
  const remainingMinutes = nextAllowedTime ? Math.ceil((nextAllowedTime - Date.now()) / (1000 * 60)) : 0;

  useEffect(() => {
    fetchHealthScore();
  }, []);

  const fetchHealthScore = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/ai-content/health-score`);
      const data = response.data;
      if (data.responseCode === 200) {
        setHealthData(data.result);
      }
    } catch (error) {
      console.error('Failed to fetch health score:', error);
    } finally {
      setLoadingHealth(false);
    }
  };
  

  const handleStartAnalysis = () => {
  setShowConfirmModal(true);
  setModalMessage('This will re-analyze all existing pages with enhanced detection. This may take several minutes. Do you want to continue?');
  setShowCompleteModal(false);  
};

const handleConfirmAnalysis  = async () => {
  setShowConfirmModal(false); 

  setReanalyzing(true);
  setProgress({ processed: 0, total: 0 });

  try {
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API}/ai-content/reanalyze-existing`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.processed !== undefined && data.total !== undefined) {
        setProgress({ processed: data.processed, total: data.total });
      }

      if (data.completed) {
        setTokensUsed(data.tokens || 0); 
        eventSource.close();
        setShowCompleteModal(true);
        setModalMessage(`Re-analysis complete!\n\nSuccessful: ${data.successful}\nFailed: ${data.failed}\n\nTokens used: ${data.tokens}\n\nHealth metrics will now show updated data.`);

        fetchHealthScore()
          .catch(err => console.error('Error refreshing health score:', err))
          .finally(() => setReanalyzing(false));
      }

      if (data.error) {
        eventSource.close();
        alert(`Error: ${data.error}`);
        setReanalyzing(false);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Error in SSE:', error);
      eventSource.close();
      alert('Failed to connect to server for live updates.');
      setReanalyzing(false);
    };
  } catch (error) {
    console.error('Failed to re-analyze pages:', error);
    alert('Failed to re-analyze pages. Check console for details.');
    setReanalyzing(false);
  }
};


  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (direction) => {
    if (direction === 'improving') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (direction === 'declining') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading overview data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Content Health Score Section */}
      {!loadingHealth && healthData && healthData.totalPages > 0 && (
        <div className="bg-gradient-to-br from-blue-50 via-primary/20 to-pink-50 rounded-xl p-6 border border-primary shadow-lg">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h4 className=" text-primaryText">Overall Content Health Score</h4>
                <button
                  onClick={handleRefresh}
                  disabled={reanalyzing || !canRefresh}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    reanalyzing && canRefresh
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 text-white'
                  }  ${
                    canRefresh
                      ? 'bg-primary text-white'
                      : 'bg-gray-400 cursor-not-allowed text-white'
                  }` }
                >
                  {reanalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Re-analyzing... {progress.processed} of {progress.total} pages
                    </>
                  ) : (
                    <>
                      <span className='flex text-xs item-center gap-2'><RefreshCw className="w-4 h-4" />
                       {canRefresh
                        ? 'Update Metrics'
                        : `Available in ${remainingHours} hour${remainingHours === 1 ? '' : 's'}`}</span>
                    </>
                  )}
                </button>
              </div>
              {tokensUsed > 0 && !reanalyzing && (
              <div className="text-sm text-gray-600 mt-2">
                Tokens used in last analysis: <span className="font-semibold">{tokensUsed.toLocaleString()}</span>
              </div>
            )}
              <p className="text-sm text-gray-600">
                Site-wide AI-friendliness based on {healthData.totalPages} analyzed pages
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className={`text-6xl font-black ${getHealthColor(healthData.overallHealthScore)}`}>
                {healthData.overallHealthScore}
              </div>
              <div className="text-lg text-gray-500 font-semibold">/ 100</div>
              {healthData.trend && (
                <div className="flex items-center gap-1 mt-2 bg-white px-3 py-1 rounded-full">
                  {getTrendIcon(healthData.trend.direction)}
                  <span className={`text-sm font-bold ${
                    healthData.trend.direction === 'improving' ? 'text-green-600' :
                    healthData.trend.direction === 'declining' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {healthData.trend.percentage > 0 ? '+' : ''}{healthData.trend.percentage}% (30d)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Score Distribution */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border-2 border-green-200">
              <div className="text-3xl font-bold text-green-600">
                {healthData.metrics.scoreDistribution.excellent.count}
              </div>
              <div className="text-xs font-semibold text-gray-700 mt-1">Excellent (80+)</div>
              <div className="text-xs text-gray-500 mt-1">{healthData.metrics.scoreDistribution.excellent.percentage}% of pages</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border-2 border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600">
                {healthData.metrics.scoreDistribution.good.count}
              </div>
              <div className="text-xs font-semibold text-gray-700 mt-1">Good (60-79)</div>
              <div className="text-xs text-gray-500 mt-1">{healthData.metrics.scoreDistribution.good.percentage}% of pages</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border-2 border-red-200">
              <div className="text-3xl font-bold text-red-600">
                {healthData.metrics.scoreDistribution.needsWork.count}
              </div>
              <div className="text-xs font-semibold text-gray-700 mt-1">Needs Work (&lt;60)</div>
              <div className="text-xs text-gray-500 mt-1">{healthData.metrics.scoreDistribution.needsWork.percentage}% of pages</div>
            </div>
          </div>

          {/* Coverage Metrics */}
          <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Coverage Metrics</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Structured Data (Schema.org)</span>
                  <span className="font-bold text-gray-900">{healthData.metrics.coverage.structuredData}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${healthData.metrics.coverage.structuredData}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">FAQ Sections</span>
                  <span className="font-bold text-gray-900">{healthData.metrics.coverage.faqSections}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-purple-500 h-3 rounded-full transition-all" style={{ width: `${healthData.metrics.coverage.faqSections}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Executive Summaries</span>
                  <span className="font-bold text-gray-900">{healthData.metrics.coverage.executiveSummary}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${healthData.metrics.coverage.executiveSummary}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Recommendations */}
          {healthData.recommendations && healthData.recommendations.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Top Action Items
              </h4>
              <div className="space-y-3">
                {healthData.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    rec.priority === 'high' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                  }`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-900">{rec.category}</div>
                        <div className="text-sm text-gray-700 mt-1">{rec.issue}</div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                        rec.priority === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      {rec.action}
                    </div>
                    <div className="text-xs text-gray-500 italic">{rec.impact}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top 5 Pages to Optimize */}
      {!loadingHealth && healthData && healthData.topPagesToOptimize && healthData.topPagesToOptimize.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            Top 5 Pages to Optimize Today
          </h3>
          <div className="space-y-3">
            {healthData.topPagesToOptimize.map((page, index) => (
              <div key={index} className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-black text-gray-300">#{index + 1}</span>
                      <h4 className="text-sm font-bold text-gray-900 truncate">{page.title}</h4>
                    </div>
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-3 truncate"
                    >
                      {page.url}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                    {page.topSuggestions && page.topSuggestions.length > 0 && (
                      <ul className="text-xs text-gray-600 space-y-1">
                        {page.topSuggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <div className="text-3xl font-black text-red-600">{page.currentScore}</div>
                    <div className="text-xs text-gray-500 font-medium">Current</div>
                    <div className="text-sm text-green-600 font-bold mt-2 bg-green-50 px-2 py-1 rounded">
                      +{page.potentialGain} gain
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Filter */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
        <label className="text-sm font-medium text-gray-700">Time Period:</label>
        <FilterDropdown
          label="Last 7 days"
          value={filters.days}
          options={[
            { label: "Last 7 days", value: 7 },
            { label: "Last 30 days", value: 30 },
            { label: "Last 90 days", value: 90 },
            { label: "Last year", value: 365 },
          ]}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              days: Number(value),
            }))
          }
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Citation Trends Chart */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Citation Trends</h3>
          {dashboardData.citationTrends && dashboardData.citationTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dashboardData.citationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="citations" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
              No citation data available
            </div>
          )}
        </div>

        {/* Top Content Performance */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Top Performing Content</h3>
          {dashboardData.topContent && dashboardData.topContent.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.topContent} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="title"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={10}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="score" fill="#10a37f" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
              No content performance data available
            </div>
          )}
        </div>
          </div>
          <div className='grid grid-cols-1'>
        {/* Content Gap Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Content Gap Types</h3>
          {dashboardData.contentGaps && dashboardData.contentGaps.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData.contentGaps}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={window.innerWidth < 640 ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.contentGaps.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
              No content gap data available
            </div>
          )}
        </div>

        {/* Most Cited Content */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Most Cited Content</h3>
          {dashboardData.mostCited && dashboardData.mostCited.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {dashboardData.mostCited.slice(0, 5).map((content, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-gray-50 rounded-lg gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {content.title || 'Untitled'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {content.url}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-blue-600 flex-shrink-0">
                    {typeof content.citations === 'object' ? content.citations.totalCitations || 0 : content.citations} citations
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
              No citation data available
            </div>
          )}
        </div></div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button className="p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
            <div className="text-xs sm:text-sm font-medium text-gray-700">Analyze New Content</div>
            <div className="text-xs text-gray-500 mt-1">Add a new URL for AI analysis</div>
          </button>
          <button className="p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center">
            <div className="text-xs sm:text-sm font-medium text-gray-700">Bulk Analysis</div>
            <div className="text-xs text-gray-500 mt-1">Analyze multiple URLs at once</div>
          </button>
          <button className="p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center">
            <div className="text-xs sm:text-sm font-medium text-gray-700">Export Report</div>
            <div className="text-xs text-gray-500 mt-1">Download performance report</div>
          </button>
        </div>
      </div>
      <Modal
      isOpen={showConfirmModal}
      onClose={() => setShowConfirmModal(false)}
      onConfirm={handleConfirmAnalysis}
      message={modalMessage}
      title="Confirm Re-analysis"
      isConfirming={reanalyzing}
    />

    {/* Completion Modal */}
    <Modal
      isOpen={showCompleteModal}
      onClose={() => setShowCompleteModal(false)}
      onConfirm={() => setShowCompleteModal(false)}
      message={modalMessage}
      title="Analysis Complete"
      isConfirming={false}
    />
    </div>
  );
}
