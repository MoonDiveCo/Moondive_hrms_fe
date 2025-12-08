"use clients"
import { ExternalLink, Trash2 } from 'lucide-react'
import React from 'react'

function CtaTab({
    editingCaseStudy,
    setEditingCaseStudy,
}) {
    return (
        <div className="space-y-6">
            <div className="rounded-lg border bg-gray-50 p-6">
                <h3 className="mb-6 text-lg font-medium text-gray-800">
                    Hero Section Button Configuration
                </h3>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="ctaText"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Hero Section Button Text
                            </label>
                            <input
                                id="ctaText"
                                type="text"
                                value={
                                    editingCaseStudy?.cta?.text ||
                                    'Expand Your Business'
                                }
                                onChange={(e) => {
                                    setEditingCaseStudy((prev) => ({
                                        ...prev,
                                        cta: {
                                            ...prev.cta,
                                            text: e.target.value,
                                        },
                                    }))
                                }}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                                placeholder="Enter button text"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="ctaLink"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Hero Section Button Link
                            </label>
                            <input
                                id="ctaLink"
                                type="text"
                                value={editingCaseStudy?.cta?.link || ''}
                                onChange={(e) => {
                                    setEditingCaseStudy((prev) => ({
                                        ...prev,
                                        cta: {
                                            ...prev.cta,
                                            link: e.target.value,
                                        },
                                    }))
                                }}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            id="ctaEnabled"
                            type="checkbox"
                            checked={editingCaseStudy?.cta?.enabled !== false}
                            onChange={(e) => {
                                setEditingCaseStudy((prev) => ({
                                    ...prev,
                                    cta: {
                                        ...prev.cta,
                                        enabled: e.target.checked,
                                    },
                                }))
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <label
                            htmlFor="ctaEnabled"
                            className="text-sm font-medium text-gray-700"
                        >
                            Show Hero Section Button on Case Study Page
                        </label>
                    </div>

                    {/* Preview section */}
                    <div className="mt-6 border-t pt-6">
                        <p className="mb-4 text-sm font-medium text-gray-700">
                            Button Preview:
                        </p>
                        <div className="flex justify-center">
                            <button
                                type="button"
                                disabled={!editingCaseStudy?.cta?.enabled}
                                className={`inline-flex items-center gap-2 rounded-md px-8 py-4 text-base font-medium transition-all duration-300 ${editingCaseStudy?.cta?.enabled
                                    ? 'bg-[#0B78EB] text-white hover:bg-[#4274A5] hover:shadow-lg'
                                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                                    }`}
                            >
                                <span>
                                    {editingCaseStudy?.cta?.text ||
                                        'Expand Your Business'}
                                </span>
                                <ExternalLink className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-gray-50 p-6">
                <h3 className="mb-6 text-lg font-medium text-gray-800">
                    Statistics Section
                </h3>

                <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <input
                            id="statsEnabled"
                            type="checkbox"
                            checked={
                                editingCaseStudy?.statistics?.enabled !== false
                            }
                            onChange={(e) => {
                                setEditingCaseStudy((prev) => ({
                                    ...prev,
                                    statistics: {
                                        ...prev.statistics,
                                        enabled: e.target.checked,
                                    },
                                }))
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <label
                            htmlFor="statsEnabled"
                            className="text-sm font-medium text-gray-700"
                        >
                            Show Statistics Section on Case Study Page
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="statsTitle"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Section Title
                        </label>
                        <input
                            id="statsTitle"
                            type="text"
                            value={
                                editingCaseStudy?.statistics?.title ||
                                'Average results generated for our clients'
                            }
                            onChange={(e) => {
                                setEditingCaseStudy((prev) => ({
                                    ...prev,
                                    statistics: {
                                        ...prev.statistics,
                                        title: e.target.value,
                                    },
                                }))
                            }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                            placeholder="Enter section title"
                        />
                    </div>

                    {/* Statistics Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">
                                Statistics (Max 3)
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    if (
                                        editingCaseStudy.statistics.stats.length < 3
                                    ) {
                                        const newStats = [
                                            ...editingCaseStudy.statistics.stats,
                                            { value: '', label: '' },
                                        ]
                                        setEditingCaseStudy((prev) => ({
                                            ...prev,
                                            statistics: {
                                                ...prev.statistics,
                                                stats: newStats,
                                            },
                                        }))
                                    }
                                }}
                                disabled={
                                    editingCaseStudy?.statistics?.stats?.length >= 3
                                }
                                className={`rounded-md px-4 py-2 text-sm font-medium ${editingCaseStudy?.statistics?.stats?.length >= 3
                                    ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                Add Statistic
                            </button>
                        </div>

                        {editingCaseStudy?.statistics?.stats?.map(
                            (stat, index) => (
                                <div
                                    key={index}
                                    className="rounded-md border bg-white p-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor={`statValue${index}`}
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Statistic Value (e.g., &quot;5X Revenue
                                                    Growth&quot;)
                                                </label>
                                                <input
                                                    id={`statValue${index}`}
                                                    type="text"
                                                    value={stat.value}
                                                    onChange={(e) => {
                                                        const newStats = [
                                                            ...editingCaseStudy.statistics
                                                                .stats,
                                                        ]
                                                        newStats[index].value = e.target.value
                                                        setEditingCaseStudy((prev) => ({
                                                            ...prev,
                                                            statistics: {
                                                                ...prev.statistics,
                                                                stats: newStats,
                                                            },
                                                        }))
                                                    }}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor={`statLabel${index}`}
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Statistic Description
                                                </label>
                                                <textarea
                                                    id={`statLabel${index}`}
                                                    value={stat.label}
                                                    onChange={(e) => {
                                                        const newStats = [
                                                            ...editingCaseStudy.statistics
                                                                .stats,
                                                        ]
                                                        newStats[index].label = e.target.value
                                                        setEditingCaseStudy((prev) => ({
                                                            ...prev,
                                                            statistics: {
                                                                ...prev.statistics,
                                                                stats: newStats,
                                                            },
                                                        }))
                                                    }}
                                                    className="min-h-[60px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                                                    placeholder="Enter description"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newStats =
                                                    editingCaseStudy.statistics.stats.filter(
                                                        (_, i) => i !== index
                                                    )
                                                setEditingCaseStudy((prev) => ({
                                                    ...prev,
                                                    statistics: {
                                                        ...prev.statistics,
                                                        stats: newStats,
                                                    },
                                                }))
                                            }}
                                            className="ml-4 rounded-full p-2 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                    {/* Statistics Preview */}
                    {editingCaseStudy?.statistics?.enabled && (
                        <div className="mt-6 border-t pt-6">
                            <p className="mb-4 text-sm font-medium text-gray-700">
                                Statistics Preview:
                            </p>
                            <div className="rounded-lg bg-gray-900 p-6">
                                <h4 className="mb-4 text-center text-xl font-bold text-white">
                                    {editingCaseStudy?.statistics?.title ||
                                        'Average results generated for our clients'}
                                </h4>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {editingCaseStudy?.statistics?.stats?.map(
                                        (stat, index) => (
                                            <div
                                                key={index}
                                                className="rounded-lg border border-gray-700/50 bg-gray-800/50 p-4 text-center"
                                            >
                                                <h5 className="mb-2 text-lg font-bold text-orange-500">
                                                    {stat.value || 'Enter Value'}
                                                </h5>
                                                <p className="text-sm text-gray-300">
                                                    {stat.label || 'Enter description'}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="rounded-lg border bg-gray-50 p-6">
                <h3 className="mb-6 text-lg font-medium text-gray-800">
                    Kickstart Section Configuration
                </h3>

                <div className="space-y-6">
                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center space-x-2">
                        <input
                            id="kickstartEnabled"
                            type="checkbox"
                            checked={
                                editingCaseStudy?.kickstart?.enabled !== false
                            }
                            onChange={(e) => {
                                setEditingCaseStudy((prev) => ({
                                    ...prev,
                                    kickstart: {
                                        ...prev.kickstart,
                                        enabled: e.target.checked,
                                    },
                                }))
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <label
                            htmlFor="kickstartEnabled"
                            className="text-sm font-medium text-gray-700"
                        >
                            Show Kickstart Section on Case Study Page
                        </label>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label
                            htmlFor="kickstartTitle"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Section Title
                        </label>
                        <input
                            id="kickstartTitle"
                            type="text"
                            value={
                                editingCaseStudy?.kickstart?.title ||
                                'Kickstart Your Dream Project With Us'
                            }
                            onChange={(e) => {
                                setEditingCaseStudy((prev) => ({
                                    ...prev,
                                    kickstart: {
                                        ...prev.kickstart,
                                        title: e.target.value,
                                    },
                                }))
                            }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                            placeholder="Enter section title"
                        />
                    </div>

                    {/* Subtitle */}
                    <div className="space-y-2">
                        <label
                            htmlFor="kickstartSubtitle"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Section Subtitle
                        </label>
                        <textarea
                            id="kickstartSubtitle"
                            value={
                                editingCaseStudy?.kickstart?.subtitle ||
                                'We have worked with some of the best innovative ideas and brands in the world across industries.'
                            }
                            onChange={(e) => {
                                setEditingCaseStudy((prev) => ({
                                    ...prev,
                                    kickstart: {
                                        ...prev.kickstart,
                                        subtitle: e.target.value,
                                    },
                                }))
                            }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                            rows={3}
                            placeholder="Enter section subtitle"
                        />
                    </div>

                    {/* Button Configuration */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="kickstartButtonText"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Button Text
                            </label>
                            <input
                                id="kickstartButtonText"
                                type="text"
                                value={
                                    editingCaseStudy?.kickstart?.buttonText ||
                                    'Initiate a Partnership'
                                }
                                onChange={(e) => {
                                    setEditingCaseStudy((prev) => ({
                                        ...prev,
                                        kickstart: {
                                            ...prev.kickstart,
                                            buttonText: e.target.value,
                                        },
                                    }))
                                }}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                                placeholder="Enter button text"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="kickstartButtonLink"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Button Link
                            </label>
                            <input
                                id="kickstartButtonLink"
                                type="text"
                                value={
                                    editingCaseStudy?.kickstart?.buttonLink ||
                                    '/contact'
                                }
                                onChange={(e) => {
                                    setEditingCaseStudy((prev) => ({
                                        ...prev,
                                        kickstart: {
                                            ...prev.kickstart,
                                            buttonLink: e.target.value,
                                        },
                                    }))
                                }}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                                placeholder="https://example.com or /page"
                            />
                        </div>
                    </div>

                    {/* Preview Section */}
                    {editingCaseStudy?.kickstart?.enabled !== false && (
                        <div className="mt-6 border-t pt-6">
                            <p className="mb-4 text-sm font-medium text-gray-700">
                                Section Preview:
                            </p>
                            <div className="relative overflow-hidden rounded-lg bg-gray-900 p-8">
                                <div className="relative z-10 text-center">
                                    <h2 className="mb-4 text-2xl font-bold text-white">
                                        {editingCaseStudy?.kickstart?.title ||
                                            'Kickstart Your Dream Project With Us'}
                                    </h2>
                                    <p className="mb-6 text-gray-300">
                                        {editingCaseStudy?.kickstart?.subtitle ||
                                            'We have worked with some of the best innovative ideas and brands in the world across industries.'}
                                    </p>
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center rounded-md bg-[#284f77] px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#4274A5]"
                                    >
                                        {editingCaseStudy?.kickstart?.buttonText ||
                                            'Initiate a Partnership'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CtaTab