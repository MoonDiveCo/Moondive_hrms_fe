import React, { useEffect, useState } from 'react';
import { ExternalLink, Eye, Plus, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import FilterDropdown from '../UI/FilterDropdown';

export default function ContentScoresTab({ contentScores, filters, setFilters, pagination, setPagination, onRefresh, onViewDetails }) {
    const [canRefresh, setCanRefresh] = useState(true);
  const [nextAllowedTime, setNextAllowedTime] = useState(null);

  useEffect(() => {
    const lastRefresh = localStorage.getItem('lastContentScoresRefresh');
    if (lastRefresh) {
      const nextTime = new Date(Number(lastRefresh) +  24 * 60 * 60 * 1000); 
      setNextAllowedTime(nextTime);
      if (Date.now() < nextTime) {
        setCanRefresh(false);
      }
    }
  }, []);

  const handleRefresh = () => {
    if (!canRefresh) return;

    onRefresh();

    localStorage.setItem('lastContentScoresRefresh', Date.now().toString());
    const nextTime = new Date(Date.now() +  24 * 60 * 60 * 1000);
    setNextAllowedTime(nextTime);
    setCanRefresh(false);
  };

    const remainingHours = nextAllowedTime ? Math.ceil((nextAllowedTime - Date.now()) / (1000 * 60 * 60)) : 0;
  const remainingMinutes = nextAllowedTime ? Math.ceil((nextAllowedTime - Date.now()) / (1000 * 60)) : 0;
  
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getSerialNumber = (index) => {
    return (pagination.page - 1) * pagination.limit + index + 1;
  };

  const exportToCSV = () => {
    const params = new URLSearchParams();
    if (filters.minScore) params.append('minScore', filters.minScore);
    if (filters.maxScore) params.append('maxScore', filters.maxScore);

    const url = `${process.env.NEXT_PUBLIC_API}/ai-content/export/scores?${params.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 sm:items-center">
        <input
          type="number"
          placeholder="Min Score"
          value={filters.minScore}
          onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
          className="px-3 py-2 text-xs border border-gray-300 rounded-full focus:ring-1 focus:ring-primary focus:border-transparent text-sm text-gray-900 bg-white"
        />
        <input
          type="number"
          placeholder="Max Score"
          value={filters.maxScore}
          onChange={(e) => setFilters({ ...filters, maxScore: e.target.value })}
          className="px-3 py-2 border text-xs border-gray-300 rounded-full focus:ring-1 focus:ring-primary focus:border-transparent text-sm text-gray-900 bg-white"
        />
       <FilterDropdown
          label="All Status"
          value={filters.status}
          options={[
            { label: "All Status", value: "" },
            { label: "Completed", value: "completed" },
            { label: "Analyzing", value: "analyzing" },
            { label: "Error", value: "error" },
          ]}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              status: value,
            }))
          }
        />

        <button
          onClick={exportToCSV}
          className="px-3 py-2 text-xs bg-primary text-white rounded-lg transition-colors text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
        <button
        onClick={handleRefresh}
        disabled={!canRefresh}
        className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs ${
          canRefresh
            ? 'bg-white text-primary border border-primary'
            : 'bg-gray-400 cursor-not-allowed text-white'
        }`}
      >
        {canRefresh
          ? 'Refresh'
          : `Available in ${remainingHours} hour${remainingHours === 1 ? '' : 's'}`}
      </button>
      </div>

      {/* Add New Analysis Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h4 className=" text-primaryText">Content Scores</h4>
        <button
          onClick={() => {
            const url = prompt('Enter URL to analyze:');
          }}
          className="flex items-center justify-center gap-2 bg-primary text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline text-xs">Analyze New Content</span>
          <span className="sm:hidden">Analyze</span>
        </button>
      </div>

      {/* Content Scores - Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                S.No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Content
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Last Analyzed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contentScores.map((score, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {getSerialNumber(index)}
                </td>
                <td className="px-6 py-4 min-w-[300px] max-w-[400px]">
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {score.title || 'Untitled'}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {score.url}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-900">
                      {Math.round(score.overallScore)}/100
                    </div>
                    <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                      score.overallScore >= 80
                        ? 'bg-green-100 text-green-800'
                        : score.overallScore >= 60
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {score.overallScore >= 80 ? 'Excellent' : score.overallScore >= 60 ? 'Good' : 'Needs Work'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    score.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : score.status === 'analyzing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {score.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(score.lastAnalyzed).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => window.open(score.url, '_blank')}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                      title="Open URL"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onViewDetails(score)}
                      className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded"
                      title="View Analysis Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Content Scores - Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {contentScores.map((score, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                    #{getSerialNumber(index)}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {score.title || 'Untitled'}
                </h4>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {score.url}
                </p>
              </div>
              <div className="flex space-x-2 ml-3">
                <button
                  onClick={() => window.open(score.url, '_blank')}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Open URL"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onViewDetails(score)}
                  className="text-green-600 hover:text-green-800 p-1"
                  title="View Analysis Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Score:</span>
                <span className="font-medium text-gray-900">
                  {Math.round(score.overallScore)}/100
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  score.overallScore >= 80 
                    ? 'bg-green-100 text-green-800'
                    : score.overallScore >= 60 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {score.overallScore >= 80 ? 'Excellent' : score.overallScore >= 60 ? 'Good' : 'Needs Work'}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  score.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : score.status === 'analyzing'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {score.status}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Analyzed:</span>
                <span className="text-gray-900">
                  {new Date(score.lastAnalyzed).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {contentScores.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="text-center py-12">
            <div className="text-gray-500">No content scores found</div>
            <p className="text-sm text-gray-400 mt-1">Start by analyzing some content to see scores here</p>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {contentScores.length > 0 && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> results
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`p-2 rounded-lg border ${
                pagination.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
              title="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, index) => {
                const pageNum = index + 1;
                // Show first page, last page, current page, and pages around current
                const showPage =
                  pageNum === 1 ||
                  pageNum === pagination.totalPages ||
                  (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1);

                if (!showPage) {
                  // Show ellipsis
                  if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                    return (
                      <span key={pageNum} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`p-2 rounded-lg border ${
                pagination.page === pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
              title="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Items per page */}
          <div className="flex items-center gap-2">
            <label htmlFor="limit" className="text-sm text-gray-700 font-medium">
              Per page:
            </label>
            <select
              id="limit"
              value={pagination.limit}
              onChange={(e) =>
                setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5} className="text-gray-900">5</option>
              <option value={10} className="text-gray-900">10</option>
              <option value={20} className="text-gray-900">20</option>
              <option value={50} className="text-gray-900">50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
