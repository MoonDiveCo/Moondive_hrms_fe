"use client";
import { useState, useEffect, useMemo } from "react";
import { Search, Download, MoreVertical } from "lucide-react";
import LeadList from "../../../components/CrmDashboard/LeadList";
import LeadStats from "../../../components/CrmDashboard/LeadStats";
import { toast } from "react-toastify";
import FilterDropdown from "../../../components/CrmDashboard/ui/FilterDropdown";
import { getLeadsFromAllSources } from "../../../services/leadService";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
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
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads`,
        {
          params: { page: 1, limit: 100 },
        }
      );

      const data = res.data;

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

  // ---------- COMPUTED KPIs (must be before early returns) ----------
  const highestScore = useMemo(() => {
    if (!topLeads.length) return 0;
    return Math.max(...topLeads.map((l) => l.leadScore || 0));
  }, [topLeads]);

  const highestScoreLead = useMemo(() => {
    if (!topLeads.length) return null;
    return topLeads.reduce((best, l) =>
      (l.leadScore || 0) > (best.leadScore || 0) ? l : best
    , topLeads[0]);
  }, [topLeads]);

  const topAvgScore = useMemo(() => {
    if (!topLeads.length) return 0;
    return Math.round(
      topLeads.reduce((sum, l) => sum + (l.leadScore || 0), 0) / topLeads.length
    );
  }, [topLeads]);

  const contactedCount = useMemo(() => {
    return topLeads.filter((l) => l.lastEmailSent).length;
  }, [topLeads]);

  const needActionCount = useMemo(() => {
    return topLeads.filter((l) => !l.lastEmailSent).length;
  }, [topLeads]);

  const weeklyTrend = stats?.weeklyTrend || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm">
        <DotLottieReact
          src="https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie"
          loop
          autoplay
          style={{ width: 100, height: 100 }}
        />
      </div>
    );
  }
  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="w-full flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-primaryText font-bold">Leads Dashboard Overview</h4>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 cursor-pointer rounded-full bg-primary text-white px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Download className="w-3 h-3 text-white" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            label="Highest Score"
            value={highestScore}
            change={stats?.scoreImprovement || 0}
            subtitle={
              highestScoreLead
                ? `${highestScoreLead.firstName || ""} ${highestScoreLead.lastName || ""}`.trim()
                : "Peak lead quality"
            }
          />
          <KpiCard
            label="Average Score"
            value={topAvgScore}
            change={stats?.scoreImprovement || 0}
            subtitle="Top 10 average"
          />
          <KpiCard
            label="Contacted"
            value={contactedCount}
            change={null}
            subtitle="Already reached out"
          />
          <KpiCard
            label="Need Action"
            value={needActionCount}
            change={null}
            subtitle="Not contacted yet"
          />
        </div>

        {/* Deep Metrics & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Total Leads */}
          <MetricCard
            label="Total Leads"
            value={stats?.totalLeads || 0}
            change={stats?.weekOverWeekGrowth || 0}
            icon="📊"
          >
            <MiniLineChart data={weeklyTrend} dashed={false} />
          </MetricCard>

          {/* Hot Leads */}
          <MetricCard
            label="Hot Leads"
            value={stats?.hotLeads || 0}
            change={stats?.hotLeadsPercentage || 0}
            icon="🔥"
          >
            <MiniLineChart data={weeklyTrend} dashed={true} />
          </MetricCard>

          {/* Avg Lead Score */}
          <MetricCard
            label="Avg Lead Score"
            value={Math.round(stats?.averageScore || 0)}
            change={stats?.scoreImprovement || 0}
            icon="📈"
          >
            <MiniBarChart data={weeklyTrend} />
          </MetricCard>

          {/* This Week */}
          <MetricCard
            label="This Week"
            value={stats?.leadsThisWeek || 0}
            change={stats?.weekOverWeekGrowth || 0}
            icon="⚡"
          >
            <DonutChart
              value={stats?.leadsThisWeek || 0}
              total={stats?.totalLeads || 1}
            />
          </MetricCard>
        </div>

        <LeadStats stats={stats} />
      </div>
    </div>
  );
}

/* ── Helper Components ───────────────────────────────── */

function KpiCard({ label, value, change, subtitle }) {
  const isPositive = change !== null && change >= 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-blackText">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {change !== null && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isPositive
                ? "text-emerald-600 bg-emerald-50"
                : "text-rose-600 bg-rose-50"
            }`}
          >
            {isPositive ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-gray-400 text-xs mt-3 italic">{subtitle}</p>
      )}
    </div>
  );
}

function MetricCard({ label, value, change, icon, children }) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white p-8 rounded-2xl border border-primary/5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-gray-500 font-medium">{label}</p>
          <h3 className="text-4xl font-bold mt-1 text-blackText">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-sm font-bold ${
                isPositive ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {isPositive ? "+" : ""}
              {change}%
            </span>
            <span className="text-gray-400 text-sm">vs last 7 days</span>
          </div>
        </div>
        {/* <div className="p-3 bg-primary/5 rounded-xl text-xl">{icon}</div> */}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function MiniLineChart({ data = [], dashed = false }) {
  const values = data.length
    ? data.map((d) => d.count ?? d.value ?? 0)
    : [30, 60, 45, 80, 55, 90, 40];

  const max = Math.max(...values, 1);
  const w = 500;
  const h = 120;
  const pad = 10;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  });

  const pathD = `M${points.join(" L")}`;
  const areaD = `${pathD} L${pad + ((values.length - 1) / (values.length - 1)) * (w - pad * 2)},${h} L${pad},${h} Z`;

  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32 overflow-visible">
        {!dashed && (
          <>
            <defs>
              <linearGradient id="areaGradOverview" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,123,48,0.2)" />
                <stop offset="100%" stopColor="rgba(255,123,48,0)" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#areaGradOverview)" />
          </>
        )}
        <path
          d={pathD}
          fill="none"
          stroke="#FF7B30"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={dashed ? "8 4" : "none"}
        />
      </svg>
      <div className="flex justify-between mt-2 px-2">
        {days.slice(0, values.length).map((d) => (
          <span key={d} className="text-[10px] font-bold text-gray-400">
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}

function MiniBarChart({ data = [] }) {
  const values = data.length
    ? data.map((d) => d.count ?? d.value ?? 0)
    : [60, 45, 85, 70, 100, 30, 25];

  const max = Math.max(...values, 1);
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const opacities = [0.1, 0.3, 0.6, 0.4, 1, 0.2, 0.2];

  return (
    <div className="flex items-end justify-between h-32 gap-3 px-2">
      {values.slice(0, 7).map((v, i) => {
        const pct = (v / max) * 100;
        return (
          <div key={i} className="flex flex-col items-center flex-1 gap-2">
            <div
              className="w-full rounded-t-lg transition-all"
              style={{
                height: `${Math.max(pct, 5)}%`,
                backgroundColor: `rgba(255,123,48,${opacities[i] || 0.3})`,
              }}
            />
            <span className="text-[10px] font-bold text-gray-400">
              {days[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ value, total }) {
  const pct = Math.min(Math.round((value / total) * 100), 100) || 0;
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex items-center justify-center h-40">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="80"
            cy="80"
            r={r}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="8"
          />
          <circle
            cx="80"
            cy="80"
            r={r}
            fill="transparent"
            stroke="#FF7B30"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-blackText">{pct}%</span>
          <span className="text-[10px] uppercase font-bold text-gray-400">
            Goal Met
          </span>
        </div>
      </div>
    </div>
  );
}
