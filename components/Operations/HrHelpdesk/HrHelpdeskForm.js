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

  const isHR = Array.isArray(me?.userRole) && me.userRole.includes('HR');

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
      ? request.recipients.map(r =>
          typeof r === 'string'
            ? r
            : r.userId?._id || r.userId
        )
      : [],

    rejectReason: '',
  });
}, [request]);


  /* ---------------- PERMISSIONS ---------------- */

 const canEdit =
  isCreate ||
  (isUserView && ['Open', 'Rejected'].includes(request?.status));


  const canHrAct = isHR && hasRequest && request?.status === 'Open';

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
  async function updateRequest() {
  if (!requestId) return;

  if (!form.category || !form.subject || !form.description) {
    return toast.error('All fields are required');
  }

  console.log(form)

  await axios.patch(`/hrms/hrhelpdesk/${requestId}`, {
    category: form.category,
    subject: form.subject,
    description: form.description,
    priority: form.priority,
    recipients: form.recipients,
  });

  toast.success('Request updated');
  onSaved();
}


  async function approve() {
    console.log(form)
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
      return toast.error('Rejection reason');
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
    <div className='max-w-2xl mx-auto pb-24'>
      {/* Request Meta Information */}
      {hasRequest && (
        <div className='mb-8 pb-6 border-b border-gray-200'>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='text-lg font-semibold text-gray-900'>
              Request Information
            </h4>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {request.status}
            </span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-sm'>
            <div>
              <span className='text-gray-500 text-xs uppercase tracking-wide'>
                Raised By
              </span>
              <p className='font-medium text-gray-900 mt-1'>
                {request.raisedBy
                  ? `${request.raisedBy.firstName} ${request.raisedBy.lastName}`
                  : '—'}
              </p>
            </div>

            <div>
              <span className='text-gray-500 text-xs uppercase tracking-wide'>
                Recipients
              </span>
              <p className='font-medium text-gray-900 mt-1'>
                {request.recipients?.length
  ? request.recipients
      .map((r) => {
        const u = r.userId;
        return u ? `${u.firstName} ${u.lastName}` : '';
      })
      .filter(Boolean)
      .join(', ')
  : '—'}

              </p>
            </div>
          </div>

          {request.status === 'Rejected' && request.hrNote && (
            <div className='mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded'>
              <p className='text-sm font-medium text-red-900'>
                Rejection Reason:
              </p>
              <p className='text-sm text-red-700 mt-1'>{request.hrNote}</p>
            </div>
          )}
        </div>
      )}

      {/* Request Details Section */}
      <section className='mb-12'>
        <div className='space-y-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <Select
              label='Category'
              value={form.category}
              disabled={!canEdit}
              options={CATEGORY_OPTIONS}
              onChange={(e) => update('category', e.target.value)}
            />

            <Select
              label='Priority'
              value={form.priority}
              disabled={!isCreate && !isHR}
              options={PRIORITY_OPTIONS}
              onChange={(e) => update('priority', e.target.value)}
              badge={form.priority ? PRIORITY_COLORS[form.priority] : ''}
            />
          </div>

          <Input
            label='Subject'
            value={form.subject}
            disabled={!canEdit}
            placeholder='Enter a brief subject line'
            onChange={(e) => update('subject', e.target.value)}
          />

          <Textarea
            label='Description'
            value={form.description}
            disabled={!canEdit}
            placeholder='Provide detailed information about your request'
            onChange={(e) => update('description', e.target.value)}
          />
        </div>
      </section>

      {/* Recipient Selection Section */}
      {canEdit && (
        <section className='mb-12'>
          <h5 className='text-lg font-semibold mb-8'>Select Recipients</h5>

          <div className='space-y-8'>
            <div>
              <label className='block text-sm font-medium text-gray-500 mb-1.5'>
                Filter by Designation
              </label>
              <select
                className='ghost-input w-full py-2 text-gray-900 focus:outline-none focus:border-orange-500'
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                style={{
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: '2px solid #E2E8F0',
                  backgroundColor: 'transparent',
                  paddingLeft: 0,
                  paddingRight: 0,
                  borderRadius: 0,
                }}
              >
                <option value=''>-- Select a Designation --</option>
                {Object.keys(designations).map((d) => (
                  <option key={d} value={d}>
                    {d} ({designations[d].length})
                  </option>
                ))}
              </select>
            </div>

            {selectedDesignation && (
              <div className='space-y-3'>
                <p className='text-sm font-medium text-gray-700'>
                  {selectedDesignation} Team Members
                </p>
                <div className='space-y-2 max-h-64 overflow-y-auto'>
                  {designations[selectedDesignation].map((u) => (
                    <label
                      key={u._id}
                      className='flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded transition-colors'
                    >
                      <input
                        type='checkbox'
                        className='w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500'
                        checked={form.recipients.includes(u._id)}
                        onChange={() => toggleRecipient(u._id)}
                      />
                      <span className='text-sm text-gray-900'>
                        {u.firstName} {u.lastName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {selectedUsers.length > 0 && (
              <div>
                <p className='text-sm font-medium text-gray-700 mb-3'>
                  Selected Recipients ({selectedUsers.length})
                </p>
                <div className='flex flex-wrap gap-2'>
                  {selectedUsers.map((u) => (
                    <span
                      key={u._id}
                      className='inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700'
                    >
                      {u.firstName} {u.lastName}
                      <button
                        onClick={() => toggleRecipient(u._id)}
                        className='text-gray-400 hover:text-gray-600 font-bold text-base leading-none'
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* HR Action Panel */}
      {canHrAct && (
        <section className='mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl'>
          <h4 className='font-semibold text-gray-900 mb-6 text-lg'>
            HR Review Actions
          </h4>

          <div className='space-y-6'>
            <Textarea
              label='Rejection Reason'
              value={form.rejectReason}
              placeholder='Provide a reason if rejecting this request'
              onChange={(e) => update('rejectReason', e.target.value)}
            />

            <div className='flex flex-col sm:flex-row gap-3'>
              <button
                onClick={approve}
                className='flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors'
              >
                Approve Request
              </button>
              <button
                onClick={reject}
                className='flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors'
              >
                Reject Request
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Action Buttons */}
      
<div className="flex pt-4 items-center justify-center gap-4">
  
  {/* CREATE */}
  {isCreate && (
    <button
      onClick={submit}
      className="w-64 bg-primary text-white py-2.5 rounded-full shadow-lg transition-all active:scale-[0.98]"
    >
      Submit Request
    </button>
  )}

  {/* UPDATE (OPEN / REJECTED) */}
  {!isCreate && isUserView && canEdit && request?.status === 'Open' && (
    <button
      onClick={updateRequest}
      className="w-64 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-full shadow-lg transition-all active:scale-[0.98]"
    >
      Update Request
    </button>
  )}

  {/* RESUBMIT (REJECTED ONLY) */}
  {!isCreate && isUserView && request?.status === 'Rejected' && (
    <button
      onClick={resubmit}
      className="w-64 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-full shadow-lg transition-all active:scale-[0.98]"
    >
      Update & Resubmit
    </button>
  )}
</div>

    </div>
  );
}

/* ---------------- FORM COMPONENTS ---------------- */


function Input({ label, ...props }) {
  return (
    <div className='space-y-1.5'>
      <label className='block text-sm font-medium text-gray-500'>{label}</label>
      <input
        className='w-full py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 disabled:text-gray-400'
        style={{
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: '2px solid #E2E8F0',
          backgroundColor: 'transparent',
          paddingLeft: 0,
          paddingRight: 0,
          borderRadius: 0,
        }}
        {...props}
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div className='space-y-1.5'>
      <label className='block text-sm font-medium text-gray-500'>{label}</label>
      <textarea
        className='w-full py-2 text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-orange-500 disabled:text-gray-400'
        style={{
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: '2px solid #E2E8F0',
          backgroundColor: 'transparent',
          paddingLeft: 0,
          paddingRight: 0,
          borderRadius: 0,
        }}
        rows={4}
        {...props}
      />
    </div>
  );
}

function Select({ label, options, badge, ...props }) {
  return (
    <div className='space-y-1.5'>
      <label className='block text-sm font-medium text-gray-500'>{label}</label>
      <select
        className='w-full py-2 text-gray-900 focus:outline-none focus:border-orange-500 disabled:text-gray-400'
        style={{
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: '2px solid #E2E8F0',
          backgroundColor: 'transparent',
          paddingLeft: 0,
          paddingRight: 0,
          borderRadius: 0,
        }}
        {...props}
      >
        <option value=''>-- Select --</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
