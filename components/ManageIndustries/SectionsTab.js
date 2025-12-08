import React from 'react'

function SectionsTab({
    editingPage,
    handleSectionChange,
}) {
    return (
        <div className="space-y-8">
            {/* Kickstart Section */}
            <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={editingPage.kickstartSection.enabled}
                        onChange={(e) =>
                            handleSectionChange(
                                'kickstartSection',
                                'enabled',
                                e.target.checked
                            )
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="font-medium text-gray-700">
                        Enable Kickstart Section
                    </label>
                </div>

                {editingPage.kickstartSection.enabled && (
                    <div className="space-y-4 rounded border bg-white p-4">
                        <div className="space-y-2">
                            <label className="block font-medium text-gray-700">
                                Section Title
                            </label>
                            <input
                                type="text"
                                value={editingPage.kickstartSection.title}
                                onChange={(e) =>
                                    handleSectionChange(
                                        'kickstartSection',
                                        'title',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block font-medium text-gray-700">
                                Section Subtitle
                            </label>
                            <textarea
                                value={editingPage.kickstartSection.subtitle}
                                onChange={(e) =>
                                    handleSectionChange(
                                        'kickstartSection',
                                        'subtitle',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="block font-medium text-gray-700">
                                    Button Text
                                </label>
                                <input
                                    type="text"
                                    value={editingPage.kickstartSection.buttonText}
                                    onChange={(e) =>
                                        handleSectionChange(
                                            'kickstartSection',
                                            'buttonText',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block font-medium text-gray-700">
                                    Button Link
                                </label>
                                <input
                                    type="text"
                                    value={editingPage.kickstartSection.buttonLink}
                                    onChange={(e) =>
                                        handleSectionChange(
                                            'kickstartSection',
                                            'buttonLink',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com or /page"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SectionsTab