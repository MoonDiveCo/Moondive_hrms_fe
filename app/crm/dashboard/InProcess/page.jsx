"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';



import LeadList from "../../../../components/CrmDashboard/LeadList";
import FilterDropdown from "../../../../components/CrmDashboard/ui/FilterDropdown";

function getDefaultStats() {
  return {
    totalLeads: 0,
    hotLeads: 0,
    warmLeads: 0,
    coldLeads: 0,
    frozenLeads: 0,
    archivedLeads: 0,
    leadsThisWeek: 0,
    averageScore: 0,
    hotLeadsPercentage: 0,
    weekOverWeekGrowth: 0,
    scoreImprovement: 0,
    leads: [],
  };
}

export default function InProcessPage() {
  const [baseLeads, setBaseLeads] = useState([]); 
  const [allLeads, setAllLeads] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState(getDefaultStats());

  const [filters, setFilters] = useState({
    search: "",
    time: "",
    score: "",
    leadType: "",
    grade: "",
    page: 1,
    limit: 10,
  });

  const [activeTab, setActiveTab] = useState("all");

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailModal, setEmailModal] = useState({
    open: false,
    recipients: [],
    type: "individual",
  });
  const fetchStatsAndLeads = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/stats`,
        {
          params: { status: "In Process" },
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response.data;

      if (data?.responseCode === 200 || data?.success) {
        const result = data.result || {};
        const leadsFromApi = result.leads || [];


        const normalized = leadsFromApi.map((l) => ({
          ...l,
          _sourceLabel: l._sourceLabel || l.source || "",
        }));

        setBaseLeads(normalized);
        setStats({
          ...getDefaultStats(),
          ...result,
          leads: normalized,
        });
      } else {
        setStats(getDefaultStats());
        setBaseLeads([]);
      }
    } catch (error) {
      console.error("Error fetching In-Process stats/leads:", error);
      toast.error("Error loading In-Process leads");
      setStats(getDefaultStats());
      setBaseLeads([]);
    } finally {
      setLoading(false);
    }
  };

  // apply filters on baseLeads
 const applyFilters = () => {
    let filtered = [...baseLeads];

    // Tabs → grade filter (Hot/Warm/Cold)
    if (filters.grade) {
      filtered = filtered.filter(
        (lead) =>
          lead.leadGrade?.toLowerCase() === filters.grade.toLowerCase()
      );
    }

    // Source filter
    if (filters.leadType) {
      if (filters.leadType === "direct") {
        filtered = filtered.filter((l) => l._sourceLabel === "Contact Form");
      } else if (filters.leadType === "chatbot") {
        filtered = filtered.filter((l) => l._sourceLabel === "Chatbot");
      } else if (filters.leadType === "schedule") {
        filtered = filtered.filter((l) => l._sourceLabel === "Schedule Meeting");
      } else if (filters.leadType === "sdrLeads") {
        filtered = filtered.filter((l) => l._sourceLabel === "SDR Leads");
      }
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.fullName?.toLowerCase().includes(searchLower) ||
          lead.firstName?.toLowerCase().includes(searchLower) ||
          lead.lastName?.toLowerCase().includes(searchLower) ||
          lead.email?.toLowerCase().includes(searchLower) ||
          lead.company?.toLowerCase().includes(searchLower) ||
          lead.companyName?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by time
    if (filters.time === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.time === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    // Sort by score (default: highest)
    if (filters.score === "highest") {
      filtered.sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));
    } else if (filters.score === "lowest") {
      filtered.sort((a, b) => (a.leadScore || 0) - (b.leadScore || 0));
    } else {
      filtered.sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));
    }

    setAllLeads(filtered);
  };

  useEffect(() => {
    fetchStatsAndLeads();
  }, []);

  // re-apply filters whenever baseLeads or filters change
  useEffect(() => {
    applyFilters();
  }, [baseLeads, filters]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    setFilters((prev) => {
      const base = { ...prev, page: 1 };

      if (tab === "all") {
        return { ...base, grade: "" }; // all grades
      }

      // hot / warm / cold tabs
      return {
        ...base,
        grade: tab.charAt(0).toUpperCase() + tab.slice(1),
      };
    });
  };


  const handleSendEmail = (lead) => {
    setEmailModal({
      open: true,
      recipients: [lead],
      type: "individual",
    });
  };

  const sendEmail = async (emailData) => {
    setSendingEmail(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/send-email`,
        emailData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response.data;

      if (data.responseCode === 200 || data.success) {
        toast.success("Email sent successfully!");
        setEmailModal({ open: false, recipients: [], type: "individual" });
        fetchStatsAndLeads();
      } else {
        toast.error(
          "Failed to send email: " + (data.responseMessage || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send email. Check console for details.");
    } finally {
      setSendingEmail(false);
    }
  };

  if(loading){
    return(
      <div className='flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: 'center' }} // add this
        />
      </div>
    )
  }

  return (
    <div className="w-full p-6">
      <div className="mb-6 flex justify-between items-center">
        <h4 className="text-primaryText">In-Process Leads</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="In-Process Leads"
          value={stats.totalLeads}
          change={stats.leadsThisWeek}
          changeLabel="this week"
        />
        <StatCard
          label="Hot Leads (In-Process)"
          value={stats.hotLeads}
          change={stats.hotLeadsPercentage}
          changeLabel="of in-process"
          isPercentage
        />
        <StatCard
          label="Avg Lead Score"
          value={Math.round(stats.averageScore || 0)}
          change={stats.scoreImprovement || 0}
          changeLabel="vs last week"
        />
        <StatCard
          label="This Week (In-Process)"
          value={stats.leadsThisWeek}
          change={stats.weekOverWeekGrowth || 0}
          changeLabel="growth"
          isPercentage
        />
      </div>

      {/* Tabs + Filters + List */}
      <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: "all", label: "All Leads", count: stats.totalLeads },
              { id: "hot", label: "Hot", count: stats.hotLeads },
              { id: "warm", label: "Warm", count: stats.warmLeads },
              { id: "cold", label: "Cold", count: stats.coldLeads },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                {tab.label}
                <span className="ml-2 py-0.5 px-2 rounded-full bg-gray-100 text-gray-600 text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Filters & Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                      page: 1,
                    }))
                  }
                  className="w-full pl-10 pr-4 py-2 rounded-full border bg-whiteBg text-blackText border-gray-300 text-xs md:text-sm hover:border-primary focus:border-primary focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-wrap items-center gap-3 justify-end">
              <FilterDropdown
                label="Sort by Time"
                value={filters.time}
                options={[
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" },
                ]}
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, time: val, page: 1 }))
                }
              />

              <FilterDropdown
                label="Sort by Score"
                value={filters.score}
                options={[
                  { value: "highest", label: "Highest" },
                  { value: "lowest", label: "Lowest" },
                ]}
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, score: val, page: 1 }))
                }
              />

              <FilterDropdown
                label="All Sources"
                value={filters.leadType}
                options={[
                  { value: "", label: "All Sources" },
                  { value: "direct", label: "Contact Form" },
                  { value: "chatbot", label: "Chatbot" },
                  { value: "schedule", label: "Schedule Meeting" },
                  { value: "sdrLeads", label: "SDR Leads" },
                ]}
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, leadType: val, page: 1 }))
                }
              />
            </div>
          </div>
        </div>

        {/* Lead list */}
        <div className="xl:max-w-[75vw] 2xl:max-w-[82vw]">
          <LeadList
            leads={allLeads}
            loading={loading}
            onSelectLead={() => {}}
            sendEmail={handleSendEmail}
            onRefresh={fetchStatsAndLeads}
            currentPage={filters.page}
            leadsPerPage={filters.limit}
            onPageChange={(newPage) =>
              setFilters((prev) => ({ ...prev, page: newPage }))
            }
            selectedLeadIds={[]}
            onToggleLeadSelect={undefined}
            onToggleSelectAll={undefined}
            showContactActions={true}
            showSelection={false}
          />
        </div>
      </div>

      {emailModal.open && (
        <EmailModal
          recipients={emailModal.recipients}
          type={emailModal.type}
          onClose={() =>
            setEmailModal({ open: false, recipients: [], type: "individual" })
          }
          onSend={sendEmail}
          sendingEmail={sendingEmail}
        />
      )}
    </div>
  );
}

function EmailModal({ recipients, type, onClose, onSend, sendingEmail }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!recipients || recipients.length === 0) return;

    const firstLead = recipients[0];

    const defaultSubject = `Thank you for contacting Moondive`;

    const defaultMessage = `
Hi ${firstLead.firstName || firstLead.full_name || ""},

Thank you for reaching out to Moondive!  
We appreciate your interest and would be happy to discuss your requirements.

To schedule a meeting with our team, please use the link below:
 https://moondive.co/schedule-meeting

Feel free to choose any slot that suits you.

Looking forward to connecting!

Warm regards,  
Team Moondive  
www.moondive.co
    `.trim();

    setSubject(defaultSubject);
    setMessage(defaultMessage);
  }, [recipients, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend({
      recipients: recipients.map((r) => r.email),
      subject,
      message,
      leadIds: recipients.map((r) => r._id),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {type === "bulk"
                ? `Send Email to ${recipients.length} Leads`
                : "Send Email"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipients ({recipients.length})
            </label>
            <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
              {recipients.map((lead, index) => (
                <div key={lead._id} className="text-sm text-gray-600 py-1">
                  {index + 1}. {lead.email} - {lead.firstName || lead.fullName}{" "}
                  {lead.lastName || ""}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Enter email subject"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Enter your message..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendingEmail}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
            >
              {sendingEmail
                ? `Sending...`
                : `Send Email${
                    type === "bulk" ? ` to ${recipients.length} Leads` : ""
                  }`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function StatCard({ label, value, change, changeLabel, isPercentage = false }) {
  const displayValue = value ?? 0;
  const displayChange = change ?? 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-2xl font-bold text-primary-500 mb-1">
        {displayValue}
      </div>
      <div className="text-sm text-primary-600 mb-2">{label}</div>
      <div className="text-xs text-primary-500">
        <span className="font-medium text-primary-800">
          {isPercentage ? `${displayChange}%` : displayChange}
        </span>{" "}
        {changeLabel}
      </div>
    </div>
  );
}