'use client'
import { useState, useEffect } from "react"
import axios from "axios"
import Image from "next/image"

const page = () => {
    const [organization, setOrganization] = useState()
    const [modified, setModified] = useState(false)
    const [error, setError] = useState(null)
    const [hovered, setHovered] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        try {
            const fetchData = async () => {
                const res = await axios.get('hrms/organization/view-organization')
                setOrganization(res.data.result)
            }
            fetchData()
        } catch (err) {
            setError(err)
            console.error("error in organization-setup while fetching organization data", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        console.log("==============================", organization)
    }, [organization])

    const handleChange = (e) => {
        if(!modified){
            setModified(true)
        }
        setOrganization((prev) => ({ ...prev, [e.target.value]: e.target.name }))
    }

    const handleLogoChange=async(e)=>{
        const imageFile=e.target.files[0]
        const formData=new FormData()
        formData.append('logoImage',imageFile)
        try{
            const {data}=await axios.post('hrms/organization/aws-Logo',formData)
            if(data){
                const newLogoUrl=data?.result?.logoUrl
                if(!modified){
                    setModified(true)
                }
                setOrganization(prev=>({...prev,['logoUrl']:newLogoUrl}))
            }
        }catch(err){
            console.log("error while changing organization logo",err)

        }
    }

    const handleSubmit=async(e)=>{

    }



    return (
        <div className="w-220">
            <div className="bg-white h-full rounded-2xl border-[0.3px] border-[#D0D5DD] p-4 ">
                {
                    loading ? (
                        <div>
                            Loading
                        </div>
                    ) : (
                        <div className="w-full mx-1 p-4">
                            <h4 className="text-sm font-bold mb-4">Basic Organization Details</h4>

                            <form className="border-[0.3px] border-[#D0D5DD] w-full p-4">
                                <div className="relative inline-block">
                                    <div
                                        className="relative w-30 h-30 rounded-sm overflow-hidden cursor-pointer bg-gray-200"
                                        onMouseEnter={() => setHovered(true)}
                                        onMouseLeave={() => setHovered(false)}
                                    >
                                    <div>Logo</div>
                                    <img
                                    src={organization?.logoUrl || '/placeholder-logo.png'}
                                    alt="Organization logo"
                                    className="object-cover w-full h-full"
                                    />
                                        <div className={`
                                            absolute inset-0 bg-black/20 flex items-center justify-center  // Changed: bg-black/20 for subtle dark tint (not full gray)
                                            transition-opacity duration-200 ease-in-out
                                            ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                                        `}>
                                            <label
                                                htmlFor="logo-upload"
                                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 cursor-pointer"
                                            >
                                                Edit
                                            </label>
                                        </div>
                                    </div>
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        name="logo"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        defaultValue={organization?.name || ''}
                                        required
                                        className="w-full p-2 border rounded"
                                        onChange={handleChange}  // If you need controlled for this field
                                    />
                                </div>
                            </form>

                           {modified?( 
                                <div className="flex justify-end m-2">
                                    <button className="mx-1 p-2 px-3 bg-primary rounded-sm">save</button>
                                    <button className="mx-1 p-2 px-3 bg-primary rounded-sm">reset</button>
                                </div>
                            ):null}
                        </div>
                    )

                }

            </div>
        </div>
    )
}

export default page