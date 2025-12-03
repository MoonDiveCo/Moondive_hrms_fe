"use client"
import AppLayout from "@/components/Dashboard/AppLayout";
import React from "react";
export default function HRMSDashboardLayout({ children }) {
 
  return <AppLayout module = "hrms">{children}</AppLayout>;
}
