import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";

export default function CRMLayout({ children }) {
  return (
    <html lang="en">
      <body>
           <ProtectedRoute module="CRM">{children}</ProtectedRoute> 
      </body>
    </html>
  );
}