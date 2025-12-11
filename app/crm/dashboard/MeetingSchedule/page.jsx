"use client";

import { useEffect, useState } from "react";
import LeadList from "../../../../components/CrmDashboard/LeadList";
import { getLeadsFromAllSources } from "../../../../services/leadService";

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

/**
 * Compute stats from an array of leads.
 * - expects lead.createdAt (ISO) and lead.leadScore (number) and lead.leadGrade (string)
 */
function computeStatsFromLeads(leads = []) {
  const stats = { ...getDefaultStats() };
  stats.leads = leads;
  stats.totalLeads = leads.length;

  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;

  // helper: week ranges: current week = last 7 days, prev week = 7-14 days ago
  const isInRange = (dateStr, daysAgoStart, daysAgoEnd) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const ageDays = (now - d) / msPerDay;
    return ageDays >= daysAgoStart && ageDays < daysAgoEnd;
  };

  let totalScore = 0;
  let countedScore = 0;

  let currentWeekCount = 0;
  let prevWeekCount = 0;
  let currentWeekAvgScoreSum = 0;
  let currentWeekAvgScoreCount = 0;
  let prevWeekAvgScoreSum = 0;
  let prevWeekAvgScoreCount = 0;

  leads.forEach((l) => {
    const grade = (l.leadGrade || "").toLowerCase();
    if (grade === "hot") stats.hotLeads += 1;
    if (grade === "warm") stats.warmLeads += 1;
    if (grade === "cold") stats.coldLeads += 1;
    if (grade === "frozen") stats.frozenLeads += 1;
    if (l.archived) stats.archivedLeads += 1; // if you mark archived

    const score = Number(l.leadScore || 0);
    if (!Number.isNaN(score)) {
      totalScore += score;
      countedScore += 1;
    }

    const created = l.createdAt || l.created_at || l.created; // defensive
    if (isInRange(created, 0, 7)) {
      currentWeekCount += 1;
      if (!Number.isNaN(score)) {
        currentWeekAvgScoreSum += score;
        currentWeekAvgScoreCount += 1;
      }
    } else if (isInRange(created, 7, 14)) {
      prevWeekCount += 1;
      if (!Number.isNaN(score)) {
        prevWeekAvgScoreSum += score;
        prevWeekAvgScoreCount += 1;
      }
    }
  });

  stats.averageScore = countedScore ? totalScore / countedScore : 0;
  stats.leadsThisWeek = currentWeekCount;

  stats.hotLeadsPercentage =
    stats.totalLeads > 0 ? Math.round((stats.hotLeads / stats.totalLeads) * 100) : 0;

  // week over week growth: (current - prev) / prev * 100
  if (prevWeekCount === 0) {
    stats.weekOverWeekGrowth = currentWeekCount === 0 ? 0 : 100;
  } else {
    stats.weekOverWeekGrowth = Math.round(((currentWeekCount - prevWeekCount) / prevWeekCount) * 100);
  }

  // score improvement: compare avg score this week vs prev week
  const currentWeekAvg = currentWeekAvgScoreCount
    ? currentWeekAvgScoreSum / currentWeekAvgScoreCount
    : 0;
  const prevWeekAvg = prevWeekAvgScoreCount ? prevWeekAvgScoreSum / prevWeekAvgScoreCount : 0;

  if (prevWeekAvg === 0) {
    stats.scoreImprovement = currentWeekAvg === 0 ? 0 : 100;
  } else {
    stats.scoreImprovement = Math.round(((currentWeekAvg - prevWeekAvg) / prevWeekAvg) * 100);
  }

  // round a few displayed values
  stats.averageScore = Math.round(stats.averageScore);
  stats.weekOverWeekGrowth = stats.weekOverWeekGrowth || 0;
  stats.scoreImprovement = stats.scoreImprovement || 0;

  return stats;
}

function StatCard({ label, value, change, changeLabel, isPercentage = false }) {
  const displayValue = value ?? 0;
  const displayChange = change ?? 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-2xl font-bold text-primary-500 mb-1">{displayValue}</div>
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

export default function MeetingSchedulingPage() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(getDefaultStats());
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;

  // We'll fetch two things:
  // 1) paginated leads for the list (current page)
  // 2) a larger set (or all returned leads) to compute stats
  const fetchMeetingLeads = async (page = 1) => {
    try {
      setLoading(true);

      // 1) paginated list for the visible table
      const paginatedResult = await getLeadsFromAllSources({
        status: "Contacted",
        page,
        limit: leadsPerPage,
      });

      const pageLeads = paginatedResult?.allLeads || [];
      setLeads(pageLeads);

      // 2) fetch a larger batch for stats (adjust limit if you expect >1000 leads)
      // If your service supports passing limit: 0 or a very large number to get all leads,
      // use that. Here we request 1000 as a reasonable default.
      const statsResult = await getLeadsFromAllSources({
        status: "Contacted",
        page: 1,
        limit: 1000,
      });

      const allLeads = statsResult?.allLeads || pageLeads;
      const computed = computeStatsFromLeads(allLeads);
      setStats(computed);
    } catch (err) {
      console.error("❌ Error fetching meeting leads:", err);
      setLeads([]);
      setStats(getDefaultStats());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingLeads(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h4 className="text-primaryText font-semibold">Scheduled Meetings</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Scheduled (Contacted)"
          value={stats.totalLeads}
          change={stats.leadsThisWeek}
          changeLabel="this week"
        />
        <StatCard
          label="Hot Leads (Contacted)"
          value={stats.hotLeads}
          change={stats.hotLeadsPercentage}
          changeLabel="of contacted"
          isPercentage
        />
        <StatCard
          label="Avg Lead Score"
          value={Math.round(stats.averageScore || 0)}
          change={stats.scoreImprovement || 0}
          changeLabel="vs last week"
        />
        <StatCard
          label="This Week (Contacted)"
          value={stats.leadsThisWeek}
          change={stats.weekOverWeekGrowth || 0}
          changeLabel="growth"
          isPercentage
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="xl:max-w-[75vw] 2xl:max-w-[82vw]">
          <LeadList
            leads={leads}
            loading={loading}
            onSelectLead={() => {}}
            sendEmail={() => {}}
            onRefresh={() => fetchMeetingLeads(currentPage)}
            currentPage={currentPage}
            leadsPerPage={leadsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
            selectedLeadIds={[]}
            onToggleLeadSelect={() => {}}
            onToggleSelectAll={() => {}}
            showContactActions={false}
            showSelection={false}
          />
        </div>
      </div>
    </div>
  );
}
