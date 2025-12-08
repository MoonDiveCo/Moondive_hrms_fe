import { TrashIcon } from 'lucide-react'
import React from 'react'

function HeroTab({
    editingPage,
    handleSectionChange,
    heroImageInputRef,
    handleImageUpload,
}) {
    return (
        <div className="space-y-6">
            <div className="mb-4 flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={editingPage.heroSection.enabled}
                    onChange={(e) =>
                        handleSectionChange(
                            'heroSection',
                            'enabled',
                            e.target.checked
                        )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label className="font-medium text-gray-700">
                    Enable Hero Section
                </label>
            </div>

            {editingPage.heroSection.enabled && (
                <div className="space-y-6 rounded-lg border bg-gray-50 p-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="block font-medium text-gray-700">
                                Hero Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={editingPage.heroSection.title}
                                onChange={(e) =>
                                    handleSectionChange(
                                        'heroSection',
                                        'title',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                required
                            />
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className="space-y-2">
                                <label className="block font-medium text-gray-700">
                                    CTA Button 1 Text
                                </label>
                                <input
                                    type="text"
                                    value={editingPage.heroSection.ctaText1}
                                    onChange={(e) =>
                                        handleSectionChange(
                                            'heroSection',
                                            'ctaText1',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block font-medium text-gray-700">
                                    CTA Button 2 Text
                                </label>
                                <input
                                    type="text"
                                    value={editingPage.heroSection.ctaText2}
                                    onChange={(e) =>
                                        handleSectionChange(
                                            'heroSection',
                                            'ctaText2',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium text-gray-700">
                            Hero Subtitle{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={editingPage.heroSection.subtitle}
                            onChange={(e) =>
                                handleSectionChange(
                                    'heroSection',
                                    'subtitle',
                                    e.target.value
                                )
                            }
                            className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium text-gray-700">
                            Background Image{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={heroImageInputRef}
                            onChange={(e) =>
                                handleImageUpload(
                                    e,
                                    'heroSection',
                                    'backgroundImage'
                                )
                            }
                            className="w-full rounded-md border p-2 text-black"
                        />
                        {editingPage.heroSection.backgroundImage && (
                            <div className="relative mt-2 inline-block">
                                <img
                                    src={editingPage.heroSection.backgroundImage}
                                    alt="Hero Background Preview"
                                    className="h-20 w-32 rounded object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleImageDelete(
                                            editingPage.heroSection.backgroundImage,
                                            'heroSection',
                                            'backgroundImage'
                                        )
                                    }
                                    className="absolute right-0 top-0 rounded-full bg-white p-1 shadow hover:bg-red-100"
                                >
                                    <TrashIcon className="h-4 w-4 text-red-500" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={editingPage.heroSection.formEnabled}
                            onChange={(e) =>
                                handleSectionChange(
                                    'heroSection',
                                    'formEnabled',
                                    e.target.checked
                                )
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="font-medium text-gray-700">
                            Show Contact Form in Hero
                        </label>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HeroTab