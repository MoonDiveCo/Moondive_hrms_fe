'use client';
import React from 'react';
import { FileText, Edit2, Trash2, Zap, Tag } from 'lucide-react';

const CATEGORY_COLORS = {
  OFFER_LETTER: 'bg-green-100 text-green-700',
  CONTRACT_OF_EMPLOYMENT: 'bg-blue-100 text-blue-700',
  APPRAISAL_LETTER: 'bg-purple-100 text-purple-700',
  EXPERIENCE_LETTER: 'bg-yellow-100 text-yellow-700',
  RELIEVING_LETTER: 'bg-orange-100 text-orange-700',
  NDA: 'bg-red-100 text-red-700',
  WARNING_LETTER: 'bg-red-100 text-red-800',
  PROMOTION_LETTER: 'bg-indigo-100 text-indigo-700',
  ONBOARDING_SOP: 'bg-teal-100 text-teal-700',
  POLICY: 'bg-gray-100 text-gray-700',
  OTHER: 'bg-gray-100 text-gray-600',
};

const CATEGORY_LABELS = {
  OFFER_LETTER: 'Offer Letter',
  CONTRACT_OF_EMPLOYMENT: 'Contract',
  APPRAISAL_LETTER: 'Appraisal',
  EXPERIENCE_LETTER: 'Experience',
  RELIEVING_LETTER: 'Relieving',
  NDA: 'NDA',
  WARNING_LETTER: 'Warning',
  PROMOTION_LETTER: 'Promotion',
  ONBOARDING_SOP: 'SOP',
  POLICY: 'Policy',
  OTHER: 'Other',
};

export default function TemplateList({
  templates,
  loading,
  canEdit,
  canDelete,
  canWrite,
  onEdit,
  onDelete,
  onGenerate,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
            <div className="h-3 bg-gray-100 rounded w-full mb-2" />
            <div className="h-8 bg-gray-100 rounded w-full mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="w-12 h-12 text-gray-300 mb-4" />
        <h4 className="text-gray-500 font-medium">No templates found</h4>
        <p className="text-sm text-gray-400 mt-1">
          {canWrite ? 'Create your first template to get started.' : 'No templates available in this category.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <TemplateCard
          key={template._id}
          template={template}
          canEdit={canEdit}
          canDelete={canDelete}
          canWrite={canWrite}
          onEdit={onEdit}
          onDelete={onDelete}
          onGenerate={onGenerate}
        />
      ))}
    </div>
  );
}

function TemplateCard({ template, canEdit, canDelete, canWrite, onEdit, onDelete, onGenerate }) {
  const categoryColor = CATEGORY_COLORS[template.category] || CATEGORY_COLORS.OTHER;
  const categoryLabel = CATEGORY_LABELS[template.category] || template.category;
  const paramCount = template.parameters?.length || 0;

  const handleDeleteClick = () => {
    if (window.confirm(`Delete template "${template.name}"? This action cannot be undone.`)) {
      onDelete(template._id);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow primaryShadow">
      {/* TOP ROW */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#FF7B30]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{template.name}</h4>
            {template.subCategory && (
              <p className="text-xs text-gray-400 truncate">{template.subCategory}</p>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {canEdit && (
            <button
              onClick={() => onEdit(template)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit template"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDeleteClick}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete template"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* DESCRIPTION */}
      {template.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
      )}

      {/* BADGES */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
          {categoryLabel}
        </span>
        {paramCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {paramCount} param{paramCount !== 1 ? 's' : ''}
          </span>
        )}
        {template.version > 1 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
            v{template.version}
          </span>
        )}
      </div>

      {/* FOOTER: who created + generate button */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {template.createdBy?.firstName
            ? `By ${template.createdBy.firstName} ${template.createdBy.lastName || ''}`
            : 'System template'}
        </p>

        {canWrite && (
          <button
            onClick={() => onGenerate(template)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF7B30] text-white text-xs font-medium hover:bg-[#ff6a1a] transition-colors"
          >
            <Zap className="w-3 h-3" />
            Generate
          </button>
        )}
      </div>
    </div>
  );
}
