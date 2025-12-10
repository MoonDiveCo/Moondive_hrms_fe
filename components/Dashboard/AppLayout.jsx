"use client";
import React, { useContext, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MainNavbar from "./MainNavbar";
import { useMenus } from "@/constants/Sidebar";
import { RBACContext } from "@/context/rbacContext";
import { AuthContext } from "@/context/authContext";

export default function AppLayout({ module, children, showMainNavbar = true }) {
  const { canAccessModule, canAccessSubmodule, authLoading, rbacLoading } = useContext(RBACContext)
  const { isSignedIn } = useContext(AuthContext)
  const menus = useMenus();
  const [topItems, setTopItems] = useState([]);
  const [bottomItems, setBottomItems] = useState([]);
  const accessPermissions = menus.rules ?? [];
  const subSet = new Set();

  useEffect(() => {
    if (authLoading || rbacLoading) return;

    const moduleName = module ? module.toUpperCase() : "";

    const isModuleAccessible = canAccessModule(moduleName);

    if (!isSignedIn || !isModuleAccessible) {
      setTopItems([]);
      setBottomItems([]);
      return;
    }

    const keyOf = (item) =>
      (item && (item.href || item.label)) || JSON.stringify(item);

    const mergeUnique = (existing = [], additions = []) => {
      const seen = new Set(existing.map((it) => keyOf(it)));
      const merged = [...existing];

      for (const it of additions || []) {
        const k = keyOf(it);
        if (!seen.has(k)) {
          seen.add(k);
          merged.push(it);
        }
      }
      return merged;
    };

    let computedTop = [];
    let computedBottom = [];

    if (menus && menus[moduleName.toLowerCase()]) {
      computedTop = [...(menus[moduleName.toLowerCase()].top || [])];
      computedBottom = [...(menus[moduleName.toLowerCase()].bottom || [])];
    }

    const moduleRules = accessPermissions.filter(
      (rule) => rule.module?.toUpperCase() === moduleName
    );

    moduleRules.forEach((permission) => {
      if (!permission) return;

      const prefixes = Array.isArray(permission.requiredPermissionPrefixes)
        ? permission.requiredPermissionPrefixes
        : [permission.requiredPermissionPrefixes];

      const isSubmodulesAccessible = prefixes.some((p) =>
        canAccessSubmodule(p.toUpperCase())
      );

      if (isSubmodulesAccessible) {
        computedTop = mergeUnique(computedTop, permission.menu?.top || []);
        computedBottom = mergeUnique(
          computedBottom,
          permission.menu?.bottom || []
        );
      }
    });

    setTopItems(computedTop);
    setBottomItems(computedBottom);
  }, [
    module,
    menus,
    accessPermissions,
    canAccessModule,
    canAccessSubmodule,
    authLoading,
    rbacLoading,
    isSignedIn,
  ]);


  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex bg-gray-50">
      <aside className="w-[19vw] max-w-full bg-white border-r border-gray-200 flex-shrink-0 sticky top-0 h-screen  self-start overflow-hidden md:block ">
        <Sidebar topItems={topItems} bottomItems={bottomItems} />
      </aside>
      <div className="grid grid-cols-1  w-full z-10">
        <div className="sticky top-0">
          {showMainNavbar && <header className="bg-white border-b border-gray-200 h-16 flex items-center  ">
            <MainNavbar />
          </header>}
        </div>
        <main className="flex-1 hide-scrollbar w-[80vw] max-w-full overflow-hidden sticky top-2">{children}</main>
      </div>
    </div>
  );  
}
