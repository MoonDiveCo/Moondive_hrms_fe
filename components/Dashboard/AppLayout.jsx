"use client";
import React, { useContext, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MainNavbar from "./MainNavbar";
import { useMenus } from "@/constants/Sidebar";
import { RBACContext } from "@/context/rbacContext";
import { AuthContext } from "@/context/authContext";
 
export default function AppLayout({ module, children, showMainNavbar = true }) {
  const { canAccessModule, canAccessSubmodule, authLoading, rbacLoading } = useContext(RBACContext)
  const { isSignedIn,allUserPermissions } = useContext(AuthContext)
  const menus = useMenus();
  const [topItems, setTopItems] = useState([]);
  const [bottomItems, setBottomItems] = useState([]);
  const accessPermissions = menus.rules ?? [];
  const subSet = new Set();
const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (authLoading || rbacLoading) return;
 
    const moduleName = module ? module.toUpperCase() : "";
 
    const isModuleAccessible = canAccessModule(moduleName);
 
    if (!isSignedIn || !isModuleAccessible) {
      setTopItems([]);
      setBottomItems([]);
      return;
    }
 
    // const keyOf = (item) =>
    //   (item && (item.href || item.label)) || JSON.stringify(item);
 
    // const mergeUnique = (existing = [], additions = []) => {
    //   const seen = new Set(existing.map((it) => keyOf(it)));
    //   const merged = [...existing];
 
    //   for (const it of additions || []) {
    //     const k = keyOf(it);
    //     if (!seen.has(k)) {
    //       seen.add(k);
    //       merged.push(it);
    //     }
    //   }
    //   console.log("merged-----",merged)
    //   return merged;
    // };
 
    // let computedTop = [];
    // let computedBottom = [];
    // if (menus && menus[moduleName.toLowerCase()]) {
    //   computedTop = [...(menus[moduleName.toLowerCase()].top || [])];
    //   computedBottom = [...(menus[moduleName.toLowerCase()].bottom || [])];
    // }
 
    // const moduleRules = accessPermissions.filter(
    //   (rule) => rule.module?.toUpperCase() === moduleName
    // );

    const newTop=[]
    const newBottom=[]
    Object.keys(menus.sidebarObject).forEach((permission)=>{
      if(allUserPermissions.includes(permission)){
        if(menus.sidebarObject[permission].position==='top' && permission.includes(moduleName)){
          newTop.push(menus.sidebarObject[permission])
        }
        if(menus.sidebarObject[permission].position==='bottom' && permission.includes(moduleName)){
          newBottom.push(menus.sidebarObject[permission])
        }
        
      }
    })
 
    // moduleRules.forEach((permission) => {
    //   if (!permission) return;
 
    //   const prefixes = Array.isArray(permission.requiredPermissionPrefixes)
    //     ? permission.requiredPermissionPrefixes
    //     : [permission.requiredPermissionPrefixes];
 
    //   const isSubmodulesAccessible = prefixes.some((p) =>
    //     canAccessSubmodule(p.toUpperCase())
    //   );
 
    //   if (isSubmodulesAccessible) {
    //     computedTop = mergeUnique(computedTop, permission.menu?.top || []);
    //     computedBottom = mergeUnique(
    //       computedBottom,
    //       permission.menu?.bottom || []
    //     );
    //   }
    // });
   
    setTopItems(newTop);
    setBottomItems(newBottom);
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
  <div className="max-h-screen h-screen w-full max-w-full overflow-x-hidden flex">
    <aside
      className={`${
        collapsed ? "w-20" : "w-[19vw]"
      } max-w-full bg-white border-r border-gray-200 shrink-0 sticky top-0 h-screen self-start overflow-hidden md:block transition-all duration-200`}
    >
      <Sidebar topItems={topItems} bottomItems={bottomItems} collapsed={collapsed} />
    </aside>
 
    <div className="grid grid-rows-[auto_1fr] h-screen w-full z-10">
      <div className="sticky top-0 z-0">
        {showMainNavbar && (
          <header className="bg-white border-b border-gray-200 h-16 flex items-center">
            <MainNavbar setCollapsed={setCollapsed} collapsed={collapsed} />
          </header>
        )}
      </div>
 
      <main
        className="flex-1 w-full max-w-full overflow-auto p-4"
        style={{ height: "calc(100vh - 4rem)" }}
      >
        {children}
      </main>
    </div>
  </div>
);
 
}
 
 