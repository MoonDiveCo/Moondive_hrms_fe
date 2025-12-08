"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import LeadList from "../../../../components/CrmDashboard/LeadList";
import {
  ENDPOINT_CONTACT_LEAD,
  ENDPOINT_INDIRECT_LEAD,
  ENDPOINT_CONNECT_LEAD,
} from "../../../../text";

export default function InProcessPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
    time: "",
    score: "",
  });

  const fetchInProcessLeads = async () => {
    setLoading(true);
    try {
      const api = process.env.NEXT_PUBLIC_MOONDIVE_API;
      const params = new URLSearchParams();
      params.append("page", String(filters.page));
      params.append("limit", String(filters.limit));

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

      // 2️⃣ Call all sources in parallel
      const [
        contactRes,
        chatbotRes,
        scheduleRes,
        sdrRes,
      ] = await Promise.all([
        axios.get(`${api}${ENDPOINT_CONTACT_LEAD}`),
        axios.get(`${api}${ENDPOINT_INDIRECT_LEAD}`),
        axios.get(`${api}${ENDPOINT_CONNECT_LEAD}`),
        axios.get(`${api}/leads?${params.toString()}`),
      ]);

      // 3️⃣ Normalize each list like you already do in LeadDashboard

      // CONTACT LEADS
      const contactRaw = contactRes.data?.result || [];
      const contactLeads = contactRaw.map((lead) => ({
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

      // CHATBOT LEADS
      const chatbotRaw = chatbotRes.data?.results || [];
      const chatbotLeads = chatbotRaw.map((lead) => ({
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

      // SCHEDULE MEETING LEADS
      const scheduleRaw = scheduleRes.data?.result || [];
      const scheduleLeads = scheduleRaw.map((lead) => ({
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

      // SDR / LEAD SCORING LEADS
      const sdrData = sdrRes.data;
      const sdrRaw = Array.isArray(sdrData?.result?.leads)
        ? sdrData.result.leads
        : Array.isArray(sdrData?.result)
        ? sdrData.result
        : [];

      const sdrLeads = sdrRaw.map((lead) => ({
        ...lead,
        status: lead.status || "New",
        leadGrade: lead.leadGrade || "Cold",
        leadScore: lead.leadScore || 0,
        companyName: lead.company || lead.companyName || "",
        _sourceType: "sdr",
        _sourceLabel: lead.source || "Lead Scoring",
      }));

      // 4️⃣ Combine all
      let combined = [
        ...contactLeads,
        ...chatbotLeads,
        ...scheduleLeads,
        ...sdrLeads,
      ];

      // 5️⃣ Filter only In Process
      combined = combined.filter(
        (lead) =>
          lead.status === "In Process" || lead.status === "In_Process"
      );

      // 6️⃣ Optional: search / time / score filters (like your dashboard)
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

      if (filters.time === "newest") {
        combined.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      } else if (filters.time === "oldest") {
        combined.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      }

      if (filters.score === "highest") {
        combined.sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));
      } else if (filters.score === "lowest") {
        combined.sort((a, b) => (a.leadScore || 0) - (b.leadScore || 0));
      }

      setLeads(combined);
    } catch (error) {
      console.error("Error fetching In-Process leads:", error);
      toast.error("Error loading In-Process leads");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInProcessLeads();
  }, [filters.page, filters.time, filters.score, filters.search]);

  const handleSendEmail = (lead) => {
    console.log("Send email from In-Process page to:", lead.email);
  };

  return (
    <div className="w-full p-6">
      <div className="mb-6 flex justify-between items-center">
        <h4 className="text-primary-100">In-Process Leads</h4>
      </div>
      <div className="xl:max-w-[75vw] 2xl:max-w-[82vw]">
      <LeadList
        leads={leads}
        loading={loading}
        onSelectLead={() => {}}
        sendEmail={handleSendEmail}
        onRefresh={fetchInProcessLeads}
        currentPage={filters.page}
        leadsPerPage={filters.limit}
        onPageChange={(newPage) =>
          setFilters((prev) => ({ ...prev, page: newPage }))
        }
        selectedLeadIds={[]} 
        onToggleLeadSelect={undefined}
        onToggleSelectAll={undefined}
      />
    </div>
    </div>
  );
}
