'use client'
import dynamic from 'next/dynamic';
import React from 'react'
import "react-quill-new/dist/quill.snow.css";
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[150px] border bg-gray-50 p-4">Loading editor...</div>
  ),
})


function BasicTab({
    editingCaseStudy,
    handleFormChange,
    quillRef,
    quillModules,
    quillFormats,
}) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label
                        htmlFor="title"
                        className="block font-medium text-gray-700"
                    >
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={editingCaseStudy.title}
                        onChange={(e) =>
                            handleFormChange('title', e.target.value)
                        }
                        className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="slug"
                        className="block font-medium text-gray-700"
                    >
                        Slug
                    </label>
                    <input
                        id="slug"
                        type="text"
                        value={editingCaseStudy.slug}
                        onChange={(e) =>
                            handleFormChange('slug', e.target.value)
                        }
                        className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label
                        htmlFor="metaDescription"
                        className="block font-medium text-gray-700"
                    >
                        Meta Description
                        <span className="text-xs text-gray-500">
                            (SEO - Max 160 characters)
                        </span>
                    </label>
                    <textarea
                        id="metaDescription"
                        value={editingCaseStudy.metaDescription}
                        onChange={(e) => {
                            const value = e.target.value
                            if (value.length <= 160) {
                                handleFormChange('metaDescription', value)
                            }
                        }}
                        className="min-h-[80px] w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="Enter a compelling description for search engines (max 160 characters)"
                        required
                        maxLength={160}
                    />
                    <div className="text-right text-xs text-gray-500">
                        {editingCaseStudy.metaDescription?.length || 0}/160
                        characters
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <input
                                id="isPriority"
                                type="checkbox"
                                checked={editingCaseStudy.isPriority || false}
                                onChange={(e) =>
                                    handleFormChange("isPriority", e.target.checked)
                                }
                                className="h-4 w-4 accent-blue-600"
                            />
                            <label htmlFor="isPriority" className="text-gray-700">
                                Mark as priority
                            </label>
                        </div>
                    </div>
                </div>


                <div className="space-y-2">
                    <label
                        htmlFor="client"
                        className="block font-medium text-gray-700"
                    >
                        Client
                    </label>
                    <input
                        id="client"
                        type="text"
                        value={editingCaseStudy.client}
                        onChange={(e) =>
                            handleFormChange('client', e.target.value)
                        }
                        className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="publishedDate"
                        className="block font-medium text-gray-700"
                    >
                        Published Date
                    </label>
                    <input
                        id="publishedDate"
                        type="date"
                        value={editingCaseStudy.publishedDate}
                        onChange={(e) =>
                            handleFormChange('publishedDate', e.target.value)
                        }
                        className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="industry"
                        className="block font-medium text-gray-700"
                    >
                        Industry
                    </label>
                    <select
                        id="industry"
                        value={editingCaseStudy.industry}
                        onChange={(e) =>
                            handleFormChange('industry', e.target.value)
                        }
                        className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                        <option value="E-commerce">E-commerce</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Fintech">Fintech</option>
                        <option value="Education">Education</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Retail">Retail</option>
                        <option value="Technology">Technology</option>
                        <option value="Entertainment">Entertainment</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="category"
                        className="block font-medium text-gray-700"
                    >
                        Category
                    </label>
                    <select
                        id="category"
                        value={editingCaseStudy.category}
                        onChange={(e) =>
                            handleFormChange('category', e.target.value)
                        }
                        className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                        <option value="Web Development">
                            Web Development
                        </option>
                        <option value="Mobile App">Mobile App</option>
                        <option value="UX/UI Design">UX/UI Design</option>
                        <option value="Custom Software">
                            Custom Software
                        </option>
                        <option value="E-commerce Platform">
                            E-commerce Platform
                        </option>
                        <option value="Enterprise Solution">
                            Enterprise Solution
                        </option>
                        <option value="Cloud Migration">
                            Cloud Migration
                        </option>
                        <option value="Digital Transformation">
                            Digital Transformation
                        </option>
                    </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label
                        htmlFor="summary"
                        className="block font-medium text-gray-700"
                    >
                        Summary
                    </label>
                    <div className="rich-text-editor">
                        <ReactQuill
                            theme="snow"
                            // ref={quillRef}
                            value={editingCaseStudy.summary}
                            onChange={(value) =>
                                handleFormChange('summary', value)
                            }
                            // modules={quillModules}
                            // formats={quillFormats}
                            className="border-[1px] border-black text-black"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BasicTab