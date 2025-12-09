import React from 'react';

// Content Analysis Modal Component
export default function ContentAnalysisModal({ content, onClose }) {
  if (!content) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
              🤖 AI Content Analysis Report
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium break-words">
              {content.title}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
              <span>📊 Analyzed: {new Date(content.lastAnalyzed).toLocaleDateString()}</span>
              {content.contentAnalysis?.pageType && (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  📄 {content.contentAnalysis.pageType.replace(/-/g, ' ').toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 sm:p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Executive Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                📊 Executive Summary
              </h3>
              <div className="text-center sm:text-right">
                <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(content.overallScore)}`}>
                  {Math.round(content.overallScore)}/100
                </div>
                <div className={`text-xs sm:text-sm font-medium ${getScoreColor(content.overallScore)}`}>
                  {getScoreLabel(content.overallScore)}
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-3 sm:mb-4">
              <div 
                className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${content.overallScore >= 80 ? 'bg-green-500' : content.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(content.overallScore, 100)}%` }}
              ></div>
            </div>
            
            {/* Content Stats */}
            {content.contentAnalysis && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mt-3 sm:mt-4">
                <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{content.contentAnalysis.wordCount || 0}</div>
                  <div className="text-xs text-gray-600">Words</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{content.contentAnalysis.headingStructure?.h1Count || 0}</div>
                  <div className="text-xs text-gray-600">H1 Tags</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{content.contentAnalysis.headingStructure?.h2Count || 0}</div>
                  <div className="text-xs text-gray-600">H2 Tags</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{content.contentAnalysis.schemaTypes?.length || 0}</div>
                  <div className="text-xs text-gray-600">Schema Types</div>
                </div>
              </div>
            )}
          </div>

          {/* Key Strengths and Issues */}
          {(content.contentAnalysis?.keyStrengths || content.contentAnalysis?.criticalIssues) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              {content.contentAnalysis?.keyStrengths && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 lg:p-6 border border-green-200">
                  <h4 className="font-bold text-green-900 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
                    ✅ What's Working Well
                  </h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {content.contentAnalysis.keyStrengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-green-100">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="text-xs sm:text-sm text-green-800 font-medium break-words">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {content.contentAnalysis?.criticalIssues && (
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-3 sm:p-4 lg:p-6 border border-red-200">
                  <h4 className="font-bold text-red-900 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
                    ⚠️ Critical Issues to Fix
                  </h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {content.contentAnalysis.criticalIssues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-red-100">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <span className="text-xs sm:text-sm text-red-800 font-medium break-words">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Detailed AI Analysis Scores */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              🔍 Detailed AI Analysis Report
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              {content.scores && Object.entries(content.scores).map(([key, scoreData], index) => {
                const scorePercentage = (scoreData.score || 0) * 10;
                const scoreColor = scorePercentage >= 80 ? 'green' : scorePercentage >= 60 ? 'yellow' : 'red';
                
                return (
                  <div key={key} className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    {/* Score Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 capitalize flex items-center gap-2">
                          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${
                                scoreColor === 'green' ? 'bg-green-500' : 
                                scoreColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(scorePercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`text-lg font-bold ${getScoreColor(scorePercentage)}`}>
                            {scoreData.score}/10
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* AI Analysis Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* What AI Found */}
                      {scoreData.reasons && scoreData.reasons.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            🔍 What AI Found:
                          </h5>
                          <ul className="space-y-2">
                            {scoreData.reasons.map((reason, reasonIndex) => (
                              <li key={reasonIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* How to Improve */}
                      {scoreData.improvements && scoreData.improvements.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            💡 How to Improve:
                          </h5>
                          <ul className="space-y-2">
                            {scoreData.improvements.map((improvement, improvementIndex) => (
                              <li key={improvementIndex} className="flex items-start gap-2 text-sm text-blue-700">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                                <span className="font-medium">{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Fallback for legacy format */}
                    {!scoreData.reasons && !scoreData.improvements && (
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                        {key === 'executiveSummary' && (
                          <p>{scoreData.present ? '✅ Executive summary found' : '❌ No executive summary detected'}</p>
                        )}
                        {key === 'tldrSection' && (
                          <p>{scoreData.present ? '✅ TL;DR section found' : '❌ No TL;DR section detected'}</p>
                        )}
                        {key === 'faqSection' && (
                          <p>{scoreData.present ? `✅ FAQ section with ${scoreData.questionCount} questions` : '❌ No FAQ section detected'}</p>
                        )}
                        {key === 'contentDepth' && (
                          <div>
                            <p>📝 {scoreData.wordCount} words</p>
                            <p>⏱️ {scoreData.readingTime} min read</p>
                          </div>
                        )}
                        {key === 'headingStructure' && (
                          <p>H1: {scoreData.h1Count} | H2: {scoreData.h2Count} | H3: {scoreData.h3Count}</p>
                        )}
                        {key === 'structuredData' && (
                          <p>{scoreData.schemaTypes?.length > 0 
                            ? `✅ Schema types: ${scoreData.schemaTypes.join(', ')}` 
                            : '❌ No structured data detected'}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Optimization Suggestions */}
          {content.suggestions && content.suggestions.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                🚀 AI Optimization Roadmap
              </h3>
              
              <div className="space-y-4">
                {content.suggestions.map((suggestion, index) => {
                  const isObject = typeof suggestion === 'object';
                  const priority = isObject ? suggestion.priority : 'medium';
                  const priorityConfig = {
                    high: { bg: 'bg-red-50 border-red-200', badge: 'bg-red-500 text-white', icon: '🔥' },
                    medium: { bg: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-500 text-white', icon: '⚡' },
                    low: { bg: 'bg-green-50 border-green-200', badge: 'bg-green-500 text-white', icon: '💡' }
                  };
                  const config = priorityConfig[priority] || priorityConfig.medium;
                  
                  return (
                    <div key={index} className={`${config.bg} border-2 rounded-xl p-6 hover:shadow-md transition-shadow`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{config.icon}</span>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">
                              {isObject ? suggestion.suggestion || suggestion.category || 'Optimization suggestion' : suggestion}
                            </h4>
                            {isObject && suggestion.category && (
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mt-1">
                                {suggestion.category.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        {isObject && suggestion.priority && (
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${config.badge}`}>
                            {suggestion.priority.toUpperCase()} PRIORITY
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Expected Impact */}
                        {isObject && suggestion.potentialImpact && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                              📈 Expected Impact:
                            </h5>
                            <p className="text-sm text-gray-700">{suggestion.potentialImpact}</p>
                          </div>
                        )}
                        
                        {/* Implementation Guide */}
                        {isObject && suggestion.implementation && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                              🛠️ How to Implement:
                            </h5>
                            <p className="text-sm text-gray-700 font-medium">{suggestion.implementation}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          ✓ Mark as Implemented
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analysis Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📋 Analysis Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4 border">
                <div className="font-semibold text-gray-700 mb-1">Page URL:</div>
                <a href={content.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 break-all">
                  {content.url}
                </a>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="font-semibold text-gray-700 mb-1">Last Analyzed:</div>
                <div className="text-gray-600">{new Date(content.lastAnalyzed).toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="font-semibold text-gray-700 mb-1">Analysis Status:</div>
                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  ✅ COMPLETED
                </span>
              </div>
            </div>
            
            {/* Schema Information */}
            {content.contentAnalysis?.schemaTypes && content.contentAnalysis.schemaTypes.length > 0 && (
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <div className="font-semibold text-gray-700 mb-2">Detected Schema Types:</div>
                <div className="flex flex-wrap gap-2">
                  {content.contentAnalysis.schemaTypes.map((schema, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {schema}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            🤖 Powered by AI • Analysis takes ~20-30 seconds
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-white"
            >
              Close Report
            </button>
            <button
              onClick={() => window.open(content.url, '_blank')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Live Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
