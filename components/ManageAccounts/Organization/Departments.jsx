'use client'
import { useEffect,useState } from "react";
import axios from "axios";
import AddDepartmentModal from "./addDepartmentModal";


export default function Departments(){
    const [departments,setDepartments]=useState(null)
    const [loading,setLoading]=useState(true)
    const [error,setError]=useState(null)
    const [isVisible,setIsVisible]=useState(false)

    useEffect(()=>{
        const fetchData=async()=>{
            try{
                const res=await axios.get("hrms/organization/get-allDepartment")
                setDepartments(res?.data?.result)
            }catch(err){
                console.error("Error while fetching departments",err)
                setError(err)
            }finally{
                setLoading(false)
            }
        }
        fetchData()
    },)


    if (loading) {
        return <div className="p-4">Loading...</div>
    }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

return (
        <div className="w-full -z-10">
            <div className="bg-white h-full rounded-2xl border-[0.3px] border-[#D0D5DD] p-4">
                <div className="p-6 border-b border-gray-200 flex flex-row justify-between items-center">
                    <h4 className="text-lg font-semibold text-gray-900">Departments</h4>
                    <button 
                        onClick={()=>(setIsVisible(prev=>!prev))}
                        className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded hover:bg-orange-600 "
                        >
                            Add Department
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Head</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mail Alias</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Count</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {departments && departments.length > 0 ? (
                                departments.map((dept, index) => (
                                    <tr key={dept._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept?.parentDepartment?.name?dept.parentDepartment.name:"-"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(dept.departmentLead?.firstName +" "+ dept.departmentLead?.lastName )|| 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.mailAlias || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.employeeId?.length || 0}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No departments found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddDepartmentModal
                departments={departments}
                setDepartments={setDepartments}
                isVisible={isVisible}
                onClose={()=>setIsVisible(false)}
            />
        </div>
    );
}