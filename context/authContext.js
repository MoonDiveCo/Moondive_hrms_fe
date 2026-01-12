"use client";

import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { fetchIPData } from "@/helper/tracking";
import { ACTION_PERMISSIONS } from "@/constants/NestedDashboard";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API;
axios.defaults.withCredentials = true; // ✅ REQUIRED

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [allUserPermissions, setAllUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 On page refresh → ask backend if user is logged in
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get("/user/get-profile"); // cookie auto sent
      const data = res?.data?.result;

      setUser(data?.user);
      setPermissions(data?.userPermissions);

      if (data?.userPermissions.includes("*")) {
        setAllUserPermissions([
          ...Object.values(ACTION_PERMISSIONS),
          "HRMS:EMPLOYEE:VIEW",
        ]);
      } else {
        setAllUserPermissions([
          ...data?.userPermissions,
          ...data?.user?.additionalPermissions,
        ]);
      }

      setIsSignedIn(true);
      localStorage.setItem("user", JSON.stringify(data?.user));
    } catch (err) {
      setIsSignedIn(false);
      setUser(null);
      setPermissions([]);
      setAllUserPermissions([]);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  // Called AFTER login API success
  const login = (payload) => {
    setUser(payload.user);
    setPermissions(payload.permissions);
    setIsSignedIn(true);

    if (payload.permissions.includes("*")) {
      setAllUserPermissions([
        ...Object.values(ACTION_PERMISSIONS),
        "HRMS:EMPLOYEE:VIEW",
      ]);
    } else {
      setAllUserPermissions([
        ...payload.permissions,
        ...payload.user.additionalPermissions,
      ]);
    }

    localStorage.setItem("user", JSON.stringify(payload.user));
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout"); // optional
    } catch (e) {}

    setIsSignedIn(false);
    setUser(null);
    setPermissions([]);
    setAllUserPermissions([]);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    fetchIPData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        user,
        permissions,
        login,
        logout,
        loading,
        allUserPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
