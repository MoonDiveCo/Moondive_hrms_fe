'use client';

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import EntityTable from '../../../../../components/Common/EntityTable';
import ShiftModal from '../../../../../components/Operations/Shift/ShiftModal';

export default function Shifts() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add | edit | view
  const [selectedShift, setSelectedShift] = useState(null);
  const lastFocusedRef = useRef(null);

  useEffect(() => {
    fetchShifts();
  }, []);

  async function fetchShifts() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/hrms/organization/get-shifts');
      const data = res?.data?.result || res?.data;
      setShifts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load shifts', err);
      setError('Failed to fetch shifts');
    } finally {
      setLoading(false);
    }
  }

  function openAdd(e) {
    lastFocusedRef.current = e?.currentTarget || null;
    setModalMode('add');
    setSelectedShift(null);
    setModalVisible(true);
  }

  function openView(shift, e) {
    lastFocusedRef.current = e?.currentTarget || null;
    setModalMode('view');
    setSelectedShift(shift);
    setModalVisible(true);
  }

  function openEdit(shift, e) {
    e.stopPropagation();
    lastFocusedRef.current = e?.currentTarget || null;
    setModalMode('edit');
    setSelectedShift(shift);
    setModalVisible(true);
  }

  async function handleDelete(id) {
    const ok = window.confirm('Delete this shift?');
    if (!ok) return;
    try {
      await axios.delete(`/hrms/organization/delete-shift/${id}`);
      setShifts((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete');
    }
  }

  function handleSaved(shift) {
    if (!shift) return;
    setShifts((prev) => {
      const exists = prev.find((p) => p._id === shift._id);
      if (exists) return prev.map((p) => (p._id === shift._id ? shift : p));
      return [shift, ...prev];
    });
  }

  function handleModalClose() {
    setModalVisible(false);
    setSelectedShift(null);
    if (lastFocusedRef.current) lastFocusedRef.current.focus();
  }

  const columns = [
    {
      key: 'name',
      header: 'Shift Name',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900',
      render: (row) => row.name,
    },
    {
      key: 'timeRange',
      header: 'Time',
      render: (row) => `${row.startTime || '-'} - ${row.endTime || '-'}`,
    },
    {
      key: 'margin',
      header: 'Shift Margin',
      render: (row) => {
        const before = row.shiftMargin?.beforeShiftStart;
        const after = row.shiftMargin?.afterShiftEnd;
        if (!before && !after) return '-';
        return `${before ? before + 'm before' : ''}${
          before && after ? ', ' : ''
        }${after ? after + 'm after' : ''}`;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-centre text-sm font-medium',
      render: (row) => (
        <div className="inline-flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openView(row, e);
            }}
            title="View"
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <Eye size={16} className="text-[var(--color-primary)]" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row, e);
            }}
            title="Edit"
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <Edit2 size={16} className="text-[var(--color-primaryText)]" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id);
            }}
            title="Delete"
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container">
      <div className="flex items-center justify-between p-4 ">
        <h3 className=" text-blackText">
          Shifts
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-lg bg-primary text-white font-medium shadow"
          >
            Add Shift
          </button>
        </div>
      </div>

      <EntityTable
        columns={columns}
        data={shifts}
        onRowClick={(row, e) => openView(row, e)}
        emptyText="No shifts found."
      />

      <ShiftModal
        mode={modalMode}
        shift={selectedShift}
        isVisible={modalVisible}
        onClose={handleModalClose}
        onSaved={handleSaved}
        onDeleted={(id) => {
          setShifts((prev) => prev.filter((s) => s._id !== id));
          handleModalClose();
        }}
      />
    </div>
  );
}
