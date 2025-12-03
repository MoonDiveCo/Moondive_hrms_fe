"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/authContext";
import { RBACContext } from "@/context/rbacContext";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedRoute({ module, children }) {
  const { isSignedIn, loading } = useContext(AuthContext);
  const { canAccessModule, rbacLoading } = useContext(RBACContext);

  const router = useRouter();
  const path = usePathname();
  const basePath = path.split("/")[1];

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading || rbacLoading) return;

    const isLoginPage = path === `/${basePath}/login`;

    if (isLoginPage && isSignedIn) {
      router.replace(`/${basePath}/dashboard`);
      return;
    }

    if (isLoginPage && !isSignedIn) {
      setChecking(false);
      return;
    }

    if (!isSignedIn) {
      router.replace(`/${basePath}/login`);
      return;
    }

    if (module && !canAccessModule(module)) {
      router.replace("/unauthorized");
      return;
    }

    setChecking(false);
  }, [loading, isSignedIn, path, rbacLoading]);

   if (checking || loading || rbacLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }
  return children;
}
