'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Target,
  Zap,
  AlertCircle,
  BarChart3,
  Sparkles,
  TrendingUp
} from 'lucide-react';

import ContentAnalysisModal from '@/components/AIContentPerformance/ContentAnalysisModal';
import StatCard from '@/components/AIContentPerformance/StatCard';
import OverviewTab from '@/components/AIContentPerformance/OverviewTab';
import ContentScoresTab from '@/components/AIContentPerformance/ContentScoresTab';
import CitationsTab from '@/components/AIContentPerformance/CitationsTab';
import ContentGapsTab from '@/components/AIContentPerformance/ContentGapsTab';
import SnippetPreviewTab from '@/components/AIContentPerformance/SnippetPreviewTab';
import CompetitorAnalysisTab from '@/components/AIContentPerformance/CompetitorAnalysisTab';
import RealTimeQueryAnalysis from '@/components/AIContentPerformance/RealTimeQueryAnalysis';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function AiContentPerformance() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [contentScores, setContentScores] = useState([]);
  const [citations, setCitations] = useState([]);
  const [contentGaps, setContentGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [bulkStatus, setBulkStatus] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [priority, setPriority] = useState('')
  const [status, setStatus] = useState('identified')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    days: 30,
    minScore: '',
    maxScore: '',
    platform: '',
    status: 'completed'
  });

  useEffect(() => {
    fetchDashboardData();
    if (activeTab === 'content') fetchContentScores();
    if (activeTab === 'citations') fetchCitations();
    if (activeTab === 'gaps') fetchContentGaps();
  }, [activeTab, filters, pagination.page, priority, status]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/ai-content/dashboard?days=${filters.days}`);
      const data = response.data;
      if (data.responseCode === 200) {
        setDashboardData(data.result);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContentScores = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
        ...(filters.minScore && { minScore: filters.minScore }),
        ...(filters.maxScore && { maxScore: filters.maxScore })
      });

      const response = await axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/ai-content/scores?${params}`)
      const data = response.data;
      if (data.responseCode === 200) {
        const result = data.result;
        setContentScores(result.scores || []);

        // Update pagination info if backend provides it
        if (result.pagination) {
          setPagination(prev => ({
            ...prev,
            total: result.pagination.total || 0,
            totalPages: result.pagination.pages || result.pagination.totalPages || 1
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch content scores:', error);
    }
  };

  const fetchCitations = async () => {
    try {
      const params = new URLSearchParams({
        page: 1,
        limit: 20,
        days: filters.days,
        ...(filters.platform && { platform: filters.platform })
      });

      const response = await axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/ai-content/citations?${params}`);
      const data = response.data;
      if (data.responseCode === 200) {
        setCitations(data.result.citations);
      }
    } catch (error) {
      console.error('Failed to fetch citations:', error);
    }
  };

  const fetchContentGaps = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/ai-content/gaps?page=1&limit=20&priority=${priority}&status=${status}`);
      const data = response.data;
      if (data.responseCode === 200) {
        setContentGaps(data.result.gaps);
      }
    } catch (error) {
      console.error('Failed to fetch content gaps:', error);
    }
  };

  const analyzeNewContent = async () => {
    const url = prompt('Enter URL to analyze:');
    if (!url) return;

    setAnalyzing(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/ai-content/analyze`, {
        url, forceReanalysis: true
      });
      const data = response.data;

      if (data.responseCode === 200) {
        alert('Content analysis completed successfully!');
        fetchContentScores();
        fetchDashboardData();
      } else {
        alert('Failed to analyze content: ' + data.responseMessage);
      }
    } catch (error) {
      console.error('Failed to analyze content:', error);
      alert('Failed to analyze content. Check console for details.');
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeAllPages = async () => {
    if (!confirm('This will analyze all pages from your sitemap. Continue?')) return;

    setAnalyzingAll(true);
    setBulkStatus({ total: 0, completed: 0, errors: 0, analyzing: 0 });

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/ai-content/analyze-all`, {
          baseUrl: window.location.origin,
          forceReanalysis: false
      });

      const data = response.data;

      if (data.responseCode === 200) {
        // Start polling for status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/ai-content/analyze-status`);
            const statusData = await statusResponse.json();

            if (statusData.responseCode === 200) {
              setBulkStatus(statusData.result);

              if (!statusData.result.inProgress) {
                clearInterval(pollInterval);
                setAnalyzingAll(false);
                fetchDashboardData();
                fetchContentScores();
                alert(`Bulk analysis complete! Analyzed: ${statusData.result.completed}, Errors: ${statusData.result.errors}`);
              }
            }
          } catch (error) {
            console.error('Error polling status:', error);
          }
        }, 3000); // Poll every 3 seconds
      } else {
        alert('Failed to start bulk analysis: ' + data.responseMessage);
        setAnalyzingAll(false);
      }
    } catch (error) {
      console.error('Failed to start bulk analysis:', error);
      alert('Failed to start bulk analysis. Check console for details.');
      setAnalyzingAll(false);
    }
  };

  const openContentModal = (content) => {
    setSelectedContent(content);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedContent(null);
  };

  if (loading && !dashboardData) {
    return (
      <div className='flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: 'center' }} // add this
        />
      </div>
    );
  }

  return (
    <div className="w-[78vw] p-3 sm:p-4 lg:p-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h4 className=" text-primaryText truncate">
              AI Content Performance
            </h4>
            <p className="text-sm sm:text-base text-primary-100/80 mt-1">
              Track and optimize your content for AI platforms
            </p>
          </div>
          <div className="flex-shrink-0 flex gap-2 sm:gap-3">
            <button
              onClick={analyzeNewContent}
              disabled={analyzing || analyzingAll}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                analyzing || analyzingAll
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary'
              } text-white`}
            >
              {analyzing && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              <span className="hidden sm:inline text-xs">
                {analyzing ? 'Analyzing...' : 'Analyze URL'}
              </span>
              <span className="sm:hidden text-xs">
                {analyzing ? 'Analyzing...' : 'Analyze'}
              </span>
            </button>
            <button
              onClick={analyzeAllPages}
              disabled={analyzing || analyzingAll}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                analyzing || analyzingAll
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary'
              } text-white`}
            >
              {analyzingAll && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              <span className="hidden sm:inline text-xs">
                {analyzingAll ? 'Analyzing All...' : 'Analyze All Pages'}
              </span>
              <span className="sm:hidden text-xs">
                {analyzingAll ? 'All...' : 'All'}
              </span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
            <StatCard
              icon={<FileText className="w-6 h-6" />}
              label="Total Pages"
              value={dashboardData.overview.totalPages}
              color="blue"
            />
            <StatCard
              icon={<Target className="w-6 h-6" />}
              label="Average AI Score"
              value={Math.round(dashboardData.overview.averageScore)}
              suffix="/100"
              color="green"
            />
            <StatCard
              icon={<Zap className="w-6 h-6" />}
              label="AI Citations"
              value={dashboardData.overview.totalCitations || 0}
              color="purple"
            />
            <StatCard
              icon={<AlertCircle className="w-6 h-6" />}
              label="Content Gaps"
              value={dashboardData.overview.contentGapsIdentified}
              color="orange"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto hide-scrollbar px-3 sm:px-6" aria-label="Tabs">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3, shortLabel: 'Overview' },
                { id: 'content', label: 'Content Scores', icon: FileText, shortLabel: 'Scores' },
                { id: 'citations', label: 'AI Citations', icon: Zap, shortLabel: 'Citations' },
                { id: 'gaps', label: 'Content Gaps', icon: AlertCircle, shortLabel: 'Gaps' },
                { id: 'snippet', label: 'Snippet Preview', icon: Sparkles, shortLabel: 'Snippet' },
                { id: 'competitors', label: 'Competitor Analysis', icon: Target, shortLabel: 'Competitors' },
                { id: 'realtime', label: 'Real-Time Analysis', icon: TrendingUp, shortLabel: 'Real-Time' }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      py-3 sm:py-2 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0
                      ${activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-4 lg:p-6">
            {activeTab === 'overview' && ( 
              <OverviewTab 
                dashboardData={dashboardData} 
                filters={filters}
                setFilters={setFilters}
              />
            )}
            
            {activeTab === 'content' && (
              <ContentScoresTab
                contentScores={contentScores}
                filters={filters}
                setFilters={setFilters}
                pagination={pagination}
                setPagination={setPagination}
                onRefresh={fetchContentScores}
                onViewDetails={openContentModal}
              />
            )}
            
            {activeTab === 'citations' && (
              <CitationsTab 
                citations={citations}
                filters={filters}
                setFilters={setFilters}
                onRefresh={fetchCitations}
              />
            )}
            
            {activeTab === 'gaps' && (
              <ContentGapsTab
                contentGaps={contentGaps}
                onRefresh={fetchContentGaps}
                selectedFilter={priority}        
                setSelectedFilter={setPriority} 
                status={status}        
                setStatus={setStatus}
              />
            )}

            {activeTab === 'snippet' && (
              <SnippetPreviewTab
                contentScores={contentScores}
              />
            )}

            {activeTab === 'competitors' && (
              <CompetitorAnalysisTab />
            )}

            {activeTab === 'realtime' && (
              <RealTimeQueryAnalysis />
            )}
          </div>
        </div>

        {/* Bulk Analysis Progress Modal */}
        {analyzingAll && bulkStatus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Analyzing Site Pages</h3>

              <div className="mb-6">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">
                    {bulkStatus.completed + bulkStatus.errors}/{bulkStatus.total || '...'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: bulkStatus.total > 0
                        ? `${((bulkStatus.completed + bulkStatus.errors) / bulkStatus.total) * 100}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-blue-600 font-medium mb-1">Analyzing</div>
                  <div className="text-lg font-bold text-blue-700">{bulkStatus.analyzing}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-green-600 font-medium mb-1">Completed</div>
                  <div className="text-lg font-bold text-green-700">{bulkStatus.completed}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-red-600 font-medium mb-1">Errors</div>
                  <div className="text-lg font-bold text-red-700">{bulkStatus.errors}</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <span>This may take a few minutes...</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Analysis Modal */}
        {showModal && selectedContent && (
          <ContentAnalysisModal
            content={selectedContent}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
}
