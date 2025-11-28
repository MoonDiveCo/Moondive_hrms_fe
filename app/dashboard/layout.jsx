// app/dashboard/layout.jsx
import AppLayout from "@/components/Dashboard/AppLayout";
import React from "react";

export default function DashboardLayout({ children }) {
  // This file is used by Next.js App Router to wrap all /dashboard routes
  return <AppLayout>{children}</AppLayout>;
}
