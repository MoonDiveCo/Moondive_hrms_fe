"use client";
import { useState, useEffect } from "react";
import { Search, Download ,MoreVertical } from "lucide-react";
import LeadList from "../../../../components/CrmDashboard/LeadList";
import LeadStats from "../../../../components/CrmDashboard/LeadStats";
// import { makeApiRequest } from '../../../../utils/utils';
import { useRouter } from "next/navigation";
import {
  ENDPOINT_CONTACT_LEAD,
  ENDPOINT_INDIRECT_LEAD,
  ENDPOINT_CONNECT_LEAD,
} from "../../../../text";
import { toast } from "react-toastify";
import FilterDropdown from "../../../../components/CrmDashboard/ui/FilterDropdown";

export default function LeadDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [allLeads, setAllLeads] = useState([]);
  const [directLeads, setDirectLeads] = useState([]);
  const [chatbotLeads, setChatbotLeads] = useState([]);
  const [sdrLeads, setSdrLeads] = useState([]);
  const [scheduleMeetingLeads, setScheduleMeetingLeads] = useState([]);
  const [leadScoringLeads, setLeadScoringLeads] = useState([]);
  const [topLeads, setTopLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const [filters, setFilters] = useState({
    grade: "",
    status: "",
    source: "",
    time: "",
    score: "",
    leadType: "",
    search: "",
    page: 1,
    limit: 20,
  });
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [emailModal, setEmailModal] = useState({
    open: false,
    recipients: [],
    type: "bulk",
  });

  // Toggle single lead
const handleToggleLeadSelect = (leadId) => {
  setSelectedLeadIds((prev) =>
    prev.includes(leadId)
      ? prev.filter((id) => id !== leadId)
      : [...prev, leadId]
  );
};

// Toggle "select all" for current page
const handleToggleSelectAll = (pageLeadIds) => {
  setSelectedLeadIds((prev) => {
    const allOnPageSelected = pageLeadIds.every((id) => prev.includes(id));

    if (allOnPageSelected) {
      // unselect all from this page
      return prev.filter((id) => !pageLeadIds.includes(id));
    } else {
      // select all from this page (keep others)
      const set = new Set(prev);
      pageLeadIds.forEach((id) => set.add(id));
      return Array.from(set);
    }
  });
};
// Generic bulk status update
const bulkUpdateStatus = async (newStatus) => {
  if (selectedLeadIds.length === 0) {
    toast.info("Please select at least one lead");
    return;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/bulk-update-status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds: selectedLeadIds,
          status: newStatus,
        }),
      }
    );

    const data = await response.json();

    if (response.ok && (data.success || data.responseCode === 200)) {
      toast.success(
        `Updated ${selectedLeadIds.length} lead(s) to "${newStatus}"`
      );

      setSelectedLeadIds([]);
      setShowStatusMenu(false); // close dropdown
      fetchAllLeads(); // refresh list
    } else {
      toast.error(data.responseMessage || "Failed to update leads");
    }
  } catch (err) {
    
    console.error(err);
    toast.error("Something went wrong while updating leads");
  }
};

// Specific actions
const handleMoveSelectedToInProcess = () => bulkUpdateStatus("In Process");
const handleMoveSelectedToArchived = () => bulkUpdateStatus("Archived");


  useEffect(() => {
    fetchAllLeads();
  }, [filters, filters.time, filters.score]);

  const fetchAllLeads = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDirectLeads(),
        fetchChatbotLeads(),
        fetchScheduleMeetingLeads(),
        fetchLeadScoringLeads(),
        fetchSdrLeads(),
        fetchStats(),
      ]);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  // CONTACT LEADS (Contact form)
  const fetchDirectLeads = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}${ENDPOINT_CONTACT_LEAD}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      const results = data?.result || [];

      const leadsWithSource = results.map((lead) => ({
        ...lead,
        firstName: lead.fullName?.split(" ")[0] || lead.firstName || "",
        lastName:
          lead.fullName?.split(" ").slice(1).join(" ") || lead.lastName || "",
        leadScore: lead.leadScore || 0,
        leadGrade: lead.leadGrade || "Cold",
        status: lead.status || "New",
        companyName: lead.companyName || lead.company || "",
        phone: lead.phone || lead.mobileNumber || "",
        _sourceType: "direct",
        _sourceLabel: "Contact Form",
      }));

      setDirectLeads(leadsWithSource);
      return leadsWithSource;
    } catch (error) {
      console.error("❌ Failed to fetch direct leads:", error);
      setDirectLeads([]);
      return [];
    }
  };

  // SDR LEADS – currently using /leads and treating ALL as SDR (you can filter later)
  const fetchSdrLeads = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      const allLeads = Array.isArray(data?.result?.leads)
        ? data.result.leads
        : Array.isArray(data?.result)
        ? data.result
        : [];

      // TODO: when you know SDR flag, filter here instead of returning all
      const sdrOnly = allLeads; // for now, use all leads

      setSdrLeads(sdrOnly);
      return sdrOnly;
    } catch (error) {
      
      setSdrLeads([]);
      return [];
    }
  };

  // CHATBOT LEADS
  const fetchChatbotLeads = async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}${ENDPOINT_INDIRECT_LEAD}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data = await response.json();
      const results = data?.results || [];

      const normalizedLeads = results.map((lead) => ({
        ...lead,
        firstName: lead.fullName?.split(" ")[0] || "",
        lastName: lead.fullName?.split(" ").slice(1).join(" ") || "",
        leadGrade: lead.leadType === "hot" ? "Hot" : "Cold",
        leadScore: lead.score || 0,
        status: lead.status || "New",
        companyName: lead.company || "",
        phone: lead.phone || "",
        _sourceType: "chatbot",
        _sourceLabel: "Chatbot",
      }));

      setChatbotLeads(normalizedLeads);
      return normalizedLeads;
    } catch (error) {
      console.error("❌ Failed to fetch chatbot leads:", error);
      setChatbotLeads([]);
      return [];
    }
  };

  // SCHEDULE MEETING LEADS
  const fetchScheduleMeetingLeads = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}${ENDPOINT_CONNECT_LEAD}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      const results = data?.result || [];

      const leadsWithSource = results.map((lead) => ({
        ...lead,
        firstName: lead.fullName?.split(" ")[0] || lead.firstName || "",
        lastName:
          lead.fullName?.split(" ").slice(1).join(" ") || lead.lastName || "",
        leadScore: lead.leadScore || 0,
        leadGrade: lead.leadGrade || "Cold",
        status: lead.status || "New",
        companyName: lead.companyName || lead.company || "",
        phone: lead.phone || lead.mobileNumber || "",
        _sourceType: "schedule",
        _sourceLabel: "Schedule Meeting",
      }));

      setScheduleMeetingLeads(leadsWithSource);
      return leadsWithSource;
    } catch (error) {
      console.error("❌ Failed to fetch schedule meeting leads:", error);
      setScheduleMeetingLeads([]);
      return [];
    }
  };

  // LEAD SCORING LEADS – from /leads with sort/search params
  const fetchLeadScoringLeads = async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("limit", "100");

      if (filters.search) params.append("search", filters.search);

      if (filters.time === "newest") {
        params.append("sortBy", "createdAt");
        params.append("sortOrder", "desc");
      } else if (filters.time === "oldest") {
        params.append("sortBy", "createdAt");
        params.append("sortOrder", "asc");
      }

      if (filters.score === "highest") {
        params.append("sortBy", "leadScore");
        params.append("sortOrder", "desc");
      } else if (filters.score === "lowest") {
        params.append("sortBy", "leadScore");
        params.append("sortOrder", "asc");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (data.responseCode === 200 || data.success) {
        const results = Array.isArray(data?.result?.leads)
          ? data.result.leads
          : Array.isArray(data?.result)
          ? data.result
          : [];

        const leadsWithSource = results.map((lead) => ({
          ...lead,
          status: lead.status || "New",
          leadGrade: lead.leadGrade || "Cold",
          leadScore: lead.leadScore || 0,
          companyName: lead.company || lead.companyName || "",
          _sourceType: "scoring",
          _sourceLabel: lead.source || "Lead Scoring",
        }));

        setLeadScoringLeads(leadsWithSource);
        return leadsWithSource;
      }

      setLeadScoringLeads([]);
      return [];
    } catch (error) {
      console.error("❌ Failed to fetch lead scoring leads:", error);
      setLeadScoringLeads([]);
      return [];
    }
  };

// Combine and filter leads (client-side)
useEffect(() => {
  let combined = [];

  // Select source type
  if (filters.leadType === "direct") {
    combined = [...directLeads];
  } else if (filters.leadType === "chatbot") {
    combined = [...chatbotLeads];
  } else if (filters.leadType === "schedule") {
    combined = [...scheduleMeetingLeads];
  } else if (filters.leadType === "scoring") {
    combined = [...leadScoringLeads];
  } else if (filters.leadType === "sdrLeads") {
    combined = [...sdrLeads];
  } else {
    combined = [
      ...directLeads,
      ...chatbotLeads,
      ...scheduleMeetingLeads,
      ...leadScoringLeads,
      ...sdrLeads,
    ];
  }

  // Grade filter
  if (filters.grade) {
    combined = combined.filter(
      (lead) =>
        lead.leadGrade?.toLowerCase() === filters.grade.toLowerCase()
    );
  }

  // Status filter from tabs 
  if (filters.status) {
    combined = combined.filter((lead) => lead.status === filters.status);
  }
combined = combined.filter(
  (lead) => lead.status !== "In Process" && lead.status !== "In_Process"
);
if (filters.status !== "Archived") {
  combined = combined.filter((lead) => lead.status !== "Archived");
}

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    combined = combined.filter(
      (lead) =>
        lead.fullName?.toLowerCase().includes(searchLower) ||
        lead.firstName?.toLowerCase().includes(searchLower) ||
        lead.lastName?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.company?.toLowerCase().includes(searchLower) ||
        lead.companyName?.toLowerCase().includes(searchLower)
    );
  }

  // Time sort
  if (filters.time === "newest") {
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (filters.time === "oldest") {
    combined.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  // Score sort (default: highest first)
  if (filters.score === "highest") {
    combined.sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));
  } else if (filters.score === "lowest") {
    combined.sort((a, b) => (a.leadScore || 0) - (b.leadScore || 0));
  } else {
    combined.sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));
  }

  setAllLeads(combined);
  setTopLeads(combined.slice(0, 10));
}, [
  directLeads,
  chatbotLeads,
  scheduleMeetingLeads,
  leadScoringLeads,
  sdrLeads,
  filters,
  loading,
]);

  // Stats from backend
  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/stats`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (data.responseCode === 200 || data.success) {
        setStats(data.result);
      } else {
        setStats(getDefaultStats());
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setStats(getDefaultStats());
    }
  };

  const getDefaultStats = () => ({
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
    contactedLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
  });

  // Recalculate stats from combined leads when loading finishes
  useEffect(() => {
    if (!loading) {
      const allCombined = [
        ...directLeads,
        ...chatbotLeads,
        ...scheduleMeetingLeads,
        ...leadScoringLeads,
        ...sdrLeads,
      ];

      if (allCombined.length > 0) {
        const hotCount = allCombined.filter(
          (l) => l.leadGrade === "Hot"
        ).length;
        const warmCount = allCombined.filter(
          (l) => l.leadGrade === "Warm"
        ).length;
        const coldCount = allCombined.filter(
          (l) => l.leadGrade === "Cold"
        ).length;
        const frozenCount = allCombined.filter(
          (l) => l.leadGrade === "Frozen"
        ).length;
        const archivedCount = allCombined.filter(
          (l) => l.status === "Archived"
        ).length;
        const avgScore =
          allCombined.reduce((sum, l) => sum + (l.leadScore || 0), 0) /
          allCombined.length;

        setStats((prev) => ({
          ...(prev || getDefaultStats()),
          totalLeads: allCombined.length,
          hotLeads: hotCount,
          warmLeads: warmCount,
          coldLeads: coldCount,
          frozenLeads: frozenCount,
          archivedLeads: archivedCount,
          averageScore: avgScore,
          hotLeadsPercentage:
            allCombined.length > 0
              ? Math.round((hotCount / allCombined.length) * 100)
              : 0,
        }));
      }
    }
  }, [
    directLeads,
    chatbotLeads,
    scheduleMeetingLeads,
    leadScoringLeads,
    sdrLeads,
    loading,
  ]);

  // const handleTabChange = (tab) => {
  //   setActiveTab(tab);
  //   if (tab === 'all') {
  //     setFilters(prev => ({ ...prev, grade: '', page: 1 }));
  //   } else {
  //     setFilters(prev => ({ ...prev, grade: tab.charAt(0).toUpperCase() + tab.slice(1), page: 1 }));
  //   }
  // };
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    setFilters((prev) => {
      const base = { ...prev, page: 1 };

      if (tab === "all") {
        return { ...base, grade: "", status: "" };
      }

      if (tab === "archived") {
        return { ...base, grade: "", status: "Archived" };
      }
      return {
        ...base,
        status: "",
        grade: tab.charAt(0).toUpperCase() + tab.slice(1),
      };
    });
  };

  const handleExport = async () => {
    try {
      const csvContent = [
        [
          "Name",
          "Email",
          "Company",
          "Phone",
          "Grade",
          "Score",
          "Source",
          "Status",
          "Created",
        ].join(","),
        ...allLeads.map((lead) =>
          [
            `"${lead.firstName || ""} ${lead.lastName || ""}"`,
            `"${lead.email || ""}"`,
            `"${lead.company || lead.companyName || ""}"`,
            `"${lead.phone || lead.mobileNumber || ""}"`,
            `"${lead.leadGrade || ""}"`,
            `"${lead.leadScore || 0}"`,
            `"${lead._sourceLabel || ""}"`,
            `"${lead.status || "New"}"`,
            `"${
              lead.createdAt
                ? new Date(lead.createdAt).toLocaleDateString()
                : ""
            }"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `all-leads-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export leads:", error);
    }
  };

  const handleSendBulkEmail = (leadsList) => {
    setEmailModal({ open: true, recipients: leadsList, type: "bulk" });
  };

  const handleSendIndividualEmail = (lead) => {
    setEmailModal({ open: true, recipients: [lead], type: "individual" });
  };

  const sendEmail = async (emailData) => {
    setSendingEmail(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailData),
        }
      );

      const data = await response.json();

      if (data.responseCode === 200 || data.success) {
        toast.success("Email sent successfully!");
        setEmailModal({ open: false, recipients: [], type: "bulk" });
        fetchAllLeads();
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

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="w-full">
        {/* Header */}
     <div className="mb-6 flex justify-between items-center">
  <div>
    <h4 className="text-primary-100">Lead Management</h4>
  </div>

  <div className="flex items-center gap-3">
    <button
      onClick={handleExport}
      className="
        flex items-center justify-center gap-2
        cursor-pointer
        rounded-full
        bg-primary
        text-white
        px-6 py-2.5
        text-sm font-semibold
      "
    >
      <Download className="w-3 h-3 text-white" />
      Export CSV
    </button>
  </div>
</div>

        {/* Top Leads Metrics */}
        {/* {topLeads.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-end mb-4">
             
              <button
                onClick={() => handleSendBulkEmail(topLeads)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Bulk Email to Top 10
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TopLeadMetric
                label="Highest Score"
                value={`${topLeads[0]?.leadScore || 0}/100`}
                sublabel={topLeads[0] ? `${topLeads[0].firstName} ${topLeads[0].lastName}` : 'N/A'}
                icon=""
                color="from-blue-400 to-blue-600"
              />
              <TopLeadMetric
                label="Average Score"
                value={`${topLeads.length > 0
                  ? Math.round(topLeads.reduce((sum, l) => sum + (l.leadScore || 0), 0) / topLeads.length)
                  : 0
                  }/100`}
                sublabel="Top 10 average"
                color="from-blue-400 to-blue-600"
              />
              <TopLeadMetric
                label="Contacted"
                value={`${topLeads.filter(l => l.lastEmailSent).length}/${topLeads.length}`}
                sublabel="Already reached out"
                icon=""
                color="from-blue-400 to-blue-600"
              />
              <TopLeadMetric
                label="Need Action"
                value={topLeads.filter(l => !l.lastEmailSent).length}
                sublabel="Not contacted yet"
                icon=""
                color="from-red-400 to-red-600"
              />
            </div>
          </div>
        )} */}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Leads"
            value={stats.totalLeads}
            change={stats.leadsThisWeek}
            changeLabel="this week"
            color="blue"
          />
          <StatCard
            label="Hot Leads"
            value={stats.hotLeads}
            change={stats.hotLeadsPercentage}
            changeLabel="of total"
            color="red"
            isPercentage
          />
          <StatCard
            label="Avg Lead Score"
            value={Math.round(stats.averageScore)}
            change={stats.scoreImprovement}
            changeLabel="vs last week"
            color="green"
          />
          <StatCard
            label="This Week"
            value={stats.leadsThisWeek}
            change={stats.weekOverWeekGrowth}
            changeLabel="growth"
            color="purple"
            isPercentage
          />
        </div>

        {/* Tabs and Filters + Lead List */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                {
                  id: "all",
                  label: "All Leads",
                  count: stats.totalLeads,
                },
                {
                  id: "hot",
                  label: "Hot",
                  count: stats.hotLeads,
                },
                {
                  id: "warm",
                  label: "Warm",
                  count: stats.warmLeads,
                },
                {
                  id: "cold",
                  label: "Cold",
                  count: stats.coldLeads,
                },
                {
                  id: "archived",
                  label: "Archived",
                  count: stats.archivedLeads || 0,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
            py-4 px-1 border-b-2 font-medium text-sm transition-colors
            ${
              activeTab === tab.id
                ? `border-${tab.color}-500 text-${tab.color}-600`
                : `border-transparent text-${tab.color}-500 hover:text-${tab.color}-700 hover:border-${tab.color}-300`
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
    {/* LEFT SIDE → Search */}
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

    {/* MIDDLE → Filters */}
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

    {/* ✅ RIGHT SIDE → Selection Count + Move Button */}
{selectedLeadIds.length > 0 && (
  <div className="flex items-center gap-3 ml-auto">
    <FilterDropdown
      label="Select"
      value=""
      align="right"  
      options={[
        { value: "in_process", label: "Move In-Process" },
        { value: "archived", label: "Move Archived" },
      ]}
      onChange={(val) => {
        if (val === "in_process") handleMoveSelectedToInProcess();
        if (val === "archived") handleMoveSelectedToArchived();
      }}
      renderTrigger={({ open, toggle }) => (
        <button
          onClick={toggle}
          className="
            h-9 px-3 border-gray-200
            flex items-center gap-2
            rounded-full border
            bg-white
            focus:border-primary
            cursor-pointer
            text-xs md:text-sm font-semibold
          "
        >
          <span className="py-0.5 px-2 rounded-full bg-gray-100 text-gray-700 text-[10px] md:text-xs font-semibold">
            {selectedLeadIds.length}
          </span>
          <span>Select</span>
          <MoreVertical
            className={`w-4 h-4 transition-transform ${
              open ? "rotate-90" : ""
            }`}
          />
        </button>
      )}
    />
  </div>
)}
  </div>
</div>


          {/* Lead List */}
          <div className="xl:max-w-[75vw] 2xl:max-w-[82vw]">
            <LeadList
              leads={allLeads}
              loading={loading}
              onSelectLead={setSelectedLead}
              onRefresh={fetchAllLeads}
              currentPage={filters.page}
              leadsPerPage={filters.limit}
              sendEmail={handleSendIndividualEmail}
              onPageChange={(newPage) =>
                setFilters((prev) => ({ ...prev, page: newPage }))
              }
               selectedLeadIds={selectedLeadIds}
               onToggleLeadSelect={handleToggleLeadSelect}
                onToggleSelectAll={handleToggleSelectAll}
            />
          </div>
        </div>

        {/* Lead Stats Section */}
        <LeadStats stats={stats} />
      </div>

      {/* Email Modal */}
      {emailModal.open && (
        <EmailModal
          recipients={emailModal.recipients}
          type={emailModal.type}
          onClose={() =>
            setEmailModal({ open: false, recipients: [], type: "bulk" })
          }
          onSend={sendEmail}
          sendingEmail={sendingEmail}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  changeLabel,
  color,
  isPercentage = false,
}) {
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

function TopLeadMetric({ label, value, sublabel, icon, color }) {
  return (
    <div
      className={`bg-gradient-to-br ${color} rounded-lg shadow-sm p-6 text-white`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="text-xs opacity-90">{sublabel}</div>
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
