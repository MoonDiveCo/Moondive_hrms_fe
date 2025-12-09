"use client"
import { TrashIcon, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import React from 'react'
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[150px] border bg-gray-50 p-4">Loading editor...</div>
  ),
})

function MediaTab({
    fileInputRef,
    handleImageUpload,
    editingCaseStudy,
    handleImageDelete,
    titleImageInputRef,
    handleTitleImageUpload,
    handleTitleImageDelete,
    fullImage1InputRef,
    handleFullImage1Upload,
    handleFullImage1Delete,
    fullImage2InputRef,
    handleFullImage2Upload,
    handleFullImage2Delete,
    handleFormChange,
    selectedTechnologyCategory,
    setSelectedTechnologyCategory,
    quillRef,
    quillModules,
    quillFormats,
    testimonialImageInputRef,
    handleTestimonialImageUpload,
    handleTestimonialImageDelete,
    TECHNOLOGY_CATEGORIES,
}) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Background Image Upload */}
            <div className="space-y-2">
                <label
                    htmlFor="uploadImage"
                    className="block font-medium text-gray-700"
                >
                    Upload Background Image{' '}
                    <span className="text-red-500">*</span>
                </label>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="w-full rounded-md border p-2"
                    required
                />
                {editingCaseStudy.imageUrl && (
                    <div className="relative mt-2 inline-block">
                        <img
                            src={editingCaseStudy.imageUrl}
                            alt="Background Preview"
                            className="h-20 w-20 rounded object-cover"
                        />
                        <button
                            type="button"
                            onClick={handleImageDelete}
                            className="absolute right-0 top-0 rounded-full bg-white p-1 shadow hover:bg-red-100"
                        >
                            <TrashIcon className="h-4 w-4 text-red-500" />
                        </button>
                    </div>
                )}
            </div>

            {/* Title Image Upload */}
            <div className="space-y-2">
                <label
                    htmlFor="uploadTitleImage"
                    className="block font-medium text-gray-700"
                >
                    Upload Title Image{' '}
                    <span className="text-red-500">*</span>
                </label>
                <input
                    type="file"
                    accept="image/*"
                    ref={titleImageInputRef}
                    onChange={handleTitleImageUpload}
                    className="w-full rounded-md border p-2 text-black"
                    required
                />
                {editingCaseStudy.titleImageUrl && (
                    <div className="relative mt-2 inline-block">
                        <img
                            src={editingCaseStudy.titleImageUrl}
                            alt="Title Image Preview"
                            className="h-20 w-20 rounded object-cover"
                        />
                        <button
                            type="button"
                            onClick={handleTitleImageDelete}
                            className="absolute right-0 top-0 rounded-full bg-white p-1 shadow hover:bg-red-100"
                        >
                            <TrashIcon className="h-4 w-4 text-red-500" />
                        </button>
                    </div>
                )}
            </div>

            {/* Full Width Image 1 Upload */}
            <div className="space-y-2">
                <label
                    htmlFor="uploadFullImage1"
                    className="block font-medium text-gray-700"
                >
                    Upload Full Width Image 1
                </label>
                <input
                    type="file"
                    accept="image/*"
                    ref={fullImage1InputRef}
                    onChange={handleFullImage1Upload}
                    className="w-full rounded-md border p-2"
                />
                {editingCaseStudy.fullImage1Url && (
                    <div className="relative mt-2 inline-block">
                        <img
                            src={editingCaseStudy.fullImage1Url}
                            alt="Full Image 1 Preview"
                            className="h-20 w-20 rounded object-cover"
                        />
                        <button
                            type="button"
                            onClick={handleFullImage1Delete}
                            className="absolute right-0 top-0 rounded-full bg-white p-1 shadow hover:bg-red-100"
                        >
                            <TrashIcon className="h-4 w-4 text-red-500" />
                        </button>
                    </div>
                )}
            </div>

            {/* Full Width Image 2 Upload */}
            <div className="space-y-2">
                <label
                    htmlFor="uploadFullImage2"
                    className="block font-medium text-gray-700"
                >
                    Upload Full Width Image 2
                </label>
                <input
                    type="file"
                    accept="image/*"
                    ref={fullImage2InputRef}
                    onChange={handleFullImage2Upload}
                    className="w-full rounded-md border p-2"
                />
                {editingCaseStudy.fullImage2Url && (
                    <div className="relative mt-2 inline-block">
                        <img
                            src={editingCaseStudy.fullImage2Url}
                            alt="Full Image 2 Preview"
                            className="h-20 w-20 rounded object-cover"
                        />
                        <button
                            type="button"
                            onClick={handleFullImage2Delete}
                            className="absolute right-0 top-0 rounded-full bg-white p-1 shadow hover:bg-red-100"
                        >
                            <TrashIcon className="h-4 w-4 text-red-500" />
                        </button>
                    </div>
                )}
            </div>

            {/* Technologies Section */}
            <div className="space-y-2 md:col-span-2">
                <label
                    htmlFor="technologies"
                    className="block font-medium text-gray-700"
                >
                    Technologies
                </label>

                {/* Display selected technologies as tags */}
                <div className="mb-2 flex flex-wrap gap-2">
                    {editingCaseStudy.technologies.map((tech, index) => (
                        <div
                            key={index}
                            className="flex items-center rounded-full bg-blue-100 px-3 py-1"
                        >
                            <span className="text-sm text-blue-800">
                                {tech}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    const newTechnologies =
                                        editingCaseStudy.technologies.filter(
                                            (t) => t !== tech
                                        )
                                    handleFormChange(
                                        'technologies',
                                        newTechnologies
                                    )
                                }}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Technology category and selection */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block font-medium text-gray-700">
                            Category
                        </label>
                        <select
                            value={selectedTechnologyCategory}
                            onChange={(e) =>
                                setSelectedTechnologyCategory(e.target.value)
                            }
                            className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        >
                            {Object.keys(TECHNOLOGY_CATEGORIES).map(
                                (category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block font-medium text-gray-700">
                            Select Languages
                        </label>
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    const tech = e.target.value
                                    if (
                                        !editingCaseStudy.technologies.includes(tech)
                                    ) {
                                        const newTechnologies = [
                                            ...editingCaseStudy.technologies,
                                            tech,
                                        ]
                                        handleFormChange(
                                            'technologies',
                                            newTechnologies
                                        )
                                    }
                                    e.target.value = '' // Reset select after adding
                                }
                            }}
                            className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        >
                            <option value="">Select a technology</option>
                            {TECHNOLOGY_CATEGORIES[
                                selectedTechnologyCategory
                            ].map((tech, index) => (
                                <option
                                    key={index}
                                    value={tech}
                                    disabled={editingCaseStudy.technologies.includes(
                                        tech
                                    )}
                                >
                                    {tech}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Custom technology input */}
                <div className="mt-2">
                    <label className="mb-1 block font-medium text-gray-700">
                        Add Custom Technology
                    </label>
                    <div className="flex">
                        <input
                            type="text"
                            className="flex-1 rounded-l-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter custom technology name"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    e.preventDefault()
                                    const tech = e.target.value.trim()
                                    if (
                                        !editingCaseStudy.technologies.includes(tech)
                                    ) {
                                        const newTechnologies = [
                                            ...editingCaseStudy.technologies,
                                            tech,
                                        ]
                                        handleFormChange(
                                            'technologies',
                                            newTechnologies
                                        )
                                    }
                                    e.target.value = ''
                                }
                            }}
                        />
                        <button
                            type="button"
                            className="rounded-r-md bg-blue-600 px-4 py-2 text-white"
                            onClick={(e) => {
                                const input = e.target.previousSibling
                                const tech = input.value.trim()
                                if (
                                    tech &&
                                    !editingCaseStudy.technologies.includes(tech)
                                ) {
                                    const newTechnologies = [
                                        ...editingCaseStudy.technologies,
                                        tech,
                                    ]
                                    handleFormChange(
                                        'technologies',
                                        newTechnologies
                                    )
                                }
                                input.value = ''
                            }}
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>

            {/* Testimonial Section - Grouped together */}
            <div className="space-y-4 rounded-lg border bg-gray-50 p-4 md:col-span-2">
                <h3 className="border-b pb-2 text-lg font-medium text-gray-800">
                    Testimonial Information
                </h3>
                <div className="space-y-2">
                    <label
                        htmlFor="testimonialQuote"
                        className="block font-medium text-gray-700"
                    >
                        Testimonial Quote
                    </label>
                    <div className="rich-text-editor">
                        <ReactQuill
                            theme="snow"
                            // ref={quillRef}
                            value={editingCaseStudy.testimonial?.quote || ''}
                            onChange={(value) => {
                                const newTestimonial = {
                                    ...(editingCaseStudy.testimonial || {
                                        author: '',
                                        position: '',
                                        image: '',
                                    }),
                                    quote: value,
                                }
                                handleFormChange('testimonial', newTestimonial)
                            }}
                            // modules={quillModules}
                            // formats={quillFormats}
                            className="h-fit border-[1px] border-black text-black"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    {/* Author and Position fields in one row */}
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="flex-1 space-y-2">
                            <label
                                htmlFor="testimonialAuthor"
                                className="block font-medium text-gray-700"
                            >
                                Testimonial Author
                            </label>
                            <input
                                id="testimonialAuthor"
                                type="text"
                                value={editingCaseStudy.testimonial?.author || ''}
                                onChange={(e) => {
                                    const newTestimonial = {
                                        ...(editingCaseStudy.testimonial || {
                                            quote: '',
                                            position: '',
                                            image: '',
                                        }),
                                        author: e.target.value,
                                    }
                                    handleFormChange('testimonial', newTestimonial)
                                }}
                                className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>

                        <div className="flex-1 space-y-2">
                            <label
                                htmlFor="testimonialPosition"
                                className="block font-medium text-gray-700"
                            >
                                Testimonial Position
                            </label>
                            <input
                                id="testimonialPosition"
                                type="text"
                                value={
                                    editingCaseStudy.testimonial?.position || ''
                                }
                                onChange={(e) => {
                                    const newTestimonial = {
                                        ...(editingCaseStudy.testimonial || {
                                            quote: '',
                                            author: '',
                                            image: '',
                                        }),
                                        position: e.target.value,
                                    }
                                    handleFormChange('testimonial', newTestimonial)
                                }}
                                className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>
                    </div>

                    {/* Image upload field below */}
                    <div className="space-y-2">
                        <label
                            htmlFor="uploadTestimonialImage"
                            className="block font-medium text-gray-700"
                        >
                            Upload Testimonial Author Image
                        </label>
                        <input
                            id="uploadTestimonialImage"
                            type="file"
                            accept="image/*"
                            ref={testimonialImageInputRef}
                            onChange={handleTestimonialImageUpload}
                            className="w-full rounded-md border p-2"
                        />
                        {editingCaseStudy?.testimonial?.image && (
                            <div className="relative mt-2 inline-block">
                                <img
                                    src={editingCaseStudy.testimonial.image}
                                    alt="Testimonial Author Preview"
                                    className="h-20 w-20 rounded-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={handleTestimonialImageDelete}
                                    className="absolute right-0 top-0 rounded-full bg-white p-1 shadow hover:bg-red-100"
                                >
                                    <TrashIcon className="h-4 w-4 text-red-500" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MediaTab