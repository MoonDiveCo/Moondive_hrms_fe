import React, { useState, useEffect } from 'react';
import { ExternalLink, Calendar, TrendingUp, MessageSquare, BarChart3, Clock } from 'lucide-react';
import axios from 'axios';
import FilterDropdown from '../UI/FilterDropdown';

// Citation Card Component
function CitationCard({ citation }) {
  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {citation.platform}
            </span>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(citation.citationDate).toLocaleDateString()}
            </div>
            {citation.citationType && (
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-purple-50 text-purple-700">
                {citation.citationType}
              </span>
            )}
          </div>

          {/* User Query */}
          {citation.query && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-semibold text-gray-700">User Query:</span>
              </div>
              <p className="text-sm text-gray-700 italic">"{citation.query}"</p>
            </div>
          )}

          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {citation.title || citation.contentTitle || 'Citation'}
          </h4>

          {/* AI Response */}
          {citation.aiResponse && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-xs font-semibold text-blue-700 mb-1">What AI Said:</div>
              <p className="text-sm text-gray-700">"{citation.aiResponse}"</p>
            </div>
          )}

          <p className="text-gray-600 mb-3">
            {citation.snippet || citation.citedText}
          </p>
        </div>
        <button
          onClick={() => window.open(citation.url || citation.sourceUrl, '_blank')}
          className="text-blue-600 hover:text-blue-800 ml-4 flex-shrink-0"
          title="View Source"
        >
          <ExternalLink className="w-5 h-5" />
        </button>
      </div>

      {/* Citation Metrics */}
      {citation.impactMetrics && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {citation.impactMetrics.views || 0}
              </div>
              <div className="text-sm text-gray-500">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {citation.impactMetrics.shares || 0}
              </div>
              <div className="text-sm text-gray-500">Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {citation.impactMetrics.engagement || 0}%
              </div>
              <div className="text-sm text-gray-500">Engagement</div>
            </div>
          </div>
        </div>
      )}

      {/* Context and Source URL */}
      {citation.context && (
        <div className="mb-3 text-sm text-gray-600">
          <strong>Context:</strong> {citation.context}
        </div>
      )}

      <div className="text-sm text-gray-500">
        <strong>Source:</strong>
        <a
          href={citation.sourceUrl || citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 ml-1 break-all"
        >
          {citation.sourceUrl || citation.url}
        </a>
      </div>
    </>
  );
}

export default function CitationsTab({ citations, filters, setFilters, onRefresh }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'timeline'
  const [trends, setTrends] = useState(null);

     const [canRefresh, setCanRefresh] = useState(true);
    const [nextAllowedTime, setNextAllowedTime] = useState(null);
  
    useEffect(() => {
      const lastRefresh = localStorage.getItem('lastCitationsRefresh');
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
  
      localStorage.setItem('lastCitationsRefresh', Date.now().toString());
      const nextTime = new Date(Date.now() +  24 * 60 * 60 * 1000);
      setNextAllowedTime(nextTime);
      setCanRefresh(false);
    };
  
      const remainingHours = nextAllowedTime ? Math.ceil((nextAllowedTime - Date.now()) / (1000 * 60 * 60)) : 0;
  const remainingMinutes = nextAllowedTime ? Math.ceil((nextAllowedTime - Date.now()) / (1000 * 60)) : 0;

  useEffect(() => {
    fetchCitationTrends();
  }, [filters]);

  const fetchCitationTrends = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/ai-content/citations/trends?days=${filters.days}`);
      const data = response.data;
      if (data.responseCode === 200) {
        setTrends(data.result);
      }
    } catch (error) {
      console.error('Failed to fetch citation trends:', error);
    }
  };

  const platformStats = citations.reduce((acc, citation) => {
    const platform = citation.platform || 'Unknown';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Filters and View Toggle */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <FilterDropdown
            label="Last 7 days"
            value={filters.days}
            options={[
              { label: "Last 7 days", value: 7 },
              { label: "Last 30 days", value: 30 },
              { label: "Last 90 days", value: 90 },
            ]}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                days: parseInt(value),
              }))
            }
          />

          <FilterDropdown
            label="All Platforms"
            value={filters.platform}
            options={[
              { label: "All Platforms", value: "" },
              { label: "ChatGPT", value: "ChatGPT" },
              { label: "Claude", value: "Claude" },
              { label: "Gemini", value: "Gemini" },
              { label: "Perplexity", value: "Perplexity" },
            ]}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                platform: value,
              }))
            }
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-full text-xs transition-colors ${
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 text-xs py-2 rounded-full transition-colors ${
              viewMode === 'timeline'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Timeline
          </button>
           <button
        onClick={handleRefresh}
        disabled={!canRefresh}
        className={`px-3 text-xs py-2 rounded-lg transition-colors text-sm ${
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
      </div>

      {/* Platform Breakdown */}
      {Object.keys(platformStats).length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Platform Breakdown
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(platformStats).map(([platform, count]) => (
              <div key={platform} className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-600 mt-1">{platform}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Citations Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">AI Citations</h3>
        <div className="text-sm text-gray-600">
          Total Citations: <span className="font-semibold">{citations.length}</span>
        </div>
      </div>

      {/* Citations List/Timeline */}
      <div className="space-y-4">
        {viewMode === 'timeline' && citations.length > 0 && (
          <div className="relative pl-8 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-300">
            {citations.map((citation, index) => (
              <div key={index} className="relative mb-8">
                <div className="absolute -left-5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow"></div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 ml-4">
                  <CitationCard citation={citation} />
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'list' && citations.map((citation, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <CitationCard citation={citation} />
          </div>
        ))}

        {citations.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500">No citations found</div>
            <p className="text-sm text-gray-400 mt-1">
              Citations will appear here when AI platforms reference your content
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


