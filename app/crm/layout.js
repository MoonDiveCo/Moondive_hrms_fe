import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";
import { MenuProvider } from "@/constants/Sidebar";

export default function CRMLayout({ children }) {
  return (
      
    
    <div><ProtectedRoute module="CRM">
      <MenuProvider>
           {children}
             </MenuProvider>
              </ProtectedRoute> 
    </div>
  );
}