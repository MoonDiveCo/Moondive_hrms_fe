import AppLayout from "@/components/Dashboard/AppLayout";
import React from "react";
// import { usePathname } from "next/navigation";
export default function DashboardLayout({ children }) {
  // const pathname = usePathname() 
    //    const isHrms = pathname.startsWith('/hrms');
    //  const isCrm  = pathname.startsWith('/crm') 
    //  const isCms  = pathname.startsWith('/cms') 
     
  return <AppLayout>{children}</AppLayout>;
}
