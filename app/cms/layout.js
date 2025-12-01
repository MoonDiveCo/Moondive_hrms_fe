import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";

export default function CMSLayout({ children }) {
  return (
    <html lang="en">
      <body>
           <ProtectedRoute module="CMS">{children}</ProtectedRoute> 
      </body>
    </html>
  );
}