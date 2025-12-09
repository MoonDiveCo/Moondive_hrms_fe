import { INDUSTRY_OPTIONS } from '@/text'
import React from 'react'

function BasicTab({
    editingPage,
    handleFormChange,
}) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="block font-medium text-gray-700">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={editingPage.title}
                        onChange={(e) =>
                            handleFormChange('title', e.target.value)
                        }
                        className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block font-medium text-gray-700">
                        Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={editingPage.slug}
                        onChange={(e) =>
                            handleFormChange('slug', e.target.value)
                        }
                        className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block font-medium text-gray-700">
                        SEO Title <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500">
                            {' '}
                            (Max 60 characters)
                        </span>
                    </label>
                    <input
                        type="text"
                        value={editingPage.seoTitle}
                        onChange={(e) => {
                            const value = e.target.value
                            if (value.length <= 60) {
                                handleFormChange('seoTitle', value)
                            }
                        }}
                        className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        maxLength={60}
                        required
                    />
                    <div className="text-right text-xs text-gray-500">
                        {editingPage.seoTitle?.length || 0}/60 characters
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block font-medium text-gray-700">
                        Industry <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={editingPage.industry}
                        onChange={(e) =>
                            handleFormChange('industry', e.target.value)
                        }
                        className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    >
                        {INDUSTRY_OPTIONS.map((industry) => (
                            <option key={industry} value={industry}>
                                {industry}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block font-medium text-gray-700">
                        Status <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={editingPage.status}
                        onChange={(e) =>
                            handleFormChange('status', e.target.value)
                        }
                        className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                        <option value="draft">Draft</option>
                        <option value="live">Live</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Card Color - Primary <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={editingPage.primaryColor}
                                onChange={(e) =>
                                    handleFormChange("primaryColor", e.target.value)
                                }
                                className="h-10 w-14 cursor-pointer rounded border p-1"
                            />
                            <input
                                type="text"
                                value={editingPage.primaryColor || ""}
                                onChange={(e) =>
                                    handleFormChange("primaryColor", e.target.value)
                                }
                                className="flex-1 rounded-md border p-3 bg-gray-50 text-gray-700"
                                placeholder="#000000"

                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Card Color - Secondary <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={editingPage.secondaryColor}
                                onChange={(e) =>
                                    handleFormChange("secondaryColor", e.target.value)
                                }
                                className="h-10 w-14 cursor-pointer rounded border p-1"
                            />

                            <input
                                type="text"
                                value={editingPage.secondaryColor || ""}
                                onChange={(e) =>
                                    handleFormChange("secondaryColor", e.target.value)
                                }
                                className="flex-1 rounded-md border p-3 bg-gray-50 text-gray-700"
                                placeholder="#000000"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                    Meta Description <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500">
                        {' '}
                        (SEO - Max 160 characters)
                    </span>
                </label>
                <textarea
                    value={editingPage.metaDescription}
                    onChange={(e) => {
                        const value = e.target.value
                        if (value.length <= 160) {
                            handleFormChange('metaDescription', value)
                        }
                    }}
                    className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    rows={3}
                    placeholder="Enter a compelling description for search engines (max 160 characters)"
                    required
                    maxLength={160}
                />
                <div className="text-right text-xs text-gray-500">
                    {editingPage.metaDescription?.length || 0}/160
                    characters
                </div>
            </div>

            <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                    Meta Keywords{' '}
                    <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                    type="text"
                    value={editingPage.metaKeywords?.join(', ') || ''}
                    onChange={(e) => {
                        const keywords = e.target.value
                            .split(',')
                            .map((k) => k.trim())
                            .filter((k) => k)
                        handleFormChange('metaKeywords', keywords)
                    }}
                    className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter keywords separated by commas"
                />
            </div>
        </div>
    )
}

export default BasicTab