import { Plus, Trash2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { useState, useEffect } from 'react'

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[150px] border bg-gray-50 p-4">Loading editor...</div>
  ),
})

function ContentTab({
    editingPage,
    handleSectionChange,
    addService,
    removeService,
    updateService,
}) {

    const [localMainDescription, setLocalMainDescription] = useState(
        editingPage.mainContentSection.description || ""
    )

    const [localServiceDescriptions, setLocalServiceDescriptions] = useState(
        editingPage.mainContentSection.services.map(s => s.description || "")
    )

    useEffect(() => {
        setLocalMainDescription(editingPage.mainContentSection.description)

        setLocalServiceDescriptions(
            editingPage.mainContentSection.services.map(s => s.description || "")
        )
    }, [editingPage.mainContentSection])

    return (
        <div className="space-y-6">
            {/* Toggle */}
            <div className="mb-4 flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={editingPage.mainContentSection.enabled}
                    onChange={(e) =>
                        handleSectionChange(
                            'mainContentSection',
                            'enabled',
                            e.target.checked
                        )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label className="font-medium text-gray-700">
                    Enable Main Content Section
                </label>
            </div>

            {editingPage.mainContentSection.enabled && (
                <div className="space-y-6 rounded-lg border bg-gray-50 p-4">

                    {/* TITLE / SUBTITLE */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="block font-medium text-gray-700">
                                Section Title
                            </label>
                            <input
                                type="text"
                                value={editingPage.mainContentSection.title}
                                onChange={(e) =>
                                    handleSectionChange(
                                        'mainContentSection',
                                        'title',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-md border p-3 text-black focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block font-medium text-gray-700">
                                Section Subtitle
                            </label>
                            <input
                                type="text"
                                value={editingPage.mainContentSection.subtitle}
                                onChange={(e) =>
                                    handleSectionChange(
                                        'mainContentSection',
                                        'subtitle',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-md border p-3 text-black focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* SECTION DESCRIPTION (local state + onBlur) */}
                    <div className="space-y-2">
                        <label className="block font-medium text-gray-700">
                            Section Description
                        </label>
                        <div className="h-48 overflow-y-auto">
                            <ReactQuill
                                theme="snow"
                                value={localMainDescription}
                                onChange={setLocalMainDescription}
                                onBlur={() =>
                                    handleSectionChange(
                                        'mainContentSection',
                                        'description',
                                        localMainDescription
                                    )
                                }
                                className="h-full bg-white text-black"
                            />
                        </div>
                    </div>

                    {/* SERVICES */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block font-medium text-gray-700">
                                Services
                            </label>
                            <button
                                type="button"
                                onClick={() => addService('mainContentSection')}
                                className="flex items-center rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                            >
                                <Plus className="mr-1 h-4 w-4" /> Add Service
                            </button>
                        </div>

                        {editingPage.mainContentSection.services.map(
                            (service, index) => (
                                <div
                                    key={service.id}
                                    className="rounded-lg border bg-white p-4"
                                >
                                    <div className="mb-4 flex items-start justify-between">
                                        <h4 className="font-medium text-gray-800">
                                            Service #{index + 1}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => removeService('mainContentSection', index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* SERVICE TITLE + ICON */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Service Title
                                            </label>
                                            <input
                                                type="text"
                                                value={service.title}
                                                onChange={(e) =>
                                                    updateService(
                                                        'mainContentSection',
                                                        index,
                                                        'title',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-md border p-2 text-black focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Icon (SVG or identifier)
                                            </label>
                                            <input
                                                type="text"
                                                value={service.icon}
                                                onChange={(e) =>
                                                    updateService(
                                                        'mainContentSection',
                                                        index,
                                                        'icon',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-md border p-2 text-black focus:ring-2 focus:ring-blue-500"
                                                placeholder="SVG code or icon name"
                                            />
                                        </div>
                                    </div>

                                    {/* SERVICE DESCRIPTION (fixed) */}
                                    <div className="mt-4 space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Service Description
                                        </label>
                                        <div className="h-48 overflow-y-auto">
                                            <ReactQuill
                                                theme="snow"
                                                value={localServiceDescriptions[index] || ""}
                                                onChange={(value) =>
                                                    setLocalServiceDescriptions((prev) => {
                                                        const updated = [...prev]
                                                        updated[index] = value
                                                        return updated
                                                    })
                                                }
                                                onBlur={() =>
                                                    updateService(
                                                        'mainContentSection',
                                                        index,
                                                        'description',
                                                        localServiceDescriptions[index]
                                                    )
                                                }
                                                className="h-full bg-white text-black"
                                            />
                                        </div>
                                    </div>

                                    {/* FEATURES */}
                                    <div className="mt-4 space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Features (one per line)
                                        </label>
                                        <textarea
                                            value={service.features?.join('\n') || ''}
                                            onChange={(e) => {
                                                const features = e.target.value
                                                    .split('\n')
                                                    .filter((f) => f.trim())
                                                updateService(
                                                    'mainContentSection',
                                                    index,
                                                    'features',
                                                    features
                                                )
                                            }}
                                            className="w-full rounded-md border p-2 text-black focus:ring-2 focus:ring-blue-500"
                                            rows={4}
                                            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                        />
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

export default ContentTab
