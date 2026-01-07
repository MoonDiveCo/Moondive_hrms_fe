"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import { useNotifications } from "@/context/notificationcontext";
import NotificationCard from "./NotifcationCard";

export default function NotificationSlideOver({ isOpen, onClose }) {
  const panelRef = useRef(null);

  const [portalEl] = useState(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("div");
    el.setAttribute("id", "notification-slideover-root");
    return el;
  });

  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    if (!portalEl) return;
    document.body.appendChild(portalEl);
    return () => {
      if (portalEl.parentElement) portalEl.parentElement.removeChild(portalEl);
    };
  }, [portalEl]);

  // fetch notifications
  useEffect(() => {
    if (isOpen) fetchNotifications(1);
  }, [isOpen]);

  // ESC + outside click close (same as profile)
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    function onClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", onKey);
      document.addEventListener("mousedown", onClick);
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [isOpen, onClose]);

  if (!portalEl) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-white backdrop-blur-sm transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0"}`}
      />

      {/* Slide-over */}
      <aside
        ref={panelRef}
        className={`absolute right-0 top-0 h-full w-full md:w-[520px] bg-white shadow-2xl border-l 
        transform transition-transform duration-300 ease-in-out pointer-events-auto
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs bg-orange-400 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto h-[calc(100%-64px)]">
          {loading && (
            <div className="text-center text-gray-500 py-12">
              Loading notifications...
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-2">📭</div>
              <p className="text-gray-500">You have no notifications</p>
            </div>
          )}

          {!loading &&
            notifications.map((n) => (
              <NotificationCard
                key={n._id}
                notification={n}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
        </div>
      </aside>
    </div>
  );

  return ReactDOM.createPortal(content, portalEl);
}
