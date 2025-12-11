import AppLayout from "@/components/Dashboard/AppLayout";
import { MenuProvider } from "@/constants/Sidebar";
import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";

export default function CMSDashboardLayout({ children }) {
  return (
    <div className="w-[100%] max-w-full">
        <AppLayout module="cms" showMainNavbar={false} >
          {children}
          </AppLayout> 
    </div>
  );
}