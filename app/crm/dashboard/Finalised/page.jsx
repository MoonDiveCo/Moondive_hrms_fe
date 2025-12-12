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

export default function FinalizedPage() {
  const [baseLeads, setBaseLeads] = useState([]); 
  const [allLeads, setAllLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
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

  // Fetch stats & leads (status = Finalized)
  const fetchStatsAndLeads = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/leads/stats`,
        {
          params: { status: "Finalized" },
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
        setStats({ ...getDefaultStats(), ...result, leads: normalized });
      } else {
        setStats(getDefaultStats());
        setBaseLeads([]);
      }
    } catch (error) {
      console.error("Error fetching Finalized stats/leads:", error);
      toast.error("Error loading Finalized leads");
      setStats(getDefaultStats());
      setBaseLeads([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply same client-side filters as other pages
  const applyFilters = () => {
    let filtered = [...baseLeads];

    // grade filter
    if (filters.grade) {
      filtered = filtered.filter(
        (lead) => lead.leadGrade?.toLowerCase() === filters.grade.toLowerCase()
      );
    }

    // source filter
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

    // search filter
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.fullName?.toLowerCase().includes(s) ||
          lead.firstName?.toLowerCase().includes(s) ||
          lead.lastName?.toLowerCase().includes(s) ||
          lead.email?.toLowerCase().includes(s) ||
          lead.company?.toLowerCase().includes(s) ||
          lead.companyName?.toLowerCase().includes(s)
      );
    }

    // time sort
    if (filters.time === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.time === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    // score sort
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
  }, [baseLeads, filters]);

    const handlePageChange = (newPage) => {
    setPageLoading(true);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Simulate loading delay
    setTimeout(() => {
      setFilters((prev) => ({ ...prev, page: newPage }));
      setPageLoading(false);
    }, 500);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters((prev) => {
      const base = { ...prev, page: 1 };
      if (tab === "all") return { ...base, grade: "" };
      return { ...base, grade: tab.charAt(0).toUpperCase() + tab.slice(1) };
    });
  };


   if(loading || pageLoading){
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
        <h4 className="text-primaryText">Finalized Leads</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Finalized Leads"
          value={stats.totalLeads}
          change={stats.leadsThisWeek}
          changeLabel="this week"
        />
        <StatCard
          label="Hot (Finalized)"
          value={stats.hotLeads}
          change={stats.hotLeadsPercentage}
          changeLabel="of finalized"
          isPercentage
        />
        <StatCard
          label="Avg Lead Score"
          value={Math.round(stats.averageScore || 0)}
          change={stats.scoreImprovement || 0}
          changeLabel="vs last week"
        />
        <StatCard
          label="This Week"
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
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <span className="ml-2 py-0.5 px-2 rounded-full bg-gray-100 text-gray-600 text-xs">{tab.count}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full pl-10 pr-4 py-2 rounded-full border bg-whiteBg text-blackText border-gray-300 text-xs md:text-sm hover:border-primary focus:border-primary focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-end">
              <FilterDropdown
                label="Sort by Time"
                value={filters.time}
                options={[{ value: "newest", label: "Newest" }, { value: "oldest", label: "Oldest" }]}
                onChange={(val) => setFilters((prev) => ({ ...prev, time: val, page: 1 }))}
              />

              <FilterDropdown
                label="Sort by Score"
                value={filters.score}
                options={[{ value: "highest", label: "Highest" }, { value: "lowest", label: "Lowest" }]}
                onChange={(val) => setFilters((prev) => ({ ...prev, score: val, page: 1 }))}
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
                onChange={(val) => setFilters((prev) => ({ ...prev, leadType: val, page: 1 }))}
              />
            </div>
          </div>
        </div>

        <div className="xl:max-w-[75vw] 2xl:max-w-[82vw]">
          <LeadList
            leads={allLeads}
            loading={loading}
            onSelectLead={() => {}}
            onRefresh={fetchStatsAndLeads}
            currentPage={filters.page}
            leadsPerPage={filters.limit}
            onPageChange={handlePageChange}
            selectedLeadIds={[]}
            onToggleLeadSelect={undefined}
            onToggleSelectAll={undefined}
            showContactActions={false}
            showSelection={false}
            contactActions={["view"]}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, changeLabel, isPercentage = false }) {
  const displayValue = value ?? 0;
  const displayChange = change ?? 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-2xl font-bold text-primary-500 mb-1">{displayValue}</div>
      <div className="text-sm text-primary-600 mb-2">{label}</div>
      <div className="text-xs text-primary-500">
        <span className="font-medium text-primary-800">{isPercentage ? `${displayChange}%` : displayChange}</span>{" "}
        {changeLabel}
      </div>
    </div>
  );
}
