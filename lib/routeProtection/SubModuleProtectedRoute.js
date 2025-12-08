"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/authContext";
import { RBACContext } from "@/context/rbacContext";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function SubModuleProtectedRoute({
  children,
  requiredPermissionPrefixes = [],   
  redirectTo = "/unauthorized",
}) {
  const router = useRouter();
  const { isSignedIn, loading: authLoading } = useContext(AuthContext);
  const { rbacLoading, canAccessSubmodule,submodules  } = useContext(RBACContext);

  useEffect(() => {
    if (authLoading || rbacLoading) return;
    if (!isSignedIn) {
      router.replace("/login");
      return;
    }
     if (submodules.includes("*")) {
      return;
    }
    const hasAccess = requiredPermissionPrefixes.some((prefix) =>
      canAccessSubmodule(prefix.toUpperCase())
    );

    if (!hasAccess) {
      router.replace(redirectTo);
      return null
    }
  }, [
    authLoading,
    rbacLoading,
    isSignedIn,
    requiredPermissionPrefixes,
    redirectTo,
    router,
    canAccessSubmodule,
  ]);
  if (authLoading || rbacLoading)
    return(
    <div className='flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: 'center' }} 
        />
      </div>
  )

  return <>{children}</>;
}
