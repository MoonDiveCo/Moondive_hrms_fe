import React, { useState } from 'react';
import { Plus, AlertCircle, TrendingUp, Clock, Sparkles } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function ContentGapsTab({ contentGaps, onRefresh, selectedFilter, setSelectedFilter, setStatus, status}) {
  const [discovering, setDiscovering] = useState(false);
  const [creatingId, setCreatingId] = useState(null);
  const router = useRouter()

  const discoverGapsWithAI = async () => {
    if (!confirm('Use AI to discover content gaps? This will analyze your existing content and identify opportunities.')) return;

    setDiscovering(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/ai-content/ai/discover-gaps`, {
          companyInfo: {
            name: 'MoonDive',
            industry: 'Technology Services',
            services: ['Web Development', 'Mobile App Development', 'AI Solutions', 'Data Analytics'] 
          }
      });

      const data = response.data;

      if (data.responseCode === 200) {
        alert(`AI discovered ${data.result.gaps?.length || 0} content gaps!`);
        onRefresh();
      } else {
        alert('Failed to discover gaps: ' + data.responseMessage);
      }
    } catch (error) {
      console.error('Failed to discover gaps:', error);
      alert('Failed to discover content gaps. Check console for details.');
    } finally {
      setDiscovering(false);
    }
  };

const handleRoute = async (format) => {
  switch (format) {
    case 'blog_post': 
      router.push('/admin/website-moderation');
      break;
      
    case 'case_study':
      router.push('/admin/case-studies');
      break;
      
    case 'comparision':
      router.push('/admin/comparisions');
      break;
      
    default:
      break;
  }
}


const handleCreateContent = async (id) => {
  setCreatingId(id);

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_MOONDIVE_API}/ai-content/ai/create-content?id=${id}`,
      { status: 'completed' }
    );

    if (response.status === 200) {
      toast.success('Content successfully generated!');
      onRefresh();
    } else {
      alert('Failed to generate content. Please try again.');
    }
  } catch (error) {
    console.error('Failed to create content:', error);
    toast.error('Failed to generate content.');
  } finally {
    setCreatingId(null); 
  }
};


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-gray-900">Identified Content Gaps</h3>
        <div className="flex gap-2 items-center flex-wrap">
           <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="identified">Identified</option>
          <option value="completed">Completed</option>
        </select>
          <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
          <button
            onClick={discoverGapsWithAI}
            disabled={discovering}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              discovering
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
            } text-white`}
          >
            {discovering ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {discovering ? 'Discovering...' : 'AI Discover Gaps'}
          </button>
          <button
            onClick={() => alert('Create new content gap modal would open here')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Gap
          </button>
        </div>
      </div>

      {/* Content Gaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentGaps.map((gap, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-medium text-gray-900">
                    {gap.topic}
                  </h4>
                  {gap.aiGenerated && (
                    <Sparkles className="w-4 h-4 text-purple-500" title="AI-Generated Suggestion" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {gap.suggestedTitle}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  gap.priority === 'critical'
                    ? 'bg-red-100 text-red-800'
                    : gap.priority === 'high'
                    ? 'bg-orange-100 text-orange-800'
                    : gap.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {gap.priority}
                </span>
              </div>
            </div>

            {/* Gap Type */}
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 capitalize">
                {gap.gapType?.replace('_', ' ') || 'Content Gap'}
              </span>
            </div>

            {/* Opportunity Score */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Opportunity Score</span>
                <span className="text-sm font-semibold text-blue-600">
                  {gap.opportunityScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    gap.opportunityScore >= 80 ? 'bg-green-500' : 
                    gap.opportunityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${gap.opportunityScore}%` }}
                ></div>
              </div>
            </div>

            {/* Content Suggestions */}
            <div className="text-sm text-gray-600 mb-4">
              <strong>Suggested format:</strong> {gap.contentSuggestions?.suggestedFormat?.replace('_', ' ') || 'Blog post'}
            </div>

            {gap.contentSuggestions?.keyPoints && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Key Points:</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {gap.contentSuggestions.keyPoints.slice(0, 3).map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Target Keywords */}
            {gap.contentSuggestions?.targetKeywords && gap.contentSuggestions.targetKeywords.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Target Keywords:</div>
                <div className="flex flex-wrap gap-2">
                  {gap.contentSuggestions.targetKeywords.slice(0, 4).map((keyword, index) => (
                    <span key={index} className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reasoning */}
            {gap.reasoning && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Why this matters:</div>
                <p className="text-sm text-gray-700">{gap.reasoning}</p>
              </div>
            )}

            <div className="flex justify-between items-center gap-2 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {new Date(gap.identifiedDate).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
               {gap.status !== 'identified' && (
                <button
                  onClick={() => handleRoute(gap.contentSuggestions?.suggestedFormat)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View
                </button>
              )}
               {gap.status !== 'completed' && (
                <button
                  onClick={() => handleCreateContent(gap._id)}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                >
                  Create
                </button>
              )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {contentGaps.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500">No content gaps identified</div>
          <p className="text-sm text-gray-400 mt-1">
            Content gaps will appear here when AI analysis identifies opportunities
          </p>
        </div>
      )}

      {creatingId && (
        <div className="fixed -inset-10 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white text-lg font-medium">Generating content...</p>
        </div>
      )}
    </div>
  );
}



