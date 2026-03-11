'use client';

import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'sonner';
import { AuthContext } from '@/context/authContext';
import SubModuleProtectedRoute from '@/lib/routeProtection/SubModuleProtectedRoute';
import TemplateList from '@/components/HRDocs/Templates/TemplateList';
import CreateTemplateModal from '@/components/HRDocs/Templates/CreateTemplateModal';
import GenerateDocModal from '@/components/HRDocs/DocumentGenerator/GenerateDocModal';
import { getTemplates, deleteTemplate } from '@/services/hrDocsService';
import { Search, Plus } from 'lucide-react';

const CATEGORIES = [
  { key: 'ALL', label: 'All Templates' },
  { key: 'OFFER_LETTER', label: 'Offer Letter' },
  { key: 'CONTRACT_OF_EMPLOYMENT', label: 'Contract' },
  { key: 'APPRAISAL_LETTER', label: 'Appraisal' },
  { key: 'EXPERIENCE_LETTER', label: 'Experience' },
  { key: 'RELIEVING_LETTER', label: 'Relieving' },
  { key: 'NDA', label: 'NDA' },
  { key: 'WARNING_LETTER', label: 'Warning' },
  { key: 'PROMOTION_LETTER', label: 'Promotion' },
  { key: 'POLICY', label: 'Policy' },
  { key: 'OTHER', label: 'Other' },
];

export default function TemplatesPage() {
  const { allUserPermissions = [] } = useContext(AuthContext);

  const canWrite = allUserPermissions.includes('HRMS:TEMPLATES:WRITE');
  const canEdit = allUserPermissions.includes('HRMS:TEMPLATES:EDIT');
  const canDelete = allUserPermissions.includes('HRMS:TEMPLATES:DELETE');

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [generateTemplate, setGenerateTemplate] = useState(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 12 };
      if (activeCategory !== 'ALL') params.category = activeCategory;
      const res = await getTemplates(params);
      const data = res.data?.result || res.data?.data || {};
      setTemplates(data.docs || data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [activeCategory, currentPage]);

  const handleDelete = async (id) => {
    try {
      await deleteTemplate(id);
      toast.success('Template deleted');
      fetchTemplates();
    } catch {
      toast.error('Failed to delete template');
    }
  };

  const filteredTemplates = templates.filter((t) =>
    (t.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SubModuleProtectedRoute>
      <div className="p-4 bg-gray-50 min-h-screen hide-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-bold text-gray-900">HR Document Templates</h4>
              <p className="text-sm text-gray-500 mt-1">
                Manage master templates with smart parameters for all employee documents
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search templates..."
                  className="w-64 pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              {canWrite && (
                <button
                  onClick={() => { setEditTemplate(null); setCreateModalOpen(true); }}
                  className="px-5 py-2.5 rounded-lg bg-[#FF7B30] text-white text-sm font-medium hover:bg-[#ff6a1a] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Template
                </button>
              )}
            </div>
          </div>

          {/* CATEGORY FILTER TABS */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? 'bg-[#FF7B30] text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* TEMPLATE LIST */}
          <TemplateList
            templates={filteredTemplates}
            loading={loading}
            canEdit={canEdit}
            canDelete={canDelete}
            canWrite={canWrite}
            onEdit={(t) => { setEditTemplate(t); setCreateModalOpen(true); }}
            onDelete={handleDelete}
            onGenerate={(t) => setGenerateTemplate(t)}
          />

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm rounded-lg bg-[#FF7B30] text-white hover:bg-[#ff6a1a] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {createModalOpen && (
        <CreateTemplateModal
          open={createModalOpen}
          onClose={() => { setCreateModalOpen(false); setEditTemplate(null); }}
          editTemplate={editTemplate}
          onSuccess={() => { setCreateModalOpen(false); setEditTemplate(null); fetchTemplates(); }}
        />
      )}

      {generateTemplate && (
        <GenerateDocModal
          open={!!generateTemplate}
          template={generateTemplate}
          onClose={() => setGenerateTemplate(null)}
          onSuccess={() => { setGenerateTemplate(null); toast.success('Document generated!'); }}
        />
      )}
    </SubModuleProtectedRoute>
  );
}
