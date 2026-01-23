"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { CheckCheck, X } from "lucide-react";
import { useNotifications } from "@/context/notificationcontext";
import NotificationCard from "./NotifcationCard";

export default function NotificationSlideOver({ isOpen, onClose }) {
  const panelRef = useRef(null);

  const [portalEl] = useState(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("div");
    el.id = "notification-slideover-root";
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

  /* Mount portal */
  useEffect(() => {
    if (!portalEl) return;
    document.body.appendChild(portalEl);
    return () => portalEl.remove();
  }, [portalEl]);

  /* Fetch notifications when opened */
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  if (!portalEl || !isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        ref={panelRef}
        className="absolute right-25 top-12 h-[300px] w-[400px] bg-white shadow-2xl border border-gray-300 flex flex-col rounded-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2 shadow">
          <h5 className="text-primaryText font-medium">Notifications</h5>

          {unreadCount > 0 && (
            <div className="text-center"  title="Mark all as read">
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary font-medium hover:bg-gray-100 px-2 py-1 rounded-full transition"
              >
                <CheckCheck size={16} />
              </button>
            </div>
          )}
          {/* <button onClick={onClose}>
            <X size={18} />
          </button> */}
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-46px)]">
          <div className="flex-1 overflow-y-auto hide-scrollbar">
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
                  onClose={onClose}
                />
              ))}
          </div>
        </div>
      </aside>
    </div>,
    portalEl
  );
}
