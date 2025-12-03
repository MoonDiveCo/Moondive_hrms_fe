import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";

export default function CRMLayout({ children }) {
  return (
    <div>
            <ProtectedRoute module="CRM">
           {children}
            </ProtectedRoute>  
             
    </div>
  );
}