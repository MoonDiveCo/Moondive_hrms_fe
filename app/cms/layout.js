import { MenuProvider } from "@/constants/Sidebar";
import ProtectedRoute from "@/lib/routeProtection/ProtectedRoute";
import "quill/dist/quill.snow.css";

export default function CMSLayout({ children }) {
  return (
    <div>
        {/* <ProtectedRoute module="CMS"> */}
          <MenuProvider>
          {children}
          </MenuProvider>
          {/* </ProtectedRoute>  */}
    </div>
  );
}