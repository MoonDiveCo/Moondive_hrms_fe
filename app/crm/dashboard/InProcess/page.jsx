"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LeadList from "../../../../components/CrmDashboard/LeadList";
import { getLeadsFromAllSources } from "../../../../services/leadService";
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

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailModal, setEmailModal] = useState({
    open: false,
    recipients: [],
    type: "individual",
  });

  // Fetch In-Process leads using the common service
  const fetchInProcessLeads = async () => {
    setLoading(true);
    try {
      const { allLeads } = await getLeadsFromAllSources({
        status: "In Process",
        search: filters.search,
        time: filters.time, 
        score: filters.score, 
        page: filters.page,
        limit: filters.limit,
      });
      setLeads(allLeads);
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
    setEmailModal({
      open: true,
      recipients: [lead],
      type: "individual",
    });
  };

  // Send email logic
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
        setEmailModal({ open: false, recipients: [], type: "individual" });
        fetchInProcessLeads();
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

  return (
    <div className="w-full p-6">
      <div className="mb-6 flex justify-between items-center">
        <h4 className="text-primaryText">In-Process Leads</h4>
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
          showContactActions={true} 
          showSelection={false}
        />
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
