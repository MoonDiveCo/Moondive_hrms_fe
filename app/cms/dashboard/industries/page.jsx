"use client"
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { BarChart3, Copy, Edit, ExternalLink, Eye, FileText, Filter, Globe, Plus, Search, Trash2, TrashIcon, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { TEXT_A_PROVEN_TRACK_RECORD, TEXT_ADVANCED_PLATFORMS_TO_EMPOWER_YOUR_OPERATIONS, TEXT_ADVANCED_TECHNOLOGIES_WE_EMPLOY, TEXT_COMPLETE_SOLUTIONS_FOR_YOUR_BUSINESS_NEEDS, TEXT_DELIVERING_SPECIALIZED_SOLUTIONS, TEXT_ENABLE_SERVED_INDUSTRIES, TEXT_ENABLE_TARGET_INDUSTRIES, TEXT_INDUSTRIES_WE_FOCUS, TEXT_INDUSTRIES_WE_TRANSFORMED, TEXT_INITIATE_A_PARTNERSHIP, TEXT_KICKSTART_YOUR_DREAM_PROJECT, TEXT_LETS_REDEFINE_YOUR_INDUSTRY, TEXT_VIEW_CASE_STUDIES, TEXT_WE_DEVELOP_EVERYTHING_FOR_YOUR_INDUSTRY, TEXT_WE_HAVE_WORKED_WITH_INNOVATIVE_IDEAS } from '@/text';
import BasicTab from '@/components/ManageIndustries/BasicTab';
import HeroTab from '@/components/ManageIndustries/HeroTab';
import ContentTab from '@/components/ManageIndustries/ContentTab';
import ApproachTab from '@/components/ManageIndustries/ApproachTab';
import TechnologiesTab from '@/components/ManageIndustries/TechnologiesTab';
import PlatformsTab from '@/components/ManageIndustries/PlatformsTab';
import SectionsTab from '@/components/ManageIndustries/SectionsTab';
import FilterDropdown from '@/components/UI/FilterDropdown';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[150px] border bg-gray-50 p-4">Loading editor...</div>
  ),
})

const INDUSTRY_OPTIONS = [
  'E-commerce',
  'Healthcare',
  'Fintech',
  'Education',
  'Real Estate',
  'Manufacturing',
  'Logistics',
  'Retail',
  'Technology',
  'Entertainment',
  'Automotive',
  'Travel',
]

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
}

const quillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'link',
  'image',
]

const ManageIndustries = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [industryPages, setIndustryPages] = useState([])
  const [editingPage, setEditingPage] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState(null)
  const [formMode, setFormMode] = useState('create')
  const [activeTab, setActiveTab] = useState('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    industry: 'all',
  })

  const [statistics, setStatistics] = useState(null)

  // Refs for file uploads
  const heroImageInputRef = useRef(null)
  const targetIndustriesInputRef = useRef(null)
  const servedIndustriesInputRef = useRef(null)
  const quillRef = useRef(null)

  useEffect(() => {
    fetchIndustryPages()
    fetchStatistics()
  }, [filters, searchQuery])

  const fetchIndustryPages = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        // page: pagination.current,
        limit: 10,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.industry !== 'all' && { industry: filters.industry }),
      })

      const response = await axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/get-industry-pages?${params}`)
      setIndustryPages(response.data.data)
      setIsLoading(false)
      // setPagination(response.data.pagination)
    } catch (error) {
      setIsLoading(false)
      toast.error('Failed to load industry pages')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/get-industry-pages-statistics`)
      setStatistics(response.data.data)
    } catch (error) {
      console.error('Failed to load statistics')
    }
  }

  const handleAddNew = () => {
    setFormMode('create')
    setActiveTab('basic')
    setEditingPage({
      title: '',
      slug: '',
      industry: 'Technology',
      seoTitle: '',
      metaDescription: '',
      metaKeywords: [],
      status: 'draft',
      primaryColor: '',
      secondaryColor: '',
      heroSection: {
        enabled: true,
        title: '',
        subtitle: '',
        ctaText1: TEXT_LETS_REDEFINE_YOUR_INDUSTRY,
        ctaText2: TEXT_VIEW_CASE_STUDIES,
        backgroundImage: '',
        formEnabled: true,
      },
      mainContentSection: {
        enabled: true,
        title: TEXT_WE_DEVELOP_EVERYTHING_FOR_YOUR_INDUSTRY,
        subtitle: TEXT_COMPLETE_SOLUTIONS_FOR_YOUR_BUSINESS_NEEDS,
        description: '',
        services: [],
      },
      targetIndustries: {
        enabled: true,
        title: TEXT_INDUSTRIES_WE_FOCUS,
        subtitle: TEXT_DELIVERING_SPECIALIZED_SOLUTIONS,
        mainIcon: '',
        description: '',
        services: [],
      },
      servedIndustries: {
        enabled: true,
        title: TEXT_INDUSTRIES_WE_TRANSFORMED,
        subtitle: TEXT_A_PROVEN_TRACK_RECORD,
        description: '',
        backgroundImage: '',
        challenge: '',
        solution: '',
      },
      technologiesSection: {
        enabled: true,
        title: TEXT_ADVANCED_TECHNOLOGIES_WE_EMPLOY,
        description: '',
        techList: [],
      },
      platformsSection: {
        enabled: true,
        title: TEXT_ADVANCED_PLATFORMS_TO_EMPOWER_YOUR_OPERATIONS,
        description: '',
        platforms: [],
        cardsPerPage: 6,
      },
      kickstartSection: {
        enabled: true,
        title: TEXT_KICKSTART_YOUR_DREAM_PROJECT,
        subtitle: TEXT_WE_HAVE_WORKED_WITH_INNOVATIVE_IDEAS,
        buttonText: TEXT_INITIATE_A_PARTNERSHIP,
        buttonLink: '/contact',
      },
    })
  }

  const handleEdit = (page) => {
    setFormMode('edit')
    setActiveTab('basic')
    setEditingPage({
      ...page,
      heroSection: page.heroSection || {
        enabled: true,
        title: '',
        subtitle: '',
        ctaText1: TEXT_LETS_REDEFINE_YOUR_INDUSTRY,
        ctaText2: TEXT_VIEW_CASE_STUDIES,
        backgroundImage: '',
        formEnabled: true,
      },
      mainContentSection: page.mainContentSection || {
        enabled: true,
        title: TEXT_WE_DEVELOP_EVERYTHING_FOR_YOUR_INDUSTRY,
        subtitle: '',
        description: '',
        services: [],
      },
      targetIndustries: page.targetIndustries || {
        enabled: true,
        title: TEXT_INDUSTRIES_WE_FOCUS,
        mainIcon: '',
        subtitle: '',
        description: '',
        services: [],
      },
      servedIndustries: page.servedIndustries || {
        enabled: true,
        title: TEXT_INDUSTRIES_WE_TRANSFORMED,
        subtitle: '',
        description: '',
        backgroundImage: '',
        challenge: '',
        solution: '',
      },
      technologiesSection: page.technologiesSection || {
        enabled: true,
        title: TEXT_ADVANCED_TECHNOLOGIES_WE_EMPLOY,
        description: '',
        techList: [],
      },
      platformsSection: page.platformsSection || {
        enabled: true,
        title: TEXT_ADVANCED_PLATFORMS_TO_EMPOWER_YOUR_OPERATIONS,
        description: '',
        platforms: [],
        cardsPerPage: 6,
      },
      kickstartSection: page.kickstartSection || {
        enabled: true,
        title: TEXT_KICKSTART_YOUR_DREAM_PROJECT,
        subtitle: TEXT_WE_HAVE_WORKED_WITH_INNOVATIVE_IDEAS,
        buttonText: TEXT_INITIATE_A_PARTNERSHIP,
        buttonLink: '/contact',
      },
    })
  }

  const handleDelete = (id) => {
    setPageToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!pageToDelete) return

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/delete-industry-page/${pageToDelete}`)
      setIndustryPages((prev) =>
        prev.filter((page) => page._id !== pageToDelete)
      )
      toast.success('Industry page deleted successfully')
      fetchStatistics()
    } catch (error) {
      toast.error('Failed to delete industry page')
    }

    setIsDeleteDialogOpen(false)
    setPageToDelete(null)
  }

  const handleDuplicate = async (page) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/duplicate-industry-page/${page._id}`,
        {
          title: `${page.title} (Copy)`,
          slug: `${page.slug}-copy`,
        }
      )
      toast.success('Page duplicated successfully')
      fetchIndustryPages()
    } catch (error) {
      toast.error('Failed to duplicate page')
    }
  }

  const handleStatusChange = async (pageId, newStatus) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/update-industry-page-status/${pageId}`, {
        status: newStatus,
      })
      toast.success(
        `Page ${newStatus === 'live' ? 'published' : 'saved as draft'} successfully`
      )
      fetchIndustryPages()
      fetchStatistics()
    } catch (error) {
      toast.error(
        `Failed to ${newStatus === 'live' ? 'publish' : 'save as draft'} page`
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (formMode === 'create') {
        const response = await axios.post(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/add-industry-page`,
          editingPage
        )
        toast.success('Industry page created successfully')
        setIndustryPages((prev) => [response.data, ...prev])
      } else {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/edit-industry-page/${editingPage._id}`,
          editingPage
        )
        console.log('editingPage', editingPage)
        toast.success('Industry page updated successfully')
        setIndustryPages((prev) =>
          prev.map((page) =>
            page._id === editingPage._id ? response.data : page
          )
        )
      }

      setEditingPage(null)
      fetchStatistics()
    } catch (error) {
      toast.error('Something went wrong while saving')
    }
  }

  const handleFormChange = (field, value) => {
    if (!editingPage) return

    if (field === 'title' && formMode === 'create') {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')

      setEditingPage({
        ...editingPage,
        [field]: value,
        slug,
      })
    } else {
      setEditingPage({
        ...editingPage,
        [field]: value,
      })
    }
  }

  const handleSectionChange = (section, field, value) => {
    setEditingPage((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleImageUpload = async (e, section, field) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('files', file)

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/upload-open-graph-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const uploadedUrl = res.data?.data?.imageUrls?.[0]
      if (uploadedUrl) {
        if (section) {
          handleSectionChange(section, field, uploadedUrl)
        } else {
          handleFormChange(field, uploadedUrl)
        }
        toast.success('Image uploaded successfully!')
      }
    } catch (err) {
      toast.error('Failed to upload image')
    }
  }

  const handleImageDelete = async (imageUrl, section, field) => {
    if (!imageUrl) return

    try {
      const url = new URL(imageUrl)
      const Key = decodeURIComponent(url.pathname.slice(1))
      const Bucket = 'moondive-bucket-s3'

      await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/remove-open-graph-image`, { Bucket, Key })

      if (section) {
        handleSectionChange(section, field, '')
      } else {
        handleFormChange(field, '')
      }

      toast.success('Image deleted successfully')
    } catch (err) {
      toast.error('Failed to delete image')
    }
  }

  const addService = (section) => {
    const newService = {
      id: Date.now(),
      title: '',
      icon: '',
      description: '',
      features: [],
    }
    handleSectionChange(section, 'services', [
      ...editingPage[section].services,
      newService,
    ])
  }

  const updateService = (section, index, field, value) => {
    const updatedServices = [...editingPage[section].services]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    handleSectionChange(section, 'services', updatedServices)
  }

  const removeService = (section, index) => {
    const updatedServices = editingPage[section].services.filter(
      (_, i) => i !== index
    )
    handleSectionChange(section, 'services', updatedServices)
  }

  const addTechnology = () => {
    const newTech = {
      id: Date.now(),
      name: '',
      description: '',
      isExpanded: false,
    }
    handleSectionChange('technologiesSection', 'techList', [
      ...editingPage.technologiesSection.techList,
      newTech,
    ])
  }

  const updateTechnology = (index, field, value) => {
    const updatedTech = [...editingPage.technologiesSection.techList]
    updatedTech[index] = { ...updatedTech[index], [field]: value }
    handleSectionChange('technologiesSection', 'techList', updatedTech)
  }

  const removeTechnology = (index) => {
    const updatedTech = editingPage.technologiesSection.techList.filter(
      (_, i) => i !== index
    )
    handleSectionChange('technologiesSection', 'techList', updatedTech)
  }

  const addPlatform = () => {
    const newPlatform = {
      id: Date.now(),
      title: '',
      description: '',
      borderColor: 'border-blue-500',
    }
    handleSectionChange('platformsSection', 'platforms', [
      ...editingPage.platformsSection.platforms,
      newPlatform,
    ])
  }

  const updatePlatform = (index, field, value) => {
    const updatedPlatforms = [...editingPage.platformsSection.platforms]
    updatedPlatforms[index] = { ...updatedPlatforms[index], [field]: value }
    handleSectionChange('platformsSection', 'platforms', updatedPlatforms)
  }

  const removePlatform = (index) => {
    const updatedPlatforms = editingPage.platformsSection.platforms.filter(
      (_, i) => i !== index
    )
    handleSectionChange('platformsSection', 'platforms', updatedPlatforms)
  }

  const filteredPages = searchQuery
    ? industryPages.filter(
      (page) =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : industryPages

    
  if(isLoading){
    return(
      <div className='flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: 'center' }} // add this
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-transparent">
      <main className="flex-1 overflow-hidden p-4">
        <div className="">
          <div className="mb-8">
            <div className="mb-6 flex w-full flex-col sm:flex-row sm:items-center sm:justify-between">
              <h4 className=" text-primaryText">
                Industry Pages
              </h4>
              <button
                onClick={handleAddNew}
                className="flex items-center rounded-full bg-primary px-3 py-2 text-white transition-colors "
              >
                <span className='flex text-xs items-center'><Plus className="mr-1 h-3 w-3" /> Add New Industry Page</span>
              </button>
            </div>

            {/* Statistics Cards */}
            {statistics && (
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-transparent p-4 shadow border border-white">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-primaryText">
                        Total Pages
                      </p>
                      <p className="text-2xl font-bold text-primaryText">
                        {statistics.overview.totalPages}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-transparent p-4 shadow border border-white">
                  <div className="flex items-center">
                    <Globe className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-primaryText">
                        Published
                      </p>
                      <p className="text-2xl font-bold text-primaryText">
                        {statistics.overview.publishedPages}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-transparent p-4 shadow border border-white">
                  <div className="flex items-center">
                    <Edit className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-primaryText">
                        Drafts
                      </p>
                      <p className="text-2xl font-bold text-primaryText">
                        {statistics.overview.draftPages}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-transparent p-4 shadow border border-white">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-primaryText">
                        Total Views
                      </p>
                      <p className="text-2xl font-bold text-primaryText">
                        {statistics.overview.totalViews}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex h-full w-full flex-col rounded-lg bg-transparent shadow border border-white">
            {/* Filters and Search */}
            <div className="border-b p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex items-center">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 transform text-primaryText"
                    size={12}
                  />
                  <input
                    type="text"
                    placeholder="Search industry pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs rounded-full border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary text-primaryText bg-transparent"
                  />
                </div>
               <FilterDropdown
                  label="All Status"
                  value={filters.status}
                  options={[
                    { label: "All Status", value: "all" },
                    { label: "Published", value: "live" },
                    { label: "Draft", value: "draft" },
                  ]}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: value,
                    }))
                  }
                />

                <FilterDropdown
                  label="All Industries"
                  value={filters.industry}
                  options={[
                    { label: "All Industries", value: "all" },
                    ...INDUSTRY_OPTIONS.map((industry) => ({
                      label: industry,
                      value: industry,
                    })),
                  ]}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      industry: value,
                    }))
                  }
                />

              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Industry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Last Modified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredPages?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center">
                          {searchQuery
                            ? 'No pages found. Try a different search term.'
                            : 'No industry pages found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredPages?.map((page) => (
                        <tr key={page._id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div>
                                <div className="max-w-[200px] truncate text-sm font-medium text-gray-900">
                                  {page.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  /{page.slug}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full bg-primary/20 border border-primary px-2 text-xs font-semibold leading-5 text-primary">
                              {page.industry}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${page.status === 'live'
                                ? 'bg-green-100 text-green-800 border border-green-800'
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-800'
                                }`}
                            >
                              {page.status === 'live' ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {page.views || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(
                              page.lastModified || page.updatedAt
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                className="rounded-full p-1 hover:bg-gray-100"
                                  onClick={() =>
                                  window.open(
                                    `https://moondive.co/industries/${page.slug}`,
                                    '_blank'
                                  )
                                    }
                                title="View Page"
                              >
                                <Eye className="h-4 w-4" color="black" />
                              </button>
                              <button
                                className="rounded-full p-1 text-primaryText "
                                onClick={() => handleEdit(page)}
                                title="Edit Page"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                className="rounded-full p-1 text-primaryText"
                                onClick={() => handleDuplicate(page)}
                                title="Duplicate Page"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                className={`rounded-full p-1 hover:bg-gray-50 ${page.status === 'live'
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                                  }`}
                                onClick={() =>
                                  handleStatusChange(
                                    page._id,
                                    page.status === 'live' ? 'draft' : 'live'
                                  )
                                }
                                title={
                                  page.status === 'live'
                                    ? 'Move to Draft'
                                    : 'Publish'
                                }
                              >
                                {page.status === 'live' ? (
                                  <FileText className="h-4 w-4" />
                                ) : (
                                  <Globe className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                className="rounded-full p-1 text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(page._id)}
                                title="Delete Page"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}

            <div className="flex items-center justify-between border-t px-4 py-3">

              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      current: prev.current - 1,
                    }))
                  }
                  className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 text-white"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      current: prev.current + 1,
                    }))
                  }
                  className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 text-white"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm bg-opacity-50">
          <div className="max-h-[80vh] hide-scrollbar w-full max-w-6xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="relative border-b p-6">
              <h2 className="text-xl font-semibold text-primary-50/80">
                {formMode === 'create'
                  ? 'Create New Industry Page'
                  : 'Edit Industry Page'}
              </h2>
              <p className="mt-1 text-gray-500">
                Fill in the details below to{' '}
                {formMode === 'create' ? 'create a new' : 'update this'}{' '}
                industry page.
              </p>
              <button
                onClick={() => setEditingPage(null)}
                className="absolute right-4 top-4 cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6">
                {/* Tab Navigation */}
                <div className="mb-6 overflow-x-auto border-b">
                  <div className="flex min-w-max flex-nowrap">
                    {[
                      'basic',
                      'hero',
                      'content',
                      'approach',
                      'technologies',
                      'platforms',
                      'sections',
                    ].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className={`whitespace-nowrap px-6 py-2 text-center font-medium ${activeTab === tab
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab === 'basic'
                          ? 'Basic Info'
                          : tab === 'hero'
                            ? 'Hero Section'
                            : tab === 'content'
                              ? 'Main Content'
                              : tab === 'approach'
                                ? 'Our Approach'
                                : tab === 'technologies'
                                  ? 'Technologies'
                                  : tab === 'platforms'
                                    ? 'Platforms'
                                    : 'Kickstart Section'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <BasicTab editingPage={editingPage} handleFormChange={handleFormChange} />
                )}

                {/* Hero Section Tab */}
                {activeTab === 'hero' && (
                  <HeroTab    
                   editingPage={editingPage}
                  handleSectionChange={handleSectionChange}
                  heroImageInputRef={heroImageInputRef}
                  handleImageUpload={handleImageUpload}
                  />
                )}

                {/* Main Content Tab */}
                {activeTab === 'content' && (
                  <ContentTab 
                      editingPage={editingPage}
                    handleSectionChange={handleSectionChange}
                    addService={addService}
                    removeService={removeService}
                    updateService={updateService}
                    />
                )}

                {/* ourApproachSection */}
                {activeTab === 'approach' && (
                  <ApproachTab   
                    editingPage={editingPage}
                    handleSectionChange={handleSectionChange}
                    targetIndustriesInputRef={targetIndustriesInputRef}
                    handleImageUpload={handleImageUpload}
                    handleImageDelete={handleImageDelete}
                    addService={addService}
                    removeService={removeService}
                    updateService={updateService}
                    servedIndustriesInputRef={servedIndustriesInputRef} />
                )}

                {/* Technologies Tab */}
                {activeTab === 'technologies' && (
                  <TechnologiesTab 
                      editingPage={editingPage}
                    handleSectionChange={handleSectionChange}
                    addTechnology={addTechnology}
                    removeTechnology={removeTechnology}
                    updateTechnology={updateTechnology}
                  />
                )}

                {/* Platforms Tab */}
                {activeTab === 'platforms' && (
                  <PlatformsTab 
                      editingPage={editingPage}
                    handleSectionChange={handleSectionChange}
                    addPlatform={addPlatform}
                    removePlatform={removePlatform}
                    updatePlatform={updatePlatform}
                  />
                )}

                {/* Kickstart Section Tab */}
                {activeTab === 'sections' && (
                  <SectionsTab
                      editingPage={editingPage}
                      handleSectionChange={handleSectionChange}
                  />
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-between border-t bg-gray-50 p-6">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="rounded-full bg-white px-6 py-2 text-sm font-medium text-primary shadow-sm border border-primary"
                >
                  Cancel
                </button>

                <div className="flex space-x-4">
                  {formMode === 'edit' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleFormChange('status', 'draft')
                        handleSubmit({ preventDefault: () => { } })
                      }}
                      className="rounded-md bg-yellow-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700"
                    >
                      Save as Draft
                    </button>
                  )}

                  <button
                    type="submit"
                    className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm "
                  >
                    {formMode === 'create'
                      ? editingPage.status === 'live'
                        ? 'Create & Publish'
                        : 'Create as Draft'
                      : editingPage.status === 'live'
                        ? 'Update & Publish'
                        : 'Update'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b p-6">
              <h2 className="text-xl font-semibold">Confirm Deletion</h2>
              <p className="mt-1 text-gray-500">
                Are you sure you want to delete this industry page? This action
                cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-4 p-6">
              <button
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageIndustries