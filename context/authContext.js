"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { createContext, useEffect, useState } from "react";
import { fetchIPData } from "@/helper/tracking";
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API;
import { ACTION_PERMISSIONS } from "@/constants/NestedDashboard";
import { set } from "date-fns";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allUserPermissions, setAllUserPermissions] = useState([]);
  const [hrUsers, setHrUsers] = useState([]); // ✅ Add HR users state
  const [adminUsers, setAdminUsers] = useState([]);
  const [ceoUsers, setCeoUsers] = useState([]);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      setLoading(false);
      return;
    }

    axios.defaults.headers.common["token"] = token;
    fetchUser(token);
  }, []);

  const fetchUser = async (token) => {
  try {
    const res = await axios.get("/user/get-profile", {
      headers: { token },
    });

    const data = res?.data?.result;
    console.log("Fetched user data-------------------:", data);
   console.log("HR Users:-------------------------------------------------", data.hrUsers);
    setUser(data.user);
    setPermissions(data.userPermissions);
   

    // 🔥 FETCH ADMIN + CEO USERS
  
    const admins = allRoleUsers.filter(u =>
      u.userRole.includes("Admin")
    );

    const ceos = allRoleUsers.filter(u =>
      u.userRole.includes("SuperAdmin")
    );

    console.log("Admins:", admins);
    console.log("CEOs:", ceos);

    setAdminUsers(admins);
    setCeoUsers(ceos);

    setIsSignedIn(true);
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};


  //   const fetchUser = async (token) => {
  //   try {
  //     const res = await axios.get("/user/get-profile", {
  //       withCredentials: true,
  //       headers: { token }
  //     });

  //     const data = res?.data?.result;
  //     const userData = data?.user;
  //     const userPermissions = data?.userPermissions || [];

  //     setUser(userData);
  //     setPermissions(userPermissions);
  //     setHrUsers(data?.hrUsers || []);
  //     setIsAdmin(data?.isAdmin || []);

  //     // ✅ Role handling
  //     const resolvedRole = userData?.role || "USER";
  //     setRole(resolvedRole);

  //     const adminStatus =
  //       resolvedRole === "ADMIN" || userPermissions.includes("*");
  //     setIsAdmin(adminStatus);

  //     if (userPermissions.includes("*")) {
  //       setAllUserPermissions([
  //         ...Object.values(ACTION_PERMISSIONS),
  //         "HRMS:EMPLOYEE:VIEW",
  //       ]);
  //     } else {
  //       setAllUserPermissions([
  //         ...userPermissions,
  //         ...userData?.additionalPermissions,
  //       ]);
  //     }

  //     setIsSignedIn(true);

  //     localStorage.setItem("user", JSON.stringify(userData));
  //     localStorage.setItem("role", resolvedRole);
  //     localStorage.setItem("isAdmin", JSON.stringify(adminStatus));
  //     localStorage.setItem("hrUsers", JSON.stringify(data?.hrUsers || []));
  //   } catch (err) {
  //     Cookies.remove("token");
  //     localStorage.clear();

  //     setIsSignedIn(false);
  //     setUser(null);
  //     setPermissions([]);
  //     setHrUsers([]);
  //     setRole(null);
  //     setIsAdmin(false);

  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const login = (payload) => {
    const token = Cookies.get("token");
    axios.defaults.headers.common["token"] = token;

    setUser(payload.user);
    setPermissions(payload?.permissions);
    setHrUsers(payload?.hrUsers || []); // ✅ Store HR users on login
    setIsSignedIn(true);

    if (payload?.permissions.includes("*")) {
      setAllUserPermissions([
        ...Object.values(ACTION_PERMISSIONS),
        "HRMS:EMPLOYEE:VIEW",
      ]);
    } else {
      setAllUserPermissions([
        ...payload?.permissions,
        ...payload?.user?.additionalPermissions,
      ]);
    }

    localStorage.setItem("user", JSON.stringify(payload.user));
    localStorage.setItem("hrUsers", JSON.stringify(payload?.hrUsers || [])); // ✅ Cache HR users
  };

  const logout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    localStorage.removeItem("hrUsers"); // ✅ Clear HR users on logout
    localStorage.removeItem("adminUsers");
    localStorage.removeItem("ceoUsers");

    setIsSignedIn(false);
    setUser(null);
    setPermissions([]);
    setAllUserPermissions([]);
    setHrUsers([]); // ✅ Clear HR users state
  };

  const getSessionTrackingInfo = async () => {
    try {
      await fetchIPData();
    } catch (error) {
      console.error("Failed to initialize session tracking:", error);
    }
  };

  useEffect(() => {
    getSessionTrackingInfo();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        user,
        permissions,
        hrUsers, // ✅ Expose HR users
        adminUsers,
        ceoUsers,
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
