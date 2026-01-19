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
  } = useNotifications();
 console.log("-----------------",unreadCount)
  useEffect(() => {
    if (!portalEl) return;
    document.body.appendChild(portalEl);
    return () => portalEl.remove();
  }, [portalEl]);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  // 🔥 THIS FIXES THE BLUR ISSUE
  if (!portalEl || !isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
      />

      {/* Drawer */}
      <aside
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shadow">
          <h3 className="text-base font-semibold">Notifications</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-56px)]">
          <div className="flex-1 overflow-y-auto px-5">
            {loading && (
              <p className="text-center text-sm text-gray-500 py-6">
                Loading notifications...
              </p>
            )}

            {!loading &&
              notifications.map((n) => (
                <NotificationCard
                  key={n._id}
                  notification={n}
                  onAutoRead={markAsRead}
                />
              ))}
          </div>

          {/* Bottom Action */}
          {unreadCount >= 0 && (
            <div className="py-4 text-center mb-2 shadow">
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary font-medium hover:underline"
              >
                ✓ Mark all as read
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>,
    portalEl
  );
}
