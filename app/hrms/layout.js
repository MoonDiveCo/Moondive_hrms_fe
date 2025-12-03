import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";

export default function HRMSLayout({ children }) {
  return (
      <div>
        
           <ProtectedRoute module="HRMS">
            {children}
            </ProtectedRoute> 
      </div>
  );
}