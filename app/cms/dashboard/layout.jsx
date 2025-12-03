import AppLayout from "@/components/Dashboard/AppLayout";
import { MenuProvider } from "@/constants/Sidebar";
import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";

export default function CMSDashboardLayout({ children }) {
  return (
    <div>
        <AppLayout module="cms">
          {children}
          </AppLayout> 
    </div>
  );
}