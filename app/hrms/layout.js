import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";

export default function HRMSLayout({ children }) {
  return (
    <html lang="en">
      <body>
           <ProtectedRoute module="HRMS">
            {children}
            </ProtectedRoute> 
      </body>
    </html>
  );
}