"use client";

import { useEffect, useState } from "react";
import LeadList from "../../../../components/CrmDashboard/LeadList";
import { getLeadsFromAllSources } from "../../../../services/leadService"; 

export default function MeetingSchedulingPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 20;

  const fetchMeetingLeads = async () => {
    try {
      setLoading(true);

      const { allLeads } = await getLeadsFromAllSources({
        status: "Contacted",   
        page: currentPage,
        limit: leadsPerPage,
      });

      console.log("✅ Contacted leads from service:", allLeads);

      setLeads(allLeads);
    } catch (err) {
      console.error("❌ Error fetching meeting leads:", err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingLeads();
  }, [currentPage]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h4 className="text-primaryText font-semibold mb-4">
        Scheduled Meetings
      </h4>

      <LeadList
        leads={leads}
        loading={loading}
        onSelectLead={() => {}}
        sendEmail={() => {}}
        onRefresh={fetchMeetingLeads}
        currentPage={currentPage}
        leadsPerPage={leadsPerPage}
        onPageChange={setCurrentPage}
        selectedLeadIds={[]}
        onToggleLeadSelect={() => {}}
        onToggleSelectAll={() => {}}
        showContactActions={false}
        showSelection={false}
      />
    </div>
  );
}
