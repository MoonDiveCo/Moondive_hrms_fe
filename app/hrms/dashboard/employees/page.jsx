"use client";

import SubModuleProtectedRoute from "@/lib/routeProtection/SubModuleProtectedRoute";

export default function Employees() {
  return (
    <SubModuleProtectedRoute requiredPermissionPrefixes={["HRMS:HR"]}>
      <div>
        <h1>Employees</h1>
      </div>
    </SubModuleProtectedRoute>
  );
}
