'use client'
import { Plus, Trash2, Upload, X } from 'lucide-react'
import dynamic from 'next/dynamic';
import React from 'react'

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[150px] border bg-gray-50 p-4">Loading editor...</div>
  ),
})

function ContentTab({
    editingCaseStudy, 
    handleFormChange, 
    handleSolutionImageDelete,
    handleSolutionImageUpload,
    solutionImageInputRef,
    isUploadingSolutionImage,
    addSolutionItem,
    removeSolutionItem,
    updateSolutionItem,
    quillRef,
    quillModules,
    quillFormats
    }) {
    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 text-black">
                        Solution Section (New Format)
                    </h3>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={
                                editingCaseStudy.solutionSection?.enabled !==
                                false
                            }
                            onChange={(e) => {
                                const updatedSolutionSection = {
                                    ...editingCaseStudy.solutionSection,
                                    enabled: e.target.checked,
                                }
                                handleFormChange(
                                    'solutionSection',
                                    updatedSolutionSection
                                )
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 text-black"
                        />
                        <span className="text-sm text-gray-700">
                            Enable Section
                        </span>
                    </label>
                </div>

                {editingCaseStudy.solutionSection?.enabled !== false && (
                    <div className="space-y-6">
                        {/* Section Title & Subtitle */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Section Title
                                </label>
                                <input
                                    type="text"
                                    value={
                                        editingCaseStudy.solutionSection?.title ||
                                        'Our Solution'
                                    }
                                    onChange={(e) => {
                                        const updatedSolutionSection = {
                                            ...editingCaseStudy.solutionSection,
                                            title: e.target.value,
                                        }
                                        handleFormChange(
                                            'solutionSection',
                                            updatedSolutionSection
                                        )
                                    }}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black"
                                    placeholder="e.g., Our Solution"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Section Subtitle
                                </label>
                                <input
                                    type="text"
                                    value={
                                        editingCaseStudy.solutionSection?.subtitle ||
                                        'How We Solved It'
                                    }
                                    onChange={(e) => {
                                        const updatedSolutionSection = {
                                            ...editingCaseStudy.solutionSection,
                                            subtitle: e.target.value,
                                        }
                                        handleFormChange(
                                            'solutionSection',
                                            updatedSolutionSection
                                        )
                                    }}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black   "
                                    placeholder="e.g., How We Solved It"
                                />
                            </div>
                        </div>

                        {/* Solution Image Upload */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Solution Image (Left Side)
                            </label>

                            {editingCaseStudy.solutionSection?.imageUrl ? (
                                <div className="relative">
                                    <img
                                        src={
                                            editingCaseStudy.solutionSection.imageUrl
                                        }
                                        alt="Solution"
                                        className="h-48 w-full rounded-lg object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSolutionImageDelete}
                                        className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleSolutionImageUpload}
                                        className="hidden"
                                        id="solution-image-upload"
                                        ref={solutionImageInputRef}
                                        disabled={isUploadingSolutionImage}
                                    />
                                    <label
                                        htmlFor="solution-image-upload"
                                        className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 ${isUploadingSolutionImage
                                            ? 'cursor-not-allowed opacity-50'
                                            : ''
                                            }`}
                                    >
                                        <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                            <Upload className="mb-4 h-8 w-8 text-gray-500" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">
                                                    Click to upload
                                                </span>{' '}
                                                solution image
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, GIF up to 10MB
                                            </p>
                                        </div>
                                        {isUploadingSolutionImage && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Solution Items */}
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">
                                    Solution Items (Right Side)
                                </label>
                                <button
                                    type="button"
                                    onClick={addSolutionItem}
                                    className="flex items-center space-x-2 rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add Solution</span>
                                </button>
                            </div>

                            <div className="max-h-96 space-y-4 overflow-y-auto pr-2">
                                {editingCaseStudy.solutionSection?.items?.map(
                                    (item, index) => (
                                        <div
                                            key={index}
                                            className="rounded-lg border border-gray-200 bg-green-50 p-4"
                                        >
                                            <div className="mb-4 flex items-center justify-between">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    Solution #{index + 1}
                                                </h4>
                                                {editingCaseStudy.solutionSection.items
                                                    .length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeSolutionItem(index)
                                                            }
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                                        Solution Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={item.title}
                                                        onChange={(e) =>
                                                            updateSolutionItem(
                                                                index,
                                                                'title',
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black"
                                                        placeholder="Enter solution title..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                                        Solution Description
                                                    </label>
                                                    <textarea
                                                        value={item.description}
                                                        onChange={(e) =>
                                                            updateSolutionItem(
                                                                index,
                                                                'description',
                                                                e.target.value
                                                            )
                                                        }
                                                        rows={4}
                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black"
                                                        placeholder="Describe the solution in detail..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}

                                {(!editingCaseStudy.solutionSection?.items ||
                                    editingCaseStudy.solutionSection.items
                                        .length === 0) && (
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                                            <p className="text-gray-500">
                                                No solutions added yet. Click Add Solution
                                                to get started.
                                            </p>
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Section Preview */}
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h4 className="mb-2 text-sm font-medium text-gray-900">
                                Preview
                            </h4>
                            <p className="text-xs text-gray-600">
                                This section will display with the image on the
                                left and solution items on the right. Solution
                                items will have hover/click functionality for
                                better interaction.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            <div className="space-y-2">
                <label
                    htmlFor="results"
                    className="block font-medium text-gray-700"
                >
                    Results
                </label>
                <div className="rich-text-editor">
                    <ReactQuill
                        theme="snow"
                        // ref={quillRef}
                        value={editingCaseStudy.results}
                        onChange={(value) =>
                            handleFormChange('results', value)
                        }
                        // modules={quillModules}
                        // formats={quillFormats}
                        className="border-[1px] border-black text-black"
                    />
                </div>
            </div>
        </div>
    )
}

export default ContentTab