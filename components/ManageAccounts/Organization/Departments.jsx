'use client'
import { useEffect,useState } from "react";
import axios from "axios";



export default function Departments(){
    const [departments,setDepartments]=useState(null)
    const [loading,setLoading]=useState(true)
    const [error,setError]=useState(null)

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
    },[])

    useEffect(()=>{
        if(departments) console.log("-------------------",departments)
    },[departments])


    if (loading) {
        return <div className="p-4">Loading...</div>
    }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

    return (
        <>
        
        </>
    );
}