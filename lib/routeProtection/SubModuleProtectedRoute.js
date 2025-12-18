"use client";

import { useContext, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthContext } from "@/context/authContext";
import { RBACContext } from "@/context/rbacContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useMenus } from "@/constants/Sidebar";

export default function SubModuleProtectedRoute({
  children,
  requiredPermissionPrefixes = [], 
  redirectTo = "/unauthorized",
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { isSignedIn, loading: authLoading } = useContext(AuthContext);
  const { rbacLoading, canAccessSubmodule, submodules } =
    useContext(RBACContext);

  const { routePermissionMap } = useMenus();
  console.log("Route Permission Map:", routePermissionMap);

  const resolvedPermissionPrefixes = useMemo(() => {
    if (requiredPermissionPrefixes.length > 0) {
      return requiredPermissionPrefixes;
    }

    const matchedRoute = Object.keys(routePermissionMap || {}).find(
      (route) =>
        pathname === route || pathname.startsWith(route + "/")
    );

    return matchedRoute ? routePermissionMap[matchedRoute] : [];
  }, [pathname, routePermissionMap, requiredPermissionPrefixes]);

  useEffect(() => {
    if (authLoading || rbacLoading) return;

    if (!isSignedIn) {
      router.replace("/login");
      return;
    }
    if (submodules?.includes("*")) {
      return;
    }

    if (!resolvedPermissionPrefixes.length) {
      router.replace(redirectTo);
      return;
    }

    const hasAccess = resolvedPermissionPrefixes.some((prefix) =>
      canAccessSubmodule(prefix.toUpperCase())
    );

    if (!hasAccess) {
      router.replace(redirectTo);
    }
  }, [
    authLoading,
    rbacLoading,
    isSignedIn,
    resolvedPermissionPrefixes,
    redirectTo,
    router,
    canAccessSubmodule,
    submodules,
  ]);

  if (authLoading || rbacLoading) {
    return (
      <div className="flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm">
        <DotLottieReact
          src="https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie"
          loop
          autoplay
          style={{ width: 100, height: 100 }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
