'use client'
import { useState, useEffect, useContext, } from "react"
import axios from "axios"
import Image from "next/image"
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { AuthContext } from "@/context/authContext";

export default function OrganizationDetails() {
  const [organization, setOrganization] = useState(null)
  const [modified, setModified] = useState(false)
  const [error, setError] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [logoPreview, setLogoPreview] = useState(null)
  const {allUserPermissions}=useContext(AuthContext)
  const [hasEditPermissions,setHasEditPermissions]=useState(false)
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:2000/api/v1/hrms/organization/view-organization', {withCredentials: true})
        const orgData = res.data.result
        if(allUserPermissions.includes("HRMS:ORGANIZATION:EDIT")){
          setHasEditPermissions(true)
        }
        setOrganization(orgData)
        setLogoPreview(orgData?.logoUrl || null)
      } catch (err) {
        setError(err.message || 'Failed to load data')
        console.error("error in organization-setup while fetching organization data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])


  const handleTopLevelChange = (e) => {
    const { name, value } = e.target
    if (!modified) {
      setModified(true)
    }
    setOrganization((prev) => ({ ...prev, [name]: value }))
  }

  const handleContactChange = (field, value) => {
    if (!modified) {
      setModified(true)
    }
    setOrganization((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }))
  }

  const handleAddressChange = (field, value) => {
    if (!modified) {
      setModified(true)
    }
    setOrganization((prev) => ({
      ...prev,
      addresses: [{
        ...prev.addresses?.[0] || {},
        [field]: value
      }]
    }))
  }

  const handleLogoChange = async (e) => {
    const imageFile = e.target.files[0]
    if (!imageFile) return

    const formData = new FormData()
    formData.append('logoImage', imageFile)
    try {
      const { data } = await axios.post('hrms/organization/aws-Logo', formData)
      if (data?.result?.logoUrl) {
        const newLogoUrl = data.result.logoUrl
        if (!modified) {
          setModified(true)
        }
        setOrganization((prev) => ({ ...prev, logoUrl: newLogoUrl }))
        setLogoPreview(newLogoUrl)
      }
    } catch (err) {
      console.error("error while changing organization logo", err)
      setError('Failed to upload logo')
    }
  }


  const handleContactPersonChange = (e) => {
    const fullName = e.target.value
    const parts = fullName.trim().split(' ')
    const firstName = parts[0] || ''
    const lastName = parts.slice(1).join(' ') || ''

    if (!modified) {
      setModified(true)
    }

    setOrganization((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        firstName,
        lastName
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!modified) return

    const payload = {
      name: organization.name,
      website: organization.website,
      industry: organization.industry,
      about: organization.about,
      logoUrl: organization.logoUrl,
      contact: organization.contact,
      addresses: organization.addresses
    }

    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === null) {
        delete payload[key]
      }
    })

    try {
      await axios.put('hrms/organization/update-organization', payload, {
        headers: { 'Content-Type': 'application/json' }
      })
      setModified(false)
    } catch (err) {
      console.log('Update error:', err)
      setError('Failed to update organization')
    }
  }

  const handleReset = () => {
    window.location.reload()
  }

    if(loading){
        return(
          <div className='absolute inset-0 z-20 flex items-center justify-center bg-white backdrop-blur-sm rounded-2xl'>
            <DotLottieReact
              src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
              loop
              autoplay
              style={{ width: 100, height: 100, alignItems: 'center' }} 
            />
          </div>
        )
      }



  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  const addr = organization?.addresses?.[0] || {}
  const contact = organization?.contact || {}
  const contactPersonFullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim()

  return (
    <div className="w-full w-100">
      <div className="bg-white h-full rounded-2xl border-[0.3px] border-[#D0D5DD] p-4">
        <div className="w-full mx-1 p-4">
          <div className="flex flex-row justify-between items-center my-3">
            <h4 className="text-sm font-bold">Basic Organization Details</h4>
            <div className="flex justify-center items-center space-x-4">
              <button
                type="button"
                disabled={ !modified }
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={ !modified }
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border-[0.3px] border-[#D0D5DD] w-full p-4 space-y-4">
            <div className="flex flex-col items-start">
              <label className="mb-2 text-sm font-medium">Organization Logo</label>
              <div className="relative inline-block">
                <div
                  className="relative w-16 h-16 rounded border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Organization logo"
                      
                      fill
                      className="object-cover rounded"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  <div
                    className={`
                      absolute inset-0 bg-black/20 flex items-center justify-center rounded
                      transition-opacity duration-200 ease-in-out
                      ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    `}
                  >
                    <label
                      htmlFor="logo-upload"
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600 cursor-pointer"
                    >
                      Edit
                    </label>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Upload Image</p>
              <input
                id="logo-upload"
                type="file"
                name="logo"
                accept="image/*"
                className="hidden"
                disabled={!hasEditPermissions}
                onChange={handleLogoChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  disabled={!hasEditPermissions}
                  value={organization?.name || ''}
                  onChange={handleTopLevelChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded bg-transparent outline-none focus:border-orange-400  focus:ring-orange-400"
                />
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  disabled={!hasEditPermissions}
                  type="url"
                  id="website"
                  name="website"
                  value={organization?.website || ''}
                  onChange={handleTopLevelChange}
                  className="w-full p-2 border border-gray-300 rounded bg-transparent outline-none focus:border-orange-400  focus:ring-orange-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  disabled={!hasEditPermissions}
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={contactPersonFullName}
                  onChange={handleContactPersonChange}
                  className="w-full p-2 border border-gray-300 rounded bg-transparent outline-none focus:border-orange-400  focus:ring-orange-400"
                />
              </div>
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  disabled={!hasEditPermissions}
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={contact.mobileNumber || ''}
                  onChange={(e) => handleContactChange('mobileNumber', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-transparent outline-none focus:border-orange-400  focus:ring-orange-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                <input
                  disabled={!hasEditPermissions}
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={contact.email || ''}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded bg-transparent outline-none focus:border-orange-400 focus:ring-orange-400"
                />
              </div>
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  id="industry"
                  name="industry"
                  value={organization?.industry || ''}
                  disabled={!hasEditPermissions}
                  onChange={handleTopLevelChange}
                  className="w-full p-2 border border-gray-300 rounded bg-transparent outline-none focus:border-orange-400  focus:ring-orange-400"
                >
                  <option value="">Select Industry</option>
                  <option value="IT">IT</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Address</label>
              <div className="space-y-2">
                <div>
                  <label htmlFor="address1" className="block text-sm text-gray-500 mb-1">Address 1</label>
                  <input
                    disabled={!hasEditPermissions}
                    type="text"
                    id="address1"
                    placeholder="Address 1"
                    value={addr.addressLabel || ''}
                    onChange={(e) => handleAddressChange('addressLabel', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-transparent outline-none focus:border-orange-400  focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label htmlFor="address2" className="block text-sm text-gray-500 mb-1">Address 2</label>
                  <input
                    disabled={!hasEditPermissions}
                    type="text"
                    id="address2"
                    placeholder="Address 2"
                    value={addr.description || ''}
                    onChange={(e) => handleAddressChange('description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-transparent outline-none focus:border-orange-400  focus:ring-orange-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className="block text-sm text-gray-500 mb-1">State</label>
                    <select
                      id="state"
                      name="state"
                      disabled={!hasEditPermissions}
                      value={addr.state || ''}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded bg-transparent outline-none focus:border-orange-400  focus:ring-orange-400"
                    >
                      <option value="">Select State</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Gurugram">Gurugram</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm text-gray-500 mb-1">Country</label>
                    <select
                      id="country"
                      name="country"
                      disabled={!hasEditPermissions}
                      value={addr.country || 'India'}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded bg-transparent outline-none focus:border-orange-400  focus:ring-orange-400"
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm text-gray-500 mb-1">City</label>
                    <input
                      disabled={!hasEditPermissions}
                      type="text"
                      id="city"
                      value={addr.city || ''}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded bg-transparent outline-none focus:border-orange-400  focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="zip" className="block text-sm text-gray-500 mb-1">ZIP/PIN Code</label>
                    <input
                      disabled={!hasEditPermissions}
                      type="text"
                      id="zip"
                      placeholder="ZIP/PIN Code"
                      value={addr.postalCode || ''}
                      onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded bg-transparent outline-none focus:border-orange-400  focus:ring-orange-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">About</label>
              <textarea
                disabled={!hasEditPermissions}
                id="about"
                name="about"
                rows={3}
                value={organization?.about || ''}
                onChange={handleTopLevelChange}
                className="w-full p-2 border border-gray-300 rounded bg-transparent outline-none focus:border-orange-400  focus:ring-orange-400"
              />
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
