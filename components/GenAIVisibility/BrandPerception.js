'use client'

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import axios from 'axios';

// Comparison View Component
const ComparisonView = ({ reports, period }) => {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateComparison();
  }, [reports, period]);

  const calculateComparison = () => {
    setLoading(true);

    const now = new Date();
    const periodStart = new Date(now.getTime() - period * 24 * 60 * 60 * 1000);

    // Filter reports within the period
    const reportsInPeriod = reports.filter(
      (r) => new Date(r.createdAt) >= periodStart
    );

    if (reportsInPeriod.length < 2) {
      setComparisonData({
        insufficient: true,
        count: reportsInPeriod.length
      });
      setLoading(false);
      return;
    }

    // Sort by date (oldest to newest)
    const sorted = [...reportsInPeriod].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    const oldestReport = sorted[0];
    const newestReport = sorted[sorted.length - 1];

    // Calculate sentiment trend
    const sentimentValues = { POSITIVE: 1, NEUTRAL: 0, NEGATIVE: -1 };
    const oldSentiment = sentimentValues[oldestReport.sentiment];
    const newSentiment = sentimentValues[newestReport.sentiment];
    const sentimentChange = newSentiment - oldSentiment;

    // Calculate new strengths
    const oldStrengths = new Set(oldestReport.strengths || []);
    const newStrengths = (newestReport.strengths || []).filter(
      (s) => !oldStrengths.has(s)
    );

    // Calculate resolved weaknesses
    const oldWeaknesses = new Set(oldestReport.weaknesses || []);
    const newWeaknesses = new Set(newestReport.weaknesses || []);
    const resolvedWeaknesses = [...oldWeaknesses].filter(
      (w) => !newWeaknesses.has(w)
    );

    // Calculate new weaknesses
    const addedWeaknesses = [...newWeaknesses].filter(
      (w) => !oldWeaknesses.has(w)
    );

    // Calculate source diversity
    const oldSourceDomains = new Set(
      (oldestReport.sources || []).map((s) => s.hostname)
    );
    const newSourceDomains = new Set(
      (newestReport.sources || []).map((s) => s.hostname)
    );
    const sourceDiversityChange = newSourceDomains.size - oldSourceDomains.size;

    setComparisonData({
      insufficient: false,
      period,
      oldestReport,
      newestReport,
      sentimentChange,
      oldSentiment: oldestReport.sentiment,
      newSentiment: newestReport.sentiment,
      newStrengths,
      resolvedWeaknesses,
      addedWeaknesses,
      sourceDiversityChange,
      oldSourceCount: oldSourceDomains.size,
      newSourceCount: newSourceDomains.size,
      totalReports: sorted.length
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (comparisonData?.insufficient) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-gray-600 mb-2">Not enough data for comparison</p>
        <p className="text-sm text-gray-500">
          You need at least 2 reports in the last {period} days to see trends.
          Currently: {comparisonData.count} report(s)
        </p>
      </div>
    );
  }

  const { sentimentChange, newStrengths, resolvedWeaknesses, addedWeaknesses, sourceDiversityChange } = comparisonData;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Overall Trend Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sentiment Change */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-black mb-1">Sentiment</p>
            <div className="flex items-center gap-2">
              {sentimentChange > 0 ? (
                <>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm font-semibold text-green-600">Improved</span>
                </>
              ) : sentimentChange < 0 ? (
                <>
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  <span className="text-sm font-semibold text-red-600">Declined</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-900">Stable</span>
                </>
              )}
            </div>
            <p className="text-xs text-black mt-1">
              {comparisonData.oldSentiment} → {comparisonData.newSentiment}
            </p>
          </div>

          {/* New Strengths */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-black mb-1">New Strengths</p>
            <p className="text-2xl font-bold text-green-600">{newStrengths.length}</p>
            <p className="text-xs text-black mt-1">
              {newStrengths.length > 0 ? 'identified' : 'No new strengths'}
            </p>
          </div>

          {/* Resolved Weaknesses */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-black mb-1">Resolved Issues</p>
            <p className="text-2xl font-bold text-blue-600">{resolvedWeaknesses.length}</p>
            <p className="text-xs text-black mt-1">
              {resolvedWeaknesses.length > 0 ? 'no longer mentioned' : 'No improvements'}
            </p>
          </div>

          {/* Source Diversity */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-black mb-1">Source Diversity</p>
            <div className="flex items-center gap-2">
              {sourceDiversityChange > 0 ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : sourceDiversityChange < 0 ? (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
              )}
              <span className="text-sm font-semibold">
                {comparisonData.oldSourceCount} → {comparisonData.newSourceCount}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">unique sources</p>
          </div>
        </div>
      </div>

      {/* Detailed Changes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Strengths Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            New Strengths Identified
          </h4>
          {newStrengths.length > 0 ? (
            <ul className="space-y-2">
              {newStrengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">+</span>
                  <span className="text-sm text-black">{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-black">No new strengths identified in this period</p>
          )}
        </div>

        {/* Resolved Weaknesses Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-black mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Issues Resolved
          </h4>
          {resolvedWeaknesses.length > 0 ? (
            <ul className="space-y-2">
              {resolvedWeaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span className="text-sm text-black line-through">{weakness}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-black">No previously identified issues were resolved</p>
          )}
        </div>

        {/* New Issues Card */}
        {addedWeaknesses.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-black mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              New Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {addedWeaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">!</span>
                  <span className="text-sm text-black">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Report Count */}
      <div className="text-center text-sm text-black pt-4 border-t border-gray-200">
        Analysis based on {comparisonData.totalReports} reports from the last {period} days
      </div>
    </div>
  );
};

const BrandPerception = ({ provider = 'OPENAI', platformName = 'ChatGPT', platformColor = '#10a37f' }) => {
  const [reports, setReports] = useState([]);
  const [groupedReports, setGroupedReports] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'comparison'
  const [comparisonPeriod, setComparisonPeriod] = useState(7); // 7, 15, 30, 60 days

  useEffect(() => {
    fetchReports();
  }, [provider]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get( `${process.env.NEXT_PUBLIC_MOONDIVE_API}/advanced-ai/brand-perception/reports?provider=${provider}&limit=50`);

      if (response?.data?.responseCode === 200) {
        const items = response.data.result?.items || [];
        const grouped = response.data.result?.groupedByDate || {};

        setReports(items);
        setGroupedReports(grouped);

        // Select the most recent date and report by default
        if (Object.keys(grouped).length > 0 && !selectedReport) {
          const dates = Object.keys(grouped).sort((a, b) =>
            new Date(grouped[b][0].createdAt) - new Date(grouped[a][0].createdAt)
          );
          const mostRecentDate = dates[0];
          const mostRecentReport = grouped[mostRecentDate][0];

          setSelectedDate(mostRecentDate);
          setSelectedReport(mostRecentReport);
        }
      }
    } catch (error) {
      console.error('Error fetching brand perception reports:', error);
      toast.error('Failed to fetch brand perception reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await axios.post( `${process.env.NEXT_PUBLIC_MOONDIVE_API}/advanced-ai/brand-perception/generate`, {
        provider: provider,
        websiteUrl: 'https://moondive.co'
      });

      if (response?.data?.responseCode === 201) {
        toast.success('Brand perception report generated successfully!');
        await fetchReports();
      } else {
        toast.error('Failed to generate brand perception report');
      }
    } catch (error) {
      console.error('Error generating brand perception report:', error);
      toast.error('Failed to generate brand perception report');
    } finally {
      setGenerating(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'NEGATIVE':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getFaviconUrl = (hostname) => {
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  };

  const getPlatformLogo = () => {
    switch (provider) {
      case 'OPENAI':
        return (
          <Image src="/assets/icons/Chatgpt.svg" width={20} height={20} alt='chatgpt_logo' />
        );
      case 'CLAUDE':
        return (
           <Image src="/assets/icons/Claude.svg" width={20} height={20} alt='claude_logo' />
        );
      case 'GEMINI':
        return (
           <Image src="/assets/icons/Gemini.svg" width={20} height={20} alt='gemini_logo' />
        );
      case 'PERPLEXITY':
        return (
           <Image src="/assets/icons/Perplexity.svg" width={20} height={20} alt='perplexity_logo' />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Brand perception</h2>
          <p className="text-sm text-gray-600 mt-1">
            Discover how your site is perceived in response to a direct question about your brand.
          </p>
        </div>
        <button
          onClick={generateReport}
          disabled={generating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {generating ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate New Report'
          )}
        </button>
      </div>

      {/* Tabs */}
      {reports.length > 0 && (
        <div className="border-b border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('current')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'current'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Current Report
              </button>
              <button
                onClick={() => setActiveTab('comparison')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'comparison'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Trends & Comparison
              </button>
            </div>

            {/* Date and Version Selector */}
            {activeTab === 'current' && Object.keys(groupedReports).length > 0 && (
              <div className="grid grid-cols-1 items-center gap-3">
                {/* Date Selector */}
                <select
                  value={selectedDate}
                  onChange={(e) => {
                    const date = e.target.value;
                    setSelectedDate(date);
                    // Select the latest version (first in array) for the new date
                    if (groupedReports[date] && groupedReports[date].length > 0) {
                      setSelectedReport(groupedReports[date][0]);
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 text-black rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.keys(groupedReports)
                    .sort((a, b) => new Date(groupedReports[b][0].createdAt) - new Date(groupedReports[a][0].createdAt))
                    .map((date) => (
                      <option key={date} value={date}>
                        {date}
                      </option>
                    ))}
                </select>

                {/* Version Selector - only show if multiple versions exist for selected date */}
                {selectedDate && groupedReports[selectedDate] && groupedReports[selectedDate].length > 1 && (
                  <select
                    value={selectedReport?.key || ''}
                    onChange={(e) => {
                      const report = groupedReports[selectedDate].find(r => r.key === e.target.value);
                      setSelectedReport(report);
                    }}
                    className="px-4 py-2 border border-gray-300 text-black rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {groupedReports[selectedDate].map((report, index) => (
                      <option key={report.key} value={report.key}>
                        Version {index + 1} {index === 0 ? '(Latest)' : ''} - {formatTime(report.createdAt)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'current' && selectedReport ? (
        <div className="space-y-6">
          {/* Summary with Platform Logo */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                {getPlatformLogo()}
              </div>
              <span>How {platformName} described your brand</span>
            </h3>

            <div className="bg-gray-50 rounded-lg p-6 mb-4 relative">
              <p className="text-sm text-black leading-relaxed">
                {selectedReport.summary || selectedReport.description}
              </p>
              {selectedReport.description && (
                <button
                  onClick={() => setShowDetailModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  View detailed analysis
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Sources Section */}
          {selectedReport.sources && selectedReport.sources.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Sources ({selectedReport.sources.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedReport.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={getFaviconUrl(source.hostname)}
                        alt={source.hostname}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>`;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-black truncate group-hover:text-blue-600 transition-colors">
                        {source.title || source.hostname}
                      </p>
                      <p className="text-xs text-black truncate mt-0.5">
                        {source.hostname}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Sentiment Badge */}
          <div>
            <h4 className="text-sm font-medium text-black mb-2">General sentiment</h4>
            <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${getSentimentColor(selectedReport.sentiment)}`}>
              {selectedReport.sentiment}
            </span>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <div>
              <h4 className="text-sm font-semibold text-black mb-3">Strengths</h4>
              <div className="space-y-2">
                {selectedReport.strengths && selectedReport.strengths.length > 0 ? (
                  selectedReport.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-sm text-black">{strength}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-black">No strengths identified</p>
                )}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div>
              <h4 className="text-sm font-semibold text-black mb-3">Areas for improvement</h4>
              <div className="space-y-2">
                {selectedReport.weaknesses && selectedReport.weaknesses.length > 0 ? (
                  selectedReport.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <p className="text-sm text-black">{weakness}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-black">No areas for improvement identified</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'comparison' && reports.length > 0 ? (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-medium text-black">Compare reports from:</label>
            <div className="flex gap-2">
              {[7, 15, 30, 60].map((days) => (
                <button
                  key={days}
                  onClick={() => setComparisonPeriod(days)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    comparisonPeriod === days
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                >
                  Last {days} days
                </button>
              ))}
            </div>
          </div>

          {/* Comparison Content */}
          <ComparisonView reports={reports} period={comparisonPeriod} />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No brand perception reports available</p>
          <button
            onClick={generateReport}
            disabled={generating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Generating...' : 'Generate First Report'}
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 004.981 4.18a5.985 5.985 0 00-3.998 2.9 6.046 6.046 0 00.743 7.097 5.98 5.98 0 00.51 4.911 6.051 6.051 0 006.515 2.9A5.985 5.985 0 0013.26 24a6.056 6.056 0 005.772-4.206 5.99 5.99 0 003.997-2.9 6.056 6.056 0 00-.747-7.073zM13.26 22.43a4.476 4.476 0 01-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 00.392-.681v-6.737l2.02 1.168a.071.071 0 01.038.052v5.583a4.504 4.504 0 01-4.494 4.494zM3.6 18.304a4.47 4.47 0 01-.535-3.014l.142.085 4.783 2.759a.771.771 0 00.78 0l5.843-3.369v2.332a.08.08 0 01-.033.062L9.74 19.95a4.5 4.5 0 01-6.14-1.646zM2.34 7.896a4.485 4.485 0 012.366-1.973V11.6a.766.766 0 00.388.676l5.815 3.355-2.02 1.168a.076.076 0 01-.071 0l-4.83-2.786A4.504 4.504 0 012.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 01.071 0l4.83 2.791a4.494 4.494 0 01-.676 8.105v-5.678a.79.79 0 00-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 00-.785 0L9.409 9.23V6.897a.066.066 0 01.028-.061l4.83-2.787a4.5 4.5 0 016.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 01-.038-.057V6.075a4.5 4.5 0 017.375-3.453l-.142.08L8.704 5.46a.795.795 0 00-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
                  </svg>
                </div>
                Detailed Brand Analysis
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Full Description */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Comprehensive Analysis</h4>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-sm text-gray-700 leading-relaxed space-y-4">
                    {selectedReport.description.split(/\n\n|\n/).filter(p => p.trim()).map((paragraph, index) => (
                      <p key={index} className="text-justify">{paragraph.trim()}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sources in Modal */}
              {selectedReport.sources && selectedReport.sources.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Sources ({selectedReport.sources.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedReport.sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={getFaviconUrl(source.hostname)}
                            alt={source.hostname}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>`;
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {source.title || source.hostname}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {source.hostname}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Sentiment & Strengths/Weaknesses */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">General sentiment</h4>
                <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${getSentimentColor(selectedReport.sentiment)}`}>
                  {selectedReport.sentiment}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Strengths</h4>
                  <div className="space-y-2">
                    {selectedReport.strengths && selectedReport.strengths.length > 0 ? (
                      selectedReport.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-sm text-gray-700">{strength}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No strengths identified</p>
                    )}
                  </div>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Areas for improvement</h4>
                  <div className="space-y-2">
                    {selectedReport.weaknesses && selectedReport.weaknesses.length > 0 ? (
                      selectedReport.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <p className="text-sm text-gray-700">{weakness}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No areas for improvement identified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandPerception;
