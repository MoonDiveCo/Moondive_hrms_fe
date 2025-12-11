"use client";
import { useState, useEffect } from "react";
import { Search, Download, MoreVertical } from "lucide-react";
import LeadList from "../../../components/CrmDashboard/LeadList";
import LeadStats from "../../../components/CrmDashboard/LeadStats";
import { toast } from "react-toastify";
import FilterDropdown from "../../../components/CrmDashboard/ui/FilterDropdown";
import { getLeadsFromAllSources } from "../../../services/leadService";
import axios from "axios";

export default function LeadDashboard() {
  const [stats, setStats] = useState(null);
  const [allLeads, setAllLeads] = useState([]);
  const [directLeads, setDirectLeads] = useState([]);
  const [chatbotLeads, setChatbotLeads] = useState([]);
  const [sdrLeads, setSdrLeads] = useState([]);
  const [scheduleMeetingLeads, setScheduleMeetingLeads] = useState([]);
  const [leadScoringLeads, setLeadScoringLeads] = useState([]);
  const [topLeads, setTopLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  useEffect(() => {
    const fetchTopLeads = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads?page=1&limit=100`
        );
        const data = await res.json();

        const results = Array.isArray(data?.result?.leads)
          ? data.result.leads
          : Array.isArray(data?.result)
          ? data.result
          : [];

        const combined = results.map((lead) => ({
          ...lead,
          leadScore: lead.leadScore || 0,
          firstName: lead.fullName?.split(" ")[0] || lead.firstName || "",
          lastName:
            lead.fullName?.split(" ").slice(1).join(" ") || lead.lastName || "",
        }));

        const sortedTop = [...combined]
          .sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0))
          .slice(0, 10);

        setTopLeads(sortedTop);
      } catch (err) {
        console.error("Error fetching top leads for overview:", err);
      }
    };

    fetchTopLeads();
  }, []);

  const handleSendBulkEmail = (leadsList) => {
    console.log("Send bulk email to:", leadsList);
  };

  const [filters, setFilters] = useState({
    grade: "",
    status: "",
    source: "",
    time: "",
    score: "",
    leadType: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);

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
        return prev.filter((id) => !pageLeadIds.includes(id));
      } else {
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
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/bulk-update-status`,
        {
          leadIds: selectedLeadIds,
          status: newStatus,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response.data;

      if (data?.success || data?.responseCode === 200) {
        toast.success(
          `Updated ${selectedLeadIds.length} lead(s) to "${newStatus}"`
        );

        setSelectedLeadIds([]);
        fetchAllLeads();
      } else {
        toast.error(data?.responseMessage || "Failed to update leads");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while updating leads");
    }
  };

  // Specific actions
  const handleMoveSelectedToInProcess = () => bulkUpdateStatus("In Process");
  const handleMoveSelectedToArchived = () => bulkUpdateStatus("Archived");

  const fetchAllLeads = async () => {
    setLoading(true);
    try {
      const statusForService = filters.status || "New";
      const {
        contactLeads,
        chatbotLeads,
        scheduleLeads,
        sdrLeads: sdrFromService,
        allLeads: combinedFromService,
      } = await getLeadsFromAllSources({
        status: statusForService,
        search: filters.search,
        time: filters.time,
        score: filters.score,
        page: filters.page,
        limit: filters.limit,
      });
      setDirectLeads(contactLeads);
      setChatbotLeads(chatbotLeads);
      setScheduleMeetingLeads(scheduleLeads);

      setLeadScoringLeads(sdrFromService);
      setSdrLeads(sdrFromService);
      await fetchStats();
    } catch (error) {
      console.error("Error fetching leads:", error);
      setDirectLeads([]);
      setChatbotLeads([]);
      setScheduleMeetingLeads([]);
      setLeadScoringLeads([]);
      setSdrLeads([]);
      setAllLeads([]);
      setTopLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLeads();
  }, [filters.time, filters.score, filters.search, filters.page]);

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
        (lead) => lead.leadGrade?.toLowerCase() === filters.grade.toLowerCase()
      );
    }

    // Status filter from tabs
    if (filters.status) {
      combined = combined.filter((lead) => lead.status === filters.status);
    }

    // Remove In-Process from main page
    combined = combined.filter(
      (lead) => lead.status !== "In Process" && lead.status !== "In_Process"
    );

    // Hide archived unless in Archived tab
    if (filters.status !== "Archived") {
      combined = combined.filter((lead) => lead.status !== "Archived");
    }

    // Search filter (extra layer, OK even though service also filters)
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

    // Time sort (safety – service already sorts)
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
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/stats`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response.data;

      if (data?.responseCode === 200 || data?.success) {
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
  });

  // Recalculate stats from combined leads when loading finishes
  useEffect(() => {
    if (!loading) {
      const allCombined = [
        ...directLeads,
        ...chatbotLeads,
        ...scheduleMeetingLeads,
        // ...leadScoringLeads,
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
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h4 className="text-primaryText">Overview</h4>
          </div>
        </div>
        <div className="">
          {topLeads.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <TopLeadMetric
                  label="Highest Score"
                  value={`${topLeads[0]?.leadScore || 0}/100`}
                  sublabel={
                    topLeads[0]
                      ? `${topLeads[0].firstName || ""} ${
                          topLeads[0].lastName || ""
                        }`
                      : "N/A"
                  }
                  color="from-blue-400 to-blue-600"
                />

                <TopLeadMetric
                  label="Average Score"
                  value={`${
                    topLeads.length > 0
                      ? Math.round(
                          topLeads.reduce(
                            (sum, l) => sum + (l.leadScore || 0),
                            0
                          ) / topLeads.length
                        )
                      : 0
                  }/100`}
                  sublabel="Top 10 average"
                  color="from-blue-400 to-blue-600"
                />

                <TopLeadMetric
                  label="Contacted"
                  value={`${topLeads.filter((l) => l.lastEmailSent).length}/${
                    topLeads.length
                  }`}
                  sublabel="Already reached out"
                  color="from-blue-400 to-blue-600"
                />

                <TopLeadMetric
                  label="Need Action"
                  value={topLeads.filter((l) => !l.lastEmailSent).length}
                  sublabel="Not contacted yet"
                  color="from-red-400 to-red-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Leads"
            value={stats.totalLeads}
            change={stats.leadsThisWeek}
            changeLabel="this week"
          />
          <StatCard
            label="Hot Leads"
            value={stats.hotLeads}
            change={stats.hotLeadsPercentage}
            changeLabel="of total"
            isPercentage
          />
          <StatCard
            label="Avg Lead Score"
            value={Math.round(stats.averageScore)}
            change={stats.scoreImprovement}
            changeLabel="vs last week"
          />
          <StatCard
            label="This Week"
            value={stats.leadsThisWeek}
            change={stats.weekOverWeekGrowth}
            changeLabel="growth"
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

              {/* RIGHT SIDE → Selection Count + Move Button */}
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

          <div className="xl:max-w-[75vw] 2xl:max-w-[82vw]">
            <LeadList
              leads={allLeads}
              loading={loading}
              onSelectLead={setSelectedLead}
              onRefresh={fetchAllLeads}
              currentPage={filters.page}
              leadsPerPage={filters.limit}
              onPageChange={(newPage) =>
                setFilters((prev) => ({ ...prev, page: newPage }))
              }
              selectedLeadIds={selectedLeadIds}
              onToggleLeadSelect={handleToggleLeadSelect}
              onToggleSelectAll={handleToggleSelectAll}
              showContactActions={false}
              showSelection={true}
            />
          </div>
        </div>
        <LeadStats stats={stats} />
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

function TopLeadMetric({ label, value, sublabel, icon, color }) {
  return (
    <div
      className={`bg-linear-to-br ${color} rounded-lg shadow-sm p-6 text-white`}
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
