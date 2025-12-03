import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";
import { MenuProvider } from "@/constants/Sidebar";

export default function HRMSLayout({ children }) {
  return (
      <div>
         <ProtectedRoute module="HRMS">
 <MenuProvider>{children}</MenuProvider>
            </ProtectedRoute> 

      </div>
  );
}