import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";

export default function HRMSLayout({ children }) {
  return (
      <div>
            {children}
           {/* <ProtectedRoute module="HRMS">
            </ProtectedRoute>  */}
      </div>
  );
}