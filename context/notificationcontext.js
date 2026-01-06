"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { getToken, onMessage } from "firebase/messaging";
import axios from "axios";
import Cookies from "js-cookie";
import { messaging } from "../firebase";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const [permission, setPermission] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default"
  );

  // API base URL
  const API_BASE_URL = "http://localhost:2000/api/v1/hrms/notification";

  // Get auth token from cookies
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return Cookies.get("token");
    }
    return null;
  };

  // Get user from localStorage
  const getUser = () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
          return null;
        }
      }
    }
    return null;
  };

  // Get userId from localStorage - handle different possible structures
  const getUserId = () => {
    const user = getUser();
    const userId = user?._id || user?.id || user?.userId || user?.user?._id;
    return userId || null;
  };

  const isAuthenticated = Boolean(getAuthToken());

  // Create a stable API instance using useRef
  const apiRef = useRef(null);
  
  if (!apiRef.current) {
    apiRef.current = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add auth token to requests
    apiRef.current.interceptors.request.use((config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.token = token;
      }
      return config;
    });
  }

  const api = apiRef.current;

  // Fetch notifications from server - now stable with useRef
  const fetchNotifications = useCallback(
    async (page = 1, limit = 20) => {
      if (!isAuthenticated) {
        console.log("User not authenticated");
        return;
      }

      setLoading(true);
      try {
        const response = await api.get("/list-notification", {
          params: {
            page,
            limit,
            _t: Date.now(), // Bypass cache
          },
        });

        // Check both possible response structures
        if (response.data.success) {
          const notifs = response.data.data.notifications;
          setNotifications(notifs);
          setUnreadCount(response.data.data.unreadCount);
          return response.data.data;
        } else if (response.data.notifications) {
          const notifs = response.data.notifications;
          setNotifications(notifs);
          setUnreadCount(response.data.unreadCount || 0);
          return response.data;
        } else {
          console.error("Unexpected response structure");
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, api]
  );

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await api.patch(`/mark-as-read/${notificationId}`);

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, viewed: true } : notif
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await api.patch("/mark-all-read");

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, viewed: true }))
        );

        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  };

  // Send/Store notification
  const storeNotification = async ({
    receiverId,
    notificationTitle,
    notificationMessage,
    relatedDomainType,
    policyId,
    priority = "Medium",
    senderId,
  }) => {
    if (
      !receiverId ||
      !notificationTitle ||
      !notificationMessage ||
      !relatedDomainType
    ) {
      console.error(
        "receiverId, title, message, and relatedDomainType are required"
      );
      return;
    }

    const payload = {
      receiverId,
      notificationTitle,
      notificationMessage,
      relatedDomainType,
      priority,
    };

    if (policyId) payload.policyId = policyId;
    if (senderId) payload.senderId = senderId;

    try {
      const response = await api.post("/send", payload);
      console.log("✅ Notification API response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error sending notification:",
        error.response?.data || error
      );
      throw error;
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await api.delete(`/delete/${notificationId}`);

      if (response.data.success) {
        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notificationId)
        );
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  };

  // Clear all notifications from state
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Save FCM token to server
  const saveFCMTokenToServer = async (token) => {
    try {
      const userId = getUserId();

      const payload = { fcmToken: token };
      console.log("Preparing to save FCM token:", payload);

      if (userId) {
        payload.userId = userId;
        console.log("Saving FCM token for user:", userId);
      } else {
        console.warn("No userId found in localStorage");
      }

      const response = await api.post("/token", payload);
      console.log("FCM token saved successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error saving FCM token:", error.response?.data || error);
      throw error;
    }
  };

  // Get FCM token
  const getFCMToken = async () => {
    try {
      if (!messaging) {
        console.log("Messaging not initialized");
        return null;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission denied");
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (!token) {
        console.log("Token not generated");
        return null;
      }

      console.log("FCM token:", token);
      setFcmToken(token);
      await saveFCMTokenToServer(token);
      return token;
    } catch (err) {
      console.error("FCM error:", err);
      return null;
    }
  };

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    try {
      if (typeof window === "undefined" || !("Notification" in window)) {
        console.log("This browser does not support notifications");
        return false;
      }

      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === "granted") {
        const token = await getFCMToken();
        return !!token;
      } else {
        console.log("Notification permission denied");
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, []);

  // Add new notification to local state with proper duplicate checking
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => {
      // Check for duplicates by _id
      const exists = prev.some((n) => n._id === notification._id);

      if (!exists) {
        console.log("✅ Adding new notification:", notification._id);
        
        // Only increment unread count if notification is unread
        if (!notification.viewed) {
          setUnreadCount((prevCount) => {
            const newCount = prevCount + 1;
            console.log("📈 Incrementing unread count:", prevCount, "->", newCount);
            return newCount;
          });
        }
        
        return [notification, ...prev];
      }
      
      console.log("⚠️ Duplicate notification ignored:", notification._id);
      return prev;
    });
  }, []);

  // Combined foreground and background notification handler
  useEffect(() => {
    if (typeof window === "undefined" || !messaging) return;

    console.log("🔧 Setting up notification listeners");

    // 1. Foreground message listener (onMessage)
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📱 FOREGROUND notification received:", payload);

      if (!payload?.data) return;

      const notificationData = {
        _id: payload.data._id ?? Date.now().toString(),
        notificationTitle: payload.data.notificationTitle ?? "New Notification",
        notificationMessage: payload.data.notificationMessage ?? "",
        relatedDomainType: payload.data.relatedDomainType ?? "",
        priority: payload.data.priority ?? "Medium",
        viewed: false,
        createdAt: payload.data.createdAt ?? new Date().toISOString(),
      };

      // Add to notifications list
      addNotification(notificationData);
    });

    // 2. Service worker message listener (background notifications)
    const handleServiceWorkerMessage = (event) => {
      if (event.data?.firebaseMessaging) {
        console.log("📨 Service worker message received:", event.data);

        const currentUserId = getUserId();
        const targetUserId = event.data.targetUserId;

        // Check if notification is for this user
        if (!targetUserId || targetUserId === currentUserId) {
          if (event.data.notificationClick) {
            console.log("🖱️ Notification clicked - refreshing list");
            fetchNotifications();
          } else if (event.data.isBackground) {
            console.log("🌙 BACKGROUND notification received");

            // Option A: Add immediately + refresh (faster UI, ensures sync)
            const newNotification = {
              _id: event.data.payload.data._id || Date.now().toString(),
              notificationTitle: event.data.payload.data.notificationTitle,
              notificationMessage: event.data.payload.data.notificationMessage,
              relatedDomainType: event.data.payload.data.relatedDomainType,
              priority: event.data.payload.data.priority || "Medium",
              viewed: false,
              createdAt: event.data.payload.data.createdAt || new Date().toISOString(),
            };

            // Add notification immediately for instant UI update
            addNotification(newNotification);
            
            // Also fetch from server to ensure sync (debounced to avoid spam)
            setTimeout(() => fetchNotifications(), 1000);

            // Option B (simpler): Just refresh from server
            // fetchNotifications();
          }
        } else {
          console.log("⛔ Notification not for current user - ignoring");
        }
      } else if (event.data?.checkUserVisibility) {
        const targetUserId = event.data.targetUserId;
        const currentUserId = getUserId();
        const notificationId = event.data.notificationId;

        const isTargetUser = !targetUserId || targetUserId === currentUserId;
        const isWindowVisible = document.visibilityState === "visible";

        navigator.serviceWorker.controller?.postMessage({
          userVisibilityResponse: true,
          notificationId: notificationId,
          userVisible: isTargetUser && isWindowVisible,
          userId: currentUserId,
        });
      }
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener(
        "message",
        handleServiceWorkerMessage
      );
    }

    // Cleanup both listeners
    return () => {
      console.log("🧹 Cleaning up notification listeners");
      unsubscribe();
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener(
          "message",
          handleServiceWorkerMessage
        );
      }
    };
  }, [addNotification, fetchNotifications]);

  // Register service worker
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration);
        })
        .catch((err) => {
          console.error("❌ Service Worker registration failed:", err);
        });
    }
  }, []);

  // Initialize FCM token on mount - only when authenticated
  useEffect(() => {
    console.log("--------dskdbskjbdskjdbskjb")
    const initFCM = async () => {
      if (!isAuthenticated || typeof window === "undefined") {
        return;
      }
      console.log("----------noti permissions",Notification.permission);
      if (Notification.permission === "default") {
        console.log("⏳ Notification permission not yet requested");
      } else if (Notification.permission === "granted" && !fcmToken) {
        console.log("🔑 Getting FCM token...-----------------------------");
        await getFCMToken();
      }
    };

    const timer = setTimeout(initFCM, 500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, fcmToken]);

  // Fetch initial notifications when authenticated - FIXED dependency array
  useEffect(() => {
    if (isAuthenticated) {
      console.log("👤 User authenticated - fetching notifications");
      fetchNotifications();
    }
  }, [isAuthenticated]); // ✅ Only depend on isAuthenticated, not fetchNotifications

  // Debug unread count changes
  useEffect(() => {
    console.log("📊 Unread count:", unreadCount);
  }, [unreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    permission,
    fcmToken,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    storeNotification,
    deleteNotification,
    addNotification,
    clearNotifications,
    requestNotificationPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};

export default NotificationContext;