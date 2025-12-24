"use client";

import NestedAppLayout from "@/components/Dashboard/NestedAppLayout";
import SubModuleProtectedRoute from "@/lib/routeProtection/SubModuleProtectedRoute";
import React from "react";

export default function ManageAccountsLayout({ children }) {
  return (
  <SubModuleProtectedRoute >

      <NestedAppLayout>{children}</NestedAppLayout>
  </SubModuleProtectedRoute>)
}
