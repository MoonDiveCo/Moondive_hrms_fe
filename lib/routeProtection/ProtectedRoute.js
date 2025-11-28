"use client";

import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { RBACContext } from "./RBACContext";
import { redirect } from "next/navigation";

export default function ProtectedRoute({ module, children }) {
  const { isSignedIn } = useContext(AuthContext);
  const { canAccessModule } = useContext(RBACContext);

  if (!isSignedIn) return redirect("/login");
  if (!canAccessModule(module)) return redirect("/unauthorized");

  return children;
}
