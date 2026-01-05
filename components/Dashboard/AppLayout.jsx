"use client";
import React, { useContext, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MainNavbar from "./MainNavbar";
import { useMenus } from "@/constants/Sidebar";
import { RBACContext } from "@/context/rbacContext";
import { AuthContext } from "@/context/authContext";
import FaceModal from "./FaceModal";
import { useAttendance } from "@/context/attendanceContext";
import { toast } from "sonner";

export default function AppLayout({ module, children, showMainNavbar = true }) {
  const { canAccessModule, canAccessSubmodule, authLoading, rbacLoading } = useContext(RBACContext);
  const { isSignedIn } = useContext(AuthContext);
  const menus = useMenus();
  const { checkIn, checkOut, isOnBreak } = useAttendance();

  const [topItems, setTopItems] = useState([]);
  const [bottomItems, setBottomItems] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [faceActionType, setFaceActionType] = useState<'checkIn' | 'checkOut'>('checkIn');

  // ✅ FIXED: Now properly accepts the action type parameter
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
      await toast.promise(checkIn(), {
        loading: 'Checking in...',
        success: 'Checked in successfully! 👋',
        error: (err) => err?.message || 'Failed to check in',
      });
    } else {
      await toast.promise(checkOut(), {
        loading: 'Checking out...',
        success: 'Checked out successfully! 💼',
        error: (err) => err?.message || 'Failed to check out',
      });
    }
  };

  // ✅ FIXED: Proper toArray helper with parameter
  const toArray = (value)=> {
    if (Array.isArray(value)) return value;
    if (value == null) return [];
    return [value];
  };

  const keyOf = (item) =>
    (item && (item.href || item.label)) || JSON.stringify(item);

  // ✅ FIXED: Calls toArray with correct argument
  const mergeUnique = (existing, additions) => {
    const safeAdditions = toArray(additions);
    const seen = new Set(existing.map(keyOf));
    const merged = [...existing];

    for (const it of safeAdditions) {
      const k = keyOf(it);
      if (!seen.has(k)) {
        seen.add(k);
        merged.push(it);
      }
    }
    return merged;
  };

  useEffect(() => {
    if (authLoading || rbacLoading) return;

    const moduleName = module ? module.toUpperCase() : "";
    const isModuleAccessible = canAccessModule(moduleName);

    if (!isSignedIn || !isModuleAccessible) {
      setTopItems([]);
      setBottomItems([]);
      return;
    }

    let computedTop = [];
    let computedBottom = [];

    if (menus && menus[moduleName.toLowerCase()]) {
      computedTop = toArray(menus[moduleName.toLowerCase()].top);
      computedBottom = toArray(menus[moduleName.toLowerCase()].bottom);
    }

    const accessPermissions = menus.rules ?? [];
    const moduleRules = accessPermissions.filter(
      (rule) => rule?.module?.toUpperCase() === moduleName
    );

    moduleRules.forEach((permission) => {
      if (!permission) return;

      const prefixes = toArray(permission.requiredPermissionPrefixes)
        .filter((p)=> typeof p === 'string');

      const isSubmodulesAccessible = prefixes.some((p) =>
        canAccessSubmodule(p.toUpperCase())
      );

      if (isSubmodulesAccessible) {
        computedTop = mergeUnique(computedTop, permission.menu?.top);
        computedBottom = mergeUnique(computedBottom, permission.menu?.bottom);
      }
    });

    setTopItems(computedTop);
    setBottomItems(computedBottom);
  }, [
    module,
    menus,
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
              <MainNavbar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                onFaceModalOpen={openFaceModal} // Now correctly passes 'checkIn' or 'checkOut'
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

      {/* Face Modal */}
      {faceModalOpen && (
        <FaceModal
          onClose={closeFaceModal}
          onSuccess={handleFaceSuccess}
          actionType={faceActionType}
        />
      )}
    </div>
  );
}