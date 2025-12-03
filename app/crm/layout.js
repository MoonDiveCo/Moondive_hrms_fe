import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";
import { MenuProvider } from "@/constants/Sidebar";

export default function CRMLayout({ children }) {
  return (
      <MenuProvider>
           {children}
             </MenuProvider>
    // <div><ProtectedRoute module="CRM">
    //           </ProtectedRoute>  
            
             
    // </div>
  );
}