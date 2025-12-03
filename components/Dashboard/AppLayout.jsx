"use client";
import React, { useContext, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MainNavbar from "./MainNavbar";
import { useMenus } from "@/constants/Sidebar";
import { RBACContext } from "@/context/rbacContext";
import { AuthContext } from "@/context/authContext";
export default function AppLayout({ isHrms, isCrm, isCms, children }) {
  const { modules, submodules, actions, canAccessModule, canAccessSubmodule, canPerform } = useContext(RBACContext)
  const { user, permissions } = useContext(AuthContext)
  const menus = useMenus();
  const [topItems, setTopItems] = useState([]);
  const [bottomItems, setBottomItems] = useState([]);
  console.log("RBAC CONTEXT IN APPLAYOUT", { modules, submodules, actions, permissions })
  useEffect(() => {
    if (isHrms) {
      setTopItems(menus.hrms.top);
      setBottomItems(menus.hrms.bottom);
      return;
    }
    if (isCms) {
      setTopItems(menus.cms.top);
      setBottomItems(menus.cms.bottom);
      return;
    }
    if (isCrm) {
      setTopItems(menus.crm.top);
      setBottomItems(menus.crm.bottom);
      return;
    }
    setTopItems(menus.default.top);
    setBottomItems(menus.default.bottom);
  }, [isHrms, isCrm, isCms, menus]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <Sidebar topItems={topItems} bottomItems={bottomItems} />
      </aside>
      <div className="flex-1 flex flex-col w-full">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center">
          <MainNavbar />
        </header>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
