'use client'

import { AuthContext } from "@/context/authContext";
import { redirect } from "next/navigation";
import { useContext } from "react";

export default function OverviewPage() {
  const {user} = useContext(AuthContext)

  if(!user.userRole.includes("SuperAdmin")){
    redirect("/hrms/dashboard/overview/myspace")
  }

  return (
    <div>
      overview
    </div>
  )
}