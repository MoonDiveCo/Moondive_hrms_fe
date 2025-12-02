"use client";

import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/authContext";
import { RBACContext } from "@/context/rbacContext";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export default function ProtectedRoute({ module, children }) {
  const { isSignedIn, loading } = useContext(AuthContext);
  const { canAccessModule, rbacLoading } = useContext(RBACContext);

  const router = useRouter();
  const path = usePathname();
  const basePath = path.split("/")[1];

  useEffect(() => {
    if (loading || rbacLoading) return;

    if (path === `/${basePath}/login` && isSignedIn) {
      router.replace(`/${basePath}/dashboard`);
      return;
    }

    if ( !isSignedIn) {
      router.replace(`/${basePath}/login`);
      return;
    }

    if (module && !canAccessModule(module)) {
      router.replace("/unauthorized");
      return;
    }
  }, [loading, isSignedIn, path, rbacLoading]);

  if (loading || rbacLoading) return null;
  return children;
}
