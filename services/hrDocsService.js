import axios from 'axios';

const BASE = '/hrms/hr-docs';

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE API
// ─────────────────────────────────────────────────────────────────────────────

export const getTemplates = (params = {}) =>
  axios.get(`${BASE}/templates`, { params });

export const getTemplate = (id) =>
  axios.get(`${BASE}/templates/${id}`);

export const createTemplate = (data) =>
  axios.post(`${BASE}/templates`, data);

export const updateTemplate = (id, data) =>
  axios.put(`${BASE}/templates/${id}`, data);

export const deleteTemplate = (id) =>
  axios.delete(`${BASE}/templates/${id}`);

// ─────────────────────────────────────────────────────────────────────────────
// PARAMETER API
// ─────────────────────────────────────────────────────────────────────────────

export const getSystemParameters = () =>
  axios.get(`${BASE}/parameters/system`);

// employeeId: MongoDB ObjectId string OR 'new' for new joiners
export const resolveParameters = (templateId, employeeId) =>
  axios.get(`${BASE}/parameters/resolve/${templateId}/${employeeId || 'new'}`);

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT GENERATION & MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const generateDocument = (data) =>
  axios.post(`${BASE}/documents/generate`, data);

export const getDocument = (id) =>
  axios.get(`${BASE}/documents/${id}`);

export const getAllDocuments = (params = {}) =>
  axios.get(`${BASE}/documents`, { params });

export const getEmployeeDocuments = (employeeId, params = {}) =>
  axios.get(`${BASE}/documents/employee/${employeeId}`, { params });

export const sendDocument = (id, data) =>
  axios.post(`${BASE}/documents/${id}/send`, data);

export const deleteDocument = (id) =>
  axios.delete(`${BASE}/documents/${id}`);

export const updateDocumentStatus = (id, status) =>
  axios.patch(`${BASE}/documents/${id}/status`, { status });

export const bulkGenerateDocuments = (data) =>
  axios.post(`${BASE}/documents/bulk-generate`, data);

export const updateDocument = (id, data) =>
  axios.put(`${BASE}/documents/${id}`, data);

// ─────────────────────────────────────────────────────────────────────────────
// ONBOARDING SOP API
// ─────────────────────────────────────────────────────────────────────────────

export const getSOPs = (params = {}) =>
  axios.get(`${BASE}/sops`, { params });

export const createSOP = (data) =>
  axios.post(`${BASE}/sops`, data);

export const updateSOP = (id, data) =>
  axios.put(`${BASE}/sops/${id}`, data);

export const deleteSOP = (id) =>
  axios.delete(`${BASE}/sops/${id}`);

export const assignSOP = (sopId, data) =>
  axios.post(`${BASE}/sops/${sopId}/assign`, data);

// ─────────────────────────────────────────────────────────────────────────────
// ONBOARDING RECORDS API
// ─────────────────────────────────────────────────────────────────────────────

export const getOnboardingRecords = (params = {}) =>
  axios.get(`${BASE}/onboarding-records`, { params });

export const getOnboardingRecord = (id) =>
  axios.get(`${BASE}/onboarding-records/${id}`);

export const updateChecklistItem = (recordId, itemId, data) =>
  axios.patch(`${BASE}/onboarding-records/${recordId}/items/${itemId}`, data);
