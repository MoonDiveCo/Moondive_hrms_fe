'use client';

import { useState, useEffect,useCallback  } from 'react';
import { X, Mail, Phone, Building, Calendar, TrendingUp, MessageSquare, FileText, ExternalLink, Clock, MapPin, Globe } from 'lucide-react';

export default function LeadDetail({ leadId, leadData, onClose, onUpdate }) {
  const [lead, setLead] = useState(leadData || null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(!leadData);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [savingFollowUp, setSavingFollowUp] = useState(false);


   const fetchLeadDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/${leadId}`
      );
      const data = await response.json();
      if (data.responseCode === 200 || data.success) {
        setLead(data.result);
      }
    } catch (error) {
      console.error('Failed to fetch lead details:', error);
    } finally {
      setLoading(false);
    }
  }, [leadId]); // depends on leadId

  // 2️⃣ Wrap fetchActivities in useCallback
  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/${leadId}/activities`
      );
      const data = await response.json();
      if (data.responseCode === 200 || data.success) {
        setActivities(data.result);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  }, [leadId]); // depends on leadId

  // 3️⃣ Effect that uses both fetch functions
  useEffect(() => {
    if (!leadData) {
      fetchLeadDetails();
    }
    fetchActivities();
  }, [leadId, leadData, fetchLeadDetails, fetchActivities]);

  // 4️⃣ Effect that syncs follow-up fields when `lead` changes
  useEffect(() => {
    if (lead) {
      setFollowUpDate(
        lead.followUpDate
          ? new Date(lead.followUpDate).toISOString().split('T')[0]
          : ''
      );
      setFollowUpNotes(lead.followUpNotes || '');
    }
  }, [lead]);


  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSavingNote(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/${leadId}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote })
      });

      if (response.ok) {
        setNewNote('');
        fetchLeadDetails();
        fetchActivities();
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setSavingNote(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchLeadDetails();
        onUpdate && onUpdate();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSetFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpDate) return;

    setSavingFollowUp(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/${leadId}/follow-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpDate, followUpNotes })
      });

      if (response.ok) {
        alert('Follow-up reminder set successfully!');
        fetchLeadDetails();
        fetchActivities();
      }
    } catch (error) {
      console.error('Failed to set follow-up:', error);
      alert('Failed to set follow-up reminder');
    } finally {
      setSavingFollowUp(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    const icons = {
      'form_submit': <FileText className="w-4 h-4" />,
      'page_view': <Globe className="w-4 h-4" />,
      'chatbot_conversation': <MessageSquare className="w-4 h-4" />,
      'resource_download': <FileText className="w-4 h-4" />,
      'note_added': <MessageSquare className="w-4 h-4" />,
      'status_change': <TrendingUp className="w-4 h-4" />
    };
    return icons[type] || <Clock className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!lead) return null;

  const getGradeColor = (grade) => {
    const colors = {
      'Hot': 'bg-red-100 text-red-700 border-red-200',
      'Warm': 'bg-orange-100 text-orange-700 border-orange-200',
      'Cold': 'bg-blue-100 text-blue-700 border-blue-200',
      'Frozen': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[grade] || colors['Frozen'];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">
                {lead.firstName} {lead.lastName}
              </h2>
              <div className={`px-3 py-1 rounded-full border text-sm font-semibold ${getGradeColor(lead.leadGrade)}`}>
                {lead.leadGrade} • {lead.leadScore}/100
              </div>
            </div>
            <p className="text-blue-100">{lead.jobTitle || 'Unknown Position'} {lead.companyName ? `at ${lead.companyName}` : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="border-b border-gray-200 p-4 flex gap-2 flex-wrap">
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Lead
          </a>
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call Lead
            </a>
          )}
          <select
            value={lead.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={updatingStatus}
            className="px-4 py-2 text-primary-50/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'activity', label: 'Activity Timeline' },
              ...(lead.behavior?.interactions ? [{ id: 'chat', label: '💬 Chat History' }] : []),
              { id: 'emails', label: 'Email History' },
              { id: 'notes', label: 'Notes' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-3 px-4 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem icon={<Mail />} label="Email" value={lead.email} />
                  {lead.phone && <InfoItem icon={<Phone />} label="Phone" value={lead.phone} />}
                  {lead.companyName && <InfoItem icon={<Building />} label="Company" value={lead.companyName} />}
                  {lead.companySize && <InfoItem icon={<TrendingUp />} label="Company Size" value={lead.companySize} />}
                  {lead.location && <InfoItem icon={<MapPin />} label="Location" value={lead.location} />}
                  {lead.companyWebsite && (
                    <InfoItem
                      icon={<Globe />}
                      label="Website"
                      value={<a href={lead.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        {lead.companyWebsite} <ExternalLink className="w-3 h-3" />
                      </a>}
                    />
                  )}
                </div>
              </div>

              {/* Lead Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Source" value={lead.source} />
                  <InfoItem label="Status" value={lead.status} />
                  <InfoItem label="Lead Score" value={`${lead.leadScore}/100`} />
                  <InfoItem label="Lead Grade" value={lead.leadGrade} />
                  <InfoItem label="Created" value={formatDate(lead.createdAt)} />
                  <InfoItem label="Last Activity" value={formatDate(lead.lastActivityAt || lead.createdAt)} />
                </div>
              </div>

              {/* Engagement Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <MetricCard label="Pages Viewed" value={lead.pagesVisited?.length || 0} />
                  <MetricCard label="Total Time on Site" value={`${lead.totalTimeOnSite || 0}s`} />
                  <MetricCard label="Downloads" value={lead.downloadedResources?.length || 0} />
                  <MetricCard label="Chat Conversations" value={lead.chatbotConversations?.length || 0} />
                  <MetricCard label="Pricing Viewed" value={lead.viewedPricing ? 'Yes' : 'No'} />
                  <MetricCard label="Demo Requested" value={lead.requestedDemo ? 'Yes' : 'No'} />
                </div>
              </div>

              {/* UTM Parameters */}
              {(lead.utmSource || lead.utmMedium || lead.utmCampaign) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing Attribution</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {lead.utmSource && <InfoItem label="UTM Source" value={lead.utmSource} />}
                    {lead.utmMedium && <InfoItem label="UTM Medium" value={lead.utmMedium} />}
                    {lead.utmCampaign && <InfoItem label="UTM Campaign" value={lead.utmCampaign} />}
                    {lead.utmTerm && <InfoItem label="UTM Term" value={lead.utmTerm} />}
                  </div>
                </div>
              )}

              {/* Follow-up Reminder */}
              {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⏰ Follow-up Reminder</h3>
                {lead.followUpDate && (
                  <div className="mb-4 p-3 bg-white rounded border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Scheduled: {new Date(lead.followUpDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    {lead.followUpNotes && (
                      <p className="text-sm text-gray-600 mt-2">📝 {lead.followUpNotes}</p>
                    )}
                  </div>
                )}
                <form onSubmit={handleSetFollowUp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      value={followUpNotes}
                      onChange={(e) => setFollowUpNotes(e.target.value)}
                      rows={3}
                      placeholder="What do you want to discuss or remember?"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingFollowUp || !followUpDate}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingFollowUp ? 'Saving...' : (lead.followUpDate ? 'Update Follow-up' : 'Set Follow-up')}
                  </button>
                </form>
              </div> */}
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No activities recorded yet</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity._id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        {getActivityIcon(activity.activityType)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            {JSON.stringify(activity.metadata, null, 2)}
                          </div>
                        )}
                      </div>
                      {activity.pointsAwarded > 0 && (
                        <div className="text-sm font-semibold text-green-600">
                          +{activity.pointsAwarded} pts
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 Chatbot Conversation</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {lead.intent && (
                  <div className="mb-4 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm font-semibold text-gray-700">Detected Intent</p>
                    <p className="text-sm text-gray-900">{lead.intent}</p>
                  </div>
                )}
                {lead.sentiment && (
                  <div className="mb-4 p-3 bg-white rounded-lg border-l-4 border-green-500">
                    <p className="text-sm font-semibold text-gray-700">Sentiment</p>
                    <p className="text-sm text-gray-900 capitalize">{lead.sentiment}</p>
                  </div>
                )}

               

                {lead.behavior?.interactions && Array.isArray(lead.behavior.interactions) && lead.behavior.interactions.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {lead.behavior.interactions.map((interaction, index) => {
                      const isBot = interaction.type === 'bot';
                      const messageContent = interaction.message || interaction.content || '';

                      return (
                        <div
                          key={index}
                          className={`flex ${isBot ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2 rounded-lg shadow-sm text-sm ${
                              isBot
                                ? 'bg-blue-100 text-blue-900 rounded-br-none'
                                : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-500">
                                {isBot ? '🤖 Bot' : '👤 User'}
                              </span>
                              {interaction.timestamp && (
                                <span className="text-xs text-gray-400">
                                  {new Date(interaction.timestamp).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                            <div className="whitespace-pre-wrap">{messageContent}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No chat history available</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {lead.message ? `Last message: "${lead.message.substring(0, 100)}${lead.message.length > 100 ? '...' : ''}"` : 'No messages recorded'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'emails' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email History</h3>
              {!lead.emailHistory || lead.emailHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No emails sent yet</p>
                  <p className="text-sm text-gray-400 mt-1">Email history will appear here once you contact this lead</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lead.emailHistory.map((email, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{email.subject}</h4>
                            <p className="text-xs text-gray-500">
                              Sent {formatDate(email.sentAt)} by {email.sentBy || 'Admin'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap">
                        {email.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="mb-6">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this lead..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={savingNote || !newNote.trim()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingNote ? 'Saving...' : 'Add Note'}
                </button>
              </form>

              {/* Notes List */}
              {lead.notes && lead.notes.length > 0 ? (
                <div className="space-y-4">
                  {lead.notes.map((note, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-900">{note.note}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(note.createdAt)} • {note.createdBy}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No notes yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <div className="text-gray-400 mt-0.5">{icon}</div>}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
