"use client"
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import React from 'react'

function LayoutTab({
    editingCaseStudy,
    moveSectionUp,
    moveSectionDown,
    toggleSection,
    AVAILABLE_SECTIONS 
}) {
    return (
        <div className="space-y-6">
            <div className="rounded-lg border bg-gray-50 p-6">
                <h3 className="mb-6 text-lg font-medium text-gray-800">
                    Section Layout & Ordering
                </h3>
                <p className="mb-6 text-sm text-gray-600">
                    Drag and drop or use the arrows to reorder sections.
                    Toggle sections on/off to customize your case study
                    layout.
                </p>

                <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">
                        Active Sections (in order)
                    </h4>
                    <div className="space-y-2">
                        {editingCaseStudy.sectionOrder?.map(
                            (sectionId, index) => {
                                const section = AVAILABLE_SECTIONS.find(
                                    (s) => s.id === sectionId
                                )
                                if (!section) return null

                                return (
                                    <div
                                        key={sectionId}
                                        className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <GripVertical className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {section.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {section.description}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => moveSectionUp(index)}
                                                disabled={index === 0}
                                                className={`rounded p-1 ${index === 0
                                                    ? 'cursor-not-allowed text-gray-300'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveSectionDown(index)}
                                                disabled={
                                                    index ===
                                                    editingCaseStudy.sectionOrder.length - 1
                                                }
                                                className={`rounded p-1 ${index ===
                                                    editingCaseStudy.sectionOrder.length - 1
                                                    ? 'cursor-not-allowed text-gray-300'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <ArrowDown className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleSection(sectionId)}
                                                className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )
                            }
                        )}
                    </div>

                    <h4 className="mt-8 font-medium text-gray-700">
                        Available Sections
                    </h4>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {AVAILABLE_SECTIONS.filter(
                            (section) =>
                                !editingCaseStudy.sectionOrder?.includes(
                                    section.id
                                )
                        ).map((section) => (
                            <div
                                key={section.id}
                                className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4"
                            >
                                <div>
                                    <div className="font-medium text-gray-700">
                                        {section.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {section.description}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toggleSection(section.id)}
                                    className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200"
                                >
                                    Add
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LayoutTab