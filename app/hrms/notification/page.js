// app/hrms/notifications/page.jsx
"use client";
import NotificationList from '@/components/Notification/NotificationList';
import { NotificationProvider } from '@/context/notificationcontext';

export default function NotificationsPage() {
  return (
    <NotificationProvider>
      <NotificationList />
    </NotificationProvider>
  );
}