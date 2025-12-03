"use client"
import AppLayout from "@/components/Dashboard/AppLayout";
import { usePathname } from "next/navigation";
import React from "react";
export default function DashboardLayout({ children }) {
  const pathname = usePathname() 
       const isHrms = pathname.startsWith('/hrms');
     const isCrm  = pathname.startsWith('/crm') 
     const isCms  = pathname.startsWith('/cms') 
 
  return <AppLayout isHrms={isHrms} isCms={isCms} isCrm={isCrm}>{children}</AppLayout>;
}
