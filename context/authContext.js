'use client';

import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchIPData } from '@/helper/tracking';
import { ACTION_PERMISSIONS } from '@/constants/NestedDashboard';

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API;
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [allUserPermissions, setAllUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/user/get-profile');

      const { user, permissions } = res.data.result;

      setUser(user);
      setPermissions(permissions);
      setIsSignedIn(true);

      setAllUserPermissions(
        permissions.includes('*')
          ? [...Object.values(ACTION_PERMISSIONS), 'HRMS:EMPLOYEE:VIEW']
          : [...permissions, ...user.additionalPermissions]
      );
    } catch {
      setUser(null);
      setIsSignedIn(false);
      setPermissions([]);
      setAllUserPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const login = (payload) => {
    setUser(payload.user);
    setPermissions(payload.permissions);
    setIsSignedIn(true);

    setAllUserPermissions(
      payload.permissions.includes('*')
        ? [...Object.values(ACTION_PERMISSIONS), 'HRMS:EMPLOYEE:VIEW']
        : [...payload.permissions, ...payload.user.additionalPermissions]
    );

    localStorage.setItem('user', JSON.stringify(payload.user));
  };

  const logout = async () => {
    try {
      await axios.post('/user/logout');
    } catch {}

    localStorage.removeItem('user');

    setUser(null);
    setIsSignedIn(false);
    setPermissions([]);
    setAllUserPermissions([]);

    router.replace('/login');
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
