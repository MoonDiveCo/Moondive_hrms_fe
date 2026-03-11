import apiClient from '../lib/axiosClient';

const BASE = 'hrms/payroll';

// ─────────────────────────────────────────────────────────────────────────────
// SALARY STRUCTURE API
// ─────────────────────────────────────────────────────────────────────────────

// Returns the 8 standard Indian payroll components as a starting point
export const getStandardComponents = () =>
  apiClient.get(`${BASE}/salary-structures/defaults`);

export const createSalaryStructure = (data) =>
  apiClient.post(`${BASE}/salary-structures`, data);

export const listSalaryStructures = (params = {}) =>
  apiClient.get(`${BASE}/salary-structures`, { params });

// All versions (active + historical) for one employee
export const getEmployeeSalaryStructure = (employeeId) =>
  apiClient.get(`${BASE}/salary-structures/employee/${employeeId}`);

export const getSalaryStructure = (id) =>
  apiClient.get(`${BASE}/salary-structures/${id}`);

// Revision: deactivates current structure + creates new version
export const reviseSalaryStructure = (id, data) =>
  apiClient.put(`${BASE}/salary-structures/${id}`, data);

export const deleteSalaryStructure = (id) =>
  apiClient.delete(`${BASE}/salary-structures/${id}`);

// ─────────────────────────────────────────────────────────────────────────────
// PAYSLIP PREVIEW (no DB write — for live "Review" step in modal)
// ─────────────────────────────────────────────────────────────────────────────

export const previewPayslip = (data) =>
  apiClient.post(`${BASE}/payslips/preview`, data);

// ─────────────────────────────────────────────────────────────────────────────
// PAYSLIP CRUD
// ─────────────────────────────────────────────────────────────────────────────

export const generatePayslip = (data) =>
  apiClient.post(`${BASE}/payslips/generate`, data);

export const bulkGeneratePayslips = (data) =>
  apiClient.post(`${BASE}/payslips/bulk-generate`, data);

export const listPayslips = (params = {}) =>
  apiClient.get(`${BASE}/payslips`, { params });

// Self-access: employee can call with their own employeeId
export const getEmployeePayslips = (employeeId, params = {}) =>
  apiClient.get(`${BASE}/payslips/employee/${employeeId}`, { params });

export const getPayslip = (id) =>
  apiClient.get(`${BASE}/payslips/${id}`);

export const updatePayslip = (id, data) =>
  apiClient.put(`${BASE}/payslips/${id}`, data);

// ─────────────────────────────────────────────────────────────────────────────
// PAYSLIP DISTRIBUTION
// ─────────────────────────────────────────────────────────────────────────────

export const sendPayslip = (id, data) =>
  apiClient.post(`${BASE}/payslips/${id}/send`, data);

export const bulkSendPayslips = (data) =>
  apiClient.post(`${BASE}/payslips/bulk-send`, data);

export const updatePayslipStatus = (id, status) =>
  apiClient.patch(`${BASE}/payslips/${id}/status`, { status });

export const deletePayslip = (id) =>
  apiClient.delete(`${BASE}/payslips/${id}`);

// ─────────────────────────────────────────────────────────────────────────────
// PAYSLIP CUSTOM TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

export const uploadPayslipTemplate = (data) =>
  apiClient.post(`${BASE}/templates/upload`, data);

export const listPayslipTemplates = () =>
  apiClient.get(`${BASE}/templates`);

// Returns { detectedKeys, auto: {key:value}, manual: [keys needing input] }
export const getTemplateParams = (templateId, payslipId) =>
  apiClient.get(`${BASE}/templates/${templateId}/params`, {
    params: payslipId ? { payslipId } : {},
  });

// Fill template → { docxBase64, filename }
export const generateFromTemplate = (templateId, data) =>
  apiClient.post(`${BASE}/templates/${templateId}/generate`, data);

// Fill template → send as DOCX email attachment
export const sendFromTemplate = (templateId, data) =>
  apiClient.post(`${BASE}/templates/${templateId}/send`, data);

export const deletePayslipTemplate = (id) =>
  apiClient.delete(`${BASE}/templates/${id}`);
