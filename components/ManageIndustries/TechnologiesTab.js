import { Plus, Trash2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[150px] border bg-gray-50 p-4">Loading editor...</div>
  ),
})

function TechnologiesTab({
    editingPage,
    handleSectionChange,
    addTechnology,
    removeTechnology,
    updateTechnology,
}) {

    const [localTechDescription, setLocalTechDescription] = useState("");
const [localMainDescription, setLocalMainDescription] = useState("");

useEffect(() => {
  setLocalMainDescription(editingPage.technologiesSection.description);
}, []);

useEffect(() => {
  editingPage.technologiesSection.techList.forEach((tech, index) => {
    setLocalTechDescription((prev) => ({
      ...prev,
      [index]: tech.description
    }));
  });
}, []);

    return (
        <div className="space-y-6">
            <div className="mb-4 flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={editingPage.technologiesSection.enabled}
                    onChange={(e) =>
                        handleSectionChange(
                            'technologiesSection',
                            'enabled',
                            e.target.checked
                        )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label className="font-medium text-gray-700">
                    Enable Technologies Section
                </label>
            </div>

            {editingPage.technologiesSection.enabled && (
                <div className="space-y-6 rounded-lg border bg-gray-50 p-4">
                    <div className="space-y-2">
                        <label className="block font-medium text-gray-700">
                            Section Title
                        </label>
                        <input
                            type="text"
                            value={editingPage.technologiesSection.title}
                            onChange={(e) =>
                                handleSectionChange(
                                    'technologiesSection',
                                    'title',
                                    e.target.value
                                )
                            }
                            className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium text-gray-700">
                            Section Description
                        </label>
                        <div className="h-48 overflow-y-auto">
                            <ReactQuill
                                theme="snow"
                                value={
                                   localMainDescription
                                }
                                onChange={(value) =>
                                    setLocalMainDescription(value)
                                }
                                onBlur={() =>
                                    handleSectionChange(
                                            'technologiesSection',
                                            'description',
                                            localMainDescription
                                            )
                                        }
                                //   modules={quillModules}
                                //   formats={quillFormats}
                                className="h-full bg-white text-black"
                            />
                        </div>
                    </div>

                    {/* Technologies */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block font-medium text-gray-700">
                                Technologies
                            </label>
                            <button
                                type="button"
                                onClick={addTechnology}
                                className="flex items-center rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                            >
                                <Plus className="mr-1 h-4 w-4" /> Add Technology
                            </button>
                        </div>

                        {editingPage.technologiesSection.techList.map(
                            (tech, index) => (
                                <div
                                    key={tech.id}
                                    className="rounded-lg border bg-white p-4"
                                >
                                    <div className="mb-4 flex items-start justify-between">
                                        <h4 className="font-medium text-gray-800">
                                            Technology #{index + 1}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => removeTechnology(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Technology Name
                                            </label>
                                            <input
                                                type="text"
                                                value={tech.name}
                                                onChange={(e) =>
                                                    updateTechnology(
                                                        index,
                                                        'name',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Technology Description
                                            </label>
                                            <div className="h-48 overflow-y-auto">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={localTechDescription}
                                                    onChange={(value) =>
                                                        setLocalTechDescription((prev) => ({
                                                        ...prev,
                                                        [index]: value
                                                        }))
                                                    }
                                                    onBlur={() =>
                                                        updateTechnology(index, 'description', localTechDescription[index])
                                                    }
                                                    // modules={quillModules}
                                                    // formats={quillFormats}
                                                    className="h-full bg-white text-black"
                                                />
                                            </div>
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

export default TechnologiesTab