import { Plus, Trash2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { useState } from 'react'

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[150px] border bg-gray-50 p-4">Loading editor...</div>
  ),
})

function PlatformsTab({
    editingPage,
    handleSectionChange,
    addPlatform,
    removePlatform,
    updatePlatform,
}) {

    const BORDER_COLOR_OPTIONS = [
        'border-blue-500',
        'border-cyan-500',
        'border-gray-500',
        'border-green-500',
        'border-purple-500',
        'border-red-500',
        'border-yellow-500',
        'border-indigo-500',
    ]

    const [localSectionDescription, setLocalSectionDescription] = useState(
        editingPage.platformsSection.description || ""
    )

    const [localPlatformDescriptions, setLocalPlatformDescriptions] = useState(
        editingPage.platformsSection.platforms.map(p => p.description || "")
    )

    return (
        <div className="space-y-6">
            <div className="mb-4 flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={editingPage.platformsSection.enabled}
                    onChange={(e) =>
                        handleSectionChange(
                            'platformsSection',
                            'enabled',
                            e.target.checked
                        )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label className="font-medium text-gray-700">
                    Enable Platforms Section
                </label>
            </div>

            {editingPage.platformsSection.enabled && (
                <div className="space-y-6 rounded-lg border bg-gray-50 p-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="block font-medium text-gray-700">
                                Section Title
                            </label>
                            <input
                                type="text"
                                value={editingPage.platformsSection.title}
                                onChange={(e) =>
                                    handleSectionChange(
                                        'platformsSection',
                                        'title',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block font-medium text-gray-700">
                                Cards Per Page
                            </label>
                            <input
                                type="number"
                                min="3"
                                max="12"
                                value={editingPage.platformsSection.cardsPerPage}
                                onChange={(e) =>
                                    handleSectionChange(
                                        'platformsSection',
                                        'cardsPerPage',
                                        parseInt(e.target.value)
                                    )
                                }
                                className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>
                    </div>

                    {/* Section Description FIXED */}
                    <div className="space-y-2">
                        <label className="block font-medium text-gray-700">
                            Section Description
                        </label>
                        <div className="h-48 overflow-y-auto">
                            <ReactQuill
                                theme="snow"
                                value={localSectionDescription}
                                onChange={(value) => setLocalSectionDescription(value)}
                                onBlur={() =>
                                    handleSectionChange(
                                        'platformsSection',
                                        'description',
                                        localSectionDescription
                                    )
                                }
                                className="h-full bg-white text-black"
                            />
                        </div>
                    </div>

                    {/* Platforms */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block font-medium text-gray-700">
                                Platforms
                            </label>
                            <button
                                type="button"
                                onClick={addPlatform}
                                className="flex items-center rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                            >
                                <Plus className="mr-1 h-4 w-4" /> Add Platform
                            </button>
                        </div>

                        {editingPage.platformsSection.platforms.map(
                            (platform, index) => (
                                <div
                                    key={platform.id}
                                    className="rounded-lg border bg-white p-4"
                                >
                                    <div className="mb-4 flex items-start justify-between">
                                        <h4 className="font-medium text-gray-800">
                                            Platform #{index + 1}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => removePlatform(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Platform Title
                                            </label>
                                            <input
                                                type="text"
                                                value={platform.title}
                                                onChange={(e) =>
                                                    updatePlatform(
                                                        index,
                                                        'title',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Border Color
                                            </label>
                                            <select
                                                value={platform.borderColor}
                                                onChange={(e) =>
                                                    updatePlatform(
                                                        index,
                                                        'borderColor',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                            >
                                                {BORDER_COLOR_OPTIONS.map((color) => (
                                                    <option key={color} value={color}>
                                                        {color}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Platform Description FIXED */}
                                    <div className="mt-4 space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Platform Description
                                        </label>
                                        <div className="h-48 overflow-y-auto">
                                            <ReactQuill
                                                theme="snow"
                                                value={localPlatformDescriptions[index] || ""}
                                                onChange={(value) =>
                                                    setLocalPlatformDescriptions((prev) => {
                                                        const updated = [...prev];
                                                        updated[index] = value;
                                                        return updated;
                                                    })
                                                }
                                                onBlur={() =>
                                                    updatePlatform(
                                                        index,
                                                        'description',
                                                        localPlatformDescriptions[index]
                                                    )
                                                }
                                                className="h-full bg-white text-black"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default PlatformsTab
