"use client";
import React, { useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";

const ICON_MAP = {
  "Leave Management": "📅",
  HR: "👥",
  "Company Announcements": "📢",
  "Policy Update": "📣",
  default: "🔔",
};

const NotificationCard = ({ notification, onAutoRead }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (notification.isRead) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onAutoRead(notification._id);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [notification.isRead, notification._id, onAutoRead]);

  return (
    <>
      <div ref={cardRef} className="flex items-start gap-3 py-4">
        {/* Left Icon */}
        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-lg">
          {ICON_MAP[notification.relatedDomainType] || ICON_MAP.default}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h6 className="text-sm font-semibold text-black">
            {notification.notificationTitle}
          </h6>

          <h6 className="text-xs text-gray-600 mt-0.5 leading-relaxed">
            {notification.notificationMessage}
          </h6>

          <h6 className="text-sm text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </h6>
        </div>

        {/* Unread Dot */}
        {!notification.isRead && (
          <span className="mt-2 w-2 h-2 bg-orange-400 rounded-full"></span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />
    </>
  );
};

export default NotificationCard;
