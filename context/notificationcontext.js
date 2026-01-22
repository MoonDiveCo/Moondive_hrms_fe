
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
import { AuthContext } from "@/context/authContext";
 
const NotificationContext = createContext();
 
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setLoading] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Track processed notification IDs to prevent duplicates
  const processedNotificationIds = useRef(new Set());
 
  const { isSignedIn, loading: authLoading,user } = useContext(AuthContext);
  const [permission, setPermission] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default"
  );
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
 
  useEffect(() => {
    if (!authLoading) {
      setIsAuthenticated(isSignedIn);
    }
  }, [isSignedIn, authLoading]);
 
  // Create a stable API instance using useRef

  // Fetch notifications from server - now stable with useRef
  const fetchNotifications = useCallback(
    async (page = 1, limit = 20) => {
      if (!isAuthenticated) {
        return;
      }
 
      setLoading(true);
      try {
        const response = await axios.get("hrms/notification/list-notification", {
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
         
          // Update processed IDs set
          notifs.forEach(n => processedNotificationIds.current.add(n._id));
         
          return response.data.data;
        } else if (response.data.notifications) {
          const notifs = response.data.notifications;
          setNotifications(notifs);
          setUnreadCount(response.data.unreadCount || 0);
         
          // Update processed IDs set
          notifs.forEach(n => processedNotificationIds.current.add(n._id));
         
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
    [isAuthenticated]
  );
 
  // Mark notification as read
  const markAsRead = async (notificationId) => {
  try {
    const { data } = await axios.put(`hrms/notification/mark-as-read/${notificationId}`);

    if (data.success) {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

 
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await axios.put("hrms/notification/mark-all-read");
 
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
      const response = await axios.post("hrms/notification/send", payload);
      console.log("xxxxxxxxxxxxxxxxxxxx----------xxxxxxxxxxxxxxx",response.data)
      return response.data;
    } catch (error) {
      console.error(
        " Error sending notification:",
        error.response?.data || error
      );
    }
  };
 
  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await axios.delete(`hrms/notification/delete/${notificationId}`);
 
      if (response.data.success) {
        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notificationId)
        );
       
        // Remove from processed IDs
        processedNotificationIds.current.delete(notificationId);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  };
 
  // Clear all notifications from state
  const clearNotifications = () => {
    setNotifications([]);
    processedNotificationIds.current.clear();
  };
 
  // Save FCM token to server
  const saveFCMTokenToServer = async (token) => {
    try {
      const userId = getUserId();
 
      const payload = { fcmToken: token };
     
 
      if (userId) {
        payload.userId = userId;
        
      } else {
        console.warn("No userId found in localStorage");
      }
 
      const response = await axios.post("hrms/notification/token", payload);
      
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
        return null;
      }
 
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return null;
      }
 
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
 
      if (!token) {
        return null;
      }
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
        return false;
      }
 
      const permission = await Notification.requestPermission();
      setPermission(permission);
 
      if (permission === "granted") {
        const token = await getFCMToken();
        return !!token;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, []);
 
    const addNotification = useCallback((notification) => {
    const notifId = notification._id || notification.id;
   
    // Check if already processed
    if (processedNotificationIds.current.has(notifId)) {
      return;
    }
 
    setNotifications((prev) => {
      // Double check for duplicates in current state
      const exists = prev.some((n) => n._id === notifId);
 
      if (!exists) {
        // Mark as processed
        processedNotificationIds.current.add(notifId);
       
        return [notification, ...prev];
      }
      return prev;
    });
    setUnreadCount ((prev)=>{
      const newCount=prev+1;
      return newCount
    })
  }, []);
 
 
  // Combined foreground and background notification handler
  useEffect(() => {
    if (typeof window === "undefined" || !messaging) return;
    // 1. Foreground message listener (onMessage)
    const unsubscribe = onMessage(messaging, (payload) => {
      if(payload.data.receiverId!==user._id) return
 
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

      console.log("foreground message",)
 
      // Add to notifications list
      addNotification(notificationData);
    });
 
    // 2. Service worker message listener (background notifications)
    const handleServiceWorkerMessage = (event) => {
      if (event.data?.firebaseMessaging) {
        const currentUserId = getUserId();
        const targetUserId = event.data.targetUserId;
 
        // Check if notification is for this user
        if (!targetUserId || targetUserId === currentUserId) {
          if (event.data.notificationClick) {
            fetchNotifications();
          } else if (event.data.isBackground) {
            const newNotification = {
              _id: event.data.payload.data._id || Date.now().toString(),
              notificationTitle: event.data.payload.data.notificationTitle,
              notificationMessage: event.data.payload.data.notificationMessage,
              relatedDomainType: event.data.payload.data.relatedDomainType,
              priority: event.data.payload.data.priority || "Medium",
              viewed: false,
              createdAt: event.data.payload.data.createdAt || new Date().toISOString(),
            };
 
            // Add notification - the addNotification function will handle duplicates
            addNotification(newNotification);
           
            // Refresh from server after a delay (this won't add duplicates due to our check)
            setTimeout(() => fetchNotifications(), 1500);
          }
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
        .then((registration) => {;
        })
        .catch((err) => {
          console.error(" Service Worker registration failed:", err);
        });
    }
  }, []);
 
  // Initialize FCM token on mount - only when authenticated
  useEffect(() => {
    const initFCM = async () => {
      if (!isAuthenticated || typeof window === "undefined") {
        return;
      }
      if (Notification.permission === "default") {
        // Don't auto-request
      } else if (Notification.permission === "granted" && !fcmToken) {
        await getFCMToken();
      }
    };
 
    const timer = setTimeout(initFCM, 500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, fcmToken]);
 
  // Fetch initial notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);
 
  const value = {
    notifications,
    unreadCount,
    notificationLoading,
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
 