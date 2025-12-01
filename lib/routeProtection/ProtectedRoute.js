"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/authContext";
import { RBACContext } from "@/context/rbacContext";
import { redirect, usePathname } from "next/navigation";


export default function ProtectedRoute({ module, submodule, children }) {
  const { isSignedIn } = useContext(AuthContext);
  const { canAccessModule, canAccessSubmodule  } = useContext(RBACContext);
  const path = usePathname()
  const basePath = path.split('/')[1]

  if (path === `/${basePath}/login`) {
    return children;  
  }

  if (!isSignedIn) return redirect(`/${basePath}/login`);
  if (module && !canAccessModule(module)) return redirect("/unauthorized");
  if (submodule && !canAccessSubmodule(submodule)) return redirect("/unauthorized");

  return children;
}
