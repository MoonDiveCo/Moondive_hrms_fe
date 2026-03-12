import apiClient from '../lib/axiosClient';

const BASE = 'hrms/hr-docs';

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE API
// ─────────────────────────────────────────────────────────────────────────────

export const getTemplates = (params = {}) =>
  apiClient.get(`${BASE}/templates`, { params });

export const getTemplate = (id) =>
  apiClient.get(`${BASE}/templates/${id}`);

export const createTemplate = (data) =>
  apiClient.post(`${BASE}/templates`, data);

export const updateTemplate = (id, data) =>
  apiClient.put(`${BASE}/templates/${id}`, data);

export const deleteTemplate = (id) =>
  apiClient.delete(`${BASE}/templates/${id}`);

// ─────────────────────────────────────────────────────────────────────────────
// PARAMETER API
// ─────────────────────────────────────────────────────────────────────────────

export const getSystemParameters = () =>
  apiClient.get(`${BASE}/parameters/system`);

// employeeId: MongoDB ObjectId string OR 'new' for new joiners
export const resolveParameters = (templateId, employeeId) =>
  apiClient.get(`${BASE}/parameters/resolve/${templateId}/${employeeId || 'new'}`);

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT GENERATION & MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const generateDocument = (data) =>
  apiClient.post(`${BASE}/documents/generate`, data);

export const getDocument = (id) =>
  apiClient.get(`${BASE}/documents/${id}`);

export const getAllDocuments = (params = {}) =>
  apiClient.get(`${BASE}/documents`, { params });

export const getEmployeeDocuments = (employeeId, params = {}) =>
  apiClient.get(`${BASE}/documents/employee/${employeeId}`, { params });

export const sendDocument = (id, data) =>
  apiClient.post(`${BASE}/documents/${id}/send`, data);

export const deleteDocument = (id) =>
  apiClient.delete(`${BASE}/documents/${id}`);

export const updateDocumentStatus = (id, status) =>
  apiClient.patch(`${BASE}/documents/${id}/status`, { status });

export const bulkGenerateDocuments = (data) =>
  apiClient.post(`${BASE}/documents/bulk-generate`, data);

export const updateDocument = (id, data) =>
  apiClient.put(`${BASE}/documents/${id}`, data);

// ─────────────────────────────────────────────────────────────────────────────
// ONBOARDING SOP API
// ─────────────────────────────────────────────────────────────────────────────

export const getSOPs = (params = {}) =>
  apiClient.get(`${BASE}/sops`, { params });

export const createSOP = (data) =>
  apiClient.post(`${BASE}/sops`, data);

export const updateSOP = (id, data) =>
  apiClient.put(`${BASE}/sops/${id}`, data);

export const deleteSOP = (id) =>
  apiClient.delete(`${BASE}/sops/${id}`);

export const assignSOP = (sopId, data) =>
  apiClient.post(`${BASE}/sops/${sopId}/assign`, data);

// ─────────────────────────────────────────────────────────────────────────────
// ONBOARDING RECORDS API
// ─────────────────────────────────────────────────────────────────────────────

export const getOnboardingRecords = (params = {}) =>
  apiClient.get(`${BASE}/onboarding-records`, { params });

export const getOnboardingRecord = (id) =>
  apiClient.get(`${BASE}/onboarding-records/${id}`);

export const updateChecklistItem = (recordId, itemId, data) =>
  apiClient.patch(`${BASE}/onboarding-records/${recordId}/items/${itemId}`, data);
