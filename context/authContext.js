"use client";

import axios from "axios";
import { createContext, useState } from "react";
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);   

  console.log(user, roles)

  const login = (data) => {
    setUser(data.user);
    setRoles(data.roles);
    setIsSignedIn(true);
  };

  const logout = () => {
    setUser(null);
    setRoles([]);
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        user,
        roles,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
