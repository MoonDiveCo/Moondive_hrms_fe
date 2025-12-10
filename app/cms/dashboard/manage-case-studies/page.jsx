'use client'
import React, { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import {
  TEXT_ACTIONS,
  TEXT_ADD_NEW_CASE_STUDIES,
  TEXT_CASE_STUDIES,
  TEXT_CATEGORY,
  TEXT_CLIENT,
  TEXT_INDUSTRY,
  TEXT_PUBLISHED,
  TEXT_TITLE,
  TEXT_TITTLE,
} from '@/text'
import axios from 'axios'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  GripVertical,
  Plus,
  Search,
  Trash2,
  TrashIcon,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'react-toastify'

// import 'react-quill/dist/quill.snow.css'

import dynamic from 'next/dynamic'
import BasicTab from '@/components/ManageCaseStudies/BasicTab'
import ContentTab from '@/components/ManageCaseStudies/ContentTab'
import ChallengesTab from '@/components/ManageCaseStudies/ChallengesTab'
import MediaTab from '@/components/ManageCaseStudies/MediaTab'
import LayoutTab from '@/components/ManageCaseStudies/LayoutTab'
import CtaTab from '@/components/ManageCaseStudies/CtaTab'
import FilterDropdown from '@/components/UI/FilterDropdown'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Available sections for case study
const AVAILABLE_SECTIONS = [
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Title, summary and main CTA',
  },
  {
    id: 'statistics',
    name: 'Statistics',
    description: 'Project highlights and metrics',
  },
  {
    id: 'overview',
    name: 'Overview',
    description: 'Company info and technologies',
  },
  {
    id: 'fullImage1',
    name: 'Full Width Image 1',
    description: 'First full width image section',
  },
  {
    id: 'challenges',
    name: 'Challenges',
    description: 'Problems and challenges faced',
  },
  { id: 'process', name: 'Process', description: 'Our development process' },
  {
    id: 'solution',
    name: 'Solution',
    description: 'How we solved the problem',
  },
  {
    id: 'fullImage2',
    name: 'Full Width Image 2',
    description: 'Second full width image section',
  },
  { id: 'results', name: 'Results', description: 'Outcomes and achievements' },
  {
    id: 'testimonial',
    name: 'Testimonial',
    description: 'Client feedback and quotes',
  },
  {
    id: 'relatedStudies',
    name: 'Related Studies',
    description: 'Other case studies',
  },
  {
    id: 'kickstart',
    name: 'Kickstart CTA',
    description: 'Final call-to-action section',
  },
]

const TECHNOLOGY_CATEGORIES = {
  Frontend: [
    'React',
    'Angular',
    'Vue.js',
    'Next.js',
    'HTML/CSS',
    'JavaScript',
    'TypeScript',
    'jQuery',
    'Bootstrap',
    'Tailwind CSS',
  ],
  Backend: [
    'Node.js',
    'Express',
    'Django',
    'Flask',
    'Spring Boot',
    'Ruby on Rails',
    'Laravel',
    'ASP.NET',
    'PHP',
    'Java',
  ],
  Database: [
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'SQLite',
    'Oracle',
    'SQL Server',
    'Firebase',
    'Redis',
    'Elasticsearch',
    'DynamoDB',
  ],
  'Cloud & DevOps': [
    'AWS',
    'Azure',
    'Google Cloud',
    'Docker',
    'Kubernetes',
    'Jenkins',
    'GitHub Actions',
    'CircleCI',
    'Terraform',
    'Ansible',
  ],
  Mobile: [
    'React Native',
    'Flutter',
    'Swift',
    'Kotlin',
    'Ionic',
    'Android',
    'iOS',
  ],
  'AI & Data': [
    'TensorFlow',
    'PyTorch',
    'Pandas',
    'NumPy',
    'scikit-learn',
    'Apache Spark',
    'Hadoop',
  ],
  Other: [
    'GraphQL',
    'REST API',
    'WebSockets',
    'OAuth',
    'JWT',
    'Blockchain',
    'WebRTC',
  ],
}

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

const ManageCaseStudies = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [caseStudiesData, setCaseStudiesData] = useState([])
  const [editingCaseStudy, setEditingCaseStudy] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [caseStudyToDelete, setCaseStudyToDelete] = useState(null)
  const [formMode, setFormMode] = useState('create')
  const [activeTab, setActiveTab] = useState('basic')
  const [selectedTechnologyCategory, setSelectedTechnologyCategory] =
    useState('Frontend')
  const [selectedTechnologies, setSelectedTechnologies] = useState([])
  const fileInputRef = useRef(null)
  const titleImageInputRef = useRef(null)
  const testimonialImageInputRef = useRef(null)
  const fullImage1InputRef = useRef(null)
  const fullImage2InputRef = useRef(null)
  const challengeImageInputRef = useRef(null)
  const solutionImageInputRef = useRef(null)
  const [fetchingCasestudies, setFetchingCasestudies] = useState(true)
  // const quillRef = useRef(null)
  const [uploading, setUploading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [showGenerationConfirmModal, setShowGenerationConfirmModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingChallengeImage, setIsUploadingChallengeImage] =
    useState(false)
  const [isUploadingSolutionImage, setIsUploadingSolutionImage] =
    useState(false)

  // useEffect(() => {
  //   import('react-quill/dist/quill.snow.css')

  //   if (quillRef.current) {
  //     const editor = quillRef.current.getEditor()
  //     editor.root.addEventListener('paste', handlePaste)
  //   }

  //   return () => {
  //     if (quillRef.current) {
  //       const editor = quillRef.current.getEditor()
  //       editor.root.removeEventListener('paste', handlePaste)
  //     }
  //   }
  // }, [])

  const handlePaste = (e) => {
    e.preventDefault()
    const clipboardData = e.clipboardData || window.clipboardData
    const pastedData = clipboardData.getData('Text')
    let html = ''
    const lines = pastedData.split('\n').filter((line) => line.trim() !== '')
    let insideList = false

    lines.forEach((line) => {
      const trimmedLine = line.trim()

      if (/^\d+\.\s+/.test(trimmedLine)) {
        if (insideList) {
          html += '</ul>'
          insideList = false
        }
        html += `<h2>${trimmedLine}</h2>`
      } else if (
        trimmedLine.startsWith('- ') ||
        trimmedLine.startsWith('* ') ||
        trimmedLine.startsWith('• ')
      ) {
        if (!insideList) {
          html += '<ul>'
          insideList = true
        }
        html += `<li>${trimmedLine.substring(2)}</li>`
      } else {
        if (insideList) {
          html += '</ul>'
          insideList = false
        }
        html += `<p>${trimmedLine}</p>`
      }
    })

    if (insideList) {
      html += '</ul>'
    }

    // const quill = quillRef.current.getEditor()
    // quill.clipboard.dangerouslyPasteHTML(quill.getSelection()?.index || 0, html)
  }
const fetchCaseStudies = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/get-case-study?status=${selectedFilter}`)
        setCaseStudiesData(response.data)
        setFetchingCasestudies(false)
      } catch (error) {
        setFetchingCasestudies(false)
        toast.error('Failed to load case studies. Please try again later.')
      }
    }

  useEffect(() => {
    fetchCaseStudies()
  }, [selectedFilter])

  const filteredCaseStudies = searchQuery
    ? caseStudiesData.filter(
      (study) =>
        study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : caseStudiesData

  const handleAddNew = () => {
    setFormMode('create')
    setEditingCaseStudy({
      id: String(caseStudiesData?.length + 1),
      title: '',
      slug: '',
      client: '',
      isPriority: false,
      industry: 'Technology',
      category: 'Web Development',
      status: 'draft',
      summary: '',
      challenge: '',
      solution: '',
      results: '',
      technologies: [],
      imageUrl: '',
      titleImageUrl: '',
      fullImage1Url: '',
      fullImage2Url: '',
      metaDescription: '',
      publishedDate: new Date().toISOString().split('T')[0],
      sectionOrder: [
        'hero',
        'statistics',
        'overview',
        'fullImage1',
        'challenges',
        'solution',
        'fullImage2',
        'results',
        'testimonial',
        'relatedStudies',
        'kickstart',
      ],
      testimonial: {
        quote: '',
        author: '',
        position: '',
        image: '',
      },
      cta: {
        text: 'Expand Your Business',
        link: '#',
        enabled: true,
      },
      challengeSection: {
        enabled: true,
        title: 'The Challenge',
        subtitle: 'Problems We Solved',
        imageUrl: '',
        items: [
          {
            title: 'Complex Business Requirements',
            description:
              'Understanding and translating complex business needs into technical solutions while maintaining scalability and performance.',
          },
        ],
      },
      solutionSection: {
        enabled: true,
        title: 'Our Solution',
        subtitle: 'How We Solved It',
        imageUrl: '',
        items: [
          {
            title: 'Innovative Approach',
            description:
              'We implemented cutting-edge technologies and methodologies to address the core challenges and deliver exceptional results.',
          },
        ],
      },
      kickstart: {
        enabled: true,
        title: 'Kickstart Your Dream Project With Us',
        subtitle:
          'We have worked with some of the best innovative ideas and brands in the world across industries.',
        buttonText: 'Initiate a Partnership',
        buttonLink: '/contact',
      },
      statistics: {
        enabled: true,
        title: 'Average results generated for our clients',
        stats: [
          {
            value: '5X Revenue Growth',
            label:
              'Achieved significant growth in annual recurring revenue through strategic initiatives',
          },
          {
            value: '7X Lead Generation',
            label:
              'Increased marketing qualified leads through comprehensive digital campaigns',
          },
          {
            value: '89% Traffic Increase',
            label:
              'Improved organic search traffic with advanced SEO optimization',
          },
        ],
      },
    })
  }

  const REQUIRED_FIELDS = {
    basic: [
      'title',
      'slug',
      'client',
      'publishedDate',
      'industry',
      'category',
      'summary',
      'metaDescription',
    ],
    content: ['results'],
    challenges: [],
    media: ['imageUrl', 'titleImageUrl', 'technologies'],
    layout: [],
    cta: [],
  }

  const handleEdit = (caseStudy) => {
    setFormMode('edit')
    setActiveTab('basic')
    setEditingCaseStudy({
      ...caseStudy,
      sectionOrder: caseStudy?.sectionOrder || [
        'hero',
        'statistics',
        'overview',
        'fullImage1',
        'challenges',
        'process',
        'solution',
        'fullImage2',
        'results',
        'testimonial',
        'relatedStudies',
        'kickstart',
      ],
      testimonial: caseStudy?.testimonial || {
        quote: '',
        author: '',
        position: '',
        image: '',
      },
      cta: caseStudy?.cta || {
        text: 'Expand Your Business',
        link: '#',
        enabled: true,
      },
      challengeSection: caseStudy?.challengeSection || {
        enabled: true,
        title: 'The Challenge',
        subtitle: 'Problems We Solved',
        imageUrl: '',
        items: caseStudy?.challenge
          ? [
            {
              title: 'Project Challenge',
              description: caseStudy.challenge,
            },
          ]
          : [
            {
              title: 'Complex Business Requirements',
              description:
                'Understanding and translating complex business needs into technical solutions while maintaining scalability and performance.',
            },
          ],
      },
      solutionSection: caseStudy?.solutionSection || {
        enabled: true,
        title: 'Our Solution',
        subtitle: 'How We Solved It',
        imageUrl: '',
        items: caseStudy?.solution
          ? [
            {
              title: 'Project Solution',
              description: caseStudy.solution,
            },
          ]
          : [
            {
              title: 'Innovative Approach',
              description:
                'We implemented cutting-edge technologies and methodologies to address the core challenges and deliver exceptional results.',
            },
          ],
      },
      kickstart: caseStudy?.kickstart || {
        enabled: true,
        title: 'Kickstart Your Dream Project With Us',
        subtitle:
          'We have worked with some of the best innovative ideas and brands in the world across industries.',
        buttonText: 'Initiate a Partnership',
        buttonLink: '/contact',
      },
      metaDescription: caseStudy?.metaDescription || '',
      fullImage1Url: caseStudy?.fullImage1Url || '',
      fullImage2Url: caseStudy?.fullImage2Url || '',
      statistics: caseStudy?.statistics || {
        enabled: true,
        title: 'Average results generated for our clients',
        stats: [
          {
            value: '5X Revenue Growth',
            label:
              'Achieved significant growth in annual recurring revenue through strategic initiatives',
          },
          {
            value: '7X Lead Generation',
            label:
              'Increased marketing qualified leads through comprehensive digital campaigns',
          },
          {
            value: '89% Traffic Increase',
            label:
              'Improved organic search traffic with advanced SEO optimization',
          },
        ],
      },
    })
  }

  const handleDelete = (id) => {
    setCaseStudyToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!caseStudyToDelete) return

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/delete-case-study/${caseStudyToDelete}`)
      setCaseStudiesData((prev) =>
        prev.filter((study) => study._id !== caseStudyToDelete)
      )
      toast.success('Case study deleted successfully')
    } catch (error) {
      console.error('Error deleting case study:', error)
      toast.error('Failed to delete case study. Please try again.')
    }

    setIsDeleteDialogOpen(false)
    setCaseStudyToDelete(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const requiredMediaFields = REQUIRED_FIELDS['media']
    const missing = requiredMediaFields.filter((field) => {
      const value = editingCaseStudy?.[field]
      return !value || (Array.isArray(value) && value.length === 0)
    })

    if (missing.length) {
      toast.error('Please fill out all required fields in the media step.')
      return
    }

    try {
      if (formMode === 'create') {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/add-case-study`,
          editingCaseStudy
        )
        toast.success('Case study created successfully')
        setCaseStudiesData((prev) => [response.data, ...prev])
      } else {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/edit-case-study/${editingCaseStudy._id}`,
          editingCaseStudy
        )
        toast.success('Case study updated successfully')
        setCaseStudiesData(
          (prev) =>
          prev.map((cs) =>
            cs._id === editingCaseStudy._id ? response.data : cs
          )
        )
      }

      setEditingCaseStudy(null)
    } catch (error) {
      console.log('error', error)
      toast.error(error.response.data.errors[0]|| 'Submission failed. Please try again.')
    }
  }

  const handleFormChange = (field, value) => {
    if (!editingCaseStudy) return

    if (field === 'title') {
    const slug = value
    .toLowerCase()                      
    .replace(/[^\w\s-]/g, '')       
    .replace(/\s+/g, '-')                 
    .replace(/-+$/, ''); 

      setEditingCaseStudy({
        ...editingCaseStudy,
        [field]: value,
        slug,
      })
    } else {
      setEditingCaseStudy({
        ...editingCaseStudy,
        [field]: value,
      })
    }
  }

  const handleNextStep = () => {
    const fields = REQUIRED_FIELDS[activeTab]
    const missing = fields.filter((field) => {
      const value = editingCaseStudy?.[field]
      return !value || (Array.isArray(value) && value.length === 0)
    })

    if (missing.length) {
      toast.error(`Please fill all required fields before continuing.`)
      return
    }

    if (activeTab === 'basic') setActiveTab('content')
    else if (activeTab === 'content') setActiveTab('challenges')
    else if (activeTab === 'challenges') setActiveTab('media')
    else if (activeTab === 'media') setActiveTab('layout')
    else if (activeTab === 'layout') setActiveTab('cta')
  }

  const handlePreviousStep = () => {
    if (activeTab === 'content') setActiveTab('basic')
    else if (activeTab === 'challenges') setActiveTab('content')
    else if (activeTab === 'media') setActiveTab('challenges')
    else if (activeTab === 'layout') setActiveTab('media')
    else if (activeTab === 'cta') setActiveTab('layout')
  }

  // Section ordering functions
  const moveSectionUp = (index) => {
    if (index === 0) return
    const newOrder = [...editingCaseStudy.sectionOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp
    handleFormChange('sectionOrder', newOrder)
  }

  const moveSectionDown = (index) => {
    if (index === editingCaseStudy.sectionOrder.length - 1) return
    const newOrder = [...editingCaseStudy.sectionOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp
    handleFormChange('sectionOrder', newOrder)
  }

  const toggleSection = (sectionId) => {
    const currentOrder = editingCaseStudy.sectionOrder || []
    if (currentOrder.includes(sectionId)) {
      const newOrder = currentOrder.filter((id) => id !== sectionId)
      handleFormChange('sectionOrder', newOrder)
    } else {
      const newOrder = [...currentOrder, sectionId]
      handleFormChange('sectionOrder', newOrder)
    }
  }

  // Challenge section functions
  const addChallengeItem = () => {
    const newItem = {
      title: '',
      description: '',
    }

    const updatedChallengeSection = {
      ...editingCaseStudy.challengeSection,
      items: [...(editingCaseStudy.challengeSection?.items || []), newItem],
    }

    handleFormChange('challengeSection', updatedChallengeSection)
  }

  const removeChallengeItem = (index) => {
    const updatedChallengeSection = {
      ...editingCaseStudy.challengeSection,
      items: editingCaseStudy.challengeSection.items.filter(
        (_, i) => i !== index
      ),
    }

    handleFormChange('challengeSection', updatedChallengeSection)
  }

  const updateChallengeItem = (index, field, value) => {
    const updatedChallengeSection = {
      ...editingCaseStudy.challengeSection,
      items: editingCaseStudy.challengeSection.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }

    handleFormChange('challengeSection', updatedChallengeSection)
  }

  // Solution section functions
  const addSolutionItem = () => {
    const newItem = {
      title: '',
      description: '',
    }

    const updatedSolutionSection = {
      ...editingCaseStudy.solutionSection,
      items: [...(editingCaseStudy.solutionSection?.items || []), newItem],
    }

    handleFormChange('solutionSection', updatedSolutionSection)
  }

  const removeSolutionItem = (index) => {
    const updatedSolutionSection = {
      ...editingCaseStudy.solutionSection,
      items: editingCaseStudy.solutionSection.items.filter(
        (_, i) => i !== index
      ),
    }

    handleFormChange('solutionSection', updatedSolutionSection)
  }

  const updateSolutionItem = (index, field, value) => {
    const updatedSolutionSection = {
      ...editingCaseStudy.solutionSection,
      items: editingCaseStudy.solutionSection.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }

    handleFormChange('solutionSection', updatedSolutionSection)
  }

  // Challenge image upload handlers
  const handleChallengeImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsUploadingChallengeImage(true)
    const formData = new FormData()
    formData.append('files', file)

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/upload-open-graph-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const uploadedUrl = res.data?.data?.imageUrls?.[0]
      if (uploadedUrl) {
        const updatedSolutionSection = {
          ...editingCaseStudy.challengeSection,
          imageUrl: uploadedUrl,
        }
        handleFormChange('challengeSection', updatedSolutionSection)
        toast.success('Full image 1 uploaded successfully!')
      }
    } catch (err) {
      console.error('Upload failed', err)
      toast.error('Failed to upload full image 1')
    }
  }

  const handleFullImage1Delete = async () => {
    const fullImage1Url = editingCaseStudy.fullImage1Url
    if (!fullImage1Url) return
    const url = new URL(fullImage1Url)
    const Key = decodeURIComponent(url.pathname.slice(1))
    const Bucket = 'moondive-bucket-s3'
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/remove-open-graph-image`, {
        Bucket,
        Key,
      })
      handleFormChange('fullImage1Url', '')
      if (fullImage1InputRef.current) {
        fullImage1InputRef.current.value = ''
      }
      toast.success('Full image 1 deleted successfully')
    } catch (err) {
      console.error('Delete failed', err)
      toast.error('Failed to delete full image 1')
    }
  }

  const handleFullImage2Upload = async (e) => {
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
        handleFormChange('fullImage2Url', uploadedUrl)
        toast.success('Full image 2 uploaded successfully!')
      }
    } catch (err) {
      console.error('Upload failed', err)
      toast.error('Failed to upload full image 2')
    }
  }

  const handleFullImage2Delete = async () => {
    const fullImage2Url = editingCaseStudy.fullImage2Url
    if (!fullImage2Url) return
    const url = new URL(fullImage2Url)
    const Key = decodeURIComponent(url.pathname.slice(1))
    const Bucket = 'moondive-bucket-s3'
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/remove-open-graph-image`, {
        Bucket,
        Key,
      })
      handleFormChange('fullImage2Url', '')
      if (fullImage2InputRef.current) {
        fullImage2InputRef.current.value = ''
      }
      toast.success('Full image 2 deleted successfully')
    } catch (err) {
      console.error('Delete failed', err)
      toast.error('Failed to delete full image 2')
    }
  }
  const handleImageUpload = async (e) => {
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
        handleFormChange('imageUrl', uploadedUrl)
        toast.success('Image uploaded successfully!')
      }
    } catch (err) {
      console.error('Upload failed', err)
      toast.error('Failed to upload image')
    }
  }

  const handleImageDelete = async () => {
    const imageUrl = editingCaseStudy.imageUrl
    if (!imageUrl) return

    const url = new URL(imageUrl)
    const Key = decodeURIComponent(url.pathname.slice(1))
    const Bucket = 'moondive-bucket-s3'

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/remove-open-graph-image`, {
        Bucket,
        Key,
      })
      handleFormChange('imageUrl', '')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      toast.success('Image deleted successfully')
    } catch (err) {
      console.error('Delete failed', err)
      toast.error('Failed to delete image')
    }
  }

  const handleTitleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('files', file)
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/upload-open-graph-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log('res', res)
      const uploadedUrl = res.data?.data?.imageUrls?.[0]
      if (uploadedUrl) {
        handleFormChange('titleImageUrl', uploadedUrl)
        toast.success('Title image uploaded successfully!')
      }
    } catch (err) {
      console.error('Upload failed', err)
      toast.error('Failed to upload title image')
    }
  }
  const handleTitleImageDelete = async () => {
    const titleImageUrl = editingCaseStudy.titleImageUrl
    if (!titleImageUrl) return
    const url = new URL(titleImageUrl)
    const Key = decodeURIComponent(url.pathname.slice(1))
    const Bucket = 'moondive-bucket-s3'
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/remove-open-graph-image`, {
        Bucket,
        Key,
      })
      handleFormChange('titleImageUrl', '')
      if (titleImageInputRef.current) {
        titleImageInputRef.current.value = ''
      }
      toast.success('Title image deleted successfully')
    } catch (err) {
      console.error('Delete failed', err)
      toast.error('Failed to delete title image')
    }
  }
  const handleTestimonialImageUpload = async (e) => {
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
        const newTestimonial = {
          ...(editingCaseStudy.testimonial || {
            quote: '',
            author: '',
            position: '',
          }),
          image: uploadedUrl,
        }
        handleFormChange('testimonial', newTestimonial)
        toast.success('Testimonial author image uploaded successfully!')
      }
    } catch (err) {
      console.error('Upload failed', err)
      toast.error('Failed to upload testimonial author image')
    }
  }

  const handleTestimonialImageDelete = async () => {
    const testimonialImage = editingCaseStudy.testimonial?.image
    if (!testimonialImage) return
    const url = new URL(testimonialImage)
    const Key = decodeURIComponent(url.pathname.slice(1))
    const Bucket = 'moondive-bucket-s3'
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/remove-open-graph-image`, {
        Bucket,
        Key,
      })
      const newTestimonial = {
        ...editingCaseStudy.testimonial,
        image: '',
      }
      handleFormChange('testimonial', newTestimonial)
      if (testimonialImageInputRef.current) {
        testimonialImageInputRef.current.value = ''
      }
      toast.success('Testimonial author image deleted successfully')
    } catch (err) {
      console.error('Delete failed', err)
      toast.error('Failed to delete testimonial author image')
    }
  }

  // 6. Add solution image upload/delete handlers
  const handleSolutionImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploadingSolutionImage(true)

    const formData = new FormData()
    formData.append('files', file)

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/upload-open-graph-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const uploadedUrl = res.data?.data?.imageUrls?.[0]
      if (uploadedUrl) {
        const updatedSolutionSection = {
          ...editingCaseStudy.solutionSection,
          imageUrl: uploadedUrl,
        }
        handleFormChange('solutionSection', updatedSolutionSection)
        toast.success('Solution image uploaded successfully!')
      }
    } catch (err) {
      console.error('Upload failed', err)
      toast.error('Failed to upload solution image')
    } finally {
      setIsUploadingSolutionImage(false)
    }
  }

  const handleSolutionImageDelete = async () => {
    const imageUrl = editingCaseStudy.solutionSection?.imageUrl
    if (!imageUrl) return

    const url = new URL(imageUrl)
    const Key = decodeURIComponent(url.pathname.slice(1))
    const Bucket = 'moondive-bucket-s3'

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/remove-open-graph-image`, {
        Bucket,
        Key,
      })

      const updatedSolutionSection = {
        ...editingCaseStudy.solutionSection,
        imageUrl: '',
      }
      handleFormChange('solutionSection', updatedSolutionSection)

      if (solutionImageInputRef.current) {
        solutionImageInputRef.current.value = ''
      }
      toast.success('Solution image deleted successfully')
    } catch (err) {
      console.error('Delete failed', err)
      toast.error('Failed to delete solution image')
    }
  }

  const handleChallengeImageDelete = async () => {
    const imageUrl = editingCaseStudy.challengeSection?.imageUrl
    if (!imageUrl) return

    const url = new URL(imageUrl)
    const Key = decodeURIComponent(url.pathname.slice(1))
    const Bucket = 'moondive-bucket-s3'

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/remove-open-graph-image`, {
        Bucket,
        Key,
      })

      const updatedChallengeSection = {
        ...editingCaseStudy.challengeSection,
        imageUrl: '',
      }
      handleFormChange('challengeSection', updatedChallengeSection)

      if (challengeImageInputRef.current) {
        challengeImageInputRef.current.value = ''
      }
      toast.success('Challenge image deleted successfully')
    } catch (err) {
      console.error('Delete failed', err)
      toast.error('Failed to delete challenge image')
    }
  }

   const handleStatusChange = async (Id, study, newStatus) => {
      try {
         const editingCaseStudy = {
      ...study,    
      status: newStatus, 
    };
    console.log(editingCaseStudy)
        const response = await axios.put(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/edit-case-study/${Id}`, {
          editingCaseStudy,
        })
        await fetchCaseStudies()
        toast.success(
          `Page ${newStatus === 'published' ? 'published' : 'saved as draft'} successfully`
        )
      } catch (error) {
        console.error(error)
         const message =
          error.response?.data?.details[0] ||
          `Failed to ${
            newStatus === 'published' ? 'publish' : 'save as draft'
          } page`;

        toast.error(message);
      }
    }

const confirmGenerateCaseStudy = async () => {
  if (!selectedFile) return;

  try {
    setUploading(true);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/generate-case-study`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    setLoading(false);
    if (response) {
      toast.success('Case study generated successfully!');
      await fetchCaseStudies();
    } else {
      toast.error('Failed to generate case study');
    }
  } catch (error) {
    setLoading(false);
    console.error('Error generating case study:', error);
    toast.error('Something went wrong while generating the case study');
  } finally {
    setUploading(false);
    setSelectedFile(null);
    setShowGenerationConfirmModal(false);
  }
};


const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file');
      return;
    }

    setSelectedFile(file);
    setShowGenerationConfirmModal(true);

    try {
      await confirmGenerateCaseStudy()
    } catch (error) {
      setLoading(false)
      console.error('Error generating case study:', error);
      toast.error('Something went wrong while generating the case study');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleGenerateCaseStudy = async () => {
    fileInputRef.current?.click();
  };


  const handleFullImage1Upload = async (e) => {
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
        handleFormChange('fullImage1Url', uploadedUrl)
        toast.success('Full image 1 uploaded successfully!')
      }
    } catch (err) {
      console.error('Upload failed', err)
      toast.error('Failed to upload full image 1')
    }
  }

  if(fetchingCasestudies){
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
    <div className="flex h-screen bg-transparent relative max-w-[80vw]">
      <main className="flex-1 overflow-hidden p-4">
        <div className="">
          <div className="mb-8 flex w-full flex-col sm:flex-row sm:items-center sm:justify-between">
            <h4 className="text-primaryText">
              {TEXT_CASE_STUDIES}
            </h4>
            <button
              onClick={handleGenerateCaseStudy}
              className="flex item-center rounded-full bg-primary px-3 py-2 text-white transition-colors mr-4"
            >
              <span className='text-xs'>Generate Case Study</span>
            </button>
             <input
              type="file"
              ref={fileInputRef} 
              accept=".pdf, .txt" 
              style={{ display: "none" }} 
              onChange={handleFileSelect} 
            />
            <button
              onClick={handleAddNew}
              className="flex items-center rounded-full bg-primary px-3 py-2 text-white transition-colors"
            >
              <span className='text-xs flex items-center'><Plus className="mr-2 h-4 w-4" /> {TEXT_ADD_NEW_CASE_STUDIES}</span>
            </button>
          </div>

          <div className="flex h-full w-full flex-col rounded-lg bg-transparent shadow-sm border border-gray-300 ">
            <div className="border-b p-4 flex justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                  size={12}
                />
                <input
                  type="text"
                  placeholder="Search case studies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-gray-300 py-2 text-xs pl-10 pr-2 focus:outline-none focus:ring-1 focus:ring-primary text-black"
                />
              </div>
                 <FilterDropdown
                  label="Filter"
                  value={selectedFilter}
                  options={[
                    { label: "All", value: "" },
                    { label: "Published", value: "published" },
                    { label: "Draft", value: "draft" },
                  ]}
                  onChange={(v) => setSelectedFilter(v)}
                />
            </div>

            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-transparent">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {TEXT_TITTLE}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {TEXT_CLIENT}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {TEXT_INDUSTRY}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {TEXT_CATEGORY}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {TEXT_PUBLISHED}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {TEXT_ACTIONS}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-transparent">
                  {filteredCaseStudies?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        {searchQuery && (
                          <span className="text-black">Try a different search term.</span>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredCaseStudies?.map((study) => (
                      <tr key={study._id}>
                        <td className="line-clamp-1 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap px-6 py-4 font-medium text-primaryText">
                          {study.title}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-primaryText">
                          {study.client}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex rounded-full bg-primary/80 border border-primary px-2 text-xs font-semibold leading-5 text-white">
                            {study.industry}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex rounded-full bg-white border border-primary px-2 text-xs font-semibold leading-5 text-primary">
                            {study.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-primaryText">
                          {new Date(study.publishedDate)
                            .toLocaleDateString('en-GB')
                            .split('/')
                            .join('-')}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              className="rounded-full p-1 hover:bg-gray-100"
                              onClick={() =>
                                window.open(`https://moondive.co/case-study/${study.slug}`, '_blank')
                              }
                              title='View Case Study'
                            >
                              <Eye className="h-4 w-4 text-primaryText" />
                            </button>
                            <button
                              className="rounded-full p-1 text-primaryText "
                              onClick={() => handleEdit(study)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                                className={`rounded-full p-1 hover:bg-gray-50 ${study.status === 'published'
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                                  }`}
                                onClick={() =>
                                  handleStatusChange(
                                    study._id,
                                    study,
                                    study.status === 'published' ? 'draft' : 'published'
                                  )
                                }
                                title={
                                  study.status === 'published'
                                    ? 'Move to Draft'
                                    : 'Publish'
                                }
                              >
                                {study.status === 'published' ? (
                                  <FileText className="h-4 w-4" />
                                ) : (
                                  <Globe className="h-4 w-4" />
                                )}
                              </button>
                            <button
                              className="rounded-full p-1 text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(study._id)}
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
            </div>
          </div>
        </div>
      </main>

      {editingCaseStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm bg-opacity-50">

          <div className="max-h-[90vh] hide-scrollbar w-full max-w-6xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="relative border-b p-6">
              <h2 className="text-xl font-semibold text-black">
                {formMode === 'create'
                  ? 'Create New Case Study'
                  : 'Edit Case Study'}
              </h2>
              <p className="mt-1  text-black">
                Fill in the details below to
                {formMode === 'create' ? 'create a new' : 'update this'} case
                study.
              </p>
              <div
                onClick={() => setEditingCaseStudy(null)}
                className="absolute right-4 top-4 cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-10 w-10" />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="mb-4 overflow-x-auto border-b">
                  <div className="flex min-w-max flex-nowrap">
                    {[
                      'basic',
                      'content',
                      'challenges',
                      'media',
                      'layout',
                      'cta',
                    ].map((tab,index) => (
                      <button
                        key={index}
                        type="button"
                        className={`whitespace-nowrap px-6 py-2 text-center font-medium ${activeTab === tab
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-gray-500'
                          }`}
                        onClick={() => {
                          const tabOrder = [
                            'basic',
                            'content',
                            'challenges',
                            'media',
                            'layout',
                            'cta',
                          ]
                          const currentIndex = tabOrder.indexOf(activeTab)
                          const targetIndex = tabOrder.indexOf(tab)

                          if (targetIndex > currentIndex) {
                            const fields = REQUIRED_FIELDS[activeTab] || []
                            const missing = fields.filter((field) => {
                              const value = editingCaseStudy?.[field]
                              return (
                                !value ||
                                (Array.isArray(value) && value.length === 0)
                              )
                            })

                            if (missing.length) {
                              toast.error(
                                'Please complete this section before continuing.'
                              )
                              return
                            }
                          }

                          setActiveTab(tab)
                        }}
                      >
                        {tab === 'basic'
                          ? 'Basic Info'
                          : tab === 'content'
                            ? 'Content & Solutions'
                            : tab === 'challenges'
                              ? 'Challenges'
                              : tab === 'media'
                                ? 'Media & Testimonial'
                                : tab === 'layout'
                                  ? 'Layout & Sections'
                                  : 'Customization Section'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <BasicTab  editingCaseStudy={editingCaseStudy}
                            handleFormChange={handleFormChange}
                            // quillRef={quillRef}
                            quillModules={quillModules}
                            quillFormats={quillFormats} />
                )}

                {/* Content & Solutions Tab */}
                {activeTab === 'content' && (
                  <ContentTab  editingCaseStudy={editingCaseStudy} 
                              handleFormChange={handleFormChange} 
                              handleSolutionImageDelete={handleSolutionImageDelete}
                              handleSolutionImageUpload={handleSolutionImageUpload}
                              solutionImageInputRef={solutionImageInputRef}
                              isUploadingSolutionImage={isUploadingSolutionImage}
                              addSolutionItem={addSolutionItem}
                              removeSolutionItem={removeSolutionItem}
                              updateSolutionItem={updateSolutionItem}
                              // quillRef={quillRef}
                              quillModules={quillModules}
                              quillFormats={quillFormats} />
                )}

                {/* Challenges Tab */}
                {activeTab === 'challenges' && (
                  <ChallengesTab editingCaseStudy={editingCaseStudy}
                                handleFormChange={handleFormChange}
                                handleChallengeImageUpload={handleChallengeImageUpload}
                                challengeImageInputRef={challengeImageInputRef}
                                isUploadingChallengeImage={isUploadingChallengeImage}
                                addChallengeItem={addChallengeItem}
                                updateChallengeItem={updateChallengeItem}
                                handleChallengeImageDelete={handleChallengeImageDelete} />
                )}

                {/* Media & Testimonial Tab */}
                {activeTab === 'media' && (
                  <MediaTab   fileInputRef={fileInputRef}
                            handleImageUpload={handleImageUpload}
                            editingCaseStudy={editingCaseStudy}
                            handleImageDelete={handleImageDelete}
                            titleImageInputRef={titleImageInputRef}
                            handleTitleImageUpload={handleTitleImageUpload}
                            handleTitleImageDelete={handleTitleImageDelete}
                            fullImage1InputRef={fullImage1InputRef}
                            handleFullImage1Upload={handleFullImage1Upload}
                            handleFullImage1Delete={handleFullImage1Delete}
                            fullImage2InputRef={fullImage2InputRef}
                            handleFullImage2Upload={handleFullImage2Upload}
                            handleFullImage2Delete={handleFullImage2Delete}
                            handleFormChange={handleFormChange}
                            selectedTechnologyCategory={selectedTechnologyCategory}
                            setSelectedTechnologyCategory={setSelectedTechnologyCategory}
                            // quillRef={quillRef}
                            quillModules={quillModules}
                            quillFormats={quillFormats}
                            testimonialImageInputRef={testimonialImageInputRef}
                            handleTestimonialImageUpload={handleTestimonialImageUpload}
                            handleTestimonialImageDelete={handleTestimonialImageDelete}
                            TECHNOLOGY_CATEGORIES={TECHNOLOGY_CATEGORIES} />
                )}
                {/* Layout & Sections Tab */}
                {activeTab === 'layout' && (
                  <LayoutTab 
                      editingCaseStudy={editingCaseStudy}
                      moveSectionUp={moveSectionUp}
                      moveSectionDown={moveSectionDown}
                      toggleSection={toggleSection}
                      AVAILABLE_SECTIONS={AVAILABLE_SECTIONS} />
                )}

                {activeTab === 'cta' && (
                  <CtaTab 
                  editingCaseStudy={editingCaseStudy}
                  setEditingCaseStudy={setEditingCaseStudy}
                  />
                )}
              </div>
              <div className="flex justify-end space-x-4 border-t bg-gray-50 p-6">
                {activeTab !== 'basic' && (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="rounded-md bg-white border border-primary px-4 py-2 text-sm font-medium  shadow-sm  text-primary"
                  >
                    Previous
                  </button>
                )}
                {activeTab !== 'cta' ? (
                  <button
                    type="button"
                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm"
                    onClick={handleNextStep}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                  >
                    {formMode === 'create'
                      ? 'Create Case Study'
                      : 'Update Case Study'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b p-6">
              <h2 className="text-xl font-semibold">Confirm Deletion</h2>
              <p className="mt-1 text-gray-500">
                Are you sure you want to delete this case study? This action
                cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-4 p-6">
              <button
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed -inset-10 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white text-lg font-medium">Generating content...</p>
        </div>
      )}

      {showGenerationConfirmModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">
        Confirm Case Study Generation
      </h2>
      <p className="text-gray-600 mb-6">
        Are you sure you want to generate a case study from the uploaded PDF? 
        This may take a few moments.
      </p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setShowConfirmModal(false);
            setSelectedFile(null);
          }}
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={confirmGenerateCaseStudy}
          disabled={uploading}
          className={`px-4 py-2 rounded-md text-white ${
            uploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Generating...' : 'Yes, Generate'}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  )
}

export default ManageCaseStudies
