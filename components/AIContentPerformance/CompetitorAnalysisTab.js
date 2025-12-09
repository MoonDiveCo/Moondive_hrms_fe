import React, { useState } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle, ExternalLink, BarChart3, Loader } from 'lucide-react';
import axios from 'axios';

export default function CompetitorAnalysisTab() {
  const [competitorUrls, setCompetitorUrls] = useState(['', '', '']);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeCompetitors = async () => {
    const urls = competitorUrls.filter(url => url.trim() !== '');

    if (urls.length === 0) {
      setError('Please enter at least one competitor URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/ai-content/ai/analyze-competitors`, {
        competitorUrls: urls
      });

      const data = response.data;

      if (data.responseCode === 200) {
        setAnalysisData(data.result);
      } else {
        setError(data.responseMessage || 'Failed to analyze competitors');
      }
    } catch (err) {
      console.error('Error analyzing competitors:', err);
      setError('Failed to analyze competitors. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Target className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitor AI Content Analysis</h3>
            <p className="text-sm text-gray-600">
              Analyze how your competitors optimize their content for AI platforms.
              Get insights into their strategies and identify opportunities to outperform them.
            </p>
          </div>
        </div>
      </div>

      {/* URL Input Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Enter Competitor URLs</h4>

        <div className="space-y-3 mb-4">
          {competitorUrls.map((url, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Competitor #{index + 1}:
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  const newUrls = [...competitorUrls];
                  newUrls[index] = e.target.value;
                  setCompetitorUrls(newUrls);
                }}
                placeholder="https://competitor.com/page"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
          ))}
        </div>

        <button
          onClick={analyzeCompetitors}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
          } text-white font-medium`}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Analyzing Competitors...
            </>
          ) : (
            <>
              <Target className="w-5 h-5" />
              Analyze Competitors
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {analysisData && (
        <div className="space-y-6">
          {/* Summary Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-orange-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {analysisData.summary.totalAnalyzed}
                </div>
                <div className="text-sm text-gray-600 mt-1">Competitors Analyzed</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">
                  {Math.round(analysisData.summary.averageScore)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Average AI Score</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {analysisData.summary.commonStrengths?.length || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Common Strengths</div>
              </div>
            </div>
          </div>

          {/* Common Strengths */}
          {analysisData.summary.commonStrengths && analysisData.summary.commonStrengths.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="text-lg font-semibold text-gray-900">What Competitors Do Well</h4>
              </div>
              <ul className="space-y-2">
                {analysisData.summary.commonStrengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <span className="text-green-500 mt-1">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Opportunities */}
          {analysisData.summary.opportunities && analysisData.summary.opportunities.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h4 className="text-lg font-semibold text-gray-900">Opportunities for You</h4>
              </div>
              <div className="space-y-3">
                {analysisData.summary.opportunities.map((opportunity, index) => (
                  <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-gray-800">{opportunity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Competitor Analysis */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Detailed Competitor Analysis</h4>
            {analysisData.competitors.map((competitor, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {competitor.error ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <a
                          href={competitor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium break-all"
                        >
                          {competitor.url}
                        </a>
                      </div>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700">Error: {competitor.error}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Competitor Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h5 className="text-base font-semibold text-gray-900 mb-2">{competitor.title}</h5>
                          <a
                            href={competitor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 break-all"
                          >
                            {competitor.url}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={`text-3xl font-bold ${getScoreColor(competitor.analysis.aiScore).split(' ')[0]}`}>
                            {competitor.analysis.aiScore}
                          </div>
                          <span className="text-xs text-gray-500">AI Score</span>
                        </div>
                      </div>
                    </div>

                    {/* Competitor Content */}
                    <div className="p-6 space-y-4">
                      {/* Strengths */}
                      {competitor.analysis.strengths && competitor.analysis.strengths.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <div className="text-sm font-semibold text-gray-700">Strengths:</div>
                          </div>
                          <ul className="space-y-1">
                            {competitor.analysis.strengths.map((strength, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Citable Elements */}
                      {competitor.analysis.citableElements && competitor.analysis.citableElements.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                            <div className="text-sm font-semibold text-gray-700">Citable Elements:</div>
                          </div>
                          <ul className="space-y-1">
                            {competitor.analysis.citableElements.map((element, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">→</span>
                                {element}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Structural Insights */}
                      {competitor.analysis.structuralInsights && competitor.analysis.structuralInsights.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-2">Structural Insights:</div>
                          <ul className="space-y-1">
                            {competitor.analysis.structuralInsights.map((insight, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-purple-500 mt-0.5">•</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Content Gaps */}
                      {competitor.analysis.contentGaps && competitor.analysis.contentGaps.length > 0 && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="text-sm font-semibold text-gray-700 mb-2">Their Content Gaps (Your Opportunities):</div>
                          <ul className="space-y-1">
                            {competitor.analysis.contentGaps.map((gap, i) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-yellow-600 mt-0.5">⚠</span>
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {competitor.analysis.recommendations && competitor.analysis.recommendations.length > 0 && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm font-semibold text-gray-700 mb-2">What You Can Learn:</div>
                          <ul className="space-y-1">
                            {competitor.analysis.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">→</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysisData && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 mb-2">No competitor analysis yet</div>
          <p className="text-sm text-gray-400">
            Enter competitor URLs above and click "Analyze Competitors" to see how they optimize for AI platforms
          </p>
        </div>
      )}
    </div>
  );
}
