"use client"
import AppLayout from "@/components/Dashboard/AppLayout";
import React from "react";

export default function CRMDashboardLayout({ children }) {
  return <AppLayout module="crm">{children}</AppLayout>;
}
  