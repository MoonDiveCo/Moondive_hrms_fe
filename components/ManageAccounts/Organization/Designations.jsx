'use client';

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import AddDesignationModal from './AddDesignationModal';

export default function Designations() {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add | edit | view
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const lastFocusedRef = useRef(null);

  useEffect(() => {
    fetchDesignations();
  }, []);

  async function fetchDesignations() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/hrms/organization/get-alldesignation');
      const data = res?.data?.result || res?.data;
      setDesignations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load designations', err);
      setError('Failed to fetch designations');
    } finally {
      setLoading(false);
    }
  }

  function openAdd(e) {
    lastFocusedRef.current = e?.currentTarget || null;
    setModalMode('add');
    setSelectedDesignation(null);
    setModalVisible(true);
  }

  function openView(des, e) {
    lastFocusedRef.current = e?.currentTarget || null;
    setModalMode('view');
    setSelectedDesignation(des);
    setModalVisible(true);
  }

  function openEdit(des, e) {
    e.stopPropagation();
    lastFocusedRef.current = e?.currentTarget || null;
    setModalMode('edit');
    setSelectedDesignation(des);
    setModalVisible(true);
  }

  async function handleDelete(id) {
    const ok = window.confirm('Delete this designation?');
    if (!ok) return;
    try {
      await axios.delete(`/hrms/organization/delete-designation/${id}`);
      setDesignations((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete');
    }
  }

  function handleSaved(des) {
    if (!des) return;
    setDesignations((prev) => {
      const exists = prev.find((p) => p._id === des._id);
      if (exists) return prev.map((p) => (p._id === des._id ? des : p));
      return [des, ...prev];
    });
  }

  function handleModalClose() {
    setModalVisible(false);
    setSelectedDesignation(null);
    if (lastFocusedRef.current) lastFocusedRef.current.focus();
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[var(--font-size-h2)] font-extrabold text-[var(--color-blackText)]">Designations</h1>
        <div className="flex items-center gap-3">
          <button onClick={openAdd} className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium shadow">
            Add Designation
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mail Alias</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {designations.length > 0 ? (
                designations.map((des, idx) => (
                  <tr key={des._id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} onClick={(e) => openView(des, e)} style={{cursor: 'pointer'}}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{des.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[350px]">{des.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-2">
                        {(des.skillsRequired || []).slice(0,5).map((s, i) => (
                          <span key={s + '-' + i} className="px-2 py-1 text-xs bg-gray-100 rounded-full">{s}</span>
                        ))}
                        {(des.skillsRequired || []).length > 5 && <span className="text-xs text-gray-400">+{(des.skillsRequired || []).length - 5}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{des.mailAlias || '-'}</td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); openView(des, e); }} title="View" className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                          <Eye size={16} className="text-[var(--color-primary)]" />
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); openEdit(des, e); }} title="Edit" className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                          <Edit2 size={16} className="text-[var(--color-primaryText)]" />
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); handleDelete(des._id); }} title="Delete" className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-300">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-6 text-center text-sm text-gray-500">No designations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddDesignationModal
        mode={modalMode}
        designation={selectedDesignation}
        isVisible={modalVisible}
        onClose={handleModalClose}
        onSaved={handleSaved}
        onDeleted={(id) => {
          setDesignations((prev) => prev.filter((d) => d._id !== id));
          handleModalClose();
        }}
      />
    </div>
  );
}
