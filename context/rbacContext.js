"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext";

export const RBACContext = createContext();

const ROLE_MODULE_MAP = {
//   HRMS: ["HRMS", "CRM", "CMS"],
  HRMS: ["HRMS"],
  CMS: ["CMS"],
  CRM: ["CRM"],
};

export function RBACProvider({ children }) {
  const { roles } = useContext(AuthContext);
  const [modules, setModules] = useState([]);

  console.log(roles)

  useEffect(() => {
    const moduleSet = new Set();

    roles.forEach((role) => {
      const allowed = ROLE_MODULE_MAP[role];
      if (allowed) allowed.forEach((m) => moduleSet.add(m));
    });

    console.log(moduleSet)

    setModules(Array.from(moduleSet));
  }, [roles]);

  const canAccessModule = (module) => modules.includes(module);

  return (
    <RBACContext.Provider value={{ modules, canAccessModule }}>
      {children}
    </RBACContext.Provider>
  );
}
