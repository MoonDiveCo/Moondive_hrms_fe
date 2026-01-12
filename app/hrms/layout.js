"use client";
import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";
import { MenuProvider } from "@/constants/Sidebar";
import { NotificationProvider } from "@/context/notificationcontext";

export default function HRMSLayout({ children }) {
  return (
    <div>
      <ProtectedRoute module="HRMS">
        <NotificationProvider>
          <MenuProvider>{children}</MenuProvider>
        </NotificationProvider>
      </ProtectedRoute>
    </div>
  );
}