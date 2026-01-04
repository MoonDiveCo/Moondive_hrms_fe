"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { createContext, useEffect, useState } from "react";
import {fetchIPData} from '@/helper/tracking'
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API;
import {ACTION_PERMISSIONS} from '@/constants/NestedDashboard'

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allUserPermissions,setAllUserPermissions]=useState([])

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
      const res = await axios.get("/user/get-profile",{
        withCredentials: true,
        headers: {token}
      });
      const data = res?.data?.result
      setUser(data?.user);
      setPermissions(data?.userPermissions);
      if(data?.userPermissions.includes('*')){
        setAllUserPermissions([...Object.values(ACTION_PERMISSIONS),"HRMS:EMPLOYEE:VIEW"])
      }else{
        setAllUserPermissions([...data?.userPermissions,...data?.user?.additionalPermissions])
      }
      setIsSignedIn(true);
      localStorage.setItem("user", JSON.stringify(data?.user));
    } catch(err) {
      Cookies.remove("token");
      localStorage.removeItem("user");
      setIsSignedIn(false);
      setUser(null);
      setPermissions([]);
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  const login = (payload) => {
    const token = Cookies.get("token")
    axios.defaults.headers.common["token"] = token;
    setUser(payload.user);
    setPermissions(payload.permissions);
    setIsSignedIn(true);
    if(payload.permissions.includes["*"]){
      setAllUserPermissions([...Object.values(ACTION_PERMISSIONS),"HRMS:EMPLOYEE:VIEW"])
    }else{
      setAllUserPermissions([...payload?.permissions,...payload?.user?.additionalPermissions])
    }
    localStorage.setItem("user", JSON.stringify(payload.user));
  };


  const logout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");

    setIsSignedIn(false);
    setUser(null);
    setPermissions([]);
    setAllUserPermissions([])

  };

const getSessionTrackingInfo = async () => {
    try {
      await fetchIPData();  
    } catch (error) {
      console.error('Failed to initialize session tracking:', error);
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
        login,
        logout,
        loading,
        allUserPermissions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
