'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import EntityTable from '@/components/Common/EntityTable';
import HRHelpdeskSlideOver from '@/components/Operations/HrHelpdesk/HrHelpdeskSlideOver';
import axios from 'axios';

export default function HRHelpdeskPage() {
  const [tab, setTab] = useState('sent');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const lastFocusedRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [tab]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await axios.get(
        tab === 'sent'
          ? '/hrms/hrhelpdesk/sent'
          : '/hrms/hrhelpdesk/received'
      );
      setRows(
  Array.isArray(res.data?.result) ? res.data.result : []
);

    } catch (e) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }

  function openAdd(e) {
    lastFocusedRef.current = e?.currentTarget;
    setSelected(null);
    setOpen(true);
  }

  function openView(row, e) {
    lastFocusedRef.current = e?.currentTarget;
    setSelected(row);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setSelected(null);
    lastFocusedRef.current?.focus();
  }

  const columns = [
    { key: 'subject', header: 'Subject' },
    { key: 'category', header: 'Category' },
    {
      key: 'priority',
      header: 'Priority',
      render: (r) => (
        <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
          {r.priority}
        </span>
      ),
    },
    { key: 'status', header: 'Status' },
    {
      key: 'actions',
      header: 'action',
      render: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openView(r, e);
          }}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="container">
      <Toaster richColors position="top-right" />

      <div className="flex items-center justify-between p-4">
        <h3 className="text-blackText">HR Help Desk</h3>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
        >
          <Plus size={16} /> New Request
        </button>
      </div>

      <div className="flex gap-3 px-4 mb-4">
        {['sent', 'received'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md ${
              tab === t ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            {t === 'sent' ? 'Sent Requests' : 'Received Requests'}
          </button>
        ))}
      </div>

      <EntityTable
        data={rows}
        columns={columns}
        loading={loading}
        emptyText="No requests found"
        onRowClick={(r, e) => openView(r, e)}
      />

      <HRHelpdeskSlideOver
        isOpen={open}
        onClose={close}
        request={selected}
        onSaved={() => {
          fetchData();
          close();
        }}
      />
    </div>
  );
}
