"use client";
import axios from "axios";
import {
  ENDPOINT_CONTACT_LEAD,
  ENDPOINT_INDIRECT_LEAD,
  ENDPOINT_CONNECT_LEAD,
} from "../text"; 

const API = process.env.NEXT_PUBLIC_MOONDIVE_API;


const normalizeContactLead = (lead) => ({
  ...lead,
  firstName: lead.fullName?.split(" ")[0] || lead.firstName || "",
  lastName: lead.fullName?.split(" ").slice(1).join(" ") || lead.lastName || "",
  leadScore: lead.leadScore || 0,
  leadGrade: lead.leadGrade || "Cold",
  status: lead.status || "New",
  companyName: lead.companyName || lead.company || "",
  phone: lead.phone || lead.mobileNumber || "",
  _sourceType: "direct",
  _sourceLabel: "Contact Form",
});

const normalizeChatbotLead = (lead) => ({
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
});

const normalizeScheduleLead = (lead) => ({
  ...lead,
  firstName: lead.fullName?.split(" ")[0] || lead.firstName || "",
  lastName: lead.fullName?.split(" ").slice(1).join(" ") || lead.lastName || "",
  leadScore: lead.leadScore || 0,
  leadGrade: lead.leadGrade || "Cold",
  status: lead.status || "New",
  companyName: lead.companyName || lead.company || "",
  phone: lead.phone || lead.mobileNumber || "",
  _sourceType: "schedule",
  _sourceLabel: "Schedule Meeting",
});

const normalizeSdrLead = (lead) => ({
  ...lead,
  status: lead.status || "New",
  leadGrade: lead.leadGrade || "Cold",
  leadScore: lead.leadScore || 0,
  companyName: lead.company || lead.companyName || "",
  _sourceType: "sdr",
  _sourceLabel: lead.source || "Lead Scoring",
});

const normalizeStatus = (status = "") =>
  status.replace(/_/g, " ").toLowerCase();

export const getLeadsFromAllSources = async ({
  status,   
  search,   
  time,     
  score,   
  page = 1,
  limit = 100,
} = {}) => {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));

  // server-side sorting for /leads
  if (time === "newest") {
    params.append("sortBy", "createdAt");
    params.append("sortOrder", "desc");
  } else if (time === "oldest") {
    params.append("sortBy", "createdAt");
    params.append("sortOrder", "asc");
  }

  if (score === "highest") {
    params.append("sortBy", "leadScore");
    params.append("sortOrder", "desc");
  } else if (score === "lowest") {
    params.append("sortBy", "leadScore");
    params.append("sortOrder", "asc");
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [contactRes, chatbotRes, scheduleRes, sdrRes] = await Promise.all([
    axios.get(`${API}${ENDPOINT_CONTACT_LEAD}`),
    axios.get(`${API}${ENDPOINT_INDIRECT_LEAD}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }),
    axios.get(`${API}${ENDPOINT_CONNECT_LEAD}`),
    axios.get(`${API}/leads?${params.toString()}`),
  ]);

  // CONTACT
  const contactRaw = contactRes.data?.result || [];
  const contactLeads = contactRaw.map(normalizeContactLead);

  // CHATBOT
  const chatbotRaw = chatbotRes.data?.results || [];
  const chatbotLeads = chatbotRaw.map(normalizeChatbotLead);

  // SCHEDULE
  const scheduleRaw = scheduleRes.data?.result || [];
  const scheduleLeads = scheduleRaw.map(normalizeScheduleLead);

  // SDR / LEAD SCORING
  const sdrData = sdrRes.data;
  const sdrRaw = Array.isArray(sdrData?.result?.leads)
    ? sdrData.result.leads
    : Array.isArray(sdrData?.result)
    ? sdrData.result
    : [];
  const sdrLeads = sdrRaw.map(normalizeSdrLead);

  // Combine all
  let combined = [
    ...contactLeads,
    ...chatbotLeads,
    ...scheduleLeads,
    ...sdrLeads,
  ];

  // Status filter (used by InProcess, Archived, etc)
  if (status) {
    const statusNorm = normalizeStatus(status);
    combined = combined.filter(
      (lead) => normalizeStatus(lead.status || "New") === statusNorm
    );
  }

  // Search filter (client-like)
  if (search) {
    const searchLower = search.toLowerCase();
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

  // Time sort (client side safety)
  if (time === "newest") {
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (time === "oldest") {
    combined.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  // Score sort (client side safety)
  if (score === "highest") {
    combined.sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));
  } else if (score === "lowest") {
    combined.sort((a, b) => (a.leadScore || 0) - (b.leadScore || 0));
  }

  return {
    contactLeads,
    chatbotLeads,
    scheduleLeads,
    sdrLeads,
    allLeads: combined,
  };
};

// Convenience helper: only by status
export const getLeadsByStatus = async (status) => {
  const { allLeads } = await getLeadsFromAllSources({ status });
  return allLeads;
};
