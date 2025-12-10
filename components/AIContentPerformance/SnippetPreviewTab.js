import React, { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle, TrendingUp, MessageSquare, Copy, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function SnippetPreviewTab({ contentScores }) {
  const [selectedUrl, setSelectedUrl] = useState('');
  const [customQueries, setCustomQueries] = useState(['', '', '']);
  const [snippetData, setSnippetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateSnippetPreview = async () => {
    if (!selectedUrl) {
      setError('Please select or enter a URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queries = customQueries.filter(q => q.trim() !== '');

      const response = await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/ai-content/ai/snippet-preview`, {
          url: selectedUrl,
          queries: queries.length > 0 ? queries : undefined
      });

      const data = response.data;

      if (data.responseCode === 200) {
        setSnippetData(data.result);
      } else {
        setError(data.responseMessage || 'Failed to generate snippet preview');
      }
    } catch (err) {
      console.error('Error generating snippet preview:', err);
      setError('Failed to generate snippet preview. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCitationTypeColor = (type) => {
    switch (type) {
      case 'direct_quote': return 'bg-green-100 text-green-800';
      case 'paraphrase': return 'bg-yellow-100 text-yellow-800';
      case 'summary': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Snippet Preview</h3>
            <p className="text-sm text-gray-600">
              See how AI assistants (ChatGPT, Claude, Gemini) would cite your content in their responses.
              Test different user queries and get optimization suggestions to improve citability.
            </p>
          </div>
        </div>
      </div>

      {/* URL Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Select Content to Preview</h4>

        <div className="space-y-4">
          {/* URL Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose from analyzed pages:
            </label>
            <select
              value={selectedUrl}
              onChange={(e) => setSelectedUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Select a page...</option>
              {contentScores && contentScores.map((score, index) => (
                <option key={index} value={score.url} className="text-gray-900">
                  {score.title || score.url}
                </option>
              ))}
            </select>
          </div>

          {/* Manual URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or enter a custom URL:
            </label>
            <input
              type="url"
              value={selectedUrl}
              onChange={(e) => setSelectedUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>

          {/* Custom Queries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test queries (optional - leave blank for defaults):
            </label>
            <div className="space-y-2">
              {customQueries.map((query, index) => (
                <input
                  key={index}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    const newQueries = [...customQueries];
                    newQueries[index] = e.target.value;
                    setCustomQueries(newQueries);
                  }}
                  placeholder={`Query ${index + 1}: e.g., "What is...?"`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                />
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateSnippetPreview}
            disabled={loading || !selectedUrl}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              loading || !selectedUrl
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
            } text-white font-medium`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Generating Preview...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate AI Snippet Preview
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {snippetData && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Snippet Quality Score</h4>
              <div className="flex items-center gap-2">
                <div className={`text-3xl font-bold ${
                  snippetData.snippetQuality >= 80 ? 'text-green-600' :
                  snippetData.snippetQuality >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {snippetData.snippetQuality}
                </div>
                <div className="text-gray-500">/100</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  snippetData.snippetQuality >= 80 ? 'bg-green-500' :
                  snippetData.snippetQuality >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${snippetData.snippetQuality}%` }}
              ></div>
            </div>
          </div>

          {/* Snippet Variations */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">How AI Would Cite This Content</h4>
            {snippetData.snippetVariations.map((variation, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Query Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">User Query #{index + 1}:</span>
                      </div>
                      <p className="text-base text-gray-900 font-medium italic">"{variation.query}"</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`text-2xl font-bold ${
                        variation.qualityScore >= 80 ? 'text-green-600' :
                        variation.qualityScore >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {variation.qualityScore}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCitationTypeColor(variation.citationType)}`}>
                        {variation.citationType?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Response Preview */}
                <div className="p-6">
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">AI Response Preview:</div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 relative">
                      <p className="text-gray-800 leading-relaxed">{variation.fullResponse}</p>
                      <button
                        onClick={() => copyToClipboard(variation.fullResponse)}
                        className="absolute top-2 right-2 p-2 hover:bg-blue-100 rounded transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </div>

                  {/* Strengths */}
                  {variation.strengths && variation.strengths.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <div className="text-sm font-semibold text-gray-700">Strengths:</div>
                      </div>
                      <ul className="space-y-1">
                        {variation.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {variation.improvements && variation.improvements.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <div className="text-sm font-semibold text-gray-700">Suggested Improvements:</div>
                      </div>
                      <ul className="space-y-1">
                        {variation.improvements.map((improvement, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-orange-500 mt-1">→</span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Overall Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-purple-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Overall Analysis</h4>

            {/* Citation Type */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Most Common Citation Type:</div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getCitationTypeColor(snippetData.overallAnalysis.bestCitationType)}`}>
                {snippetData.overallAnalysis.bestCitationType?.replace('_', ' ')}
              </span>
            </div>

            {/* Optimization Recommendations */}
            {snippetData.overallAnalysis.recommendedOptimizations && snippetData.overallAnalysis.recommendedOptimizations.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3">Recommended Optimizations:</div>
                <div className="space-y-3">
                  {snippetData.overallAnalysis.recommendedOptimizations.map((opt, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(opt.priority)}`}>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="font-medium">{opt.issue}</div>
                        <span className="text-xs uppercase font-bold">{opt.priority}</span>
                      </div>
                      <p className="text-sm mb-2">{opt.suggestion}</p>
                      {opt.impact && (
                        <p className="text-xs italic">Impact: {opt.impact}</p>
                      )}
                      {opt.affectedQueries && opt.affectedQueries.length > 0 && (
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Affects queries:</span> {opt.affectedQueries.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Regenerate Button */}
          <div className="flex justify-center">
            <button
              onClick={generateSnippetPreview}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Regenerate Preview
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!snippetData && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 mb-2">No preview generated yet</div>
          <p className="text-sm text-gray-400">
            Select a URL and click "Generate AI Snippet Preview" to see how AI assistants would cite your content
          </p>
        </div>
      )}
    </div>
  );
}
