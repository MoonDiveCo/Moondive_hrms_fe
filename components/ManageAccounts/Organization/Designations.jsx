'use client'
import { useState,useEffect } from "react";
import axios from "axios";



export default function Designations(){
    const [designations,setDesignations]=useState(null)

    useEffect(()=>{
        const fetchDesignation=async()=>{
            try{
                const res=await axios.get("/hrms/organization/get-alldesignation")
                console.log("----------------",res?.data?.result)
            }catch(err){
                console.log("error while fetching designation data",err)
            }
        }
        fetchDesignation()
    },[])
    return <div>Designations Component</div>;
}