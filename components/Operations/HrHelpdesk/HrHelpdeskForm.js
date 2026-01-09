'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = ['Leave', 'Payroll', 'Policy', 'Other'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

const PRIORITY_COLORS = {
  Low: 'bg-orange-100 text-orange-800 border-orange-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  High: 'bg-orange-100 text-orange-800 border-orange-200',
  Critical: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_COLORS = {
  Open: 'bg-orange-100 text-orange-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

export default function HRHelpdeskForm({ request, onSaved }) {
  /* ---------------- NORMALIZED FLAGS ---------------- */

  const requestId = request?._id || null;
  const hasRequest = Boolean(requestId);
  const isCreate = !hasRequest;

  /* ---------------- CURRENT USER ---------------- */

  const [me, setMe] = useState(null);

  const isHR =
    Array.isArray(me?.userRole) && me.userRole.includes('HR');

  const isUserView = hasRequest && !isHR;

  /* ---------------- FORM STATE ---------------- */

  const emptyForm = {
    category: '',
    subject: '',
    description: '',
    priority: 'Medium',
    recipients: [],
    rejectReason: '',
  };

  const [form, setForm] = useState(emptyForm);
  const [employees, setEmployees] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState('');

  /* ---------------- LOAD USER & EMPLOYEES ---------------- */

  useEffect(() => {
    axios.get('/user/get-profile').then((res) => {
      setMe(res.data?.result?.user || null);
    });

    axios.get('/hrms/employee/list').then((res) => {
      setEmployees(Array.isArray(res.data?.result) ? res.data.result : []);
    });
  }, []);

  /* ---------------- INIT FORM ---------------- */

  useEffect(() => {
    if (!request) {
      setForm(emptyForm);
      return;
    }

    setForm({
      category: request.category ?? '',
      subject: request.subject ?? '',
      description: request.description ?? '',
      priority: request.priority ?? 'Medium',
      recipients: Array.isArray(request.recipients)
        ? request.recipients
        : [],
      rejectReason: '',
    });
  }, [request]);

  /* ---------------- PERMISSIONS ---------------- */

 const canEdit =
  isCreate ||
  (isUserView && ['Open', 'Rejected'].includes(request?.status));


  const canHrAct =
    isHR &&
    hasRequest &&
    request?.status === 'Open';

  /* ---------------- DERIVED DATA ---------------- */

  const designations = useMemo(() => {
    const map = {};
    employees.forEach((u) => {
      const name = u.designationId?.name || 'Other';
      if (!map[name]) map[name] = [];
      map[name].push(u);
    });
    return map;
  }, [employees]);

  const selectedUsers = employees.filter((u) =>
    form.recipients.includes(u._id)
  );

  /* ---------------- HELPERS ---------------- */

  function update(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
  }

  function toggleRecipient(userId) {
    setForm((p) => ({
      ...p,
      recipients: p.recipients.includes(userId)
        ? p.recipients.filter((id) => id !== userId)
        : [...p.recipients, userId],
    }));
  }

  /* ---------------- ACTIONS ---------------- */

  async function submit() {
    if (!form.category || !form.subject || !form.description) {
      return toast.error('All fields are required');
    }

    await axios.post('/hrms/hrhelpdesk', form);
    toast.success('Request submitted');
    onSaved();
  }

  async function resubmit() {
    await axios.patch(`/hrms/hrhelpdesk/${requestId}`, {
      ...form,
      status: 'Open',
    });
    toast.success('Request resubmitted');
    onSaved();
  }

  async function approve() {
    await axios.patch(`/hrms/hrhelpdesk/${requestId}`, {
      status: 'Approved',
      priority: form.priority,
      recipients: form.recipients,
    });
    toast.success('Request approved');
    onSaved();
  }

  async function reject() {
    if (!form.rejectReason) {
      return toast.error('Rejection reason required');
    }

    await axios.patch(`/hrms/hrhelpdesk/${requestId}`, {
      status: 'Rejected',
      hrNote: form.rejectReason,
    });
    toast.success('Request rejected');
    onSaved();
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-4xl mx-auto p-6">
      
        
        <div className="p-6 space-y-6">
          
          {/* Request Meta Information */}
          {hasRequest && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Request Information</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-800'}`}>
                  {request.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Raised By:</span>
                  <p className="font-medium text-gray-900 mt-1">
                    {request.raisedBy
                      ? `${request.raisedBy.firstName} ${request.raisedBy.lastName}`
                      : '—'}
                  </p>
                </div>
                
                <div>
                  <span className="text-gray-500">Recipients:</span>
                  <p className="font-medium text-gray-900 mt-1">
                    {request.recipients?.length
                      ? request.recipients
                          .map((u) => `${u.firstName} ${u.lastName}`)
                          .join(', ')
                      : '—'}
                  </p>
                </div>
              </div>

              {request.status === 'Rejected' && request.hrNote && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-900">Rejection Reason:</p>
                  <p className="text-sm text-red-700 mt-1">{request.hrNote}</p>
                </div>
              )}
            </div>
          )}

          {/* Request Details Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-5">
            <h4 className="font-semibold text-gray-900 pb-2 border-b border-gray-200">
              Request Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select
                label="Category"
                value={form.category}
                disabled={!canEdit}
                options={CATEGORY_OPTIONS}
                onChange={(e) => update('category', e.target.value)}
              />

              <Select
                label="Priority"
                value={form.priority}
                disabled={!isCreate && !isHR}
                options={PRIORITY_OPTIONS}
                onChange={(e) => update('priority', e.target.value)}
                badge={form.priority ? PRIORITY_COLORS[form.priority] : ''}
              />
            </div>

            <Input
              label="Subject"
              value={form.subject}
              disabled={!canEdit}
              placeholder="Enter a brief subject line"
              onChange={(e) => update('subject', e.target.value)}
            />

            <Textarea
              label="Description"
              value={form.description}
              disabled={!canEdit}
              placeholder="Provide detailed information about your request"
              onChange={(e) => update('description', e.target.value)}
            />
          </div>

          {/* Recipient Selection Section */}
          {canEdit && (
            <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
              <h4 className="font-semibold text-gray-900 pb-2 border-b border-gray-200">
                Select Recipients
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Designation
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg   transition-colors [&>option:checked]:bg-orange-500 [&>option:checked]:text-white"
                  value={selectedDesignation}
                  onChange={(e) => setSelectedDesignation(e.target.value)}
                >
                  <option value="">-- Select a Designation --</option>
                  {Object.keys(designations).map((d) => (
                    <option key={d} value={d}>
                      {d} ({designations[d].length})
                    </option>
                  ))}
                </select>
              </div>

              {selectedDesignation && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    {selectedDesignation} Team Members
                  </p>
                  <div className="space-y-2">
                    {designations[selectedDesignation].map((u) => (
                      <label
                        key={u._id}
                        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded "
                          checked={form.recipients.includes(u._id)}
                          onChange={() => toggleRecipient(u._id)}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {u.firstName} {u.lastName}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedUsers.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-orange-900 mb-2">
                    Selected Recipients ({selectedUsers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((u) => (
                      <span
                        key={u._id}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-orange-300 rounded-full text-sm text-orange-900"
                      >
                        {u.firstName} {u.lastName}
                        <button
                          onClick={() => toggleRecipient(u._id)}
                          className="text-orange-600 hover:text-orange-800 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HR Action Panel */}
          {canHrAct && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-5 space-y-4">
              <h4 className="font-semibold text-gray-900 pb-2 border-b border-amber-300">
                HR Review Actions
              </h4>

              <Textarea
                label="Rejection Reason (Optional)"
                value={form.rejectReason}
                placeholder="Provide a reason if rejecting this request"
                onChange={(e) => update('rejectReason', e.target.value)}
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={approve}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  Approve Request
                </button>
                <button
                  onClick={reject}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  Reject Request
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200">
            {isCreate && (
              <button
                onClick={submit}
                className="w-full px-6 py-3 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Submit Request
              </button>
            )}

            {isUserView && request?.status === 'Rejected' && (
              <button
                onClick={resubmit}
                className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Resubmit Request
              </button>
            )}
          </div>
        </div>
    
    </div>
  );
}

/* ---------------- FORM COMPONENTS ---------------- */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg transition-colors disabled:bg-gray-100 disabled:text-gray-500"
        {...props}
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <textarea
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg transition-colors resize-none disabled:bg-gray-100 disabled:text-gray-500"
        rows={4}
        {...props}
      />
    </div>
  );
}

function Select({ label, options, badge, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg   transition-colors disabled:bg-gray-100 disabled:text-gray-500 appearance-none [&>option:checked]:bg-orange-500"
          {...props}
        >
          <option value="">-- Select --</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {/* {badge && props.value && (
          <span className={`absolute right-12 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs font-medium border ${badge}`}>
            {props.value}
          </span>
        )} */}
      </div>
    </div>
  );
}
