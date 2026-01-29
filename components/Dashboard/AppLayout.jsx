"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MainNavbar from "./MainNavbar";
import { useMenus } from "@/constants/Sidebar";
import { RBACContext } from "@/context/rbacContext";
import { AuthContext } from "@/context/authContext";
import {useNotifications} from "@/context/notificationcontext";
import FaceModal from "./FaceModal";
import { useAttendance } from "@/context/attendanceContext";
import { toast } from "sonner";

export default function AppLayout({ module, children, showMainNavbar = true }) {
  const menus = useMenus();
  const { checkIn, checkOut, isOnBreak } = useAttendance();
  const {user} = useContext(AuthContext)
  const router = useRouter();
  const pathname = usePathname();
  const {
    canAccessModule,
    canAccessSubmodule,
    authLoading,
    rbacLoading,
    submodules,
  } = useContext(RBACContext);
  const { notificationLoading } = useNotifications();
  const [topItems, setTopItems] = useState([]);
  const [bottomItems, setBottomItems] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [faceActionType, setFaceActionType] = useState('checkIn');

  const openFaceModal = (type) => {
    if (type === 'checkOut' && isOnBreak) {
      toast.error('Please end your break before checking out.');
      return;
    }
    setFaceActionType(type);
    setFaceModalOpen(true);
  };

  const closeFaceModal = () => setFaceModalOpen(false);

  const handleFaceSuccess = async () => {
    closeFaceModal();

    if (faceActionType === 'checkIn') {
       toast.promise(checkIn(), {
        loading: 'Checking in...',
        success: 'Checked in successfully! 👋',
        error: (err) => err?.message || 'Failed to check in',
      });
    } else {
       toast.promise(checkOut(), {
        loading: 'Checking out...',
        success: 'Checked out successfully! 💼',
        error: (err) => err?.message || 'Failed to check out',
      });
    }
  };

  const toArray = (value)=> {
    if (Array.isArray(value)) return value;
    if (value == null) return [];
    return [value];
  };

  const keyOf = (item) =>
    (item && (item.href || item.label)) || JSON.stringify(item);

  const mergeUnique = (existing, additions) => {
    const safeExisting = toArray(existing);
    const safeAdditions = toArray(additions);

    const seen = new Set(safeExisting.map(keyOf));
    const merged = [...safeExisting];

    for (const it of safeAdditions) {
      const k = keyOf(it);
      if (!seen.has(k)) {
        seen.add(k);
        merged.push(it);
      }
    }
    return merged;
  };

  const { isSignedIn, allUserPermissions } = useContext(AuthContext);

  const moduleName = module ? module.toUpperCase() : "";
  const routePermissionMap = menus.routePermissionMap;

  // ✅ Define routes that don't need permission checks (only module access)
  const PUBLIC_MODULE_ROUTES = [
    "/employee",           // ✅ Remove protection from employee view
    "/dashboard",
    // Add other routes that should be accessible with just module access
  ];

  const requiredPermissions = useMemo(() => {
    if (!routePermissionMap) return [];

    // ✅ If route is in public list, return empty array (no specific permission needed)
    if (PUBLIC_MODULE_ROUTES.some(route => pathname.startsWith(route))) {
      return [];
    }

    if (pathname.includes("manage-accounts")) {
      return ["HRMS:MANAGE_ACCOUNT"];
    }

    return routePermissionMap[pathname] || [];
  }, [pathname, routePermissionMap]);

  // ✅ Updated route check logic
  const isRouteAllowed = useMemo(() => {
    if (!isSignedIn) return false;
    if (!canAccessModule(moduleName)) return false;

    // ✅ Wildcard access
    if (submodules?.includes("*")) return true;

    // ✅ If no specific permissions required (public route), allow if module access exists
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // ✅ Check if user has any of the required permissions
    return requiredPermissions.some((perm) => canAccessSubmodule(perm));
  }, [isSignedIn, moduleName, submodules, requiredPermissions, canAccessModule, canAccessSubmodule]);

  useEffect(() => {
    if (authLoading || rbacLoading || notificationLoading) return;

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

    const isSuperAdmin = user?.userRole?.includes("SuperAdmin") 

    const SUPERADMIN_TOP_HIDDEN = [
      "HRMS:LEAVE_TRACKER:VIEW",
      "HRMS:ATTENDANCE:VIEW",
    ];
    
    Object.entries(menus.sidebarObject).forEach(([permission, item]) => {
      if (
        !allUserPermissions.includes(permission) ||
        !permission.includes(moduleName)
      ) {
        return;
      }

      if (
        isSuperAdmin &&
        item.position === "top" &&
        SUPERADMIN_TOP_HIDDEN.includes(permission)
      ) {
        return;
      }

      if (item.position === "top") newTop.push(item);
      if (item.position === "bottom") newBottom.push(item);
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
          onSuccess={handleFaceSuccess}
          actionType={faceActionType}
          onCheckInClick={openFaceModal}
        />
      )}
    </div>
  );
}