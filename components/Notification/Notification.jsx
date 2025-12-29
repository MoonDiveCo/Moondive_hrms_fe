// components/NotificationList.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  markAllRead,
  markReadById
} from "@/services/notificationApi";

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await getNotifications();
    setNotifications(res.data.data);
  };

  const handleClick = async (n) => {
    if (!n.isRead) {
      await markReadById(n._id);
    }

    // 🚦 MODULE-BASED ROUTING
    switch (n.module) {
      case "leave":
        router.push(`/hrms/leave/${n.data.leaveId}`);
        break;

      case "attendance":
        router.push("/hrms/attendance");
        break;

      case "policy":
        router.push(`/hrms/policies/${n.data.policyId}`);
        break;

      default:
        router.push("/hrms/dashboard");
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    fetchNotifications();
  };

  return (
    <div className="w-96 bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold">Notifications</h3>
        <button
          className="text-sm text-blue-600"
          onClick={handleMarkAllRead}
        >
          Mark all read
        </button>
      </div>

      {notifications.length === 0 && (
        <p className="text-sm text-gray-500">No notifications</p>
      )}

      {notifications.map((n) => (
        <div
          key={n._id}
          onClick={() => handleClick(n)}
          className={`p-3 rounded-md cursor-pointer mb-2
            ${n.isRead ? "bg-gray-100" : "bg-blue-50"}
          `}
        >
          <h4 className="text-sm font-semibold">{n.title}</h4>
          <p className="text-sm text-gray-600">{n.message}</p>
          <span className="text-xs text-gray-400">
            {new Date(n.createdAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
