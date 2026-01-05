"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MainNavbar from "./MainNavbar";
import { useMenus } from "@/constants/Sidebar";
import { RBACContext } from "@/context/rbacContext";
import { AuthContext } from "@/context/authContext";
import FaceModal from "./FaceModal";
 
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
  const [topItems, setTopItems] = useState([]);
  const [bottomItems, setBottomItems] = useState([]);
  const accessPermissions = menus.rules ?? [];
  const subSet = new Set();
const [collapsed, setCollapsed] = useState(false);

 const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [isFaceVerified, setIsFaceVerified] = useState(false);

  const openFaceModal = () => setFaceModalOpen(true);
  const closeFaceModal = () => setFaceModalOpen(false);
const handleCheckInSuccess = async () => {
  setIsFaceVerified(true);
  closeFaceModal();
  try {
    await checkIn(); 
  } catch (err) {
    console.error(err);
  }
};



  const { isSignedIn, allUserPermissions } = useContext(AuthContext);


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
      } max-w-full bg-white border-r border-gray-200 shrink-0 sticky top-0 h-screen self-start overflow-hidden md:block transition-all duration-200`}
    >
      <Sidebar topItems={topItems} bottomItems={bottomItems} collapsed={collapsed} />
    </aside>
 
    <div className="grid grid-rows-[auto_1fr] h-screen w-full z-10">
      <div className="sticky top-0 z-0">
        {showMainNavbar && (
          <header className="bg-white border-b border-gray-200 h-16 flex items-center">
              <MainNavbar
               collapsed={collapsed}
  setCollapsed={setCollapsed}
  isFaceVerified={isFaceVerified}
  onCheckInClick={openFaceModal}
            />
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
       {faceModalOpen && (
        <FaceModal
          onClose={closeFaceModal}
          onSuccess={handleCheckInSuccess}
        />
      )}
  </div>
);
 
}
