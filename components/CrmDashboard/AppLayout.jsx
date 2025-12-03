// components/AppLayout.jsx
"use client";
import React from "react";
import Sidebar from "./Sidebar";
import MainNavbar from "./MainNavbar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col w-full">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center">
          <MainNavbar />
        </header>
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
