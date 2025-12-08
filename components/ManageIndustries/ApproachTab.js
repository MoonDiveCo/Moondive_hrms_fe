import { TEXT_ENABLE_SERVED_INDUSTRIES, TEXT_ENABLE_TARGET_INDUSTRIES } from '@/text'
import { Plus, Trash2, TrashIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { useState, useEffect } from 'react'

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[150px] border bg-gray-50 p-4">Loading editor...</div>
  ),
})

function ApproachTab({
    editingPage,
    handleSectionChange,
    targetIndustriesInputRef,
    handleImageUpload,
    handleImageDelete,
    addService,
    removeService,
    updateService,
    servedIndustriesInputRef,
}) {

    const [localTargetDescription, setLocalTargetDescription] = useState(
        editingPage.targetIndustries.description || ""
    )

    const [localTargetServiceDesc, setLocalTargetServiceDesc] = useState(
        editingPage.targetIndustries.services.map(s => s.description || "")
    )

    const [localServedDescription, setLocalServedDescription] = useState(
        editingPage.servedIndustries.description || ""
    )

    useEffect(() => {
        setLocalTargetDescription(editingPage.targetIndustries.description)

        setLocalTargetServiceDesc(
            editingPage.targetIndustries.services.map(s => s.description || "")
        )

        setLocalServedDescription(editingPage.servedIndustries.description)
    }, [
        editingPage.targetIndustries,
        editingPage.targetIndustries.services,
        editingPage.servedIndustries
    ])

    return (
        <div className="space-y-6">
            <div className="mb-4 flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={editingPage.targetIndustries.enabled}
                    onChange={(e) =>
                        handleSectionChange(
                            'targetIndustries',
                            'enabled',
                            e.target.checked
                        )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <label className="font-medium text-gray-700">
                    {TEXT_ENABLE_TARGET_INDUSTRIES}
                </label>
            </div>

            {editingPage.targetIndustries.enabled && (
                <div className="space-y-6 rounded-lg border bg-gray-50 p-4">

                    {/* TITLE / SUBTITLE */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="block font-medium text-gray-700">
                                Section Title
                            </label>
                            <input
                                type="text"
                                value={editingPage.targetIndustries.title}
                                onChange={(e) =>
                                    handleSectionChange(
                                        'targetIndustries',
                                        'title',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-md border p-3 text-black"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block font-medium text-gray-700">
                                Section Subtitle
                            </label>
                            <input
                                type="text"
                                value={editingPage.targetIndustries.subtitle}
                                onChange={(e) =>
                                    handleSectionChange(
                                        'targetIndustries',
                                        'subtitle',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-md border p-3 text-black"
                            />
                        </div>
                    </div>

                    {/* MAIN ICON */}
                    <div className="space-y-2">
                        <label className="block font-medium text-gray-700">
                            Main Icon <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={targetIndustriesInputRef}
                            onChange={(e) =>
                                handleImageUpload(
                                    e,
                                    'targetIndustries',
                                    'mainIcon'
                                )
                            }
                            className="w-full rounded-md border p-2"
                        />
                        {editingPage.targetIndustries.mainIcon && (
                            <div className="relative mt-2 inline-block">
                                <img
                                    src={editingPage.targetIndustries.mainIcon}
                                    className="h-20 w-32 rounded object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleImageDelete(
                                            editingPage.targetIndustries.mainIcon,
                                            'targetIndustries',
                                            'mainIcon'
                                        )
                                    }
                                    className="absolute right-0 top-0 bg-white p-1 rounded-full shadow"
                                >
                                    <TrashIcon className="h-4 w-4 text-red-500" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* DESCRIPTION – FIXED */}
                    <div className="space-y-2">
                        <label className="block font-medium text-gray-700">
                            Section Description
                        </label>
                        <div className="h-48 overflow-y-auto">
                            <ReactQuill
                                theme="snow"
                                value={localTargetDescription}
                                onChange={setLocalTargetDescription}
                                onBlur={() =>
                                    handleSectionChange(
                                        'targetIndustries',
                                        'description',
                                        localTargetDescription
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
                                onClick={() => addService('targetIndustries')}
                                className="flex items-center bg-blue-600 px-3 py-2 text-white rounded"
                            >
                                <Plus className="mr-1 h-4 w-4" /> Add Service
                            </button>
                        </div>

                        {editingPage.targetIndustries.services.map(
                            (service, index) => (
                                <div key={service.id} className="rounded-lg border bg-white p-4">
                                    <div className="mb-4 flex justify-between">
                                        <h4 className="font-medium">
                                            Service #{index + 1}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => removeService('targetIndustries', index)}
                                            className="text-red-600"
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
                                                        'targetIndustries',
                                                        index,
                                                        'title',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-md border p-2 text-black"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Icon
                                            </label>
                                            <input
                                                type="text"
                                                value={service.icon}
                                                onChange={(e) =>
                                                    updateService(
                                                        'targetIndustries',
                                                        index,
                                                        'icon',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-md border p-2 text-black"
                                            />
                                        </div>
                                    </div>

                                    {/* SERVICE DESCRIPTION — FIXED */}
                                    <div className="mt-4 space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Service Description
                                        </label>
                                        <div className="h-48 overflow-y-auto">
                                            <ReactQuill
                                                theme="snow"
                                                value={localTargetServiceDesc[index] || ""}
                                                onChange={(value) =>
                                                    setLocalTargetServiceDesc((prev) => {
                                                        const arr = [...prev]
                                                        arr[index] = value
                                                        return arr
                                                    })
                                                }
                                                onBlur={() =>
                                                    updateService(
                                                        'targetIndustries',
                                                        index,
                                                        'description',
                                                        localTargetServiceDesc[index]
                                                    )
                                                }
                                                className="h-full bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* FEATURES */}
                                    <div className="mt-4 space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Features (one per line)
                                        </label>
                                        <textarea
                                            value={service.features?.join("\n") || ""}
                                            onChange={(e) =>
                                                updateService(
                                                    'targetIndustries',
                                                    index,
                                                    'features',
                                                    e.target.value.split("\n").filter(f => f.trim())
                                                )
                                            }
                                            className="w-full rounded-md border p-2"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            <div className="mb-4 flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={editingPage.servedIndustries.enabled}
                    onChange={(e) =>
                        handleSectionChange(
                            'servedIndustries',
                            'enabled',
                            e.target.checked
                        )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <label className="font-medium text-gray-700">
                    {TEXT_ENABLE_SERVED_INDUSTRIES}
                </label>
            </div>

            {editingPage.servedIndustries.enabled && (
                <div className="space-y-6 rounded-lg border bg-gray-50 p-4">

                    {/* TITLE / SUBTITLE */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="block font-medium text-gray-700">
                                Section Title
                            </label>
                            <input
                                type="text"
                                value={editingPage.servedIndustries.title}
                                onChange={(e) =>
                                    handleSectionChange(
                                        'servedIndustries',
                                        'title',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-md border p-3"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block font-medium text-gray-700">
                                Section Subtitle
                            </label>
                            <input
                                type="text"
                                value={editingPage.servedIndustries.subtitle}
                                onChange={(e) =>
                                    handleSectionChange(
                                        'servedIndustries',
                                        'subtitle',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-md border p-3"
                            />
                        </div>
                    </div>

                    {/* BACKGROUND IMAGE */}
                    <div className="space-y-2">
                        <label className="block font-medium text-gray-700">
                            Background Image <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={servedIndustriesInputRef}
                            onChange={(e) =>
                                handleImageUpload(
                                    e,
                                    'servedIndustries',
                                    'backgroundImage'
                                )
                            }
                            className="w-full rounded-md border p-2"
                        />
                        {editingPage.servedIndustries.backgroundImage && (
                            <div className="relative mt-2 inline-block">
                                <img
                                    src={editingPage.servedIndustries.backgroundImage}
                                    className="h-20 w-32 rounded object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleImageDelete(
                                            editingPage.servedIndustries.backgroundImage,
                                            'servedIndustries',
                                            'backgroundImage'
                                        )
                                    }
                                    className="absolute right-0 top-0 bg-white p-1 rounded-full shadow"
                                >
                                    <TrashIcon className="h-4 w-4 text-red-500" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* DESCRIPTION — FIXED */}
                    <div className="space-y-2">
                        <label className="block font-medium text-gray-700">
                            Section Description
                        </label>
                        <div className="h-48 overflow-y-auto">
                            <ReactQuill
                                theme="snow"
                                value={localServedDescription}
                                onChange={setLocalServedDescription}
                                onBlur={() =>
                                    handleSectionChange(
                                        'servedIndustries',
                                        'description',
                                        localServedDescription
                                    )
                                }
                                className="h-full bg-white text-black"
                            />
                        </div>
                    </div>

                    {/* CHALLENGE + SOLUTION */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="block font-medium text-gray-700">
                                Our Challenge
                            </label>
                            <input
                                type="text"
                                value={editingPage.servedIndustries.challenge}
                                onChange={(e) =>
                                    handleSectionChange(
                                        'servedIndustries',
                                        'challenge',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-md border p-3"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block font-medium text-gray-700">
                                Our Solution
                            </label>
                            <input
                                type="text"
                                value={editingPage.servedIndustries.solution}
                                onChange={(e) =>
                                    handleSectionChange(
                                        'servedIndustries',
                                        'solution',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-md border p-3"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ApproachTab
