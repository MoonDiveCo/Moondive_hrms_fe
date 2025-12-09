'use client'

import { useEffect, useState } from 'react';
import { EnhancedTableShimmer } from '@/components/UI/ShimmerComponents';
import { toast } from 'react-toastify';
import BrandPerception from './BrandPerception';
import { platforms } from '@/constants/GenAI';
import Image from 'next/image';
import axios from 'axios';

const AdvancedGenAI = () => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('ChatGPT');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [testingInProgress, setTestingInProgress] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [generateCount, setGenerateCount] = useState(5);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedQuestionForModal, setSelectedQuestionForModal] = useState(null);
  const questionsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [questionsRes, statsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/advanced-ai/questions`),
        axios.get( `${process.env.NEXT_PUBLIC_MOONDIVE_API}/advanced-ai/dashboard-stats`)
      ]);

      if (questionsRes?.data?.responseCode === 200) {
        setQuestions(questionsRes.data.result.questions || []);
      }

      if (statsRes?.data?.responseCode === 200) {
        setDashboardStats(statsRes.data.result);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleRunAllTests = async () => {
    setTestingInProgress(true);
    try {
      const response = await axios.post( `${process.env.NEXT_PUBLIC_MOONDIVE_API}/advanced-ai/test-all`);

      if (response?.data?.responseCode === 200) {
        toast.success('All tests completed successfully');
        fetchData();
      } else {
        toast.error('Tests failed');
      }
    } catch (error) {
      console.error('Error running tests:', error);
      toast.error('Failed to run tests');
    } finally {
      setTestingInProgress(false);
    }
  };

  const handleRunSelectedTests = async () => {
    if (selectedQuestions.length === 0) {
      toast.warning('Please select at least one question');
      return;
    }

    setTestingInProgress(true);
    try {
      const promises = selectedQuestions.map(id =>
        axios.post( `${process.env.NEXT_PUBLIC_MOONDIVE_API}/advanced-ai/test/${id}`)
      );

      await Promise.all(promises);
      toast.success(`Tested ${selectedQuestions.length} questions successfully`);
      setSelectedQuestions([]);
      fetchData();
    } catch (error) {
      console.error('Error running selected tests:', error);
      toast.error('Failed to run selected tests');
    } finally {
      setTestingInProgress(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    try {
      const response = await axios.post( `${process.env.NEXT_PUBLIC_MOONDIVE_API}/advanced-ai/generate-questions`, {
        count: generateCount
      });

      if (response?.data?.responseCode === 201 || response?.data?.responseCode === 200) {
        toast.success(`Generated ${generateCount} questions successfully`);
        setShowGenerateModal(false);
        setGenerateCount(5);
        fetchData();
      } else {
        toast.error('Failed to generate questions');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate questions');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) {
      toast.warning('Please enter a question');
      return;
    }

    try {
      const capitalizedQuestion = capitalizeFirstLetter(newQuestion.trim());
      const response = await axios.post( `${process.env.NEXT_PUBLIC_MOONDIVE_API}/advanced-ai/questions`, {
        question: capitalizedQuestion
      });

      if (response?.data?.responseCode === 201) {
        toast.success('Question added successfully');
        setShowAddModal(false);
        setNewQuestion('');
        fetchData();
      } else {
        toast.error('Failed to add question');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setEditQuestionText(question.question);
    setShowEditModal(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editQuestionText.trim()) {
      toast.warning('Please enter a question');
      return;
    }

    try {
      const capitalizedQuestion = capitalizeFirstLetter(editQuestionText.trim());
      const response = await axios.put(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/advanced-ai/questions/${editingQuestion._id}`, {
        question: capitalizedQuestion
      });

      if (response?.data?.responseCode === 200) {
        toast.success('Question updated successfully');
        setShowEditModal(false);
        setEditingQuestion(null);
        setEditQuestionText('');
        fetchData();
      } else {
        toast.error('Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const response = await axios.delete( `${process.env.NEXT_PUBLIC_MOONDIVE_API}/advanced-ai/questions/${id}`);

      if (response?.data?.responseCode === 200) {
        toast.success('Question deleted successfully');
        fetchData();
      } else {
        toast.error('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const toggleQuestionSelection = (id) => {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]
    );
  };

  const toggleAllQuestions = () => {
    if (selectedQuestions.length === currentQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(currentQuestions.map(q => q._id));
    }
  };

  const toggleQuestionExpanded = (id) => {
    setExpandedQuestions(prev =>
      prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]
    );
  };

  // Get current platform stats
  const currentPlatformStats = dashboardStats?.platformStats?.[selectedPlatform] || { total: 0, mentioned: 0 };
  const visibilityPercentage = currentPlatformStats.total > 0
    ? Math.round((currentPlatformStats.mentioned / currentPlatformStats.total) * 100)
    : 0;

  // Filter questions based on selected platform and status
  const filteredQuestions = questions.filter(q => {
    if (!q.lastTestResult) return false;

    const platformResult = q.lastTestResult.platforms?.find(p => p.platform === selectedPlatform);
    if (!platformResult) return false;

    if (filterStatus === 'mentioned') {
      return platformResult.isMentioned;
    } else if (filterStatus === 'not-mentioned') {
      return !platformResult.isMentioned;
    }
    return true;
  });

  // Pagination
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  if (loading) {
    return <EnhancedTableShimmer />;
  }

  return (
    <div className="p-8 bg-white min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <h4 className=" text-primaryText mb-2">AI Visibility Overview</h4>
        <p className="text-gray-600">
          Explore your site's visibility and perception across AI platforms.{' '}
          <a href="#" className="text-blue-600 hover:underline">Learn more</a>
        </p>
      </div>

      {/* Platform Tabs + Buttons Row */}
      <div className="grid grid-cols-1 gap-4 items-center justify-between mb-6">
        <div className="flex gap-3">
          {platforms.map((platform) => {
            const stats = dashboardStats?.platformStats?.[platform.name] || { total: 0, mentioned: 0 };
            const percentage = stats.total > 0 ? Math.round((stats.mentioned / stats.total) * 100) : 0;

            return (
              <button
                key={platform.name}
                onClick={() => {
                  setSelectedPlatform(platform.name);
                  setCurrentPage(1);
                  setSelectedQuestions([]);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedPlatform === platform.name
                    ? 'bg-primary/10 text-primary border-2 border-primary'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Image src={platform.icon} width={15} height={15} alt={platform.name} />
                  <span>{platform.name}</span>
                  <span className="text-sm">{percentage}%</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-right gap-3">
          {selectedQuestions.length > 0 && (
            <button
              onClick={handleRunSelectedTests}
              disabled={testingInProgress}
              className="px-4 py-2 flex items-center gap-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Run Selected ({selectedQuestions.length})
            </button>
          )}
          <button
            onClick={handleRunAllTests}
            disabled={testingInProgress}
            className={`px-4 py-2 flex items-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors ${
              testingInProgress ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {testingInProgress ? 'Testing...' : 'Run All Tests'}
          </button>
        </div>
      </div>

      {/* Site Mentions Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Site mentions</h2>
            <p className="text-sm text-gray-600">
              See how often your site is mentioned or cited by AI in response to potential user questions.
            </p>
          </div>
          <button
            onClick={() => setShowManageModal(true)}
            className="text-blue-600 hover:text-primary-100 font-medium text-sm flex items-center whitespace-nowrap gap-2 items-center border border-primary-500 px-1 py-2 rounded-lg hover:bg-primary-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Manage Questions
          </button>
        </div>

        {/* Circular Progress + Stats */}
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="50" stroke="#E5E7EB" strokeWidth="12" fill="none" />
              <circle
                cx="64" cy="64" r="50"
                stroke="#10a37f"
                strokeWidth="12"  
                fill="none"
                strokeDasharray={`${(visibilityPercentage / 100) * 2 * Math.PI * 50} ${2 * Math.PI * 50}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{visibilityPercentage}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{selectedPlatform} visibility score</span>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">All</span>
                <span className="text-sm font-semibold text-gray-900">• {currentPlatformStats.total}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-600">Mentioned</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">• {currentPlatformStats.mentioned}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm text-gray-600">Not mentioned</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">• {currentPlatformStats.total - currentPlatformStats.mentioned}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => { setFilterStatus('all'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterStatus === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All • {currentPlatformStats.total}
          </button>
          <button
            onClick={() => { setFilterStatus('mentioned'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
              filterStatus === 'mentioned' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mentioned • {currentPlatformStats.mentioned}
          </button>
          <button
            onClick={() => { setFilterStatus('not-mentioned'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
              filterStatus === 'not-mentioned' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Not mentioned • {currentPlatformStats.total - currentPlatformStats.mentioned}
          </button>
        </div>

        {/* Select All Checkbox */}
        {currentQuestions.length > 0 && (
          <div className="mt-4 pb-3 border-b border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedQuestions.length === currentQuestions.length}
                onChange={toggleAllQuestions}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 font-medium">
                Select all on this page ({currentQuestions.length})
              </span>
            </label>
          </div>
        )}

        {/* Question List */}
        <div className="mt-4 space-y-4">
          {currentQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No questions found for the selected filter
            </div>
          ) : (
            currentQuestions.map((question, index) => {
              const platformResult = question.lastTestResult?.platforms?.find(p => p.platform === selectedPlatform);
              const isMentioned = platformResult?.isMentioned;
              const hasBranding = platformResult?.hasBrandName || platformResult?.hasDomain;

              const isExpanded = expandedQuestions.includes(question._id);
              const position = (currentPage - 1) * questionsPerPage + index + 1;

              return (
                <div key={question._id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 min-w-[30px]">#{position}</span>
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question._id)}
                        onChange={() => toggleQuestionSelection(question._id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <h5 className="text-gray-900 font-normal flex-1">{question.question}</h5>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className={`flex items-center gap-1 ${hasBranding ? 'text-gray-700' : 'text-gray-400'}`}>
                          {hasBranding ? (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          )}
                          {hasBranding ? 'Branded' : 'Non branded'}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {platformResult?.sources?.length || 0} sources
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isMentioned ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-md text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Mentioned
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-md text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className='text-center'>
                          Not mentioned</span>
                        </span>
                      )}
                       <button
                          onClick={() => {
                            setSelectedQuestionForModal(question);
                            setShowResponseModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Edit question"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question._id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete question"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                  currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Brand Perception Section */}
      <div className="mt-8">
        <BrandPerception
          provider={
            selectedPlatform === 'ChatGPT' ? 'OPENAI' :
            selectedPlatform === 'Claude' ? 'CLAUDE' :
            selectedPlatform === 'Gemini' ? 'GEMINI' :
            'PERPLEXITY'
          }
          platformName={selectedPlatform}
          platformColor={platforms.find(p => p.name === selectedPlatform)?.color}
        />
      </div>

      {/* Manage Questions Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowManageModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Manage Questions</h3>
            <div className="space-y-3">
              <button
                onClick={() => { setShowManageModal(false); setShowAddModal(true); }}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Manual Question
              </button>
              <button
                onClick={() => { setShowManageModal(false); setShowGenerateModal(true); }}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate AI Questions
              </button>
              <button
                onClick={() => setShowManageModal(false)}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Manual Question</h3>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Enter your question here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-2">Note: The first letter will be automatically capitalized.</p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddQuestion}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Question
              </button>
              <button
                onClick={() => { setShowAddModal(false); setNewQuestion(''); }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Questions Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowGenerateModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Generate AI Questions</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of questions to generate:
              </label>
              <input
                type="number"
                value={generateCount}
                onChange={(e) => setGenerateCount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGenerateQuestions}
                disabled={generatingQuestions}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {generatingQuestions ? 'Generating...' : 'Generate'}
              </button>
              <button
                onClick={() => { setShowGenerateModal(false); setGenerateCount(5); }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {showEditModal && editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Question</h3>
            <textarea
              value={editQuestionText}
              onChange={(e) => setEditQuestionText(e.target.value)}
              placeholder="Enter your question here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleUpdateQuestion}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Question
              </button>
              <button
                onClick={() => { setShowEditModal(false); setEditingQuestion(null); setEditQuestionText(''); }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedQuestionForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowResponseModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">{selectedPlatform} response</h3>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {(() => {
                const platformResult = selectedQuestionForModal.lastTestResult?.platforms?.find(p => p.platform === selectedPlatform);
                const platformInfo = platforms.find(p => p.name === selectedPlatform);

                if (!platformResult) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      No test results available for this platform
                    </div>
                  );
                }

                return (
                  <>
                    {/* Question with Platform Icon */}
                    <div className="mb-6 flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${platformInfo?.color}20` }}
                      >
                        <Image src={platformInfo.icon} width={20} height={20} alt={platformInfo.name} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{selectedQuestionForModal.question}</h4>
                      </div>
                    </div>

                    {/* Error Message */}
                    {platformResult.error && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-red-900 mb-1">
                              {platformResult.errorType === 'INVALID_CREDENTIALS' && 'Invalid API Credentials'}
                              {platformResult.errorType === 'QUOTA_EXCEEDED' && 'API Quota Exceeded'}
                              {platformResult.errorType === 'NETWORK_ERROR' && 'Network Error'}
                              {(!platformResult.errorType || platformResult.errorType === 'UNKNOWN_ERROR') && 'Error Occurred'}
                            </h5>
                            <p className="text-sm text-red-700 mb-2">{platformResult.errorMessage || 'An error occurred'}</p>
                            {platformResult.errorType === 'INVALID_CREDENTIALS' && (
                              <p className="text-xs text-red-600">Please configure a valid API key in the environment variables.</p>
                            )}
                            {platformResult.errorType === 'QUOTA_EXCEEDED' && (
                              <p className="text-xs text-red-600">You have exceeded your API quota. Please wait or upgrade your plan.</p>
                            )}
                            {platformResult.canRetry && (
                              <p className="text-xs text-red-600 mt-1">You can retry this test later.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Response Content - Only show if no error */}
                    {!platformResult.error && platformResult.response && (
                      <div className="mb-8">
                        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap text-base">{platformResult.response}</p>
                      </div>
                    )}

                    {/* Sources Section - Only show if no error and has sources */}
                    {!platformResult.error && platformResult.sources && platformResult.sources.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-6 -mx-6 -mb-6">
                        <h5 className="text-base font-semibold text-gray-900 mb-4">
                          Sources used:
                        </h5>
                        <div className="space-y-3">
                          {platformResult.sources.map((source, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-lg">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${platformInfo?.color}20` }}
                              >
                                <svg className="w-5 h-5" style={{ color: platformInfo?.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                              </div>
                              <a
                                href={source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-900 hover:text-blue-600 hover:underline break-all flex-1 pt-2"
                              >
                                {source}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedGenAI;
