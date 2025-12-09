import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";
import { MenuProvider } from "@/constants/Sidebar";

export default function CRMLayout({ children }) {
  return (
      <div>
        <MenuProvider>
           {children}
             </MenuProvider>
      </div>
    
    // <div><ProtectedRoute module="CRM">
    //           </ProtectedRoute> 
    // </div>
  );
}