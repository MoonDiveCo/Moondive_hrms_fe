import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";
import { MenuProvider } from "@/constants/Sidebar";

export default function HRMSLayout({ children }) {
  return (
      <div>
        <MenuProvider>{children}</MenuProvider>
            
           {/* <ProtectedRoute module="HRMS">
            </ProtectedRoute>  */}
      </div>
  );
}