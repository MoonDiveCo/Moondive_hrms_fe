"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import {
  Users,
  Calendar,
  Megaphone,
  MessageCircle,
  Bell,
} from "lucide-react";

/* Icon map */
const ICON_MAP = {
  "Leave Management": Calendar,
  HR: Users,
  HR_HELPDESK: Users,
  "Company Announcements": Megaphone,
  "Policy Update": MessageCircle,
  default: Bell,
};

/* Navigation handler */
const navigateFromNotification = (notification, router) => {
  const type = notification.relatedDomainType;

  switch (type) {
    case "HR":
    case "HR_HELPDESK":
      router.push("/hrms/dashboard/operations/hr-helpdesk");
      break;

    case "Leave":
    case "Leave Management":
      router.push("/hrms/dashboard/leave-tracker");
      break;

    case "policy":
    case "Policy Update":
      router.push("/hrms/dashboard/organizationpolicy");
      break;

    case "Attendance":
      router.push("/hrms/dashboard/attendance/list");
      break;

    default:
      router.push("/hrms/dashboard");
  }
};


export default function NotificationCard({
  notification,
  onAutoRead,
  onClose,
}) {
  const cardRef = useRef(null);
  const router = useRouter();

  /* Auto mark as read when visible */
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

  const handleClick = async () => {
    try {
      onClose?.();

      if (!notification.isRead) {
        await onAutoRead(notification._id);
      }

      navigateFromNotification(notification, router);
    } catch (err) {
      console.error("Notification click error:", err);
    }
  };

  const IconComponent =
    ICON_MAP[notification.relatedDomainType] || ICON_MAP.default;

  return (
    <>
      <div
        ref={cardRef}
        onClick={handleClick}
        className="flex items-center justify-center gap-3 py-2 px-4 cursor-pointer hover:bg-primary/10 transition"
      >
        {/* Icon */}

        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <IconComponent className="w-4 h-4 text-primary" />
        </div>
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h6 className="text-sm text-primaryText">
              {notification.title || notification.notificationTitle}
            </h6>

            <span className="text-[10px] text-gray-400 whitespace-nowrap">
              {format(new Date(notification.createdAt), "h:mm a")}
            </span>
          </div>
    
          <span className="text-xs block text-primaryText mt-0.5 leading-relaxed">
            {notification.message || notification.notificationMessage}
          </span>

          {/* <span className="text-[10px] text-gray-400">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span> */}
        </div>

        {!notification.isRead && (
          <span className="mt-2 w-2 h-2 bg-orange-400 rounded-full flex-shrink-0" />
        )}
      </div>

      <div className="h-px bg-gray-100" />
    </>
  );
}
