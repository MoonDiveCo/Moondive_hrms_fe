"use client";

import NestedAppLayout from "@/components/Dashboard/NestedAppLayout";
import { NotificationProvider } from "@/context/notificationcontext";
import SubModuleProtectedRoute from "@/lib/routeProtection/SubModuleProtectedRoute";
// import { NotificationProvider } from "@/context/NotificationContext";
import React from "react";

export default function LeaveTrackerLayout({ children }) {
  return (
    <NotificationProvider>
      <SubModuleProtectedRoute>
        {children}
      </SubModuleProtectedRoute>
    </NotificationProvider>
  );
}
