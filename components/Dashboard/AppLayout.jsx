"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MainNavbar from "./MainNavbar";
import { useMenus } from "@/constants/Sidebar";
import { RBACContext } from "@/context/rbacContext";
import { AuthContext } from "@/context/authContext";

export default function AppLayout({ module, children, showMainNavbar = true }) {
  const router = useRouter();
  const pathname = usePathname();
  const menus = useMenus();

  const {
    canAccessModule,
    canAccessSubmodule,
    authLoading,
    rbacLoading,
    submodules,
  } = useContext(RBACContext);

  const { isSignedIn, allUserPermissions } = useContext(AuthContext);

  const [topItems, setTopItems] = useState([]);
  const [bottomItems, setBottomItems] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  const moduleName = module ? module.toUpperCase() : "";
  const routePermissionMap = menus.routePermissionMap;

  const requiredPermissions = useMemo(() => {
    if (!routePermissionMap) return [];

    if (pathname.includes("manage-accounts")) {
      return ["HRMS:MANAGE_ACCOUNT"];
    }


    return routePermissionMap[pathname] || [];
  }, [pathname, routePermissionMap]);

  

  const isRouteAllowed =
    isSignedIn &&
    canAccessModule(moduleName) &&
    (
      submodules?.includes("*") ||
      requiredPermissions.some((perm) => canAccessSubmodule(perm))
    );



  useEffect(() => {
    if (authLoading || rbacLoading) return;

    if (!isSignedIn) {
      router.replace("/login");
      return;
    }

    if (!isRouteAllowed) {
      router.replace("/unauthorized");
    }
  }, [
    authLoading,
    rbacLoading,
    isSignedIn,
    isRouteAllowed,
    router,
  ]);

  useEffect(() => {
    const newTop = [];
    const newBottom = [];

    Object.entries(menus.sidebarObject).forEach(([permission, item]) => {
      if (
        allUserPermissions.includes(permission) &&
        permission.includes(moduleName)
      ) {
        if (item.position === "top") newTop.push(item);
        if (item.position === "bottom") newBottom.push(item);
      }
    });

    setTopItems(newTop);
    setBottomItems(newBottom);
  }, [menus.sidebarObject, allUserPermissions, moduleName]);


  if (authLoading || rbacLoading || !isRouteAllowed) {
    return null;
  }

  return (
    <div className="max-h-screen h-screen w-full max-w-full overflow-x-hidden flex">
      <aside
        className={`${
          collapsed ? "w-20" : "w-[19vw]"
        } bg-white border-r border-gray-200 shrink-0 sticky top-0 h-screen transition-all`}
      >
        <Sidebar
          topItems={topItems}
          bottomItems={bottomItems}
          collapsed={collapsed}
        />
      </aside>

      <div className="grid grid-rows-[auto_1fr] h-screen w-full">
        {showMainNavbar && (
          <header className="bg-white border-b h-16 flex items-center sticky top-0">
            <MainNavbar
              setCollapsed={setCollapsed}
              collapsed={collapsed}
            />
          </header>
        )}

        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
