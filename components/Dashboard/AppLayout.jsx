"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MainNavbar from "./MainNavbar";
import { useMenus } from "@/constants/Sidebar";
export default function AppLayout({ isHrms, isCrm, isCms, children }) {
  const menus = useMenus();
  const [topItems, setTopItems] = useState([]);
  const [bottomItems, setBottomItems] = useState([]);
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
