"use client"
import React from 'react'
import { Plus, Trash2, Upload, X } from 'lucide-react';

function ChallengesTab({
    editingCaseStudy,
    handleFormChange,
    handleChallengeImageUpload,
    challengeImageInputRef,
    isUploadingChallengeImage,
    addChallengeItem,
    updateChallengeItem
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    Challenges Section
                </h3>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={
                            editingCaseStudy.challengeSection?.enabled !== false
                        }
                        onChange={(e) => {
                            const updatedChallengeSection = {
                                ...editingCaseStudy.challengeSection,
                                enabled: e.target.checked,
                            }
                            handleFormChange(
                                'challengeSection',
                                updatedChallengeSection
                            )
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                        Enable Section
                    </span>
                </label>
            </div>
            {editingCaseStudy.challengeSection?.enabled !== false && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Section Title
                            </label>
                            <input
                                type="text"
                                value={
                                    editingCaseStudy.challengeSection?.title ||
                                    'The Challenge'
                                }
                                onChange={(e) => {
                                    const updatedChallengeSection = {
                                        ...editingCaseStudy.challengeSection,
                                        title: e.target.value,
                                    }
                                    handleFormChange(
                                        'challengeSection',
                                        updatedChallengeSection
                                    )
                                }}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black"
                                placeholder="e.g., The Challenge"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Section Subtitle
                            </label>
                            <input
                                type="text"
                                value={
                                    editingCaseStudy.challengeSection?.subtitle ||
                                    'Problems We Solved'
                                }
                                onChange={(e) => {
                                    const updatedChallengeSection = {
                                        ...editingCaseStudy.challengeSection,
                                        subtitle: e.target.value,
                                    }
                                    handleFormChange(
                                        'challengeSection',
                                        updatedChallengeSection
                                    )
                                }}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black"
                                placeholder="e.g., Problems We Solved"
                            />
                        </div>
                    </div>

                    {/* Challenge Image Upload */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Challenge Image (Left Side)
                        </label>

                        {editingCaseStudy.challengeSection?.imageUrl ? (
                            <div className="relative">
                                <img
                                    src={editingCaseStudy.challengeSection.imageUrl}
                                    alt="Challenge"
                                    className="h-48 w-full rounded-lg object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={handleChallengeImageDelete}
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
                                    onChange={handleChallengeImageUpload}
                                    className="hidden"
                                    id="challenge-image-upload"
                                    ref={challengeImageInputRef}
                                    disabled={isUploadingChallengeImage}
                                />
                                <label
                                    htmlFor="challenge-image-upload"
                                    className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 ${isUploadingChallengeImage
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
                                            challenge image
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, GIF up to 10MB
                                        </p>
                                    </div>
                                    {isUploadingChallengeImage && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                                        </div>
                                    )}
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Challenge Items */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">
                                Challenge Items (Right Side)
                            </label>
                            <button
                                type="button"
                                onClick={addChallengeItem}
                                className="flex items-center space-x-2 rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Challenge</span>
                            </button>
                        </div>

                        <div className="max-h-96 space-y-4 overflow-y-auto pr-2">
                            {editingCaseStudy.challengeSection?.items?.map(
                                (item, index) => (
                                    <div
                                        key={index}
                                        className="rounded-lg border border-gray-200 bg-red-50 p-4"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Challenge #{index + 1}
                                            </h4>
                                            {editingCaseStudy.challengeSection.items
                                                .length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeChallengeItem(index)
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
                                                    Challenge Title{' '}
                                                    <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) =>
                                                        updateChallengeItem(
                                                            index,
                                                            'title',
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black"
                                                    placeholder="Enter challenge title..."
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-700">
                                                    Challenge Description{' '}
                                                    <span className="text-xs text-gray-500">
                                                        (Optional)
                                                    </span>
                                                </label>
                                                <textarea
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        updateChallengeItem(
                                                            index,
                                                            'description',
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={4}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black"
                                                    placeholder="Describe the challenge in detail (optional)..."
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Leave empty to show only the title on
                                                    the case study page
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            {(!editingCaseStudy.challengeSection?.items ||
                                editingCaseStudy.challengeSection.items.length ===
                                0) && (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                                        <p className="text-gray-500">
                                            No challenges added yet. Click Add Challenge
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
                            This section will display with the image on the left
                            and challenge items on the right. Challenge items
                            with long descriptions will have expand/collapse
                            functionality.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChallengesTab