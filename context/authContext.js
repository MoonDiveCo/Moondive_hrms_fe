"use client";

import axios from "axios";
import Cookies from "js-cookie";
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API;
import { createContext, useState } from "react";
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]); 
  const [permissions, setPermissions] = useState([])  

  const token = Cookies.get('token');
  axios.defaults.headers.common["token"] = token;

  const login = (data) => {
    setUser(data.user);
    setRoles(data.roles);
    setPermissions(data.permissions)
    setIsSignedIn(true);
  };

  const logout = () => {
    setUser(null);
    setRoles([]);
    setPermissions([])
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        user,
        roles,
        permissions,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
