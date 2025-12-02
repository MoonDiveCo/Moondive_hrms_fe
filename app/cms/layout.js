import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";

export default function CMSLayout({ children }) {
  return (
    <div>
        <ProtectedRoute module="CMS">{children}</ProtectedRoute> 
    </div>
  );
}