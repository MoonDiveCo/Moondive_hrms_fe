"use client";
import React, { useEffect, useRef } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Users, Calendar, Megaphone, MessageCircle, Bell } from "lucide-react";

const ICON_MAP = {
  "Leave Management": Calendar,
  HR: Users,
  "Company Announcements": Megaphone,
  "Policy Update": MessageCircle,
  default: Bell,
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

  const IconComponent = ICON_MAP[notification.relatedDomainType] || ICON_MAP.default;

  return (
    <>
      <div ref={cardRef} className="flex items-start gap-3 py-4">
        {/* Left Icon */}
        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
          <IconComponent className="w-4 h-4 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h6 className="text-sm font-semibold text-black">
              {notification.notificationTitle}
            </h6>
            
            {/* Actual Time - Right Side */}
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {format(new Date(notification.createdAt), "h:mm a")}
            </span>
          </div>

          <h6 className="text-xs text-primary-Text mt-0.5 leading-relaxed">
            {notification.notificationMessage}
          </h6>

          <span className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        {/* Unread Dot */}
        {!notification.isRead && (
          <span className="mt-2 w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />
    </>
  );
};

export default NotificationCard;